import express from 'express';
import multer from 'multer';
import { getAllFoodItems, createFoodItem, updateFoodItem, deleteFoodItem } from '../controllers/foodController.js';
import { requireAuth } from '../lib/auth.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Public: Get all food items
router.get('/', getAllFoodItems);

// Protected: Create food item (Admin only)
router.post('/', requireAuth, upload.single('image'), createFoodItem);

// Protected: Update food item (Admin only)
router.put('/:id', requireAuth, upload.single('image'), updateFoodItem);

// Protected: Delete food item (Admin only)
router.delete('/:id', requireAuth, deleteFoodItem);

export default router;
