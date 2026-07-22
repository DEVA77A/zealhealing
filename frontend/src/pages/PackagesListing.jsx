import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { usePricing } from '../context/PricingContext';
import { 
  FiPhone, 
  FiVideo, 
  FiClock, 
  FiMessageCircle, 
  FiArrowRight, 
  FiLayers,
  FiCalendar
} from 'react-icons/fi';

const PackageRow = ({ pkg, symbol, displayPrice, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.98 }}
    transition={{ delay: index * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    className="service-card"
  >
    {/* Thumbnail Image */}
    <div className="service-image-container">
      <img
        src={pkg.image || '/tarot.png'}
        alt={pkg.title}
        className="service-image"
      />
    </div>

    {/* Content Details */}
    <div className="service-info">
      <span className="duration-tag">
        <FiClock style={{ strokeWidth: 2, marginRight: '4px' }} />
        {pkg.duration} Min Session
      </span>
      
      <h3 className="service-title">{pkg.title}</h3>
      
      <p className="service-desc">
        {pkg.description || 'Divine guidance tailored to your specific energy and questions.'}
      </p>

      {/* Embedded Action and Price Row */}
      <div className="service-bottom">
        <div className="price-box">
          <span className="price-label">HONORARIUM</span>
          <div className="price-value">
            {symbol}{displayPrice.toLocaleString()}
          </div>
        </div>

        <Link to={`/book/${pkg._id}`}>
          <button className="book-btn">
            Book Now
            <FiCalendar style={{ marginLeft: '6px', strokeWidth: 2 }} />
          </button>
        </Link>
      </div>
    </div>
  </motion.div>
);

const PackagesListing = () => {
  const location = useLocation();
  const { symbol, getPrice, countryCategory, loading: pricingLoading } = usePricing();
  const type = new URLSearchParams(location.search).get('type') || 'voice';

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data } = await axios.get('/api/classes');
        setPackages(data.filter(p => p.status === 'Active' && p.type === type).sort((a, b) => a.price - b.price));
        setLoading(false);
      } catch {
        setLoading(false);
      }
    };
    fetchClasses();
  }, [type]);

  const categoryName = type === 'voice' ? 'Voice Call Readings' : 'Video Call Readings';
  const regionLabel = countryCategory === 'india' ? '🇮🇳 India Pricing · GST Applicable' : '🌍 International Pricing';

  if (loading || pricingLoading) {
    return (
      <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', background: 'var(--clr-parchment)' }}>
        <div className="spinner" style={{ width: 36, height: 36 }} />
        <p style={{ fontSize: '0.875rem', color: 'var(--clr-warm-gray)', letterSpacing: '0.04em' }}>Preparing your session packages…</p>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--clr-parchment)', paddingTop: 'var(--nav-h)', overflowX: 'hidden' }}>
      
      {/* ── Custom Styles ── */}
      <style dangerouslySetInnerHTML={{__html: `
        .packages-container {
          width: 100%;
          max-width: 100%;
          margin: 0 auto;
          padding: clamp(48px, 6vw, 80px) clamp(16px, 3vw, 40px) clamp(80px, 10vw, 140px);
        }
        .selection-grid-container {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-top: 24px;
        }
        .service-card {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          background: #fff;
          border: 1px solid var(--clr-border);
          border-radius: var(--r-xl);
          padding: 16px;
          gap: 16px;
          box-shadow: var(--shadow-sm);
          transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .service-card:hover {
          box-shadow: 0 12px 30px rgba(79, 70, 229, 0.06);
          border-color: var(--clr-forest-200);
          transform: translateY(-2px);
        }
        .service-image-container {
          width: 80px;
          height: 80px;
          border-radius: var(--r-lg);
          overflow: hidden;
          flex-shrink: 0;
          border: 1.5px solid var(--clr-border-strong);
        }
        .service-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 500ms ease;
        }
        .service-card:hover .service-image {
          transform: scale(1.05);
        }
        .service-info {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 0;
        }
        .duration-tag {
          display: inline-flex;
          align-items: center;
          padding: 3px 10px;
          border-radius: 99px;
          background: var(--clr-forest-50);
          color: var(--clr-forest-700);
          font-size: 0.75rem;
          font-weight: 700;
          border: 1px solid var(--clr-border-strong);
          align-self: flex-start;
          margin-bottom: 2px;
        }
        .service-title {
          font-family: var(--font-display);
          font-size: 1.125rem;
          font-weight: 800;
          color: var(--clr-ink);
          margin: 0;
          line-height: 1.2;
        }
        .service-desc {
          font-size: 0.8125rem;
          color: var(--clr-ink-muted);
          line-height: 1.45;
          margin: 0 0 6px;
        }
        .service-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px dashed var(--clr-border);
          padding-top: 8px;
          margin-top: auto;
        }
        .price-label {
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--clr-warm-gray);
          display: block;
          margin-bottom: 1px;
        }
        .price-value {
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--clr-forest-700);
          line-height: 1;
        }
        .book-btn {
          height: 36px;
          padding: 0 14px;
          background: var(--clr-forest-50);
          color: var(--clr-forest-700);
          border: 1.5px solid var(--clr-border-strong);
          border-radius: var(--r-md);
          font-family: var(--font-body);
          font-size: 0.8125rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 200ms ease;
          white-space: nowrap;
        }
        .book-btn:hover {
          background: var(--clr-forest-700);
          color: #fff;
          border-color: transparent;
        }
        @media (max-width: 900px) {
          .selection-grid-container {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 576px) {
          .service-card {
            flex-direction: column;
            align-items: stretch;
            gap: 14px;
          }
          .service-image-container {
            width: 100%;
            height: 140px;
          }
          .service-bottom {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .book-btn { width: 100%; justify-content: center; }
        }
      `}} />

      <div className="packages-container">

        {/* Ambient Glow */}
        <div style={{
          position: 'absolute', top: '150px', left: '5%',
          width: '350px', height: '350px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, rgba(99, 102, 241, 0) 70%)',
          filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0,
        }} />

        {/* ── Page Header ── */}
        <div style={{ textAlign: 'center', marginBottom: '48px', position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '5px 14px', borderRadius: '99px',
              background: 'var(--clr-forest-50)', border: '1px solid var(--clr-border-strong)',
              fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em',
              textTransform: 'uppercase', color: 'var(--clr-forest-700)', marginBottom: '20px',
            }}>
              {regionLabel}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.25rem)',
              fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.025em',
              color: 'var(--clr-ink)', marginBottom: '16px',
            }}
          >
            {categoryName}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.16 }}
            style={{
              fontSize: '1.0625rem', color: 'var(--clr-ink-muted)',
              maxWidth: '480px', margin: '0 auto 36px', lineHeight: 1.7, fontWeight: 500,
            }}
          >
            "Everything in the universe is connected. Select a duration for your guided clarity."
          </motion.p>

          {/* ── Type switcher capsule ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.5 }}
            style={{
              display: 'inline-flex',
              background: 'var(--clr-forest-50)',
              border: '1.5px solid var(--clr-border-strong)',
              borderRadius: 'var(--r-full)', padding: '5px', gap: '4px',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            {[
              { label: 'Voice Call', value: 'voice', to: '/classes?type=voice', icon: FiPhone },
              { label: 'Video Call', value: 'video', to: '/classes?type=video', icon: FiVideo },
            ].map(tab => {
              const TabIcon = tab.icon;
              const isActive = type === tab.value;
              return (
                <Link key={tab.value} to={tab.to}>
                  <button style={{
                    height: 36, padding: '0 20px', borderRadius: 'var(--r-full)',
                    border: 'none',
                    background: isActive ? '#fff' : 'transparent',
                    color: isActive ? 'var(--clr-forest-900)' : 'var(--clr-warm-gray)',
                    fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 700,
                    cursor: 'pointer', transition: 'all 250ms ease',
                    display: 'flex', alignItems: 'center', gap: '7px',
                    boxShadow: isActive ? 'var(--shadow-xs)' : 'none',
                  }}>
                    <TabIcon style={{ strokeWidth: 2 }} />
                    {tab.label}
                  </button>
                </Link>
              );
            })}
          </motion.div>
        </div>

        {/* ── Package Grid ── */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="selection-grid-container">
            <AnimatePresence mode="popLayout">
              {packages.map((pkg, index) => (
                <PackageRow
                  key={pkg._id}
                  pkg={pkg}
                  symbol={symbol}
                  displayPrice={getPrice(pkg.type, pkg.duration, pkg.price)}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </div>

          {packages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ textAlign: 'center', padding: '80px 0' }}
            >
              <div style={{
                width: 72, height: 72, borderRadius: 'var(--r-xl)',
                background: 'var(--clr-forest-50)', border: '1.5px solid var(--clr-border-strong)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--clr-forest-700)', fontSize: '1.75rem', margin: '0 auto 24px',
              }}>
                <FiLayers />
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--clr-ink)', marginBottom: '12px' }}>No Active Packages</h3>
              <p style={{ fontSize: '1rem', color: 'var(--clr-warm-gray)', maxWidth: '360px', margin: '0 auto', lineHeight: 1.7 }}>
                Divine timing is being recalibrated. Please check back shortly.
              </p>
            </motion.div>
          )}
        </div>

        {/* ── Support Banner ── */}
        {packages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            style={{
              marginTop: '64px', padding: '56px 40px',
              background: 'var(--clr-forest-900)',
              borderRadius: 'var(--r-2xl)', textAlign: 'center',
              position: 'relative', overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.18), transparent)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at bottom left, rgba(79, 70, 229, 0.12), transparent)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--clr-forest-400)', marginBottom: '12px', display: 'inline-block' }}>
                NEED A CUSTOM DURATION?
              </span>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '28px', lineHeight: 1.2 }}>
                Custom consultations & spiritual arrangements available
              </h4>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <a
                  href="https://wa.me/919324175883"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    height: 48, padding: '0 24px', borderRadius: 'var(--r-md)',
                    background: '#fff', color: 'var(--clr-forest-900)',
                    fontFamily: 'var(--font-body)', fontSize: '0.9375rem', fontWeight: 700,
                    transition: 'all 200ms ease',
                  }}
                >
                  <FiMessageCircle /> WhatsApp Support
                </a>
                <Link
                  to="/about"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    height: 48, padding: '0 24px',
                    background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.16)',
                    borderRadius: 'var(--r-md)', color: '#fff',
                    fontFamily: 'var(--font-body)', fontSize: '0.9375rem', fontWeight: 600,
                    transition: 'all 200ms ease',
                  }}
                >
                  Explore Philosophy <FiArrowRight />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PackagesListing;
