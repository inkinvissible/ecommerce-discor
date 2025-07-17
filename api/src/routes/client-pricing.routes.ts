import { Router } from 'express';
import {
    updateVatSetting,
    updateMarkupPercentage,
    getPricingConfig
} from '../controllers/client-pricing.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Obtener configuración de precios del cliente
router.get('/pricing-config', getPricingConfig);

// Actualizar configuración de IVA
router.patch('/vat-setting', updateVatSetting);

// Actualizar porcentaje de markup
router.patch('/markup-percentage', updateMarkupPercentage);

export default router;