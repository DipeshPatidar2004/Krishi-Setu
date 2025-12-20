import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import otpRoutes from "./routes/otp.js";

dotenv.config();

// ----------- Config -----------
const PORT = process.env.PORT || 10000;
const MONGODB_URI = process.env.MONGODB_URI;

// ----------- App -----------
const app = express();

app.use(cors());
app.use(express.json());

// ----------- MongoDB -----------
async function connectDB() {
  try {
    if (!MONGODB_URI) {
      console.warn("⚠️ MONGODB_URI not set");
      return;
    }
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
  }
}
connectDB();

// ----------- API Routes -----------
app.use("/api/auth", authRoutes);
app.use("/api/otp", otpRoutes);

// ----------- Serve Frontend (Vite) -----------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⚠️ path assumes: root/frontend/dist
app.use(express.static(path.join(__dirname, "frontend", "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

// ----------- Start Server -----------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
