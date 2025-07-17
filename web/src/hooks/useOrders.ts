// src/hooks/useOrders.ts
import useSWR from 'swr';
import { ordersService } from '@/services/orderService';
import { OrdersResponse, OrdersParams } from '@/types/order';

export const useOrders = (params: OrdersParams = {}) => {
    const key = ['orders', params.page || 1, params.limit || 10];

    const { data, error, isLoading, mutate } = useSWR<OrdersResponse>(
        key,
        () => ordersService.getOrders(params),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            errorRetryCount: 3,
            onError: (error) => {
                console.error('Error loading orders:', error);
            }
        }
    );

    return {
        orders: data?.data || [],
        message: data?.message,
        pagination: data?.pagination,
        isLoading,
        error,
        mutate
    };
};