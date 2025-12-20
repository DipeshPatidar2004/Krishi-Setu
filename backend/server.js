import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import otpRoutes from "./routes/otp.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;
const { MONGODB_URI } = process.env;

// ===== Middlewares =====
app.use(express.json());
app.use(cors());

// ===== MongoDB =====
async function connectDB() {
  try {
    if (!MONGODB_URI) {
      console.warn("MONGODB_URI not set");
      return;
    }
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB error:", err.message);
  }
}
connectDB();

// ===== API Routes =====
app.use("/api/auth", authRoutes);
app.use("/api/otp", otpRoutes);

// ===== Serve Frontend =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// frontend/dist path
app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
