import express from 'express';
import { getUserTokens, khaltiInitiate, khaltiVerify } from '../controllers/paymentController.js';
import { requireAuth } from '../lib/auth.js';

const router = express.Router();

router.get('/tokens', requireAuth, getUserTokens);


router.post('/khalti/initiate', requireAuth, khaltiInitiate);

router.post('/khalti/verify', requireAuth, khaltiVerify);

export default router;
