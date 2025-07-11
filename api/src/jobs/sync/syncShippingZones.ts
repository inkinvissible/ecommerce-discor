// api/src/jobs/sync/syncShippingZones.ts

import { fetchErpClients } from '../../lib/erp-client';
import { erpClientsApiResponseSchema } from '../../schemas/erp.schemas';
import { prisma } from '../../lib/prisma';
import { logJobExecution, jobLogger, logError } from '../../lib/logger';

export async function syncShippingZones() {
    const jobName = 'syncShippingZones';
    const startTime = Date.now();
    logJobExecution(jobName, 'start');
    jobLogger.info('INICIANDO Sincronización de Zonas de Envío...');

    try {
        const rawDataObject = await fetchErpClients();
        const validationResult = erpClientsApiResponseSchema.safeParse(rawDataObject);

        if (!validationResult.success) {
            throw new Error('Fallo de validación Zod al obtener clientes para extraer zonas.');
        }

        const erpClients = validationResult.data.response.clientes;

        // 1. Extraer todas las zonas únicas y no vacías del ERP
        const zoneNames = new Set(
            erpClients
                .map(client => client.C2_ZONA?.trim())
                .filter((zone): zone is string => !!zone)
        );

        if (zoneNames.size === 0) {
            jobLogger.warn('No se encontraron zonas de envío en los datos del ERP. Finalizando job.');
            logJobExecution(jobName, 'success', Date.now() - startTime, undefined, { zonesFound: 0 });
            return;
        }

        jobLogger.info({ count: zoneNames.size, zones: [...zoneNames] }, 'Zonas únicas encontradas en el ERP.');

        // 2. Crear las zonas que no existan en la BD
        // `createMany` con `skipDuplicates` es la forma más eficiente de hacerlo.
        const result = await prisma.shippingZone.createMany({
            data: Array.from(zoneNames).map(name => ({
                name,
                freeShippingThreshold: 0, // Valor por defecto, se puede configurar luego desde un panel de admin
            })),
            skipDuplicates: true,
        });

        const duration = Date.now() - startTime;
        logJobExecution(jobName, 'success', duration, undefined, { newZonesCreated: result.count });
        jobLogger.info({ newZonesCreated: result.count }, 'Sincronización de Zonas de Envío FINALIZADA exitosamente.');

    } catch (error) {
        const duration = Date.now() - startTime;
        logJobExecution(jobName, 'error', duration, error as Error);
        logError(error as Error, { context: 'syncShippingZones' });
        throw error;
    }
}