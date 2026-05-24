const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const PatientProfile = require('../models/PatientProfile');
const Appointment = require('../models/Appointment');

// @desc    Register a new Doctor profile
// @route   POST /api/admin/doctors
// @access  Private (Admin only)
const createDoctor = async (req, res, next) => {
  try {
    const { name, email, password, specialization, experience, fees, bio } = req.body;

    if (!name || !email || !password || !specialization || !experience || !fees) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'Email address already registered' });
    }

    // Create User doc
    const user = await User.create({
      name,
      email,
      password,
      role: 'doctor'
    });

    // Create Doctor sub-profile
    const doctorProfile = await DoctorProfile.create({
      user: user._id,
      specialization,
      experience: Number(experience),
      fees: Number(fees),
      bio: bio || '',
      availableSlots: [] // initially empty slots
    });

    res.status(201).json({
      success: true,
      message: 'Doctor account registered successfully!',
      doctor: {
        id: user._id,
        name: user.name,
        email: user.email,
        profile: doctorProfile
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Clean delete a user and their linked data
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Protect master Admin seed account
    if (user.email === 'admin@apexhealth.com') {
      return res.status(400).json({ success: false, message: 'Cannot delete primary seed administrator account' });
    }

    // Delete sub-profiles
    if (user.role === 'doctor') {
      await DoctorProfile.findOneAndDelete({ user: user._id });
    } else if (user.role === 'patient') {
      await PatientProfile.findOneAndDelete({ user: user._id });
    }

    // Delete appointments associated
    await Appointment.deleteMany({
      $or: [{ patient: user._id }, { doctor: user._id }]
    });

    await User.findByIdAndDelete(user._id);

    res.status(200).json({ success: true, message: 'User and all associated records deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system status ratios & counts
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getSystemStats = async (req, res, next) => {
  try {
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalAppointments = await Appointment.countDocuments({});

    // Group statuses
    const pending = await Appointment.countDocuments({ status: 'pending' });
    const confirmed = await Appointment.countDocuments({ status: 'confirmed' });
    const completed = await Appointment.countDocuments({ status: 'completed' });
    const cancelled = await Appointment.countDocuments({ status: 'cancelled' });

    res.status(200).json({
      success: true,
      stats: {
        totalDoctors,
        totalPatients,
        totalAppointments,
        statusBreakdown: {
          pending,
          confirmed,
          completed,
          cancelled
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createDoctor, getAllUsers, deleteUser, getSystemStats };
