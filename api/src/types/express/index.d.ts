// src/types/express/index.d.ts

import { UserPayload } from '../user.payload';

declare global {
    namespace Express {
        export interface Request {
            /**
             * El payload decodificado del JWT, inyectado por authMiddleware.
             */
            user?: UserPayload;
        }
    }
}

export {};
