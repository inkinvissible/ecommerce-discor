import { Order, ShippingMethod } from '@prisma/client';

// Payload que esperamos en el body de la request
export interface CreateOrderPayload {
    shippingMethod: ShippingMethod;
    shippingAddressId?: string;
    shippingNotes?: string;
}

// Payload que enviaremos a la cola de trabajos de pg-boss
export interface SyncOrderToErpJobPayload {
    orderId: string;
}

// Constante para el nombre de la cola, evita errores de tipeo
export const ERP_ORDER_QUEUE = 'sync-order-to-erp';