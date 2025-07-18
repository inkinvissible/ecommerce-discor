import React, {useState} from 'react';
import {Card, CardContent, CardFooter} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip';
import {Info, AlertTriangle, Package, Check} from 'lucide-react';
import {Product} from '@/types/product';
import {useCart} from '@/hooks/useCart';
import {QuantityControls} from './QuantityControls';
import {CartStatus} from './CartStatus';
import Image from 'next/image';
import Link from 'next/link';
import {formatPrice} from "@/utils/formatPrice";

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({product}) => {
    const {addToCart, updateItemQuantity, getProductQuantity, isLoading} = useCart();
    const [quantity, setQuantity] = useState(1);
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    const cartQuantity = getProductQuantity(product.id);
    const hasStock = product.stock > 0;

    const handleAddToCart = async () => {
        if (isAddingToCart) return;
        setIsAddingToCart(true);
        try {
            await addToCart(product.id, quantity);
            setQuantity(1); // Reset quantity after adding
        } catch (error) {
            console.error('Error adding to cart:', error);
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleUpdateCartQuantity = async (newQuantity: number) => {
        try {
            await updateItemQuantity(product.id, newQuantity);
        } catch (error) {
            console.error('Error updating cart quantity:', error);
        }
    };

    const getStockStatus = () => {
        if (product.stock === 0) {
            return {text: 'Sin stock', color: 'bg-red-50 text-red-700 border-red-200', icon: AlertTriangle};
        }
        if (product.stock > 0 && product.stock <= 3) {
            return {text: 'Pocas unidades', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Package};
        }
        return {text: 'Disponible', color: 'bg-green-50 text-green-700 border-green-200', icon: Check};
    };

    const stockStatus = getStockStatus();
    const imageUrl = `https://discor.multisoft.ar/images/${product.sku}.jpg`;
    const StockIcon = stockStatus.icon;

    return (
        <TooltipProvider>
            {/* El Card ahora es el contenedor principal que usa flex-col */}
            <Card
                className="group hover:shadow-xl transition-all duration-300 border-gray-200 hover:border-gray-300 h-full flex flex-col bg-white">

                {/* 1. El Link ahora solo envuelve el contenido clickeable */}
                <Link href={`/products/${product.id}`} className="flex-1">
                    <CardContent className="p-4">
                        <div className="space-y-3">
                            {/* Product Image */}
                            <div className="relative w-full h-48 overflow-hidden rounded-lg mb-3 bg-gray-50">
                                <Image
                                    src={imageUrl}
                                    alt={product.name.es}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 300px"
                                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                                />
                                {cartQuantity > 0 && (
                                    <div
                                        className="absolute top-2 right-2 bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg animate-in zoom-in-50 duration-300">
                                        {cartQuantity}
                                    </div>
                                )}
                            </div>

                            {/* SKU and Stock Status */}
                            <div className="flex justify-between items-start gap-2">
                                <div className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded">
                                    {product.sku}
                                </div>
                                <Badge
                                    className={`text-xs font-medium border ${stockStatus.color} flex items-center gap-1`}>
                                    <StockIcon className="w-3 h-3"/>
                                    {stockStatus.text}
                                </Badge>
                            </div>

                            {/* Product Name */}
                            <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
                                {product.name.es}
                            </h3>

                            {/* Brand and Category */}
                            <div className="flex flex-col gap-2 pt-1">
                                {/* Brand Badge */}
                                {product.brand && (
                                    <div className="flex">
                                        <Badge
                                            variant="secondary"
                                            className="text-xs bg-blue-50 text-blue-700 border-blue-200 max-w-full"
                                        >
                                            <span className="truncate">{product.brand.name.es}</span>
                                        </Badge>
                                    </div>
                                )}

                                {/* Category Badge */}
                                {product.category && (
                                    <div className="flex">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs bg-purple-100 text-gray-600 border-gray-200 max-w-full cursor-help"
                                                >
                                                    <span className="truncate">{product.category.name.es}</span>
                                                </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="text-sm">{product.category.name.es}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                )}
                            </div>

                            {/* Price with Breakdown */}
                            <div className="space-y-2 pt-2">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div
                                                    className="text-2xl font-bold text-gray-900 flex items-center gap-2 cursor-help">
                                                    ${formatPrice(product.priceBreakdown.finalPrice)}
                                                    <Info
                                                        className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors"/>
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="w-64 p-4 bg-white">
                                                <TooltipContent side="top" className="w-64 p-4 bg-white">

                                                    <div className="space-y-3">

                                                        <div className="font-semibold text-gray-900 border-b pb-2">

                                                            Desglose de precios

                                                        </div>

                                                        <div className="space-y-2 text-sm">

                                                            <div className="flex justify-between">

                                                                <span className="text-gray-600">Precio de lista:</span>

                                                                <span
                                                                    className="font-medium text-primary">${formatPrice(product.priceBreakdown.listPrice)}</span>

                                                            </div>

                                                            {product.priceBreakdown.discountPercentage > 0 && (

                                                                <div className="flex justify-between text-red-600">

                                                                    <span>Descuento ({product.priceBreakdown.discountPercentage}%):</span>

                                                                    <span
                                                                        className="font-medium">-${formatPrice(product.priceBreakdown.listPrice - product.priceBreakdown.discountedPrice)}</span>

                                                                </div>

                                                            )}

                                                            {product.priceBreakdown.markupPercentage > 0 && (

                                                                <div className="flex justify-between text-green-600">

                                                                    <span>Ganancia ({product.priceBreakdown.markupPercentage}%):</span>

                                                                    <span
                                                                        className="font-medium">+${formatPrice(product.priceBreakdown.discountedPrice * (product.priceBreakdown.markupPercentage / 100))}</span>

                                                                </div>

                                                            )}

                                                            {product.priceBreakdown.hasVat && (

                                                                <div className="flex justify-between text-gray-600">
                                                                    <span>IVA 21%:</span>
                                                                    <span
                                                                        className="font-medium">+${formatPrice(product.priceBreakdown.discountedPrice * (product.priceBreakdown.markupPercentage > 0 ? (product.priceBreakdown.markupPercentage / 100) : 1) * 0.21)}</span>
                                                                </div>
                                                            )}

                                                            <div
                                                                className="flex justify-between font-bold text-base border-t pt-2 text-green-600">
                                                                <span>Precio final:</span>
                                                                <span>${formatPrice(product.priceBreakdown.finalPrice)}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                </TooltipContent>
                                            </TooltipContent>
                                        </Tooltip>
                                        {product.priceBreakdown.hasVat && (
                                            <div className="text-xs text-gray-500">
                                                IVA incluido
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Link>

                {/* 2. El CardFooter ahora está FUERA del Link */}
                <CardFooter className="p-4 pt-0 mt-auto">
                    <div className="flex flex-col gap-3 w-full">
                        {/* Quantity Controls and Add to Cart */}
                        <QuantityControls
                            quantity={quantity}
                            onQuantityChange={setQuantity}
                            onAddToCart={handleAddToCart}
                            isLoading={isAddingToCart}
                            hasStock={hasStock}
                            disabled={isLoading}
                        />

                        {/* Cart Status */}
                        <CartStatus
                            cartQuantity={cartQuantity}
                            onUpdateQuantity={handleUpdateCartQuantity}
                            isLoading={isLoading}
                        />
                    </div>
                </CardFooter>
            </Card>
        </TooltipProvider>
    );
};

export default ProductCard;