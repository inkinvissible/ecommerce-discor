import { z } from 'zod';

// Schema para validar query parameters del endpoint GET /api/products
export const getProductsQuerySchema = z.object({
    page: z.string()
        .optional()
        .default('1')
        .transform(val => parseInt(val, 10))
        .refine(val => !isNaN(val) && val >= 1, {
            message: 'Page must be a positive integer'
        }),
    limit: z.string()
        .optional()
        .default('20')
        .transform(val => parseInt(val, 10))
        .refine(val => !isNaN(val) && val >= 1 && val <= 100, {
            message: 'Limit must be between 1 and 100'
        }),
    search: z.string()
        .optional()
        .transform(val => val?.trim())
        .refine(val => !val || val.length >= 2, {
            message: 'Search term must be at least 2 characters long'
        }),
    categoryIds: z.union([z.string().uuid(), z.array(z.string().uuid())]).optional().transform(val => {
        if (!val) return undefined;
        return Array.isArray(val) ? val : [val];
    })
});

// Schema para validar parámetros de ruta del endpoint GET /api/products/:id
export const getProductParamsSchema = z.object({
    productId: z.string()
        .uuid({ message: 'Product ID must be a valid UUID' })
});

// Schema para validar contenido multiidioma
export const multiLanguageContentSchema = z.object({
    es: z.string().optional(),
    en: z.string().optional()
}).catchall(z.string().optional())
.refine(data => Object.keys(data).length > 0, {
    message: 'At least one language must be provided'
});

// Schema para validar atributos de productos
export const productAttributesSchema = z.record(
    z.string(),
    z.union([z.string(), z.number(), z.boolean(), z.null()])
);

// Schema para validar el desglose de precios (respuesta)
export const priceBreakdownSchema = z.object({
    listPrice: z.number().min(0, 'List price must be non-negative'),
    discountedPrice: z.number().min(0, 'Discounted price must be non-negative'),
    finalPrice: z.number().min(0, 'Final price must be non-negative'),
    discountPercentage: z.number().min(0).max(100, 'Discount percentage must be between 0 and 100'),
    markupPercentage: z.number().min(0, 'Markup percentage must be non-negative'),
    hasVat: z.boolean()
});

// Schema para validar un item de producto en la lista (respuesta)
export const productListItemSchema = z.object({
    id: z.string().uuid(),
    name: multiLanguageContentSchema,
    sku: z.string().nullable(),
    price: z.number().min(0),
    priceBreakdown: priceBreakdownSchema,
    stock: z.number().int().min(0),
    brand: z.object({
        name: multiLanguageContentSchema
    }),
    category: z.object({
        name: multiLanguageContentSchema
    })
});

// Schema para validar la respuesta completa de la lista de productos
export const productsListResponseSchema = z.object({
    data: z.array(productListItemSchema),
    pagination: z.object({
        totalItems: z.number().int().min(0),
        totalPages: z.number().int().min(0),
        currentPage: z.number().int().min(1)
    })
});

// Schema para validar los detalles completos de un producto (respuesta)
export const productDetailSchema = z.object({
    id: z.string().uuid(),
    name: multiLanguageContentSchema,
    description: multiLanguageContentSchema,
    sku: z.string().nullable(),
    price: z.number().min(0),
    priceBreakdown: priceBreakdownSchema,
    stock: z.number().int().min(0),
    brand: z.object({
        name: multiLanguageContentSchema
    }),
    category: z.object({
        name: multiLanguageContentSchema
    }),
    attributes: productAttributesSchema
});

// Schema para validar parámetros de entrada para obtener lista de productos (servicio)
export const getProductsListParamsSchema = z.object({
    clientId: z.string().uuid({ message: 'Client ID must be a valid UUID' }),
    page: z.number().int().min(1, 'Page must be at least 1'),
    limit: z.number().int().min(1).max(100, 'Limit must be between 1 and 100'),
    search: z.string().optional()
});

// Tipos inferidos de los schemas para TypeScript
export type GetProductsQueryInput = z.infer<typeof getProductsQuerySchema>;
export type GetProductParamsInput = z.infer<typeof getProductParamsSchema>;
export type MultiLanguageContent = z.infer<typeof multiLanguageContentSchema>;
export type ProductAttributes = z.infer<typeof productAttributesSchema>;
export type PriceBreakdown = z.infer<typeof priceBreakdownSchema>;
export type ProductListItem = z.infer<typeof productListItemSchema>;
export type ProductsListResponse = z.infer<typeof productsListResponseSchema>;
export type ProductDetail = z.infer<typeof productDetailSchema>;
export type GetProductsListParams = z.infer<typeof getProductsListParamsSchema>;
