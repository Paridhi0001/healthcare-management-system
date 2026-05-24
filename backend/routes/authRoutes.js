const express = require('express');
const { registerPatient, login, getMe, updatePatientProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerPatient);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updatePatientProfile);

module.exports = router;
