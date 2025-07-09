import { z } from 'zod';

// Schema para validar query params de la lista de productos
export const getProductsQuerySchema = z.object({
    page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 20),
    search: z.string().optional()
}).refine(data => data.page >= 1, {
    message: "Page must be greater than 0",
    path: ["page"]
}).refine(data => data.limit >= 1 && data.limit <= 100, {
    message: "Limit must be between 1 and 100",
    path: ["limit"]
});

// Schema para validar params del producto individual
export const getProductParamsSchema = z.object({
    productId: z.string().uuid("Product ID must be a valid UUID")
});