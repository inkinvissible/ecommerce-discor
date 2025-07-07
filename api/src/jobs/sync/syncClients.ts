// api/src/jobs/sync/syncClients.ts

import { fetchErpClients } from '../../lib/erp-client'; // Asumimos que esta función existe
import { erpClientsApiResponseSchema, type ErpClient } from '../../schemas/erp.schemas';
import { prisma } from '../../lib/prisma';
import { logJobExecution, jobLogger, logError, dbLogger } from '../../lib/logger';
import type { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Definimos el tipo exacto para el cliente de transacción
type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

/**
 * Busca el ID de una ShippingZone por su nombre.
 * @param zoneName - Nombre de la zona a buscar (ej: "Capital Federal").
 * @param tx - Cliente de transacción de Prisma.
 * @returns El ID de la zona si se encuentra, de lo contrario null.
 */
async function findShippingZoneIdByName(zoneName: string | undefined, tx: TransactionClient): Promise<string | null> {
    if (!zoneName || zoneName.trim() === '') {
        return null;
    }
    const zone = await tx.shippingZone.findUnique({
        where: { name: zoneName },
        select: { id: true }
    });
    return zone?.id ?? null;
}

export async function syncClients() {
    const jobName = 'syncClients';
    const startTime = Date.now();
    const BCRYPT_SALT_ROUNDS = 10;

    logJobExecution(jobName, 'start');
    jobLogger.info('INICIANDO Sincronización de Clientes...');

    let succeededCount = 0, failedCount = 0, usersCreatedCount = 0, clientsDeactivated = 0;

    try {
        // 1. Obtener datos
        jobLogger.info('Obteniendo clientes del ERP...');
        const rawDataObject = await fetchErpClients();

        // 2. Validar con Zod
        jobLogger.info('Validando datos con schema Zod...');
        const validationResult = erpClientsApiResponseSchema.safeParse(rawDataObject);

        if (!validationResult.success) {
            const error = new Error('Fallo de validación Zod en clientes.');
            logError(error, {
                context: 'syncClients - Zod validation',
                zodErrors: validationResult.error.flatten()
            });
            throw error;
        }

        const erpClients = validationResult.data.response.clientes;
        jobLogger.info({ totalClients: erpClients.length }, 'Clientes validados exitosamente. Iniciando procesamiento...');

        // 3. Iterar y guardar en la Base de Datos
        for (let index = 0; index < erpClients.length; index++) {
            const erpClient = erpClients[index];

            try {
                await prisma.$transaction(async (tx: TransactionClient) => {
                    const clientStart = Date.now();

                    // A. Buscar ID de la zona de envío
                    const shippingZoneId = await findShippingZoneIdByName(erpClient.C2_ZONA, tx);

                    // B. Crear/Actualizar Cliente
                    const client = await tx.client.upsert({
                        where: { erpCode: erpClient.C2_CODI },
                        update: {
                            businessName: erpClient.C2_DESC,
                            cuit: erpClient.C2_CUIT || '', // Si es undefined, ponemos string vacío
                            priceListId: erpClient.C2_TIPP,
                            shippingZoneId: shippingZoneId,
                            deletedAt: erpClient.INACTIVO ? new Date() : null,
                        },
                        create: {
                            erpCode: erpClient.C2_CODI,
                            businessName: erpClient.C2_DESC,
                            cuit: erpClient.C2_CUIT || '',
                            priceListId: erpClient.C2_TIPP,
                            shippingZoneId: shippingZoneId,
                            deletedAt: erpClient.INACTIVO ? new Date() : null,
                        }
                    });

                    if (erpClient.INACTIVO) clientsDeactivated++;

                    // C. Crear/Actualizar Usuario por defecto
                    const cuit = erpClient.C2_CUIT;
                    if (cuit && cuit.length === 11) {
                        const username = cuit.slice(-5);
                        const password = cuit.slice(-5);
                        const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

                        const existingUser = await tx.user.findUnique({ where: { username } });

                        if (!existingUser) {
                            await tx.user.create({
                                data: {
                                    clientId: client.id,
                                    username: username,
                                    passwordHash: passwordHash,
                                    email: erpClient.C2_EMAI || `${username}@placeholder.com`, // Email de fallback
                                }
                            });
                            usersCreatedCount++;
                        } else {
                            // Opcional: podrías decidir actualizar la contraseña si cambia la lógica
                            // o asociarlo si el usuario existe pero no tiene cliente.
                            // Por ahora, si existe, no hacemos nada para evitar problemas.
                        }
                    }

                    // D. Crear/Actualizar Dirección por defecto
                    // Buscamos si ya tiene una dirección por defecto para actualizarla
                    const defaultAddress = await tx.address.findFirst({
                        where: { clientId: client.id, isDefaultShipping: true }
                    });

                    const addressData = {
                        clientId: client.id,
                        alias: 'Principal (ERP)',
                        street: erpClient.C2_DIRE || 'Sin especificar',
                        city: erpClient.C2_LOCA || 'Sin especificar',
                        zipCode: erpClient.C2_CODP || 'S/D',
                        isDefaultShipping: true,
                    };

                    if (defaultAddress) {
                        await tx.address.update({
                            where: { id: defaultAddress.id },
                            data: addressData
                        });
                    } else {
                        await tx.address.create({ data: addressData });
                    }

                    const clientDuration = Date.now() - clientStart;
                    dbLogger.debug({
                        erpCode: client.erpCode,
                        businessName: client.businessName,
                        duration: `${clientDuration}ms`
                    }, 'Client processed successfully');
                });

                succeededCount++;

                // Log de progreso cada 50 clientes
                if ((index + 1) % 50 === 0) {
                    jobLogger.info({
                        processed: index + 1,
                        total: erpClients.length,
                        succeeded: succeededCount,
                        failed: failedCount,
                        progress: `${((index + 1) / erpClients.length * 100).toFixed(1)}%`
                    }, 'Processing progress');
                }

            } catch (error) {
                failedCount++;
                logError(error as Error, {
                    context: 'syncClients - Client processing',
                    erpCode: erpClient.C2_CODI,
                    businessName: erpClient.C2_DESC,
                    clientIndex: index
                });
            }
        }

        const duration = Date.now() - startTime;
        const metadata = {
            totalClients: erpClients.length,
            succeededCount,
            failedCount,
            usersCreatedCount,
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

// Función para ejecutar el sync manualmente o desde el scheduler
export const runClientSync = async () => {
    try {
        await syncClients();
    } catch (error) {
        logError(error as Error, { context: 'Client sync job execution' });
    }
};