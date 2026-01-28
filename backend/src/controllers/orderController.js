import { prisma } from '../lib/prisma.js';

export const createOrder = async (req, res) => {
    try {
        const { items } = req.body;
        const customerId = req.user.id;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Items are required' });
        }

        // Calculate total amount
        const totalAmt = items.reduce((total, item) => total + (item.price * item.quantity), 0);

        // Create order
        const order = await prisma.order.create({
            data: {
                customerId,
                totalAmt,
                status: 'PROCESSING',
                orderItems: {
                    create: items.map(item => ({
                        foodId: item.id,
                        qty: item.quantity,
                        price: item.price
                    }))
                }
            },
            include: {
                orderItems: true
            }
        });

        res.status(201).json(order);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order', message: error.message });
    }
};

export const getUserOrders = async (req, res) => {
    try {
        const customerId = req.user.id;

        const orders = await prisma.order.findMany({
            where: { customerId },
            include: {
                orderItems: {
                    include: {
                        food: true
                    }
                }
            },
            orderBy: { orderDate: 'desc' }
        });

        res.json(orders);
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders', message: error.message });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const customerId = req.user.id;

        const order = await prisma.order.findUnique({
            where: { id: parseInt(id) },
            include: {
                orderItems: {
                    include: {
                        food: true
                    }
                }
            }
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Check if user owns this order
        if (order.customerId !== customerId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: 'Failed to fetch order', message: error.message });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Check if user is admin
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied: Admins only' });
        }

        if (!status || !['INCART', 'PROCESSING', 'COMPLETED', 'CANCELLED'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const order = await prisma.order.update({
            where: { id: parseInt(id) },
            data: { status },
            include: {
                orderItems: {
                    include: {
                        food: true
                    }
                }
            }
        });

        res.json(order);
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Failed to update order status', message: error.message });
    }
};

export const getAllOrders = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied: Admins only' });
        }

        const orders = await prisma.order.findMany({
            include: {
                orderItems: {
                    include: {
                        food: true
                    }
                },
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { orderDate: 'desc' }
        });

        res.json(orders);
    } catch (error) {
        console.error('Error fetching all orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders', message: error.message });
    }
};
