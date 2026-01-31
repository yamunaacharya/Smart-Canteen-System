import express from 'express';
import { requireAuth, requireAdmin } from '../lib/auth.js';
import { getAdminStats, getCustomerStats } from '../controllers/statsController.js';

const router = express.Router();

// Get Admin Stats
router.get('/admin', requireAuth, requireAdmin, getAdminStats);

// Get Customer Stats
router.get('/customer', requireAuth, getCustomerStats);

export default router;
