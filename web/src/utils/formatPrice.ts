/**
 * Formatea un número como precio con punto para miles y coma para decimales
 * Ejemplo: 1234.56 -> "1.234,56"
 */
export const formatPrice = (price: number): string => {
  return price.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true
  });
};

/**
 * Formatea un precio con el símbolo de moneda
 * Ejemplo: 1234.56 -> "$1.234,56"
 */
export const formatCurrency = (price: number, currency: string = '$'): string => {
  return `${currency}${formatPrice(price)}`;
};
