import express from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import dotenv from "dotenv";

import Payment from "../models/Payment.js";
import CropBid from "../models/CropBid.js";
import TenderBid from "../models/TenderBid.js";

dotenv.config();
const router = express.Router();

// ✅ Debug env
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error("❌ Razorpay keys missing in .env");
}

// ✅ Razorpay instance (safe)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "test",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "test",
});


// ================== CREATE ORDER ==================
router.post("/create-order", async (req, res) => {
  try {
    console.log("📥 BODY:", req.body);

    const {
      bidId,
      bidType,
      payerEmail,
      payeeEmail,
      payerName,
      payeeName,
      amount,
      itemName,
      tenderNo,
    } = req.body;

    // ✅ Basic validation
    if (!bidId || !bidType || !payerEmail || !payeeEmail || !amount) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    if (!["crop", "tender"].includes(bidType)) {
      return res.status(400).json({
        success: false,
        error: "Invalid bidType",
      });
    }

    // ✅ Fetch bid
    let bid;
    if (bidType === "crop") {
      bid = await CropBid.findById(bidId);
    } else {
      bid = await TenderBid.findById(bidId);
    }

    if (!bid) {
      return res.status(404).json({
        success: false,
        error: "Bid not found",
      });
    }

    if (bid.isApproved !== true) {
      return res.status(403).json({
        success: false,
        error: "Bid not approved",
      });
    }

    const bidAmount =
      bidType === "crop" ? bid.bidAmount : bid.bidingAmount;

    // ✅ Safe amount check
    if (Number(amount) !== Number(bidAmount)) {
      return res.status(400).json({
        success: false,
        error: `Amount mismatch. Expected ${bidAmount}`,
      });
    }

    // ✅ Razorpay order
    const order = await razorpay.orders.create({
      amount: Number(bidAmount) * 100,
      currency: "INR",
      receipt: "rcpt_" + Date.now(),
    });

    // ✅ Save payment
    const payment = await Payment.create({
      bidId,
      bidType,
      payerEmail,
      payeeEmail,
      payerName,
      payeeName,
      amount: bidAmount,
      itemName,
      tenderNo,
      razorpayOrderId: order.id,
      status: "pending",
    });

    return res.json({
      success: true,
      order,
      payment,
    });

  } catch (err) {
    console.error("❌ CREATE ORDER ERROR:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});


// ================== VERIFY ==================
router.post("/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: "Missing payment details",
      });
    }

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: "Invalid signature",
      });
    }

    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: "Payment not found",
      });
    }

    payment.status = "completed";
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.paidAt = new Date();

    await payment.save();

    return res.json({
      success: true,
      payment,
    });

  } catch (err) {
    console.error("❌ VERIFY ERROR:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});


// ================== GET PAYMENTS ==================
router.get("/my/:email", async (req, res) => {
  try {
    const email = req.params.email.toLowerCase();

    const payments = await Payment.find({
      $or: [{ payerEmail: email }, { payeeEmail: email }],
    }).sort({ createdAt: -1 });

    return res.json({ success: true, payments });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

export default router;