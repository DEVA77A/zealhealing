const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { paymentWebhook } = require('./controllers/paymentController');
const { startPaymentConfirmationWorker } = require('./services/paymentConfirmation');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Behind a proxy/load balancer (Render, Nginx, Cloudflare) the real client IP
// arrives in X-Forwarded-For. Without this, location detection would see the
// proxy's address instead of the visitor's.
app.set('trust proxy', true);

// Middleware
app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), paymentWebhook);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());

// Routes
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const pricingRoutes = require('./routes/pricingRoutes');
const classRoutes = require('./routes/classRoutes');

// Basic Route
app.get('/', (req, res) => {
  res.send('ZEAL HEALING API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/invoice', invoiceRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/classes', classRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startPaymentConfirmationWorker();
});
