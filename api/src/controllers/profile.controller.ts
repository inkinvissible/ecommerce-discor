// src/controllers/profile.controller.ts
import { Request, Response } from 'express';
import { ProfileService } from '../services/profile.service';
import { UserPayload } from '../types/user.payload';

interface AuthenticatedRequest extends Request {
    user: UserPayload;
}

export const getProfileHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const profile = await ProfileService.getUserProfile(req.user.userId);

        if (!profile) {
            res.status(404).json({ error: 'Usuario no encontrado' });
            return;
        }

        res.json(profile);
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const getAddressesHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const addresses = await ProfileService.getUserAddresses(req.user.userId);
        res.json(addresses);
    } catch (error) {
        console.error('Error al obtener direcciones:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const getOrdersHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const result = await ProfileService.getUserOrders(req.user.userId, page, limit);
        res.json(result);
    } catch (error) {
        console.error('Error al obtener pedidos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const getNotificationsHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const unreadOnly = req.query.unread === 'true';
        const notifications = await ProfileService.getUserNotifications(req.user.userId, unreadOnly);
        res.json(notifications);
    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

export const markNotificationReadHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { notificationId } = req.params;
        await ProfileService.markNotificationAsRead(notificationId, req.user.userId);
        res.json({ success: true });
    } catch (error) {
        console.error('Error al marcar notificación como leída:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};