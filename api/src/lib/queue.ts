// api/src/lib/queue.ts (Versión Corregida)
import PgBoss from 'pg-boss';
import {ERP_ORDER_QUEUE} from "../types/orders";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL no está definida en las variables de entorno.');
}

console.log(`[PG-BOSS-INIT] Configurando instancia compartida de pg-boss...`);

const boss = new PgBoss({
    connectionString,
    schema: 'public',
    max: 20,
    application_name: 'ecommerce-pgr-boss',
    retryBackoff: true,
    retryLimit: 5,
    expireInSeconds: 60 * 60,
    deleteAfterDays: 7,
    maintenanceIntervalMinutes: 5,
    monitorStateIntervalMinutes: 5,
});

boss.on('error', (error) => console.error('❌ Error global en pg-boss:', error));
boss.on('maintenance', () => console.log('🔧 Mantenimiento de pg-boss ejecutado'));

// Función para iniciar la conexión.
// Es seguro llamar a start() múltiples veces.
// La librería se encarga de no reconectar si ya está conectado.
async function startBoss() {
    console.log("🚀 Asegurando que la conexión de pg-boss esté activa...");
    await boss.start();
    await boss.createQueue(ERP_ORDER_QUEUE);
    console.log("✅ Conexión de pg-boss verificada y lista.");
}

// Exportamos la instancia y la función de inicio
export { boss, startBoss };