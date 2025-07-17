import { Request, Response } from 'express';
import { orderService } from '../services/orders.service';
import { GetOrdersQuery } from '../types/orders';
type ReqWithQuery = Request<{}, any, any, GetOrdersQuery>;

class OrderController {
    public async create(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.userId; // El middleware de auth ya validó que req.user existe
            const orderPayload = req.body;

            const newOrder = await orderService.createOrder(orderPayload, userId);

             res.status(201).json({
                message: 'Pedido creado con éxito. Será procesado en breve.',
                order: newOrder,
            });

        } catch (error: any) {
            // Manejo de errores específicos del servicio
            if (error.message === 'El carrito está vacío.') {
                 res.status(400).json({ message: error.message });
                 return;
            }
            if (error.message.includes('dirección de envío')) {
                 res.status(400).json({ message: error.message });
                 return;
            }

            console.error('Error al crear el pedido:', error);
             res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }

    public async getOrders(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user!.userId;

            // Usar los parámetros validados
            const queryParams = (req as any).validatedQuery || {
                page: 1,
                limit: 10
            };

            console.log('📋 Getting orders with params:', queryParams);

            const result = await orderService.getOrders(userId, queryParams);

            res.status(200).json({
                message: 'Órdenes obtenidas con éxito.',
                data: result.orders,
                pagination: result.pagination,
            });

        } catch (error: any) {
            console.error('❌ Error getting orders:', error);
            res.status(500).json({
                message: 'Error interno del servidor.',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }


}

export const orderController = new OrderController();