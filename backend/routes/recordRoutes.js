const express = require('express');
const {
  createRecord,
  getAllRecords,
  getMyRecords,
  getPatientRecords,
  updateRecord,
  deleteRecord
} = require('../controllers/recordController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// Patient gets their own records
router.get('/my-records', restrictTo('patient'), getMyRecords);

// Doctor creates and updates records
router.post('/', restrictTo('doctor'), createRecord);
router.put('/:id', restrictTo('doctor'), updateRecord);

// Doctor or Admin reads patient history
router.get('/patient/:patientId', restrictTo('doctor', 'admin'), getPatientRecords);

// Admin operations (listing all, delete)
router.get('/', restrictTo('admin'), getAllRecords);
router.delete('/:id', restrictTo('admin'), deleteRecord);

module.exports = router;
