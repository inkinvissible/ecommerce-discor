'use client';

import { useCart } from '@/hooks/useCart';
import { useOrders } from '@/hooks/useOrders';
import { useCategories } from '@/hooks/useCategories';
import SummaryCards from "@/components/layout/Dashboard/SummaryCards";
import OrderHistory from "@/components/layout/Dashboard/OrderHistory";
import CurrentCart from "@/components/layout/Dashboard/CurrentCart";
import Categories from "@/components/layout/Dashboard/Categories";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Dashboard: React.FC = () => {
    const { cart, isLoading: cartLoading, error: cartError, refetch: refetchCart } = useCart();
    const { orders, isLoading: ordersLoading, error: ordersError, mutate: refetchOrders } = useOrders({ page: 1, limit: 10 });
    const { categories, isLoading: categoriesLoading, error: categoriesError, refetch: refetchCategories } = useCategories();

    const handleRefreshAll = async () => {
        await Promise.all([
            refetchCart(),
            refetchOrders(),
            refetchCategories()
        ]);
    };

    const hasErrors = cartError || ordersError || categoriesError;
    const isLoading = cartLoading || ordersLoading || categoriesLoading;

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="container mx-auto py-6 px-4 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <Button
                    onClick={handleRefreshAll}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                >
                    <RefreshCw className="w-4 h-4" />
                    Actualizar
                </Button>
            </div>

            {hasErrors && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Error al cargar algunos datos. Por favor, intenta actualizar la página.
                    </AlertDescription>
                </Alert>
            )}

            <SummaryCards
                cart={cart}
                cartLoading={cartLoading}
                cartError={cartError}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <CurrentCart
                        cart={cart}
                        loading={cartLoading}
                        error={cartError}
                    />
                </div>
                <div>
                    <Categories
                        categories={categories}
                        loading={categoriesLoading}
                        error={categoriesError}
                    />
                </div>
            </div>

            <OrderHistory
                orders={orders}
                loading={ordersLoading}
                error={ordersError}
            />
        </div>
    );
};

const DashboardSkeleton: React.FC = () => {
    return (
        <div className="container mx-auto py-6 px-4 space-y-6">
            <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-9 w-24" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Skeleton className="h-64 lg:col-span-2" />
                <Skeleton className="h-64" />
            </div>

            <Skeleton className="h-96" />
        </div>
    );
};

export default Dashboard;