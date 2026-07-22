import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';

const Payment = () => {
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Payment proof fields
  const [senderAccountNumber, setSenderAccountNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [paymentRemarks, setPaymentRemarks] = useState('');
  const [screenshotPreview, setScreenshotPreview] = useState(null);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('pendingBooking'));
    if (!data) {
      navigate('/sessions');
    } else {
      setBookingData(data);
    }
  }, [navigate]);

  if (!bookingData) return null;

  const isIndia = bookingData.customerDetails.countryCategory === 'india';
  const packagePrice = bookingData.package.dynamicPrice || bookingData.package.price;
  const gstRate = isIndia ? 0.18 : 0;
  const gstAmount = packagePrice * gstRate;
  const totalAmount = (packagePrice + gstAmount).toFixed(2);
  const symbol = bookingData.pricingContext?.symbol || '₹';
  const currency = bookingData.pricingContext?.currency || 'INR';

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Screenshot must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentScreenshot(reader.result); // base64
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManualPaymentSubmit = async () => {
    if (!transactionId.trim()) {
      toast.error('Please enter the Transaction ID / UTR Number');
      return;
    }
    if (!paymentScreenshot) {
      toast.error('Please upload a screenshot of your payment');
      return;
    }

    setSubmitting(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const token = userInfo ? userInfo.token : '';
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const payload = {
        appointmentType: bookingData.package.title,
        callType: bookingData.package.type === 'voice' ? 'Voice Call' : 'Video Call',
        duration: bookingData.package.duration,
        price: bookingData.package.baseINRAmount || bookingData.package.price,
        convertedAmount: bookingData.package.dynamicPrice,
        currency: bookingData.pricingContext?.currency,
        currencySymbol: bookingData.pricingContext?.symbol,
        exchangeRate: bookingData.pricingContext?.exchangeRate,
        appointmentDate: bookingData.appointment.date,
        appointmentTime: bookingData.appointment.time,
        ...bookingData.customerDetails,
        paymentMethod: 'Manual Bank Transfer',
        paymentStatus: 'Pending',
        senderAccountNumber,
        transactionId,
        paymentScreenshot,
        paymentRemarks,
      };

      const { data } = await axios.post('/api/bookings/create', payload, config);
      localStorage.removeItem('pendingBooking');
      localStorage.removeItem('tempAppointment');
      navigate(`/success/${data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit booking. Please try again.');
      setSubmitting(false);
    }
  };

  const loadRazorpay = async () => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const token = userInfo ? userInfo.token : '';
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const amountInPaise = Math.round(parseFloat(totalAmount) * 100);

        const { data: order } = await axios.post('/api/payment/create-order', { amount: amountInPaise, currency: currency }, config);

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: 'Zeal Healing',
          description: bookingData.package.title,
          order_id: order.order_id,
          handler: async function (response) {
            try {
              await axios.post('/api/payment/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }, config);

              const payload = {
                appointmentType: bookingData.package.title,
                callType: bookingData.package.type === 'voice' ? 'Voice Call' : 'Video Call',
                duration: bookingData.package.duration,
                price: bookingData.package.baseINRAmount || bookingData.package.price,
                convertedAmount: bookingData.package.dynamicPrice,
                currency: bookingData.pricingContext?.currency,
                currencySymbol: bookingData.pricingContext?.symbol,
                exchangeRate: bookingData.pricingContext?.exchangeRate,
                appointmentDate: bookingData.appointment.date,
                appointmentTime: bookingData.appointment.time,
                ...bookingData.customerDetails,
                paymentMethod: 'Razorpay',
                paymentStatus: 'Completed',
                razorpayOrderId: order.order_id,
              };

              const { data: bookingResult } = await axios.post('/api/bookings/create', payload, config);
              localStorage.removeItem('pendingBooking');
              localStorage.removeItem('tempAppointment');
              navigate(`/success/${bookingResult._id}`);
            } catch (err) {
              toast.error('Payment Verification Failed');
            }
          },
          prefill: {
            name: bookingData.customerDetails.customerName,
            email: bookingData.customerDetails.customerEmail,
            contact: bookingData.customerDetails.customerPhone,
          },
          theme: { color: '#254a29' },
          modal: {
            ondismiss: function() {
              toast.info('Payment cancelled by user');
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response){
          toast.error(response.error.description || 'Payment Failed');
        });
        rzp.open();
      } catch (err) {
        toast.error('Could not create Razorpay order');
      }
    };
    document.body.appendChild(script);
  };

  const formatTime12h = (time24) => {
    const [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  return (
    <div style={{ minHeight: '100svh', background: 'var(--clr-parchment)', paddingTop: 'var(--nav-h)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'var(--space-12) 24px var(--space-20)' }}>

        {/* ── Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }} className="lg:grid-cols-2">

          {/* ── Left side: Summary & Account ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: '#fff',
                border: '1px solid var(--clr-border)',
                borderRadius: 'var(--r-xl)',
                padding: '40px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', gap: '20px' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.875rem', fontWeight: 500, color: 'var(--clr-ink)', marginBottom: '8px' }}>
                    Honorarium
                  </h2>
                  <p style={{ fontSize: '0.9375rem', color: 'var(--clr-warm-gray)' }}>Secure your healing consultation.</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 600, color: 'var(--clr-forest-700)', lineHeight: 1 }}>
                    {symbol}{Number(totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <p style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--clr-warm-gray)', marginTop: '6px' }}>
                    Total Payable
                  </p>
                </div>
              </div>

              {/* Badges bar */}
              <div style={{
                background: 'var(--clr-forest-50)',
                borderRadius: 'var(--r-lg)',
                padding: '16px 20px',
                border: '1px solid var(--clr-border)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '24px',
                alignItems: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--clr-ink)', fontWeight: 600 }}>
                  <span style={{ fontSize: '1.1rem' }}>📅</span>
                  <span>{new Date(bookingData.appointment.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--clr-ink)', fontWeight: 600 }}>
                  <span style={{ fontSize: '1.1rem' }}>⏱</span>
                  <span>{formatTime12h(bookingData.appointment.time)}</span>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <span style={{
                    padding: '5px 12px',
                    background: 'rgba(37,74,41,0.08)',
                    borderRadius: '99px',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: 'var(--clr-forest-700)',
                    letterSpacing: '0.06em',
                  }}>
                    {bookingData.package.duration} MINS
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Bank details panel (luxury dark) */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: 'var(--clr-forest-900)',
                color: '#fff',
                borderRadius: 'var(--r-xl)',
                padding: '40px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at top right, rgba(74,175,80,0.10), transparent)', pointerEvents: 'none' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 500, color: '#fff', marginBottom: '8px' }}>
                  Manual Bank Transfer
                </h3>
                <p style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.6)', marginBottom: '32px', lineHeight: 1.6 }}>
                  Directly transfer the honorarium to the details below to schedule your reading.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {[
                    { label: 'Bank Name', val: 'Global Wellness Trust - HDFC Bank', key: 'bank' },
                    { label: 'Account Number', val: '987654321000', labelVal: '987 654 321 000', key: 'acc' },
                  ].map((field) => (
                    <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
                        {field.label}
                      </span>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'rgba(255,255,255,0.06)',
                        padding: '14px 18px',
                        borderRadius: 'var(--r-md)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}>
                        <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#fff' }}>{field.labelVal || field.val}</span>
                        <button
                          onClick={() => handleCopy(field.val, field.key)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', transition: 'color 155ms ease', padding: '4px' }}
                          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                        >
                          {copiedField === field.key ? '✓' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  ))}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {[
                      { label: 'IFSC Code', val: 'HDFC0001234', key: 'ifsc' },
                      { label: 'UPI ID', val: 'zealhealing@upi', key: 'upi' },
                    ].map((field) => (
                      <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
                          {field.label}
                        </span>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: 'rgba(255,255,255,0.06)',
                          padding: '14px 18px',
                          borderRadius: 'var(--r-md)',
                          border: '1px solid rgba(255,255,255,0.1)',
                        }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff' }}>{field.val}</span>
                          <button
                            onClick={() => handleCopy(field.val, field.key)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', transition: 'color 155ms ease', padding: '4px' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                          >
                            {copiedField === field.key ? '✓' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Right side: Submit Proof & Instant Checkout ── */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: '#fff',
                border: '1px solid var(--clr-border)',
                borderRadius: 'var(--r-xl)',
                padding: '40px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.625rem', fontWeight: 500, color: 'var(--clr-ink)', marginBottom: '8px' }}>
                Verify Direct Transfer
              </h3>
              <p style={{ fontSize: '0.9375rem', color: 'var(--clr-warm-gray)', marginBottom: '32px', lineHeight: 1.6 }}>
                Submit your transaction details. Healers match and confirm manual bookings within 1-2 hours.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Inputs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label className="field-label" style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--clr-forest-700)',
                  }}>
                    Transaction ID / UTR Code *
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter reference code"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    required
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
                    }}
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
                    Sender Account Number / UPI handle (Optional)
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="E.g. HDFC ending in 4321"
                    value={senderAccountNumber}
                    onChange={(e) => setSenderAccountNumber(e.target.value)}
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
                    }}
                  />
                </div>

                {/* File Upload Screen */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label className="field-label" style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--clr-forest-700)',
                  }}>
                    Upload Screenshot Proof *
                  </label>
                  <label style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: 180,
                    border: '2px dashed var(--clr-border-strong)',
                    borderRadius: 'var(--r-xl)',
                    cursor: 'pointer',
                    background: 'var(--clr-forest-50)',
                    transition: 'all 200ms ease',
                    overflow: 'hidden',
                    position: 'relative',
                  }}>
                    {screenshotPreview ? (
                      <img src={screenshotPreview} alt="Receipt preview" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '12px' }} />
                    ) : (
                      <div style={{ textAlign: 'center', padding: '20px' }}>
                        <span style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}>📤</span>
                        <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--clr-forest-800)' }}>Select Transfer Screenshot</p>
                        <p style={{ fontSize: '0.6875rem', color: 'var(--clr-warm-gray)', marginTop: '4px' }}>PNG or JPG formats up to 5MB</p>
                      </div>
                    )}
                    <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleScreenshotChange} />
                  </label>
                </div>

                <div style={{ marginTop: '8px' }}>
                  <button
                    onClick={handleManualPaymentSubmit}
                    className="btn-primary"
                    style={{ width: '100%', borderRadius: 'var(--r-md)' }}
                    disabled={submitting}
                  >
                    {submitting ? 'Verifying details…' : 'Verify & Complete Booking'}
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0' }}>
                  <div style={{ flexGrow: 1, borderTop: '1px solid var(--clr-border)' }} />
                  <span style={{ padding: '0 16px', fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--clr-warm-gray)', textTransform: 'uppercase' }}>
                    or checkout instantly
                  </span>
                  <div style={{ flexGrow: 1, borderTop: '1px solid var(--clr-border)' }} />
                </div>

                <button
                  onClick={loadRazorpay}
                  style={{
                    width: '100%',
                    height: 48,
                    background: '#fff',
                    color: 'var(--clr-forest-700)',
                    border: '1.5px solid var(--clr-border-strong)',
                    borderRadius: 'var(--r-md)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 200ms ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--clr-forest-700)';
                    e.currentTarget.style.background = 'var(--clr-forest-50)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--clr-border-strong)';
                    e.currentTarget.style.background = '#fff';
                  }}
                >
                  🔒 Pay Online (Cards, UPI, Netbanking)
                </button>
              </div>
            </motion.div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Payment;
