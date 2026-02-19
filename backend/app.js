import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

import authRoutes from './src/routes/auth.js';
import userRoutes from './src/routes/user.js';
import foodRoutes from './src/routes/food.js';
import orderRoutes from './src/routes/orders.js';
import statsRoutes from './src/routes/stats.js';
import paymentRoutes from './src/routes/payments.js';

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// auth
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/menu', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/payments', paymentRoutes);

// example protected route
import { requireAuth } from './src/lib/auth.js';
app.get('/api/protected', requireAuth, (req, res) => {
  res.json({ message: 'You have access to a protected route', user: req.user });
});


app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
