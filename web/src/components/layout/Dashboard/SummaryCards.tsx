import { Receipt, ShoppingCart, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Cart } from "@/types/cart";

interface SummaryCardsProps {
    cart?: Cart;
    cartLoading: boolean;
    cartError?: Error;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ cart, cartLoading, cartError }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount);
    };
    const summaryData = [
        {
            title: "Total del Carrito",
            value: cartLoading
                ? "Cargando..."
                : cartError
                    ? "Error"
                    : formatCurrency(cart?.summary?.totalAmountWithVat || 0),
            icon: Receipt,
            iconColor: "text-green-600",
            bgIconColor: "bg-green-100",
            loading: cartLoading,
            error: cartError
        },
        {
            title: "Items en el Carrito",
            value: cartLoading
                ? "Cargando..."
                : cartError
                    ? "Error"
                    : (cart?.summary.totalItems || 0).toString(),
            icon: ShoppingCart,
            iconColor: "text-blue-600",
            bgIconColor: "bg-blue-100",
            loading: cartLoading,
            error: cartError
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summaryData.map((card, index) => {
                const IconComponent = card.icon;
                return (
                    <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                {card.title}
                            </CardTitle>
                            <div className={`p-2 rounded-full ${card.error ? 'bg-red-100' : card.bgIconColor}`}>
                                {card.error ? (
                                    <AlertCircle className="w-5 h-5 text-red-600" />
                                ) : (
                                    <IconComponent className={`w-5 h-5 ${card.iconColor}`} />
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {card.loading ? (
                                <Skeleton className="h-8 w-24" />
                            ) : (
                                <div className={`text-2xl font-bold ${card.error ? 'text-red-600' : 'text-gray-900'}`}>
                                    {card.value}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};

export default SummaryCards;