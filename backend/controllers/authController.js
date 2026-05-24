const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const jwt = require('jsonwebtoken');

// Helper to sign JWTs
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_healthcare_management_system_key_2026', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// @desc    Register a new Patient
// @route   POST /api/auth/register
// @access  Public
const registerPatient = async (req, res, next) => {
  try {
    const { name, email, password, age, gender, contactNumber, medicalHistory } = req.body;

    if (!name || !email || !password || !age || !gender) {
      return res.status(400).json({ success: false, message: 'Please enter all required signup fields' });
    }

    // Check duplicate
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email address already registered' });
    }

    // Create User record
    const user = await User.create({
      name,
      email,
      password,
      role: 'patient'
    });

    // Create Patient Profile record
    const historyArray = medicalHistory ? medicalHistory.split(',').map(s => s.trim()).filter(Boolean) : [];
    const profile = await PatientProfile.create({
      user: user._id,
      age: Number(age),
      gender,
      contactNumber,
      medicalHistory: historyArray
    });

    // Populate user object response
    const populatedUser = await User.findById(user._id).populate('profile');

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: populatedUser._id,
        name: populatedUser.name,
        email: populatedUser.email,
        role: populatedUser.role,
        profile: populatedUser.profile
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate User & return token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password').populate('profile');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Access denied.' });
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user details
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('profile');
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update patient profile details
// @route   PUT /api/auth/profile
// @access  Private
const updatePatientProfile = async (req, res, next) => {
  try {
    const { 
      age, 
      gender, 
      contactNumber, 
      bloodGroup, 
      allergies, 
      emergencyContactName, 
      emergencyContactPhone, 
      address, 
      height, 
      weight,
      medicalHistory 
    } = req.body;

    let profile = await PatientProfile.findOne({ user: req.user.id });

    if (!profile) {
      profile = new PatientProfile({ user: req.user.id });
    }

    if (age !== undefined) profile.age = Number(age);
    if (gender !== undefined) profile.gender = gender;
    if (contactNumber !== undefined) profile.contactNumber = contactNumber;
    if (bloodGroup !== undefined) profile.bloodGroup = bloodGroup;
    
    if (allergies !== undefined) {
      profile.allergies = Array.isArray(allergies) 
        ? allergies 
        : allergies.split(',').map(s => s.trim()).filter(Boolean);
    }
    
    if (emergencyContactName !== undefined) profile.emergencyContactName = emergencyContactName;
    if (emergencyContactPhone !== undefined) profile.emergencyContactPhone = emergencyContactPhone;
    if (address !== undefined) profile.address = address;
    if (height !== undefined) profile.height = Number(height);
    if (weight !== undefined) profile.weight = Number(weight);
    
    if (medicalHistory !== undefined) {
      profile.medicalHistory = Array.isArray(medicalHistory) 
        ? medicalHistory 
        : medicalHistory.split(',').map(s => s.trim()).filter(Boolean);
    }

    await profile.save();

    const user = await User.findById(req.user.id).populate('profile');
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { registerPatient, login, getMe, updatePatientProfile };
