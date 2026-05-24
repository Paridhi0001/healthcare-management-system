const express = require('express');
const { createDoctor, getAllUsers, deleteUser, getSystemStats } = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin'));

router.post('/doctors', createDoctor);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/stats', getSystemStats);

module.exports = router;
