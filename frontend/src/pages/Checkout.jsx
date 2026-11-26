import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FiMapPin } from 'react-icons/fi';
import { usePricing } from '../context/PricingContext';
import { roundToCurrency } from '../utils/countryCurrency';

const FormField = ({ label, name, type, placeholder, value, onChange, required, error }) => (
  <div className="field-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    <label className="field-label" style={{
      fontFamily: 'var(--font-body)',
      fontSize: '0.6875rem',
      fontWeight: 700,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: 'var(--clr-forest-700)',
    }}>
      {label}
    </label>
    <input
      type={type}
      name={name}
      className="input-field"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      style={{
        width: '100%',
        height: 52,
        padding: '0 16px',
        background: '#fff',
        border: '1.5px solid var(--clr-border-strong)',
        borderRadius: 'var(--r-md)',
        fontFamily: 'var(--font-body)',
        fontSize: '0.9375rem',
        color: 'var(--clr-ink)',
        outline: 'none',
        transition: 'all 200ms ease',
      }}
    />
  </div>
);

const Checkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { country, countryCode, currency, symbol, getPrice, formatPrice, exchangeRate, gstRate, isDomestic } = usePricing();

  // Region follows the detected location: India is domestic, anywhere else is
  // abroad. Derived from isDomestic (country code / currency) so it stays
  // correct even if the server omits countryCategory.
  const countryCategory = isDomestic ? 'india' : 'abroad';
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerWhatsApp: '',
    district: '',
    state: '',
    country: country || '',
    countryCategory: countryCategory || 'india',
    notes: '',
  });

  useEffect(() => {
    setFormData(prev => ({ ...prev, country: country || '', countryCategory: countryCategory || 'india' }));
  }, [country, countryCategory]);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo) {
      setFormData(prev => ({
        ...prev,
        customerName: userInfo.name || '',
        customerEmail: userInfo.email || '',
        customerPhone: userInfo.phone || '',
        customerWhatsApp: userInfo.phone || '',
      }));
    }

    const fetchClassDetails = async () => {
      try {
        const { data } = await axios.get(`/api/classes/${id}`);
        setSelectedPkg(data);
        setLoading(false);
      } catch {
        navigate('/sessions');
      }
    };
    fetchClassDetails();
  }, [id, navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const dynamicPrice = getPrice(selectedPkg.type, selectedPkg.duration, selectedPkg.price);
    const bookingData = {
      attemptId: crypto.randomUUID(),
      package: { ...selectedPkg, dynamicPrice, baseINRAmount: selectedPkg.price },
      // Use the location-derived values directly rather than the mirrored form
      // state, so the submitted region can never lag behind detection.
      pricingContext: { country, countryCode, countryCategory, currency, symbol, exchangeRate, gstRate },
      customerDetails: { ...formData, country: country || formData.country, countryCategory },
    };
    localStorage.setItem('pendingBooking', JSON.stringify(bookingData));
    navigate('/payment');
  };

  if (loading || !selectedPkg) {
    return (
      <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', background: 'var(--clr-parchment)' }}>
        <div className="spinner" style={{ width: 36, height: 36 }} />
        <p style={{ fontSize: '0.875rem', color: 'var(--clr-warm-gray)' }}>Preparing your checkout…</p>
      </div>
    );
  }

  const basePrice = getPrice(selectedPkg.type, selectedPkg.duration, selectedPkg.price);
  // GST applies to every booking, international included. The rate comes from
  // the pricing context rather than a hardcoded multiplier, so a rate change
  // flows through automatically. Amounts are rounded to the currency's own
  // precision so the lines shown always sum to the total.
  const effectiveGstRate = gstRate || 0;
  const gstAmount = roundToCurrency(basePrice * (effectiveGstRate / 100), currency);
  const totalPrice = roundToCurrency(basePrice + gstAmount, currency);

  return (
    <div style={{ minHeight: '100svh', background: 'var(--clr-parchment)', paddingTop: 'var(--nav-h)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'var(--space-12) 24px var(--space-20)' }}>

        {/* ── Page Header ── */}
        <div style={{ marginBottom: '40px' }}>
          <div className="eyebrow" style={{ marginBottom: '12px' }}>
            <span style={{ color: 'var(--clr-forest-400)', marginRight: '8px' }}>—</span>
            Step 3 of 3
            <span style={{ color: 'var(--clr-forest-400)', marginLeft: '8px' }}>—</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 500, color: 'var(--clr-ink)', letterSpacing: '-0.02em' }}>
            Confirm Details
          </h1>
        </div>

        {/* ── Layout Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }} className="lg:grid-cols-[1fr_400px]">

          {/* ── Left column: Form ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
              }}
            >
              {/* Header & Category Switch */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '24px', borderBottom: '1px solid var(--clr-border)', marginBottom: '32px' }} className="sm:flex-row sm:items-center sm:justify-between">
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.625rem', fontWeight: 500, color: 'var(--clr-ink)' }}>
                  Client Profile
                </h2>

                {/* Region is derived from the detected location, not chosen by
                    hand: India is domestic, every other country is abroad. */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    alignSelf: 'flex-start',
                    padding: '8px 14px',
                    background: 'var(--clr-forest-50)',
                    border: '1px solid var(--clr-border)',
                    borderRadius: 'var(--r-full)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--clr-forest-700)',
                    whiteSpace: 'nowrap',
                  }}
                  title={`Detected from your location — billed as ${isDomestic ? 'domestic' : 'international'}`}
                >
                  <FiMapPin size={13} style={{ flexShrink: 0 }} />
                  {country || 'Detecting…'}
                  <span style={{ color: 'var(--clr-warm-gray)', fontWeight: 600 }}>
                    {isDomestic ? 'India' : 'Abroad'}
                  </span>
                </div>
              </div>

              {/* Form elements */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }} className="sm:grid-cols-2">
                  <FormField
                    label="Full Name *"
                    name="customerName"
                    type="text"
                    placeholder="Your complete name"
                    value={formData.customerName}
                    onChange={handleChange}
                    required
                  />
                  <FormField
                    label="Email Address *"
                    name="customerEmail"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.customerEmail}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }} className="sm:grid-cols-2">
                  <FormField
                    label="Phone Number *"
                    name="customerPhone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.customerPhone}
                    onChange={handleChange}
                    required
                  />
                  <FormField
                    label="WhatsApp Number *"
                    name="customerWhatsApp"
                    type="tel"
                    placeholder="With international code"
                    value={formData.customerWhatsApp}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div style={{ borderTop: '1px solid var(--clr-border)', paddingTop: '24px', display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }} className="sm:grid-cols-3">
                  <FormField
                    label="District / City *"
                    name="district"
                    type="text"
                    placeholder="City or district"
                    value={formData.district}
                    onChange={handleChange}
                    required
                  />
                  <FormField
                    label="State / Province *"
                    name="state"
                    type="text"
                    placeholder="State or region"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                  <FormField
                    label="Country *"
                    name="country"
                    type="text"
                    placeholder="Country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label className="field-label" style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--clr-forest-700)',
                  }}>
                    Notes / Intentions
                  </label>
                  <textarea
                    name="notes"
                    className="input-field"
                    placeholder="Provide any intentions or background you wish to share with your healer prior to the session…"
                    value={formData.notes}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      minHeight: 120,
                      padding: '14px 16px',
                      background: '#fff',
                      border: '1.5px solid var(--clr-border-strong)',
                      borderRadius: 'var(--r-md)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.9375rem',
                      color: 'var(--clr-ink)',
                      outline: 'none',
                      transition: 'all 200ms ease',
                      resize: 'vertical',
                      lineHeight: 1.7,
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', marginTop: '12px', fontSize: '1rem', borderRadius: 'var(--r-md)' }}
                >
                  Verify & Proceed to Payment
                </button>
              </form>
            </motion.div>
          </div>

          {/* ── Right column: Sticky Summary ── */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: '#fff',
                border: '1px solid var(--clr-border)',
                borderRadius: 'var(--r-xl)',
                overflow: 'hidden',
                position: 'sticky',
                top: 'calc(var(--nav-h) + 24px)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              {/* Header */}
              <div style={{ background: 'var(--clr-forest-900)', padding: '24px 28px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 500, color: '#fff' }}>
                  Booking Summary
                </h3>
              </div>

              {/* Body */}
              <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {[
                    {
                      label: 'Scheduling',
                      main: 'To be arranged after booking',
                    },
                    {
                      label: 'Session details',
                      main: `${selectedPkg.type === 'voice' ? '📞 Voice' : '📹 Video'} call`,
                      sub: `${selectedPkg.duration} Minutes duration`,
                    },
                    {
                      label: 'Pricing Region',
                      main: isDomestic ? '🇮🇳 India Zone' : '🌍 International Zone',
                      sub: country || undefined,
                    },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                      <div style={{
                        width: 38, height: 38,
                        borderRadius: 'var(--r-md)',
                        background: 'var(--clr-forest-50)',
                        border: '1px solid var(--clr-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.05rem',
                        flexShrink: 0,
                      }}>
                        {i === 0 ? '📅' : i === 1 ? '⏱' : '🌍'}
                      </div>
                      <div>
                        <p style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)', marginBottom: '3px' }}>
                          {item.label}
                        </p>
                        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--clr-ink)' }}>
                          {item.main}
                        </p>
                        {item.sub && (
                          <p style={{ fontSize: '0.75rem', color: 'var(--clr-forest-700)', fontWeight: 600, marginTop: '2px' }}>
                            {item.sub}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Breakdown */}
                <div style={{ borderTop: '1px solid var(--clr-border)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--clr-ink-muted)' }}>
                    <span>Honorarium</span>
                    <span style={{ fontWeight: 600 }}>{formatPrice(basePrice)}</span>
                  </div>
                  {effectiveGstRate > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--clr-ink-muted)' }}>
                      <span>GST ({effectiveGstRate}%)</span>
                      <span style={{ fontWeight: 600 }}>{formatPrice(gstAmount)}</span>
                    </div>
                  )}
                  <div style={{ borderTop: '1.5px solid var(--clr-border)', paddingTop: '16px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--clr-ink)' }}>Total Payable</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.875rem', fontWeight: 600, color: 'var(--clr-forest-700)' }}>
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.6875rem', color: 'var(--clr-warm-gray)', textAlign: 'center', lineHeight: 1.5, marginTop: '8px' }}>
                    Values converted from base INR rates. Support is available for custom invoicing.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Checkout;
