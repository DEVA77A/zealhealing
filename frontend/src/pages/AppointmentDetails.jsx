import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { usePricing } from '../context/PricingContext';
import { toast } from 'react-toastify';
import { FiClock, FiCalendar, FiCheck, FiArrowRight, FiPhone, FiVideo, FiShield, FiStar } from 'react-icons/fi';

const AppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPrice, formatPrice } = usePricing();

  const [selectedPkg, setSelectedPkg] = useState(null);
  const [relatedPkgs, setRelatedPkgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        const { data } = await axios.get('/api/classes');
        const pkg = data.find(p => p._id === id);
        if (pkg) {
          setSelectedPkg(pkg);
          setRelatedPkgs(data.filter(p => p.type === pkg.type && p.status === 'Active').sort((a,b) => a.duration - b.duration));
        } else navigate('/sessions');
        setLoading(false);
      } catch { setLoading(false); }
    };
    fetchClassDetails();
  }, [id, navigate]);

  useEffect(() => {
    if (selectedDate && selectedPkg) fetchSlots(selectedDate);
  }, [selectedDate, selectedPkg]);

  const fetchSlots = async (date) => {
    setFetchingSlots(true);
    setSelectedTime(null);
    try {
      const dateStr = date.toISOString().split('T')[0];
      const { data } = await axios.get(`/api/bookings/slots?date=${dateStr}&duration=${selectedPkg.duration}`);
      setAvailableSlots(data.slots);
    } catch { toast.error('Failed to fetch available slots'); }
    finally { setFetchingSlots(false); }
  };

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) {
      toast.info('Please select a date and time slot first.');
      return;
    }
    localStorage.setItem('tempAppointment', JSON.stringify({ date: selectedDate.toISOString(), time: selectedTime }));
    navigate(`/checkout/${selectedPkg._id}`);
  };

  if (loading || !selectedPkg) {
    return (
      <div style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--clr-parchment)' }}>
        <div className="spinner" style={{ width: 36, height: 36 }} />
      </div>
    );
  }

  /* Calendar helpers */
  const daysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();
  const firstDayOfMonth = (m, y) => new Date(y, m, 1).getDay();
  const generateDays = () => {
    const days = [];
    const m = currentMonth.getMonth(), y = currentMonth.getFullYear();
    for (let i = 0; i < firstDayOfMonth(m, y); i++) days.push(null);
    for (let i = 1; i <= daysInMonth(m, y); i++) days.push(new Date(y, m, i));
    return days;
  };
  const isToday = (d) => { const t = new Date(); return d && d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear(); };
  const isSelected = (d) => d && selectedDate && d.getDate() === selectedDate.getDate() && d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear();
  const isPast = (d) => { if (!d) return true; const t = new Date(); t.setHours(0,0,0,0); return d < t; };
  const formatMonth = (d) => d.toLocaleString('default', { month: 'long', year: 'numeric' });
  const formatTime12h = (t) => { const [h, m] = t.split(':').map(Number); const ap = h >= 12 ? 'PM' : 'AM'; const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h; return `${String(h12).padStart(2,'0')}:${String(m).padStart(2,'0')} ${ap}`; };

  const sessionPrice = getPrice(selectedPkg.type, selectedPkg.duration, selectedPkg.price);
  const sessionPriceLabel = formatPrice(sessionPrice);
  const isReady = selectedDate && selectedTime;
  const TypeIcon = selectedPkg.type === 'voice' ? FiPhone : FiVideo;

  return (
    <div style={{ background: 'var(--clr-parchment)', paddingTop: 'var(--nav-h)', minHeight: '100svh' }}>
      <style dangerouslySetInnerHTML={{__html: `
        .appt-layout {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 20px;
          width: 100%;
          padding: 32px clamp(20px, 4vw, 60px) 80px;
          align-items: start;
        }
        .appt-sidebar {
          position: sticky;
          top: calc(var(--nav-h) + 24px);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .sidebar-card {
          background: #fff;
          border: 1px solid var(--clr-border);
          border-radius: var(--r-xl);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }
        .appt-main {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .steps-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          align-items: start;
        }
        @media (max-width: 700px) {
          .steps-row { grid-template-columns: 1fr; }
        }
        .step-card {
          background: #fff;
          border: 1px solid var(--clr-border);
          border-radius: var(--r-xl);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }
        .step-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          border-bottom: 1px solid var(--clr-border);
          background: var(--clr-forest-50);
        }
        .step-num {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--clr-forest-700);
          color: #fff;
          font-size: 0.8125rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .step-title {
          font-size: 0.9375rem;
          font-weight: 700;
          color: var(--clr-ink);
        }
        .dur-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 16px 20px;
        }
        .dur-btn {
          padding: 12px 16px;
          border-radius: var(--r-md);
          border: 1.5px solid var(--clr-border);
          background: #fff;
          color: var(--clr-ink-muted);
          font-family: var(--font-body);
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 200ms ease;
          text-align: left;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .dur-btn.active {
          background: var(--clr-forest-700);
          border-color: var(--clr-forest-700);
          color: #fff;
          box-shadow: 0 4px 12px rgba(32, 138, 116, 0.28);
        }
        .dur-btn:not(.active):hover {
          border-color: var(--clr-forest-400);
          color: var(--clr-forest-700);
        }
        .cal-wrap {
          padding: 14px 16px;
        }
        .cal-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .cal-nav-btn {
          width: 32px; height: 32px;
          border-radius: var(--r-md);
          border: 1px solid var(--clr-border);
          background: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 150ms;
        }
        .cal-nav-btn:hover { background: var(--clr-forest-50); }
        .cal-month-label {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--clr-ink);
          letter-spacing: 0.02em;
        }
        .cal-day-headers {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
          margin-bottom: 6px;
        }
        .cal-day-header {
          text-align: center;
          font-size: 0.625rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: var(--clr-warm-gray);
          padding: 4px 0;
        }
        .cal-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 2px;
        }
        .cal-day {
          aspect-ratio: 1;
          border-radius: var(--r-sm);
          border: none;
          font-family: var(--font-body);
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 140ms ease;
          background: transparent;
          color: var(--clr-ink-muted);
          padding: 0;
          line-height: 1;
        }
        .cal-day.empty { pointer-events: none; opacity: 0; }
        .cal-day.past { color: #ccc; cursor: not-allowed; }
        .cal-day.today { background: var(--clr-forest-50); color: var(--clr-forest-700); font-weight: 700; }
        .cal-day.selected { background: var(--clr-forest-700); color: #fff; font-weight: 700; box-shadow: 0 3px 10px rgba(32, 138, 116, 0.3); }
        .cal-day:not(.past):not(.selected):not(.empty):hover { background: var(--clr-forest-50); color: var(--clr-forest-700); }
        .slots-wrap {
          padding: 20px;
        }
        .slots-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          max-height: 200px;
          overflow-y: auto;
        }
        .slot-btn {
          padding: 10px 4px;
          border-radius: var(--r-md);
          border: 1.5px solid var(--clr-border);
          background: #fff;
          color: var(--clr-ink-muted);
          font-family: var(--font-body);
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 180ms ease;
          text-align: center;
        }
        .slot-btn.active {
          background: var(--clr-forest-700);
          border-color: var(--clr-forest-700);
          color: #fff;
          box-shadow: 0 3px 10px rgba(32, 138, 116, 0.25);
        }
        .slot-btn:not(.active):hover {
          border-color: var(--clr-forest-400);
          color: var(--clr-forest-700);
        }
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 28px 16px;
          text-align: center;
          background: var(--clr-forest-50);
          border-radius: var(--r-lg);
          border: 1.5px dashed var(--clr-border-strong);
        }
        .cta-bar {
          background: var(--clr-forest-900);
          border-radius: var(--r-xl);
          padding: 24px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          position: relative;
          overflow: hidden;
          box-shadow: var(--shadow-lg);
        }
        @media (max-width: 900px) {
          .appt-layout { grid-template-columns: 1fr; }
          .appt-sidebar { position: static; }
          .slots-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 576px) {
          .dur-grid { grid-template-columns: repeat(2, 1fr); }
          .slots-grid { grid-template-columns: repeat(2, 1fr); }
          .cta-bar { flex-direction: column; align-items: flex-start; }
        }
      `}} />

      <div className="appt-layout">

        {/* ══ LEFT SIDEBAR ══ */}
        <div className="appt-sidebar">

          {/* Package Info Card */}
          <div className="sidebar-card">
            <div style={{ position: 'relative', height: 140, overflow: 'hidden' }}>
              <img
                src={selectedPkg.image || '/tarot.png'}
                alt={selectedPkg.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.7) 0%, transparent 60%)' }} />
              <div style={{ position: 'absolute', bottom: 14, left: 16 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '4px 10px', borderRadius: '99px',
                  background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  fontSize: '0.75rem', fontWeight: 700, color: '#fff',
                }}>
                  <TypeIcon size={11} /> {selectedPkg.type === 'voice' ? 'Voice Call' : 'Video Call'} · Step 2 of 3
                </span>
              </div>
            </div>
            <div style={{ padding: '20px' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--clr-ink)', marginBottom: '6px', lineHeight: 1.2 }}>
                {selectedPkg.title}
              </h1>
              <p style={{ fontSize: '0.875rem', color: 'var(--clr-ink-muted)', lineHeight: 1.6, marginBottom: '16px' }}>
                {selectedPkg.description}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 0', borderTop: '1px solid var(--clr-border)', borderBottom: '1px solid var(--clr-border)', marginBottom: '12px' }}>
                <FiClock style={{ color: 'var(--clr-forest-700)', strokeWidth: 2.5 }} />
                <span style={{ fontSize: '0.875rem', color: 'var(--clr-ink-muted)' }}>
                  <strong style={{ color: 'var(--clr-ink)' }}>{selectedPkg.duration} min</strong> session
                </span>
              </div>

              <div style={{ marginTop: '4px' }}>
                <span style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)', display: 'block', marginBottom: '4px' }}>
                  Session Honorarium
                </span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--clr-forest-700)', lineHeight: 1 }}>
                  {sessionPriceLabel}
                </span>
              </div>
            </div>
          </div>

          {/* What to Expect */}
          <div className="sidebar-card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--clr-ink)', marginBottom: '14px' }}>
              What to Expect
            </h4>
            {[
              { icon: FiStar, text: 'Deep intuitive reading focused on your energies' },
              { icon: FiCheck, text: 'Open, receptive mindset recommended' },
              { icon: FiShield, text: 'Rescheduling available 24h in advance' },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: i < 2 ? '10px' : 0 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--clr-forest-50)', border: '1px solid var(--clr-border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={12} style={{ color: 'var(--clr-forest-700)', strokeWidth: 2.5 }} />
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--clr-ink-muted)', lineHeight: 1.5 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ══ RIGHT MAIN ══ */}
        <div className="appt-main">

          {/* ── Duration + Calendar row ── */}
          <div className="steps-row">

            {/* Step 1: Duration */}
            <motion.div className="step-card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.0, duration: 0.45 }}>
              <div className="step-header">
                <div className="step-num">1</div>
                <span className="step-title">Choose Duration</span>
              </div>
              <div className="dur-grid">
                {relatedPkgs.map(pkg => (
                  <button
                    key={pkg._id}
                    className={`dur-btn ${selectedPkg._id === pkg._id ? 'active' : ''}`}
                    onClick={() => navigate(`/book/${pkg._id}`)}
                  >
                    <FiClock size={15} style={{ strokeWidth: 2.5, flexShrink: 0 }} />
                    <span><strong>{pkg.duration}</strong> minutes</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Step 2: Calendar */}
            <motion.div className="step-card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.45 }}>
              <div className="step-header">
                <div className="step-num">2</div>
                <span className="step-title">Select Date</span>
                {selectedDate && (
                  <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--clr-forest-700)', fontWeight: 700 }}>
                    {selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
              <div className="cal-wrap">
                {/* Month Nav */}
                <div className="cal-nav">
                  <button className="cal-nav-btn" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                  <span className="cal-month-label">{formatMonth(currentMonth)}</span>
                  <button className="cal-nav-btn" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </div>

                {/* Day headers */}
                <div className="cal-day-headers">
                  {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                    <div key={d} className="cal-day-header">{d}</div>
                  ))}
                </div>

                {/* Days */}
                <div className="cal-days">
                  {generateDays().map((date, i) => (
                    <button
                      key={i}
                      className={`cal-day ${!date ? 'empty' : isPast(date) ? 'past' : isSelected(date) ? 'selected' : isToday(date) ? 'today' : ''}`}
                      onClick={() => date && !isPast(date) && setSelectedDate(date)}
                      disabled={!date || isPast(date)}
                    >
                      {date?.getDate()}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

          </div>{/* end .steps-row */}

          {/* Step 3: Time Slots */}
          <motion.div className="step-card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16, duration: 0.45 }}>
            <div className="step-header">
              <div className="step-num" style={{ background: selectedDate ? 'var(--clr-forest-700)' : 'var(--clr-border)' }}>3</div>
              <span className="step-title" style={{ color: selectedDate ? 'var(--clr-ink)' : 'var(--clr-warm-gray)' }}>Choose Time Slot</span>
              {selectedTime && (
                <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--clr-forest-700)', fontWeight: 700 }}>
                  {formatTime12h(selectedTime)}
                </span>
              )}
            </div>
            <div className="slots-wrap">
              {!selectedDate ? (
                <div className="empty-state">
                  <FiCalendar size={28} style={{ color: 'var(--clr-forest-400)', marginBottom: '10px', opacity: 0.6 }} />
                  <p style={{ fontSize: '0.875rem', color: 'var(--clr-warm-gray)' }}>Select a date to view available slots</p>
                </div>
              ) : fetchingSlots ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px', gap: '10px' }}>
                  <div className="spinner" />
                  <p style={{ fontSize: '0.875rem', color: 'var(--clr-warm-gray)' }}>Finding slots…</p>
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="slots-grid">
                  {availableSlots.map(slot => (
                    <button key={slot} className={`slot-btn ${selectedTime === slot ? 'active' : ''}`} onClick={() => setSelectedTime(slot)}>
                      {formatTime12h(slot)}
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', background: '#fee2e2', borderRadius: 'var(--r-lg)', border: '1px solid #fecaca' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#b91c1c' }}>No slots available. Please choose another date.</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* ── CTA Bar ── */}
          <motion.div
            className="cta-bar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24, duration: 0.5 }}
          >
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at top right, rgba(74,175,80,0.10), transparent)', pointerEvents: 'none' }} />

            {/* Summary */}
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '28px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>Fee</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.625rem', fontWeight: 800, color: '#fff', lineHeight: 1, letterSpacing: '-0.02em' }}>
                  {sessionPriceLabel}
                </p>
              </div>
              {selectedDate && (
                <div>
                  <p style={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>Date</p>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
                    {selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              )}
              {selectedTime && (
                <div>
                  <p style={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>Time</p>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{formatTime12h(selectedTime)}</p>
                </div>
              )}
            </div>

            {/* Button */}
            <button
              onClick={handleContinue}
              style={{
                position: 'relative', zIndex: 1, flexShrink: 0,
                height: 48, padding: '0 28px',
                borderRadius: 'var(--r-md)',
                background: isReady ? '#fff' : 'rgba(255,255,255,0.10)',
                color: isReady ? 'var(--clr-forest-900)' : 'rgba(255,255,255,0.35)',
                border: 'none',
                fontFamily: 'var(--font-body)',
                fontSize: '0.9375rem', fontWeight: 700,
                cursor: isReady ? 'pointer' : 'not-allowed',
                transition: 'all 200ms ease',
                display: 'flex', alignItems: 'center', gap: '8px',
                whiteSpace: 'nowrap',
                boxShadow: isReady ? '0 4px 16px rgba(0,0,0,0.2)' : 'none',
              }}
            >
              Confirm & Continue <FiArrowRight style={{ strokeWidth: 2.5 }} />
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetails;
