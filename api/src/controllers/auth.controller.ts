// api/src/controllers/auth.controller.ts

import { Request, Response } from 'express';
import { loginUser, loginSchema } from '../services/auth.service';

export async function loginHandler(req: Request, res: Response): Promise<void> {
    console.log("Cuerpo de la solicitud en loginHandler:", req.body);
    try {
        const validatedBody = loginSchema.parse(req.body);
        const token = await loginUser(validatedBody);

        res.status(200).json({ token });
        return; // Asegura que devuelve void
    } catch (error: any) {
        if (error.name === 'ZodError') {
            res.status(400).json({ message: 'Datos de entrada inválidos', errors: error.flatten() });
            return;
        } else if (error.name === 'AuthServiceError') {
            res.status(error.statusCode).json({ message: error.message });
            return;
        } else {
            console.error("Error inesperado en loginHandler:", error);
            res.status(500).json({ message: 'Error interno del servidor.' });
            return;
        }
    }
}

// Handler para /me
export function meHandler(req: Request, res: Response): void {
    if (!req.user) {
        res.status(401).json({ message: 'No autorizado.' });
        return;
    }

    res.status(200).json(req.user);
    return; // Asegura que devuelve void
}