import { prisma } from '../lib/prisma.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

export const getAllFoodItems = async (req, res) => {
    try {
        const { category } = req.query;
        const where = {};
        if (category) {
            where.category = category;
        }

        const foods = await prisma.fooditem.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        res.json(foods);
    } catch (error) {
        console.error('Error fetching food items:', error);
        res.status(500).json({ error: 'Failed to fetch food items' });
    }
};

export const getFoodItemById = async (req, res) => {
    try {
        const { id } = req.params;

        const food = await prisma.fooditem.findUnique({
            where: { id: parseInt(id) }
        });

        if (!food) {
            return res.status(404).json({ error: 'Food item not found' });
        }

        res.json(food);
    } catch (error) {
        console.error('Error fetching food item:', error);
        res.status(500).json({ error: 'Failed to fetch food item' });
    }
};

export const createFoodItem = async (req, res) => {
    try {
        const { name, price, category, description, qty } = req.body;
        const imageFile = req.file;

        console.log('Request body:', req.body);
        console.log('Image file:', imageFile);

        if (!name || !price || !description) {
            return res.status(400).json({ error: 'Name, price, and description are required' });
        }

        // Check if user is admin
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied: Admins only' });
        }

        let imageUrl = null;

        // Handle image upload
        if (imageFile) {
            const fileName = `${Date.now()}-${imageFile.originalname}`;
            const filePath = path.join(uploadsDir, fileName);
            fs.writeFileSync(filePath, imageFile.buffer);
            imageUrl = `/uploads/${fileName}`;
        }

        const newFood = await prisma.fooditem.create({
            data: {
                name,
                price: parseFloat(price),
                qty: parseInt(qty) || 1,
                category: category || 'food',
                description: description || '',
                image: imageUrl
            }
        });

        res.status(201).json(newFood);
    } catch (error) {
        console.error('Error creating food item:', error);
        res.status(500).json({ error: 'Failed to create food item', message: error.message, stack: error.stack });
    }
};

export const updateFoodItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, category, description, qty } = req.body;
        const imageFile = req.file;

        // Check if user is admin
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied: Admins only' });
        }

        const existingItem = await prisma.fooditem.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingItem) {
            return res.status(404).json({ error: 'Food item not found' });
        }

        let imageUrl = existingItem.image;

        // Handle image upload
        if (imageFile) {
            // Delete old image if exists
            if (existingItem.image) {
                const oldImagePath = path.join(__dirname, '../../', existingItem.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            const fileName = `${Date.now()}-${imageFile.originalname}`;
            const filePath = path.join(uploadsDir, fileName);
            fs.writeFileSync(filePath, imageFile.buffer);
            imageUrl = `/uploads/${fileName}`;
        }

        const updatedFood = await prisma.fooditem.update({
            where: { id: parseInt(id) },
            data: {
                ...(name && { name }),
                ...(price && { price: parseFloat(price) }),
                ...(qty && { qty: parseInt(qty) }),
                ...(category && { category }),
                ...(description && { description }),
                ...(imageUrl && { image: imageUrl })
            }
        });

        res.json(updatedFood);
    } catch (error) {
        console.error('Error updating food item:', error);
        res.status(500).json({ error: 'Failed to update food item', message: error.message });
    }
};

export const deleteFoodItem = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user is admin
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied: Admins only' });
        }

        const existingItem = await prisma.fooditem.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingItem) {
            return res.status(404).json({ error: 'Food item not found' });
        }

        // Delete image file if exists
        if (existingItem.image) {
            const imagePath = path.join(__dirname, '../../', existingItem.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await prisma.fooditem.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Food item deleted successfully' });
    } catch (error) {
        console.error('Error deleting food item:', error);
        res.status(500).json({ error: 'Failed to delete food item', message: error.message });
    }
};

// Add item to cart - decrease stock quantity
export const addToCartStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity = 1 } = req.body;

        const food = await prisma.fooditem.findUnique({
            where: { id: parseInt(id) }
        });

        if (!food) {
            return res.status(404).json({ error: 'Food item not found' });
        }

        if (food.a_status === 'OUT_OF_STOCK' || food.qty < quantity) {
            return res.status(400).json({ error: `${food.name} is out of stock or insufficient quantity` });
        }

        const newQty = food.qty - quantity;

        const updatedFood = await prisma.fooditem.update({
            where: { id: parseInt(id) },
            data: {
                qty: newQty,
                a_status: newQty <= 0 ? 'OUT_OF_STOCK' : food.a_status
            }
        });

        res.json({ success: true, item: updatedFood });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ error: 'Failed to add item to cart', message: error.message });
    }
};

export const removeFromCartStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity = 1 } = req.body;

        const food = await prisma.fooditem.findUnique({
            where: { id: parseInt(id) }
        });

        if (!food) {
            return res.status(404).json({ error: 'Food item not found' });
        }

        const newQty = food.qty + quantity;

        const updatedFood = await prisma.fooditem.update({
            where: { id: parseInt(id) },
            data: {
                qty: newQty,
                a_status: newQty > 0 ? 'AVAILABLE' : food.a_status
            }
        });

        res.json({ success: true, item: updatedFood });
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ error: 'Failed to remove item from cart', message: error.message });
    }
};
