// services/products.service.ts

import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import {
    GetProductsListParams,
    ProductsListResponse,
    ProductDetail,
    DbProduct,
    ProductWithScore,
    SearchCondition
} from '../types/products';

import {
    buildSearchConditions,
    calculateRelevanceScore,
    processSearchParams
} from '../utils/search.utils';

import {
    calculatePriceBreakdownForClient,
    validateClientPriceList
} from '../utils/pricing.utils';

import { calculateTotalStock } from '../utils/stock.utils';

import {
    mapDbProductToListItem,
    mapDbProductToDetail,
    addRelevanceScore,
    removeRelevanceScore,
    sortProductsByRelevance
} from '../mappers/products.mapper';

// Tipo para las condiciones de búsqueda más específico
interface ProductWhereInput {
    deletedAt: null;
    categoryId?: { in: string[] };
    OR?: SearchCondition[];
}

/**
 * Construye la cláusula WHERE para la consulta de productos
 */
function buildWhereClause(
    search?: string,
    categoryIds?: string[]
): ProductWhereInput {
    const whereClause: ProductWhereInput = {
        deletedAt: null
    };

    // Filtro por categorías
    if (categoryIds?.length) {
        whereClause.categoryId = { in: categoryIds };
    }

    // Filtro por búsqueda
    if (search?.trim()) {
        try {
            const decodedSearch = decodeURIComponent(search.trim());
            const searchConditions = buildSearchConditions(decodedSearch);

            if (searchConditions.length > 0) {
                whereClause.OR = searchConditions;
            }
        } catch (error) {
            console.error('Error al decodificar parámetro de búsqueda:', error);
            // Si hay error en la decodificación, usar el término original
            const searchConditions = buildSearchConditions(search.trim());
            if (searchConditions.length > 0) {
                whereClause.OR = searchConditions;
            }
        }
    }

    return whereClause;
}

/**
 * Configuración base para las consultas de productos
 */
const getProductQueryConfig = (priceListId: number) => ({
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
                priceListId: priceListId
            },
            select: {
                price: true,
                currency: true
            }
        }
    }
} as const);

/**
 * Obtiene productos de la base de datos con sus relaciones
 */
async function fetchProductsFromDb(
    whereClause: ProductWhereInput,
    priceListId: number,
    options: {
        skip?: number;
        take?: number;
        orderBy?: Array<{ [key: string]: 'asc' | 'desc' }> | { [key: string]: 'asc' | 'desc' };
    } = {}
): Promise<DbProduct[]> {
    const { skip, take, orderBy } = options;

    const queryConfig = {
        where: whereClause,
        ...getProductQueryConfig(priceListId),
        ...(skip !== undefined && { skip }),
        ...(take !== undefined && { take }),
        ...(orderBy && { orderBy })
    };

    try {
        const products = await prisma.product.findMany(queryConfig);
        return products as unknown as DbProduct[];
    } catch (error) {
        console.error('Error al obtener productos de la base de datos:', error);
        throw new Error('Error al consultar productos');
    }
}

/**
 * Obtiene el conteo total de productos
 */
async function getProductsCount(whereClause: ProductWhereInput): Promise<number> {
    try {
        return await prisma.product.count({ where: whereClause });
    } catch (error) {
        console.error('Error al contar productos:', error);
        throw new Error('Error al contar productos');
    }
}

/**
 * Procesa productos aplicando score de relevancia y ordenamiento
 */
function processProductsWithRelevance(
    products: DbProduct[],
    searchTerm: string
): DbProduct[] {
    if (!searchTerm.trim()) {
        return products;
    }

    // Calcular score de relevancia para cada producto
    const productsWithScore: ProductWithScore[] = products.map(product => {
        const score = calculateRelevanceScore(product, searchTerm);
        return addRelevanceScore(product, score);
    });

    // Ordenar por relevancia
    const sortedProducts = sortProductsByRelevance(productsWithScore);

    // Remover score y devolver productos ordenados
    return sortedProducts.map(removeRelevanceScore);
}

/**
 * Aplica paginación a una lista de productos
 */
function applyPagination<T>(items: T[], page: number, limit: number): T[] {
    const skip = (page - 1) * limit;
    return items.slice(skip, skip + limit);
}

/**
 * Enriquece productos con información de precios y stock
 */
async function enrichProductsWithPricingAndStock(
    products: DbProduct[],
    clientId: string
): Promise<any[]> {
    const enrichmentPromises = products.map(async (product) => {
        try {
            const [priceBreakdown, stock] = await Promise.all([
                calculatePriceBreakdownForClient(product.id, clientId),
                calculateTotalStock(product.id)
            ]);

            return mapDbProductToListItem(product, priceBreakdown, stock);
        } catch (error) {
            console.error(`Error al enriquecer producto ${product.id}:`, error);
            // Retornar producto con datos por defecto en caso de error
            return mapDbProductToListItem(product, {
                listPrice: 0,
                discountedPrice: 0,
                finalPrice: 0,
                discountPercentage: 0,
                markupPercentage: 0,
                hasVat: false
            }, 0);
        }
    });

    return Promise.all(enrichmentPromises);
}

/**
 * Valida y sanitiza los parámetros de entrada
 */
function validateAndSanitizeParams(params: GetProductsListParams): GetProductsListParams {
    const { page, limit, search, categoryIds, clientId } = params;

    return {
        clientId,
        page: Math.max(1, page),
        limit: Math.min(Math.max(1, limit), 100), // Límite máximo de 100 productos por página
        search: search?.trim() || undefined,
        categoryIds: categoryIds?.filter(id => id.trim().length > 0) || undefined
    };
}

/**
 * Maneja la búsqueda con ordenamiento por relevancia
 */
async function handleSearchWithRelevance(
    params: GetProductsListParams,
    whereClause: ProductWhereInput,
    priceListId: number
): Promise<ProductsListResponse> {
    const { page, limit, search, clientId } = params;

    if (!search?.trim()) {
        throw new Error('Término de búsqueda requerido');
    }

    const decodedSearch = search.trim();

    try {
        // Obtener TODOS los productos que coinciden con la búsqueda
        const allProducts = await fetchProductsFromDb(whereClause, priceListId);

        // Procesar productos con relevancia
        const sortedProducts = processProductsWithRelevance(allProducts, decodedSearch);

        // Aplicar paginación después del ordenamiento
        const totalCount = sortedProducts.length;
        const paginatedProducts = applyPagination(sortedProducts, page, limit);

        // Enriquecer con precios y stock
        const enrichedProducts = await enrichProductsWithPricingAndStock(
            paginatedProducts,
            clientId
        );

        return {
            data: enrichedProducts,
            pagination: {
                totalItems: totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page
            }
        };
    } catch (error) {
        console.error('Error en búsqueda con relevancia:', error);
        throw new Error('Error al procesar búsqueda de productos');
    }
}

/**
 * Maneja la consulta normal sin búsqueda
 */
async function handleNormalQuery(
    params: GetProductsListParams,
    whereClause: ProductWhereInput,
    priceListId: number
): Promise<ProductsListResponse> {
    const { page, limit, clientId } = params;
    const skip = (page - 1) * limit;

    try {
        // Obtener productos con paginación y ordenamiento por SKU
        const [products, totalCount] = await Promise.all([
            fetchProductsFromDb(whereClause, priceListId, {
                skip,
                take: limit,
                orderBy: [
                    { sku: 'asc' },
                    { createdAt: 'desc' }
                ]
            }),
            getProductsCount(whereClause)
        ]);

        // Enriquecer con precios y stock
        const enrichedProducts = await enrichProductsWithPricingAndStock(
            products,
            clientId
        );

        return {
            data: enrichedProducts,
            pagination: {
                totalItems: totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page
            }
        };
    } catch (error) {
        console.error('Error en consulta normal:', error);
        throw new Error('Error al obtener lista de productos');
    }
}

/**
 * Obtiene una lista paginada de productos con precios calculados para el cliente
 */
export async function getProductsList(params: GetProductsListParams): Promise<ProductsListResponse> {
    try {
        // Validar y sanitizar parámetros
        const sanitizedParams = validateAndSanitizeParams(params);
        const { search, clientId, categoryIds } = sanitizedParams;

        // Validar cliente y obtener lista de precios
        const priceListId = await validateClientPriceList(clientId);

        // Construir cláusula WHERE
        const whereClause = buildWhereClause(search, categoryIds);

        // Ejecutar consulta apropiada
        if (search?.trim()) {
            return await handleSearchWithRelevance(sanitizedParams, whereClause, priceListId);
        } else {
            return await handleNormalQuery(sanitizedParams, whereClause, priceListId);
        }
    } catch (error) {
        console.error('Error en getProductsList:', error);

        // Re-lanzar errores conocidos
        if (error instanceof Error) {
            throw error;
        }

        // Error genérico para errores desconocidos
        throw new Error('Error interno al obtener productos');
    }
}

/**
 * Obtiene el detalle completo de un producto específico
 */
export async function getProductById(
    productId: string,
    clientId: string
): Promise<ProductDetail | null> {
    try {
        // Validar parámetros
        if (!productId?.trim() || !clientId?.trim()) {
            throw new Error('ID de producto y cliente son requeridos');
        }

        // Validar formato UUID básico
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(productId)) {
            throw new Error('Formato de ID de producto inválido');
        }

        const product = await prisma.product.findFirst({
            where: {
                id: productId,
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
                }
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

        return mapDbProductToDetail(product as DbProduct, priceBreakdown, stock);
    } catch (error) {
        console.error('Error en getProductById:', error);

        if (error instanceof Error) {
            throw error;
        }

        throw new Error('Error al obtener detalles del producto');
    }
}

// Re-exportar utilidades útiles
export { processSearchParams } from '../utils/search.utils';