"use client";

import { useCart } from "@/hooks/useCart";
import { CartLoading } from "./CartLoading";
import { CartEmpty } from "./CartEmpty";
import { CartItemCard } from "./CartItemCard";
import { CartSummary } from "./CartSummary";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function CartClientPage() {
    const { cart, isLoading, error, updateItemQuantity, removeFromCart, loadingItems } = useCart();

    if (isLoading) return <CartLoading />;
    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    No se pudo cargar el carrito. Por favor, intenta de nuevo más tarde.
                </AlertDescription>
            </Alert>
        );
    }
    if (!cart || cart.items.length === 0) return <CartEmpty />;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-2 space-y-4">
                {cart.items.map((item) => (
                    <CartItemCard
                        key={item.id}
                        item={item}
                        onUpdateQuantity={updateItemQuantity}
                        onRemoveItem={removeFromCart}
                        isItemLoading={loadingItems.has(item.productId)}
                    />
                ))}
            </div>
            <div className="md:col-span-1 sticky top-24">
                <CartSummary summary={cart.summary} />
            </div>
        </div>
    );
}