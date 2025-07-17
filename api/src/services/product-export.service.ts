// src/services/product-export.service.ts
import { PrismaClient } from '@prisma/client';
import { ProductServiceError, toNumber } from '../types/products';
import type { MultiLanguageContent } from '../types/products';

const prisma = new PrismaClient();

export interface ProductExportData {
    sku: string | null;
    name: string;
    description: string | null;
    brand: string;
    category: string;
    listPrice: number;
    clientPrice: number;
    discountPercentage: number;
    isActive: boolean;
}

export async function getProductsForExport(clientId: string): Promise<ProductExportData[]> {
    try {
        // Obtener configuración del cliente
        const client = await prisma.client.findUnique({
            where: {
                id: clientId,
                deletedAt: null
            },
            select: {
                id: true,
                priceListId: true,
                discountPercentage: true,
                applyVat: true,
                pricingConfigs: {
                    select: {
                        markupPercentage: true
                    }
                }
            }
        });

        if (!client) {
            throw new ProductServiceError('Cliente no encontrado', 404);
        }

        // Obtener todos los productos activos con sus relaciones
        const products = await prisma.product.findMany({
            where: {
                deletedAt: null
            },
            include: {
                brand: {
                    select: {
                        name: true
                    }
                },
                category: {
                    select: {
                        name: true
                    }
                },
                prices: {
                    where: {
                        priceListId: client.priceListId
                    },
                    select: {
                        price: true
                    }
                },
                stockLevels: {
                    select: {
                        quantity: true
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });

        const discountPercentage = toNumber(client.discountPercentage);
        const markupPercentage = toNumber(client.pricingConfigs?.markupPercentage || 0);

        // Mapear productos para exportación
        const exportData: ProductExportData[] = products.map(product => {
            const listPrice = toNumber(product.prices[0]?.price || 0);

            // Calcular precio del cliente: precio lista - descuento cliente + markup
            const priceAfterDiscount = listPrice * (1 - discountPercentage / 100);
            const clientPrice = priceAfterDiscount * (1 + markupPercentage / 100);


            return {
                sku: product.sku,
                name: extractStringFromMultiLanguage(product.name as MultiLanguageContent),
                description: product.description
                    ? extractStringFromMultiLanguage(product.description as MultiLanguageContent)
                    : null,
                brand: extractStringFromMultiLanguage(product.brand.name as MultiLanguageContent),
                category: extractStringFromMultiLanguage(product.category.name as MultiLanguageContent),
                listPrice: Math.round(listPrice * 100) / 100,
                clientPrice: Math.round(clientPrice * 100) / 100,
                discountPercentage: discountPercentage,
                isActive: true
            };
        });

        return exportData;
    } catch (error) {
        if (error instanceof ProductServiceError) {
            throw error;
        }
        console.error('Error al obtener productos para exportación:', error);
        throw new ProductServiceError('Error al obtener productos para exportación', 500);
    }
}

// Función utilitaria para extraer texto de contenido multiidioma
function extractStringFromMultiLanguage(content: MultiLanguageContent): string {


    if (content && typeof content === 'object') {
        return content.es || content.en || Object.values(content)[0] || '';
    }

    return '';
}