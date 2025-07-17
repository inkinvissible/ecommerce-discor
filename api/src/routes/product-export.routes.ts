import { Router } from 'express';
import { exportProductsToExcel } from '../controllers/product-export.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Aplicar middleware de autenticación
router.use(authMiddleware);

// Ruta de exportación
router.get('/export/excel', exportProductsToExcel);

export default router;