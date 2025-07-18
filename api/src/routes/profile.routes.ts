// src/routes/profile.routes.ts
import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
    getProfileHandler,
    getAddressesHandler,
    getOrdersHandler,
    getNotificationsHandler,
    markNotificationReadHandler
} from '../controllers/profile.controller';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

router.get('/', getProfileHandler as (req: Request, res: Response) => Promise<void>);
router.get('/addresses', getAddressesHandler as (req: Request, res: Response) => Promise<void>);
router.get('/orders', getOrdersHandler as (req: Request, res: Response) => Promise<void>);
router.get('/notifications', getNotificationsHandler as (req: Request, res: Response) => Promise<void>);
router.put('/notifications/:notificationId/read', markNotificationReadHandler as (req: Request, res: Response) => Promise<void>);

export default router;