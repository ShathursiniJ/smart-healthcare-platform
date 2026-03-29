import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import connectDB from './config/db.js';

connectDB();

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`Doctor service running on port ${PORT}`);
});