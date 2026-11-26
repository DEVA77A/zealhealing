const Razorpay = require('razorpay');
const { createHash, createHmac, timingSafeEqual } = require('crypto');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Session = require('../models/Class');
const { GST_RATE } = require('../config/pricingConfig');
const { getCountryByCode } = require('../config/countryCurrency');
const { getExchangeRate, getCurrencyDecimals, convertPrice } = require('../services/currencyService');
const { ensurePaidInvoice } = require('./invoiceController');
const { deliverPaymentConfirmation } = require('../services/paymentConfirmation');

const gateway = () => new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const signed = (payload, signature, secret) => {
  if (!secret || typeof signature !== 'string' || !/^[a-f\d]{64}$/i.test(signature)) return false;
  return timingSafeEqual(createHmac('sha256', secret).update(payload).digest(), Buffer.from(signature, 'hex'));
};

const fail = (status, message) => Object.assign(new Error(message), { status });
const handleError = (res, error) => {
  if (error.status) return res.status(error.status).json({ message: error.message });
  console.error('[Payment]', error.error?.code || error.code || error.name);
  return res.status(502).json({ message: 'Could not complete the Razorpay request. Please try again.' });
};

const checkoutId = (user, attemptId) => {
  if (typeof attemptId !== 'string' || !/^[\da-f-]{36}$/i.test(attemptId)) {
    throw fail(400, 'Start checkout again to renew your payment session.');
  }
  return createHash('sha256').update(user.id + ':' + attemptId).digest('hex').slice(0, 24);
};

const quote = async (body) => {
  if (!mongoose.isValidObjectId(body.sessionId)) throw fail(400, 'Select a session.');
  const session = await Session.findOne({ _id: body.sessionId, status: 'Active' });
  if (!session) throw fail(404, 'This session is no longer available.');

  const region = getCountryByCode(body.countryCode);
  const rate = await getExchangeRate(region.currency);
  const currency = rate ? region.currency : 'INR';
  const currencySymbol = rate ? region.currencySymbol : '₹';
  const exchangeRate = rate || 1;
  const baseINRAmount = session.price;
  const gstAmount = Math.round(baseINRAmount * GST_RATE) / 100;
  const totalAmount = Math.round((baseINRAmount + gstAmount) * 100) / 100;
  const factor = 10 ** getCurrencyDecimals(currency);
  const convertedAmount = convertPrice(baseINRAmount, currency, exchangeRate);
  const paymentAmountMinor = Math.round((convertedAmount + convertedGST(convertedAmount, factor)) * 10 ** gatewayDecimals(currency));
  if (!Number.isSafeInteger(paymentAmountMinor) || paymentAmountMinor < 1) throw fail(400, 'Invalid session price.');
  const callType = session.type === 'voice' ? 'Voice Call' : 'Video Call';
  const countryCategory = region.countryCode === 'IN' ? 'india' : 'abroad';
  return {
    appointmentType: session.title, callType, duration: session.duration,
    price: baseINRAmount, baseINRAmount, gstRate: GST_RATE, gstAmount, totalAmount,
    currency, currencySymbol, exchangeRate, convertedAmount, paymentAmountMinor, paymentAmountDecimals: gatewayDecimals(currency),
    countryCode: region.countryCode, countryCategory,
    callPlatform: callType === 'Video Call' ? 'Zoom Meeting' : countryCategory === 'india' ? 'Normal Phone Call' : 'WhatsApp Voice Call',
  };
};

const gatewayDecimals = currency => ['BHD', 'KWD', 'OMR'].includes(currency) ? 3 : getCurrencyDecimals(currency);

const convertedGST = (amount, factor) => Math.round(amount * GST_RATE * factor / 100) / factor;

const publicQuote = (booking) => ({
  amount: booking.paymentAmountMinor,
  currency: booking.currency,
  symbol: booking.currencySymbol,
  subtotal: booking.convertedAmount,
  amountDecimals: gatewayDecimals(booking.currency),
  gst: convertedGST(booking.convertedAmount, 10 ** getCurrencyDecimals(booking.currency)),
  gstRate: booking.gstRate,
  duration: booking.duration,
  title: booking.appointmentType,
  callType: booking.callType,
  paid: Boolean(booking.paidAt),
  bookingId: booking.paidAt ? booking.id : undefined,
});

const getQuote = async (req, res) => {
  try {
    const existing = await Booking.findById(checkoutId(req.user, req.body.attemptId));
    res.json(publicQuote(existing || await quote(req.body)));
  } catch (error) {
    handleError(res, error);
  }
};

const createOrder = async (req, res) => {
  try {
    const id = checkoutId(req.user, req.body.attemptId);
    let booking = await Booking.findById(id);
    const price = booking || await quote(req.body);
    if (price.paidAt) return res.json(publicQuote(price));
    if (price.paymentAmountMinor !== req.body.amount || price.currency !== req.body.currency) {
      throw fail(409, 'The price changed. Review the new total before paying.');
    }
    if (!booking) {
      const details = req.body.customerDetails || {};
      const fields = ['customerName', 'customerEmail', 'customerPhone', 'customerWhatsApp', 'district', 'state', 'country', 'notes'];
      const contact = Object.fromEntries(fields.map(field => [field, typeof details[field] === 'string' ? details[field].trim() : '']));
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.customerEmail) ||
          ![contact.customerPhone, contact.customerWhatsApp].every(number => /^\+?[\d()\s-]{7,24}$/.test(number) && number.replace(/\D/g, '').length >= 7 && number.replace(/\D/g, '').length <= 15)) {
        throw fail(400, 'Enter a valid email address and mobile number in checkout.');
      }
      try {
        booking = await Booking.create({ ...contact, ...price, _id: id, userId: req.user.id, paymentMethod: 'Razorpay' });
      } catch (error) {
        if (error.name === 'ValidationError') throw fail(400, 'Complete your contact details in checkout.');
        if (error.code !== 11000) throw error;
        booking = await Booking.findById(id);
      }
    }
    if (booking.paymentAmountMinor !== req.body.amount || booking.currency !== req.body.currency) {
      throw fail(409, 'The price changed. Review the new total before paying.');
    }

    if (!booking.razorpayOrderId) {
      const order = await gateway().orders.create({
        amount: booking.paymentAmountMinor, currency: booking.currency, receipt: booking.id,
      });
      booking = await Booking.findOneAndUpdate(
        { _id: booking.id, razorpayOrderId: { $exists: false } },
        { razorpayOrderId: order.id },
        { returnDocument: 'after' }
      ) || await Booking.findById(id);
    }
    if (!booking.paidAt) {
      const payments = await gateway().orders.fetchPayments(booking.razorpayOrderId);
      const captured = payments.items.find(payment => payment.status === 'captured');
      if (captured) booking = await finalizePayment(booking, captured);
    }
    res.json({ ...publicQuote(booking), order_id: booking.razorpayOrderId, key: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    handleError(res, error);
  }
};

const finalizePayment = async (booking, payment) => {
  if (payment.status !== 'captured' || payment.order_id !== booking.razorpayOrderId ||
      payment.amount !== booking.paymentAmountMinor || payment.currency !== booking.currency) {
    throw fail(409, 'Razorpay has not confirmed capture of the expected amount yet.');
  }
  const invoice = await ensurePaidInvoice(booking);
  const updated = await Booking.findOneAndUpdate(
    { _id: booking.id, paidAt: { $exists: false } },
    {
      paymentStatus: 'Completed', razorpayPaymentId: payment.id,
      paidAt: new Date(), bookingDate: new Date(), invoiceNumber: invoice.invoiceNumber,
    },
    { returnDocument: 'after' }
  ) || await Booking.findById(booking.id);
  if (updated.razorpayPaymentId !== payment.id) throw fail(409, 'A different payment already completed this order.');
  deliverPaymentConfirmation(updated.id).catch(error => console.error('[Payment confirmation]', error.name));
  return updated;
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (typeof razorpay_order_id !== 'string' || typeof razorpay_payment_id !== 'string') {
      throw fail(400, 'Missing payment verification fields.');
    }
    const booking = await Booking.findOne({ razorpayOrderId: razorpay_order_id, userId: req.user.id });
    if (!booking) throw fail(404, 'Payment order not found.');
    if (!signed(booking.razorpayOrderId + '|' + razorpay_payment_id, razorpay_signature, process.env.RAZORPAY_KEY_SECRET)) {
      throw fail(400, 'Invalid payment signature.');
    }
    if (booking.paidAt && booking.razorpayPaymentId === razorpay_payment_id) return res.json(publicQuote(booking));
    const payment = await gateway().payments.fetch(razorpay_payment_id);
    res.json(publicQuote(await finalizePayment(booking, payment)));
  } catch (error) {
    handleError(res, error);
  }
};

const paymentWebhook = async (req, res) => {
  try {
    if (!signed(req.body, req.get('x-razorpay-signature'), process.env.RAZORPAY_WEBHOOK_SECRET)) {
      throw fail(400, 'Invalid webhook signature.');
    }
    const event = JSON.parse(req.body);
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      const booking = await Booking.findOne({ razorpayOrderId: payment.order_id });
      if (booking) await finalizePayment(booking, payment);
    }
    res.sendStatus(204);
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = { getQuote, createOrder, verifyPayment, paymentWebhook };
