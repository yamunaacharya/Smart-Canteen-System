import express from 'express';
import { createOrder, getUserOrders, getOrderById, updateOrderStatus, getAllOrders } from '../controllers/orderController.js';
import { requireAuth } from '../lib/auth.js';

const router = express.Router();

// Protected: Create order
router.post('/', requireAuth, createOrder);

// Protected: Get user's orders
router.get('/', requireAuth, getUserOrders);

// Protected: Get all orders (Admin only) — MUST be before /:id to avoid route conflict
router.get('/admin/all', requireAuth, getAllOrders);

// Protected: Get order by ID
router.get('/:id', requireAuth, getOrderById);

// Protected: Update order status (Admin only)
router.patch('/:id/status', requireAuth, updateOrderStatus);

export default router;
