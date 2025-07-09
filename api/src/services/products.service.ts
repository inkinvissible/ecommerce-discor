// api/src/services/products.service.ts

import { prisma } from '../lib/prisma';
import {
    ProductServiceError,
    GetProductsListParams,
    ProductsListResponse,
    ProductDetail,
    MultiLanguageContent,
    PriceBreakdown
} from '../types/products';

/**
 * Calcula el desglose completo de precios para un cliente específico
 */
async function calculatePriceBreakdownForClient(productId: string, clientId: string): Promise<PriceBreakdown> {
    // Obtener información del cliente
    const client = await prisma.client.findUnique({
        where: { id: clientId },
        include: {
            pricingConfigs: true
        }
    });

    if (!client) {
        throw new ProductServiceError('Cliente no encontrado', 404);
    }

    // Obtener el precio base del producto según la lista de precios del cliente
    const basePrice = await prisma.price.findFirst({
        where: {
            productId: productId,
            priceListId: client.priceListId
        }
    });

    if (!basePrice) {
        throw new ProductServiceError('Precio no encontrado para este producto', 404);
    }

    const listPrice = basePrice.price.toNumber();
    let discountedPrice = listPrice;
    let finalPrice = listPrice;

    const discountPercentage = client.discountPercentage.toNumber();
    const markupPercentage = client.pricingConfigs?.markupPercentage?.toNumber() || 0;

    // Aplicar descuento del cliente si existe
    if (discountPercentage > 0) {
        const discountAmount = listPrice * (discountPercentage / 100);
        discountedPrice = listPrice - discountAmount;
        finalPrice = discountedPrice;
    }

    // Aplicar markup personalizado si existe
    if (markupPercentage > 0) {
        const markupAmount = finalPrice * (markupPercentage / 100);
        finalPrice = finalPrice + markupAmount;
    }

    // Aplicar IVA si corresponde
    if (client.applyVat) {
        finalPrice = finalPrice * 1.21; // IVA del 21%
    }

    return {
        listPrice: Math.round(listPrice * 100) / 100,
        discountedPrice: Math.round(discountedPrice * 100) / 100,
        finalPrice: Math.round(finalPrice * 100) / 100,
        discountPercentage,
        markupPercentage,
        hasVat: client.applyVat
    };
}

/**
 * Calcula el stock total de un producto
 */
async function calculateTotalStock(productId: string): Promise<number> {
    const stockLevels = await prisma.stockLevel.findMany({
        where: { productId }
    });

    return stockLevels.reduce((total: number, level: any) => total + level.quantity, 0);
}

/**
 * Obtiene una lista paginada de productos con precios calculados para el cliente
 */
export async function getProductsList(params: GetProductsListParams): Promise<ProductsListResponse> {
    const { clientId, page, limit, search } = params;
    const skip = (page - 1) * limit;

    // Construir filtros de búsqueda
    const whereClause: any = {
        deletedAt: null // Solo productos activos
    };

    if (search) {
        whereClause.OR = [
            {
                name: {
                    path: ['es'], // Asumiendo que el nombre está en español
                    string_contains: search
                }
            },
            {
                sku: {
                    contains: search,
                    mode: 'insensitive'
                }
            }
        ];
    }

    // Obtener productos con paginación
    const [products, totalCount] = await Promise.all([
        prisma.product.findMany({
            where: whereClause,
            include: {
                brand: true,
                category: true,
                prices: {
                    where: {
                        priceListId: (await prisma.client.findUnique({
                            where: { id: clientId },
                            select: { priceListId: true }
                        }))?.priceListId
                    }
                }
            },
            skip,
            take: limit,
            orderBy: { name: 'asc' }
        }),
        prisma.product.count({ where: whereClause })
    ]);

    // Calcular precios y stock para cada producto
    const productsWithPricing = await Promise.all(
        products.map(async (product: any) => {
            const [priceBreakdown, stock] = await Promise.all([
                calculatePriceBreakdownForClient(product.id, clientId),
                calculateTotalStock(product.id)
            ]);

            return {
                id: product.id,
                name: product.name as MultiLanguageContent,
                sku: product.sku,
                price: priceBreakdown.finalPrice, // Mantener compatibilidad con precio final
                priceBreakdown: priceBreakdown,
                stock,
                brand: {
                    name: product.brand.name as MultiLanguageContent
                },
                category: {
                    name: product.category.name as MultiLanguageContent
                }
            };
        })
    );

    const totalPages = Math.ceil(totalCount / limit);

    return {
        data: productsWithPricing,
        pagination: {
            totalItems: totalCount,
            totalPages,
            currentPage: page
        }
    };
}

/**
 * Obtiene el detalle completo de un producto específico
 */
export async function getProductById(productId: string, clientId: string): Promise<ProductDetail | null> {
    const product = await prisma.product.findFirst({
        where: {
            id: productId,
            deletedAt: null
        },
        include: {
            brand: true,
            category: true
        }
    });

    if (!product) {
        return null;
    }

    // Calcular precio y stock
    const [priceBreakdown, stock] = await Promise.all([
        calculatePriceBreakdownForClient(product.id, clientId),
        calculateTotalStock(product.id)
    ]);

    return {
        id: product.id,
        name: product.name as MultiLanguageContent,
        description: product.description as MultiLanguageContent,
        sku: product.sku,
        price: priceBreakdown.finalPrice, // Mantener compatibilidad con precio final
        priceBreakdown: priceBreakdown,
        stock,
        brand: {
            name: product.brand.name as MultiLanguageContent
        },
        category: {
            name: product.category.name as MultiLanguageContent
        },
        attributes: (product.attributes as any) || {}
    };
}

