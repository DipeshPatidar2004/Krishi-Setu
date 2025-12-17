import express from "express";
import nodemailer from "nodemailer";
import fetch from "node-fetch";
import Otp from "../models/Otp.js";
import dotenv from "dotenv";

const router = express.Router();
dotenv.config();

const {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER,
  SEND_SMS = "false",
  OTP_EXPIRY_MIN = "10"
} = process.env;

let transporter = null;
if (EMAIL_USER && EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    host: EMAIL_HOST || "smtp.gmail.com",
    port: Number(EMAIL_PORT || 587),
    secure: false,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS }
  });
  transporter.verify().then(() => console.log("Email transporter ready")).catch(() => console.log("Email transporter not verified"));
}

function generateNumericOTP(length = 6) {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) otp += digits[Math.floor(Math.random() * digits.length)];
  return otp;
}

async function sendEmailOtp(toEmail, otp) {
  const mailOptions = {
    from: EMAIL_USER,
    to: toEmail,
    subject: "Your OTP code",
    text: `Your OTP is ${otp}. It expires in ${OTP_EXPIRY_MIN} minutes.`
  };
  if (!transporter) throw new Error("No email transporter configured");
  return transporter.sendMail(mailOptions);
}

async function sendSmsViaTwilio(toPhone, otp) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    throw new Error("Missing Twilio config in .env");
  }
  const payload = new URLSearchParams({
    To: toPhone,
    From: TWILIO_PHONE_NUMBER,
    Body: `Your OTP is ${otp}. It expires in ${OTP_EXPIRY_MIN} minutes.`
  });
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");
  const res = await fetch(url, {
    method: "POST",
    body: payload,
    headers: { Authorization: `Basic ${auth}` }
  });
  return res.json();
}

// Request OTP
router.post("/request-otp", async (req, res) => {
  try {
    const { identifier, channel } = req.body;
    if (!identifier || !channel) return res.status(400).json({ error: "identifier and channel required" });
    if (!["email", "sms"].includes(channel)) return res.status(400).json({ error: "channel must be 'email' or 'sms'" });

    const otp = generateNumericOTP(6);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + Number(OTP_EXPIRY_MIN) * 60000);

    const record = new Otp({ identifier, otp, channel, expiresAt });
    await record.save().catch(e => console.warn("OTP save warning:", e.message));

    if (channel === "email") {
      if (transporter) {
        await sendEmailOtp(identifier, otp);
      } else {
        console.log(`[DEV EMAIL] to=${identifier} otp=${otp}`);
      }
    } else {
      if (String(SEND_SMS).toLowerCase() === "true") {
        try {
          await sendSmsViaTwilio(identifier, otp);
        } catch (err) {
          console.warn("Twilio send failed — fallback to console. Error:", err.message);
          console.log(`[DEV SMS] to=${identifier} otp=${otp}`);
        }
      } else {
        console.log(`[DEV SMS] to=${identifier} otp=${otp}`);
      }
    }

    return res.json({ ok: true, message: `OTP sent to ${channel}` });
  } catch (err) {
    console.error("Request OTP error:", err);
    return res.status(500).json({ error: "internal server error" });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { identifier, channel, otp } = req.body;
    if (!identifier || !channel || !otp) return res.status(400).json({ error: "identifier, channel and otp required" });

    const record = await Otp.findOne({ identifier, channel }).sort({ createdAt: -1 });
    if (!record) return res.status(400).json({ error: "No OTP request found" });
    if (record.verified) return res.status(400).json({ error: "OTP already used" });

    if (new Date() > record.expiresAt) return res.status(400).json({ error: "OTP expired" });
    if (record.otp !== String(otp)) return res.status(400).json({ error: "OTP mismatch" });

    record.verified = true;
    await record.save().catch(e => console.warn("Error saving verify:", e.message));

    return res.json({ ok: true, message: "OTP verified" });
  } catch (err) {
    console.error("Verify OTP error:", err);
    return res.status(500).json({ error: "internal server error" });
  }
});

export default router;
