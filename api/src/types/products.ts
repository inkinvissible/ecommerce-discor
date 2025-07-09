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