import { Prisma, ShippingMethod} from '@prisma/client';

// Payload que esperamos en el body de la request
export interface CreateOrderPayload {
    shippingMethod: ShippingMethod;
    shippingAddressId?: string;
    shippingNotes?: string;
}

export interface GetOrdersQuery {
    page?: number;
    limit?: number;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
}

export interface OrderWithDetails {
    id: string;
    status: string;
    subtotal: Prisma.Decimal;
    discountAmount: Prisma.Decimal;
    shippingCost: Prisma.Decimal | null;
    isFreeShipping: boolean;
    totalAmount: Prisma.Decimal;
    currency: string;
    shippingMethod: ShippingMethod;
    shippingNotes: string | null;
    createdAt: Date;
    updatedAt: Date;
    shippingAddress?: {
        alias: string;
        street: string;
        city: string;
        province: string;
        zipCode: string;
    } | null;
    items: Array<{
        id: string;
        quantity: number;
        priceAtPurchase: Prisma.Decimal;
        productSnapshot: any;
    }>;
}
export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export interface PaginatedOrders {
    orders: OrderWithDetails[];
    pagination: PaginationInfo;
}


// Payload que enviaremos a la cola de trabajos de pg-boss
export interface SyncOrderToErpJobPayload {
    orderId: string;
}

// Constante para el nombre de la cola, evita errores de tipeo
export const ERP_ORDER_QUEUE = 'sync-order-to-erp';