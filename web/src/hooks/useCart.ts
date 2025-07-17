import useSWR from 'swr';
import {cartService, Cart, CartItem} from '@/services/cartService';
import {toast} from 'sonner';
import {useState, useCallback, useRef, useMemo} from 'react';

const CART_KEY = '/api/cart';

// Función de comparación estática
const compareCarts = (a: Cart | undefined, b: Cart | undefined): boolean => {
    if (!a || !b) return a === b;

    if (a.id !== b.id) return false;
    if (a.items.length !== b.items.length) return false;
    if (a.summary.totalItems !== b.summary.totalItems) return false;
    if (a.summary.totalAmount !== b.summary.totalAmount) return false;

    for (let i = 0; i < a.items.length; i++) {
        const itemA = a.items[i];
        const itemB = b.items[i];

        if (itemA.productId !== itemB.productId) return false;
        if (itemA.quantity !== itemB.quantity) return false;
        if (itemA.subtotal !== itemB.subtotal) return false;
    }

    return true;
};

interface UseCartResult {
    cart: Cart | undefined;
    isLoading: boolean;
    error: Error | undefined;
    loadingItems: Set<string>; // Items que están siendo actualizados

    addToCart: (productId: string, quantity: number) => Promise<void>;
    updateItemQuantity: (productId: string, quantity: number) => Promise<void>;
    removeFromCart: (productId: string) => Promise<void>;

    getProductQuantity: (productId: string) => number;
    getCartItem: (productId: string) => CartItem | null;
    getTotalItems: () => number;
    getTotalAmount: () => number;

    refetch: () => Promise<Cart | undefined>;
}

export const useCart = (): UseCartResult => {
    const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());
    const orderMapRef = useRef<Map<string, number>>(new Map());

    const {
        data: rawCart,
        error,
        mutate,
        isLoading: isSWRLoading,
    } = useSWR<Cart>(CART_KEY, cartService.getCart, {
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        refreshInterval: 0,
        dedupingInterval: 5000,
        errorRetryCount: 3,
        compare: compareCarts,
        keepPreviousData: true,
        onError: (error: Error) => {
            console.error('Cart fetch error:', error);
            toast.error('Error al cargar el carrito', {
                description: 'No se pudo cargar el carrito. Se reintentará automáticamente.',
            });
        }
    });

    // Función para preservar el orden de los items
    const cart = useMemo(() => {
        if (!rawCart || !rawCart.items.length) return rawCart;

        const orderMap = orderMapRef.current;
        let nextOrder = Math.max(...Array.from(orderMap.values()), 0) + 1;

        rawCart.items.forEach(item => {
            if (!orderMap.has(item.productId)) {
                orderMap.set(item.productId, nextOrder++);
            }
        });

        const currentProductIds = new Set(rawCart.items.map(item => item.productId));
        Array.from(orderMap.keys()).forEach(productId => {
            if (!currentProductIds.has(productId)) {
                orderMap.delete(productId);
            }
        });

        const sortedItems = [...rawCart.items].sort((a, b) => {
            const orderA = orderMap.get(a.productId) || 0;
            const orderB = orderMap.get(b.productId) || 0;
            return orderA - orderB;
        });

        return {
            ...rawCart,
            items: sortedItems
        };
    }, [rawCart]);

    // Solo loading cuando es la primera carga
    const isLoading = isSWRLoading && !cart;

    const createOptimisticCart = useCallback((
        currentCart: Cart | undefined,
        productId: string,
        quantity: number,
        operation: 'add' | 'update' | 'remove'
    ): Cart => {
        const baseCart = currentCart || {
            id: 'temp',
            items: [],
            summary: {totalItems: 0, totalAmount: 0, totalAmountWithVat: 0, itemsCount: 0}
        };

        let newItems = [...baseCart.items];
        const existingItemIndex = newItems.findIndex(item => item.productId === productId);

        switch (operation) {
            case 'add':
                if (existingItemIndex >= 0) {
                    newItems[existingItemIndex] = {
                        ...newItems[existingItemIndex],
                        quantity: newItems[existingItemIndex].quantity + quantity
                    };
                } else {
                    const orderMap = orderMapRef.current;
                    const nextOrder = Math.max(...Array.from(orderMap.values()), 0) + 1;
                    orderMap.set(productId, nextOrder);

                    newItems.push({
                        id: `temp-${productId}`,
                        productId,
                        quantity,
                        product: {
                            id: productId,
                            name: {es: 'Cargando...'},
                            sku: '',
                            stock: 0,
                            brand: {name: {es: ''}},
                            category: {name: {es: ''}}
                        },
                        priceBreakdown: {
                            listPrice: 0,
                            discountedPrice: 0,
                            finalPrice: 0,
                            discountPercentage: 0,
                            markupPercentage: 0,
                            hasVat: false
                        },
                        subtotal: 0
                    });
                }
                break;
            case 'update':
                if (existingItemIndex >= 0) {
                    newItems[existingItemIndex] = {
                        ...newItems[existingItemIndex],
                        quantity: quantity
                    };
                }
                break;
            case 'remove':
                newItems = newItems.filter(item => item.productId !== productId);
                orderMapRef.current.delete(productId);
                break;
        }

        const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
        // Calcular total SIN IVA (precio de costo del cliente)
        const totalAmount = newItems.reduce((sum, item) => {
            const clientPrice = item.priceBreakdown.discountedPrice;
            return sum + (item.quantity * clientPrice);
        }, 0);

        // Calcular total CON IVA (lo que paga el cliente)
        const totalAmountWithVat = newItems.reduce((sum, item) => {
            const clientPrice = item.priceBreakdown.discountedPrice;
            const IVA_RATE = 0.21; // 21% IVA
            const priceWithIVA = clientPrice * (1 + IVA_RATE);
            return sum + (item.quantity * priceWithIVA);
        }, 0);

        const optimisticCart = {
            ...baseCart,
            items: newItems,
            summary: {
                totalItems,
                totalAmount,
                totalAmountWithVat,
                itemsCount: newItems.length
            }
        };

        const orderMap = orderMapRef.current;
        const sortedItems = [...optimisticCart.items].sort((a, b) => {
            const orderA = orderMap.get(a.productId) || 0;
            const orderB = orderMap.get(b.productId) || 0;
            return orderA - orderB;
        });

        return {
            ...optimisticCart,
            items: sortedItems
        };
    }, []);

    const performMutation = useCallback(async <T>(
        productId: string,
        operation: () => Promise<T>,
        optimisticData?: Cart,
        successMessage?: string,
        errorMessage?: string
    ): Promise<T> => {
        // Agregar el productId al set de loading
        setLoadingItems(prev => new Set(prev).add(productId));

        try {
            // Aplicar actualización optimista
            if (optimisticData) {
                mutate(optimisticData, false);
            }

            // Realizar operación
            const result = await operation();

            // Actualizar datos en background
            mutate(
                async () => {
                    const freshData = await cartService.getCart();
                    return freshData;
                },
                {
                    optimisticData,
                    rollbackOnError: true,
                    populateCache: true,
                    revalidate: false
                }
            );

            if (successMessage) {
                toast.success(successMessage);
            }

            return result;
        } catch (error) {
            console.error('Cart operation error:', error);

            toast.error(errorMessage || 'Error en la operación', {
                description: 'Hubo un problema al realizar la operación. Intenta nuevamente.',
            });

            throw error;
        } finally {
            // Remover el productId del set de loading
            setLoadingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(productId);
                return newSet;
            });
        }
    }, [mutate]);

    const removeFromCart = useCallback(async (productId: string): Promise<void> => {
        if (!cart) return;

        const item = cart.items.find(item => item.productId === productId);
        if (!item) return;

        const optimisticCart = createOptimisticCart(cart, productId, 0, 'remove');

        await performMutation(
            productId,
            () => cartService.removeFromCart(item.id),
            optimisticCart,
            'Producto eliminado del carrito',
            'Error al eliminar producto'
        );
    }, [cart, createOptimisticCart, performMutation]);

    const getProductQuantity = useCallback((productId: string): number => {
        if (!cart) return 0;
        const item = cart.items.find(item => item.productId === productId);
        return item ? item.quantity : 0;
    }, [cart]);

    const addToCart = useCallback(async (productId: string, quantity: number): Promise<void> => {
        const currentQuantity = getProductQuantity(productId);
        const newTotalQuantity = currentQuantity + quantity;

        const optimisticCart = createOptimisticCart(cart, productId, newTotalQuantity, 'update');

        await performMutation(
            productId,
            () => cartService.addToCart({productId, quantity: newTotalQuantity}),
            optimisticCart,
            `${quantity} ${quantity > 1 ? 'productos agregados' : 'producto agregado'} al carrito`,
            'Error al agregar al carrito'
        );
    }, [cart, createOptimisticCart, performMutation, getProductQuantity]);

    const updateItemQuantity = useCallback(async (productId: string, quantity: number): Promise<void> => {
        if (quantity <= 0) {
            await removeFromCart(productId);
            return;
        }

        const optimisticCart = createOptimisticCart(cart, productId, quantity, 'update');

        await performMutation(
            productId,
            () => cartService.addToCart({productId, quantity}),
            optimisticCart,
            'Cantidad actualizada',
            'Error al actualizar cantidad'
        );
    }, [cart, createOptimisticCart, performMutation, removeFromCart]);



    const getCartItem = useCallback((productId: string): CartItem | null => {
        if (!cart) return null;
        return cart.items.find(item => item.productId === productId) || null;
    }, [cart]);

    const getTotalItems = useCallback((): number => {
        return cart?.summary.totalItems || 0;
    }, [cart]);

    const getTotalAmount = useCallback((): number => {
        return cart?.summary?.totalAmountWithVat || 0;
    }, [cart]);

    const refetch = useCallback(async (): Promise<Cart | undefined> => {
        return await mutate();
    }, [mutate]);

    return {
        cart,
        isLoading,
        error,
        loadingItems,

        addToCart,
        updateItemQuantity,
        removeFromCart,

        getProductQuantity,
        getCartItem,
        getTotalItems,
        getTotalAmount,

        refetch
    };
};