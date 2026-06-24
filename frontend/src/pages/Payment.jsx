import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCopy, FaCheckCircle, FaCloudUploadAlt } from 'react-icons/fa';
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

  const packagePrice = bookingData.package.dynamicPrice || bookingData.package.price;
  const totalAmount = (packagePrice * 1.05).toFixed(2);
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
    // Validate required proof fields
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
        ...bookingData.customerDetails,
        paymentMethod: 'Manual Bank Transfer',
        paymentStatus: 'Pending',
        // Payment proof
        senderAccountNumber,
        transactionId,
        paymentScreenshot,
        paymentRemarks,
      };

      const { data } = await axios.post('http://localhost:5000/api/bookings/create', payload, config);
      
      localStorage.removeItem('pendingBooking');
      navigate(`/success/${data._id}`);
      
    } catch (error) {
      toast.error('Failed to submit booking. Please try again.');
      setSubmitting(false);
    }
  };

  const loadRazorpay = async () => {
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
        
        {/* Left Column — Bank Details */}
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

        {/* Right Column — Payment Proof Form + QR */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card border-transparent text-center py-8">
            <h3 className="text-xl font-serif font-bold text-sage-900 mb-2">Scan to Pay</h3>
            <p className="text-sage-700 text-sm mb-6">Works with any global banking app or digital wallet.</p>
            
            <div className="bg-sage-100 p-6 rounded-2xl mx-auto w-64 mb-8 border border-sage-200 shadow-inner flex items-center justify-center">
               <div className="bg-white p-4 rounded-xl shadow-md border-b-4 border-sage-300">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=zealhealing@upi&pn=ZealHealing" alt="QR Code" className="w-32 h-32" />
               </div>
            </div>
          </motion.div>

          {/* Payment Proof Form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card border-transparent">
            <h3 className="text-xl font-serif font-bold text-sage-900 mb-2">Submit Payment Proof</h3>
            <p className="text-sage-600 text-sm mb-6">After making the transfer, fill in the details below so we can verify your payment quickly.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sage-800 font-medium mb-1 text-sm">Your Account Number / Sender Name</label>
                <input 
                  type="text" 
                  className="input-field w-full"
                  placeholder="e.g. 1234567890 or John Doe"
                  value={senderAccountNumber}
                  onChange={(e) => setSenderAccountNumber(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sage-800 font-medium mb-1 text-sm">Transaction ID / UTR Number *</label>
                <input 
                  type="text" 
                  className="input-field w-full"
                  placeholder="e.g. UTR123456789"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sage-800 font-medium mb-1 text-sm">Payment Screenshot *</label>
                <div className="relative">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-sage-300 rounded-xl cursor-pointer bg-sage-50 hover:bg-sage-100 transition-colors">
                    {screenshotPreview ? (
                      <img src={screenshotPreview} alt="Preview" className="h-28 object-contain rounded-lg" />
                    ) : (
                      <div className="flex flex-col items-center">
                        <FaCloudUploadAlt className="text-3xl text-sage-400 mb-2" />
                        <p className="text-sm text-sage-500">Click to upload screenshot</p>
                        <p className="text-xs text-sage-400 mt-1">PNG, JPG up to 5MB</p>
                      </div>
                    )}
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleScreenshotChange}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sage-800 font-medium mb-1 text-sm">Additional Remarks (Optional)</label>
                <textarea 
                  className="input-field w-full"
                  rows="2"
                  placeholder="Any extra info about the payment..."
                  value={paymentRemarks}
                  onChange={(e) => setPaymentRemarks(e.target.value)}
                ></textarea>
              </div>
            </div>

            <button 
              onClick={handleManualPaymentSubmit} 
              className="btn-primary w-full py-4 text-lg mt-6"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : "I've Made the Transfer — Submit Proof"}
            </button>
            <button onClick={loadRazorpay} className="w-full py-4 text-lg rounded-full border border-darkGreen text-darkGreen font-medium hover:bg-sage-50 transition-colors mt-4">
              Pay with Credit Card
            </button>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default Payment;
