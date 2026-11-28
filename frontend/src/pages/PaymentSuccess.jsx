import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getCurrencyDecimals } from '../utils/countryCurrency';
import { toast } from 'react-toastify';

const PaymentSuccess = () => {
  const { id } = useParams();
  const { getToken } = useAuth();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const token = getToken();
        const { data } = await axios.get(`/api/bookings/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBooking(data);
      } catch (error) {
        console.error('Error fetching booking', error);
      }
    };
    fetchBooking();
  }, [id, getToken]);

  if (!booking) {
    return (
      <div style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--clr-parchment)' }}>
        <div className="spinner" style={{ width: 36, height: 36 }} />
      </div>
    );
  }

  const isPaid = Boolean(booking.paidAt);
  const isQueued = !isPaid && booking.bookingStatus === 'Queued';
  const isAccepted = isPaid || (booking.paymentStatus === 'Completed' && ['Accepted', 'Completed'].includes(booking.bookingStatus));
  const isRejected = booking.bookingStatus === 'Rejected';

  const handleDownloadInvoice = async () => {
    try {
      const token = getToken();
      const { data } = await axios.get(`/api/invoice/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${booking.invoiceNumber || id}.pdf`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      toast.error('Could not download your invoice. Please try again.');
    }
  };

  const displayPrice = isPaid
    ? booking.paymentAmountMinor / 10 ** (booking.paymentAmountDecimals ?? getCurrencyDecimals(booking.currency))
    : booking.convertedAmount || booking.price;

  return (
    <div style={{ minHeight: '100svh', background: 'var(--clr-parchment)', paddingTop: 'var(--nav-h)', paddingBottom: '80px', display: 'flex', justifyContent: 'center', px: '24px' }}>
      <div style={{ maxWidth: '640px', width: '100%', padding: '0 24px' }}>

        {/* ── Status Header ── */}
        {isQueued && (
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              style={{
                width: 72, height: 72,
                borderRadius: '50%',
                background: 'var(--clr-warn-bg, #fef3c7)',
                color: 'var(--clr-warn-text, #d97706)',
                border: '1.5px solid var(--clr-warn-border, #fcd34d)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem',
                margin: '0 auto 24px',
              }}
            >
              ⏳
            </motion.div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 500, color: 'var(--clr-ink)', letterSpacing: '-0.02em', marginBottom: '12px' }}>
              Booking Under Review
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--clr-warm-gray)', lineHeight: 1.6, maxWidth: '460px', margin: '0 auto' }}>
              Your payment confirmation is pending.
            </p>
          </div>
        )}

        {isAccepted && (
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              style={{
                width: 72, height: 72,
                borderRadius: '50%',
                background: 'var(--clr-success-bg, #e8f5e9)',
                color: 'var(--clr-success-text, #2e7d32)',
                border: '1.5px solid var(--clr-success-border, #a5d6a7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem',
                margin: '0 auto 24px',
              }}
            >
              ✓
            </motion.div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 500, color: 'var(--clr-forest-750, #1b3d20)', letterSpacing: '-0.02em', marginBottom: '12px' }}>
              {isPaid ? 'Payment Confirmed' : 'Booking Confirmed'}
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--clr-warm-gray)', lineHeight: 1.6, maxWidth: '460px', margin: '0 auto' }}>
              {booking.appointmentDate ? 'Your appointment has been scheduled.' : 'We will confirm your appointment slot within 2–3 days. Your invoice is available below.'}
            </p>
          </div>
        )}

        {isRejected && (
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              style={{
                width: 72, height: 72,
                borderRadius: '50%',
                background: '#fee2e2',
                color: '#ef4444',
                border: '1.5px solid #fecaca',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem',
                margin: '0 auto 24px',
              }}
            >
              ✕
            </motion.div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 500, color: '#b91c1c', letterSpacing: '-0.02em', marginBottom: '12px' }}>
              Transfer Verification Failed
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--clr-warm-gray)', lineHeight: 1.6, maxWidth: '460px', margin: '0 auto' }}>
              Our financial desk was unable to match the payment details submitted. Please reach out to customer support to coordinate.
            </p>
          </div>
        )}

        {/* ── Summary Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: '#fff',
            border: '1px solid var(--clr-border)',
            borderRadius: 'var(--r-xl)',
            padding: '40px',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '32px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--clr-border)', paddingBottom: '20px', marginBottom: '28px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 500, color: 'var(--clr-ink)' }}>
              Summary details
            </h3>
            <span style={{
              display: 'inline-flex',
              padding: '6px 14px',
              borderRadius: '99px',
              fontSize: '0.625rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              background: isQueued ? '#fffbeb' : isAccepted ? 'var(--clr-forest-50)' : '#fef2f2',
              color: isQueued ? '#b45309' : isAccepted ? 'var(--clr-forest-700)' : '#b91c1c',
              border: '1px solid',
              borderColor: isQueued ? '#fde68a' : isAccepted ? 'var(--clr-border)' : '#fca5a5',
            }}>
              {isPaid && booking.bookingStatus === 'Queued' ? 'Awaiting schedule' : booking.bookingStatus}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
            <div>
              <p style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)', marginBottom: '3px' }}>Session</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--clr-ink)' }}>{booking.appointmentType}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)', marginBottom: '3px' }}>Channel</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--clr-ink)', textTransform: 'capitalize' }}>{booking.callType}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)', marginBottom: '3px' }}>Scheduled For</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--clr-ink)' }}>
                {booking.appointmentDate ? new Date(booking.appointmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Session time to be arranged'} · {booking.duration} Min
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)', marginBottom: '3px' }}>Total Amount</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--clr-ink)' }}>
                {booking.currencySymbol || '₹'}{displayPrice.toLocaleString()}
              </p>
            </div>
            {(booking.razorpayPaymentId || booking.transactionId) && (
              <div style={{ gridColumn: '1 / -1' }}>
                <p style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)', marginBottom: '3px' }}>Transaction ID / Reference</p>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--clr-ink)' }}>{booking.razorpayPaymentId || booking.transactionId}</p>
              </div>
            )}
            <div>
              <p style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)', marginBottom: '3px' }}>Payment Method</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--clr-ink)' }}>{booking.paymentMethod}</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {isAccepted && (
              <button
                onClick={handleDownloadInvoice}
                className="btn-primary"
                style={{ width: '100%', height: 48, borderRadius: 'var(--r-md)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                📥 Download Invoice Statement
              </button>
            )}
            {isQueued && (
              <button
                onClick={() => toast.info('Invoice will be available once your booking is confirmed.')}
                style={{
                  width: '100%', height: 48, borderRadius: 'var(--r-md)',
                  background: '#f9f8f6', border: '1.5px solid var(--clr-border)',
                  color: 'var(--clr-warm-gray)', fontSize: '0.875rem', fontWeight: 600,
                  cursor: 'not-allowed',
                }}
                disabled
              >
                Verification Pending Confirmation
              </button>
            )}
            <Link to="/" style={{ width: '100%' }}>
              <button
                className="btn-secondary"
                style={{
                  width: '100%', height: 48, borderRadius: 'var(--r-md)',
                  boxShadow: 'none', border: '1px solid var(--clr-border)', background: '#fff',
                }}
              >
                Return to Dashboard
              </button>
            </Link>
          </div>
        </motion.div>

        {/* ── Banner Panel ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          style={{
            position: 'relative',
            height: 180,
            borderRadius: 'var(--r-xl)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--clr-border)',
          }}
        >
          <div style={{ position: 'absolute', inset: 0, backgroundImage: "url('/hero-bg.png')", backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.35)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 0%, rgba(13,26,14,0.85) 100%)' }} />
          <div style={{ position: 'relative', zIndex: 1, padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start' }}>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 500, color: '#fff', marginBottom: '4px' }}>
              Setting Your Intentions
            </h4>
            <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, maxWidth: '480px' }}>
              We encourage you to pause, disconnect for a few moments, and align your thoughts before this session begins.
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default PaymentSuccess;
