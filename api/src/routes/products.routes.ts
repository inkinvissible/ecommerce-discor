// api/src/routes/products.routes.ts

import { Router } from 'express';
import { getProductsHandler, getCategoriesHandler, getProductByIdHandler } from '../controllers/products.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import productExportRoutes from "./product-export.routes";

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

router.get('/categories', getCategoriesHandler);

// GET /api/products - Listar productos con paginación y búsqueda
router.get('/', getProductsHandler);

// GET /api/products/:productId - Obtener detalle de un producto
router.get('/:productId', getProductByIdHandler);
router.use('/', productExportRoutes)

export default router;
