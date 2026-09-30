import express from "express";
import crypto from "crypto";
import nodemailer from "nodemailer";
import User from "../models/User.js";   
import dotenv from "dotenv";

const router = express.Router();
const BACKEND_URL = "http://localhost:4000";
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

if (transporter) {
  transporter.verify().then(() => console.log("Email transporter ready"))
               .catch(err => console.warn("Email transporter verify failed:", err.message));
}



router.post("/register", async (req, res) => {
  try {
    const payload = req.body;
    const { email, phone } = payload;

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        error: "Provide email or phone",
      });
    }


    if (email) {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({
          success: false,
          error: "Email already registered",
        });
      }
    }

    const user = new User(payload);
    
        
    const token = crypto.randomBytes(32).toString("hex");
    user.verifyToken = token;
    user.verifyTokenExpires = Date.now() + 1000 * 60 * 60 * 24; 
    
    await user.save();

    const verifyLink = `${BACKEND_URL}/api/auth/verify-email?token=${token}&userId=${user._id}`;

    if (user.email&&user.userType=="farmer") {
      await transporter.sendMail({
        from: `"Krishi Setu" <${EMAIL_USER}>`,
        to: ``,
        subject: "Verify user email",
        html: `
              <div>
                <h2>Farmer Name: ${user.name || ""},</h2>

                <p>Here are the details of farmer:</p>

                <ul>
                  <li><strong>Aadhaar Number:</strong> ${user.aadhar || ""}</li>
                  <li><strong>Phone Number:</strong> ${user.phone || ""}</li>
                  <li><strong>Land Size:</strong> ${user.landSize || ""}</li>
                </ul>

                <p>Please verify email by clicking the link below:</p>

                <a href="${verifyLink}">${verifyLink}</a>

                <p>This link will expire in 24 hours.</p>
              </div>
            `,
      });
    }
    if (user.email&&user.userType=="buyer") {
      await transporter.sendMail({
        from: `"Krishi Setu" <${EMAIL_USER}>`,
        to: ``,
        subject: "Verify user email",
        html: `
              <div>
                <h2>Buyer Name: ${user.name || ""},</h2>

                <p>Here are  the details of buyer:</p>

                <ul>
                  <li><strong>GST Number:</strong> ${user.gstNumber || ""}</li>
                  <li><strong>Phone Number:</strong> ${user.phone || ""}</li>
                  <li><strong>Business Type:</strong> ${user.businessType || ""}</li>
                </ul>

                <p>Please verify email by clicking the link below:</p>

                <a href="${verifyLink}">${verifyLink}</a>

                <p>This link will expire in 24 hours.</p>
              </div>
            `,
      });
    }
    return res.json({
      success: true,
      message: "User registered. Verification link sent to email.",
      verifyLink,
      user,
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }
});

router.get("/verify-email", async (req, res) => {
  try {
    const { token, userId } = req.query;

    if (!token || !userId) {
      return res.status(400).json({
        success: false,
        error: "Token and userId required",
      });
    }

  const user = await User.findOne({
  _id: userId,
  verifyToken: token,
  verifyTokenExpires: { $gt: new Date() }, 
});


    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired verification link",
      });
    }

    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpires = undefined;
    await user.save();

    return res.redirect("http://localhost:5173/verified-success-page");
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});


router.post("/login", async (req, res) => {
  try {
    let { email, password, userType } = req.body;

    // normalize
    email = (email || "").trim().toLowerCase();
    password = (password || "").trim();

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Email and password required" });
    }

    // 1) sirf email se user dhundo
    const user = await User.findOne({ email });

    if (!user) {
      console.log("LOGIN: user not found for email", email);
      return res
        .status(401)
        .json({ success: false, error: "User not found with this email" });
    }

    // 2) agar role bheja hai to check karo
    if (userType && ALLOWED_USER_TYPES.includes(userType)) {
      if (user.userType !== userType) {
        console.log(
          "LOGIN: role mismatch. DB:",
          user.userType,
          "CLIENT:",
          userType
        );
        return res.status(400).json({
          success: false,
          error: `You are registered as '${user.userType}', not '${userType}'`,
        });
      }
    }

    // 3) password check
    if (user.password !== password) {
      console.log("LOGIN: wrong password for", email);
      return res
        .status(401)
        .json({ success: false, error: "Incorrect password" });
    }

    // 4) verify check
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        error: "Please verify your email before login",
      });
    }

    // 5) success
    return res.json({
      success: true,
      user,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

// FIND USER BY EMAIL OR PHONE (for OTP login)
router.post("/find", async (req, res) => {
  try {
    const { identifier } = req.body;

    if (!identifier)
      return res
        .status(400)
        .json({ success: false, error: "identifier required" });

    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });

    if (!user)
      return res.json({
        success: false,
        user: null,
      });

    return res.json({
      success: true,
      user,
    });
  } catch (err) {
    return res.json({
      success: false,
      error: err.message,
    });
  }
});

// ─── UPDATE PROFILE ───
router.patch("/profile/:id", async (req, res) => {
  try {
    const allowedFields = [
      "name", "email", "phone", "location",
      "landSize", "crops", "aadhar",
      "companyName", "businessType", "gstNumber"
    ];

    const updates = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.json({ success: true, user });
  } catch (err) {
    console.error("Profile update error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── CHANGE PASSWORD ───
router.post("/change-password/:id", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: "Both passwords required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (user.password !== currentPassword) {
      return res.status(401).json({ success: false, error: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    return res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── DELETE ACCOUNT ───
router.delete("/profile/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    return res.json({ success: true, message: "Account deleted successfully" });
  } catch (err) {
    console.error("Delete account error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
