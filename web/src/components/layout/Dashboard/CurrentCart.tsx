import { Cart } from "@/types/cart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ShoppingCart } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CurrentCartProps {
    cart?: Cart;
    loading: boolean;
    error?: Error;
}

const CurrentCart: React.FC<CurrentCartProps> = ({ cart, loading, error }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Carrito Actual</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="flex justify-between items-center p-3 border rounded">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
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
                    <CardTitle className="text-lg font-semibold">Carrito Actual</CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Error al cargar el carrito. Por favor, intenta nuevamente.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Carrito Actual</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Tu carrito está vacío</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Carrito Actual</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="max-h-64 overflow-y-auto mb-4">
                    <div className="space-y-2">
                        {cart.items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center p-3 border rounded hover:bg-gray-50 transition-colors">
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">{item.product.name.es}</h4>
                                    <p className="text-sm text-gray-600">
                                        {item.product.brand.name.es} • {item.product.category.name.es}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Cantidad: {item.quantity}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-gray-900">
                                        {formatCurrency(item.subtotal)}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {formatCurrency(item.priceBreakdown.discountedPrice)} c/u
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="border-t pt-4">
                    <div className="flex justify-between items-center font-semibold text-lg">
                        <span>Total sin IVA:</span>
                        <span>{formatCurrency(cart.summary.totalAmount)}</span>
                    </div>

                    <div className="text-sm text-gray-600 mt-1">
                        {cart.summary.totalItems} items en total
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default CurrentCart;