// api/src/routes/cart.routes.ts

import { Router } from 'express';
import { getCartHandler, addItemToCartHandler, removeItemFromCartHandler } from '../controllers/cart.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// GET /api/cart - Obtener carrito actual
router.get('/', getCartHandler);

// POST /api/cart/items - Añadir/actualizar ítem en el carrito
router.post('/items', addItemToCartHandler);

// DELETE /api/cart/items/:cartItemId - Eliminar ítem del carrito
router.delete('/items/:cartItemId', removeItemFromCartHandler);

export default router;
