const express = require('express');
const { createBooking, getBookingById } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/create').post(protect, createBooking);
router.route('/:id').get(protect, getBookingById);

module.exports = router;
