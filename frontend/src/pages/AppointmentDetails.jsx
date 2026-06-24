import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaClock, FaCheckCircle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { usePricing } from '../context/PricingContext';
import { toast } from 'react-toastify';

const AppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { symbol, getPrice } = usePricing();
  
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [relatedPkgs, setRelatedPkgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingSlots, setFetchingSlots] = useState(false);

  // Scheduling State
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchClassDetails = async () => {
      try {
        const { data: allPackages } = await axios.get('http://localhost:5000/api/classes');
        const pkg = allPackages.find(p => p._id === id);
        if (pkg) {
          setSelectedPkg(pkg);
          setRelatedPkgs(allPackages.filter(p => p.type === pkg.type && p.status === 'Active'));
        } else {
          navigate('/sessions');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching class details:', error);
        setLoading(false);
      }
    };
    fetchClassDetails();
  }, [id, navigate]);

  useEffect(() => {
    if (selectedDate && selectedPkg) {
      fetchSlots(selectedDate);
    }
  }, [selectedDate, selectedPkg]);

  const fetchSlots = async (date) => {
    setFetchingSlots(true);
    setSelectedTime(null);
    try {
      const dateStr = date.toISOString().split('T')[0];
      const { data } = await axios.get(`http://localhost:5000/api/bookings/slots?date=${dateStr}&duration=${selectedPkg.duration}`);
      setAvailableSlots(data.slots);
    } catch (error) {
      toast.error('Failed to fetch available slots');
    } finally {
      setFetchingSlots(false);
    }
  };

  if (loading || !selectedPkg) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const handleDurationSelect = (pkgId) => {
    navigate(`/book/${pkgId}`);
  };

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) {
      toast.info('Please select a preferred date and time slot first.');
      return;
    }
    
    // Pass booking details to checkout
    const appointmentInfo = {
      date: selectedDate.toISOString(),
      time: selectedTime,
    };
    localStorage.setItem('tempAppointment', JSON.stringify(appointmentInfo));
    
    navigate(`/checkout/${selectedPkg._id}`);
  };

  // Calendar Helpers
  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const generateDays = () => {
    const days = [];
    const month = currentMonth.getMonth();
    const year = currentMonth.getFullYear();
    const totalDays = daysInMonth(month, year);
    const startDay = firstDayOfMonth(month, year);

    // Empty spaces for previous month
    for (let i = 0; i < startDay; i++) days.push(null);
    // Real days
    for (let i = 1; i <= totalDays; i++) days.push(new Date(year, month, i));
    
    return days;
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date) => {
    if (!date || !selectedDate) return false;
    return date.getDate() === selectedDate.getDate() && date.getMonth() === selectedDate.getMonth() && date.getFullYear() === selectedDate.getFullYear();
  };

  const isPast = (date) => {
    if (!date) return true;
    const today = new Date();
    today.setHours(0,0,0,0);
    return date < today;
  };

  const formatMonth = (date) => date.toLocaleString('default', { month: 'long', year: 'numeric' });

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));

  const formatTime12h = (time24) => {
    const [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-sage-50 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden flex flex-col lg:flex-row min-h-[600px]">
          
          {/* Left Side: Image & Info */}
          <div className="w-full lg:w-1/3 bg-sage-200 relative overflow-hidden">
            <img src={selectedPkg.image || "/tarot.png"} alt={selectedPkg.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
              <span className="text-white/80 text-sm font-bold uppercase tracking-widest mb-2">Category: {selectedPkg.type === 'voice' ? 'Voice Call' : 'Video Call'}</span>
              <h2 className="text-3xl font-serif font-bold text-white mb-2">{selectedPkg.title}</h2>
              <p className="text-white/90 text-sm leading-relaxed line-clamp-3">{selectedPkg.description}</p>
            </div>
          </div>

          {/* Right Side: Configuration */}
          <div className="w-full lg:w-2/3 p-6 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              
              {/* Step 1: Duration & Date */}
              <div className="space-y-8">
                <div>
                  <h4 className="text-sage-900 font-bold mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-darkGreen text-white rounded-full flex items-center justify-center text-xs">1</span>
                    Select Duration
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {relatedPkgs.map(pkg => (
                      <button
                        key={pkg._id}
                        onClick={() => handleDurationSelect(pkg._id)}
                        className={`py-3 px-4 rounded-xl border-2 transition-all text-sm font-medium ${
                          selectedPkg._id === pkg._id
                            ? 'border-darkGreen bg-sage-50 text-darkGreen shadow-sm shadow-darkGreen/10'
                            : 'border-sage-100 text-sage-600 hover:border-sage-300'
                        }`}
                      >
                        {pkg.duration} Mins
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sage-900 font-bold mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-darkGreen text-white rounded-full flex items-center justify-center text-xs">2</span>
                    Preferred Date
                  </h4>
                  <div className="bg-white border border-sage-100 rounded-2xl p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-4 px-2">
                      <button onClick={prevMonth} className="p-2 hover:bg-sage-50 rounded-full text-sage-400"><FaChevronLeft/></button>
                      <h5 className="font-semibold text-sage-900">{formatMonth(currentMonth)}</h5>
                      <button onClick={nextMonth} className="p-2 hover:bg-sage-50 rounded-full text-sage-400"><FaChevronRight/></button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-sage-400 mb-2">
                      {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => <div key={d}>{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {generateDays().map((date, i) => (
                        <button
                          key={i}
                          disabled={!date || isPast(date)}
                          onClick={() => date && setSelectedDate(date)}
                          className={`h-9 w-full rounded-lg flex items-center justify-center text-sm transition-all ${
                            !date ? 'invisible' :
                            isPast(date) ? 'text-sage-200 cursor-not-allowed' :
                            isSelected(date) ? 'bg-darkGreen text-white font-bold shadow-md' :
                            isToday(date) ? 'bg-sage-100 text-darkGreen font-bold' : 'text-sage-600 hover:bg-sage-50 hover:text-darkGreen'
                          }`}
                        >
                          {date?.getDate()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Time Slots & Summary */}
              <div className="space-y-8">
                <div>
                  <h4 className="text-sage-900 font-bold mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-darkGreen text-white rounded-full flex items-center justify-center text-xs">3</span>
                    Available Slots
                  </h4>
                  
                  {!selectedDate ? (
                    <div className="bg-sage-50 border border-dashed border-sage-300 rounded-2xl p-8 text-center text-sage-400">
                      <FaCalendarAlt className="mx-auto text-3xl mb-3 opacity-30" />
                      <p className="text-sm">Select a date to view available time slots.</p>
                    </div>
                  ) : fetchingSlots ? (
                    <div className="flex flex-col items-center justify-center p-8 bg-sage-50 rounded-2xl animate-pulse">
                      <div className="w-8 h-8 border-4 border-darkGreen border-t-transparent rounded-full animate-spin mb-3"></div>
                      <p className="text-sage-500 text-sm">Finding slots...</p>
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-[220px] pr-2 custom-scrollbar">
                      {availableSlots.map(slot => (
                        <button
                          key={slot}
                          onClick={() => setSelectedTime(slot)}
                          className={`py-2 px-1 rounded-lg border-2 text-[11px] font-bold transition-all ${
                            selectedTime === slot
                              ? 'border-darkGreen bg-darkGreen text-white scale-95 shadow-lg'
                              : 'border-sage-100 text-sage-700 hover:border-sage-200 bg-white'
                          }`}
                        >
                          {formatTime12h(slot)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center text-red-400">
                      <p className="text-sm">No slots available for this date. Period.</p>
                    </div>
                  )}
                </div>

                <div className="bg-sage-50 rounded-2xl p-6 border border-sage-100 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-sage-200">
                    <span className="text-sage-600 font-medium">Session Fee</span>
                    <span className="text-xl font-bold text-darkGreen">
                      {symbol}{getPrice(selectedPkg.type, selectedPkg.duration, selectedPkg.price)}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-sage-600">
                      <FaClock className="text-darkGreen" />
                      <span>{selectedPkg.duration} Mins {selectedPkg.type} Session</span>
                    </div>
                    {selectedDate && (
                      <div className="flex items-center gap-2 text-xs text-sage-600">
                        <FaCheckCircle className="text-darkGreen" />
                        <span>{selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} {selectedTime ? `@ ${formatTime12h(selectedTime)}` : '(Select Time)'}</span>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={handleContinue} 
                    className={`btn-primary w-full py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${(!selectedDate || !selectedTime) ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                  >
                    Confirm Duration & Slot <FaChevronRight className="text-[10px]" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetails;
