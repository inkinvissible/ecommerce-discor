import express from 'express';
import { serverLogger, logRequest } from './lib/logger';

const app = express();
const port = process.env.PORT || 4000;

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