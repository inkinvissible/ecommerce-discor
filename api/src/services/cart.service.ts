// api/src/services/cart.service.ts

import {prisma} from '../lib/prisma';
import {MultiLanguageContent, PriceBreakdown} from '../types/products';
import {
    CartResponse,
    CartItem,
    CartServiceError,
    PrismaCartItem,
    PrismaCartItemExtended
} from '../types/cart';

/**
 * Calcula el desglose completo de precios para un cliente específico
 */
async function calculatePriceBreakdownForClient(productId: string, clientId: string): Promise<PriceBreakdown> {
    // Obtener información del cliente
    const client = await prisma.client.findUnique({
        where: {id: clientId},
        include: {
            pricingConfigs: true
        }
    });

    if (!client) {
        throw new CartServiceError('Cliente no encontrado', 404);
    }

    // Obtener el precio base del producto según la lista de precios del cliente
    const basePrice = await prisma.price.findFirst({
        where: {
            productId: productId,
            priceListId: client.priceListId
        }
    });

    if (!basePrice) {
        throw new CartServiceError('Precio no encontrado para este producto', 404);
    }

    const listPrice = basePrice.price.toNumber();
    let discountedPrice = listPrice;
    let finalPrice = listPrice;

    const discountPercentage = client.discountPercentage.toNumber();
    const markupPercentage = client.pricingConfigs?.markupPercentage?.toNumber() || 0;

    // Aplicar descuento del cliente si existe
    if (discountPercentage > 0) {
        const discountAmount = listPrice * (discountPercentage / 100);
        discountedPrice = listPrice - discountAmount;
        finalPrice = discountedPrice;
    }

    // Aplicar markup personalizado si existe
    if (markupPercentage > 0) {
        const markupAmount = finalPrice * (markupPercentage / 100);
        finalPrice = finalPrice + markupAmount;
    }

    // Aplicar IVA si corresponde
    if (client.applyVat) {
        finalPrice = finalPrice * 1.21; // IVA del 21%
    }

    return {
        listPrice: Math.round(listPrice * 100) / 100,
        discountedPrice: Math.round(discountedPrice * 100) / 100,
        finalPrice: Math.round(finalPrice * 100) / 100,
        discountPercentage,
        markupPercentage,
        hasVat: client.applyVat
    };
}

/**
 * Calcula el stock total de un producto
 */
async function calculateTotalStock(productId: string): Promise<number> {
    const stockLevels = await prisma.stockLevel.findMany({
        where: {productId}
    });

    return stockLevels.reduce((total: number, level: any) => total + level.quantity, 0);
}

/**
 * Obtiene el carrito del usuario con precios recalculados (versión optimizada)
 * Actúa como "ensamblador" completo para el frontend
 */
export async function getUserCart(userId: string, clientId: string): Promise<CartResponse> {
    // 1. Obtener información del cliente una sola vez (para cálculos de precios)
    const client = await prisma.client.findUnique({
        where: {id: clientId},
        include: {
            pricingConfigs: true
        }
    });

    if (!client) {
        throw new CartServiceError('Cliente no encontrado', 404);
    }

    // 2. Buscar o crear el carrito del usuario con toda la información necesaria
    let cart = await prisma.cart.findUnique({
        where: {userId},
        include: {
            items: {
                include: {
                    product: {
                        include: {
                            brand: true,
                            category: true,
                            prices: {
                                where: {
                                    priceListId: client.priceListId
                                }
                            },
                            stockLevels: true
                        }
                    }
                }
            }

        }
    });

    // Si no existe carrito, crear uno vacío
    if (!cart) {
        cart = await prisma.cart.create({
            data: {userId},
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                brand: true,
                                category: true,
                                prices: {
                                    where: {
                                        priceListId: client.priceListId
                                    }
                                },
                                stockLevels: true
                            }
                        }
                    }
                }
            }
        });
    }

    // 3. Filtrar productos activos y procesar cada ítem
    const activeItems = cart.items.filter((item: any) => !item.product.deletedAt) as PrismaCartItemExtended[];

    const cartItemsWithPricing = activeItems.map((item): CartItem => {
        // Calcular stock total del producto
        const stock = item.product.stockLevels.reduce(
            (total: number, level: any) => total + level.quantity,
            0
        );

        // Obtener precio base para este cliente
        const basePrice = item.product.prices[0];
        if (!basePrice) {
            throw new CartServiceError(`Precio no encontrado para el producto ${item.product.sku}`, 404);
        }

        // Calcular desglose de precios
        const priceBreakdown = calculatePriceBreakdownForProduct(
            basePrice.price.toNumber(),
            client.discountPercentage.toNumber(),
            client.pricingConfigs?.markupPercentage?.toNumber() || 0,
            client.applyVat
        );

        const subtotal = priceBreakdown.discountedPrice * item.quantity;

        return {
            id: item.id,
            productId: item.product.id,
            quantity: item.quantity,
            product: {
                id: item.product.id,
                name: item.product.name as MultiLanguageContent,
                sku: item.product.sku,
                stock,
                brand: {
                    name: item.product.brand.name as MultiLanguageContent
                },
                category: {
                    name: item.product.category.name as MultiLanguageContent
                }
            },
            priceBreakdown,
            subtotal: Math.round(subtotal * 100) / 100
        };
    });

    // 4. Calcular totales del carrito
    const totalItems = cartItemsWithPricing.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cartItemsWithPricing.reduce((sum, item) => sum + item.subtotal, 0);
    const itemsCount = cartItemsWithPricing.length;

    return {
        id: cart.id,
        items: cartItemsWithPricing,
        summary: {
            totalItems,
            totalAmount: Math.round(totalAmount * 100) / 100,
            totalAmountWithVat: totalAmount * 1.21,
            itemsCount
        }
    };
}

    /**
     * Función optimizada para calcular precios sin consultas adicionales a la DB
     */
    function calculatePriceBreakdownForProduct(
        listPrice: number,
        discountPercentage: number,
        markupPercentage: number,
        applyVat: boolean
    ): PriceBreakdown {
        let discountedPrice = listPrice;
        let finalPrice = listPrice;

        // Aplicar descuento del cliente
        if (discountPercentage > 0) {
            const discountAmount = listPrice * (discountPercentage / 100);
            discountedPrice = listPrice - discountAmount;
            finalPrice = discountedPrice;
        }

        // Aplicar markup personalizado
        if (markupPercentage > 0) {
            const markupAmount = finalPrice * (markupPercentage / 100);
            finalPrice = finalPrice + markupAmount;
        }

        // Aplicar IVA
        if (applyVat) {
            finalPrice = finalPrice * 1.21; // IVA del 21%
        }

        return {
            listPrice: Math.round(listPrice * 100) / 100,
            discountedPrice: Math.round(discountedPrice * 100) / 100,
            finalPrice: Math.round(finalPrice * 100) / 100,
            discountPercentage,
            markupPercentage,
            hasVat: applyVat
        };
    }

    /**
     * Añade o actualiza un item en el carrito
     */
    export async function addItemToCart(
        userId: string,
        clientId: string,
        productId: string,
        quantity: number
    ): Promise<CartResponse> {
        // Verificar que el producto existe y está activo
        const product = await prisma.product.findFirst({
            where: {
                id: productId,
                deletedAt: null
            }
        });

        if (!product) {
            throw new CartServiceError('Producto no encontrado o no disponible', 404);
        }

        // Buscar o crear el carrito del usuario
        let cart = await prisma.cart.findUnique({
            where: { userId }
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId }
            });
        }

        // Verificar si el producto ya existe en el carrito
        const existingItem = await prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                productId: productId
            }
        });

        if (existingItem) {
            // Si existe, actualizar la cantidad
            const newQuantity =  quantity;

            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: newQuantity }
            });
        } else {
            // Si no existe, crear nuevo item
            await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId,
                    quantity
                }
            });
        }

        // Devolver el carrito actualizado
        return getUserCart(userId, clientId);
    }

    /**
     * Elimina un item específico del carrito
     */
    export async function removeItemFromCart(
        userId: string,
        clientId: string,
        cartItemId: string
    ): Promise<CartResponse> {
        // Verificar que el item existe y pertenece al usuario
        const cartItem = await prisma.cartItem.findFirst({
            where: {
                id: cartItemId,
                cart: {
                    userId: userId
                }
            },
            include: {
                cart: true
            }
        });

        if (!cartItem) {
            throw new CartServiceError('Item del carrito no encontrado o no pertenece al usuario', 404);
        }

        // Eliminar el item del carrito
        await prisma.cartItem.delete({
            where: {
                id: cartItemId
            }
        });

        // Devolver el carrito actualizado
        return getUserCart(userId, clientId);
    }
