// api/src/controllers/cart.controller.ts

import { Request, Response } from 'express';
import { getUserCart, addItemToCart, removeItemFromCart } from '../services/cart.service';
import { addItemToCartSchema, removeCartItemParamsSchema } from "../schemas/cart";

export async function getCartHandler(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.user!.userId;
        const clientId = req.user!.clientId;

        const cart = await getUserCart(userId, clientId);

        res.status(200).json(cart);
    } catch (error: any) {
        console.error("Error en getCartHandler:", error);
        
        if (error.name === 'CartServiceError') {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }
}

export async function addItemToCartHandler(req: Request, res: Response): Promise<void> {
    try {
        // Validar body
        console.log("Datos recibidos en addItemToCartHandler:", req.body);
        const bodyValidation = addItemToCartSchema.safeParse(req.body);
        console.log("Validación del body:", bodyValidation);
        if (!bodyValidation.success) {
            res.status(400).json({ 
                message: 'Datos de entrada inválidos', 
                errors: bodyValidation.error.flatten() 
            });
            return;
        }

        const { productId, quantity } = bodyValidation.data;
        const userId = req.user!.userId;
        const clientId = req.user!.clientId;

        const updatedCart = await addItemToCart(userId, clientId, productId, quantity);

        res.status(200).json(updatedCart);
    } catch (error: any) {
        console.error("Error en addItemToCartHandler:", error);
        
        if (error.name === 'CartServiceError') {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }
}

export async function removeItemFromCartHandler(req: Request, res: Response): Promise<void> {
    try {
        // Validar params
        const paramsValidation = removeCartItemParamsSchema.safeParse(req.params);
        if (!paramsValidation.success) {
            res.status(400).json({
                message: 'ID de item del carrito inválido',
                errors: paramsValidation.error.flatten()
            });
            return;
        }

        const { cartItemId } = paramsValidation.data;
        const userId = req.user!.userId;
        const clientId = req.user!.clientId;

        const updatedCart = await removeItemFromCart(userId, clientId, cartItemId);

        res.status(200).json(updatedCart);
    } catch (error: any) {
        console.error("Error en removeItemFromCartHandler:", error);

        if (error.name === 'CartServiceError') {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }
}
