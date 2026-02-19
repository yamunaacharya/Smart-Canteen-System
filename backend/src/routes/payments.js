import express from 'express';
import { processCashPayment, getUserTokens } from '../controllers/paymentController.js';
import { requireAuth } from '../lib/auth.js';

const router = express.Router();

// Protected: Process cash payment
router.post('/cash', requireAuth, processCashPayment);

// Protected: Get user's tokens
router.get('/tokens', requireAuth, getUserTokens);

export default router;
