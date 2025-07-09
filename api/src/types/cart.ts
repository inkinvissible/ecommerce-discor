// Importar tipos compartidos
import { MultiLanguageContent, PriceBreakdown } from './products';

// Error personalizado para el servicio de carrito
export class CartServiceError extends Error {
    public statusCode: number;

    constructor(message: string, statusCode: number = 400) {
        super(message);
        this.name = 'CartServiceError';
        this.statusCode = statusCode;
    }
}

// Tipo para el item de carrito que viene de Prisma
export interface PrismaCartItem {
    id: string;
    quantity: number;
    product: {
        id: string;
        name: any;
        sku: string | null;
        deletedAt: Date | null;
        brand: {
            name: any
        };
        category: {
            name: any
        };
    };
}

// Información básica del producto en el carrito
export interface CartProductInfo {
    id: string;
    name: MultiLanguageContent;
    sku: string | null;
    stock: number;
    brand: {
        name: MultiLanguageContent;
    };
    category: {
        name: MultiLanguageContent;
    };
}

// Item individual del carrito
export interface CartItem {
    id: string;
    productId: string;
    quantity: number;
    product: CartProductInfo;
    priceBreakdown: PriceBreakdown;
    subtotal: number;
}

// Resumen del carrito
export interface CartSummary {
    totalItems: number;    // Cantidad total de productos
    totalAmount: number;   // Monto total del carrito
    itemsCount: number;    // Número de productos únicos
}

// Respuesta completa del carrito
export interface CartResponse {
    id: string;
    items: CartItem[];
    summary: CartSummary;
}

// Parámetros para añadir items al carrito
export interface AddItemToCartParams {
    productId: string;
    quantity: number;
}

// Parámetros para actualizar items del carrito
export interface UpdateCartItemParams {
    itemId: string;
    quantity: number;
}

// Parámetros para remover items del carrito
export interface RemoveCartItemParams {
    itemId: string;
}

// Tipo para el item de carrito extendido que viene de Prisma con includes
export interface PrismaCartItemExtended {
    id: string;
    quantity: number;
    product: {
        id: string;
        name: any;
        sku: string | null;
        deletedAt: Date | null;
        brand: {
            name: any
        };
        category: {
            name: any
        };
        prices: Array<{
            price: any;
        }>;
        stockLevels: Array<{
            quantity: number;
        }>;
    };
}
