const MedicalRecord = require('../models/MedicalRecord');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

// @desc    Create a new Medical Record
// @route   POST /api/records
// @access  Private (Doctor)
const createRecord = async (req, res, next) => {
  try {
    const { patientId, appointmentId, diagnosis, symptoms, prescription, treatmentPlan, notes } = req.body;

    if (!patientId || !diagnosis) {
      return res.status(400).json({ success: false, message: 'Please provide patientId and diagnosis' });
    }

    // Verify patient exists
    const patientUser = await User.findById(patientId);
    if (!patientUser || patientUser.role !== 'patient') {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Create record
    const record = await MedicalRecord.create({
      patient: patientId,
      doctor: req.user.id,
      appointment: appointmentId || null,
      diagnosis,
      symptoms,
      prescription,
      treatmentPlan,
      notes
    });

    // If linked to an appointment, mark appointment as completed
    if (appointmentId) {
      await Appointment.findByIdAndUpdate(appointmentId, { status: 'completed' });
    }

    res.status(201).json({
      success: true,
      message: 'Medical record created successfully',
      record
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all medical records (for admin)
// @route   GET /api/records
// @access  Private (Admin)
const getAllRecords = async (req, res, next) => {
  try {
    const records = await MedicalRecord.find()
      .populate('patient', 'name email')
      .populate('doctor', 'name email')
      .sort({ createdAt: -1 });

    const validRecords = records.filter(r => r.patient && r.doctor);

    res.status(200).json({ success: true, count: validRecords.length, records: validRecords });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current patient's records history
// @route   GET /api/records/my-records
// @access  Private (Patient)
const getMyRecords = async (req, res, next) => {
  try {
    const records = await MedicalRecord.find({ patient: req.user.id })
      .populate('doctor', 'name email')
      .sort({ createdAt: -1 });

    const validRecords = records.filter(r => r.doctor);

    res.status(200).json({ success: true, count: validRecords.length, records: validRecords });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a specific patient's records history
// @route   GET /api/records/patient/:patientId
// @access  Private (Doctor, Admin)
const getPatientRecords = async (req, res, next) => {
  try {
    const records = await MedicalRecord.find({ patient: req.params.patientId })
      .populate('patient', 'name email')
      .populate('doctor', 'name email')
      .sort({ createdAt: -1 });

    const validRecords = records.filter(r => r.patient && r.doctor);

    res.status(200).json({ success: true, count: validRecords.length, records: validRecords });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a medical record
// @route   PUT /api/records/:id
// @access  Private (Doctor)
const updateRecord = async (req, res, next) => {
  try {
    const { diagnosis, symptoms, prescription, treatmentPlan, notes } = req.body;
    let record = await MedicalRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ success: false, message: 'Medical record not found' });
    }

    // Verify doctor is the one who created it
    if (record.doctor.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied: You cannot edit records created by other doctors' });
    }

    if (diagnosis) record.diagnosis = diagnosis;
    if (symptoms !== undefined) record.symptoms = symptoms;
    if (prescription !== undefined) record.prescription = prescription;
    if (treatmentPlan !== undefined) record.treatmentPlan = treatmentPlan;
    if (notes !== undefined) record.notes = notes;

    await record.save();

    res.status(200).json({
      success: true,
      message: 'Medical record updated successfully',
      record
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a medical record
// @route   DELETE /api/records/:id
// @access  Private (Admin)
const deleteRecord = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findByIdAndDelete(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Medical record not found' });
    }
    res.status(200).json({ success: true, message: 'Medical record deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRecord,
  getAllRecords,
  getMyRecords,
  getPatientRecords,
  updateRecord,
  deleteRecord
};
