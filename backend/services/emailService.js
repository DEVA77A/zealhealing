const nodemailer = require('nodemailer');

// Create transporter — configure with real credentials in .env
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send booking confirmation email to client
 */
const sendClientBookingEmail = async (booking) => {
  if (!process.env.EMAIL_USER) {
    console.log('[Email] Skipped: EMAIL_USER not configured');
    return false;
  }

  try {
    const transporter = createTransporter();
    const callPlatformInfo = booking.callType === 'Video Call'
      ? `Platform: Zoom Meeting${booking.zoomMeetingLink ? `\nMeeting Link: ${booking.zoomMeetingLink}` : ''}${booking.zoomMeetingPassword ? `\nMeeting Password: ${booking.zoomMeetingPassword}` : ''}`
      : booking.countryCategory === 'india'
        ? 'Platform: Normal Phone Call'
        : 'Platform: WhatsApp Voice Call';

    const gstInfo = booking.countryCategory === 'india'
      ? `\nGST (18%): ₹${booking.gstAmount}`
      : '';

    await transporter.sendMail({
      from: `"Zeal Healing" <${process.env.EMAIL_USER}>`,
      to: booking.customerEmail,
      subject: `✨ Booking Confirmed — Zeal Healing | ${booking.callType} (${booking.duration} mins)`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f4f7f4; border-radius: 16px; overflow: hidden;">
          <div style="background: #2E7D32; padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🌿 Zeal Healing</h1>
            <p style="color: rgba(255,255,255,0.85); margin-top: 8px;">Your Healing Journey Begins</p>
          </div>
          <div style="padding: 32px;">
            <h2 style="color: #253825; margin-top: 0;">Booking Confirmed! ✅</h2>
            <p style="color: #345234;">Dear <strong>${booking.customerName}</strong>,</p>
            <p style="color: #345234;">Thank you for booking a session with Zeal Healing. Here are your appointment details:</p>
            
            <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #c7d9c7;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #538253; font-weight: 600;">Service</td><td style="padding: 8px 0; color: #253825;">${booking.appointmentType}</td></tr>
                <tr><td style="padding: 8px 0; color: #538253; font-weight: 600;">Type</td><td style="padding: 8px 0; color: #253825;">${booking.callType}</td></tr>
                <tr><td style="padding: 8px 0; color: #538253; font-weight: 600;">Duration</td><td style="padding: 8px 0; color: #253825;">${booking.duration} Minutes</td></tr>
                <tr><td style="padding: 8px 0; color: #538253; font-weight: 600;">Date</td><td style="padding: 8px 0; color: #253825;">${new Date(booking.appointmentDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
                <tr><td style="padding: 8px 0; color: #538253; font-weight: 600;">Time</td><td style="padding: 8px 0; color: #253825;">${booking.appointmentTime}</td></tr>
                <tr><td style="padding: 8px 0; color: #538253; font-weight: 600;">${callPlatformInfo.split('\n')[0]}</td><td></td></tr>
              </table>
            </div>

            <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #c7d9c7;">
              <h3 style="color: #253825; margin-top: 0;">Payment Summary</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 6px 0; color: #538253;">Base Amount</td><td style="padding: 6px 0; color: #253825; text-align: right;">₹${booking.baseINRAmount || booking.price}</td></tr>
                ${booking.countryCategory === 'india' ? `<tr><td style="padding: 6px 0; color: #538253;">GST (18%)</td><td style="padding: 6px 0; color: #253825; text-align: right;">₹${booking.gstAmount}</td></tr>` : ''}
                <tr style="border-top: 2px solid #c7d9c7;"><td style="padding: 10px 0; color: #2E7D32; font-weight: 700; font-size: 16px;">Total</td><td style="padding: 10px 0; color: #2E7D32; text-align: right; font-weight: 700; font-size: 16px;">₹${booking.totalAmount || booking.price}</td></tr>
              </table>
            </div>

            <p style="color: #538253; font-size: 14px;">If you have any questions, feel free to reach out to us on WhatsApp.</p>
            <p style="color: #345234;">With love and light,<br><strong>Team Zeal Healing 🌿</strong></p>
          </div>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('[Email] Client email failed:', error.message);
    return false;
  }
};

/**
 * Send new booking notification email to admin
 */
const sendAdminBookingEmail = async (booking) => {
  if (!process.env.EMAIL_USER || !process.env.ADMIN_EMAIL) {
    console.log('[Email] Skipped: EMAIL_USER or ADMIN_EMAIL not configured');
    return false;
  }

  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"Zeal Healing System" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `🔔 New Booking — ${booking.customerName} | ${booking.callType} (${booking.duration}min)`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #2E7D32; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">New Booking Alert 🔔</h1>
          </div>
          <div style="padding: 24px; background: #f4f7f4; border-radius: 0 0 12px 12px;">
            <h3 style="color: #253825;">Customer Details</h3>
            <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; padding: 16px;">
              <tr><td style="padding: 8px; color: #538253; font-weight: 600;">Name</td><td style="padding: 8px;">${booking.customerName}</td></tr>
              <tr><td style="padding: 8px; color: #538253; font-weight: 600;">Email</td><td style="padding: 8px;">${booking.customerEmail}</td></tr>
              <tr><td style="padding: 8px; color: #538253; font-weight: 600;">WhatsApp</td><td style="padding: 8px;">${booking.customerWhatsApp}</td></tr>
              <tr><td style="padding: 8px; color: #538253; font-weight: 600;">Location</td><td style="padding: 8px;">${booking.district}, ${booking.state}, ${booking.country}</td></tr>
              <tr><td style="padding: 8px; color: #538253; font-weight: 600;">Category</td><td style="padding: 8px; text-transform: capitalize;">${booking.countryCategory}</td></tr>
            </table>
            <h3 style="color: #253825; margin-top: 20px;">Appointment Details</h3>
            <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; padding: 16px;">
              <tr><td style="padding: 8px; color: #538253; font-weight: 600;">Type</td><td style="padding: 8px;">${booking.callType}</td></tr>
              <tr><td style="padding: 8px; color: #538253; font-weight: 600;">Duration</td><td style="padding: 8px;">${booking.duration} mins</td></tr>
              <tr><td style="padding: 8px; color: #538253; font-weight: 600;">Date</td><td style="padding: 8px;">${new Date(booking.appointmentDate).toLocaleDateString('en-IN')}</td></tr>
              <tr><td style="padding: 8px; color: #538253; font-weight: 600;">Time</td><td style="padding: 8px;">${booking.appointmentTime}</td></tr>
              <tr><td style="padding: 8px; color: #538253; font-weight: 600;">Amount</td><td style="padding: 8px;">₹${booking.totalAmount || booking.price}</td></tr>
              <tr><td style="padding: 8px; color: #538253; font-weight: 600;">Payment</td><td style="padding: 8px;">${booking.paymentMethod} — ${booking.paymentStatus}</td></tr>
            </table>
          </div>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('[Email] Admin email failed:', error.message);
    return false;
  }
};

module.exports = { sendClientBookingEmail, sendAdminBookingEmail };
