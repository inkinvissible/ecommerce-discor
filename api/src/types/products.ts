import { Decimal } from '@prisma/client/runtime/library'

export class ProductServiceError extends Error {
    public statusCode: number;

    constructor(message: string, statusCode: number = 400) {
        super(message);
        this.name = 'ProductServiceError';
        this.statusCode = statusCode;
    }
}

// Tipos para contenido multiidioma (JSON)
export interface MultiLanguageContent {
    es?: string;
    en?: string;
    [key: string]: string | undefined;
}

// Tipos para atributos de productos (JSON)
export interface ProductAttributes {
    [key: string]: string | number | boolean | null;
}

// Tipos para los parámetros de entrada
export interface GetProductsListParams {
    clientId: string;
    page: number;
    limit: number;
    search?: string;
    categoryIds?: string[];
}

// Tipos para información detallada de precios
export interface PriceBreakdown {
    listPrice: number;          // Precio de lista base
    discountedPrice: number;    // Precio después del descuento del cliente
    finalPrice: number;         // Precio final con markup e IVA
    discountPercentage: number; // Porcentaje de descuento aplicado
    markupPercentage: number;   // Porcentaje de markup aplicado
    hasVat: boolean;           // Si se aplicó IVA
}

// Tipos para las respuestas
export interface ProductListItem {
    id: string;
    name: MultiLanguageContent;
    sku: string | null;
    price: number; // Mantener por compatibilidad (será finalPrice)
    priceBreakdown: PriceBreakdown;
    stock: number;
    brand: {
        name: MultiLanguageContent;
    };
    category: {
        name: MultiLanguageContent;
    };
}

export interface ProductsListResponse {
    data: ProductListItem[];
    pagination: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
    };
}

export interface ProductDetail {
    id: string;
    name: MultiLanguageContent;
    description: MultiLanguageContent;
    sku: string | null;
    price: number; // Mantener por compatibilidad (será finalPrice)
    priceBreakdown: PriceBreakdown;
    stock: number;
    brand: {
        name: MultiLanguageContent;
    };
    category: {
        name: MultiLanguageContent;
    };
    attributes: ProductAttributes;
}
// Tipos para entidades de base de datos
export interface DbProduct {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    erpCode: string | null;
    name: MultiLanguageContent;
    sku: string | null;
    description: MultiLanguageContent;
    productBrandId: string;
    categoryId: string;
    attributes: Record<string, any>;
    // Añade las relaciones como opcionales si es necesario
    brand: DbBrand;
    category: DbCategory;
    prices?: DbPrice[];
}

export interface DbBrand {
    name: MultiLanguageContent;
}

export interface DbCategory {
    name: MultiLanguageContent;
}

export interface DbPrice {
    id: string;
    productId: string;
    priceListId: number;
    price: Decimal | number;
}

export interface DbClient {
    id: string;
    priceListId: number;
    discountPercentage: Decimal | number;
    applyVat: boolean;
    pricingConfigs?: DbPricingConfig | null;
}

export interface DbPricingConfig {
    markupPercentage: number;
}

export interface DbStockLevel {
    productId: string;
    quantity: number;
}

export interface SearchCondition {
    OR?: SearchCondition[];
    AND?: SearchCondition[];
    name?: {
        path: string[];
        string_contains: string;
        mode: 'insensitive';
    };
    description?: {
        path: string[];
        string_contains: string;
        mode: 'insensitive';
    };
    sku?: {
        contains: string;
        mode: 'insensitive';
    };
}

export interface ProductWithScore extends DbProduct {
    relevanceScore: number;
}

export interface AbbreviationsMap {
    [key: string]: string;
}

// Tipo para las condiciones de búsqueda más específico
export interface ProductWhereInput {
    deletedAt: null;
    categoryId?: { in: string[] };
    OR?: SearchCondition[];
}

export function toNumber(value: Decimal | number | null | undefined): number {
    if (value === null || value === undefined) {
        return 0;
    }

    if (typeof value === 'number') {
        return value;
    }

    // Si es un Decimal de Prisma
    if (value && typeof value === 'object' && 'toNumber' in value) {
        return (value as Decimal).toNumber();
    }

    // Fallback: intentar convertir a number
    return Number(value) || 0;
}

// Función utilitaria para validar UUID
export function isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}

// Función utilitaria para sanitizar strings de búsqueda
export function sanitizeSearchTerm(term: string): string {
    return term.trim().replace(/[<>]/g, '');
}

// Constantes
export const PAGINATION_DEFAULTS = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    MIN_LIMIT: 1
} as const;

export const SEARCH_DEFAULTS = {
    MIN_SEARCH_LENGTH: 2,
    MAX_SEARCH_LENGTH: 100
} as const;