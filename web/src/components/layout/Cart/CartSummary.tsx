import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Cart } from "@/types/cart";
import { formatPrice } from "@/utils/formatPrice";
import { CheckoutForm } from "./CheckoutForm";
import { OrderInfo } from "@/types/order";
import { ordersService } from "@/services/orderService";
import { useProfile } from "@/hooks/useProfile";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface CartSummaryProps {
    summary: Cart['summary'];
    onOrderSuccess?: () => void;
}

export function CartSummary({ summary, onOrderSuccess }: CartSummaryProps) {
    const [showCheckout, setShowCheckout] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderResult, setOrderResult] = useState<{
        success: boolean;
        message: string;
        orderId?: string;
    } | null>(null);

    const { profile } = useProfile();

    const handleOrderSubmit = async (orderInfo: OrderInfo) => {
        setIsSubmitting(true);
        setOrderResult(null);

        try {
            // Construir el objeto de datos de la orden
            const orderData: CreateOrderRequest = {
                shippingMethod: orderInfo.type,
                shippingNotes: orderInfo.shippingNotes || ''
            };

            // Solo agregar shippingAddressId si es DELIVERY
            if (orderInfo.type === 'DELIVERY') {
                const defaultAddress = profile?.client.addresses.find(addr => addr.isDefaultShipping);
                if (defaultAddress?.id) {
                    orderData.shippingAddressId = defaultAddress.id;
                }
            }

            const response = await ordersService.createOrder(orderData);

            setOrderResult({
                success: true,
                message: response.message,
                orderId: response.order.id
            });

            // Llamar callback de éxito si existe
            if (onOrderSuccess) {
                onOrderSuccess();
            }

        } catch (error) {
            console.error('Error al crear la orden:', error);
            setOrderResult({
                success: false,
                message: 'Error al procesar el pedido. Por favor, intenta nuevamente.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBackToCart = () => {
        setShowCheckout(false);
        setOrderResult(null);
    };

    // Pantalla de resultado de la orden
    if (orderResult) {
        return (
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        {orderResult.success ? (
                            <CheckCircle className="h-16 w-16 text-green-500" />
                        ) : (
                            <AlertCircle className="h-16 w-16 text-red-500" />
                        )}
                    </div>
                    <CardTitle className={`text-2xl ${orderResult.success ? 'text-green-700' : 'text-red-700'}`}>
                        {orderResult.success ? '¡Pedido Confirmado!' : 'Error en el Pedido'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert variant={orderResult.success ? "default" : "destructive"}>
                        <AlertDescription className="text-center">
                            {orderResult.message}
                        </AlertDescription>
                    </Alert>

                    {orderResult.success && orderResult.orderId && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 text-center">
                                <strong>Número de pedido:</strong> {orderResult.orderId}
                            </p>
                        </div>
                    )}

                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span>Subtotal ({summary.totalItems} productos)</span>
                            <span>${formatPrice(summary.totalAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>IVA (21%)</span>
                            <span>${formatPrice(summary.totalAmountWithVat - summary.totalAmount)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>${formatPrice(summary.totalAmountWithVat)}</span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleBackToCart}
                        className="flex-1"
                    >
                        Volver al Carrito
                    </Button>
                    {orderResult.success && (
                        <Button
                            onClick={() => window.location.href = '/orders'}
                            className="flex-1"
                        >
                            Ver Mis Pedidos
                        </Button>
                    )}
                </CardFooter>
            </Card>
        );
    }

    // Formulario de checkout
    if (showCheckout) {
        return (
            <div className="space-y-4">
                <CheckoutForm
                    onSubmit={handleOrderSubmit}
                />
                <div className="flex justify-center">
                    <Button
                        variant="outline"
                        onClick={handleBackToCart}
                        disabled={isSubmitting}
                        className="w-full max-w-md"
                    >
                        Volver al Resumen
                    </Button>
                </div>
                {isSubmitting && (
                    <div className="flex items-center justify-center space-x-2 p-4">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-sm text-gray-600">Procesando tu pedido...</span>
                    </div>
                )}
            </div>
        );
    }

    // Resumen del carrito
    return (
        <Card>
            <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between">
                    <span>Subtotal ({summary.totalItems} productos)</span>
                    <span>${formatPrice(summary.totalAmount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                    <span>IVA (21%)</span>
                    <span>${formatPrice(summary.totalAmountWithVat - summary.totalAmount)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${formatPrice(summary.totalAmountWithVat)}</span>
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full"
                    onClick={() => setShowCheckout(true)}
                    disabled={summary.totalItems === 0}
                >
                    Finalizar Compra
                </Button>
            </CardFooter>
        </Card>
    );
}