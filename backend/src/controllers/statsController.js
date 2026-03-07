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
