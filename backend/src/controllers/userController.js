import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcryptjs';

export async function getCustomers(req, res) {
    try {
        const customers = await prisma.user.findMany({
            where: { role: 'CUSTOMER' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(customers);
    } catch (err) {
        console.error('Get customers error:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

export async function deleteUser(req, res) {
    try {
        const { id } = req.params;
        await prisma.user.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

export async function updateUser(req, res) {
    try {
        const { id } = req.params;
        const { name, email, password } = req.body;

        const data = { name, email };

        if (password) {
            const salt = await bcrypt.genSalt(10);
            data.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data,
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        });

        res.json(updatedUser);
    } catch (err) {
        console.error('Update user error:', err);
        res.status(500).json({ message: 'Server error' });
    }
}
