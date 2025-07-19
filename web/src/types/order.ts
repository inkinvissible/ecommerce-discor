export interface OrderItem {
    id: string;
    quantity: number;
    priceAtPurchase: string;
    productSnapshot: {
        id: string;
        sku: string;
        name: { es: string };
        erpCode: string;
        description: { es: string };
        categoryId: string;
        productBrandId: string;
        createdAt: string;
        updatedAt: string;
        deletedAt: string | null;
    };
}

export interface Order {
    id: string;
    userId: string;
    clientId: string;
    status: string;
    subtotal: string;
    discountAmount: string;
    shippingCost: string | null;
    isFreeShipping: boolean;
    totalAmount: string;
    currency: string;
    shippingAddressId: string | null;
    shippingNotes: string | null;
    shippingMethod: string;
    createdAt: string;
    updatedAt: string;
    shippingAddress: string;
    items: OrderItem[];
}

export interface OrdersResponse {
    message: string;
    data: Order[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface OrdersParams {
    page?: number;
    limit?: number;
}

export type OrderType = 'PICKUP' | 'DELIVERY';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening';

export interface OrderInfo {
    type: OrderType;
    date?: Date;
    timeOfDay?: TimeOfDay;
    isUrgent: boolean;
    deliveryAddress?: string;
    shippingNotes?: string;
}

// Agrega estos tipos a tu archivo src/types/order.ts
export interface CreateOrderRequest {
    shippingMethod: OrderType;
    shippingNotes: string;
    shippingAddressId?: string;
}

export interface CreateOrderResponse {
    message: string;
    order: {
        id: string;
        userId: string;
        clientId: string;
        status: string;
        subtotal: string;
        discountAmount: string;
        shippingCost: string | null;
        isFreeShipping: boolean;
        totalAmount: string;
        currency: string;
        shippingAddressId: string | null;
        shippingNotes: string | null;
        shippingMethod: OrderType;
        createdAt: string;
        updatedAt: string;
    };
}