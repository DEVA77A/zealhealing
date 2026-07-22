import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { usePricing } from '../context/PricingContext';
import { 
  FiPhone, 
  FiVideo, 
  FiCheck, 
  FiArrowRight, 
  FiMessageCircle,
  FiCompass
} from 'react-icons/fi';

const CategorySelection = () => {
  const { symbol, prices, countryCategory, loading } = usePricing();

  const getStartingPrice = (type) => {
    if (loading || !prices || !prices[type]) return '…';
    return prices[type][15] || prices[type]['15'];
  };

  const showGst = countryCategory === 'india';

  return (
    <div style={{ minHeight: '100svh', background: 'var(--clr-parchment)', paddingTop: 'var(--nav-h)', overflowX: 'hidden', position: 'relative' }}>
      
      {/* Ambient Glowing Blobs */}
      <div style={{
        position: 'absolute', top: '15%', left: '-10%',
        width: '450px', height: '450px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, rgba(99, 102, 241, 0) 70%)',
        filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'absolute', bottom: '15%', right: '-10%',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.04) 0%, rgba(139, 92, 246, 0) 70%)',
        filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0,
      }} />

      {/* ── Custom CSS Injection ── */}
      <style dangerouslySetInnerHTML={{__html: `
        .selection-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 32px;
          max-width: 860px;
          margin: 48px auto 0;
          position: relative;
          z-index: 1;
        }
        .connection-card {
          background: #fff;
          border: 1px solid var(--clr-border);
          border-radius: var(--r-2xl);
          padding: 40px 32px;
          box-shadow: var(--shadow-sm);
          transition: all 400ms cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          cursor: pointer;
          position: relative;
          text-decoration: none;
        }
        .connection-card:hover {
          box-shadow: 0 20px 48px rgba(79, 70, 229, 0.06);
          border-color: var(--clr-forest-200);
          transform: translateY(-6px);
        }

        .icon-circle {
          width: 76px;
          height: 76px;
          border-radius: 50%;
          background: var(--clr-forest-50);
          border: 1.5px solid var(--clr-border-strong);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--clr-forest-700);
          margin-bottom: 24px;
          transition: all 300ms ease;
        }
        .connection-card:hover .icon-circle {
          background: var(--clr-forest-700);
          color: #fff;
          border-color: transparent;
          transform: scale(1.05);
        }
        .card-heading {
          font-family: var(--font-display);
          font-size: 1.625rem;
          font-weight: 800;
          color: var(--clr-ink);
          margin-bottom: 12px;
          line-height: 1.25;
        }
        .card-description {
          font-size: 0.9375rem;
          color: var(--clr-ink-muted);
          line-height: 1.6;
          margin-bottom: 24px;
          max-width: 280px;
        }
        .card-divider {
          width: 100%;
          height: 1px;
          background: var(--clr-border);
          margin-bottom: 24px;
        }
        .features-list {
          list-style: none;
          padding: 0;
          margin: 0 0 32px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          text-align: left;
        }
        .feature-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.875rem;
          color: var(--clr-ink-muted);
        }
        .check-icon {
          color: var(--clr-forest-600);
          flex-shrink: 0;
          font-size: 1.1rem;
        }
        .price-wrapper {
          margin-top: auto;
          margin-bottom: 28px;
        }
        .price-tag-label {
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--clr-warm-gray);
          margin-bottom: 4px;
          display: block;
        }
        .price-tag-val {
          font-family: var(--font-display);
          font-size: 2.25rem;
          font-weight: 800;
          color: var(--clr-forest-700);
          line-height: 1.1;
        }
        .price-tag-gst {
          font-size: 0.6875rem;
          color: var(--clr-warm-gray);
          margin-top: 4px;
          letter-spacing: 0.05em;
        }
        .select-action-btn {
          width: 100%;
          height: 48px;
          background: var(--clr-forest-50);
          border: 1.5px solid var(--clr-border-strong);
          border-radius: var(--r-md);
          color: var(--clr-forest-700);
          font-family: var(--font-body);
          font-size: 0.9375rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 250ms ease;
        }
        .connection-card:hover .select-action-btn {
          background: var(--clr-forest-700);
          color: #fff;
          border-color: transparent;
        }
      `}} />

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: 'clamp(48px, 6vw, 80px) 24px clamp(80px, 10vw, 140px)', position: 'relative', zIndex: 1 }}>

        {/* ── Page Header Area ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center', marginBottom: '8px' }}
        >
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '99px',
            background: 'var(--clr-forest-50)',
            border: '1px solid var(--clr-border-strong)',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--clr-forest-700)',
            marginBottom: '20px',
          }}>
            🔮 STEP 1 OF 3
          </span>
          
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.025em',
            color: 'var(--clr-ink)',
            marginBottom: '20px',
          }}>
            Select Your Connection Type
          </h1>
          
          <p style={{ 
            fontSize: '1.125rem', 
            color: 'var(--clr-ink-muted)', 
            lineHeight: 1.7, 
            maxWidth: '540px', 
            margin: '0 auto' 
          }}>
            Choose how you would like to connect for your Tarot Reading. Both formats provide the exact same accuracy, spiritual devotion, and deep energetic alignment.
          </p>
        </motion.div>

        {/* ── Side-By-Side Selection Grid ── */}
        <div className="selection-grid">
          
          {/* Card 1: Voice Call */}
          <Link to="/classes?type=voice" style={{ display: 'contents' }}>
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="connection-card"
            >
              <div className="icon-circle">
                <FiPhone size={28} style={{ strokeWidth: 1.5 }} />
              </div>
              
              <h3 className="card-heading">Voice Call Readings</h3>
              <p className="card-description">
                Connect through a direct audio call support. Perfect for an intimate, focused, and meditative healing session.
              </p>
              
              <div className="card-divider" />
              
              <ul className="features-list">
                <li className="feature-item">
                  <FiCheck className="check-icon" /> Intimate Vocal Attunement
                </li>
                <li className="feature-item">
                  <FiCheck className="check-icon" /> Complete Audio Privacy
                </li>
                <li className="feature-item">
                  <FiCheck className="check-icon" /> Flexible & Convenient Setup
                </li>
                <li className="feature-item">
                  <FiCheck className="check-icon" /> Audio Recording (On Request)
                </li>
              </ul>
              
              <div className="price-wrapper">
                <span className="price-tag-label">Starting From</span>
                <div className="price-tag-val">
                  {symbol}{getStartingPrice('voice')}
                </div>
                {showGst && <p className="price-tag-gst">+ 18% GST Applies</p>}
              </div>

              <div className="select-action-btn">
                Commence Voice Reading <FiArrowRight style={{ strokeWidth: 2 }} />
              </div>
            </motion.div>
          </Link>

          {/* Card 2: Video Call */}
          <Link to="/classes?type=video" style={{ display: 'contents' }}>
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.16, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="connection-card"
            >
              <div className="icon-circle">
                <FiVideo size={28} style={{ strokeWidth: 1.5 }} />
              </div>
              
              <h3 className="card-heading">Video Call Readings</h3>
              <p className="card-description">
                Connect face-to-face via video consultation. Perfect for an immersive visual experience and card spreads.
              </p>
              
              <div className="card-divider" />
              
              <ul className="features-list">
                <li className="feature-item">
                  <FiCheck className="check-icon" /> Immersive Face-to-Face Guidance
                </li>
                <li className="feature-item">
                  <FiCheck className="check-icon" /> Real-Time Tarot Card Spreads
                </li>
                <li className="feature-item">
                  <FiCheck className="check-icon" /> Deeper Energetic Resonance
                </li>
                <li className="feature-item">
                  <FiCheck className="check-icon" /> HD Video Stream & Recording
                </li>
              </ul>
              
              <div className="price-wrapper">
                <span className="price-tag-label">Starting From</span>
                <div className="price-tag-val">
                  {symbol}{getStartingPrice('video')}
                </div>
                {showGst && <p className="price-tag-gst">+ 18% GST Applies</p>}
              </div>

              <div className="select-action-btn">
                Commence Video Reading <FiArrowRight style={{ strokeWidth: 2 }} />
              </div>
            </motion.div>
          </Link>
          
        </div>

        {/* ── Support note ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{ textAlign: 'center', marginTop: '64px', position: 'relative', zIndex: 1 }}
        >
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            borderRadius: '99px',
            background: 'var(--clr-forest-50)',
            border: '1.5px solid var(--clr-border-strong)',
            fontSize: '0.9375rem',
            color: 'var(--clr-ink-muted)',
          }}>
            <FiMessageCircle style={{ color: 'var(--clr-forest-700)', fontSize: '1.1rem' }} />
            Need assistance? Our advisors are ready.{' '}
            <a href="https://wa.me/919324175883" style={{ color: 'var(--clr-forest-700)', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: '3px' }}>
              Chat on WhatsApp
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CategorySelection;
