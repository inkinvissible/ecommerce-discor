import { prisma } from '../lib/prisma';
import { CartServiceError } from '../types/cart';

/**
 * Actualiza la configuración de IVA para un cliente
 */
export async function updateClientVatSetting(
    clientId: string,
    hasVat: boolean
): Promise<void> {
    const client = await prisma.client.findUnique({
        where: { id: clientId }
    });

    if (!client) {
        throw new CartServiceError('Cliente no encontrado', 404);
    }

    await prisma.client.update({
        where: { id: clientId },
        data: { applyVat: hasVat }
    });
}

/**
 * Actualiza el porcentaje de markup para un cliente
 */
export async function updateClientMarkupPercentage(
    clientId: string,
    markupPercentage: number
): Promise<void> {
    if (markupPercentage < 0 || markupPercentage > 100) {
        throw new CartServiceError('El porcentaje de markup debe estar entre 0 y 100', 400);
    }

    const client = await prisma.client.findUnique({
        where: { id: clientId },
        include: { pricingConfigs: true }
    });

    if (!client) {
        throw new CartServiceError('Cliente no encontrado', 404);
    }

    // Si existe configuración de precios, actualizar; sino, crear
    if (client.pricingConfigs) {
        await prisma.clientPricingConfig.update({
            where: { clientId: clientId },
            data: { markupPercentage }
        });
    } else {
        await prisma.clientPricingConfig.create({
            data: {
                clientId: clientId,
                markupPercentage
            }
        });
    }
}

/**
 * Obtiene la configuración de precios de un cliente
 */
export async function getClientPricingConfig(clientId: string): Promise<{
    hasVat: boolean;
    markupPercentage: number;
    discountPercentage: number;
}> {
    const client = await prisma.client.findUnique({
        where: { id: clientId },
        include: { pricingConfigs: true }
    });

    if (!client) {
        throw new CartServiceError('Cliente no encontrado', 404);
    }

    return {
        hasVat: client.applyVat,
        markupPercentage: client.pricingConfigs?.markupPercentage?.toNumber() || 0,
        discountPercentage: client.discountPercentage.toNumber()
    };
}