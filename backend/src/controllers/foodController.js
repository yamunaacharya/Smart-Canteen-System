import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllFoodItems = async (req, res) => {
    try {
        const { category } = req.query;
        const where = {};
        if (category) {
            where.category = category;
        }

        const foods = await prisma.foodItem.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        res.json(foods);
    } catch (error) {
        console.error('Error fetching food items:', error);
        res.status(500).json({ error: 'Failed to fetch food items' });
    }
};

export const createFoodItem = async (req, res) => {
    try {
        const { name, price, qty, category, image } = req.body;

        if (!name || !price || !qty) {
            return res.status(400).json({ error: 'Name, price, and quantity are required' });
        }

        // specific role check: admin only?
        // assuming req.user is populated by requireAuth
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied: Admins only' });
        }

        const newFood = await prisma.foodItem.create({
            data: {
                name,
                price: parseFloat(price),
                qty: parseInt(qty),
                category: category || 'Food',
                image: image || null
            }
        });

        res.status(201).json(newFood);
    } catch (error) {
        console.error('Error creating food item:', error);
        res.status(500).json({ error: 'Failed to create food item' });
    }
};
