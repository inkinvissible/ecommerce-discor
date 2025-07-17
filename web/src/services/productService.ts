// src/services/productService.ts
import { apiClient } from '@/lib/api/client';
import { Product, ProductsResponse, Category } from '@/types/product';

interface ProductsParams {
    search?: string;
    categoryIds?: string;
    page?: number;
    limit?: number;

}

export const productService = {
    // Obtener todos los productos con filtros y paginación
    getProducts: async (params: ProductsParams = {}): Promise<ProductsResponse> => {
        const queryParams = new URLSearchParams();

        // Construir parámetros de consulta
        if (params.search && params.search.trim()) {
            queryParams.append('search', params.search.trim());
        }

        if (params.categoryIds && params.categoryIds !== 'todos') {
            queryParams.append('categoryIds', params.categoryIds);
        }

        queryParams.append('page', (params.page || 1).toString());
        queryParams.append('limit', (params.limit || 12).toString());

        const queryString = queryParams.toString();
        const url = `/api/products${queryString ? `?${queryString}` : ''}`;

        try {
            const response = await apiClient.get<ProductsResponse>(url);
            return response;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    },

    // Obtener un producto por ID
    getProduct: async (id: string): Promise<Product> => {
        try {
            const response = await apiClient.get<Product>(`/api/products/${id}`);
            return response;
        } catch (error) {
            console.error('Error fetching product:', error);
            throw error;
        }
    },

    // Obtener categorías
    getCategories: async (): Promise<Category[]> => {
        try {
            const response = await apiClient.get('/api/products/categories');
            // Manejar diferentes formatos de respuesta
            if (Array.isArray(response)) {
                return response;
            }
            return response?.data || [];
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    },

    // Buscar productos (método adicional para búsquedas específicas)
    searchProducts: async (query: string, options: Omit<ProductsParams, 'search'> = {}): Promise<ProductsResponse> => {
        return productService.getProducts({ ...options, search: query });
    },

    // Obtener productos por categoría
    getProductsByCategory: async (categoryId: string, options: Omit<ProductsParams, 'categoryIds'> = {}): Promise<ProductsResponse> => {
        return productService.getProducts({ ...options, categoryIds: categoryId });
    },
};