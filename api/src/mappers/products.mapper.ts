// mappers/product.mappers.ts

import {
    DbProduct,
    ProductListItem,
    ProductDetail,
    PriceBreakdown,
    ProductWithScore
} from '../types/products';

/**
 * Mapea un producto de base de datos a un item de lista
 */
export function mapDbProductToListItem(
    dbProduct: DbProduct,
    priceBreakdown: PriceBreakdown,
    stock: number
): ProductListItem {
    return {
        id: dbProduct.id,
        name: dbProduct.name,
        sku: dbProduct.sku,
        price: priceBreakdown.finalPrice,
        priceBreakdown,
        stock,
        brand: {
            name: dbProduct.brand?.name || { es: 'Sin marca'} // Valor por defecto
        },
        category: {
            name: dbProduct.category?.name || { es: 'Sin categoría'} // Valor por defecto
        }
    };
}

/**
 * Mapea un producto de base de datos a detalle completo
 */
export function mapDbProductToDetail(
    dbProduct: DbProduct,
    priceBreakdown: PriceBreakdown,
    stock: number
): ProductDetail {
    return {
        id: dbProduct.id,
        name: dbProduct.name,
        description: dbProduct.description,
        sku: dbProduct.sku,
        price: priceBreakdown.finalPrice,
        priceBreakdown,
        stock,
        brand: {
            name: dbProduct.brand?.name || { es: 'Sin marca'} // Valor por defecto
        },
        category: {
            name: dbProduct.category?.name || { es: 'Sin categoría'} // Valor por defecto
        },
        attributes: dbProduct.attributes || {}
    };
}

/**
 * Agrega score de relevancia a un producto
 */
export function addRelevanceScore(
    product: DbProduct,
    relevanceScore: number
): ProductWithScore {
    return {
        ...product,
        relevanceScore
    };
}

/**
 * Remueve el score de relevancia de un producto
 */
export function removeRelevanceScore(
    productWithScore: ProductWithScore
): DbProduct {
    const { relevanceScore, ...product } = productWithScore;
    return product;
}

/**
 * Ordena productos por relevancia y luego por nombre
 */
export function sortProductsByRelevance(
    products: ProductWithScore[]
): ProductWithScore[] {
    return products.sort((a, b) => {
        // Primero por score descendente
        if (b.relevanceScore !== a.relevanceScore) {
            return b.relevanceScore - a.relevanceScore;
        }

        // Luego por SKU ascendente como respaldo
        return (a.sku || '').localeCompare(b.sku || '');
    });
}