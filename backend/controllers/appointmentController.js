const Appointment = require('../models/Appointment');
const User = require('../models/User');

// @desc    Schedule an appointment
// @route   POST /api/appointments
// @access  Private (Patient only)
const createAppointment = async (req, res, next) => {
  try {
    const { doctorId, date, timeSlot, notes } = req.body;

    if (!doctorId || !date || !timeSlot) {
      return res.status(400).json({ success: false, message: 'Please specify doctor, date, and slot' });
    }

    // Verify doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(400).json({ success: false, message: 'Invalid doctor profile selection' });
    }

    // Check if slot already reserved for this doctor and date
    const parsedDate = new Date(date);
    // Reset date hours to standard start of day to compare dates correctly
    parsedDate.setUTCHours(0, 0, 0, 0);

    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      date: parsedDate,
      timeSlot,
      status: { $ne: 'cancelled' }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This slot is already reserved for this practitioner on the selected date.'
      });
    }

    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor: doctorId,
      date: parsedDate,
      timeSlot,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Appointment request submitted successfully',
      appointment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all appointments (Filtered by role context)
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === 'patient') {
      query.patient = req.user.id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user.id;
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email profile')
      .populate('doctor', 'name email profile')
      .sort({ date: 1, timeSlot: 1 });

    const validAppointments = appointments.filter(apt => apt.patient && apt.doctor);

    res.status(200).json({ success: true, count: validAppointments.length, appointments: validAppointments });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid appointment status configuration' });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Authorization checks
    if (req.user.role === 'patient') {
      // Patients can only cancel their own appointments
      if (appointment.patient.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied: You can only modify your own visits' });
      }
      if (status !== 'cancelled') {
        return res.status(400).json({ success: false, message: 'Patients can only cancel scheduling slots' });
      }
    } else if (req.user.role === 'doctor') {
      // Doctors can only manage their own clinic schedules
      if (appointment.doctor.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied: You can only modify clinic visits assigned to you' });
      }
    }

    appointment.status = status;
    await appointment.save();

    res.status(200).json({
      success: true,
      message: `Appointment status updated to ${status} successfully`,
      appointment
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createAppointment, getAppointments, updateAppointmentStatus };
