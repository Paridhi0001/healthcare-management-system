const mongoose = require('mongoose');

const patientProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    age: {
      type: Number,
      required: [true, 'Please specify patient age'],
      min: 0,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Please specify patient gender'],
    },
    contactNumber: {
      type: String,
      trim: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
      default: 'Unknown'
    },
    allergies: [
      {
        type: String,
      }
    ],
    emergencyContactName: {
      type: String,
      trim: true,
    },
    emergencyContactPhone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    height: {
      type: Number, // In cm
      min: 0
    },
    weight: {
      type: Number, // In kg
      min: 0
    },
    medicalHistory: [
      {
        type: String, // e.g. "Diabetes", "Hypertension"
      }
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PatientProfile', patientProfileSchema);
