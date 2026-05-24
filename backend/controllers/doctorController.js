const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');

// @desc    Get current doctor's profile
// @route   GET /api/doctor/profile
// @access  Private (Doctor only)
const getDoctorProfile = async (req, res, next) => {
  try {
    const profile = await DoctorProfile.findOne({ user: req.user.id }).populate('user', 'name email');
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }
    res.status(200).json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Configure doctor details & availability slots
// @route   PUT /api/doctor/slots
// @access  Private (Doctor only)
const updateDoctorProfile = async (req, res, next) => {
  try {
    const { specialization, experience, fees, bio, availableSlots } = req.body;

    let profile = await DoctorProfile.findOne({ user: req.user.id });

    if (!profile) {
      profile = new DoctorProfile({ user: req.user.id });
    }

    if (specialization) profile.specialization = specialization;
    if (experience !== undefined) profile.experience = Number(experience);
    if (fees !== undefined) profile.fees = Number(fees);
    if (bio !== undefined) profile.bio = bio;
    if (availableSlots !== undefined) profile.availableSlots = availableSlots;

    await profile.save();

    const populated = await DoctorProfile.findById(profile._id).populate('user', 'name email');

    res.status(200).json({
      success: true,
      message: 'Profile configuration updated successfully',
      profile: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all doctor profiles
// @route   GET /api/doctor/all
// @access  Private (Any authenticated user)
const getAllDoctors = async (req, res, next) => {
  try {
    const doctors = await DoctorProfile.find({}).populate('user', 'name email');
    const activeDoctors = doctors.filter(doc => doc.user);
    res.status(200).json({ success: true, doctors: activeDoctors });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDoctorProfile, updateDoctorProfile, getAllDoctors };
