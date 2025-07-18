import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, Loader2, Package, Tag, Building2 } from "lucide-react";
import { CartItem } from "@/types/cart";
import Image from 'next/image';
import { formatPrice } from "@/utils/formatPrice";
import { useState } from "react";

interface CartItemCardProps {
    item: CartItem;
    onUpdateQuantity: (productId: string, newQuantity: number) => Promise<void>;
    onRemoveItem: (productId: string) => Promise<void>;
    isItemLoading: boolean;
}

export function CartItemCard({ item, onUpdateQuantity, onRemoveItem, isItemLoading }: CartItemCardProps) {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    const handleUpdateQuantity = async (newQuantity: number) => {
        if (isItemLoading) return;
        await onUpdateQuantity(item.productId, newQuantity);
    };

    const handleRemoveItem = async () => {
        if (isItemLoading) return;
        await onRemoveItem(item.productId);
    };

    const handleImageError = () => {
        setImageError(true);
        setImageLoading(false);
    };

    const handleImageLoad = () => {
        setImageLoading(false);
    };

    return (
        <Card className={`
            transition-all duration-300 hover:shadow-lg border-0 shadow-md
            ${isItemLoading ? 'opacity-70 pointer-events-none' : 'opacity-100'}
            bg-white hover:bg-gray-50/50
        `}>
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">

                    {/* Imagen del producto */}
                    <div className="relative flex-shrink-0 group">
                        <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-gray-200 group-hover:border-green-700 transition-colors duration-300">
                            {imageLoading && !imageError && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                    <Loader2 className="h-8 w-8 animate-spin text-green-700" />
                                </div>
                            )}

                            {!imageError ? (
                                <Image
                                    src={`https://discor.multisoft.ar/images/${item.product.sku}.jpg`}
                                    alt={item.product.name.es}
                                    width={128}
                                    height={128}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    onError={handleImageError}
                                    onLoad={handleImageLoad}
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-green-50 to-green-100 flex flex-col items-center justify-center">
                                    <Package className="h-12 w-12 text-green-700 mb-2" />
                                    <span className="text-xs text-green-700 font-medium text-center px-2">
                                        Imagen no disponible
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Badge de descuento */}
                        {item.priceBreakdown.discountPercentage > 0 && (
                            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                                -{item.priceBreakdown.discountPercentage}%
                            </div>
                        )}
                    </div>

                    {/* Información del producto */}
                    <div className="flex-grow space-y-3">
                        <div>
                            <h3 className="font-bold text-xl text-gray-800 mb-2 leading-tight">
                                {item.product.name.es}
                            </h3>

                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                    <Tag className="h-4 w-4 text-green-700" />
                                    <span className="font-medium">SKU:</span>
                                    <span className="bg-gray-100 px-2 py-1 rounded-md font-mono">
                                        {item.product.sku}
                                    </span>
                                </div>

                                <div className="flex items-center gap-1">
                                    <Building2 className="h-4 w-4 text-green-700" />
                                    <span className="font-medium">Marca:</span>
                                    <span className="bg-green-50 text-green-800 px-2 py-1 rounded-md font-medium">
                                        {item.product.brand.name.es}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Controles de cantidad */}
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-700">Cantidad:</span>

                            <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleUpdateQuantity(item.quantity - 1)}
                                    disabled={isItemLoading || item.quantity <= 1}
                                    className="h-10 w-10 p-0 hover:bg-green-50 hover:text-green-700 disabled:opacity-50"
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>

                                <div className="w-16 h-10 flex items-center justify-center border-x-2 border-gray-200 bg-gray-50">
                                    {isItemLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-green-700" />
                                    ) : (
                                        <span className="font-bold text-lg text-gray-800">{item.quantity}</span>
                                    )}
                                </div>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleUpdateQuantity(item.quantity + 1)}
                                    disabled={isItemLoading}
                                    className="h-10 w-10 p-0 hover:bg-green-50 hover:text-green-700 disabled:opacity-50"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Sección de precio y acciones */}
                    <div className="flex flex-col items-end gap-4 min-w-[160px]">
                        <div className="text-right">
                            <div className="space-y-1">
                                <p className="text-2xl font-bold text-green-700">
                                    Costo: ${formatPrice(item.priceBreakdown.discountedPrice)}
                                </p>

                                {item.priceBreakdown.discountPercentage > 0 && (
                                    <div className="space-y-1">
                                        <p className="text-sm text-gray-500 line-through">
                                            ${formatPrice(item.priceBreakdown.listPrice)}
                                        </p>
                                        <p className="text-xs text-green-600 font-medium">
                                            Ahorro: ${formatPrice(item.priceBreakdown.listPrice - item.priceBreakdown.discountedPrice)}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="text-xs text-gray-500 mt-2">
                                Total: ${formatPrice(item.priceBreakdown.discountedPrice * item.quantity)}
                            </div>
                        </div>

                        {/* Botón de eliminar */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="
                                text-red-500 hover:text-red-600 hover:bg-red-50
                                transition-all duration-200 group
                                border border-red-200 hover:border-red-300
                            "
                            onClick={handleRemoveItem}
                            disabled={isItemLoading}
                        >
                            <Trash2 className="h-4 w-4 mr-2 group-hover:animate-pulse" />
                            Eliminar
                        </Button>
                    </div>
                </div>

                {/* Barra de carga global cuando está procesando */}
                {isItemLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg">
                        <div className="flex items-center gap-2 text-green-700">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span className="font-medium">Procesando...</span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}