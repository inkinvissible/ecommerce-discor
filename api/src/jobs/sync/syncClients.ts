// api/src/jobs/sync/syncClients.ts (Versión final - Prioriza Usabilidad)

import { fetchErpClients } from '../../lib/erp-client';
import { erpClientsApiResponseSchema } from '../../schemas/erp.schemas';
import { prisma } from '../../lib/prisma';
import { logJobExecution, jobLogger, logError, dbLogger } from '../../lib/logger';
import type { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

async function findShippingZoneIdByName(zoneName: string | undefined, tx: TransactionClient): Promise<string | null> {
    if (!zoneName || zoneName.trim() === '') return null;
    const zone = await tx.shippingZone.findUnique({ where: { name: zoneName }, select: { id: true } });
    return zone?.id ?? null;
}

export async function syncClients() {
    const jobName = 'syncClients';
    const startTime = Date.now();
    const BCRYPT_SALT_ROUNDS = 10;

    logJobExecution(jobName, 'start');
    jobLogger.info('INICIANDO Sincronización de Clientes (Modo Usabilidad Prioritaria)...');

    let succeededCount = 0, failedCount = 0, usersCreatedCount = 0, usersUpdatedCount = 0, clientsDeactivated = 0;

    try {
        const rawDataObject = await fetchErpClients();
        const validationResult = erpClientsApiResponseSchema.safeParse(rawDataObject);

        if (!validationResult.success) {
            const error = new Error('Fallo de validación Zod en clientes.');
            logError(error, { context: 'syncClients - Zod validation', zodErrors: validationResult.error.flatten() });
            throw error;
        }

        const erpClients = validationResult.data.response.clientes;
        jobLogger.info({ totalClients: erpClients.length }, 'Clientes validados exitosamente. Iniciando procesamiento...');

        for (const erpClient of erpClients) {
            try {
                await prisma.$transaction(async (tx: TransactionClient) => {
                    // 1. Crear/Actualizar Cliente (sin cambios aquí)
                    const shippingZoneId = await findShippingZoneIdByName(erpClient.C2_ZONA, tx);
                    const client = await tx.client.upsert({
                        where: { erpCode: erpClient.C2_CODI },
                        update: {
                            businessName: erpClient.C2_DESC,
                            cuit: erpClient.C2_CUIT || '',
                            discountPercentage: erpClient.C2_DTOE || 0,
                            priceListId: erpClient.C2_TIPP,
                            shippingZoneId: shippingZoneId,
                            deletedAt: erpClient.INACTIVO ? new Date() : null,
                        },
                        create: {
                            erpCode: erpClient.C2_CODI,
                            businessName: erpClient.C2_DESC,
                            cuit: erpClient.C2_CUIT || '',
                            discountPercentage: erpClient.C2_DTOE || 0,
                            priceListId: erpClient.C2_TIPP,
                            shippingZoneId: shippingZoneId,
                            deletedAt: erpClient.INACTIVO ? new Date() : null,
                        }
                    });

                    if (erpClient.INACTIVO) clientsDeactivated++;

                    // 2. Lógica de Usuario/Contraseña Simplificada
                    const username = client.erpCode;
                    const cuit = erpClient.C2_CUIT;
                    const password = (cuit && cuit.length >= 4) ? cuit.slice(-4) : '0000';
                    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);



                    // 3. Crear O Actualizar Usuario
                    const existingUser = await tx.user.findUnique({
                        where: { username: username }
                    });

                    if (existingUser) {
                        // El usuario ya existe, comparar si la contraseña necesita actualizarse
                        const isPasswordMatch = await bcrypt.compare(password, existingUser.passwordHash);

                        if (!isPasswordMatch) {
                            // La contraseña generada es diferente a la almacenada, ¡actualizar!
                            await tx.user.update({
                                where: { id: existingUser.id },
                                data: { passwordHash: passwordHash }
                            });
                            usersUpdatedCount++;
                            dbLogger.info({ username }, "Contraseña del usuario actualizada para coincidir con el CUIT del ERP.");
                        }
                    } else {
                        // El usuario no existe, crearlo.
                        await tx.user.create({
                            data: {
                                clientId: client.id,
                                username: username,
                                passwordHash: passwordHash,
                                email: erpClient.C2_EMAI || `${username}@placeholder.com`,
                                // No hay campo 'mustChangePassword'
                            }
                        });
                        usersCreatedCount++;
                        dbLogger.info({ username }, "Nuevo usuario creado.");
                    }
                });
                succeededCount++;
            } catch (error) {
                failedCount++;
                logError(error as Error, {
                    context: 'syncClients - Client processing',
                    erpCode: erpClient.C2_CODI,
                });
            }
        }

        const duration = Date.now() - startTime;
        const metadata = {
            totalClients: erpClients.length,
            succeededCount,
            failedCount,
            usersCreatedCount,
            usersUpdatedCount, // Nuevo dato para el log
            clientsDeactivated,
            successRate: erpClients.length > 0 ? `${((succeededCount / erpClients.length) * 100).toFixed(2)}%` : '100%',
        };

        logJobExecution(jobName, 'success', duration, undefined, metadata);
        jobLogger.info(metadata, 'Sincronización de Clientes FINALIZADA exitosamente');

    } catch (error) {
        const duration = Date.now() - startTime;
        logJobExecution(jobName, 'error', duration, error as Error, {
            succeededCount,
            failedCount,
            totalProcessed: succeededCount + failedCount
        });

        logError(error as Error, {context: 'syncClients - Catastrophic failure'});
        throw error;
    }
}

export const runClientSync = async () => {
    try {
        await syncClients();
    } catch (error) {
        // El error ya fue logueado dentro de syncClients y el orquestador,
        // pero podemos añadir un log final aquí si se ejecuta de forma aislada.
        logError(error as Error, { context: 'Client sync job execution wrapper' });
        // Es importante no ocultar el error para que el llamador sepa que falló.
        throw error;
    }
};