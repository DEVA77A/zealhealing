import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { usePricing } from '../context/PricingContext';
import { FaCalendarCheck, FaGlobe, FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa';

const Checkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { country, countryCategory, currency, symbol, getPrice, exchangeRate, gstRate, changeCountry } = usePricing();
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appointmentInfo, setAppointmentInfo] = useState(null);

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerWhatsApp: '',
    district: '',
    state: '',
    country: country || '',
    countryCategory: countryCategory || 'india',
    notes: ''
  });

  useEffect(() => {
    // Load appointment info from previous step
    const savedInfo = localStorage.getItem('tempAppointment');
    if (!savedInfo) {
      navigate(`/book/${id}`);
      return;
    }
    setAppointmentInfo(JSON.parse(savedInfo));

    setFormData(prev => ({ ...prev, country: country || '', countryCategory: countryCategory || 'india' }));
  }, [country, countryCategory, id, navigate]);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo) {
      setFormData(prev => ({
        ...prev,
        customerName: userInfo.name || '',
        customerEmail: userInfo.email || '',
        customerPhone: userInfo.phone || '',
        customerWhatsApp: userInfo.phone || '', // Default WhatsApp to phone
      }));
    }

    const fetchClassDetails = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/classes/${id}`);
        setSelectedPkg(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching class:', error);
        navigate('/sessions');
      }
    };
    fetchClassDetails();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCategoryToggle = (category) => {
    // If user manually switches category, we might need to update pricing context
    const isIndia = category === 'india';
    if (isIndia) {
      changeCountry('India', 'INR', '₹');
    } else {
      // Default abroad to USD if manual switch
      changeCountry('United States', 'USD', '$');
    }
    setFormData(prev => ({ ...prev, countryCategory: category }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dynamicPrice = getPrice(selectedPkg.type, selectedPkg.duration, selectedPkg.price);
    
    const bookingData = {
      package: {
        ...selectedPkg,
        dynamicPrice: dynamicPrice,
        baseINRAmount: selectedPkg.price
      },
      pricingContext: { country, countryCategory: formData.countryCategory, currency, symbol, exchangeRate, gstRate },
      customerDetails: formData,
      appointment: appointmentInfo
    };
    localStorage.setItem('pendingBooking', JSON.stringify(bookingData));
    navigate('/payment');
  };

  if (loading || !selectedPkg || !appointmentInfo) return <div className="min-h-screen pt-24 pb-12 flex justify-center items-center font-serif text-sage-600">Preparing your checkout...</div>;

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatTime12h = (time24) => {
    const [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-sage-50 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left: Enhanced Form */}
          <div className="w-full lg:w-2/3">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card border-transparent shadow-sm">
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-sage-100">
                <h2 className="text-2xl font-serif font-bold text-sage-900">Mandatory Client Information</h2>
                <div className="flex bg-sage-100 p-1 rounded-lg">
                  <button 
                    onClick={() => handleCategoryToggle('india')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${formData.countryCategory === 'india' ? 'bg-white text-darkGreen shadow-sm' : 'text-sage-500'}`}
                  >
                    India
                  </button>
                  <button 
                    onClick={() => handleCategoryToggle('abroad')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${formData.countryCategory === 'abroad' ? 'bg-white text-darkGreen shadow-sm' : 'text-sage-500'}`}
                  >
                    Abroad
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sage-800 font-semibold mb-2 text-sm uppercase tracking-wide">Full Name *</label>
                    <input type="text" name="customerName" required className="input-field bg-white" placeholder="Enter your full name" value={formData.customerName} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block text-sage-800 font-semibold mb-2 text-sm uppercase tracking-wide">Email Address *</label>
                    <input type="email" name="customerEmail" required className="input-field bg-white" placeholder="email@example.com" value={formData.customerEmail} onChange={handleChange} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sage-800 font-semibold mb-2 text-sm uppercase tracking-wide">Phone Number *</label>
                    <input type="tel" name="customerPhone" required className="input-field bg-white" placeholder="+91 1234567890" value={formData.customerPhone} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block text-sage-800 font-semibold mb-2 text-sm uppercase tracking-wide flex items-center gap-2">
                       WhatsApp Number * <FaWhatsapp className="text-green-500" />
                    </label>
                    <input type="tel" name="customerWhatsApp" required className="input-field bg-white" placeholder="International format preferred" value={formData.customerWhatsApp} onChange={handleChange} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-sage-100">
                  <div>
                    <label className="block text-sage-800 font-semibold mb-2 text-sm uppercase tracking-wide">District *</label>
                    <input type="text" name="district" required className="input-field bg-white" placeholder="District/City" value={formData.district} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block text-sage-800 font-semibold mb-2 text-sm uppercase tracking-wide">State *</label>
                    <input type="text" name="state" required className="input-field bg-white" placeholder="State/Province" value={formData.state} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block text-sage-800 font-semibold mb-2 text-sm uppercase tracking-wide">Country *</label>
                    <input type="text" name="country" required className="input-field bg-white" value={formData.country} onChange={handleChange} />
                  </div>
                </div>

                <div className="pt-4">
                  <label className="block text-sage-800 font-semibold mb-2 text-sm uppercase tracking-wide">Notes or Special Requirements (Optional)</label>
                  <textarea name="notes" rows="3" className="input-field bg-white" placeholder="Anything our healers should know before the session..." value={formData.notes} onChange={handleChange}></textarea>
                </div>

                <button type="submit" className="btn-primary w-full py-5 text-xl font-serif font-bold mt-4 shadow-xl shadow-darkGreen/20">
                  Verify & Proceed to Payment
                </button>
              </form>
            </motion.div>
          </div>

          {/* Right: Premium Summary Sidebar */}
          <div className="w-full lg:w-1/3">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card border-transparent shadow-lg bg-white overflow-hidden p-0">
              <div className="bg-darkGreen p-6 text-white">
                <h3 className="text-xl font-serif font-bold">Booking Details</h3>
              </div>
              <div className="p-6 space-y-6">
                {/* Appointment Detail Grid */}
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-sage-50 rounded-xl flex items-center justify-center text-darkGreen shrink-0">
                       <FaCalendarCheck size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-sage-400 uppercase tracking-widest">Date & Time</p>
                      <p className="text-sage-800 font-semibold text-sm">{formatDate(appointmentInfo.date)}</p>
                      <p className="text-darkGreen font-bold">{formatTime12h(appointmentInfo.time)}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-sage-50 rounded-xl flex items-center justify-center text-darkGreen shrink-0">
                       <FaGlobe size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-sage-400 uppercase tracking-widest">Session Type</p>
                      <p className="text-sage-800 font-semibold text-sm capitalize">{selectedPkg.type} Call Session</p>
                      <p className="text-sage-500 text-xs font-medium">{selectedPkg.duration} Minutes Duration</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-sage-50 rounded-xl flex items-center justify-center text-darkGreen shrink-0">
                       <FaMapMarkerAlt size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-sage-400 uppercase tracking-widest">Pricing Zone</p>
                      <p className="text-sage-800 font-semibold text-sm capitalize">{formData.countryCategory} Configuration</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-sage-100 pt-6 space-y-3">
                  <div className="flex justify-between text-sage-600 text-sm">
                    <span>Base Fee</span>
                    <span>{symbol}{getPrice(selectedPkg.type, selectedPkg.duration, selectedPkg.price)}</span>
                  </div>
                  
                  {formData.countryCategory === 'india' && (
                    <div className="flex justify-between text-sage-600 text-sm">
                      <span>GST (18%)</span>
                      <span>{symbol}{(getPrice(selectedPkg.type, selectedPkg.duration, selectedPkg.price) * 0.18).toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between font-bold text-darkGreen text-2xl pt-4 border-t border-sage-200">
                    <span>Total</span>
                    <span>
                      {symbol}
                      {(formData.countryCategory === 'india' 
                        ? (getPrice(selectedPkg.type, selectedPkg.duration, selectedPkg.price) * 1.18)
                        : getPrice(selectedPkg.type, selectedPkg.duration, selectedPkg.price)
                      ).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-[10px] text-center text-sage-400 italic pt-2">Values converted from INR base prices according to live exchange rates.</p>
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
