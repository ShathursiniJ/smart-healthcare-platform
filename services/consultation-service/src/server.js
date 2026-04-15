import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import connectDB from './config/db.js';

connectDB();

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`Consultation service running on port ${PORT}`);
});
