import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Minus, ShoppingCart, Loader2 } from 'lucide-react';

interface QuantityControlsProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
  isLoading?: boolean;
  hasStock: boolean;
  disabled?: boolean;
}

export const QuantityControls: React.FC<QuantityControlsProps> = ({
  quantity,
  onQuantityChange,
  onAddToCart,
  isLoading = false,
  hasStock,
  disabled = false
}) => {
  const handleQuantityInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      const numValue = parseInt(value) || 1;
      if (numValue > 0) {
        onQuantityChange(numValue);
      }
    }
  };

  const adjustQuantity = (increment: boolean) => {
    const newQuantity = increment ? quantity + 1 : quantity - 1;
    if (newQuantity > 0) {
      onQuantityChange(newQuantity);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Quantity Input */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => adjustQuantity(false)}
          className="p-2 h-9 w-9 transition-all duration-200 hover:scale-105"
          disabled={quantity <= 1 || disabled}
        >
          <Minus className="w-4 h-4" />
        </Button>

        <Input
          type="number"
          value={quantity}
          onChange={handleQuantityInput}
          className="flex-1 text-center font-medium h-9 transition-all duration-200 hover:border-primary focus:border-primary"
          min="1"
          disabled={disabled}
        />

        <Button
          size="sm"
          variant="outline"
          onClick={() => adjustQuantity(true)}
          className="p-2 h-9 w-9 transition-all duration-200 hover:scale-105"
          disabled={disabled}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Add to Cart Button */}
      <Button
        onClick={onAddToCart}
        disabled={isLoading || disabled}
        className="w-full gap-2 h-10 transition-all duration-200 hover:scale-105"
        variant={!hasStock ? "secondary" : "default"}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ShoppingCart className="w-4 h-4" />
        )}
        {!hasStock ? 'Pedir sin stock' : 'Agregar al carrito'}
      </Button>
    </div>
  );
};
