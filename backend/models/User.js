import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },
  password: { type: String },
  aadhar: {type:String},
  userType: { type: String, default: "farmer" }, 
  location: { type: String },
  landSize: { type: String },
  crops: { type: String },
  companyName: { type: String },
  businessType: { type: String },
  gstNumber: { type: String },
  registeredAt: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: false },
  verifyToken: { type: String },
  verifyTokenExpires: { type: Date },
});

export default mongoose.models.User || mongoose.model("User", userSchema);
