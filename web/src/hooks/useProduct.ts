// src/hooks/useProduct.ts
import useSWR from 'swr';
import { productService } from '@/services/productService';
import { Product } from '@/types/product';

export const useProduct = (productId: string) => {
    const { data, error, isLoading, mutate } = useSWR<Product>(
        productId ? `/api/products/${productId}` : null,
        () => productService.getProduct(productId),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            dedupingInterval: 120000, // 2 minutos
        }
    );

    return {
        product: data,
        isLoading,
        isError: error,
        refetch: mutate,
    };
};