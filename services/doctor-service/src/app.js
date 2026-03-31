import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import doctorRoutes from './routes/doctorRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import errorHandler from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/doctors', doctorRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Doctor service running' });
});

app.use(errorHandler);

export default app;