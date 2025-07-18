import { prisma } from '../lib/prisma';
import {
    PriceBreakdown,
    ProductServiceError,
    DbClient,
    DbPrice,
    toNumber
} from '../types/products';

/**
 * Calcula el desglose completo de precios para un cliente específico
 */
export async function calculatePriceBreakdownForClient(
    productId: string,
    clientId: string
): Promise<PriceBreakdown> {
    // Obtener información del cliente
    const client = await prisma.client.findUnique({
        where: { id: clientId },
        include: {
            pricingConfigs: true
        }
    }) as DbClient | null;

    if (!client) {
        throw new ProductServiceError('Cliente no encontrado', 404);
    }

    // Obtener el precio base del producto según la lista de precios del cliente
    const basePrice = await prisma.price.findFirst({
        where: {
            productId: productId,
            priceListId: client.priceListId
        }
    }) as DbPrice | null;

    if (!basePrice) {
        throw new ProductServiceError('Precio no encontrado para este producto', 404);
    }

    // Convertir precios usando la función utilitaria
    const listPrice = toNumber(basePrice.price);
    const discountPercentage = toNumber(client.discountPercentage);
    const markupPercentage = client.pricingConfigs?.markupPercentage
        ? toNumber(client.pricingConfigs.markupPercentage)
        : 0;

    let discountedPrice = listPrice;
    let finalPrice = listPrice;

    // Aplicar descuento del cliente si existe
    if (discountPercentage > 0) {
        const discountAmount = listPrice * (discountPercentage / 100);
        discountedPrice = listPrice - discountAmount;
        finalPrice = discountedPrice;
    }

    // Aplicar markup personalizado si existe
    if (markupPercentage > 0) {
        const markupAmount = finalPrice * (markupPercentage / 100);
        finalPrice = finalPrice + markupAmount;
    }

    // Aplicar IVA si corresponde
    if (client.applyVat) {
        finalPrice = finalPrice * 1.21; // IVA del 21%
    }

    return {
        listPrice: Math.round(listPrice * 100) / 100,
        discountedPrice: Math.round(discountedPrice * 100) / 100,
        finalPrice: Math.round(finalPrice * 100) / 100,
        discountPercentage,
        markupPercentage,
        hasVat: client.applyVat
    };
}

/**
 * Valida que el cliente tenga una lista de precios asignada
 */
export async function validateClientPriceList(clientId: string): Promise<number> {
    const client = await prisma.client.findUnique({
        where: { id: clientId },
        select: { priceListId: true }
    });

    if (!client?.priceListId) {
        throw new ProductServiceError('Cliente no tiene lista de precios asignada', 400);
    }

    return client.priceListId;
}

/**
 * Calcula el precio final para un producto específico y cliente
 */
export async function calculateFinalPrice(
    productId: string,
    clientId: string
): Promise<number> {
    const priceBreakdown = await calculatePriceBreakdownForClient(productId, clientId);
    return priceBreakdown.finalPrice;
}

/**
 * Calcula precios para múltiples productos de forma paralela
 */
export async function calculatePricesForProducts(
    productIds: string[],
    clientId: string
): Promise<Map<string, PriceBreakdown>> {
    const pricePromises = productIds.map(async (productId) => {
        try {
            const priceBreakdown = await calculatePriceBreakdownForClient(productId, clientId);
            return [productId, priceBreakdown] as [string, PriceBreakdown];
        } catch (error) {
            // Si no se encuentra precio, usar valores por defecto
            return [productId, {
                listPrice: 0,
                discountedPrice: 0,
                finalPrice: 0,
                discountPercentage: 0,
                markupPercentage: 0,
                hasVat: false
            }] as [string, PriceBreakdown];
        }
    });

    const results = await Promise.all(pricePromises);
    return new Map(results);
}