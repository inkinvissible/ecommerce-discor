import { Request, Response } from 'express';
import {
    updateClientVatSetting,
    updateClientMarkupPercentage,
    getClientPricingConfig
} from '../services/client-pricing.service';
import { CartServiceError } from '../types/cart';

/**
 * Actualiza la configuración de IVA del cliente
 */
export async function updateVatSetting(req: Request, res: Response): Promise<void> {
    try {
        const clientId = req.user?.clientId;

        if (!clientId) {
            res.status(403).json({
                error: 'No tiene permisos para esta operación'
            });
            return;
        }
        const { hasVat } = req.body;

        if (typeof hasVat !== 'boolean') {
            res.status(400).json({
                error: 'El campo hasVat debe ser un valor booleano'
            });
            return;
        }

        await updateClientVatSetting(clientId, hasVat);

        res.json({
            message: 'Configuración de IVA actualizada correctamente',
            hasVat
        });
    } catch (error) {
        if (error instanceof CartServiceError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
}

/**
 * Actualiza el porcentaje de markup del cliente
 */
export async function updateMarkupPercentage(req: Request, res: Response): Promise<void> {
    try {
        const clientId = req.user?.clientId;

        if (!clientId) {
            res.status(403).json({
                error: 'No tiene permisos para esta operación'
            });
            return;
        }
        const { markupPercentage } = req.body;

        if (typeof markupPercentage !== 'number' || isNaN(markupPercentage)) {
            res.status(400).json({
                error: 'El campo markupPercentage debe ser un número válido'
            });
            return;
        }

        await updateClientMarkupPercentage(clientId, markupPercentage);

        res.json({
            message: 'Porcentaje de markup actualizado correctamente',
            markupPercentage
        });
    } catch (error) {
        if (error instanceof CartServiceError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
}

/**
 * Obtiene la configuración de precios del cliente
 */
export async function getPricingConfig(req: Request, res: Response): Promise<void> {
    try {
        const clientId = req.user?.clientId;

        if (!clientId) {
            res.status(403).json({
                error: 'No tiene permisos para esta operación'
            });
            return;
        }
        const config = await getClientPricingConfig(clientId);

        res.json(config);
    } catch (error) {
        if (error instanceof CartServiceError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
}