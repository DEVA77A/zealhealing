import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiMessageSquare } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchMyBookings = async () => {
      try {
        const { data } = await axios.get('/api/bookings/mybookings', {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        setBookings(data);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to fetch your bookings');
        setLoading(false);
      }
    };
    fetchMyBookings();
  }, [getToken]);

  const downloadInvoice = async (id, mode = 'download') => {
    try {
      const response = await axios.get(`/api/invoice/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      if (mode === 'view') {
        setViewingInvoice({ url, number: id.substring(0, 8) });
      } else {
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `invoice-${id.substring(0, 8)}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (error) {
      toast.error(`Failed to ${mode} invoice`);
    }
  };

  const getStatusBadge = (status) => {
    let styles = {
      padding: '4px 12px',
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

  if (loading) {
    return (
      <div style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--clr-parchment)' }}>
        <div className="spinner" style={{ width: 36, height: 36 }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100svh', background: 'var(--clr-parchment)', paddingTop: 'var(--nav-h)', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'var(--space-12) 24px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.75rem', fontWeight: 500, color: 'var(--clr-ink)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
            Spiritual Ledger
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'var(--clr-warm-gray)' }}>A chronological log of your tarot consults and energy healings.</p>
        </div>

        {bookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: '#fff',
              border: '1px solid var(--clr-border)',
              borderRadius: 'var(--r-xl)',
              padding: '60px 40px',
              textAlign: 'center',
              maxWidth: '600px',
              margin: '40px auto 0',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{
              width: 64, height: 64,
              borderRadius: 'var(--r-lg)',
              background: 'var(--clr-forest-50)',
              border: '1px solid var(--clr-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.75rem',
              margin: '0 auto 24px',
            }}>
              📅
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.625rem', fontWeight: 500, color: 'var(--clr-ink)', marginBottom: '12px' }}>
              No Bookings Found
            </h3>
            <p style={{ fontSize: '0.9375rem', color: 'var(--clr-warm-gray)', lineHeight: 1.6, marginBottom: '32px' }}>
              Your space is blank. Journey to our selection and secure your consult to begin details here.
            </p>
            <a href="/sessions" className="btn-primary" style={{ display: 'inline-flex', borderRadius: 'var(--r-md)' }}>
              Reserve Your Session
            </a>
          </motion.div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {bookings.map((booking, idx) => (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  background: '#fff',
                  border: '1px solid var(--clr-border)',
                  borderRadius: 'var(--r-xl)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 280ms ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'var(--clr-border-strong)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--clr-border)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                {/* Visual marker ribbon */}
                <div style={{ height: '4px', background: 'var(--clr-border-strong)' }} />

                <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  
                  {/* Badges */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                    {getStatusBadge(booking.bookingStatus)}
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '99px',
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      background: booking.callType === 'Video Call' ? '#eff6ff' : '#ecfdf5',
                      color: booking.callType === 'Video Call' ? '#2563eb' : '#059669',
                      border: '1px solid',
                      borderColor: booking.callType === 'Video Call' ? '#bfdbfe' : '#a7f3d0',
                    }}>
                      {booking.callType === 'Video Call' ? '📹 Video' : '📞 Voice'}
                    </span>
                  </div>

                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.5rem',
                    fontWeight: 500,
                    color: 'var(--clr-ink)',
                    lineHeight: 1.25,
                    marginBottom: '24px',
                  }}>
                    {booking.appointmentType}
                  </h3>

                  {/* Dates & duration */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.875rem', color: 'var(--clr-ink-muted)' }}>
                      <span style={{ fontSize: '1.1rem' }}>📅</span>
                      <span>{booking.appointmentDate ? new Date(booking.appointmentDate).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'Session time to be arranged'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.875rem', color: 'var(--clr-ink-muted)' }}>
                      <span style={{ fontSize: '1.1rem' }}>⏱</span>
                      <span>
                        {booking.appointmentTime && `${booking.appointmentTime} · `}<span style={{ color: 'var(--clr-warm-gray)', fontWeight: 400 }}>{booking.duration} mins</span>
                      </span>
                    </div>
                  </div>

                  {/* Pricing row & Zoom link */}
                  <div style={{ marginTop: 'auto' }}>
                    <div style={{
                      background: 'var(--clr-forest-50)',
                      borderRadius: 'var(--r-lg)',
                      padding: '16px 20px',
                      border: '1px solid var(--clr-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '24px',
                    }}>
                      <div>
                        <p style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)', marginBottom: '3px' }}>Session Fee</p>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--clr-forest-700)', lineHeight: 1 }}>
                          {booking.currencySymbol || '₹'}{(booking.totalAmount || booking.convertedAmount || booking.price).toLocaleString()}
                        </p>
                      </div>

                      {booking.zoomMeetingLink && booking.bookingStatus === 'Accepted' && (
                        <a 
                          href={booking.zoomMeetingLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{
                            width: 44, height: 44,
                            borderRadius: '50%',
                            background: 'var(--clr-forest-700)',
                            color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: 'var(--shadow-xs)',
                            fontSize: '1rem',
                            transition: 'all 200ms ease',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--clr-forest-800)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'var(--clr-forest-700)'}
                          title="Join Zoom Meeting"
                        >
                          📹
                        </a>
                      )}
                    </div>

                    {/* Guidance written by the practitioner for this booking */}
                    {booking.adminSuggestion?.trim() && (
                      <div style={{
                        marginBottom: '24px',
                        padding: '14px 16px',
                        background: 'var(--clr-forest-50)',
                        border: '1px solid var(--clr-border)',
                        borderLeft: '3px solid var(--clr-forest-600)',
                        borderRadius: 'var(--r-md)',
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px',
                          flexWrap: 'wrap',
                          marginBottom: '6px',
                        }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.625rem',
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: 'var(--clr-forest-700)',
                          }}>
                            <FiMessageSquare size={12} /> Guidance from Baghya Ashok
                          </span>
                          {booking.adminSuggestionAt && (
                            <span style={{ fontSize: '0.625rem', color: 'var(--clr-warm-gray)' }}>
                              {new Date(booking.adminSuggestionAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          )}
                        </div>
                        <p style={{
                          fontSize: '0.8125rem',
                          lineHeight: 1.65,
                          color: 'var(--clr-ink-muted)',
                          whiteSpace: 'pre-wrap',
                          margin: 0,
                        }}>
                          {booking.adminSuggestion}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {(booking.paidAt || (booking.paymentStatus === 'Completed' && ['Accepted', 'Completed'].includes(booking.bookingStatus))) ? (
                        <>
                          <button 
                            onClick={() => downloadInvoice(booking._id, 'view')}
                            style={{
                              flex: 1, height: 42,
                              background: '#fff',
                              border: '1.5px solid var(--clr-border-strong)',
                              borderRadius: 'var(--r-md)',
                              fontFamily: 'var(--font-body)',
                              fontSize: '0.75rem', fontWeight: 700,
                              letterSpacing: '0.08em', textTransform: 'uppercase',
                              cursor: 'pointer',
                              color: 'var(--clr-forest-700)',
                              transition: 'all 180ms ease',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--clr-forest-50)'}
                            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                          >
                            👁 View
                          </button>
                          <button 
                            onClick={() => downloadInvoice(booking._id, 'download')}
                            style={{
                              flex: 1, height: 42,
                              background: '#fff',
                              border: '1.5px solid var(--clr-border-strong)',
                              borderRadius: 'var(--r-md)',
                              fontFamily: 'var(--font-body)',
                              fontSize: '0.75rem', fontWeight: 700,
                              letterSpacing: '0.08em', textTransform: 'uppercase',
                              cursor: 'pointer',
                              color: 'var(--clr-forest-700)',
                              transition: 'all 180ms ease',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--clr-forest-50)'}
                            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                          >
                            📥 Save
                          </button>
                        </>
                      ) : (
                        <div style={{
                          width: '100%',
                          textAlign: 'center',
                          padding: '12px 0',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          border: '1.5px dashed var(--clr-border-strong)',
                          borderRadius: 'var(--r-md)',
                          color: 'var(--clr-warm-gray)',
                          background: 'rgba(0,0,0,0.02)',
                        }}>
                          Invoice Unavailable
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Invoice Viewer Modal */}
      {viewingInvoice && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}>
          <div
            onClick={() => setViewingInvoice(null)}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(13,26,14,0.6)',
              backdropFilter: 'blur(4px)',
            }}
          />
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '900px',
            height: '80vh',
            background: '#fff',
            borderRadius: 'var(--r-2xl)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid var(--clr-border)',
            boxShadow: 'var(--shadow-xl)',
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 28px',
              borderBottom: '1px solid var(--clr-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 500, color: 'var(--clr-ink)' }}>
                  State Invoice
                </h3>
                <p style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)', marginTop: '4px' }}>
                  Reference {viewingInvoice.number}
                </p>
              </div>
              <button
                onClick={() => setViewingInvoice(null)}
                style={{
                  background: 'var(--clr-forest-50)',
                  border: 'none',
                  cursor: 'pointer',
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                  color: 'var(--clr-ink)',
                }}
              >
                ✕
              </button>
            </div>
            {/* Modal Body */}
            <div style={{ flexGrow: 1, background: 'var(--clr-forest-50)', padding: '16px' }}>
              <iframe 
                src={`${viewingInvoice.url}#toolbar=0`} 
                style={{
                  width: '100%',
                  height: '100%',
                  background: '#fff',
                  border: '1px solid var(--clr-border)',
                  borderRadius: 'var(--r-xl)',
                }}
                title="Invoice Viewer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
