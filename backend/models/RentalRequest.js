import mongoose from 'mongoose'

const rentalRequestSchema = new mongoose.Schema(
  {
    equipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
      required: true,
    },

    equipmentName: {
      type: String,
      required: true,
    },

    ownerId: {
      type: String,
      required: true,
    },

    ownerName: {
      type: String,
      required: true,
    },

    renterId: {
      type: String,
      required: true,
    },

    renterName: {
      type: String,
      required: true,
    },

    renterContact: {
      type: String,
      required: true,
    },

    fromDate: {
      type: Date,
      required: true,
    },

    toDate: {
      type: Date,
      required: true,
    },

    message: {
      type: String,
      default: '',
    },

    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
)

const RentalRequest = mongoose.model(
  'RentalRequest',
  rentalRequestSchema
)

export default RentalRequest