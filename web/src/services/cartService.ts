import { apiClient } from '@/lib/api/client';

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

export interface AddToCartRequest {
    productId: string;
    quantity: number;
}

export const cartService = {
    // Obtener el carrito del usuario
    async getCart(): Promise<Cart> {
        return await apiClient.get('/api/cart');
    },

    // Agregar item al carrito
    async addToCart(data: AddToCartRequest): Promise<Cart> {
        return await apiClient.post('/api/cart/items', data);
    },

    // Actualizar cantidad de un item en el carrito
    async updateCartItem(itemId: string, quantity: number): Promise<Cart> {
        return await apiClient.put(`/api/cart/items/${itemId}`, { quantity });
    },

    // Eliminar item del carrito
    async removeFromCart(itemId: string): Promise<Cart> {
        return await apiClient.delete(`/api/cart/items/${itemId}`);
    },

};
