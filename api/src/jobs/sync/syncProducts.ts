// api/src/jobs/sync/syncProducts.ts

import {fetchErpProducts} from '../../lib/erp-client';
import {erpProductsApiResponseSchema} from '../../schemas/erp.schemas'; // Tu schema Zod
import {prisma} from '../../lib/prisma';
import {logJobExecution, jobLogger, logError, dbLogger} from '../../lib/logger';
import type {Prisma, PrismaClient} from '@prisma/client';

// Definimos el tipo exacto para el cliente de transacción
type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

/**
 * Encuentra o crea una marca de producto o categoría.
 * @param modelName - Nombre del modelo ('productBrand' o 'category').
 * @param name - Nombre a buscar o crear.
 * @param tx - Cliente de transacción de Prisma.
 * @returns ID del modelo encontrado o creado.
 */
async function findOrCreate(
    modelName: 'productBrand' | 'category',
    name: string | undefined,
    tx: TransactionClient
): Promise<string> {
    const safeName = (!name || name.trim() === '') ? 'Sin especificar' : name;

    // Usamos un switch para que TypeScript sepa exactamente qué modelo estamos usando en cada bloque
    switch (modelName) {
        case 'productBrand': {
            const existing = await tx.productBrand.findFirst({ where: { name: { path: ['es'], equals: safeName } } });
            if (existing) return existing.id;
            const created = await tx.productBrand.create({ data: { name: { es: safeName } } });
            return created.id;
        }
        case 'category': {
            const existing = await tx.category.findFirst({ where: { name: { path: ['es'], equals: safeName } } });
            if (existing) return existing.id;
            const created = await tx.category.create({ data: { name: { es: safeName } } });
            return created.id;
        }
        default:
            // Esto nunca debería ocurrir con los tipos actuales, pero es una buena práctica
            throw new Error(`Modelo no soportado en findOrCreate: ${modelName}`);
    }
}

export async function syncProducts() {
    const jobName = 'syncProducts';
    const startTime = Date.now();

    logJobExecution(jobName, 'start');
    jobLogger.info('INICIANDO Sincronización de Productos...');

    let succeededCount = 0, failedCount = 0, brandCreatedCount = 0, categoryCreatedCount = 0;
    const WAREHOUSE_ID = 'default-warehouse';
    const WAREHOUSE_NAME = 'Almacén Principal - Barcalá 665';
    try {
        // Aseguramos que el almacén exista
        jobLogger.info({ warehouseId: WAREHOUSE_ID, warehouseName: WAREHOUSE_NAME }, 'Verificando y asegurando la existencia del almacén por defecto...');
        await prisma.warehouse.upsert({
            where: { id: WAREHOUSE_ID },
            update: { name: WAREHOUSE_NAME }, // Actualiza el nombre por si cambia
            create: {
                id: WAREHOUSE_ID,
                name: WAREHOUSE_NAME,
            },
        });
        jobLogger.info('Almacén por defecto asegurado en la base de datos.');

        // 1. Obtener datos
        jobLogger.info('Obteniendo productos del ERP...');
        const rawDataObject = await fetchErpProducts();

        console.log('ESTRUCTURA REAL DE LA API:', JSON.stringify(rawDataObject, null, 2));
        jobLogger.info('Estructura de datos obtenida del ERP:', JSON.stringify(rawDataObject, null, 2));

        // 2. Validar con Zod (¡directamente!)
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
            totalProducts: erpProducts.length,
            warehouseId: WAREHOUSE_ID
        }, 'Productos validados exitosamente. Iniciando procesamiento...');

        // 3. Iterar y guardar en la Base de Datos
        for (let index = 0; index < erpProducts.length; index++) {
            const erpProduct = erpProducts[index];
            const productStart = Date.now();

            try {
                await prisma.$transaction(async (tx: TransactionClient) => {
                    // Obtener IDs de Marca y Categoría
                    const brandStart = Date.now();
                    const brandName = erpProduct.descmarc || 'Sin especificar';
                    const brandId = await findOrCreate('productBrand', erpProduct.descmarc, tx);
                    const brandDuration = Date.now() - brandStart;

                    const categoryStart = Date.now();
                    const categoryId = await findOrCreate('category', erpProduct.c1_desg, tx);
                    const categoryDuration = Date.now() - categoryStart;
                    const categoryName = erpProduct.c1_desg || 'Sin especificar';

                    const generatedDescription = `Artículo: ${erpProduct.c1_desc}. Marca: ${brandName}. Categoría: ${categoryName}. Código de referencia: ${erpProduct.c1_codi}.`;
                    // Log si se crearon nuevas marcas o categorías
                    if (brandDuration > 50) { // Si tardó más de 50ms, probablemente se creó
                        brandCreatedCount++;
                        dbLogger.debug({
                            brandName: erpProduct.descmarc || 'Sin especificar',
                            duration: `${brandDuration}ms`
                        }, 'Brand processed');
                    }

                    if (categoryDuration > 50) {
                        categoryCreatedCount++;
                        dbLogger.debug({
                            categoryName: erpProduct.c1_desg || 'Sin especificar',
                            duration: `${categoryDuration}ms`
                        }, 'Category processed');
                    }

                    // Crear/Actualizar Producto
                    const product = await tx.product.upsert({
                        where: {erpCode: erpProduct.c1_codi},
                        update: {
                            name: {es: erpProduct.c1_desc},
                            sku: erpProduct.c1_codi,
                            productBrandId: brandId,
                            description: { es: generatedDescription },
                            categoryId: categoryId,
                            deletedAt: erpProduct.exportableweb ? null : new Date(),
                        },
                        create: {
                            erpCode: erpProduct.c1_codi,
                            sku: erpProduct.c1_codi,
                            name: {es: erpProduct.c1_desc},
                            description: { es: generatedDescription },
                            productBrandId: brandId,
                            categoryId: categoryId,
                            deletedAt: erpProduct.exportableweb ? null : new Date(),
                        },
                    });

                    // Crear/Actualizar Stock
                    await tx.stockLevel.upsert({
                        where: {productId_warehouseId: {productId: product.id, warehouseId: WAREHOUSE_ID}},
                        update: {quantity: erpProduct.c1_stoc},
                        create: {productId: product.id, warehouseId: WAREHOUSE_ID, quantity: erpProduct.c1_stoc},
                    });

                    // Crear/Actualizar Precios
                    const prices = [
                        {id: 1, value: erpProduct.c1_pre1},
                        {id: 2, value: erpProduct.c1_pre2},
                        {id: 3, value: erpProduct.c1_pre3},
                    ];

                    let pricesUpdated = 0;
                    for (const p of prices) {
                        if (p.value > 0) {
                            await tx.price.upsert({
                                where: {
                                    productId_priceListId_currency: {
                                        productId: product.id,
                                        priceListId: p.id,
                                        currency: 'ARS'
                                    }
                                },
                                update: {price: p.value},
                                create: {productId: product.id, priceListId: p.id, price: p.value},
                            });
                            pricesUpdated++;
                        }
                    }

                    // Log detallado del producto procesado (solo en debug)
                    const productDuration = Date.now() - productStart;
                    dbLogger.debug({
                        erpCode: erpProduct.c1_codi,
                        productName: erpProduct.c1_desc,
                        stock: erpProduct.c1_stoc,
                        pricesUpdated,
                        exportableWeb: erpProduct.exportableweb,
                        duration: `${productDuration}ms`
                    }, 'Product processed successfully');
                });

                succeededCount++;

                // Log de progreso cada 100 productos
                if ((index + 1) % 100 === 0) {
                    jobLogger.info({
                        processed: index + 1,
                        total: erpProducts.length,
                        succeeded: succeededCount,
                        failed: failedCount,
                        progress: `${((index + 1) / erpProducts.length * 100).toFixed(1)}%`
                    }, 'Processing progress');
                }

            } catch (error) {
                failedCount++;
                logError(error as Error, {
                    context: 'syncProducts - Product processing',
                    erpCode: erpProduct.c1_codi,
                    productName: erpProduct.c1_desc,
                    productIndex: index
                });
            }
        }

        const duration = Date.now() - startTime;
        const metadata = {
            totalProducts: erpProducts.length,
            succeededCount,
            failedCount,
            brandCreatedCount,
            categoryCreatedCount,
            successRate: `${((succeededCount / erpProducts.length) * 100).toFixed(2)}%`,
            warehouseId: WAREHOUSE_ID
        };

        logJobExecution(jobName, 'success', duration, undefined, metadata);
        jobLogger.info(metadata, 'Sincronización de Productos FINALIZADA exitosamente');

    } catch (error) {
        const duration = Date.now() - startTime;
        logJobExecution(jobName, 'error', duration, error as Error, {
            succeededCount,
            failedCount,
            totalProcessed: succeededCount + failedCount
        });

        logError(error as Error, {context: 'syncProducts - Catastrophic failure'});
        throw error;
    }
}

// Función para ejecutar el sync manualmente o desde un scheduler
export const runProductSync = async () => {
    try {
        await syncProducts();
    } catch (error) {
        logError(error as Error, {context: 'Product sync job execution'});
    }
};
