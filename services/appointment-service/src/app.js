import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import appointmentRoutes from './routes/appointmentRoutes.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) =>
  res.json({ success: true, message: 'Appointment service running', port: process.env.PORT || 5004 })
);

app.use('/api/appointments', appointmentRoutes);
app.use(errorHandler);

export default app;
