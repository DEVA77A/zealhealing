import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiLock } from 'react-icons/fi';
import { formatMoney } from '../utils/countryCurrency';

let checkoutScript;
const loadCheckout = () => {
  if (window.Razorpay) return Promise.resolve();
  if (!checkoutScript) {
    checkoutScript = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = resolve;
      script.onerror = () => {
        script.remove();
        checkoutScript = undefined;
        reject(new Error('Razorpay could not load. Please try again.'));
      };
      document.head.appendChild(script);
    });
  }
  return checkoutScript;
};

const paymentConfig = () => ({
  headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('userInfo'))?.token || ''}` },
});

const Payment = () => {
  const navigate = useNavigate();
  const [checkout] = useState(() => {
    try {
      const data = JSON.parse(localStorage.getItem('pendingBooking'));
      return data?.package?._id && data.customerDetails ? data : null;
    } catch {
      return null;
    }
  });
  const [attemptId] = useState(() => checkout?.attemptId || crypto.randomUUID());
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [receipt, setReceipt] = useState(() => {
    try { return JSON.parse(localStorage.getItem('razorpayReceipt:' + attemptId)); }
    catch { return null; }
  });

  useEffect(() => {
    if (!checkout) return;
    if (!checkout.attemptId) {
      localStorage.setItem('pendingBooking', JSON.stringify({ ...checkout, attemptId }));
    }
    const controller = new AbortController();
    axios.post('/api/payment/quote', {
      attemptId, sessionId: checkout.package._id, countryCode: checkout.pricingContext?.countryCode,
    }, { ...paymentConfig(), signal: controller.signal }).then(({ data }) => {
      if (data.paid) {
        localStorage.removeItem('pendingBooking');
        localStorage.removeItem('razorpayReceipt:' + attemptId);
        navigate(`/success/${data.bookingId}`, { replace: true });
      } else {
        setQuote(data);
      }
    }).catch(err => {
      if (!axios.isCancel(err)) setError(err.response?.data?.message || 'Could not load your GST bill.');
    });
    return () => controller.abort();
  }, [attemptId, checkout, navigate, refresh]);

  const finish = (data) => {
    localStorage.removeItem('pendingBooking');
    localStorage.removeItem('razorpayReceipt:' + attemptId);
    navigate(`/success/${data.bookingId}`, { replace: true });
  };

  const verify = async (confirmation) => {
    setPaying(true);
    setError('');
    try {
      const { data } = await axios.post('/api/payment/verify', confirmation, paymentConfig());
      finish(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment confirmation is pending. Check the status again before trying another payment.');
    } finally {
      setPaying(false);
    }
  };

  const payOnline = async () => {
    setPaying(true);
    setError('');
    try {
      const { data: order } = await axios.post('/api/payment/create-order', {
        attemptId,
        sessionId: checkout.package._id,
        countryCode: checkout.pricingContext?.countryCode,
        customerDetails: checkout.customerDetails,
        amount: quote.amount,
        currency: quote.currency,
      }, paymentConfig());
      if (order.paid) return finish(order);
      await loadCheckout();
      const instance = new window.Razorpay({
        key: order.key, order_id: order.order_id, amount: order.amount, currency: order.currency,
        name: 'Zeal Healing', description: quote.title,
        prefill: {
          name: checkout.customerDetails.customerName,
          email: checkout.customerDetails.customerEmail,
          contact: checkout.customerDetails.customerPhone,
        },
        theme: { color: '#208a74' },
        modal: { ondismiss: () => setPaying(false) },
        handler: (confirmation) => {
          localStorage.setItem('razorpayReceipt:' + attemptId, JSON.stringify(confirmation));
          setReceipt(confirmation);
          void verify(confirmation);
        },
      });
      instance.on('payment.failed', () => toast.error('Razorpay could not complete the payment. You can retry in checkout.'));
      instance.open();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      if (err.response?.status === 409) {
        setQuote(null);
        setRefresh(value => value + 1);
      }
      setPaying(false);
    }
  };

  if (!checkout) return <main className="mx-auto max-w-2xl px-6 pb-20" style={{ paddingTop: 'calc(var(--nav-h) + 48px)' }}>
    <h1>Choose a session to continue</h1>
    <Link to="/sessions">View sessions</Link>
  </main>;

  const money = (value) => formatMoney(value, { currency: quote.currency, symbol: quote.symbol });

  return (
    <main className="mx-auto max-w-3xl px-6 pb-20" style={{ paddingTop: 'calc(var(--nav-h) + 48px)' }}>
      <Link to={`/checkout/${checkout.package._id}`} className="text-sm font-semibold" style={{ color: 'var(--clr-forest-700)' }}>← Back to checkout</Link>
      <h1 className="mt-4 mb-6 text-4xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Payment</h1>
      <section className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8" style={{ borderColor: 'var(--clr-border)' }}>
        <h2 className="text-xl font-semibold">GST bill</h2>
        {quote && (
          <>
            <p className="mt-2 text-sm" style={{ color: 'var(--clr-ink-muted)' }}>
              {quote.title} · {quote.callType} · {quote.duration} minutes
            </p>
            <dl className="mt-6 space-y-3">
              <div className="flex justify-between gap-4"><dt>Session fee</dt><dd>{money(quote.subtotal)}</dd></div>
              <div className="flex justify-between gap-4"><dt>GST ({quote.gstRate}%)</dt><dd>{money(quote.gst)}</dd></div>
              <div className="flex justify-between gap-4 border-t pt-4 text-lg font-bold" style={{ borderColor: 'var(--clr-border)' }}>
                <dt>Total payable</dt><dd>{money(quote.amount / 10 ** quote.amountDecimals)}</dd>
              </div>
            </dl>
            <button
              type="button"
              className="btn-primary mt-6 flex w-full items-center justify-center gap-2 px-5 py-3"
              disabled={paying}
              onClick={() => receipt ? verify(receipt) : payOnline()}
            >
              <FiLock aria-hidden="true" /> {paying ? 'Please wait…' : receipt ? 'Check Payment Status' : 'Pay Online'}
            </button>
            <p className="mt-3 text-center text-sm" style={{ color: 'var(--clr-ink-muted)' }}>
              Secure checkout by Razorpay. We’ll confirm your appointment slot within 2–3 days.
            </p>
          </>
        )}
        {!quote && !error && <p className="mt-4" role="status">Loading your GST bill…</p>}
        {error && <p className="mt-4 text-sm text-red-700" role="alert">{error}</p>}
        {!quote && error && <button type="button" className="btn-primary mt-4 px-4 py-2" onClick={() => {
          setError('');
          setRefresh(value => value + 1);
        }}>Reload bill</button>}
      </section>
    </main>
  );
};

export default Payment;
