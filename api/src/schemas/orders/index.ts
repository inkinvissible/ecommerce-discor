import { z } from 'zod';
import { ShippingMethod } from '@prisma/client';

export const createOrderSchema = z.object({
    shippingMethod: z.nativeEnum(ShippingMethod, {
        errorMap: () => ({ message: 'Método de envío inválido. Debe ser DELIVERY o PICKUP.' }),
    }),
    shippingAddressId: z.string().uuid().optional(),
    shippingNotes: z.string().max(255, 'Las notas no pueden superar los 255 caracteres.').optional(),
})
    .superRefine((data, ctx) => {
        // Si el método de envío es a domicilio, la dirección es obligatoria.
        if (data.shippingMethod === 'DELIVERY' && !data.shippingAddressId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Se requiere un ID de dirección de envío para el método DELIVERY.',
                path: ['shippingAddressId'],
            });
        }
        // Si es retiro, nos aseguramos de que no se envíe un ID de dirección.
        if (data.shippingMethod === 'PICKUP' && data.shippingAddressId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'No se debe proveer un ID de dirección para el método PICKUP.',
                path: ['shippingAddressId'],
            });
        }
    });

export const getOrdersSchema = z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
    status: z.string().optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
}).refine(data => {
    if (data.dateFrom && data.dateTo) {
        return new Date(data.dateFrom) <= new Date(data.dateTo);
    }
    return true;
}, {
    message: 'dateFrom no puede ser posterior a dateTo',
    path: ['dateFrom']
});