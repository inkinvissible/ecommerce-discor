import {prisma} from '../lib/prisma';
import {boss} from "../lib/queue";
import {CreateOrderPayload, ERP_ORDER_QUEUE, GetOrdersQuery, OrderWithDetails, PaginatedOrders} from '../types/orders';
import {Prisma} from '@prisma/client';




class OrderService {
    /**
     * Crea un pedido a partir del carrito de un usuario.
     * @param payload - Los datos para la creación del pedido.
     * @param userId - El ID del usuario que realiza el pedido.
     */
    public async createOrder(payload: CreateOrderPayload, userId: string) {
        // 1. Iniciar una transacción para garantizar la atomicidad
        try {
            const newOrder = await prisma.$transaction(async (tx) => {
                // 2. Obtener datos esenciales del usuario y su carrito
                const cart = await tx.cart.findUnique({
                    where: {userId},
                    include: {
                        items: {
                            include: {product: true},
                        },
                    },
                });

                const client = await tx.client.findFirst({
                    where: {users: {some: {id: userId}}},
                });

                if (!client) {
                    throw new Error('Cliente no encontrado para este usuario.');
                }
                if (!cart || cart.items.length === 0) {
                    throw new Error('El carrito está vacío.');
                }

                // Validar la dirección de envío si es necesaria
                if (payload.shippingMethod === 'DELIVERY') {
                    const addressExists = await tx.address.findFirst({
                        where: {id: payload.shippingAddressId, clientId: client.id},
                    });
                    if (!addressExists) {
                        throw new Error('La dirección de envío no es válida o no pertenece al cliente.');
                    }
                }

                // =================================================================
                // 3. Calcular totales y preparar items del pedido
                // =================================================================
                const orderItemsData: Prisma.OrderItemCreateManyOrderInput[] = [];
                let subtotal = new Prisma.Decimal(0); // Subtotal bruto (antes de descuentos e impuestos)

                for (const item of cart.items) {
                    const productPrice = await tx.price.findFirst({
                        where: {productId: item.productId, priceListId: client.priceListId},
                    });

                    const priceAtPurchase = productPrice?.price ?? new Prisma.Decimal(0);

                    // Se multiplica la cantidad por el precio de lista para obtener el total por item
                    const itemTotal = priceAtPurchase.times(item.quantity);
                    // Se suman todos los totales para obtener el subtotal bruto del pedido
                    subtotal = subtotal.plus(itemTotal);

                    orderItemsData.push({
                        productId: item.productId,
                        quantity: item.quantity,
                        priceAtPurchase: priceAtPurchase,
                        // Guardar un "snapshot" del producto es una práctica robusta
                        productSnapshot: item.product,
                    });
                }

                // Se aplica el descuento que corresponde al cliente
                const discountAmount = subtotal.times(client.discountPercentage.dividedBy(100));
                const subtotalAfterDiscount = subtotal.minus(discountAmount);

                // Por último, se le calcula el IVA del 21%
                // REGLA DE NEGOCIO: El IVA se calcula siempre al crear un pedido,
                // incluso si el flag `applyVat` del cliente es `false`.
                const VAT_RATE = new Prisma.Decimal(0.21);
                const vatAmount = subtotalAfterDiscount.times(VAT_RATE);

                // Y eso es el precio total de todo el pedido.
                const totalAmount = subtotalAfterDiscount.plus(vatAmount);

                // 4. Crear el pedido en la base de datos
                const createdOrder = await tx.order.create({
                    data: {
                        userId: userId,
                        clientId: client.id,
                        status: 'processing', // Estado inicial
                        currency: 'ARS',
                        subtotal, // Se guarda el subtotal bruto (sin descuentos ni impuestos)
                        discountAmount, // Se guarda el monto exacto del descuento
                        totalAmount, // Se guarda el total final que el cliente debe pagar
                        shippingMethod: payload.shippingMethod,
                        shippingAddressId: payload.shippingAddressId,
                        shippingNotes: payload.shippingNotes,
                        items: {
                            createMany: {
                                data: orderItemsData,
                            },
                        },
                    },
                });

                // 5. Vaciar el carrito del usuario
                await tx.cartItem.deleteMany({where: {cartId: cart.id}});
                console.log(`✅✅✅✅✅✅✅✅✅[Transaction] DB operations for order ${createdOrder.id} completed.`);
                return createdOrder;
            });

            try {
                console.log(`[Sender] Encolando job para la orden ${newOrder.id} en la cola '${ERP_ORDER_QUEUE}'...`);
                const jobOptions = {
                    retryLimit: 3,
                    retryDelay: 30,
                    startAfter: new Date(Date.now() + 1000) // Pequeño delay
                };
                const jobId = await boss.send(ERP_ORDER_QUEUE, { orderId: newOrder.id }, jobOptions);
                if (!jobId) {
                    throw new Error('No se recibió ID de job');
                }
                console.log(`✅ Job ${jobId} para la orden ${newOrder.id} encolado exitosamente.`);
            } catch (error) {
                console.error(`❌ CRÍTICO: La orden ${newOrder.id} se creó en la DB pero falló el encolado del job.`, error);
            }

            return newOrder;
        } catch (error) {
            console.error('❌ Error al crear el pedido:', error);
            throw new Error('No se pudo crear el pedido. Por favor, inténtelo de nuevo más tarde.');
        }
    }

    public async getOrders(userId: string, query: GetOrdersQuery): Promise<PaginatedOrders> {
        try {
            console.log('🔍 Service: Getting orders with params:', { userId, query });

            // Validaciones básicas
            if (!userId) {
                throw new Error('ID de usuario es requerido');
            }

            const { page = 1, limit = 10, status, dateFrom, dateTo } = query;

            // Validación adicional de parámetros
            if (page < 1) {
                throw new Error('El número de página debe ser mayor a 0');
            }

            if (limit < 1 || limit > 100) {
                throw new Error('El límite debe estar entre 1 y 100');
            }

            const skip = (page - 1) * limit;

            // Construir filtros dinámicamente
            const whereClause: any = {
                userId,
            };

            if (status) {
                whereClause.status = status;
            }

            if (dateFrom || dateTo) {
                whereClause.createdAt = {};
                if (dateFrom) {
                    const fromDate = new Date(dateFrom);
                    if (isNaN(fromDate.getTime())) {
                        throw new Error('Formato de fecha inválido para dateFrom');
                    }
                    whereClause.createdAt.gte = fromDate;
                }
                if (dateTo) {
                    const toDate = new Date(dateTo);
                    if (isNaN(toDate.getTime())) {
                        throw new Error('Formato de fecha inválido para dateTo');
                    }
                    whereClause.createdAt.lte = toDate;
                }
            }

            console.log('🔍 Database query where clause:', whereClause);

            // Ejecutar consultas en paralelo
            const [orders, total] = await Promise.all([
                prisma.order.findMany({
                    where: whereClause,
                    include: {
                        shippingAddress: {
                            select: {
                                alias: true,
                                street: true,
                                city: true,
                                province: true,
                                zipCode: true,
                            },
                        },
                        items: {
                            select: {
                                id: true,
                                quantity: true,
                                priceAtPurchase: true,
                                productSnapshot: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    skip,
                    take: limit,
                }),
                prisma.order.count({
                    where: whereClause,
                }),
            ]);

            const totalPages = Math.ceil(total / limit);

            console.log('✅ Database query successful:', {
                ordersFound: orders.length,
                totalRecords: total,
                totalPages,
                currentPage: page
            });

            return {
                orders: orders as OrderWithDetails[],
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                },
            };

        } catch (error) {
            console.error('❌ Error en orderService.getOrders:', error);

            // Re-lanzar errores específicos sin modificar
            if (error instanceof Error) {
                if (error.message.includes('formato') ||
                    error.message.includes('página') ||
                    error.message.includes('límite') ||
                    error.message.includes('usuario')) {
                    throw error;
                }
            }

            // Error genérico para problemas de base de datos
            throw new Error('No se pudieron obtener las órdenes. Por favor, inténtelo de nuevo más tarde.');
        }
    }
}

export const orderService = new OrderService();