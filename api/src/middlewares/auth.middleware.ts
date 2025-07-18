// api/src/middlewares/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserPayload } from '../types/user.payload';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Acceso denegado. No se proveyó un token válido.' });
        return; // Esto devuelve void, no Response
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        console.error("FATAL: JWT_SECRET no está definido.");
        res.status(500).json({ message: 'Error de configuración del servidor.' });
        return; // Esto devuelve void, no Response
    }

    try {
        const decodedPayload = jwt.verify(token, jwtSecret) as UserPayload;
        req.user = decodedPayload;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token inválido o expirado.' });
        return; // Esto devuelve void, no Response
    }
}