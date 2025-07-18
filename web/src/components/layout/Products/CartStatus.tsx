import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Plus, Minus } from 'lucide-react';

interface CartStatusProps {
  cartQuantity: number;
  onUpdateQuantity: (newQuantity: number) => void;
  isLoading?: boolean;
}

export const CartStatus: React.FC<CartStatusProps> = ({
  cartQuantity,
  onUpdateQuantity,
  isLoading = false
}) => {
  if (cartQuantity === 0) return null;

  const handleQuantityChange = (increment: boolean) => {
    const newQuantity = increment ? cartQuantity + 1 : cartQuantity - 1;
    onUpdateQuantity(newQuantity);
  };

  return (
    <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-200 animate-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center gap-2">
        <Check className="w-4 h-4 text-green-600" />
        <span className="text-sm font-medium text-green-800">
          {cartQuantity} en carrito
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleQuantityChange(false)}
          className="p-1 h-6 w-6 hover:bg-green-100"
          disabled={isLoading}
        >
          <Minus className="w-3 h-3" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleQuantityChange(true)}
          className="p-1 h-6 w-6 hover:bg-green-100"
          disabled={isLoading}
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};
