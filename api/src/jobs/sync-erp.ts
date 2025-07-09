// api/src/jobs/sync-erp.ts
import 'dotenv/config'; // ¡Importante! Carga las variables de .env
import {prisma} from '../lib/prisma';
import {logJobExecution, jobLogger, logError, serverLogger} from '../lib/logger';

// Importa tus módulos de sincronización
// import {syncClients} from './sync/syncClients';
import { syncProducts } from './sync/syncProducts';
import { syncStock } from './sync/syncStock';

// Función para ejecutar un job individual con logging
async function executeJob(jobName: string, jobFunction: () => Promise<void>) {
    const startTime = Date.now();
    logJobExecution(jobName, 'start');

    try {
        await jobFunction();
        const duration = Date.now() - startTime;
        logJobExecution(jobName, 'success', duration);
        return {success: true, duration};
    } catch (error) {
        const duration = Date.now() - startTime;
        logJobExecution(jobName, 'error', duration, error as Error);
        logError(error as Error, {context: `Job execution: ${jobName}`});
        return {success: false, duration, error};
    }
}

async function main() {
    const overallStartTime = Date.now();
    const jobResults: Array<{ name: string; success: boolean; duration: number; error?: any }> = [];

    jobLogger.info('============================================');
    jobLogger.info('=== INICIO DEL PROCESO DE SINCRONIZACIÓN ===');
    jobLogger.info('============================================');

    serverLogger.info({
        timestamp: new Date().toISOString(),
        processId: process.pid,
        nodeVersion: process.version,
        platform: process.platform
    }, 'Starting ERP synchronization process');

    try {
        // Lista de jobs a ejecutar en secuencia
        const jobs = [
            //{ name: 'syncClients', fn: syncClients },
            {name: 'syncProducts', fn: syncProducts},
            {name: 'syncStock', fn: syncStock},
            // { name: 'syncPrices', fn: syncPrices },
        ];

        jobLogger.info({totalJobs: jobs.length}, 'Jobs programados para ejecución');

        // Ejecuta los trabajos en secuencia
        for (let i = 0; i < jobs.length; i++) {
            const job = jobs[i];
            jobLogger.info({
                jobName: job.name,
                jobIndex: i + 1,
                totalJobs: jobs.length
            }, `Ejecutando job ${i + 1} de ${jobs.length}`);

            const result = await executeJob(job.name, job.fn);
            jobResults.push({
                name: job.name,
                success: result.success,
                duration: result.duration,
                error: result.error
            });

            // Log del resultado del job individual
            if (result.success) {
                jobLogger.info({
                    jobName: job.name,
                    duration: `${result.duration}ms`,
                    status: 'completed'
                }, `Job ${job.name} completado exitosamente`);
            } else {
                jobLogger.error({
                    jobName: job.name,
                    duration: `${result.duration}ms`,
                    status: 'failed',
                    error: (result.error as Error)?.message
                }, `Job ${job.name} falló`);
            }
        }

        // Calcular métricas finales
        const totalDuration = Date.now() - overallStartTime;
        const successfulJobs = jobResults.filter(r => r.success).length;
        const failedJobs = jobResults.filter(r => !r.success).length;
        const successRate = (successfulJobs / jobResults.length * 100).toFixed(2);

        const summaryMetrics = {
            totalJobs: jobResults.length,
            successfulJobs,
            failedJobs,
            successRate: `${successRate}%`,
            totalDuration: `${(totalDuration / 1000).toFixed(2)}s`,
            averageJobDuration: `${(jobResults.reduce((acc, r) => acc + r.duration, 0) / jobResults.length).toFixed(0)}ms`,
            jobResults: jobResults.map(r => ({
                name: r.name,
                success: r.success,
                duration: `${r.duration}ms`
            }))
        };

        if (failedJobs > 0) {
            jobLogger.warn(summaryMetrics, 'Proceso de sincronización completado con algunos errores');
        } else {
            jobLogger.info(summaryMetrics, 'Proceso de sincronización completado exitosamente');
        }

    } catch (error) {
        const totalDuration = Date.now() - overallStartTime;
        logError(error as Error, {
            context: 'ERP synchronization process - Critical failure',
            duration: `${totalDuration}ms`,
            completedJobs: jobResults.length
        });

        jobLogger.error({
            message: 'El proceso de sincronización ha fallado de forma crítica.',
            error: (error as Error).message,
            duration: `${totalDuration}ms`,
            completedJobs: jobResults
        }, 'Critical synchronization failure');

        process.exit(1); // Termina con código de error
    } finally {
        try {
            jobLogger.info('Cerrando conexión a la base de datos...');
            await prisma.$disconnect();
            serverLogger.info('Database connection closed successfully');
        } catch (disconnectError) {
            logError(disconnectError as Error, {context: 'Database disconnect'});
        }

        const totalDuration = (Date.now() - overallStartTime) / 1000;
        jobLogger.info('==========================================');
        jobLogger.info({duration: `${totalDuration.toFixed(2)}s`}, `=== FIN DEL PROCESO. Duración: ${totalDuration.toFixed(2)}s ===`);
        jobLogger.info('==========================================');

        // Exit code basado en si hubo errores
        const hasErrors = jobResults.some(r => !r.success);
        process.exit(hasErrors ? 1 : 0);
    }
}

// Manejo de señales del sistema para logging
process.on('SIGINT', () => {
    serverLogger.warn('Received SIGINT signal, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    serverLogger.warn('Received SIGTERM signal, shutting down gracefully...');
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    logError(error, {context: 'Uncaught Exception'});
    serverLogger.fatal({error: error.message, stack: error.stack}, 'Uncaught Exception - Process will exit');
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    logError(error, {context: 'Unhandled Promise Rejection', promise: promise.toString()});
    serverLogger.fatal({reason, promise: promise.toString()}, 'Unhandled Promise Rejection');
    process.exit(1);
});

main();