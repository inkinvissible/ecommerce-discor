// api/src/controllers/products.controller.ts

import { Request, Response } from 'express';
import { getProductsList, getProductById, processSearchParams, getCategoriesList } from '../services/products.service';
import { getProductsQuerySchema, getProductParamsSchema } from '../schemas/products';


export async function getProductsHandler(req: Request, res: Response): Promise<void> {
    try {
        // Validar query params
        const queryValidation = getProductsQuerySchema.safeParse(req.query);
        if (!queryValidation.success) {
            res.status(400).json({
                message: 'Parámetros de consulta inválidos',
                errors: queryValidation.error.flatten()
            });
            return;
        }

        const { page, limit, search, categoryIds } = queryValidation.data;
        const clientId = req.user!.clientId;

        // Procesar el parámetro de búsqueda usando la nueva función
        const processedSearch = processSearchParams(search);

        const result = await getProductsList({
            clientId,
            page,
            limit,
            search: processedSearch,
            categoryIds
        });

        res.status(200).json(result);
    } catch (error: any) {
        console.error("Error en getProductsHandler:", error);

        if (error.name === 'ProductServiceError') {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }
}

export async function getProductByIdHandler(req: Request, res: Response): Promise<void> {
    try {
        console.log('req.params:', req.params);
        // Validar params
        const paramsValidation = getProductParamsSchema.safeParse(req.params);
        if (!paramsValidation.success) {
            res.status(400).json({
                message: 'ID de producto inválido',
                errors: paramsValidation.error.flatten()
            });
            return;
        }

        const { productId } = paramsValidation.data;
        const clientId = req.user!.clientId;

        const product = await getProductById(productId, clientId);

        if (!product) {
            res.status(404).json({ message: 'Producto no encontrado' });
            return;
        }

        res.status(200).json(product);
    } catch (error: any) {
        console.error("Error en getProductByIdHandler:", error);

        if (error.name === 'ProductServiceError') {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }
}
export async function getCategoriesHandler(req: Request, res: Response): Promise<void> {
    try {
        const clientId = req.user!.clientId;
        const categories = await getCategoriesList(clientId);

        res.status(200).json(categories);
    } catch (error: any) {
        console.error("Error en getCategoriesHandler:", error);

        if (error.name === 'ProductServiceError') {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }
}