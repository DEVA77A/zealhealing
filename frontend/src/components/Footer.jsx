import { useState } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const quickLinks = [
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Refund Policy', to: '/refund' },
    { label: 'Terms of Service', to: '/terms' },
    { label: 'Shipping Policy', to: '/shipping' },
    { label: 'Contact', to: '/contact' },
  ];

  const socialLinks = [
    {
      label: 'Facebook',
      href: 'https://www.facebook.com/baghyazealhealing/',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      ),
    },
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/zeal_healing/',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      ),
    },
    {
      label: 'YouTube',
      href: 'https://www.youtube.com/@zealhealingtamil',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58a2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
          <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
        </svg>
      ),
    },
  ];

  return (
    <footer style={{ background: 'var(--clr-forest-950)', color: 'rgba(255,255,255,0.7)' }}>
      {/* ── Main Content ── */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ padding: '80px 0 60px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '48px' }} className="md:grid-cols-4">

            {/* ── Brand Column ── */}
            <div style={{ gridColumn: 'span 1' }}>
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  overflow: 'hidden', flexShrink: 0,
                }}>
                  <img src="/logo.png" alt="Zeal Healing" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: '#fff',
                  letterSpacing: '-0.01em',
                }}>
                  Zeal Healing
                </span>
              </Link>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.5)', marginBottom: '28px', maxWidth: '220px' }}>
                A sanctuary dedicated to holistic well-being, healing, and spiritual growth.
              </p>
              {/* Social Icons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {socialLinks.map(({ label, href, icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    style={{
                      width: 36, height: 36,
                      borderRadius: 'var(--r-md)',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'rgba(255,255,255,0.5)',
                      transition: 'all 200ms ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                      e.currentTarget.style.color = '#fff';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                      e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    }}
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>

            {/* ── Quick Links ── */}
            <div>
              <h4 style={{
                fontSize: '0.625rem',
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.4)',
                marginBottom: '20px',
              }}>
                Company
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {quickLinks.map(link => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      style={{
                        fontSize: '0.9375rem',
                        color: 'rgba(255,255,255,0.55)',
                        transition: 'color 180ms ease',
                        fontWeight: 400,
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Contact ── */}
            <div>
              <h4 style={{
                fontSize: '0.625rem',
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.4)',
                marginBottom: '20px',
              }}>
                Contact
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { icon: '📍', text: '19/10A Thiruchengode, AS Pettai, Namakkal' },
                  { icon: '✉', text: 'baghyazeal@gmail.com', href: 'mailto:baghyazeal@gmail.com' },
                  { icon: '☎', text: '+91 93241 75883', href: 'tel:+919324175883' },
                ].map(({ icon, text, href }, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.875rem', flexShrink: 0, marginTop: '2px', opacity: 0.6 }}>{icon}</span>
                    {href ? (
                      <a
                        href={href}
                        style={{
                          fontSize: '0.9375rem',
                          color: 'rgba(255,255,255,0.55)',
                          lineHeight: 1.5,
                          transition: 'color 180ms ease',
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
                      >
                        {text}
                      </a>
                    ) : (
                      <span style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
                        {text}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Newsletter ── */}
            <div>
              <h4 style={{
                fontSize: '0.625rem',
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.4)',
                marginBottom: '20px',
              }}>
                Stay Connected
              </h4>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.65, color: 'rgba(255,255,255,0.5)', marginBottom: '20px' }}>
                Receive healing insights, session updates, and spiritual wisdom.
              </p>

              {subscribed ? (
                <div style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--r-md)',
                  background: 'rgba(74, 222, 128, 0.12)',
                  border: '1px solid rgba(74, 222, 128, 0.2)',
                  color: '#4ade80',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}>
                  ✓ Thank you for subscribing
                </div>
              ) : (
                <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      height: 48,
                      padding: '0 16px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.10)',
                      borderRadius: 'var(--r-md)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.9375rem',
                      color: '#fff',
                      outline: 'none',
                      transition: 'border-color 200ms ease, background 200ms ease',
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = 'rgba(129, 199, 132, 0.5)';
                      e.target.style.background = 'rgba(255,255,255,0.09)';
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = 'rgba(255,255,255,0.10)';
                      e.target.style.background = 'rgba(255,255,255,0.06)';
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      height: 48,
                      background: 'var(--clr-forest-700)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 'var(--r-md)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'background 200ms ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--clr-forest-600)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--clr-forest-700)'}
                  >
                    Subscribe
                  </button>
                  <p style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>
                    By subscribing, you agree to our{' '}
                    <Link to="/terms" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'underline' }}>Terms</Link>
                    .
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '24px 0', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', textAlign: 'center' }} className="sm:flex-row sm:justify-between">
          <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.3)' }}>
            © {new Date().getFullYear()} Zeal Healing. All rights reserved.
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.2)' }}>
            Crafted with intention
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
