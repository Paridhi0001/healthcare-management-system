const express = require('express');
const { getDoctorProfile, updateDoctorProfile, getAllDoctors } = require('../controllers/doctorController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// Anyone logged in can see the doctor directories
router.get('/all', getAllDoctors);

// Doctors only endpoints
router.get('/profile', restrictTo('doctor'), getDoctorProfile);
router.put('/slots', restrictTo('doctor'), updateDoctorProfile);

module.exports = router;
