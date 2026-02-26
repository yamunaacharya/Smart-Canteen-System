import { prisma } from '../lib/prisma.js';

export const createOrder = async (req, res) => {
    try {
        const { items } = req.body;
        const customerId = req.user.id;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Items are required' });
        }


        for (const item of items) {
            const food = await prisma.fooditem.findUnique({ where: { id: item.id } });
            if (!food) {
                return res.status(400).json({ error: `Item not found: ${item.id}` });
            }
        }

        
        const totalAmt = items.reduce((total, item) => total + (item.price * item.quantity), 0);

       
        const order = await prisma.order.create({
            data: {
                customerId,
                totalAmt,
                status: 'PROCESSING',
                orderitem: {
                    create: items.map(item => ({
                        foodId: item.id,
                        qty: item.quantity,
                        price: item.price
                    }))
                }
            },
            include: {
                orderitem: true
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
                orderitem: {
                    include: {
                        fooditem: true
                    }
                },
                token: true
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
                orderitem: {
                    include: {
                        fooditem: true
                    }
                }
            }
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

       
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

        const order = await prisma.$transaction(async (tx) => {
            
            if (status === 'CANCELLED') {
                const existingOrder = await tx.order.findUnique({
                    where: { id: parseInt(id) },
                    include: { orderitem: true }
                });

                
                if (existingOrder && existingOrder.status !== 'CANCELLED') {
                    for (const item of existingOrder.orderitem) {
                        const food = await tx.fooditem.findUnique({ where: { id: item.foodId } });
                        if (food) {
                            const restoredQty = food.qty + item.qty;
                            await tx.fooditem.update({
                                where: { id: item.foodId },
                                data: {
                                    qty: restoredQty,
                                    
                                    a_status: food.a_status === 'OUT_OF_STOCK' ? 'AVAILABLE' : food.a_status
                                }
                            });
                        }
                    }
                }

               
                try {
                    await tx.token.update({
                        where: { orderId: parseInt(id) },
                        data: { status: 'CANCELLED' }
                    });
                } catch (tokenError) {
                    
                    console.log(`Token not found for order ${id}, skipping token update`);
                }
            }

            
            if (status === 'COMPLETED') {
               
                try {
                    await tx.token.update({
                        where: { orderId: parseInt(id) },
                        data: { status: 'COLLECTED' }
                    });
                } catch (tokenError) {
                    
                    console.log(`Token not found for order ${id}, skipping token update`);
                }
            }

            
            return await tx.order.update({
                where: { id: parseInt(id) },
                data: { status },
                include: {
                    orderitem: {
                        include: { fooditem: true }
                    },
                    user: {
                        select: { id: true, name: true, email: true }
                    },
                    token: true
                }
            });
        });

        res.json(order);
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Failed to update order status', message: error.message });
    }
};

export const getAllOrders = async (req, res) => {
    try {
        
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied: Admins only' });
        }

        const orders = await prisma.order.findMany({
            include: {
                orderitem: {
                    include: {
                        fooditem: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                token: true
            },
            orderBy: { orderDate: 'desc' }
        });

        res.json(orders);
    } catch (error) {
        console.error('Error fetching all orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders', message: error.message });
    }
};
