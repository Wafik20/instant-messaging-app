import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import { verifyToken } from './middleware/auth.js';
import constants from './constants/constants.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Base route
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', verifyToken, chatRoutes);

// Protected route example
app.get('/api/protected', verifyToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

app.listen(constants.SERVER_PORT, () => {
  console.log(`Server is running on port ${constants.SERVER_PORT}`);
}); 