import mongoose from "mongoose";

const bidSchema = new mongoose.Schema({

  buyerName:{
    type:String,
    required:true
  },

  buyerEmail:{
    type:String,
    required:true
  },

  bidAmount:{
    type:Number,
    required:true
  },

  farmerEmail:{
    type:String
  },

  cropName:{
    type:String
  },

  createdAt:{
    type:Date,
    default:Date.now
  },

  isApproved: {
    type: Boolean,
    default: null   
  }

});

export default mongoose.model("CropBidingAmount",bidSchema);