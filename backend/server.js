import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import otpRoutes from "./routes/otp.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/otp", otpRoutes);

// mongo
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("Mongo error:", err.message));
} else {
  console.warn("MONGODB_URI not set");
}

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
