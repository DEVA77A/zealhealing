import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { packages } from '../data/packages';
import { usePricing } from '../context/PricingContext';

const Checkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { country, currency, symbol, getPrice, exchangeRate } = usePricing();
  const [selectedPkg, setSelectedPkg] = useState(null);

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    country: country || '',
    notes: ''
  });

  useEffect(() => {
    setFormData(prev => ({ ...prev, country: country || '' }));
  }, [country]);

  useEffect(() => {
    // If user is logged in, prefill some data
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo) {
      setFormData(prev => ({
        ...prev,
        customerName: userInfo.name || '',
        customerEmail: userInfo.email || '',
        customerPhone: userInfo.phone || '',
      }));
    }

    const pkg = packages.find(p => p.id === id);
    if (pkg) {
      setSelectedPkg(pkg);
    } else {
      navigate('/sessions'); // Redirect if invalid package
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save to local storage for the next payment step
    const dynamicPrice = getPrice(selectedPkg.type, selectedPkg.duration, selectedPkg.price);
    const bookingData = {
      package: {
        ...selectedPkg,
        dynamicPrice: dynamicPrice,
        baseINRAmount: selectedPkg.price
      },
      pricingContext: { country, currency, symbol, exchangeRate },
      customerDetails: formData
    };
    localStorage.setItem('pendingBooking', JSON.stringify(bookingData));
    navigate('/payment');
  };

  if (!selectedPkg) return null;

  return (
    <div className="min-h-screen pt-24 pb-12 bg-sage-50 px-4">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* Left: Form */}
        <div className="w-full md:w-2/3">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <h2 className="text-2xl font-serif font-bold text-sage-900 mb-6">Customer Details</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sage-800 font-medium mb-1">Full Name *</label>
                  <input type="text" name="customerName" required className="input-field" value={formData.customerName} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-sage-800 font-medium mb-1">Email Address *</label>
                  <input type="email" name="customerEmail" required className="input-field" value={formData.customerEmail} onChange={handleChange} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sage-800 font-medium mb-1">Phone Number *</label>
                  <input type="tel" name="customerPhone" required className="input-field" value={formData.customerPhone} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-sage-800 font-medium mb-1">Country *</label>
                  <input type="text" name="country" required className="input-field" value={formData.country} onChange={handleChange} />
                </div>
              </div>

              <div>
                <label className="block text-sage-800 font-medium mb-1">Notes (Optional)</label>
                <textarea name="notes" rows="4" className="input-field" value={formData.notes} onChange={handleChange}></textarea>
              </div>

              <button type="submit" className="btn-primary w-full py-4 text-lg mt-4">
                Proceed to Payment
              </button>
            </form>
          </motion.div>
        </div>

        {/* Right: Summary Sidebar */}
        <div className="w-full md:w-1/3">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card bg-white border-sage-200"
          >
            <h3 className="text-xl font-serif font-bold text-sage-900 mb-4">Booking Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between border-b border-sage-100 pb-4">
                <div>
                  <p className="font-semibold text-sage-900">{selectedPkg.title}</p>
                  <p className="text-sm text-sage-500 capitalize">{selectedPkg.type} Call - {selectedPkg.duration} Mins</p>
                </div>
              </div>
              
              {(() => {
                const price = getPrice(selectedPkg.type, selectedPkg.duration, selectedPkg.price);
                const gst = price * 0.05;
                const total = price + gst;
                return (
                  <>
                    <div className="flex justify-between text-sage-700">
                      <span>Subtotal</span>
                      <span>{symbol}{price}</span>
                    </div>
                    <div className="flex justify-between text-sage-700">
                      <span>GST (5%)</span>
                      <span>{symbol}{gst.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between font-bold text-darkGreen text-xl pt-4 border-t border-sage-200">
                      <span>Total</span>
                      <span>{symbol}{total.toFixed(2)}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
