import { prisma } from '../lib/prisma.js';

const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
const KHALTI_API_URL = process.env.KHALTI_API_URL || 'https://dev.khalti.com/api/v2';
const WEBSITE_URL = process.env.WEBSITE_URL || 'http://localhost:5173';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

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

            // Order stays in PROCESSING — only admin can set COMPLETED

            return { payment, token };
        });

        // Return full receipt data
        res.status(201).json({
            order: {
                id: order.id,
                orderDate: order.orderDate,
                totalAmt: order.totalAmt,
                status: 'PROCESSING'
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

// Khalti Payment - Initiate
export const khaltiInitiate = async (req, res) => {
    try {
        const { orderId } = req.body;
        const userId = req.user.id;

        if (!orderId) {
            return res.status(400).json({ error: 'Order ID is required' });
        }

        // Fetch the order
        const order = await prisma.order.findUnique({
            where: { id: parseInt(orderId) },
            include: {
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

        // Create payment record to store khalti data
        const payment = await prisma.payment.create({
            data: {
                method: 'KHALTI',
                status: 'PENDING',
                orderId: order.id
            }
        });

        // Prepare Khalti initiate request
        const khaltiPayload = {
            return_url: `${WEBSITE_URL}/khalti-return?orderId=${order.id}&paymentId=${payment.id}`,
            website_url: WEBSITE_URL,
            amount: Math.round(order.totalAmt * 100), // Convert NPR to paisa (smallest unit)
            purchase_order_id: `order-${order.id}`,
            purchase_order_name: `Order #${order.id}`,
            customer_info: {
                name: order.customer.name || 'Customer',
                email: order.customer.email,
                phone: '9800000001' // Default phone
            }
        };

        // Call Khalti API to initiate payment
        const khaltiResponse = await fetch(`${KHALTI_API_URL}/epayment/initiate/`, {
            method: 'POST',
            headers: {
                'Authorization': `Key ${KHALTI_SECRET_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(khaltiPayload)
        });

        if (!khaltiResponse.ok) {
            const errorData = await khaltiResponse.text();
            console.error('Khalti initiate failed:', errorData);
            return res.status(500).json({ error: 'Failed to initiate Khalti payment' });
        }

        const khaltiData = await khaltiResponse.json();

        // Store pidx in payment record
        await prisma.payment.update({
            where: { id: payment.id },
            data: {
                // Using payDate field to store pidx temporarily (you may want to add pidx field to schema)
            }
        });

        res.json({
            success: true,
            data: {
                paymentUrl: khaltiData.payment_url,
                pidx: khaltiData.pidx,
                paymentId: payment.id,
                orderId: order.id
            }
        });
    } catch (error) {
        console.error('Error initiating Khalti payment:', error);
        res.status(500).json({ error: 'Failed to initiate Khalti payment', message: error.message });
    }
};

// Khalti Payment - Verify
export const khaltiVerify = async (req, res) => {
    try {
        const { pidx, paymentId, orderId } = req.body;
        const userId = req.user.id;

        if (!pidx || !paymentId || !orderId) {
            return res.status(400).json({ error: 'pidx, paymentId, and orderId are required' });
        }

        // Fetch and verify the order belongs to user
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

        if (order.customerId !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Verify payment with Khalti
        const khaltiVerifyResponse = await fetch(`${KHALTI_API_URL}/epayment/lookup/`, {
            method: 'POST',
            headers: {
                'Authorization': `Key ${KHALTI_SECRET_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ pidx })
        });

        if (!khaltiVerifyResponse.ok) {
            const errorData = await khaltiVerifyResponse.text();
            console.error('Khalti verification failed:', errorData);
            return res.status(500).json({ error: 'Failed to verify payment with Khalti' });
        }

        const khaltiData = await khaltiVerifyResponse.json();

        // Check if payment is completed
        if (khaltiData.status !== 'Completed') {
            return res.status(400).json({ 
                error: `Payment not completed. Status: ${khaltiData.status}` 
            });
        }

        // Use transaction to update payment, create token, and mark order as processed
        const result = await prisma.$transaction(async (tx) => {
            // Update payment status
            const payment = await tx.payment.update({
                where: { id: parseInt(paymentId) },
                data: {
                    status: 'PAID'
                }
            });

            // Generate token number
            const lastToken = await tx.token.findFirst({
                orderBy: { tokenNumber: 'desc' }
            });
            const tokenNumber = lastToken ? lastToken.tokenNumber + 1 : 1;

            // Create token
            const token = await tx.token.create({
                data: {
                    tokenNumber,
                    status: 'PREPARING',
                    orderId: order.id
                }
            });

            return { payment, token };
        });

        // Return receipt data
        res.json({
            success: true,
            data: {
                order: {
                    id: order.id,
                    orderDate: order.orderDate,
                    totalAmt: order.totalAmt,
                    status: 'PROCESSING'
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
                    status: result.payment.status
                },
                token: {
                    tokenNumber: result.token.tokenNumber,
                    status: result.token.status
                }
            }
        });
    } catch (error) {
        console.error('Error verifying Khalti payment:', error);
        res.status(500).json({ error: 'Failed to verify Khalti payment', message: error.message });
    }
};
