const express = require('express');
const { createBooking, getBookingById, getMyBookings } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { getAvailableSlots } = require('../services/slotService');

const router = express.Router();

// Get available slots for a date
router.get('/slots', async (req, res) => {
  try {
    const { date, duration } = req.query;
    if (!date || !duration) {
      return res.status(400).json({ message: 'Date and duration are required' });
    }
    const slots = await getAvailableSlots(date, parseInt(duration));
    res.json({ date, duration: parseInt(duration), slots });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.route('/create').post(protect, createBooking);
router.route('/mybookings').get(protect, getMyBookings);
router.route('/:id').get(protect, getBookingById);

module.exports = router;
