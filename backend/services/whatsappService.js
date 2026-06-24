const axios = require('axios');

/**
 * Send WhatsApp message via WhatsApp Business API
 * NOTE: Requires WhatsApp Business API setup with provider (e.g., Twilio, Meta Cloud API)
 * Configure WHATSAPP_API_URL, WHATSAPP_API_TOKEN, and WHATSAPP_PHONE_ID in .env
 */
const sendWhatsAppMessage = async (to, message) => {
  if (!process.env.WHATSAPP_API_TOKEN || !process.env.WHATSAPP_PHONE_ID) {
    console.log('[WhatsApp] Skipped: API not configured');
    return false;
  }

  try {
    const url = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`;

    await axios.post(url, {
      messaging_product: 'whatsapp',
      to: to.replace(/[^0-9]/g, ''), // Clean phone number
      type: 'text',
      text: { body: message },
    }, {
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    return true;
  } catch (error) {
    console.error('[WhatsApp] Send failed:', error.message);
    return false;
  }
};

/**
 * Send booking confirmation to client via WhatsApp
 */
const sendClientWhatsApp = async (booking) => {
  const dateStr = new Date(booking.appointmentDate).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  let platformInfo = '';
  if (booking.callType === 'Video Call' && booking.zoomMeetingLink) {
    platformInfo = `\n📹 Zoom Link: ${booking.zoomMeetingLink}\n🔑 Password: ${booking.zoomMeetingPassword || 'N/A'}`;
  } else if (booking.countryCategory === 'india') {
    platformInfo = '\n📞 You will receive a phone call at your registered number.';
  } else {
    platformInfo = '\n📱 You will receive a WhatsApp Voice Call.';
  }

  const message = `🌿 *Zeal Healing — Booking Confirmed* ✅

Hi *${booking.customerName}*,

Your appointment has been confirmed!

📋 *Appointment Details:*
• Service: ${booking.appointmentType}
• Type: ${booking.callType}
• Duration: ${booking.duration} minutes
• Date: ${dateStr}
• Time: ${booking.appointmentTime}
${platformInfo}

💰 *Amount Paid:* ₹${booking.totalAmount || booking.price}

Thank you for choosing Zeal Healing! 🙏
— Team Zeal Healing`;

  return await sendWhatsAppMessage(booking.customerWhatsApp, message);
};

/**
 * Send new booking alert to admin via WhatsApp
 */
const sendAdminWhatsApp = async (booking) => {
  if (!process.env.ADMIN_WHATSAPP) {
    console.log('[WhatsApp] Skipped: ADMIN_WHATSAPP not configured');
    return false;
  }

  const message = `🔔 *New Booking Alert*

👤 *${booking.customerName}*
📧 ${booking.customerEmail}
📱 ${booking.customerWhatsApp}
📍 ${booking.district}, ${booking.state}, ${booking.country}

📋 ${booking.callType} | ${booking.duration} mins
📅 ${new Date(booking.appointmentDate).toLocaleDateString('en-IN')}
🕐 ${booking.appointmentTime}
💰 ₹${booking.totalAmount || booking.price} (${booking.paymentStatus})
🏷️ ${booking.countryCategory.toUpperCase()}`;

  return await sendWhatsAppMessage(process.env.ADMIN_WHATSAPP, message);
};

module.exports = { sendClientWhatsApp, sendAdminWhatsApp };
