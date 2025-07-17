// src/services/profile.service.ts
import { prisma } from '../lib/prisma';

export class ProfileService {
    static async getUserProfile(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                client: {
                    include: {
                        addresses: {
                            where: { deletedAt: null },
                            orderBy: { isDefaultShipping: 'desc' }
                        },
                        shippingZone: true,
                        pricingConfigs: true
                    }
                },
                roles: {
                    include: {
                        role: true
                    }
                },
                orders: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                    include: {
                        items: {
                            include: {
                                product: true
                            }
                        }
                    }
                },
                notifications: {
                    where: { isRead: false },
                    orderBy: { createdAt: 'desc' }
                },
                stockAlerts: {
                    include: {
                        product: true
                    }
                }
            }
        });

        if (!user) {
            return null;
        }

        return {
            id: user.id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            client: {
                id: user.client.id,
                businessName: user.client.businessName,
                cuit: user.client.cuit,
                erpCode: user.client.erpCode,
                priceListId: user.client.priceListId,
                discountPercentage: user.client.discountPercentage,
                applyVat: user.client.applyVat,
                addresses: user.client.addresses,
                shippingZone: user.client.shippingZone,
                pricingConfigs: user.client.pricingConfigs
            },
            roles: user.roles.map(ur => ur.role.name),
        };
    }

    static async getUserAddresses(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                client: {
                    include: {
                        addresses: {
                            where: { deletedAt: null },
                            orderBy: { isDefaultShipping: 'desc' }
                        }
                    }
                }
            }
        });

        return user?.client.addresses || [];
    }

    static async getUserOrders(userId: string, page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        const orders = await prisma.order.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
            include: {
                items: {
                    include: {
                        product: true
                    }
                },
                shippingAddress: true
            }
        });

        const total = await prisma.order.count({
            where: { userId }
        });

        return {
            orders,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    static async getUserNotifications(userId: string, unreadOnly: boolean = false) {
        return prisma.notification.findMany({
            where: {
                userId,
                ...(unreadOnly && {isRead: false})
            },
            orderBy: {createdAt: 'desc'}
        });
    }

    static async markNotificationAsRead(notificationId: string, userId: string) {
        return await prisma.notification.updateMany({
            where: {
                id: notificationId,
                userId
            },
            data: {
                isRead: true
            }
        });
    }
}