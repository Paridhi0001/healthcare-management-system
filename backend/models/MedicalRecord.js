const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    diagnosis: {
      type: String,
      required: [true, 'Please specify the diagnosis'],
      trim: true,
    },
    symptoms: {
      type: String,
      trim: true,
    },
    prescription: {
      type: String, // e.g. "Amoxicillin 500mg, 3x daily"
      trim: true,
    },
    treatmentPlan: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
