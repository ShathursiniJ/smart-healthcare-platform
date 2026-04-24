import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

await mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection.db;

// Delete old admin records
await db.collection("users").deleteMany({ 
  $or: [
    { email: "admin@healthcare.com" },
    { email: "tharsigaranganathan@gmail.com" },
    { email: "Tharsigaranganathan@gmail.com" }
  ] 
});
console.log("Previous admin records cleared");

// Insert correct admin record
const passwordHash = await bcrypt.hash("Saru1501@", 12);

await db.collection("users").insertOne({
  name: "Admin",
  email: "tharsigaranganathan@gmail.com",
  passwordHash: passwordHash,
  role: "admin",
  isEmailVerified: true,
  accountStatus: "active",
  createdAt: new Date(),
  updatedAt: new Date()
});

console.log("Admin created successfully");
console.log("Email: Tharsigaranganathan@gmail.com");
console.log("Password: Saru1501@");

await mongoose.disconnect();
process.exit(0);