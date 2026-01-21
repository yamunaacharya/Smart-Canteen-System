import express from 'express';
import { getAllFoodItems, createFoodItem } from '../controllers/foodController.js';
import { requireAuth } from '../lib/auth.js';

const router = express.Router();

// Public: Get all food items
router.get('/', getAllFoodItems);

// Protected: Create food item (Admin only logic handles inside controller)
router.post('/', requireAuth, createFoodItem);

export default router;
