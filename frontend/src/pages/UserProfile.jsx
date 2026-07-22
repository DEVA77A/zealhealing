import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const UserProfile = () => {
  const { user, getToken } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyBookings = async () => {
      try {
        const { data } = await axios.get('/api/bookings/mybookings', {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        setBookings(data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchMyBookings();
  }, [user, getToken]);

  const handleDownloadInvoice = async (bookingId, invoiceNumber) => {
    try {
      const res = await axios.get(`/api/invoice/${bookingId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error('Failed to download invoice');
    }
  };

  const getStatusBadge = (status) => {
    let styles = {
      padding: '4px 10px',
      borderRadius: '99px',
      fontSize: '0.625rem',
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      display: 'inline-flex',
      alignItems: 'center',
      border: '1px solid',
    };

    switch (status) {
      case 'Queued':
        return <span style={{ ...styles, background: '#fffbeb', color: '#b45309', borderColor: '#fde68a' }}>⏳ Pending</span>;
      case 'Accepted':
        return <span style={{ ...styles, background: 'var(--clr-forest-50)', color: 'var(--clr-forest-700)', borderColor: 'var(--clr-border)' }}>✓ Confirmed</span>;
      case 'Completed':
        return <span style={{ ...styles, background: '#e8f5e9', color: '#2e7d32', borderColor: '#a5d6a7' }}>✓ Completed</span>;
      case 'Rejected': 
      case 'Cancelled':
        return <span style={{ ...styles, background: '#fef2f2', color: '#b91c1c', borderColor: '#fca5a5' }}>✕ {status}</span>;
      default:
        return <span style={{ ...styles, background: 'var(--clr-forest-50)', color: 'var(--clr-warm-gray)', borderColor: 'var(--clr-border)' }}>{status}</span>;
    }
  };

  const getPaymentStatusBadge = (status) => {
    let styles = {
      padding: '3px 8px',
      borderRadius: '4px',
      fontSize: '0.5625rem',
      fontWeight: 700,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      display: 'inline-flex',
    };

    switch (status) {
      case 'Completed':
        return <span style={{ ...styles, background: 'rgba(46,125,50,0.1)', color: '#2e7d32' }}>Paid</span>;
      case 'Failed':
        return <span style={{ ...styles, background: '#fee2e2', color: '#b91c1c' }}>Failed</span>;
      default:
        return <span style={{ ...styles, background: '#fffbeb', color: '#b45309' }}>Pending</span>;
    }
  };

  if (!user) return null;

  return (
    <div style={{ minHeight: '100svh', background: 'var(--clr-parchment)', paddingTop: 'var(--nav-h)', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'var(--space-12) 24px' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: '40px' }}
        >
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.75rem', fontWeight: 500, color: 'var(--clr-ink)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
            Inner Studio
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'var(--clr-warm-gray)' }}>Personal profile records, security settings, and active consultation logs.</p>
        </motion.div>

        {/* Grid panel */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }} className="lg:grid-cols-3">

          {/* Sidebar Profiler */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ gridColumn: 'span 1' }}
          >
            <div style={{
              background: '#fff',
              border: '1px solid var(--clr-border)',
              borderRadius: 'var(--r-xl)',
              padding: '40px',
              boxShadow: 'var(--shadow-sm)',
              position: 'sticky',
              top: '110px',
            }}>
              {/* Avatar circle */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
                <div style={{
                  width: 80, height: 80,
                  borderRadius: '50%',
                  background: 'var(--clr-forest-50)',
                  border: '1.5px solid var(--clr-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2rem', fontWeight: 500, color: 'var(--clr-forest-700)',
                  fontFamily: 'var(--font-display)',
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Data list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {[
                  { label: 'Name', value: user.name },
                  { label: 'Email Primary', value: user.email },
                  { label: 'Contact Phone', value: user.phone || '—' },
                  ...(user.location ? [{ label: 'Region / Segment', value: `${user.location.country} (${user.location.currency})` }] : []),
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)' }}>
                      {item.label}
                    </span>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--clr-ink)' }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Bookings log */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
            className="lg:col-span-2"
          >
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.625rem', fontWeight: 500, color: 'var(--clr-ink)', marginBottom: '8px' }}>
              Booking Log
            </h2>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                <div className="spinner" style={{ width: 28, height: 28 }} />
              </div>
            ) : bookings.length === 0 ? (
              <div style={{
                background: '#fff',
                border: '1px solid var(--clr-border)',
                borderRadius: 'var(--r-xl)',
                padding: '60px 40px',
                textAlign: 'center',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <span style={{ fontSize: '2rem', display: 'block', marginBottom: '16px' }}>🌿</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 500, color: 'var(--clr-ink)', marginBottom: '8px' }}>
                  No historical records
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--clr-warm-gray)', marginBottom: '28px' }}>
                  Your journey ledger is currently blank. Schedule your first consultation to begin.
                </p>
                <Link to="/sessions" className="btn-primary" style={{ display: 'inline-flex', borderRadius: 'var(--r-md)' }}>
                  Book Session
                </Link>
              </div>
            ) : (
              bookings.map((booking, idx) => {
                const canDownload = ['Accepted', 'Completed'].includes(booking.bookingStatus) && booking.invoiceNumber;

                return (
                  <motion.div
                    key={booking._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      background: '#fff',
                      border: '1px solid var(--clr-border)',
                      borderRadius: 'var(--r-xl)',
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '20px',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    {/* Left content block */}
                    <div style={{ flexGrow: 1, minWidth: '240px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--clr-ink)' }}>
                          {booking.appointmentType}
                        </h3>
                        {getStatusBadge(booking.bookingStatus)}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8125rem', color: 'var(--clr-warm-gray)' }}>
                        <p>Format: <span style={{ color: 'var(--clr-ink)', fontWeight: 500, textTransform: 'capitalize' }}>{booking.callType} Call</span></p>
                        <p>Duration: <span style={{ color: 'var(--clr-ink)', fontWeight: 500 }}>{booking.duration} minutes</span></p>
                        <p>Scheduled: <span style={{ color: 'var(--clr-ink)', fontWeight: 500 }}>{new Date(booking.appointmentDate).toLocaleDateString()}</span></p>
                      </div>

                      {canDownload && (
                        <button
                          onClick={() => handleDownloadInvoice(booking._id, booking.invoiceNumber)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                            color: 'var(--clr-forest-700)',
                            marginTop: '16px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          📥 Invoice ({booking.invoiceNumber})
                        </button>
                      )}
                    </div>

                    {/* Right side amount */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      paddingLeft: '24px',
                      borderLeft: '1px solid var(--clr-border)',
                      minWidth: '120px',
                    }} className="sm:items-end sm:text-right">
                      <span style={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)', marginBottom: '3px' }}>
                        Honorarium
                      </span>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.625rem', fontWeight: 600, color: 'var(--clr-forest-700)', lineHeight: 1 }}>
                        {booking.currencySymbol}{booking.convertedAmount || booking.price}
                      </span>
                      <div style={{ marginTop: '8px' }}>
                        {getPaymentStatusBadge(booking.paymentStatus)}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}

          </motion.div>

        </div>

      </div>
    </div>
  );
};

export default UserProfile;
