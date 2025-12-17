import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  identifier: { type: String, required: true }, // email or phone
  otp: { type: String, required: true },
  channel: { type: String, enum: ["email", "sms"], required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  verified: { type: Boolean, default: false }
});

export default mongoose.models.Otp || mongoose.model("Otp", otpSchema);
