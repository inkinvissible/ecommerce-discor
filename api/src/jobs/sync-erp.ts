// api/src/jobs/sync-erp.ts
import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { logJobExecution, jobLogger, logError, serverLogger } from '../lib/logger';

// Importa tus módulos de sincronización
import { syncProducts } from './sync/syncProducts';
import { syncStock } from './sync/syncStock';
import { syncClients } from './sync/syncClients';
import { syncShippingZones} from "./sync/syncShippingZones";

// Definir dependencias entre jobs
interface JobDefinition {
    name: string;
    fn: () => Promise<void>;
    dependencies: string[]; // Jobs que deben ejecutarse antes
    critical: boolean; // Si falla, ¿debe parar todo el proceso?
}

// Función para ejecutar un job individual con logging
async function executeJob(jobName: string, jobFunction: () => Promise<void>) {
    const startTime = Date.now();
    logJobExecution(jobName, 'start');

    try {
        await jobFunction();
        const duration = Date.now() - startTime;
        logJobExecution(jobName, 'success', duration);
        return { success: true, duration };
    } catch (error) {
        const duration = Date.now() - startTime;
        logJobExecution(jobName, 'error', duration, error as Error);
        logError(error as Error, { context: `Job execution: ${jobName}` });
        return { success: false, duration, error };
    }
}

// Función para verificar si las dependencias están satisfechas
function canExecuteJob(jobName: string, dependencies: string[], completedJobs: Set<string>): boolean {
    return dependencies.every(dep => completedJobs.has(dep));
}

async function main() {
    const overallStartTime = Date.now();
    const jobResults: Array<{ name: string; success: boolean; duration: number; error?: any }> = [];
    const completedJobs = new Set<string>();

    // Definir jobs FUERA del bloque try para que esté disponible en finally
    const jobs: JobDefinition[] = [
        // {
        //     name: 'syncProducts',
        //     fn: syncProducts,
        //     dependencies: [],
        //     critical: true
        // },
        // {
        //     name: 'syncStock',
        //     fn: syncStock,
        //     dependencies: ['syncProducts'], // Stock necesita productos
        //     critical: false
        // },
        {
            name: 'syncShippingZones',
            fn: syncShippingZones,
            dependencies: [],
            critical: true // Crítico porque syncClients depende de esto
        },
        {
            name: 'syncClients',
            fn: syncClients,
            dependencies: ['syncShippingZones'], // <-- DEPENDE DE LAS ZONAS
            critical: true
        },
         ];

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
        jobLogger.info({ totalJobs: jobs.length }, 'Jobs programados para ejecución');

        // Ejecutar jobs respetando dependencias
        const pendingJobs = new Set(jobs.map(j => j.name));

        while (pendingJobs.size > 0) {
            let jobExecuted = false;

            for (const job of jobs) {
                if (!pendingJobs.has(job.name)) continue;

                if (canExecuteJob(job.name, job.dependencies, completedJobs)) {
                    jobLogger.info({
                        jobName: job.name,
                        dependencies: job.dependencies,
                        remaining: pendingJobs.size - 1
                    }, `Ejecutando job: ${job.name}`);

                    const result = await executeJob(job.name, job.fn);
                    jobResults.push({
                        name: job.name,
                        success: result.success,
                        duration: result.duration,
                        error: result.error
                    });

                    if (result.success) {
                        completedJobs.add(job.name);
                        pendingJobs.delete(job.name);
                        jobExecuted = true;

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
                            error: (result.error as Error)?.message,
                            critical: job.critical
                        }, `Job ${job.name} falló`);

                        // Si es crítico, parar todo
                        if (job.critical) {
                            throw new Error(`Critical job ${job.name} failed: ${(result.error as Error)?.message}`);
                        }

                        // Si no es crítico, remover de pendientes pero no agregar a completados
                        pendingJobs.delete(job.name);
                        jobExecuted = true;
                    }
                    break;
                }
            }

            // Deadlock detection
            if (!jobExecuted && pendingJobs.size > 0) {
                const remaining = Array.from(pendingJobs);
                const missingDeps = remaining.map(jobName => {
                    const job = jobs.find(j => j.name === jobName)!;
                    const missing = job.dependencies.filter(dep => !completedJobs.has(dep));
                    return { job: jobName, missingDeps: missing };
                });

                throw new Error(`Deadlock detected. Cannot execute remaining jobs: ${JSON.stringify(missingDeps, null, 2)}`);
            }
        }

        // Calcular métricas finales
        const totalDuration = Date.now() - overallStartTime;
        const successfulJobs = jobResults.filter(r => r.success).length;
        const failedJobs = jobResults.filter(r => !r.success).length;
        const successRate = jobResults.length > 0 ? (successfulJobs / jobResults.length * 100).toFixed(2) : '0.00';

        const summaryMetrics = {
            totalJobs: jobResults.length,
            successfulJobs,
            failedJobs,
            successRate: `${successRate}%`,
            totalDuration: `${(totalDuration / 1000).toFixed(2)}s`,
            averageJobDuration: jobResults.length > 0 ? `${(jobResults.reduce((acc, r) => acc + r.duration, 0) / jobResults.length).toFixed(0)}ms` : '0ms',
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

        process.exit(1);
    } finally {
        try {
            jobLogger.info('Cerrando conexión a la base de datos...');
            await prisma.$disconnect();
            serverLogger.info('Database connection closed successfully');
        } catch (disconnectError) {
            logError(disconnectError as Error, { context: 'Database disconnect' });
        }

        const totalDuration = (Date.now() - overallStartTime) / 1000;
        jobLogger.info('==========================================');
        jobLogger.info({ duration: `${totalDuration.toFixed(2)}s` }, `=== FIN DEL PROCESO. Duración: ${totalDuration.toFixed(2)}s ===`);
        jobLogger.info('==========================================');

        // Exit code basado en si hubo errores críticos
        const hasCriticalErrors = jobResults.some(r => {
            if (!r.success) {
                const job = jobs.find(j => j.name === r.name); // Ahora jobs está en scope
                return job?.critical || false;
            }
            return false;
        });

        process.exit(hasCriticalErrors ? 1 : 0);
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
    logError(error, { context: 'Uncaught Exception' });
    serverLogger.fatal({ error: error.message, stack: error.stack }, 'Uncaught Exception - Process will exit');
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    logError(error, { context: 'Unhandled Promise Rejection', promise: promise.toString() });
    serverLogger.fatal({ reason, promise: promise.toString() }, 'Unhandled Promise Rejection');
    process.exit(1);
});

main();