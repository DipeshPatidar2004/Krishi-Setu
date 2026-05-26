import mongoose from "mongoose";

const bidSchema = new mongoose.Schema(
{
  name: { type: String, required: true },
  email: { type: String, required: true },
  userType: { type: String, required: true },
  bidingAmount: { type: Number, required: true },
  buyerEmail: {type: String, required: true},   
  tenderNo: {type: String, required: true},
  isApproved: {
    type: Boolean,
    default: null  
  }
  },
  { timestamps: true }
);

export default mongoose.model("BidingAmount", bidSchema);