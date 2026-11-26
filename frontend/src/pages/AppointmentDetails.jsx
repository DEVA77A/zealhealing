import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { usePricing } from '../context/PricingContext';
import { FiClock, FiCheck, FiArrowRight, FiPhone, FiVideo, FiShield, FiStar } from 'react-icons/fi';

const AppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPrice, formatPrice } = usePricing();

  const [selectedPkg, setSelectedPkg] = useState(null);
  const [relatedPkgs, setRelatedPkgs] = useState([]);
  const [loading, setLoading] = useState(true);
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

  if (loading || !selectedPkg) {
    return (
      <div style={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--clr-parchment)' }}>
        <div className="spinner" style={{ width: 36, height: 36 }} />
      </div>
    );
  }

  const sessionPrice = getPrice(selectedPkg.type, selectedPkg.duration, selectedPkg.price);
  const sessionPriceLabel = formatPrice(sessionPrice);
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
        }
        @media (max-width: 576px) {
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
                  <TypeIcon size={11} /> {selectedPkg.type === 'voice' ? 'Voice Call' : 'Video Call'}
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
              { icon: FiShield, text: 'Your session time will be arranged after booking' },
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

          <motion.div className="step-card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.0, duration: 0.45 }}>
            <div className="step-header">
              <span className="step-title">Choose Duration</span>
            </div>
            <div className="dur-grid">
              {relatedPkgs.map(pkg => (
                <button
                  key={pkg._id}
                  aria-pressed={selectedPkg._id === pkg._id}
                  className={`dur-btn ${selectedPkg._id === pkg._id ? 'active' : ''}`}
                  onClick={() => navigate(`/book/${pkg._id}`)}
                >
                  <FiClock size={15} style={{ strokeWidth: 2.5, flexShrink: 0 }} />
                  <span><strong>{pkg.duration}</strong> minutes</span>
                </button>
              ))}
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
            </div>

            {/* Button */}
            <button
              onClick={() => navigate(`/checkout/${selectedPkg._id}`)}
              style={{
                position: 'relative', zIndex: 1, flexShrink: 0,
                height: 48, padding: '0 28px',
                borderRadius: 'var(--r-md)',
                background: '#fff',
                color: 'var(--clr-forest-900)',
                border: 'none',
                fontFamily: 'var(--font-body)',
                fontSize: '0.9375rem', fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 200ms ease',
                display: 'flex', alignItems: 'center', gap: '8px',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              }}
            >
              Confirm & Continue to Payment <FiArrowRight style={{ strokeWidth: 2.5 }} />
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetails;
