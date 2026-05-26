import mongoose from "mongoose";

const cropSchema = new mongoose.Schema(
  {
    farmer: { type: String, required: true },
    email: { type: String, required: true },
    crop: { type: String, required: true },
    quantity: { type: Number, required: true },
    location: String,
    basePrice: { type: Number, required: true },
    quality: { type: String, default: "Grade A" },
    timeLeft: Date,
  },
  { timestamps: true }
);

export default mongoose.model("MarketplaceCrop", cropSchema);
