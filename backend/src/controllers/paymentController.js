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
                        user: {
                            select: { id: true, name: true, email: true }
                        },
                        orderitem: {
                            include: {
                                fooditem: {
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
            customer: token.order.user,
            order: {
                id: token.order.id,
                totalAmt: token.order.totalAmt,
                status: token.order.status,
                orderDate: token.order.orderDate,
                items: token.order.orderitem.map(item => ({
                    name: item.fooditem.name,
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

// Khalti Payment - Initiate
export const khaltiInitiate = async (req, res) => {
    try {
        const { orderId } = req.body;
        const userId = req.user.id;

        if (!orderId) {
            return res.status(400).json({ error: 'Order ID is required' });
        }

        console.log(`Initiating Khalti payment for order ${orderId}, user ${userId}`);

        // Fetch the order
        const order = await prisma.order.findUnique({
            where: { id: parseInt(orderId) },
            include: {
                user: {
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
        console.log(`Created payment record ${payment.id} for order ${orderId}`);

        // Prepare Khalti initiate request
        const khaltiPayload = {
            return_url: `${WEBSITE_URL}/khalti-return`,
            website_url: WEBSITE_URL,
            amount: Math.round(order.totalAmt * 100), // Convert NPR to paisa (smallest unit)
            purchase_order_id: `order-${order.id}`,
            purchase_order_name: `Order #${order.id}`,
            customer_info: {
                name: order.user.name || 'Customer',
                email: order.user.email,
                phone: '9800000001' // Default phone
            }
        };

        console.log('Khalti payload:', khaltiPayload);

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
            return res.status(500).json({ error: 'Failed to initiate Khalti payment', details: errorData });
        }

        const khaltiData = await khaltiResponse.json();
        console.log('Khalti response:', khaltiData);

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
        res.status(500).json({ 
            error: 'Failed to initiate Khalti payment', 
            message: error.message,
            details: error.stack 
        });
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
                }
            }
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.customerId !== userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        console.log(`Verifying Khalti payment with pidx: ${pidx}, paymentId: ${paymentId}`);
        console.log(`Using KHALTI_API_URL: ${KHALTI_API_URL}`);
        console.log(`Using KHALTI_SECRET_KEY: ${KHALTI_SECRET_KEY ? 'Set' : 'NOT SET!'}`);

        // Verify payment with Khalti
        const khaltiVerifyUrl = `${KHALTI_API_URL}/epayment/lookup/`;
        console.log(`Making request to: ${khaltiVerifyUrl}`);
        
        const khaltiVerifyResponse = await fetch(khaltiVerifyUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Key ${KHALTI_SECRET_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ pidx })
        });

        console.log(`Khalti response status: ${khaltiVerifyResponse.status} ${khaltiVerifyResponse.statusText}`);

        let khaltiData;
        const responseText = await khaltiVerifyResponse.text();
        console.log(`Khalti raw response: ${responseText}`);

        if (!khaltiVerifyResponse.ok) {
            console.error('Khalti verification failed with status:', khaltiVerifyResponse.status);
            console.error('Khalti error response:', responseText);
            return res.status(500).json({ 
                success: false,
                error: `Khalti API Error (${khaltiVerifyResponse.status}): ${responseText}`,
                details: responseText 
            });
        }

        try {
            khaltiData = JSON.parse(responseText);
            console.log('Khalti parsed response:', khaltiData);
        } catch (parseError) {
            console.error('Failed to parse Khalti response:', parseError);
            return res.status(500).json({ 
                success: false,
                error: 'Invalid response from Khalti API',
                details: responseText 
            });
        }

        // Check if payment is completed (handle case sensitivity and variations)
        const paymentStatus = khaltiData.status ? String(khaltiData.status).toLowerCase() : '';
        console.log(`Khalti payment status: "${khaltiData.status}" (lowercase: "${paymentStatus}")`);
        
        // Accept multiple status values that indicate successful payment
        const successfulStatuses = ['completed', 'complete', 'success', 'paid'];
        const isPaymentSuccess = successfulStatuses.includes(paymentStatus);
        
        if (!isPaymentSuccess) {
            console.error(`Payment verification failed. Khalti status: "${khaltiData.status}" not in accepted list: ${successfulStatuses.join(', ')}`);
            return res.status(400).json({ 
                success: false,
                error: `Payment not completed. Current status: ${khaltiData.status}`,
                acceptedStatuses: successfulStatuses
            });
        }

        console.log(`Payment verification successful for pidx: ${pidx}`);

        // Use transaction to update payment, create token, and mark order as processed
        const result = await prisma.$transaction(async (tx) => {
            // Update payment status
            const payment = await tx.payment.update({
                where: { id: parseInt(paymentId) },
                data: {
                    status: 'PAID'
                }
            });
            console.log(`Updated payment ${paymentId} status to PAID`);

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
            console.log(`Created token ${token.id} with number ${token.tokenNumber}`);

            return { payment, token };
        });

        console.log(`Successfully verified Khalti payment for order ${orderId}`);

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
                customer: order.user,
                items: order.orderitem.map(item => ({
                    name: item.fooditem.name,
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
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            success: false,
            error: 'Failed to verify Khalti payment', 
            message: error.message 
        });
    }
};
