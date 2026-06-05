const Booking = require('../models/Booking');

// @desc    Create new booking
// @route   POST /api/bookings/create
// @access  Public / Private (Based on requirements, guest checkout is implied, but let's assume auth is required or we handle guest)
// Let's assume user must be logged in to book, as there's a User model.
const createBooking = async (req, res) => {
  try {
    const {
      appointmentType,
      callType,
      duration,
      price,
      customerName,
      customerEmail,
      customerPhone,
      country,
      countryCode,
      currency,
      currencySymbol,
      timezone,
      exchangeRate,
      baseINRAmount,
      convertedAmount,
      notes,
      paymentMethod,
    } = req.body;

    const booking = new Booking({
      userId: req.user ? req.user._id : null,
      appointmentType,
      callType,
      duration,
      price,
      customerName,
      customerEmail,
      customerPhone,
      country,
      countryCode,
      currency,
      currencySymbol,
      timezone,
      exchangeRate,
      baseINRAmount,
      convertedAmount,
      notes,
      paymentMethod,
    });

    const createdBooking = await booking.save();
    res.status(201).json(createdBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (booking) {
      res.json(booking);
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/admin/bookings
// @access  Private/Admin
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({}).populate('userId', 'id name email');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update booking status (Admin)
// @route   PUT /api/admin/bookings/:id
// @access  Private/Admin
const updateBookingStatus = async (req, res) => {
  try {
    const { paymentStatus, bookingStatus } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (booking) {
      if (paymentStatus) booking.paymentStatus = paymentStatus;
      if (bookingStatus) booking.bookingStatus = bookingStatus;

      const updatedBooking = await booking.save();
      res.json(updatedBooking);
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a booking (Admin)
// @route   DELETE /api/admin/bookings/:id
// @access  Private/Admin
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (booking) {
      await Booking.deleteOne({ _id: booking._id });
      res.json({ message: 'Booking removed' });
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  getBookingById,
  getBookings,
  updateBookingStatus,
  deleteBooking,
};
