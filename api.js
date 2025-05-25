import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import { verifyToken } from './middleware/auth.js';

const api = express();

// Middleware
api.use(cors());
api.use(express.json());

// Base route
api.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

// Routes
api.use('/api/auth', authRoutes);
api.use('/api/chat', verifyToken, chatRoutes);

// Protected route example
api.get('/api/protected', verifyToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

export default api;