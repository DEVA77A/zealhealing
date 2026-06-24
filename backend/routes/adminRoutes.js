const express = require('express');
const { getBookings, updateBookingStatus, deleteBooking } = require('../controllers/bookingController');
const { getDashboardStats, getUsers, deleteUser, getInvoices } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/stats').get(protect, admin, getDashboardStats);

router.route('/users').get(protect, admin, getUsers);
router.route('/users/:id').delete(protect, admin, deleteUser);

router.route('/invoices').get(protect, admin, getInvoices);

router.route('/bookings').get(protect, admin, getBookings);
router.route('/bookings/:id')
  .put(protect, admin, updateBookingStatus)
  .delete(protect, admin, deleteBooking);

module.exports = router;
