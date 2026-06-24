const express = require('express');
const { createBooking, getBookingById, getMyBookings } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/create').post(protect, createBooking);
router.route('/mybookings').get(protect, getMyBookings);
router.route('/:id').get(protect, getBookingById);

module.exports = router;
