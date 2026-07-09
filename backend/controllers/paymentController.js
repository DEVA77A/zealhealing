const Razorpay = require('razorpay');
const crypto = require('crypto');

// @desc    Create Razorpay Order
// @route   POST /api/payment/create-order
// @access  Public
const createOrder = async (req, res) => {
  try {
    const { amount, currency, receipt } = req.body;
    
    // Validate amount >= 100 paise
    if (!amount || parseInt(amount, 10) < 100) {
        return res.status(400).json({ message: 'Amount must be at least 100 paise' });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: parseInt(amount, 10), // amount is now directly in paise
      currency: currency || 'INR',
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await instance.orders.create(options);
    if (!order) return res.status(500).json({ message: 'Some error occured' });
    
    // Return { order_id, amount, currency } as specified in instructions
    res.json({
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        full_order: order // kept for backward compatibility if frontend needs it
    });
  } catch (error) {
    if (error.statusCode === 401) {
        return res.status(401).json({ message: 'Razorpay authentication failed' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/payment/verify
// @access  Public
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ message: 'Missing payment verification fields' });
    }

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      // Payment is verified
      res.json({ message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ message: 'Invalid signature sent!' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, verifyPayment };
