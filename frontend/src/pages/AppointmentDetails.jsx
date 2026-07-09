import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaClock, FaCheckCircle, FaChevronLeft, FaChevronRight, FaStar, FaInfoCircle, FaShieldAlt } from 'react-icons/fa';
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
        const { data: allPackages } = await axios.get('/api/classes');
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
      const { data } = await axios.get(`/api/bookings/slots?date=${dateStr}&duration=${selectedPkg.duration}`);
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
    <div className="min-h-screen pt-24 pb-24 bg-white px-4 sm:px-8 xl:px-12 w-full">
      <div className="max-w-[1800px] mx-auto w-full">
        
        {/* Header with Small Image */}
        <div className="flex flex-col items-center text-center mb-16 px-4">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden mb-6 shadow-xl border-[6px] border-sage-50">
            <img src={selectedPkg.image || "/tarot.png"} alt={selectedPkg.title} className="w-full h-full object-cover" />
          </div>
          <span className="text-darkGreen text-xs font-bold uppercase tracking-widest mb-3">
            Category: {selectedPkg.type === 'voice' ? 'Voice Call' : 'Video Call'}
          </span>
          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-sage-900 mb-5">{selectedPkg.title}</h2>
          <p className="text-sage-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            {selectedPkg.description}
          </p>
        </div>

        {/* Booking Form Layout spreading horizontally on wide screens */}
        <div className="flex flex-col xl:flex-row gap-8 lg:gap-12 w-full mb-24">
          
          {/* Step 1: Duration */}
          <div className="flex-1 w-full xl:max-w-sm flex flex-col">
            <h4 className="text-sage-900 font-bold mb-6 flex items-center gap-3 text-lg border-b border-sage-100 pb-3">
              <span className="w-7 h-7 bg-sage-100 text-darkGreen rounded-full flex items-center justify-center text-xs">1</span>
              Duration
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {relatedPkgs.map(pkg => (
                <button
                  key={pkg._id}
                  onClick={() => handleDurationSelect(pkg._id)}
                  className={`py-4 px-3 rounded-2xl border transition-all text-sm font-bold ${
                    selectedPkg._id === pkg._id
                      ? 'border-darkGreen bg-darkGreen text-white shadow-xl shadow-darkGreen/20 scale-[1.02]'
                      : 'border-sage-200 text-sage-600 hover:border-sage-300 hover:bg-sage-50'
                  }`}
                >
                  {pkg.duration} Mins
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Preferred Date */}
          <div className="flex-[1.5] w-full flex flex-col">
            <h4 className="text-sage-900 font-bold mb-6 flex items-center gap-3 text-lg border-b border-sage-100 pb-3">
              <span className="w-7 h-7 bg-sage-100 text-darkGreen rounded-full flex items-center justify-center text-xs">2</span>
              Preferred Date
            </h4>
            <div className="bg-sage-50/50 border border-sage-100 rounded-3xl p-6 flex-grow">
              <div className="flex justify-between items-center mb-6 px-2">
                <button onClick={prevMonth} className="p-2 hover:bg-white rounded-full text-sage-500 shadow-sm transition-all"><FaChevronLeft/></button>
                <h5 className="font-bold text-sage-900 text-lg uppercase tracking-wide">{formatMonth(currentMonth)}</h5>
                <button onClick={nextMonth} className="p-2 hover:bg-white rounded-full text-sage-500 shadow-sm transition-all"><FaChevronRight/></button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] sm:text-xs font-black text-sage-400 mb-4 tracking-wider">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => <div key={d}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {generateDays().map((date, i) => (
                  <button
                    key={i}
                    disabled={!date || isPast(date)}
                    onClick={() => date && setSelectedDate(date)}
                    className={`aspect-square w-full rounded-2xl flex items-center justify-center text-sm font-bold transition-all ${
                      !date ? 'invisible' :
                      isPast(date) ? 'text-sage-300 cursor-not-allowed hidden sm:flex' :
                      isSelected(date) ? 'bg-darkGreen text-white shadow-lg scale-110 z-10' :
                      isToday(date) ? 'bg-sage-200 text-darkGreen' : 'bg-white text-sage-700 shadow-sm hover:shadow-md hover:bg-white hover:text-darkGreen border border-sage-100'
                    }`}
                  >
                    {date?.getDate()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 3: Available Slots */}
          <div className="flex-1 w-full flex flex-col">
            <h4 className="text-sage-900 font-bold mb-6 flex items-center gap-3 text-lg border-b border-sage-100 pb-3">
              <span className="w-7 h-7 bg-sage-100 text-darkGreen rounded-full flex items-center justify-center text-xs">3</span>
              Available Slots
            </h4>
            
            <div className="flex-grow flex flex-col">
              {!selectedDate ? (
                <div className="bg-sage-50/50 border border-dashed border-sage-200 rounded-3xl p-8 text-center text-sage-400 flex flex-col justify-center flex-grow min-h-[250px]">
                  <FaCalendarAlt className="mx-auto text-4xl mb-4 opacity-30 text-sage-500" />
                  <p className="text-sm font-medium">Select a date to view<br/>available time slots.</p>
                </div>
              ) : fetchingSlots ? (
                <div className="flex flex-col items-center justify-center p-8 bg-sage-50/50 border border-sage-100 rounded-3xl flex-grow min-h-[250px]">
                  <div className="w-8 h-8 border-4 border-darkGreen border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-sage-500 text-sm font-medium animate-pulse">Finding slots...</p>
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-3 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
                  {availableSlots.map(slot => (
                    <button
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      className={`py-3.5 px-1 rounded-2xl border text-[11px] sm:text-xs font-bold transition-all ${
                        selectedTime === slot
                          ? 'border-darkGreen bg-darkGreen text-white shadow-xl shadow-darkGreen/20 scale-95'
                          : 'border-sage-200 text-sage-700 hover:border-sage-300 bg-white shadow-sm hover:shadow-md'
                      }`}
                    >
                      {formatTime12h(slot)}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-red-50 border border-red-100 rounded-3xl p-8 text-center text-red-500 flex flex-col justify-center flex-grow min-h-[250px]">
                  <p className="text-sm font-bold">No slots available.<br/>Please choose another date.</p>
                </div>
              )}
            </div>
          </div>

          {/* Step 4: Summary Card */}
          <div className="flex-[1.2] w-full flex flex-col">
            <h4 className="text-sage-900 font-bold mb-6 flex items-center gap-3 text-lg border-b border-sage-100 pb-3 opacity-0 hidden xl:flex">
              <span className="w-7 h-7 bg-transparent rounded-full"></span>
              Checkout
            </h4>
            <div className="bg-sage-900 rounded-3xl p-8 shadow-2xl shadow-sage-900/20 text-white flex flex-col justify-between relative overflow-hidden flex-grow min-h-[250px]">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -mt-10 -mr-10"></div>
              
              <div className="flex justify-between items-end pb-5 border-b border-sage-700/50 relative z-10">
                <span className="text-sage-300 font-medium text-sm tracking-widest uppercase">Session Fee</span>
                <span className="text-4xl font-serif font-bold text-white">
                  {symbol}{getPrice(selectedPkg.type, selectedPkg.duration, selectedPkg.price)}
                </span>
              </div>
              
              <div className="space-y-5 relative z-10 py-6">
                <div className="flex items-center gap-4 text-sm text-sage-200">
                  <FaClock className="text-sage-400 text-xl" />
                  <span className="font-medium tracking-wide">{selectedPkg.duration} Mins {selectedPkg.type} Session</span>
                </div>
                {selectedDate && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4 text-sm text-sage-200">
                      <FaCheckCircle className="text-sage-400 text-xl" />
                      <span className="font-medium">{selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    {selectedTime && (
                       <div className="flex items-center gap-4 text-sm text-sage-200 ml-[36px]">
                         <span className="font-bold text-white bg-sage-800 px-3 py-1 rounded-lg">@ {formatTime12h(selectedTime)}</span>
                       </div>
                    )}
                  </div>
                )}
              </div>

              <button 
                onClick={handleContinue} 
                className={`w-full mt-auto py-5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all relative z-10 ${(!selectedDate || !selectedTime) ? 'bg-sage-800/50 text-sage-500 cursor-not-allowed' : 'bg-white text-sage-900 hover:bg-sage-50 hover:scale-[1.02] active:scale-95 shadow-xl'}`}
              >
                Confirm Duration & Slot <FaChevronRight className="text-[10px] opacity-70" />
              </button>
            </div>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="bg-sage-50 p-8 rounded-3xl border border-sage-100/50 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-white text-darkGreen rounded-full flex items-center justify-center text-xl mb-5 shadow-sm">
              <FaStar />
            </div>
            <h4 className="font-bold text-sage-900 mb-3 text-lg">What to Expect</h4>
            <p className="text-sm text-sage-600 leading-relaxed">A deep, intuitive reading focusing on your energies. Gain clarity, uncover hidden blockages, and find the right path forward without judgment.</p>
          </div>
          
          <div className="bg-sage-50 p-8 rounded-3xl border border-sage-100/50 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-white text-darkGreen rounded-full flex items-center justify-center text-xl mb-5 shadow-sm">
              <FaInfoCircle />
            </div>
            <h4 className="font-bold text-sage-900 mb-3 text-lg">Preparation</h4>
            <p className="text-sm text-sage-600 leading-relaxed">Find a quiet, comfortable space where you won't be disturbed. Take a few deep breaths before the session and have an open mind.</p>
          </div>

          <div className="bg-sage-50 p-8 rounded-3xl border border-sage-100/50 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-white text-darkGreen rounded-full flex items-center justify-center text-xl mb-5 shadow-sm">
              <FaShieldAlt />
            </div>
            <h4 className="font-bold text-sage-900 mb-3 text-lg">Policy</h4>
            <p className="text-sm text-sage-600 leading-relaxed">Rescheduling or cancellations must be done at least 24 hours in advance. Need support? Our team is always here for you.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AppointmentDetails;
