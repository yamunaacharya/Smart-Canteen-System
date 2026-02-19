import { prisma } from '../lib/prisma.js';

export const getUserTokens = async (req, res) => {
    try {
        const userId = req.user.id;

        const tokens = await prisma.token.findMany({
            where: {
                order: {
                    customerId: userId
                }
            },
            include: {
                order: {
                    include: {
                        customer: {
                            select: { id: true, name: true, email: true }
                        },
                        orderItems: {
                            include: {
                                food: {
                                    select: { name: true }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const result = tokens.map(token => ({
            id: token.id,
            tokenNumber: token.tokenNumber,
            status: token.status,
            createdAt: token.createdAt,
            customer: token.order.customer,
            order: {
                id: token.order.id,
                totalAmt: token.order.totalAmt,
                status: token.order.status,
                orderDate: token.order.orderDate,
                items: token.order.orderItems.map(item => ({
                    name: item.food.name,
                    qty: item.qty,
                    price: item.price,
                    subtotal: item.qty * item.price
                }))
            }
        }));

        res.json(result);
    } catch (error) {
        console.error('Error fetching user tokens:', error);
        res.status(500).json({ error: 'Failed to fetch tokens', message: error.message });
    }
};

export const processCashPayment = async (req, res) => {
    try {
        const { orderId } = req.body;
        const userId = req.user.id;

        if (!orderId) {
            return res.status(400).json({ error: 'Order ID is required' });
        }

        // Fetch the order with items and food details
        const order = await prisma.order.findUnique({
            where: { id: parseInt(orderId) },
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
            }
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Verify the order belongs to this user
        if (order.customerId !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Use a transaction to create payment, token, and update order status
        const result = await prisma.$transaction(async (tx) => {
            // Create Payment record
            const payment = await tx.payment.create({
                data: {
                    method: 'COD',
                    status: 'PAID',
                    orderId: order.id
                }
            });

            // Generate token number (max existing + 1)
            const lastToken = await tx.token.findFirst({
                orderBy: { tokenNumber: 'desc' }
            });
            const tokenNumber = lastToken ? lastToken.tokenNumber + 1 : 1;

            // Create Token record
            const token = await tx.token.create({
                data: {
                    tokenNumber,
                    status: 'PREPARING',
                    orderId: order.id
                }
            });

            // Update order status to COMPLETED
            await tx.order.update({
                where: { id: order.id },
                data: { status: 'COMPLETED' }
            });

            return { payment, token };
        });

        // Return full receipt data
        res.status(201).json({
            order: {
                id: order.id,
                orderDate: order.orderDate,
                totalAmt: order.totalAmt,
                status: 'COMPLETED'
            },
            customer: order.customer,
            items: order.orderItems.map(item => ({
                name: item.food.name,
                qty: item.qty,
                price: item.price,
                subtotal: item.qty * item.price
            })),
            payment: {
                id: result.payment.id,
                method: result.payment.method,
                status: result.payment.status,
                payDate: result.payment.payDate
            },
            token: {
                tokenNumber: result.token.tokenNumber,
                status: result.token.status
            }
        });
    } catch (error) {
        console.error('Error processing cash payment:', error);
        res.status(500).json({ error: 'Failed to process payment', message: error.message });
    }
};
