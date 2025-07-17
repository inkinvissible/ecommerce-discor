import CartClientPage from "@/components/layout/Cart/CartClientPage";

export default function CartPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Tu Carrito</h1>
            <CartClientPage />
        </div>
    );
}