import express from 'express';
import { processCashPayment, getUserTokens, khaltiInitiate, khaltiVerify } from '../controllers/paymentController.js';
import { requireAuth } from '../lib/auth.js';

const router = express.Router();

// Protected: Process cash payment
router.post('/cash', requireAuth, processCashPayment);

// Protected: Get user's tokens
router.get('/tokens', requireAuth, getUserTokens);

// Protected: Khalti payment initiate
router.post('/khalti/initiate', requireAuth, khaltiInitiate);

// Protected: Khalti payment verify
router.post('/khalti/verify', requireAuth, khaltiVerify);

export default router;
