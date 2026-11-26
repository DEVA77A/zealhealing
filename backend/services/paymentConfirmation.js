const axios = require('axios');
const nodemailer = require('nodemailer');
const Booking = require('../models/Booking');
const Invoice = require('../models/Invoice');
const { invoiceBuffer } = require('../controllers/invoiceController');

const scheduleMessage = 'We will confirm your appointment slot within 2–3 days.';
const retryDelay = 10 * 60 * 1000;

const methods = [
  {
    sentField: 'confirmationEmailSentAt',
    retryField: 'confirmationEmailRetryAt',
    configured: () => process.env.EMAIL_USER && process.env.EMAIL_PASS,
    send: async (booking, invoice, pdf) => {
      const mail = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        connectionTimeout: 15000, socketTimeout: 30000,
      });
      await mail.sendMail({
        from: { name: 'Zeal Healing', address: process.env.EMAIL_USER },
        to: booking.customerEmail,
        subject: 'Zeal Healing payment confirmed',
        text: `Hi ${booking.customerName},\n\nYour payment is confirmed. ${scheduleMessage}\n\nYour appointment invoice ${invoice.invoiceNumber} is attached.`,
        attachments: [{ filename: `${invoice.invoiceNumber}.pdf`, content: pdf }],
      });
    },
  },
  {
    sentField: 'confirmationMobileSentAt',
    retryField: 'confirmationMobileRetryAt',
    configured: () => process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_PHONE_ID && process.env.WHATSAPP_PAYMENT_TEMPLATE,
    send: async (booking, invoice, pdf) => {
      const url = `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_ID}`;
      const config = { headers: { Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}` }, timeout: 20000 };
      const input = booking.customerWhatsApp.trim();
      const digits = input.replace(/\D/g, '');
      const to = booking.countryCode === 'IN' && digits.length === 10 && !input.startsWith('+') ? '91' + digits : digits;
      const filename = `${invoice.invoiceNumber}.pdf`;
      const media = new FormData();
      media.append('messaging_product', 'whatsapp');
      media.append('file', new Blob([pdf], { type: 'application/pdf' }), filename);
      const { data } = await axios.post(url + '/media', media, config);
      await axios.post(url + '/messages', {
        messaging_product: 'whatsapp', to, type: 'template',
        template: {
          name: process.env.WHATSAPP_PAYMENT_TEMPLATE,
          language: { code: process.env.WHATSAPP_PAYMENT_LANGUAGE || 'en' },
          components: [{ type: 'header', parameters: [{ type: 'document', document: { id: data.id, filename } }] }],
        },
      }, config);
    },
  },
];

const due = ({ sentField, retryField }) => ({
  paidAt: { $exists: true },
  [sentField]: { $exists: false },
  $or: [{ [retryField]: { $exists: false } }, { [retryField]: { $lte: new Date() } }],
});

const deliverPaymentConfirmation = async (bookingId) => {
  await Promise.all(methods.filter(method => method.configured()).map(async method => {
    const booking = await Booking.findOneAndUpdate(
      { _id: bookingId, ...due(method) },
      { [method.retryField]: new Date(Date.now() + retryDelay) },
      { returnDocument: 'after' }
    );
    if (!booking) return;
    try {
      const invoice = await Invoice.findById(booking.id).orFail();
      await method.send(booking, invoice, await invoiceBuffer(booking, invoice));
      await Booking.updateOne({ _id: booking.id }, {
        $set: { [method.sentField]: new Date() },
        $unset: { [method.retryField]: 1 },
      });
    } catch (error) {
      console.error('[Payment notification]', method.sentField, booking.id, error.code || error.name);
    }
  }));
};

const startPaymentConfirmationWorker = () => {
  const timer = setInterval(async () => {
    const active = methods.filter(method => method.configured());
    if (!active.length) return;
    try {
      const pending = await Booking.find({ $or: active.map(due) }).select('_id').limit(25);
      for (const booking of pending) await deliverPaymentConfirmation(booking.id);
    } catch (error) {
      console.error('[Payment notifications]', error.code || error.name);
    }
  }, 30000);
  timer.unref();
};

module.exports = { deliverPaymentConfirmation, startPaymentConfirmationWorker };
