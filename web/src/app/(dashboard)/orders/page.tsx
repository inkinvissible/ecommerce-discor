// src/app/(dashboard)/orders/page.tsx
'use client';

import { useState } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { OrderCard } from '@/components/layout/Orders/OrderCard';
import { OrdersPagination } from '@/components/layout/Orders/OrdersPagination';

const OrdersPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(10);

    const { orders, isLoading, error, message, pagination } = useOrders({
        page: currentPage,
        limit
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                            Error al cargar las órdenes
                        </h3>
                        <p className="mt-1 text-sm text-red-700">
                            {error.message || 'Ocurrió un error inesperado'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Órdenes</h1>
                <p className="mt-2 text-sm text-gray-600">
                    Gestiona y visualiza todas las órdenes del sistema
                </p>
                {pagination && (
                    <p className="mt-1 text-sm text-gray-500">
                        Mostrando {orders.length} de {pagination.total} órdenes
                    </p>
                )}
            </div>

            {message && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                    <p className="text-sm text-green-700">{message}</p>
                </div>
            )}

            <div className="space-y-4">
                {orders.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No hay órdenes disponibles</p>
                    </div>
                ) : (
                    <>
                        {orders.map((order) => (
                            <OrderCard key={order.id} order={order} />
                        ))}

                        {pagination && pagination.totalPages > 1 && (
                            <OrdersPagination
                                currentPage={currentPage}
                                totalPages={pagination.totalPages}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;