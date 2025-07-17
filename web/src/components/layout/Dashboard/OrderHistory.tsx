import { Order } from "@/types/order";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Package, AlertTriangle, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface OrderHistoryProps {
    orders: Order[];
    loading: boolean;
    error?: Error;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ orders, loading, error }) => {
    const formatCurrency = (amount: string) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(parseFloat(amount));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="w-4 h-4 text-yellow-600" />;
            case 'error':
                return <AlertTriangle className="w-4 h-4 text-red-600" />;
            default:
                return null;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending':
                return 'Pedido pendiente de procesamiento';
            case 'error':
                return 'Error al procesar el pedido';
            default:
                return '';
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Historial de Pedidos</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className="flex justify-between items-center p-4 border rounded">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                                <Skeleton className="h-4 w-16" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Historial de Pedidos</CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Error al cargar el historial de pedidos.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Historial de Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
                {orders.length === 0 ? (
                    <div className="text-center py-8">
                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No hay pedidos en tu historial</p>
                    </div>
                ) : (
                    <TooltipProvider>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                <tr className="border-b">
                                    <th className="py-3 px-4 text-left font-medium">Nº Pedido</th>
                                    <th className="py-3 px-4 text-left font-medium">Fecha</th>
                                    <th className="py-3 px-4 text-left font-medium">Items</th>
                                    <th className="py-3 px-4 text-left font-medium">Total</th>
                                </tr>
                                </thead>
                                <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id} className="border-b hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className="font-medium text-gray-900">
                                                    #{order.id.slice(-8)}
                                                </div>
                                                {order.status !== 'synced_with_erp' && (
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            {getStatusIcon(order.status)}
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>{getStatusText(order.status)}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="text-gray-900">
                                                {formatDate(order.createdAt)}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-1 text-gray-600">
                                                <Package className="w-4 h-4" />
                                                {order.items.length} items
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="font-semibold text-gray-900">
                                                {formatCurrency(order.totalAmount)}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </TooltipProvider>
                )}
            </CardContent>
        </Card>
    );
};

export default OrderHistory;