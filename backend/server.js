import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import optRoutes from './routes/otp.js'

dotenv.config();

const {
  PORT = 4000,
  MONGODB_URI,
} = process.env;
// Warn if Mongo URI missing (but continue so dev fallback still works)
if (!MONGODB_URI) {
  console.warn("Warning: MONGODB_URI not set in .env — server will not connect to DB");
}

const app = express();
app.use(express.json());
app.use(cors()); // allow calls from your frontend dev server

// Connect to MongoDB
async function connectDB() {
  try {
    if (!MONGODB_URI) return;
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
  }
}
connectDB();

// ------- Routes (OTP) -------
app.use("/api/auth", authRoutes);
// ------- Routes (OTP) -------
app.use("/api/otp", optRoutes);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
