import express from 'express';
import { requireAuth, requireAdmin } from '../lib/auth.js';
import { getCustomers, deleteUser, updateUser } from '../controllers/userController.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireAdmin);

router.get('/customers', getCustomers);
router.delete('/:id', deleteUser);
router.put('/:id', updateUser);

export default router;
