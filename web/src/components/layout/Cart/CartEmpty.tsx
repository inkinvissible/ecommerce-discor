// src/features/cart/components/CartEmpty.tsx
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CartEmpty() {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
            <ShoppingCart className="h-16 w-16 mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">Tu carrito está vacío</h2>
            <p className="mb-4 text-muted-foreground">
                Parece que aún no has añadido ningún producto.
            </p>
            <Button asChild>
                <Link href="/products">Continuar Comprando</Link>
            </Button>
        </div>
    );
}