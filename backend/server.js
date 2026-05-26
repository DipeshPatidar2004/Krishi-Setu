import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import dataRoutes from "./routes/data.js";
import authRoutes from "./routes/auth.js";
import equipmentRoutes from './routes/equipmentRoutes.js'
import optRoutes from "./routes/otp.js";
import paymentRoutes from "./routes/payment.js";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// ------- Routes (OTP) -------
app.use("/api/auth", authRoutes);
// ------- Routes (OTP) -------
app.use("/api/otp", optRoutes);
app.use("/api/marketPlace", dataRoutes);
// ------- Routes (Payment) -------
app.use("/api/payment", paymentRoutes);

app.use('/api/equipment', equipmentRoutes)


app.listen(4000, () =>
  console.log("Server running on http://localhost:4000")
);
