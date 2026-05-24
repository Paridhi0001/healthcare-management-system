const express = require('express');
const { createAppointment, getAppointments, updateAppointmentStatus } = require('../controllers/appointmentController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', restrictTo('patient'), createAppointment);
router.get('/', getAppointments);
router.put('/:id/status', updateAppointmentStatus);

module.exports = router;
