import express from 'express';
import * as ctrl from '../controllers/authController.js';
import { requireAuth } from '../lib/auth.js';

const router = express.Router();

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.get('/me', requireAuth, ctrl.me);
router.post('/change-password', requireAuth, ctrl.changePassword);

export default router;
