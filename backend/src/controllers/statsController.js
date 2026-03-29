import { prisma } from '../lib/prisma.js';

export const getAdminStats = async (req, res) => {
    try {
        const [totalOrders, totalRevenueData, totalCustomers, pendingOrders] = await Promise.all([
            prisma.order.count(),
            prisma.order.aggregate({
                _sum: {
                    totalAmt: true
                },
                where: {
                    status: { not: 'CANCELLED' } 
                }
            }),
            prisma.user.count({
                where: {
                    role: 'CUSTOMER'
                }
            }),
            prisma.order.count({
                where: {
                    status: 'PROCESSING' 
                }
            })
        ]);

        const totalRevenue = totalRevenueData._sum.totalAmt || 0;

        res.json({
            totalOrders,
            totalRevenue,
            totalCustomers,
            pendingOrders
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
};

export const getCustomerStats = async (req, res) => {
    try {
        const userId = req.user.id;

        const [totalOrders, totalSpentData, pendingOrders] = await Promise.all([
            prisma.order.count({
                where: {
                    customerId: userId
                }
            }),
            prisma.order.aggregate({
                _sum: {
                    totalAmt: true
                },
                where: {
                    customerId: userId,
                    status: { not: 'CANCELLED' }
                }
            }),
            prisma.order.count({
                where: {
                    customerId: userId,
                    status: 'PROCESSING'
                }
            })
        ]);

        const totalSpent = totalSpentData._sum.totalAmt || 0;

        res.json({
            totalOrders,
            totalSpent,
            pendingOrders
        });
    } catch (error) {
        console.error('Error fetching customer stats:', error);
        res.status(500).json({ error: 'Failed to fetch customer stats' });
    }
};

export const getTopSalesItems = async (req, res) => {
    try {
        const topItems = await prisma.orderitem.groupBy({
            by: ['foodId'],
            _sum: {
                qty: true,
                price: true
            },
            orderBy: {
                _sum: {
                    price: 'desc'
                }
            },
            take: 10
        });

        // Fetch food details for each item
        const itemsWithDetails = await Promise.all(
            topItems.map(async (item) => {
                const food = await prisma.fooditem.findUnique({
                    where: { id: item.foodId },
                    select: { id: true, name: true, image: true, price: true }
                });
                return {
                    id: food?.id,
                    title: food?.name,
                    image: food?.image,
                    price: food?.price,
                    totalSalesAmount: item._sum.price || 0,
                    totalQuantitySold: item._sum.qty || 0
                };
            })
        );

        res.json(itemsWithDetails.filter(item => item.id !== undefined));
    } catch (error) {
        console.error('Error fetching top sales items:', error);
        res.status(500).json({ error: 'Failed to fetch top sales items', details: error.message });
    }
};

export const getMostSoldItems = async (req, res) => {
    try {
        const mostSold = await prisma.orderitem.groupBy({
            by: ['foodId'],
            _sum: {
                qty: true,
                price: true
            },
            orderBy: {
                _sum: {
                    qty: 'desc'
                }
            },
            take: 10
        });

        // Fetch food details for each item
        const itemsWithDetails = await Promise.all(
            mostSold.map(async (item) => {
                const food = await prisma.fooditem.findUnique({
                    where: { id: item.foodId },
                    select: { id: true, name: true, image: true, price: true }
                });
                return {
                    id: food?.id,
                    title: food?.name,
                    image: food?.image,
                    price: food?.price,
                    totalQuantitySold: item._sum.qty || 0,
                    totalRevenue: item._sum.price || 0
                };
            })
        );

        res.json(itemsWithDetails.filter(item => item.id !== undefined));
    } catch (error) {
        console.error('Error fetching most sold items:', error);
        res.status(500).json({ error: 'Failed to fetch most sold items', details: error.message });
    }
};
