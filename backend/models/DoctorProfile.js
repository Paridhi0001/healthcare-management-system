const mongoose = require('mongoose');

const doctorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    specialization: {
      type: String,
      required: [true, 'Please specify specialization'],
      trim: true,
    },
    experience: {
      type: Number,
      required: [true, 'Please specify years of experience'],
      min: 0,
    },
    fees: {
      type: Number,
      required: [true, 'Please specify consultation fees'],
      min: 0,
    },
    bio: {
      type: String,
      trim: true,
    },
    availableSlots: [
      {
        day: {
          type: String,
          enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          required: true,
        },
        timeSlots: [
          {
            type: String, // e.g. "09:00 - 10:00"
            required: true,
          }
        ]
      }
    ]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('DoctorProfile', doctorProfileSchema);
