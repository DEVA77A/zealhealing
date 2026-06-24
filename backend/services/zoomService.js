const axios = require('axios');

/**
 * Create a Zoom Meeting
 * Requires: ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET in .env
 * Uses Server-to-Server OAuth (recommended by Zoom)
 */

const getZoomAccessToken = async () => {
  try {
    const credentials = Buffer.from(
      `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
    ).toString('base64');

    const response = await axios.post(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
      null,
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('[Zoom] Token error:', error.message);
    return null;
  }
};

/**
 * Create a scheduled Zoom meeting
 */
const createZoomMeeting = async (booking) => {
  if (!process.env.ZOOM_CLIENT_ID || !process.env.ZOOM_CLIENT_SECRET || !process.env.ZOOM_ACCOUNT_ID) {
    console.log('[Zoom] Skipped: Zoom API not configured');
    return null;
  }

  try {
    const token = await getZoomAccessToken();
    if (!token) return null;

    const [hours, minutes] = booking.appointmentTime.split(':').map(Number);
    const meetingDate = new Date(booking.appointmentDate);
    meetingDate.setHours(hours, minutes, 0, 0);

    const response = await axios.post(
      'https://api.zoom.us/v2/users/me/meetings',
      {
        topic: `Zeal Healing — Tarot Reading with ${booking.customerName}`,
        type: 2, // Scheduled meeting
        start_time: meetingDate.toISOString(),
        duration: booking.duration,
        timezone: booking.timezone || 'Asia/Kolkata',
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          waiting_room: true,
          auto_recording: 'none',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      meetingId: String(response.data.id),
      meetingLink: response.data.join_url,
      meetingPassword: response.data.password || '',
    };
  } catch (error) {
    console.error('[Zoom] Meeting creation failed:', error.message);
    return null;
  }
};

module.exports = { createZoomMeeting };
