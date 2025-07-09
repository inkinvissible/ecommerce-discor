// utils/stock.utils.ts

import { prisma } from '../lib/prisma';
import { DbStockLevel } from '../types/products';

/**
 * Calcula el stock total de un producto
 */
export async function calculateTotalStock(productId: string): Promise<number> {
    const stockLevels = await prisma.stockLevel.findMany({
        where: { productId }
    }) as DbStockLevel[];

    return stockLevels.reduce((total: number, level: DbStockLevel) => total + level.quantity, 0);
}