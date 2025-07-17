import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodSchema } from 'zod';

// Middleware simple que no modifica req.query
export const validate = (schema: ZodSchema, source: 'body' | 'query' = 'body') =>
    (req: Request, res: Response, next: NextFunction) => {
        try {
            const dataToValidate = source === 'body' ? req.body : req.query;

            console.log(`🔍 Validating ${source}:`, dataToValidate);

            const parsed = schema.parse(dataToValidate);

            console.log(`✅ Validation successful for ${source}:`, parsed);

            if (source === 'body') {
                req.body = parsed;
            } else {
                // Para query, solo guardamos en una propiedad custom
                (req as any).validatedQuery = parsed;
            }

            next();
        } catch (error) {
            console.error(`❌ Validation error in ${source}:`, error);

            if (error instanceof ZodError) {
                res.status(400).json({
                    message: 'Error de validación.',
                    errors: error.flatten().fieldErrors,
                });
                return;
            }

            res.status(500).json({
                message: 'Error interno del servidor.',
                error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
            });
        }
    };