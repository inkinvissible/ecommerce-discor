// src/hooks/useCategories.ts
import useSWR from 'swr';
import { apiClient } from '@/lib/api/client';
import { Category } from '@/types/product';

interface CategoriesResponse {
    data?: Category[];
    success?: boolean;
    message?: string;
}

const fetcher = async (url: string): Promise<Category[]> => {
    const response = await apiClient.get<Category[] | CategoriesResponse>(url);

    // Manejar diferentes formatos de respuesta
    if (Array.isArray(response)) {
        return response;
    }

    if (response && typeof response === 'object' && 'data' in response) {
        const categoriesResponse = response as CategoriesResponse;
        return categoriesResponse.data || [];
    }

    return [];
};

export const useCategories = () => {
    const { data, error, isLoading, mutate } = useSWR<Category[]>(
        'api/products/categories',
        fetcher,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            dedupingInterval: 5 * 60 * 1000, // 5 minutos
        }
    );

    return {
        categories: data || [],
        isLoading,
        error,
        refetch: mutate,
    };
};
