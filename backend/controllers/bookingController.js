const Booking = require('../models/Booking');
const Invoice = require('../models/Invoice');

// @desc    Create new booking
// @route   POST /api/bookings/create
// @access  Private
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
      // Payment proof fields
      senderAccountNumber,
      transactionId,
      paymentScreenshot,
      paymentRemarks,
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
      paymentStatus: 'Pending',
      bookingStatus: 'Queued', // Always starts as Queued until admin accepts
      senderAccountNumber,
      transactionId,
      paymentScreenshot,
      paymentRemarks,
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

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (paymentStatus) booking.paymentStatus = paymentStatus;
    if (bookingStatus) booking.bookingStatus = bookingStatus;

    // When admin accepts the booking, mark payment as completed and generate the invoice
    if (bookingStatus === 'Accepted') {
      booking.paymentStatus = 'Completed';

      // Auto-generate invoice on acceptance if it doesn't already exist
      const existingInvoice = await Invoice.findOne({ bookingId: booking._id });
      if (!existingInvoice) {
        const invoiceNumber = `ZH-FY25-26/R14_${Math.floor(Math.random() * 10000)}`;
        const subtotal = booking.convertedAmount || booking.price;
        const SGST = subtotal * 0.025;
        const CGST = subtotal * 0.025;
        const grandTotal = subtotal + SGST + CGST;

        const invoice = new Invoice({
          bookingId: booking._id,
          invoiceNumber,
          subtotal,
          SGST,
          CGST,
          GST: 5,
          roundOff: 0,
          grandTotal,
        });

        await invoice.save();
        booking.invoiceNumber = invoiceNumber;
      }
    }

    // If rejected, mark payment as failed
    if (bookingStatus === 'Rejected') {
      booking.paymentStatus = 'Failed';
    }

    const updatedBooking = await booking.save();
    res.json(updatedBooking);
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

// @desc    Get logged in user bookings
// @route   GET /api/bookings/mybookings
// @access  Private
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(bookings);
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
  getMyBookings,
};

