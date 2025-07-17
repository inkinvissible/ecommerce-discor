// src/types/cart.ts
export interface CartItem {
    id: string;
    productId: string;
    quantity: number;
    product: {
        id: string;
        name: {
            es: string;
        };
        sku: string;
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
    };
    priceBreakdown: {
        listPrice: number;
        discountedPrice: number;
        finalPrice: number;
        discountPercentage: number;
        markupPercentage: number;
        hasVat: boolean;
    };
    subtotal: number;
}

export interface Cart {
    id: string;
    items: CartItem[];
    summary: {
        totalItems: number;
        totalAmount: number;
        totalAmountWithVat: number;
        itemsCount: number;
    };
}