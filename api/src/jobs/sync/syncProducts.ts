// api/src/jobs/sync/syncProducts.ts

import { fetchErpProducts } from '../../lib/erp-client';
import { erpProductsApiResponseSchema } from '../../schemas/erp.schemas';
import { prisma } from '../../lib/prisma';
import { logJobExecution, jobLogger, logError, dbLogger } from '../../lib/logger';
import type { Prisma, PrismaClient } from '@prisma/client';

type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

/**
 * Cache para marcas y categorías para evitar consultas repetidas
 */
interface EntityCache {
    brands: Map<string, string>;
    categories: Map<string, string>;
}

/**
 * Encuentra o crea una marca de producto o categoría con cache
 */
async function findOrCreateWithCache(
    modelName: 'productBrand' | 'category',
    name: string | undefined,
    tx: TransactionClient,
    cache: EntityCache
): Promise<string> {
    const safeName = (!name || name.trim() === '') ? 'Sin especificar' : name;
    const cacheMap = modelName === 'productBrand' ? cache.brands : cache.categories;

    // Verificar cache primero
    if (cacheMap.has(safeName)) {
        return cacheMap.get(safeName)!;
    }

    let entityId: string;

    switch (modelName) {
        case 'productBrand': {
            const existing = await tx.productBrand.findFirst({
                where: { name: { path: ['es'], equals: safeName } }
            });
            if (existing) {
                entityId = existing.id;
            } else {
                const created = await tx.productBrand.create({
                    data: { name: { es: safeName } }
                });
                entityId = created.id;
                dbLogger.debug({ brandName: safeName }, 'Nueva marca creada');
            }
            break;
        }
        case 'category': {
            const existing = await tx.category.findFirst({
                where: { name: { path: ['es'], equals: safeName } }
            });
            if (existing) {
                entityId = existing.id;
            } else {
                const created = await tx.category.create({
                    data: { name: { es: safeName } }
                });
                entityId = created.id;
                dbLogger.debug({ categoryName: safeName }, 'Nueva categoría creada');
            }
            break;
        }
        default:
            throw new Error(`Modelo no soportado: ${modelName}`);
    }

    // Agregar al cache
    cacheMap.set(safeName, entityId);
    return entityId;
}

/**
 * Procesa un lote de productos
 */
async function processBatch(
    products: any[],
    batchIndex: number,
    totalBatches: number,
    cache: EntityCache
): Promise<{ succeeded: number; failed: number; errors: any[] }> {
    let succeeded = 0;
    let failed = 0;
    const errors: any[] = [];

    jobLogger.info({
        batch: batchIndex + 1,
        totalBatches,
        batchSize: products.length
    }, 'Procesando lote de productos');

    const operations: Prisma.PrismaPromise<any>[] = [];

    try {
        await prisma.$transaction(async (tx: TransactionClient) => {
            for (const erpProduct of products) {
                try {
                    // Validar datos esenciales
                    if (!erpProduct.c1_codi || erpProduct.c1_codi.trim() === '') {
                        failed++;
                        errors.push({
                            error: 'Código de producto vacío',
                            product: erpProduct
                        });
                        continue;
                    }

                    // Obtener IDs de marca y categoría (con cache)
                    const brandId = await findOrCreateWithCache('productBrand', erpProduct.descmarc, tx, cache);
                    const categoryId = await findOrCreateWithCache('category', erpProduct.c1_desg, tx, cache);

                    // Generar descripción
                    const brandName = erpProduct.descmarc || 'Sin especificar';
                    const categoryName = erpProduct.c1_desg || 'Sin especificar';
                    const generatedDescription = `Artículo: ${erpProduct.c1_desc}. Marca: ${brandName}. Categoría: ${categoryName}. Código de referencia: ${erpProduct.c1_codi}.`;

                    // Crear/Actualizar Producto (SIN STOCK)
                    await tx.product.upsert({
                        where: { erpCode: erpProduct.c1_codi },
                        update: {
                            name: { es: erpProduct.c1_desc },
                            sku: erpProduct.c1_codi,
                            productBrandId: brandId,
                            description: { es: generatedDescription },
                            categoryId: categoryId,
                            deletedAt: erpProduct.exportableweb ? null : new Date(),
                        },
                        create: {
                            erpCode: erpProduct.c1_codi,
                            sku: erpProduct.c1_codi,
                            name: { es: erpProduct.c1_desc },
                            description: { es: generatedDescription },
                            productBrandId: brandId,
                            categoryId: categoryId,
                            deletedAt: erpProduct.exportableweb ? null : new Date(),
                        },
                    });

                    // Crear/Actualizar Precios (solo si hay precios válidos)
                    const prices = [
                        { id: 1, value: erpProduct.c1_pre1 },
                        { id: 2, value: erpProduct.c1_pre2 },
                        { id: 3, value: erpProduct.c1_pre3 },
                    ];

                    for (const price of prices) {
                        if (price.value && price.value > 0) {
                            // Obtener el producto para su ID
                            const product = await tx.product.findUnique({
                                where: { erpCode: erpProduct.c1_codi },
                                select: { id: true }
                            });

                            if (product) {
                                await tx.price.upsert({
                                    where: {
                                        productId_priceListId_currency: {
                                            productId: product.id,
                                            priceListId: price.id,
                                            currency: 'ARS'
                                        }
                                    },
                                    update: { price: price.value },
                                    create: {
                                        productId: product.id,
                                        priceListId: price.id,
                                        price: price.value,
                                        currency: 'ARS'
                                    },
                                });
                            }
                        }
                    }

                    succeeded++;

                } catch (error) {
                    failed++;
                    errors.push({
                        error: (error as Error).message,
                        erpCode: erpProduct.c1_codi,
                        productName: erpProduct.c1_desc
                    });

                    logError(error as Error, {
                        context: 'syncProducts - Product processing in batch',
                        erpCode: erpProduct.c1_codi,
                        productName: erpProduct.c1_desc,
                        batch: batchIndex + 1
                    });
                }
            }
        });

        dbLogger.info({
            batch: batchIndex + 1,
            succeeded,
            failed,
            duration: `${Date.now()}ms`
        }, 'Lote procesado exitosamente');

    } catch (error) {
        // Si falla toda la transacción, marcar todos como fallidos
        failed = products.length;
        succeeded = 0;
        errors.push({
            error: 'Transaction failed',
            message: (error as Error).message,
            batch: batchIndex + 1
        });

        logError(error as Error, {
            context: 'syncProducts - Batch transaction failed',
            batch: batchIndex + 1,
            batchSize: products.length
        });
    }

    return { succeeded, failed, errors };
}

export async function syncProducts() {
    const jobName = 'syncProducts';
    const startTime = Date.now();

    logJobExecution(jobName, 'start');
    jobLogger.info('INICIANDO Sincronización de Productos...');

    let totalSucceeded = 0;
    let totalFailed = 0;
    let totalBrandCreated = 0;
    let totalCategoryCreated = 0;
    const allErrors: any[] = [];

    try {
        // 1. Obtener datos del ERP
        jobLogger.info('Obteniendo productos del ERP...');
        const rawDataObject = await fetchErpProducts();

        // 2. Validar con Zod
        jobLogger.info('Validando datos con schema Zod...');
        const validationResult = erpProductsApiResponseSchema.safeParse(rawDataObject);

        if (!validationResult.success) {
            const error = new Error('Fallo de validación Zod en productos.');
            logError(error, {
                context: 'syncProducts - Zod validation',
                zodErrors: validationResult.error.flatten()
            });
            throw error;
        }

        const erpProducts = validationResult.data.response.articulos;
        jobLogger.info({
            totalProducts: erpProducts.length
        }, 'Productos validados exitosamente. Iniciando procesamiento en lotes...');

        // 3. Configurar cache y procesamiento en lotes
        const cache: EntityCache = {
            brands: new Map(),
            categories: new Map()
        };

        const BATCH_SIZE = 100; // Lotes más pequeños para mejor manejo de memoria
        const batches: any[][] = [];

        for (let i = 0; i < erpProducts.length; i += BATCH_SIZE) {
            batches.push(erpProducts.slice(i, i + BATCH_SIZE));
        }

        jobLogger.info({
            totalBatches: batches.length,
            batchSize: BATCH_SIZE
        }, 'Procesando productos en lotes');

        // 4. Procesar lotes
        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            const batchResult = await processBatch(batch, i, batches.length, cache);

            totalSucceeded += batchResult.succeeded;
            totalFailed += batchResult.failed;
            allErrors.push(...batchResult.errors);

            // Log de progreso
            const progress = ((i + 1) / batches.length * 100).toFixed(1);
            jobLogger.info({
                batch: i + 1,
                totalBatches: batches.length,
                progress: `${progress}%`,
                batchSucceeded: batchResult.succeeded,
                batchFailed: batchResult.failed,
                totalSucceeded,
                totalFailed
            }, 'Progreso del procesamiento');
        }

        // 5. Métricas finales
        totalBrandCreated = cache.brands.size;
        totalCategoryCreated = cache.categories.size;

        const duration = Date.now() - startTime;
        const metadata = {
            totalProducts: erpProducts.length,
            succeededCount: totalSucceeded,
            failedCount: totalFailed,
            brandCreatedCount: totalBrandCreated,
            categoryCreatedCount: totalCategoryCreated,
            successRate: `${((totalSucceeded / erpProducts.length) * 100).toFixed(2)}%`,
            totalBatches: batches.length,
            batchSize: BATCH_SIZE
        };

        if (allErrors.length > 0) {
            jobLogger.warn({
                ...metadata,
                errorSample: allErrors.slice(0, 5) // Solo mostrar primeros 5 errores
            }, 'Sincronización de Productos completada con errores');
        }

        logJobExecution(jobName, 'success', duration, undefined, metadata);
        jobLogger.info(metadata, 'Sincronización de Productos FINALIZADA exitosamente');

    } catch (error) {
        const duration = Date.now() - startTime;
        logJobExecution(jobName, 'error', duration, error as Error, {
            totalSucceeded,
            totalFailed,
            totalProcessed: totalSucceeded + totalFailed
        });

        logError(error as Error, { context: 'syncProducts - Catastrophic failure' });
        throw error;
    }
}