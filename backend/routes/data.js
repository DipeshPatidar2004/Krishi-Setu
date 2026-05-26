import express from "express";
import Crop from "../models/Crops.js";
import Tender from "../models/Tender.js";
import TenderBid from "../models/TenderBid.js";
import nodemailer from "nodemailer";
import CropBid from "../models/CropBid.js";
import dotenv from "dotenv"

const router = express.Router();
dotenv.config();

const {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
  SEND_SMS = "false",
  OTP_EXPIRY_MIN = "10",
  VERIFY_TOKEN_EXPIRES_HOURS = "24"
} = process.env;

const transporter = (EMAIL_USER && EMAIL_PASS) ? nodemailer.createTransport({
  host: EMAIL_HOST || "smtp.gmail.com",
  port: Number(EMAIL_PORT || 587),
  secure: false,
  auth: { user: EMAIL_USER, pass: EMAIL_PASS }
}) : null;

router.post("/postcrops", async (req, res) => {
  const {email,crop} = req.body;
  const user = await Crop.findOne({email,crop})
  if(user){
      return res.status(400).json({
        error: "PostCrop for this crop already exists"
      });
  }
  try {
    const crop = await Crop.create(req.body);
    res.status(201).json({ data: crop });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/getcrops", async (req, res) => {
  const crops = await Crop.find().sort({ createdAt: -1 });
  res.json(crops);
});

router.post("/posttenders", async (req, res) => {
  const {email,cropRequired} = req.body;
  const user = await Tender.findOne({email,cropRequired})
  if(user){
      return res.status(400).json({
        error: "Tender for this crop already exists"
      });
  }
  try {
    const tender = await Tender.create(req.body);
    res.status(201).json({ data: tender });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/gettenders", async (req, res) => {
  const tenders = await Tender.find().sort({ createdAt: -1 });
  res.json(tenders);
});

router.post("/bid", async (req, res) => {
  try {
    const { email, bidingAmount, buyerEmail, name } = req.body;
    const bid = await TenderBid.create(req.body);
    await transporter.sendMail({
    from: `"Krishi Setu" <${EMAIL_USER}>`,
    to: buyerEmail,
    subject: "New Bid Placed",
    html: `
      <div style="font-family:Arial;padding:20px;">
        <h2 style="color:green;">New Bid Received 🌾</h2>

        <p><b>Farmer Name:</b> ${name}</p>
        <p><b>Biding Amount:</b> ₹${bidingAmount}</p>

        <hr/>
        
        <p>Someone has placed a new bid on Krishi Setu marketplace.</p>

        <div style="margin-top:20px;">
          <a href="" 
            style="
              background-color:#28a745;
              color:white;
              padding:12px 20px;
              text-decoration:none;
              border-radius:5px;
              font-weight:bold;
              display:inline-block;">
              Approve Bid
          </a>
        </div>

        <p style="color:gray;font-size:14px;">
          This is an automated message from Krishi Setu.
        </p>
      </div>
    `,
  });
    res.status(201).json({ data: bid });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post("/cropbid", async (req, res) => {
  try{
  const { buyerName, buyerEmail, bidAmount, farmerEmail, cropName } = req.body

  const createdBid = await CropBid.create(req.body);

  await transporter.sendMail({
    from: `"Krishi Setu" <${EMAIL_USER}>`,
    to: farmerEmail,
    subject: "New Bid on Your Crop",
    html: `
      <div style="font-family:Arial;padding:20px;">
        <h2 style="color:green;">New Bid Received 🌾</h2>

        <p><b>Buyer Name:</b> ${buyerName}</p>
        <p><b>Crop Name:</b> ${cropName}</p>
        <p><b>Biding Amount:</b> ₹${bidAmount}</p>
        <hr/>
        <p>Someone has placed a new bid on Krishi Setu marketplace.</p>

        <div style="margin-top:20px;">
          <a href="http://localhost:4000/api/approve-bid/${createdBid._id}" 
            style="
              background-color:#28a745;
              color:white;
              padding:12px 20px;
              text-decoration:none;
              border-radius:5px;
              font-weight:bold;
              display:inline-block;">
              Approve Bid
          </a>
        </div>

        <p style="color:gray;font-size:14px;">
          This is an automated message from Krishi Setu.
        </p>
      </div>
    `
  })
    res.json({ message: "Bid placed" })
  }  catch (e) {
    res.status(400).json({ error: e.message });
  }
})

router.get("/approve-bid/:id", async (req, res) => {
  try {
    const bidId = req.params.id;

    const bid = await CropBid.findByIdAndUpdate(
      bidId,
      { isApproved: true },
      { new: true }
    );

    res.send(`
      <h2>✅ Bid Approved Successfully</h2>
      <p>You can now check it in your dashboard.</p>
    `);

  } catch (err) {
    res.status(500).send("Error approving bid");
  }
});

// ─── CROP BIDS: Fetch bids received by a farmer ───
router.get("/cropbids/:farmerEmail", async (req, res) => {
  try {
    const bids = await CropBid.find({ farmerEmail: req.params.farmerEmail }).sort({ createdAt: -1 });
    res.json({ success: true, bids });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── CROP BID: Approve or Reject ───
router.patch("/cropbid/:id", async (req, res) => {
  try {
    const { isApproved } = req.body;
    const bid = await CropBid.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true }
    );
    if (!bid) return res.status(404).json({ success: false, error: "Bid not found" });

    // ── Send approval email to buyer when bid is approved ──
    if (isApproved === true && transporter && bid.buyerEmail) {
      try {
        await transporter.sendMail({
          from: `"Krishi Setu" <${EMAIL_USER}>`,
          to: bid.buyerEmail,
          subject: "🎉 Your Crop Bid has been Approved — Pay Now!",
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
              <div style="background:linear-gradient(135deg,#16a34a,#15803d);padding:24px;border-radius:12px 12px 0 0;">
                <h2 style="color:white;margin:0;">🎉 Bid Approved!</h2>
                <p style="color:#bbf7d0;margin:4px 0 0;">Krishi Setu Marketplace</p>
              </div>
              <div style="border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 12px 12px;">
                <p>Dear <strong>${bid.buyerName}</strong>,</p>
                <p>Your bid of <strong>₹${bid.bidAmount}</strong> on crop <strong>${bid.cropName}</strong> has been <span style="color:#16a34a;font-weight:bold;">approved</span> by the farmer.</p>
                <p>You can now proceed to make the payment from your <strong>Payments</strong> dashboard on Krishi Setu.</p>
                <div style="margin:20px 0;">
                  <a href="http://localhost:5173" style="background:#16a34a;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">Go to Dashboard →</a>
                </div>
                <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;">
                <p style="color:#9ca3af;font-size:12px;">This is an automated message from Krishi Setu.</p>
              </div>
            </div>
          `,
        });
      } catch (emailErr) {
        console.warn("Approval email to buyer failed:", emailErr.message);
      }
    }

    res.json({ success: true, bid });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── TENDER BIDS: Fetch bids received by a buyer ───
router.get("/tenderbids/:buyerEmail", async (req, res) => {
  try {
    const bids = await TenderBid.find({ buyerEmail: req.params.buyerEmail }).sort({ createdAt: -1 });
    res.json({ success: true, bids });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── TENDER BID: Approve or Reject ───
router.patch("/tenderbid/:id", async (req, res) => {
  try {
    const { isApproved } = req.body;
    const bid = await TenderBid.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true }
    );
    if (!bid) return res.status(404).json({ success: false, error: "Bid not found" });

    // ── Send approval email to farmer when tender bid is approved ──
    if (isApproved === true && transporter && bid.email) {
      try {
        await transporter.sendMail({
          from: `"Krishi Setu" <${EMAIL_USER}>`,
          to: bid.email,
          subject: "🎉 Your Tender Bid has been Approved — Pay Now!",
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
              <div style="background:linear-gradient(135deg,#16a34a,#15803d);padding:24px;border-radius:12px 12px 0 0;">
                <h2 style="color:white;margin:0;">🎉 Tender Bid Approved!</h2>
                <p style="color:#bbf7d0;margin:4px 0 0;">Krishi Setu Marketplace</p>
              </div>
              <div style="border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 12px 12px;">
                <p>Dear <strong>${bid.name}</strong>,</p>
                <p>Your bid of <strong>₹${bid.bidingAmount}</strong> on tender <strong>${bid.tenderNo}</strong> has been <span style="color:#16a34a;font-weight:bold;">approved</span> by the buyer.</p>
                <p>You can now proceed to make the payment from your <strong>Payments</strong> dashboard on Krishi Setu.</p>
                <div style="margin:20px 0;">
                  <a href="http://localhost:5173" style="background:#16a34a;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">Go to Dashboard →</a>
                </div>
                <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;">
                <p style="color:#9ca3af;font-size:12px;">This is an automated message from Krishi Setu.</p>
              </div>
            </div>
          `,
        });
      } catch (emailErr) {
        console.warn("Approval email to farmer failed:", emailErr.message);
      }
    }

    res.json({ success: true, bid });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── CROP BIDS: Fetch bids placed BY a buyer ───
router.get("/cropbids-by-buyer/:buyerEmail", async (req, res) => {
  try {
    const bids = await CropBid.find({ buyerEmail: req.params.buyerEmail }).sort({ createdAt: -1 });
    res.json({ success: true, bids });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
