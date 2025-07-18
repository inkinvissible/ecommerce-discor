// src/components/layout/Orders/OrderCard.tsx
import { useState } from 'react';
import { Order } from '@/types/order';

interface OrderCardProps {
    order: Order;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
    const [showAllItems, setShowAllItems] = useState(false);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount: string) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: order.currency
        }).format(parseFloat(amount));
    };

    const displayItems = showAllItems ? order.items : order.items.slice(0, 3);

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Orden #{order.id.slice(-8)}
                    </h3>
                    <p className="text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                    </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    order.status === 'synced_with_erp'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                }`}>
          {order.status}
        </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                    <p className="text-sm font-medium text-gray-700">Subtotal</p>
                    <p className="text-lg">{formatCurrency(order.subtotal)}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-700">Descuento</p>
                    <p className="text-lg text-red-600">-{formatCurrency(order.discountAmount)}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-700">Total</p>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                </div>
            </div>

            <div className="border-t pt-4">
                <h4 className="text-md font-medium text-gray-900 mb-2">
                    Productos ({order.items.length})
                </h4>
                <div className="space-y-2">
                    {displayItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                    {item.productSnapshot.name.es}
                                </p>
                                <p className="text-xs text-gray-500">
                                    SKU: {item.productSnapshot.sku}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm">Cantidad: {item.quantity}</p>
                                <p className="text-sm font-medium">
                                    {formatCurrency(item.priceAtPurchase)}
                                </p>
                            </div>
                        </div>
                    ))}

                    {order.items.length > 3 && (
                        <button
                            onClick={() => setShowAllItems(!showAllItems)}
                            className="w-full text-blue-600 hover:text-blue-800 text-sm font-medium py-2 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
                        >
                            {showAllItems
                                ? 'Mostrar menos'
                                : `Mostrar ${order.items.length - 3} productos más`
                            }
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">Método de envío:</span> {order.shippingMethod}
                        </p>
                        {order.isFreeShipping && (
                            <p className="text-sm text-green-600 font-medium">Envío gratuito</p>
                        )}
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500">Actualizado</p>
                        <p className="text-xs text-gray-600">{formatDate(order.updatedAt)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};