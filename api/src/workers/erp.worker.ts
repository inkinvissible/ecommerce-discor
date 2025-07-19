import { boss } from '../lib/queue';
import { prisma } from '../lib/prisma';
import { ERP_ORDER_QUEUE, SyncOrderToErpJobPayload } from '../types/orders';
import axios from 'axios';
import { Job } from 'pg-boss';

async function processSingleJob(job: Job<SyncOrderToErpJobPayload>) {
    const { orderId } = job.data;

    try {
        console.log(`[ERP Worker] 🔄 Procesando trabajo para el pedido: ${orderId}`);

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { client: true, items: { include: { product: true } } },
        });

        if (!order) {
            console.error(`[ERP Worker] ❌ Pedido con ID ${orderId} no encontrado. Trabajo completado.`);
            // Versión correcta para pg-boss 10.3.2
            await boss.complete('Sincronization',job.id );
            return;
        }
        console.log("____________________________________________________________________________");
        console.log("EL TOKEN QUE SE ESTA USANDO ES: ", process.env.API_TOKEN);
        const erpPayload = {
            token: process.env.API_TOKEN,
            idWeb: "PRUEBA - SITIO PROPIO",
            DescuentoGeneral: order.client.discountPercentage.toString(),
            ObservacionPedido: order.shippingNotes || "",
            CondicionVenta: "CONTADO",
            Items: order.items.map((item: any) => ({
                CODIGO: item.product.sku,
                CANTIDAD: item.quantity,
                PRECIOUNITARIO: item.priceAtPurchase.toNumber(),
                DESCUENTO: 0,
                TOTALITEM: item.quantity * item.priceAtPurchase,
                OBSERVACION: ""
            })),
            Cliente: order.client.erpCode
        };
        console.log(`[ERP Worker] 📤 Payload para ERP:`, JSON.stringify(erpPayload, null, 2));

        const response = await axios.post(process.env.API_URL_NEW_ORDER!, erpPayload);
        console.log(`[ERP Worker] 🎉 Pedido ${order.id} enviado exitosamente al ERP.`);
        console.log(`[ERP Worker] 📥 Respuesta del ERP: ${JSON.stringify(response.data, null, 2)}`, response.status);

        await prisma.order.update({
            where: { id: orderId },
            data: { status: 'synced_with_erp' },
        });

        // Completar el trabajo exitosamente (versión correcta para pg-boss 10.3.2)
        await boss.complete('Sincronization',job.id);
        console.log(`[ERP Worker] ✅ Trabajo ${job.id} completado exitosamente`);

    } catch (error) {
        console.error(`[ERP Worker] ❌ Falló el envío del pedido ${orderId} al ERP:`, error);
        if (axios.isAxiosError(error)) {
            console.error(`[ERP Worker] 🌐 Error de HTTP: ${error.response?.status} - ${error.response?.statusText}`);
        }
        throw error; // pg-boss manejará el reintento automáticamente
    }
}

export async function initializeErpWorker() {
    console.log('👷 Inicializando Worker de sincronización de pedidos con ERP...');

    // Configuración compatible con pg-boss 10.3.2
    await boss.work<SyncOrderToErpJobPayload>(
        ERP_ORDER_QUEUE,
        {
            pollingIntervalSeconds: 5, // Intervalo en ms (equivalente a 5 segundos)
            batchSize: 5,
        },
        async (jobOrJobs: Job<SyncOrderToErpJobPayload> | Job<SyncOrderToErpJobPayload>[]) => {
            const jobs = Array.isArray(jobOrJobs) ? jobOrJobs : [jobOrJobs];
            console.log(`[ERP Worker] 📦 Recibido lote de ${jobs.length} trabajo(s)`);

            await Promise.all(jobs.map(async (job) => {
                try {
                    await processSingleJob(job);
                } catch (error) {
                    console.error(`[ERP Worker] ❌ Error procesando job ${job.id}`, error);
                    throw error; // Para reintentos
                }
            }));
        }
    );

    console.log(`[ERP Worker] 🎯 Worker suscrito a la cola: ${ERP_ORDER_QUEUE}`);

    // Verificación de estado de cola (versión compatible)
    setTimeout(async () => {
        try {
            // Obtener el tamaño de la cola
            const queueSize = await boss.getQueueSize(ERP_ORDER_QUEUE);

            console.log(`[ERP Worker] 🔍 Estado de la cola ${ERP_ORDER_QUEUE}:`, {
                queued: queueSize,
            });
        } catch (error) {
            console.error('[ERP Worker] ❌ Error verificando estado de colas:', error);
        }
    }, 5000);
}