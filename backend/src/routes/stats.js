import express from 'express';
import { requireAuth, requireAdmin } from '../lib/auth.js';
import { getAdminStats, getCustomerStats, getTopSalesItems, getMostSoldItems } from '../controllers/statsController.js';

const router = express.Router();

// Get Admin Stats
router.get('/admin', requireAuth, requireAdmin, getAdminStats);

// Get Customer Stats
router.get('/customer', requireAuth, getCustomerStats);

// Get Top Sales Items
router.get('/top-sales', requireAuth, requireAdmin, getTopSalesItems);

// Get Most Sold Items
router.get('/most-sold', requireAuth, requireAdmin, getMostSoldItems);

export default router;
