import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { orderController } from '../controllers/orders.controller';
import { createOrderSchema, getOrdersSchema } from '../schemas/orders';

const router = Router();

router.post(
    '/',
    authMiddleware,                 // 1. Asegura que el usuario esté autenticado
    validate(createOrderSchema, 'body'),    // 2. Valida el body de la request
    orderController.create          // 3. Pasa al controlador si todo está bien
);

router.get(
    '/',
    authMiddleware,
    validate(getOrdersSchema, 'query'), // 1. Valida los parámetros de consulta
    orderController.getOrders
);

export const orderRoutes = router;