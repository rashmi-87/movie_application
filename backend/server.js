import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
import connectDB from './config/database.js';
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
import authRoutes from './routes/auth.js';
import movieRoutes from './routes/movies.js';
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);

// Error handling middleware
import { errorHandler } from './middleware/errorHandler.js';
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Import queue AFTER server starts
  import('./services/queue.js');
});