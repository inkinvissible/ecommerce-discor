// api/src/manager.ts
import { boss, startBoss } from '../lib/queue';
import { initializeErpWorker } from './erp.worker';

async function startWorkers() {
    try {
        console.log('🚀 Iniciando Worker Manager...');

        // 1. Inicia la conexión compartida de pg-boss
        await startBoss();

        // 2. Inicializa tus workers específicos. Ellos se suscribirán a las colas.
        await initializeErpWorker();

        console.log('✅ Worker Manager iniciado y workers suscritos a sus colas.');
        console.log('👂 Escuchando por nuevos trabajos...');


    } catch (error) {
        console.error('❌ Error fatal al inicializar el Worker Manager:', error);
        process.exit(1);
    }
}

// Manejar cierre graceful
process.on('SIGINT', async () => {
    console.log('🛑 Deteniendo el Worker Manager...');
    await boss.stop();
    console.log('✅ Conexión de pg-boss cerrada limpiamente.');
    process.exit(0);
});

startWorkers();