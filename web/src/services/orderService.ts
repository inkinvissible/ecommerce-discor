import { apiClient } from '@/lib/api/client';
import { OrdersParams, OrdersResponse } from '@/types/order';

export const ordersService = {
    getOrders: async (params: OrdersParams = {}): Promise<OrdersResponse> => {
        const searchParams = new URLSearchParams();
        searchParams.append('page', String(params.page || 1));
        searchParams.append('limit', String(params.limit || 10));

        try {
            const response = await apiClient.get<OrdersResponse>(
                `/api/orders?${searchParams.toString()}`
            );
            return response as unknown as OrdersResponse; // Accede a la propiedad `data` para devolver el tipo correcto
        } catch (e) {
            console.log(e)
            throw new Error('Error al obtener las órdenes');

        }
    }
};