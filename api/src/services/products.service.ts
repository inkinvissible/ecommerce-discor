// services/products.service.ts

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

/**
 * Construye la cláusula WHERE para la consulta de productos
 */
function buildWhereClause(search?: string): { deletedAt: null; OR?: SearchCondition[] } {
    const whereClause: { deletedAt: null; OR?: SearchCondition[] } = {
        deletedAt: null // Solo productos activos
    };

    if (search && search.trim()) {
        const decodedSearch = decodeURIComponent(search.trim());
        const searchConditions = buildSearchConditions(decodedSearch);
        whereClause.OR = searchConditions;
    }

    return whereClause;
}

/**
 * Obtiene productos de la base de datos con sus relaciones
 */
async function fetchProductsFromDb(
    whereClause: { deletedAt: null; OR?: SearchCondition[] },
    priceListId: number,
    skip?: number,
    take?: number
): Promise<DbProduct[]> {
    const queryOptions: any = {
        where: whereClause,
        include: {
            brand: true,
            category: true,
            prices: {
                where: {
                    priceListId: priceListId
                }
            }
        }
    };

    if (skip !== undefined) queryOptions.skip = skip;
    if (take !== undefined) queryOptions.take = take;

    // Agregar ordenamiento solo si no hay paginación (sin búsqueda)
    if (skip !== undefined && take !== undefined) {
        queryOptions.orderBy = {
            sku: 'asc' // Cambiado a un campo string normal
        };
    }

    const products = await prisma.product.findMany(queryOptions);
    return products as unknown as DbProduct[];
}

/**
 * Procesa productos aplicando score de relevancia y ordenamiento
 */
function processProductsWithRelevance(
    products: DbProduct[],
    searchTerm: string
): DbProduct[] {
    // Calcular score de relevancia para cada producto
    const productsWithScore: ProductWithScore[] = products.map(product =>
        addRelevanceScore(product, calculateRelevanceScore(product, searchTerm))
    );

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
    return await Promise.all(
        products.map(async (product) => {
            const [priceBreakdown, stock] = await Promise.all([
                calculatePriceBreakdownForClient(product.id, clientId),
                calculateTotalStock(product.id)
            ]);

            return mapDbProductToListItem(product, priceBreakdown, stock);
        })
    );
}

/**
 * Maneja la búsqueda con ordenamiento por relevancia
 */
async function handleSearchWithRelevance(
    params: GetProductsListParams,
    whereClause: { deletedAt: null; OR?: SearchCondition[] },
    priceListId: number
): Promise<ProductsListResponse> {
    const { page, limit, search, clientId } = params;
    const decodedSearch = decodeURIComponent(search!.trim());

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
}

/**
 * Maneja la consulta normal sin búsqueda
 */
async function handleNormalQuery(
    params: GetProductsListParams,
    whereClause: { deletedAt: null; OR?: SearchCondition[] },
    priceListId: number
): Promise<ProductsListResponse> {
    const { page, limit, clientId } = params;
    const skip = (page - 1) * limit;

    // Obtener productos con paginación y ordenamiento por nombre
    const [products, totalCount] = await Promise.all([
        fetchProductsFromDb(whereClause, priceListId, skip, limit),
        prisma.product.count({ where: whereClause })
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
}

/**
 * Obtiene una lista paginada de productos con precios calculados para el cliente
 */
export async function getProductsList(params: GetProductsListParams): Promise<ProductsListResponse> {
    const { search, clientId } = params;

    // Validar que el cliente tenga lista de precios
    const priceListId = await validateClientPriceList(clientId);

    // Construir filtros de búsqueda
    const whereClause = buildWhereClause(search);

    // Decidir estrategia según si hay búsqueda o no
    if (search && search.trim()) {
        return await handleSearchWithRelevance(params, whereClause, priceListId);
    } else {
        return await handleNormalQuery(params, whereClause, priceListId);
    }
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
    }) as DbProduct | null;

    if (!product) {
        return null;
    }

    // Calcular precio y stock
    const [priceBreakdown, stock] = await Promise.all([
        calculatePriceBreakdownForClient(product.id, clientId),
        calculateTotalStock(product.id)
    ]);

    return mapDbProductToDetail(product, priceBreakdown, stock);
}

// Re-exportar utilidades útiles
export { processSearchParams } from '../utils/search.utils';