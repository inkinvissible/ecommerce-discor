import express from 'express';
import { serverLogger, logRequest } from './lib/logger';
import authRoutes from "./routes/auth.routes";
import productsRoutes from "./routes/products.routes";
import cartRoutes from "./routes/cart.routes";
import {orderRoutes} from "./routes/orders.routes";
import clientPricingRoutes from "./routes/client-pricing.routes";
import {startBoss} from "./lib/queue";
import profileRoutes from "./routes/profile.routes";
const app = express();
const cors = require('cors');
const port = process.env.PORT || 4000;
app.use(express.json());

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));


console.log('=============== API STARTUP ===============');
console.log(`[ENV CHECK] DATABASE_URL: ${process.env.DATABASE_URL}`);
console.log('=========================================');

// Middleware para logging de requests
app.use((req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        logRequest(req, res, duration);
    });

    next();
});

async function startServer() {
    try {
        await startBoss();
        app.listen(port, () => {
            serverLogger.info({ port }, `Servidor escuchando en http://localhost:${port}`);
        });
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
}


app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/configuration', clientPricingRoutes)
app.use('/api/profile', profileRoutes);

startServer();