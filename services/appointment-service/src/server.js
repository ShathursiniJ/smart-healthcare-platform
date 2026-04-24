import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5004;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Appointment service running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start appointment service:', error.message);
  process.exit(1);
});

// nodemon trigger
