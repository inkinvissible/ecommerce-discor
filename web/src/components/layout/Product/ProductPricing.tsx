import { formatPrice } from "@/utils/formatPrice";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import clsx from "clsx";

interface priceBreakdown {
    priceBreakdown: {
        listPrice: number;
        discountedPrice: number;
        finalPrice: number;
        discountPercentage: number;
        markupPercentage: number;
        hasVat: boolean;
    };
}

const ProductPricing = ({ priceBreakdown }: priceBreakdown) => {
    const {
        listPrice,
        discountedPrice,
        finalPrice,
        discountPercentage,
        markupPercentage,
        hasVat,
    } = priceBreakdown;

    const [showDetails, setShowDetails] = useState(true);

    const finalPriceText = () => {
        if (hasVat && markupPercentage > 0) {
            return `Precio final sugerido con IVA 21% y ganancia del ${markupPercentage}%`;
        } else if (!hasVat && markupPercentage > 0) {
            return `Precio final sugerido sin IVA y ganancia del ${markupPercentage}%`;
        } else if (hasVat && (markupPercentage === 0 || markupPercentage === undefined)) {
            return `Precio final sugerido con IVA 21%`;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-end gap-4">
                <div>
                    <p className="text-3xl font-bold text-primary">${formatPrice(finalPrice)}</p>
                    <p className="text-sm text-muted-foreground">Precio final sugerido</p>
                </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 transition-all">
                <div className="flex justify-between mb-4">
                    <h3 className="text-lg font-semibold">Desglose de precios</h3>
                    <Button onClick={() => setShowDetails((prev) => !prev)}>
                        {showDetails ? "Ocultar" : "Ver desglose"}
                    </Button>
                </div>

                {/* Siempre renderizado, controlado con clases */}
                <div
                    className={clsx(
                        "grid transition-all duration-500 ease-in-out overflow-hidden",
                        showDetails ? "grid-rows-[1fr] opacity-100 scale-y-100 max-h-[500px]" : "grid-rows-[0fr] opacity-0 scale-y-95 max-h-0"
                    )}
                    style={{ transformOrigin: "top" }}
                    aria-expanded={showDetails}
                >
                    <div className="overflow-hidden">
                        <ul className="space-y-2">
                            <li className="flex justify-between">
                                <span>Precio de lista:</span>
                                <span>${formatPrice(listPrice)}</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Precio con descuento:</span>
                                <span>${formatPrice(discountedPrice)}</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Descuento aplicado:</span>
                                <span>{discountPercentage}%</span>
                            </li>
                            <Separator />
                            <li className="flex justify-between">
                                <span>{finalPriceText()}</span>
                                <span className="text-secondary-foreground font-bold">
                  ${formatPrice(finalPrice)}
                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {discountPercentage > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-green-700 font-medium text-sm">
                        ¡Ahorrás ${formatPrice((listPrice * discountPercentage) / 100)}!
                    </p>
                </div>
            )}
        </div>
    );
};

export default ProductPricing;
