import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://admin:admin123@mongodb:27017/?authSource=admin";

async function seed() {
  try {
    const conn = await mongoose.createConnection(MONGO_URI).asPromise();
    console.log("Connected to MongoDB");

    // 1. Seed Auth DB
    const authDb = conn.useDb("auth_db");
    const usersColl = authDb.collection("users");

    const passwordHash = await bcrypt.hash("Patient@123", 12);
    const doctorPasswordHash = await bcrypt.hash("Doctor@123", 12);

    await usersColl.deleteMany({ email: { $in: ["patient@healthcare.com", "doctor@healthcare.com"] } });

    const patientAuthId = new mongoose.Types.ObjectId();
    const doctorAuthId = new mongoose.Types.ObjectId();

    await usersColl.insertOne({
      _id: patientAuthId,
      name: "Test Patient",
      email: "patient@healthcare.com",
      passwordHash: passwordHash,
      role: "patient",
      isEmailVerified: true,
      accountStatus: "active",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await usersColl.insertOne({
      _id: doctorAuthId,
      name: "Dr. Smith",
      email: "doctor@healthcare.com",
      passwordHash: doctorPasswordHash,
      role: "doctor",
      isEmailVerified: true,
      accountStatus: "active",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log("Auth users seeded");

    // 2. Seed Doctor DB
    const doctorDb = conn.useDb("doctor_db");
    const doctorsColl = doctorDb.collection("doctors");

    await doctorsColl.deleteMany({ email: "doctor@healthcare.com" });

    await doctorsColl.insertOne({
      authUserId: doctorAuthId.toString(),
      name: "Dr. Smith",
      email: "doctor@healthcare.com",
      specialization: "General Physician",
      licenseNumber: "DOC123456",
      hospital: "City Hospital",
      consultationFee: 500,
      approvalStatus: "approved",
      isActive: true,
      availability: [
        { day: "Monday", startTime: "09:00", endTime: "17:00", isBooked: false },
        { day: "Wednesday", startTime: "09:00", endTime: "17:00", isBooked: false }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log("Doctor profile seeded");

    // 3. Seed Patient DB
    const patientDb = conn.useDb("patient_db");
    const patientsColl = patientDb.collection("patientprofiles"); // Note: Mongoose might lowercase it

    await patientsColl.deleteMany({ email: "patient@healthcare.com" });

    await patientsColl.insertOne({
      authUserId: patientAuthId.toString(),
      fullName: "Test Patient",
      email: "patient@healthcare.com",
      phone: "1234567890",
      gender: "male",
      bloodGroup: "O+",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log("Patient profile seeded");

    await conn.close();
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();
