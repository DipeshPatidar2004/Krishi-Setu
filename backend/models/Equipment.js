import mongoose from 'mongoose'

const equipmentSchema = new mongoose.Schema(
  {
    ownerName: {
      type: String,
      required: true,
      trim: true,
    },

    ownerId: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: [
        'tractor',
        'harvester',
        'seeder',
        'rotavator',
        'sprayer',
        'other',
      ],
      default: 'other',
    },

    description: {
      type: String,
      default: '',
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    ratePerDay: {
      type: Number,
      required: true,
      min: 1,
    },

    contact: {
      type: String,
      required: true,
      trim: true,
    },

    available: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

const Equipment = mongoose.model(
  'Equipment',
  equipmentSchema
)

export default Equipment