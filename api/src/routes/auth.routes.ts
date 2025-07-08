// api/src/routes/auth.routes.ts

import { Router } from 'express';
import { loginHandler, meHandler } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login', loginHandler);
router.get('/me', authMiddleware, meHandler);

export default router;