import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCopy, FaCheckCircle, FaCloudUploadAlt, FaCalendarAlt, FaClock } from 'react-icons/fa';
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

      const { data } = await axios.post('http://localhost:5000/api/bookings/create', payload, config);
      
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

        const { data: order } = await axios.post('http://localhost:5000/api/payment/create-order', { amount: totalAmount, currency: currency }, config);

        const options = {
          key: 'your_razorpay_key_id',
          amount: order.amount,
          currency: order.currency,
          name: 'Zeal Healing',
          description: bookingData.package.title,
          order_id: order.id,
          handler: async function (response) {
            try {
              await axios.post('http://localhost:5000/api/payment/verify', response, config);
              
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
                razorpayOrderId: order.id
              };

              const { data: bookingResult } = await axios.post('http://localhost:5000/api/bookings/create', payload, config);
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
          theme: { color: '#2E7D32' },
        };

        const rzp = new window.Razorpay(options);
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
    <div className="min-h-screen pt-24 pb-12 bg-sage-50 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column — Summary & Bank */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card border-transparent shadow-md bg-white">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-serif font-bold text-sage-900 mb-1">Finalize Payment</h2>
                <p className="text-sage-500 text-sm">Secure your healing session below.</p>
              </div>
              <div className="text-right">
                <span className="text-4xl font-bold text-darkGreen">{symbol}{totalAmount}</span>
                <p className="text-xs text-sage-400 mt-1 uppercase tracking-widest font-bold">Total Payable</p>
              </div>
            </div>

            <div className="bg-sage-50 rounded-2xl p-4 flex flex-wrap gap-6 items-center border border-sage-100">
               <div className="flex items-center gap-2">
                 <FaCalendarAlt className="text-darkGreen" />
                 <span className="text-sm font-semibold text-sage-700">{new Date(bookingData.appointment.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
               </div>
               <div className="flex items-center gap-2">
                 <FaClock className="text-darkGreen" />
                 <span className="text-sm font-semibold text-sage-700">{formatTime12h(bookingData.appointment.time)}</span>
               </div>
               <div className="flex items-center gap-2 ml-auto">
                 <span className="px-3 py-1 bg-darkGreen/10 text-darkGreen rounded-full text-[10px] font-bold uppercase">{bookingData.package.duration} Mins</span>
               </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card bg-[#e3ebe3] border-transparent shadow-none">
            <h3 className="text-xl font-serif font-bold text-sage-900 mb-4">Manual Bank Transfer</h3>
            <p className="text-sage-700 text-sm mb-6 leading-relaxed">Transfer the exact amount to the following account to confirm your session instantly.</p>
            
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-sage-600 tracking-widest mb-1 uppercase">Bank Name</p>
                <div className="flex justify-between items-center bg-white p-3.5 rounded-xl border border-sage-200">
                  <span className="text-sage-900 font-semibold">Global Wellness Trust - HDFC Bank</span>
                  <button onClick={() => handleCopy('Global Wellness Trust', 'bank')} className="text-sage-300 hover:text-darkGreen transition-colors">
                    {copiedField === 'bank' ? <FaCheckCircle className="text-darkGreen" /> : <FaCopy />}
                  </button>
                </div>
              </div>
              
              <div>
                <p className="text-[10px] font-bold text-sage-600 tracking-widest mb-1 uppercase">Account Number</p>
                <div className="flex justify-between items-center bg-white p-3.5 rounded-xl border border-sage-200">
                  <span className="text-sage-900 font-semibold">987 654 321 000</span>
                  <button onClick={() => handleCopy('987654321000', 'acc')} className="text-sage-300 hover:text-darkGreen transition-colors">
                    {copiedField === 'acc' ? <FaCheckCircle className="text-darkGreen" /> : <FaCopy />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-sage-600 tracking-widest mb-1 uppercase">IFSC Code</p>
                  <div className="flex justify-between items-center bg-white p-3.5 rounded-xl border border-sage-200">
                    <span className="text-sage-900 font-semibold">HDFC0001234</span>
                    <button onClick={() => handleCopy('HDFC0001234', 'ifsc')} className="text-sage-300 hover:text-darkGreen transition-colors">
                      {copiedField === 'ifsc' ? <FaCheckCircle className="text-darkGreen" /> : <FaCopy />}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-sage-600 tracking-widest mb-1 uppercase">UPI ID</p>
                  <div className="flex justify-between items-center bg-white p-3.5 rounded-xl border border-sage-200">
                    <span className="text-sage-900 font-semibold">zealhealing@upi</span>
                    <button onClick={() => handleCopy('zealhealing@upi', 'upi')} className="text-sage-300 hover:text-darkGreen transition-colors">
                      {copiedField === 'upi' ? <FaCheckCircle className="text-darkGreen" /> : <FaCopy />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column — Payment Proof */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card border-transparent bg-white shadow-sm p-8">
            <h3 className="text-xl font-serif font-bold text-sage-900 mb-2">Submit Payment Proof</h3>
            <p className="text-sage-500 text-sm mb-8">Verification usually takes 1-2 hours during business hours.</p>

            <div className="space-y-5">
              <div>
                <label className="block text-sage-700 font-bold mb-2 text-[11px] uppercase tracking-wider">Transaction ID / UTR Number *</label>
                <input 
                  type="text" 
                  className="input-field w-full bg-sage-50 border-sage-100" 
                  placeholder="Paste your transaction ID here"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sage-700 font-bold mb-2 text-[11px] uppercase tracking-wider">Upload Screenshot *</label>
                <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-sage-200 rounded-2xl cursor-pointer bg-sage-50 hover:bg-sage-100 transition-all overflow-hidden relative">
                  {screenshotPreview ? (
                    <img src={screenshotPreview} alt="Preview" className="w-full h-full object-contain p-2" />
                  ) : (
                    <div className="flex flex-col items-center px-4 text-center">
                      <FaCloudUploadAlt className="text-4xl text-sage-300 mb-3" />
                      <p className="text-sm font-bold text-sage-600">Click to upload screenshot</p>
                      <p className="text-xs text-sage-400 mt-2">JPG or PNG formats allowed</p>
                    </div>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={handleScreenshotChange} />
                </label>
              </div>

              <button 
                onClick={handleManualPaymentSubmit} 
                className={`btn-primary w-full py-5 text-xl font-serif font-bold shadow-xl shadow-darkGreen/10 transition-all ${submitting ? 'opacity-70' : ''}`}
                disabled={submitting}
              >
                {submitting ? 'Authenticating...' : "I've Made The Transfer"}
              </button>
              
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-sage-100"></div></div>
                <div className="relative flex justify-center"><span className="bg-white px-4 text-xs font-bold text-sage-300 uppercase tracking-widest">or pay instantly</span></div>
              </div>

              <button onClick={loadRazorpay} className="w-full py-4 rounded-2xl border-2 border-darkGreen text-darkGreen font-bold hover:bg-sage-50 transition-colors flex items-center justify-center gap-3">
                Pay with Card / Netbanking
              </button>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default Payment;
