// api/src/jobs/sync/syncStock.ts

import { fetchErpStock } from '../../lib/erp-client';
import { erpStockApiResponseSchema } from '../../schemas/erp.schemas';
import { prisma } from '../../lib/prisma';
import { logJobExecution, jobLogger, logError, dbLogger } from '../../lib/logger';
import type { Prisma } from '@prisma/client';

export async function syncStock() {
    const jobName = 'syncStock';
    const startTime = Date.now();

    logJobExecution(jobName, 'start');
    jobLogger.info('INICIANDO Sincronización de Stock...');

    let updatedCount = 0;
    let skippedCount = 0;
    const WAREHOUSE_ID = 'default-warehouse';
    const WAREHOUSE_NAME = 'Almacén Principal - Barcalá 665';

    // Almacenamos los códigos de Artículos omitidos
    const skippedItems: { erpCode: string; stock: number }[] = [];

    try {
        // 1. Asegurar que el almacén por defecto exista
        jobLogger.info({ warehouseId: WAREHOUSE_ID, warehouseName: WAREHOUSE_NAME }, 'Verificando y asegurando la existencia del almacén por defecto...');
        const warehouse = await prisma.warehouse.upsert({
            where: { id: WAREHOUSE_ID },
            update: { name: WAREHOUSE_NAME },
            create: { id: WAREHOUSE_ID, name: WAREHOUSE_NAME },
        });
        jobLogger.info('Almacén por defecto asegurado en la base de datos.');

        // 2. Obtener datos de stock del ERP
        jobLogger.info('Obteniendo datos de stock del ERP...');
        const rawDataObject = await fetchErpStock();
        jobLogger.info(`Obtenidos ${rawDataObject?.response?.articulos?.length || 0} registros de stock.`);

        // 3. Validar con Zod
        jobLogger.info('Validando datos con schema Zod...');
        const validationResult = erpStockApiResponseSchema.safeParse(rawDataObject);

        if (!validationResult.success) {
            const error = new Error('Fallo de validación Zod en el stock.');
            logError(error, {
                context: 'syncStock - Zod validation',
                zodErrors: validationResult.error.flatten()
            });
            throw error;
        }

        const erpStockItems = validationResult.data.Stock_response.articulos;
        jobLogger.info({ totalItems: erpStockItems.length }, 'Datos de stock validados exitosamente.');

        // 4. Pre-cargar IDs de productos (mejorado con manejo de errores)
        jobLogger.info('Pre-cargando productos existentes desde la base de datos...');
        const allErpCodes = erpStockItems
            .map(item => item.CODIGOARTICULO)
            .filter(code => code && code.trim() !== ''); // Filtrar códigos vacíos o nulos

        if (allErpCodes.length === 0) {
            jobLogger.warn('No se encontraron códigos ERP válidos en los datos de stock.');
            return;
        }

        const productsInDb = await prisma.product.findMany({
            where: {
                erpCode: {
                    in: allErpCodes,
                    not: null // Asegurar que no sea null
                }
            },
            select: { id: true, erpCode: true }
        });

        // Crear un Map para búsqueda O(1)
        const productMap = new Map<string, string>();
        for (const product of productsInDb) {
            if (product.erpCode) {
                productMap.set(product.erpCode, product.id);
            }
        }
        jobLogger.info({ foundProducts: productMap.size }, 'Productos existentes mapeados en memoria.');

        // 5. Preparar operaciones de base de datos en lotes
        jobLogger.info('Generando operaciones de actualización de stock...');
        const BATCH_SIZE = 1000; // Procesar en lotes para evitar problemas de memoria
        const batches: Prisma.PrismaPromise<any>[][] = [];
        let currentBatch: Prisma.PrismaPromise<any>[] = [];

        for (const item of erpStockItems) {
            // Validar que el código del artículo exista y no esté vacío
            if (!item.CODIGOARTICULO || item.CODIGOARTICULO.trim() === '') {
                skippedCount++;
                jobLogger.warn({ item }, 'Stock omitido: Código de artículo vacío o nulo.');
                continue;
            }

            const productId = productMap.get(item.CODIGOARTICULO);

            if (productId) {
                // Validar que el stock sea un número válido
                const stockQuantity = typeof item.STOCK === 'number' ? item.STOCK : 0;

                currentBatch.push(
                    prisma.stockLevel.upsert({
                        where: {
                            productId_warehouseId: {
                                productId,
                                warehouseId: warehouse.id
                            }
                        },
                        update: { quantity: stockQuantity },
                        create: {
                            productId,
                            warehouseId: warehouse.id,
                            quantity: stockQuantity
                        },
                    })
                );
                updatedCount++;

                // Si el lote está lleno, agregarlo a la lista de lotes
                if (currentBatch.length >= BATCH_SIZE) {
                    batches.push(currentBatch);
                    currentBatch = [];
                }
            } else {
                skippedCount++;

                skippedItems.push({
                    erpCode: item.CODIGOARTICULO,
                    stock: typeof item.STOCK === 'number' ? item.STOCK : 0
                });

                jobLogger.warn({
                    erpCode: item.CODIGOARTICULO
                }, 'Stock omitido: Producto no encontrado en la base de datos local. Artículo: ', item.CODIGOARTICULO);
            }
        }

        // Agregar el último lote si tiene elementos
        if (currentBatch.length > 0) {
            batches.push(currentBatch);
        }

        // 6. Ejecutar operaciones en lotes
        jobLogger.info({
            totalBatches: batches.length,
            totalOperations: batches.reduce((sum, batch) => sum + batch.length, 0)
        }, 'Ejecutando transacciones de stock por lotes...');

        const transactionStart = Date.now();

        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            jobLogger.info({
                batch: i + 1,
                totalBatches: batches.length,
                operations: batch.length
            }, 'Ejecutando lote de operaciones...');

            await prisma.$transaction(batch);
        }

        const transactionDuration = Date.now() - transactionStart;
        dbLogger.info({
            duration: `${transactionDuration}ms`,
            totalOperations: updatedCount,
            batches: batches.length
        }, 'Transacciones de stock completadas.');

        const duration = Date.now() - startTime;
        const metadata = {
            totalItems: erpStockItems.length,
            updatedCount,
            skippedCount,
            warehouseId: warehouse.id,
            processingDuration: `${duration}ms`,
            dbDuration: `${transactionDuration}ms`
        };

        if (skippedItems.length > 0) {
            jobLogger.warn({
                skippedItemsCount: skippedItems.length,
                sampleSkippedItems: skippedItems.slice(0, 20), // Mostrar solo 20 como muestra
                totalSkipped: skippedItems.length
            }, 'Artículos omitidos durante la sincronización de stock');
        }

        logJobExecution(jobName, 'success', duration, undefined, {
            ...metadata,
            skippedItemsCount: skippedItems.length  // Nuevo: incluir conteo en metadata
        });

        jobLogger.info(metadata, 'Sincronización de Stock FINALIZADA exitosamente');

    } catch (error) {
        const duration = Date.now() - startTime;
        if (skippedItems.length > 0) {
            jobLogger.warn({
                skippedItemsCount: skippedItems.length,
                sampleSkippedItems: skippedItems.slice(0, 20),
                totalSkipped: skippedItems.length
            }, 'Artículos omitidos durante la sincronización de stock');
        }
        logJobExecution(jobName, 'error', duration, error as Error);
        logError(error as Error, { context: 'syncStock - Catastrophic failure' });
        throw error;
    }
}