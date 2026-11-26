import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const BookingCalendar = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await axios.get('/api/admin/bookings', {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        setBookings(data);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to fetch bookings');
        setLoading(false);
      }
    };
    fetchBookings();
  }, [getToken]);

  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const generateDays = () => {
    const days = [];
    const month = currentMonth.getMonth();
    const year = currentMonth.getFullYear();
    const totalDays = daysInMonth(month, year);
    const startDay = firstDayOfMonth(month, year);

    // Empty slots before the first day
    for (let i = 0; i < startDay; i++) days.push(null);
    // Actual days
    for (let i = 1; i <= totalDays; i++) days.push(new Date(year, month, i));
    
    return days;
  };

  const getBookingsForDate = (date) => {
    if (!date) return [];
    const dateStr = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    return bookings.filter(b => {
      if (!b.appointmentDate || !b.appointmentTime) return false;
      const bDate = new Date(new Date(b.appointmentDate).getTime() - new Date(b.appointmentDate).getTimezoneOffset() * 60000).toISOString().split('T')[0];
      return bDate === dateStr;
    });
  };

  const handleDateClick = (date) => {
    if (!date) return;
    const dateBookings = getBookingsForDate(date);
    setSelectedDate(date);
    setSelectedBookings(dateBookings);
  };

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));

  const formatMonth = (date) => date.toLocaleString('default', { month: 'long', year: 'numeric' });

  const getStatusBadge = (status) => {
    let styles = {
      padding: '3px 8px',
      borderRadius: '99px',
      fontSize: '0.625rem',
      fontWeight: 700,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      display: 'inline-flex',
    };

    if (status === 'Completed') {
      return <span style={{ ...styles, background: 'var(--clr-forest-50)', color: 'var(--clr-forest-700)' }}>Completed</span>;
    }
    if (status === 'Accepted') {
      return <span style={{ ...styles, background: '#eff6ff', color: '#1d4ed8' }}>Scheduled</span>;
    }
    return <span style={{ ...styles, background: '#fffbeb', color: '#b45309' }}>Pending</span>;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 0' }}>
        <div className="spinner" style={{ width: 28, height: 28 }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 120px)', margin: '-24px', background: '#fafaf9', borderLeft: '1px solid var(--clr-border)', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Calendar container info card */}
      <div style={{ flexGrow: 1, padding: '40px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Header toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 500, color: 'var(--clr-ink)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
              Booking Calendar
            </h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--clr-warm-gray)' }}>Coordinate scheduled client energy modalities, alignments, and time allocations.</p>
          </div>
          
          <div style={{ display: 'inline-flex', gap: '1px', background: 'var(--clr-border)', padding: '1px', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
            <button 
              onClick={prevMonth} 
              style={{ background: '#fff', border: 'none', padding: '10px 16px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: 'var(--clr-ink)' }}
            >
              ◀
            </button>
            <div style={{ background: '#fff', padding: '10px 24px', fontSize: '0.875rem', fontWeight: 700, color: 'var(--clr-ink)', minWidth: '160px', textAlign: 'center' }}>
              {formatMonth(currentMonth)}
            </div>
            <button 
              onClick={nextMonth} 
              style={{ background: '#fff', border: 'none', padding: '10px 16px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: 'var(--clr-ink)' }}
            >
              ▶
            </button>
          </div>
        </div>

        {/* The Grid table */}
        <div style={{
          background: '#fff',
          border: '1px solid var(--clr-border)',
          borderRadius: 'var(--r-xl)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', borderBottom: '1px solid var(--clr-border)', background: 'var(--clr-forest-50)' }}>
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
              <div key={day} style={{ padding: '14px 0', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--clr-warm-gray)' }}>
                {day}
              </div>
            ))}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: 'var(--clr-border)', gap: '1px' }}>
            {generateDays().map((day, i) => {
              const dateBookings = getBookingsForDate(day);
              const isSelected = selectedDate && day && day.toDateString() === selectedDate.toDateString();
              const isToday = day && day.toDateString() === new Date().toDateString();

              return (
                <div 
                  key={i} 
                  onClick={() => handleDateClick(day)}
                  style={{
                    minHeight: '120px',
                    padding: '12px',
                    background: !day ? '#fcfcfa' : '#fff',
                    position: 'relative',
                    cursor: day ? 'pointer' : 'default',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: isSelected ? 'inset 0 0 0 2px var(--clr-forest-700)' : 'none',
                    zIndex: isSelected ? 2 : 'auto',
                  }}
                >
                  {day && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          background: isToday ? 'var(--clr-forest-700)' : 'transparent',
                          color: isToday ? '#fff' : 'var(--clr-ink)',
                        }}>
                          {day.getDate()}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '12px' }}>
                        {dateBookings.slice(0, 2).map(b => (
                          <div 
                            key={b._id} 
                            style={{ 
                              fontSize: '0.625rem', 
                              padding: '2px 6px', 
                              background: 'var(--clr-forest-50)', 
                              border: '1px solid var(--clr-border)',
                              borderRadius: '4px',
                              color: 'var(--clr-forest-700)',
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {b.appointmentTime} · {b.callType.split(' ')[0]}
                          </div>
                        ))}
                        {dateBookings.length > 2 && (
                          <div style={{ fontSize: '0.625rem', color: 'var(--clr-warm-gray)', fontWeight: 600, paddingLeft: '4px' }}>
                            + {dateBookings.length - 2} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sub-quote section */}
        <div style={{
          background: 'var(--clr-forest-50)',
          border: '1px solid var(--clr-border)',
          borderRadius: 'var(--r-xl)',
          padding: '40px',
          textAlign: 'center',
        }}>
          <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.25rem', color: 'var(--clr-forest-750)', margin: '0 auto 16px', maxWidth: '600px', lineHeight: 1.5 }}>
            "The soul always knows what to do to heal itself. The challenge is to silence the mind."
          </p>
          <span style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)' }}>
            — Caroline Myss
          </span>
        </div>
      </div>

      {/* Slideout details drawer */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div 
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            style={{
              width: '400px',
              borderLeft: '1px solid var(--clr-border)',
              background: '#fff',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 30,
              boxShadow: 'var(--shadow-lg)',
              height: 'calc(100vh - 120px)',
              position: 'sticky',
              top: 0,
            }}
          >
            <div style={{ padding: '24px', borderBottom: '1px solid var(--clr-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)', margin: 0 }}>Daily Dossier</p>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 500, margin: '2px 0 0' }}>
                  {selectedDate.toLocaleDateString('default', { month: 'long', day: 'numeric' })}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedDate(null)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--clr-warm-gray)' }}
              >
                ✕ Close
              </button>
            </div>

            <div style={{ flexGrow: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: '#fafaf9' }}>
              {selectedBookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--clr-warm-gray)' }}>
                  <p style={{ fontStyle: 'italic', fontSize: '0.875rem' }}>No session appointments scheduled for this cycle.</p>
                </div>
              ) : (
                selectedBookings.sort((a,b) => a.appointmentTime.localeCompare(b.appointmentTime)).map((b) => (
                  <div 
                    key={b._id} 
                    style={{ 
                      background: '#fff', 
                      border: '1px solid var(--clr-border)', 
                      borderRadius: 'var(--r-lg)', 
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--clr-ink)' }}>
                        {b.appointmentTime} — {b.appointmentEndTime || 'Completed'}
                      </span>
                      {getStatusBadge(b.bookingStatus)}
                    </div>

                    <div>
                      <p style={{ fontWeight: 700, color: 'var(--clr-ink)', margin: 0, fontSize: '1rem' }}>{b.customerName}</p>
                      <p style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)', marginTop: '4px', margin: '4px 0 0' }}>
                        {b.appointmentType || 'Soul Alignment'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', background: 'var(--clr-forest-50)', padding: '10px 14px', borderRadius: 'var(--r-md)', border: '1px solid var(--clr-border)', fontSize: '0.75rem', color: 'var(--clr-ink-muted)' }}>
                      <span><strong>Type:</strong> {b.callType}</span>
                      <span>•</span>
                      <span><strong>District:</strong> {b.district}</span>
                    </div>

                    {b.bookingStatus === 'Accepted' && (
                      <button 
                        className="btn-primary" 
                        style={{ padding: '8px', fontSize: '0.75rem', width: '100%' }}
                        onClick={() => toast.info('Launching call integration...')}
                      >
                        Join Call Channel
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
            
            <div style={{ padding: '20px', borderTop: '1px solid var(--clr-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)' }}>Total events</span>
              <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--clr-ink)' }}>{selectedBookings.length}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookingCalendar;
