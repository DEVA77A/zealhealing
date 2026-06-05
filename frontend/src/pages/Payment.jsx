import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCopy, FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const Payment = () => {
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('pendingBooking'));
    if (!data) {
      navigate('/sessions');
    } else {
      setBookingData(data);
    }
  }, [navigate]);

  if (!bookingData) return null;

  const packagePrice = bookingData.package.dynamicPrice || bookingData.package.price;
  const totalAmount = (packagePrice * 1.05).toFixed(2);
  const symbol = bookingData.pricingContext?.symbol || '₹';
  const currency = bookingData.pricingContext?.currency || 'INR';

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleManualPaymentSubmit = async () => {
    // Usually we would submit this to backend to mark as pending manual verification
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
        ...bookingData.customerDetails,
        paymentMethod: 'Manual Bank Transfer',
        paymentStatus: 'Pending',
      };

      // Create booking
      const { data } = await axios.post('http://localhost:5000/api/bookings/create', payload, config);
      
      // Clear pending and navigate to success
      localStorage.removeItem('pendingBooking');
      navigate(`/success/${data._id}`);
      
    } catch (error) {
      toast.error('Failed to submit booking. Please try again.');
    }
  };

  const loadRazorpay = async () => {
    // Dynamically load razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onerror = () => {
      toast.error('Razorpay SDK failed to load. Are you online?');
    };
    script.onload = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const token = userInfo ? userInfo.token : '';
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 1. Create order on backend
        const { data: order } = await axios.post('http://localhost:5000/api/payment/create-order', { amount: totalAmount, currency: currency }, config);

        // 2. Open Razorpay checkout
        const options = {
          key: 'your_razorpay_key_id', // Needs to be loaded from env or backend config ideally, using placeholder to avoid error
          amount: order.amount,
          currency: order.currency,
          name: 'Zeal Healing',
          description: bookingData.package.title,
          order_id: order.id,
          handler: async function (response) {
            // 3. Verify payment
            try {
              await axios.post('http://localhost:5000/api/payment/verify', response, config);
              
              // 4. Create booking as completed
              const payload = {
                appointmentType: bookingData.package.title,
                callType: bookingData.package.type === 'voice' ? 'Voice Call' : 'Video Call',
                duration: bookingData.package.duration,
                price: bookingData.package.baseINRAmount || bookingData.package.price,
                convertedAmount: bookingData.package.dynamicPrice,
                currency: bookingData.pricingContext?.currency,
                currencySymbol: bookingData.pricingContext?.symbol,
                exchangeRate: bookingData.pricingContext?.exchangeRate,
                ...bookingData.customerDetails,
                paymentMethod: 'Razorpay',
                paymentStatus: 'Completed',
                razorpayOrderId: order.id
              };

              const { data: bookingResult } = await axios.post('http://localhost:5000/api/bookings/create', payload, config);
              localStorage.removeItem('pendingBooking');
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
          theme: {
            color: '#2E7D32',
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err) {
        toast.error('Could not create Razorpay order');
      }
    };
    document.body.appendChild(script);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-sage-50 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card border-transparent">
            <h2 className="text-3xl font-serif font-bold text-sage-900 mb-2">Finalize your healing</h2>
            <p className="text-sage-700 mb-6">Your session is reserved for the next 15 minutes.</p>
            <div className="flex items-end gap-3">
              <span className="text-5xl font-bold text-darkGreen">{symbol}{totalAmount}</span>
              <span className="text-sage-600 mb-1">Total Amount Due</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card bg-[#e3ebe3] border-transparent shadow-none">
            <h3 className="text-xl font-serif font-bold text-sage-900 mb-4">Manual Bank Transfer</h3>
            <p className="text-sage-700 text-sm mb-6">Transfer exact amount to the following account details to confirm your session instantly.</p>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-sage-600 tracking-wider mb-1">BANK NAME</p>
                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-sage-200">
                  <span className="text-sage-900 font-medium">Global Wellness Trust</span>
                  <button onClick={() => handleCopy('Global Wellness Trust', 'bank')} className="text-sage-400 hover:text-darkGreen transition-colors">
                    {copiedField === 'bank' ? <FaCheckCircle className="text-darkGreen" /> : <FaCopy />}
                  </button>
                </div>
              </div>
              
              <div>
                <p className="text-xs font-semibold text-sage-600 tracking-wider mb-1">ACCOUNT NUMBER</p>
                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-sage-200">
                  <span className="text-sage-900 font-medium">987 654 321 000</span>
                  <button onClick={() => handleCopy('987654321000', 'acc')} className="text-sage-400 hover:text-darkGreen transition-colors">
                    {copiedField === 'acc' ? <FaCheckCircle className="text-darkGreen" /> : <FaCopy />}
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-sage-600 tracking-wider mb-1">SWIFT/BIC CODE</p>
                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-sage-200">
                  <span className="text-sage-900 font-medium">ZEALWELLXX</span>
                  <button onClick={() => handleCopy('ZEALWELLXX', 'swift')} className="text-sage-400 hover:text-darkGreen transition-colors">
                    {copiedField === 'swift' ? <FaCheckCircle className="text-darkGreen" /> : <FaCopy />}
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-4 text-xs text-sage-600">
              <span className="flex items-center gap-1"><FaCheckCircle/> SSL Secure Payment</span>
              <span className="flex items-center gap-1"><FaCheckCircle/> 256-bit Encryption</span>
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card border-transparent text-center py-10">
            <h3 className="text-xl font-serif font-bold text-sage-900 mb-2">Scan to Pay</h3>
            <p className="text-sage-700 text-sm mb-8">Works with any global banking app or digital wallet.</p>
            
            <div className="bg-sage-100 p-6 rounded-2xl mx-auto w-64 mb-10 border border-sage-200 shadow-inner flex items-center justify-center">
               {/* Simulating the sleek QR stand from the image */}
               <div className="bg-white p-4 rounded-xl shadow-md border-b-4 border-sage-300">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=zealhealing@upi&pn=ZealHealing" alt="QR Code" className="w-32 h-32" />
               </div>
            </div>

            <button onClick={handleManualPaymentSubmit} className="btn-primary w-full py-4 text-lg mb-4">
              I've Made the Transfer
            </button>
            <button onClick={loadRazorpay} className="w-full py-4 text-lg rounded-full border border-darkGreen text-darkGreen font-medium hover:bg-sage-50 transition-colors">
              Pay with Credit Card
            </button>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default Payment;
