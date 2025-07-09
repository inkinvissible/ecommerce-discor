import express from 'express';
import { serverLogger, logRequest } from './lib/logger';
import authRoutes from "./routes/auth.routes";
import productsRoutes from "./routes/products.routes";
import cartRoutes from "./routes/cart.routes";

const app = express();
const port = process.env.PORT || 4000;
app.use(express.json());

// Middleware para logging de requests
app.use((req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        logRequest(req, res, duration);
    });

    next();
});

app.get('/', (req, res) => {
    res.send('Hola Mundo');
});

app.listen(port, () => {
    serverLogger.info({ port }, `Servidor escuchando en http://localhost:${port}`);
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/cart', cartRoutes);
