// src/types/product.ts
export interface Product {
    id: string;
    name: {
        es: string;
    };
    sku: string;
    price: number;
    priceBreakdown: {
        listPrice: number;
        discountedPrice: number;
        finalPrice: number;
        discountPercentage: number;
        markupPercentage: number;
        hasVat: boolean;
    };
    stock: number;
    brand: {
        name: {
            es: string;
        };
    };
    category: {
        name: {
            es: string;
        };
    };
}

export interface ProductFilters {
    search: string;
    category: string;
    priceRange: [number, number];
    page: number;
    limit: number;
}

export interface PaginationInfo {
    currentPage: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface ProductsResponse {
    data: Product[];
    pagination: PaginationInfo;
}

export interface Category {
    id: string;
    name: {
        es: string;
    };
}
