// src/hooks/useProducts.ts
import useSWR from 'swr';
import { apiClient } from '@/lib/api/client';
import { ProductsResponse } from '@/types/product';

interface UseProductsParams {
    search?: string;
    category?: string;
    page?: number;
    limit?: number;
}

const fetcher = async (url: string): Promise<ProductsResponse> => {
    return await apiClient.get(url);
};

export const useProducts = (params: UseProductsParams = {}) => {
    const { search, category, page = 1, limit = 12 } = params;

    // Construir query parameters de forma más robusta
    const queryParams = new URLSearchParams();

    if (search && search.trim()) {
        queryParams.append('search', search.trim());
    }

    if (category && category !== 'todos' && category !== '') {
        queryParams.append('categoryIds', category);
    }

    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());

    const queryString = queryParams.toString();
    const key = `api/products${queryString ? `?${queryString}` : ''}`;

    const { data, error, isLoading, mutate } = useSWR<ProductsResponse>(
        key,
        fetcher,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            dedupingInterval: 30000,
            keepPreviousData: true, // Mantener datos previos mientras carga
        }
    );

    return {
        products: data?.data || [],
        pagination: data?.pagination || {
            currentPage: page,
            totalItems: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
        },
        total: data?.pagination?.totalItems || 0,
        totalPages: data?.pagination?.totalPages || 0,
        currentPage: data?.pagination?.currentPage || page,
        hasNextPage: data?.pagination?.hasNextPage || false,
        hasPreviousPage: data?.pagination?.hasPreviousPage || false,
        isLoading,
        error,
        refetch: mutate,
    };
};