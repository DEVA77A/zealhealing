const express = require('express');
const { getBookings, updateBookingStatus, deleteBooking } = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/bookings').get(protect, admin, getBookings);
router.route('/bookings/:id')
  .put(protect, admin, updateBookingStatus)
  .delete(protect, admin, deleteBooking);

module.exports = router;
