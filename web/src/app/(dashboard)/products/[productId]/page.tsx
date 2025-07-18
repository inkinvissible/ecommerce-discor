// src/app/(dashboard)/products/[productId]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useProduct } from '@/hooks/useProduct';
import { useCart } from '@/hooks/useCart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
    TooltipProvider,
} from '@/components/ui/tooltip';
import {
    Package,
    AlertCircle,
    ArrowLeft,
    ShoppingCart,
    AlertTriangle,
    Check,
    Minus,
    Plus
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import ProductImageZoom from "@/components/layout/Product/ProductImage";
import ProductPricing from "@/components/layout/Product/ProductPricing";

const ProductPage = () => {
    const params = useParams();
    const productId = params.productId as string;
    const { product, isLoading, isError } = useProduct(productId);
    const { addToCart, loadingItems, getProductQuantity } = useCart();
    const [quantity, setQuantity] = useState(1);

    const isAddingToCart = loadingItems.has(productId);

    if (isLoading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-32" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Skeleton className="h-96 rounded-lg" />
                    <div className="space-y-6">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/products">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver a productos
                        </Button>
                    </Link>
                </div>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Error al cargar el producto. Por favor, intenta nuevamente.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/products">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver a productos
                        </Button>
                    </Link>
                </div>
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        No se encontró el producto solicitado.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const getStockStatus = () => {
        if (product.stock === 0) {
            return {
                text: 'Sin stock',
                color: 'bg-red-50 text-red-700 border-red-200',
                icon: AlertTriangle,
                variant: 'destructive' as const
            };
        }
        if (product.stock > 0 && product.stock <= 3) {
            return {
                text: 'Pocas unidades',
                color: 'bg-amber-50 text-amber-700 border-amber-200',
                icon: Package,
                variant: 'secondary' as const
            };
        }
        return {
            text: 'Disponible',
            color: 'bg-green-50 text-green-700 border-green-200',
            icon: Check,
            variant: 'default' as const
        };
    };

    const stockStatus = getStockStatus();

    const handleQuantityChange = (change: number) => {
        const newQuantity = quantity + change;
        if (newQuantity >= 1) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCart = async () => {
        try {
            await addToCart(productId, quantity);

        } catch (error) {
            console.error('Error al agregar al carrito:', error);

        }
    };

    return (
        <TooltipProvider>
            <div className="container mx-auto p-6 space-y-6">
                {/* Header con navegación mejorado */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/products">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver a productos
                            </Button>
                        </Link>
                        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Productos</span>
                            <span>/</span>
                            <span>{product.category?.name.es}</span>
                            <span>/</span>
                            <span className="text-foreground">{product.name.es}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">

                    </div>
                </div>

                {/* Contenido principal mejorado */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Imagen del producto mejorada */}
                    <div className="space-y-4">
                        <ProductImageZoom alt={product.name.es} sku={product.sku}/>
                    </div>

                    {/* Información del producto mejorada */}
                    <div className="space-y-6">
                        {/* Título y estado */}
                        <div className="space-y-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    {product.name.es}
                                </h1>
                                <p className="text-lg text-primary">
                                    CÓDIGO: {product.sku} | Categoría: {product.category?.name.es}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <Badge
                                    variant={stockStatus.variant}
                                    className={`${stockStatus.color} px-3 py-1`}
                                >
                                    <stockStatus.icon className="h-4 w-4 mr-1" />
                                    {stockStatus.text}
                                </Badge>
                            </div>
                        </div>

                        <Separator />

                        {/* Precios mejorados */}
                        <ProductPricing priceBreakdown={product.priceBreakdown} />

                        <Separator />

                        {/* Selector de cantidad */}
                        <div className="space-y-4">
                            <h3 className="font-semibold">Cantidad</h3>
                            <p className={"text-primary"}>Actualmente tienes {getProductQuantity(productId)} en el carrito</p>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center border rounded-lg">
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => handleQuantityChange(-1)}
                                        disabled={quantity <= 1}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="px-4 py-2 min-w-[3rem] text-center">
                                        {quantity}
                                    </span>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => handleQuantityChange(1)}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Acciones mejoradas */}
                        <div className="space-y-3">
                            <Button
                                className="w-full h-12 text-lg font-semibold"
                                size="lg"
                                onClick={handleAddToCart}
                                disabled={isAddingToCart}
                            >
                                <ShoppingCart className="h-5 w-5 mr-2" />
                                {isAddingToCart ? 'Agregando...' : 'Agregar al carrito'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
};

export default ProductPage;