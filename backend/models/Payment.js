import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    bidId: {
      type: String,
      required: true,
    },

    bidType: {
      type: String,
      enum: ["crop", "tender"],
      required: true,
    },

    payerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    payeeEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    payerName: String,
    payeeName: String,

    amount: {
      type: Number,
      required: true,
    },

    itemName: String,
    tenderNo: String,

    // ✅ Razorpay fields
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,

    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },

    paidAt: Date,
    failureReason: String,
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);