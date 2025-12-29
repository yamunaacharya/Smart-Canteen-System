import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';


dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

import authRoutes from './src/routes/auth.js';

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// auth
app.use('/api/auth', authRoutes);

// example protected route
import { requireAuth } from './src/lib/auth.js';
app.get('/api/protected', requireAuth, (req, res) => {
  res.json({ message: 'You have access to a protected route', user: req.user });
});


app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
