import { PrismaClient } from '@prisma/client';
import { dbLogger, logDbOperation, logError } from './logger';

export const prisma = new PrismaClient({
    log: [
        { level: 'query', emit: 'event' },
        { level: 'info', emit: 'event' },
        { level: 'warn', emit: 'event' },
        { level: 'error', emit: 'event' },
    ],
});

// Configurar event listeners para logging estructurado
prisma.$on('query', (e: any) => {
    logDbOperation('query', undefined, e.duration, undefined);
    dbLogger.debug({
        query: e.query,
        params: e.params,
        duration: `${e.duration}ms`,
        target: e.target
    }, 'Database Query');
});

prisma.$on('info', (e: any) => {
    dbLogger.info({ message: e.message, target: e.target }, 'Database Info');
});

prisma.$on('warn', (e: any) => {
    dbLogger.warn({ message: e.message, target: e.target }, 'Database Warning');
});

prisma.$on('error', (e: any) => {
    const error = new Error(e.message);
    logError(error, { target: e.target, context: 'Prisma Event' });
});

// Middleware para logging de operaciones
prisma.$use(async (params: any, next: any) => {
    const start = Date.now();
    const { model, action } = params;

    try {
        const result = await next(params);
        const duration = Date.now() - start;

        logDbOperation(`${action}`, model, duration);

        return result;
    } catch (error) {
        const duration = Date.now() - start;
        logDbOperation(`${action}`, model, duration, error as Error);
        throw error;
    }
});