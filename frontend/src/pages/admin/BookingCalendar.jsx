import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaChevronLeft, 
  FaChevronRight, 
  FaCalendarAlt, 
  FaClock, 
  FaUser, 
  FaVideo, 
  FaPhoneAlt, 
  FaMapMarkerAlt,
  FaTimes
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const BookingCalendar = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/admin/bookings', {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        setBookings(data);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to fetch bookings');
        setLoading(false);
      }
    };
    fetchBookings();
  }, [getToken]);

  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const generateDays = () => {
    const days = [];
    const month = currentMonth.getMonth();
    const year = currentMonth.getFullYear();
    const totalDays = daysInMonth(month, year);
    const startDay = firstDayOfMonth(month, year);

    for (let i = 0; i < startDay; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) days.push(new Date(year, month, i));
    
    return days;
  };

  const getBookingsForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(b => {
      if (!b.appointmentDate) return false;
      const bDate = new Date(b.appointmentDate).toISOString().split('T')[0];
      return bDate === dateStr;
    });
  };

  const handleDateClick = (date) => {
    if (!date) return;
    const dateBookings = getBookingsForDate(date);
    setSelectedDate(date);
    setSelectedBookings(dateBookings);
  };

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));

  const formatMonth = (date) => date.toLocaleString('default', { month: 'long', year: 'numeric' });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Accepted': return 'bg-green-500';
      case 'Rejected': return 'bg-red-500';
      case 'Queued': return 'bg-yellow-500';
      default: return 'bg-sage-400';
    }
  };

  if (loading) return <div className="p-8 text-center text-sage-600">Loading Calendar...</div>;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-serif font-bold text-darkGreen">Schedule</h2>
          <p className="text-sage-600 font-medium mt-1">Manage your spiritual journey appointments</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-slate-200">
          <button onClick={prevMonth} className="w-10 h-10 flex items-center justify-center hover:bg-sage-50 rounded-xl text-sage-600 transition-all hover:scale-105 active:scale-95">
            <FaChevronLeft size={14} />
          </button>
          <div className="px-6 text-center">
            <h3 className="text-lg font-bold text-slate-900 tracking-wide">
              {formatMonth(currentMonth)}
            </h3>
          </div>
          <button onClick={nextMonth} className="w-10 h-10 flex items-center justify-center hover:bg-sage-50 rounded-xl text-sage-600 transition-all hover:scale-105 active:scale-95">
            <FaChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Calendar Grid */}
        <div className="xl:col-span-8 bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px bg-slate-100">
            {generateDays().map((day, i) => {
              const dateBookings = getBookingsForDate(day);
              const isSelected = selectedDate && day && day.toDateString() === selectedDate.toDateString();
              const isToday = day && day.toDateString() === new Date().toDateString();

              return (
                <motion.div 
                  key={i} 
                  whileHover={day ? { zIndex: 20, scale: 1.02 } : {}}
                  onClick={() => handleDateClick(day)}
                  className={`min-h-[140px] p-3 bg-white transition-all cursor-pointer relative group ${
                    !day ? 'bg-slate-50/30 cursor-default opacity-40' : ''
                  } ${isSelected ? 'ring-4 ring-gold/20' : ''}`}
                >
                  {day && (
                    <>
                      <div className="flex justify-between items-start mb-3">
                        <span className={`text-sm font-bold flex items-center justify-center w-8 h-8 rounded-2xl transition-all ${
                          isToday ? 'bg-darkGreen text-white shadow-lg shadow-darkGreen/20' : 'text-slate-400 group-hover:text-darkGreen'
                        } ${isSelected ? 'bg-gold text-white shadow-lg shadow-gold/20' : ''}`}>
                          {day.getDate()}
                        </span>
                        {dateBookings.length > 0 && (
                          <div className="w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_8px_rgba(212,175,55,0.6)]" />
                        )}
                      </div>
                      
                      <div className="space-y-1.5">
                        {dateBookings.slice(0, 3).map(b => (
                          <div 
                            key={b._id} 
                            className={`text-[9px] px-2.5 py-1.5 rounded-lg text-white font-bold truncate flex items-center gap-1.5 shadow-sm transition-transform hover:scale-105 ${getStatusColor(b.bookingStatus)}`}
                          >
                            <span className="opacity-80">{b.appointmentTime}</span>
                            <span className="tracking-tight">{b.customerName}</span>
                          </div>
                        ))}
                        {dateBookings.length > 3 && (
                          <div className="text-[9px] text-slate-400 font-bold pl-1 uppercase tracking-tighter">
                            + {dateBookings.length - 3} sessions
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sticky top-30">
            <div className="flex flex-col gap-1 mb-8">
              <span className="text-[10px] font-black text-gold uppercase tracking-[0.2em]">Daily Dossier</span>
              <h3 className="font-serif font-bold text-3xl text-slate-900 leading-tight">
                {selectedDate ? selectedDate.toLocaleDateString('default', { day: 'numeric', month: 'long' }) : 'Select Date'}
              </h3>
              <div className="w-12 h-1 bg-gold rounded-full mt-2" />
            </div>

            {!selectedDate ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-300">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <FaCalendarAlt size={32} className="opacity-10" />
                </div>
                <p className="font-medium text-slate-400">Choose a date to review</p>
              </div>
            ) : selectedBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-300">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <FaCalendarAlt size={32} className="opacity-10" />
                </div>
                <p className="font-medium text-slate-400">Peaceful day, no bookings</p>
              </div>
            ) : (
              <div className="space-y-5 max-h-[550px] overflow-y-auto pr-3 custom-scrollbar">
                {selectedBookings.sort((a,b) => a.appointmentTime.localeCompare(b.appointmentTime)).map((b, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={b._id} 
                    className="group p-5 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2.5 text-darkGreen font-black text-sm">
                        <div className="w-2 h-2 rounded-full bg-darkGreen animate-pulse" />
                        <span>{b.appointmentTime} &mdash; {b.appointmentEndTime}</span>
                      </div>
                      <span className={`text-[9px] uppercase tracking-[0.15em] font-black px-3 py-1 rounded-full text-white shadow-sm ${getStatusColor(b.bookingStatus)}`}>
                        {b.bookingStatus}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-darkGreen border border-slate-100">
                          <FaUser size={12} />
                        </div>
                        <span className="font-bold text-slate-800 tracking-tight">{b.customerName}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                          {b.callType === 'Video Call' ? <FaVideo size={10} className="text-gold" /> : <FaPhoneAlt size={10} className="text-gold" />}
                          <span className="truncate">{b.callType}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                          <FaMapMarkerAlt size={10} className="text-gold" />
                          <span className="truncate">{b.district}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;
