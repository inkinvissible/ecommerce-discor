// src/components/layout/Cart/CartSummary.tsx (actualizado)
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Cart } from "@/types/cart";
import { formatPrice } from "@/utils/formatPrice";
import { CheckoutForm } from "./CheckoutForm";
import { OrderInfo } from "@/types/order";

interface CartSummaryProps {
    summary: Cart['summary'];
}

export function CartSummary({ summary }: CartSummaryProps) {
    const [showCheckout, setShowCheckout] = useState(false);

    const handleOrderSubmit = (orderInfo: OrderInfo) => {
        const typeText = orderInfo.type === 'PICKUP' ? 'retirar' : 'entregar';
        const urgentText = orderInfo.isUrgent ? 'URGENTE' : '';
        const dateText = orderInfo.date ? orderInfo.date.toLocaleDateString() : '';
        const timeText = orderInfo.timeOfDay ?
            orderInfo.timeOfDay === 'morning' ? 'mañana' :
                orderInfo.timeOfDay === 'afternoon' ? 'mediodía' : 'tarde' : '';
        const addressText = orderInfo.deliveryAddress ? ` en ${orderInfo.deliveryAddress}` : '';

        let message = `Pedido para ${typeText}${addressText}`;
        if (orderInfo.isUrgent) {
            message += ` - ${urgentText}`;
        } else {
            message += ` - ${dateText}`;
            if (timeText) message += ` por la ${timeText}`;
        }

        alert(message); // Reemplaza con tu lógica de envío
    };

    if (showCheckout) {
        return (
            <CheckoutForm
                onSubmit={handleOrderSubmit}
            />
        );
    }

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
                >
                    Finalizar Compra
                </Button>
            </CardFooter>
        </Card>
    );
}