import mongoose from "mongoose";

const tenderSchema = new mongoose.Schema(
  {
    tenderNo: { type: String, unique: true },
    name: String,
    email: String,
    department: String,
    cropRequired: String,
    quantity: String,
    deliveryLocation: String,
    basePrice: String,
    deadline: Date,
    description: String,
    status: { type: String, default: "Active" },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("MarketplaceTender", tenderSchema);
