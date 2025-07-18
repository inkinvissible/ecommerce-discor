import { z } from 'zod';

// Schema para validar el body de añadir item al carrito
export const addItemToCartSchema = z.object({
    productId: z.string().uuid("Product ID must be a valid UUID"),
    quantity: z.number().int().min(1, "Quantity must be at least 1").max(1000, "Quantity cannot exceed 1000")
});

// Schema para validar parámetros de ruta para eliminar item del carrito
export const removeCartItemParamsSchema = z.object({
    cartItemId: z.string().uuid("Cart Item ID must be a valid UUID")
});

// Tipos inferidos de los schemas
export type AddItemToCartInput = z.infer<typeof addItemToCartSchema>;
export type RemoveCartItemParamsInput = z.infer<typeof removeCartItemParamsSchema>;
