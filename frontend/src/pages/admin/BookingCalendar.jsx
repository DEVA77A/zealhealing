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
  FaPlus,
  FaTimes,
  FaEllipsisH,
  FaBell,
  FaCheckCircle,
  FaHistory
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const BookingCalendar = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const { getToken, user } = useAuth();

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

    // Empty slots before the first day
    for (let i = 0; i < startDay; i++) days.push(null);
    // Actual days
    for (let i = 1; i <= totalDays; i++) days.push(new Date(year, month, i));
    
    return days;
  };

  const getBookingsForDate = (date) => {
    if (!date) return [];
    const dateStr = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    return bookings.filter(b => {
      if (!b.appointmentDate) return false;
      const bDate = new Date(new Date(b.appointmentDate).getTime() - new Date(b.appointmentDate).getTimezoneOffset() * 60000).toISOString().split('T')[0];
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

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Accepted': return 'bg-blue-50 text-blue-600 border-blue-100'; // In Progress / Scheduled
      case 'Queued': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getBadgeText = (status) => {
    if (status === 'Accepted') return 'SCHEDULED';
    if (status === 'Completed') return 'COMPLETED';
    if (status === 'Queued') return 'PENDING';
    return status.toUpperCase();
  };

  if (loading) return <div className="p-8 text-center text-sage-600">Syncing with Cosmos...</div>;

  return (
    <div className="flex bg-[#F9FBF9] min-h-screen -m-8">
      {/* Main Calendar View */}
      <div className={`flex-1 p-10 transition-all duration-500`}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-serif font-black text-slate-900 tracking-tight">Schedule</h2>
              <p className="text-slate-400 font-medium mt-2">Manage your spiritual journey appointments and availability.</p>
            </div>
            
            <div className="flex items-center bg-white border border-slate-200 p-1.5 shadow-sm rounded-xl">
              <button onClick={prevMonth} className="p-3 hover:bg-slate-50 transition-colors text-slate-400 rounded-lg">
                <FaChevronLeft size={12} />
              </button>
              <div className="px-8 min-w-[200px] text-center font-serif text-xl font-bold text-slate-800">
                {formatMonth(currentMonth)}
              </div>
              <button onClick={nextMonth} className="p-3 hover:bg-slate-50 transition-colors text-slate-400 rounded-lg">
                <FaChevronRight size={12} />
              </button>
            </div>
          </div>

          {/* Calendar Grid Container */}
          <div className="bg-white border border-slate-200 shadow-xl shadow-slate-100/50 overflow-hidden rounded-2xl">
            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/30">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                <div key={day} className="py-4 text-center text-[10px] font-black text-slate-400 tracking-[0.25em]">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 border-l border-t border-slate-100">
              {generateDays().map((day, i) => {
                const dateBookings = getBookingsForDate(day);
                const isSelected = selectedDate && day && day.toDateString() === selectedDate.toDateString();
                const isToday = day && day.toDateString() === new Date().toDateString();

                return (
                  <div 
                    key={i} 
                    onClick={() => handleDateClick(day)}
                    className={`min-h-[140px] p-4 bg-white border-r border-b border-slate-100 transition-all cursor-pointer relative group flex flex-col ${
                      !day ? 'bg-slate-50/20 cursor-default' : 'hover:bg-slate-50/50'
                    } ${isSelected ? 'ring-[3px] ring-darkGreen ring-inset z-10' : ''}`}
                  >
                    {day && (
                      <>
                        <div className="flex justify-between items-start mb-3">
                          <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center transition-all rounded-md ${
                            isToday ? 'bg-darkGreen text-white' : 'text-slate-400 group-hover:text-darkGreen'
                          }`}>
                            {day.getDate()}
                          </span>
                        </div>
                        
                        <div className="space-y-1 mt-auto">
                          {dateBookings.slice(0, 2).map(b => (
                            <div key={b._id} className="text-[9px] px-2 py-1.5 bg-darkGreen text-white font-bold flex items-center justify-between rounded-md mb-1">
                              <span className="truncate max-w-[50px]">{b.appointmentTime} - {b.callType.split(' ')[0]}</span>
                            </div>
                          ))}
                          {dateBookings.length > 2 && (
                            <div className="text-[9px] text-slate-400 font-bold pl-1 pt-1">
                              + {dateBookings.length - 2} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quote Section */}
          <div className="mt-16 bg-[#EEF2ED] p-16 relative overflow-hidden group rounded-2xl">
            <div className="max-w-xl mx-auto text-center relative z-10">
              <p className="text-xl font-serif italic text-slate-700 leading-relaxed mb-6">
                "The soul always knows what to do to heal itself. The challenge is to silence the mind."
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="w-10 h-px bg-darkGreen opacity-30" />
                <span className="text-[10px] font-black text-darkGreen uppercase tracking-[0.3em]">Caroline Myss</span>
                <div className="w-10 h-px bg-darkGreen opacity-30" />
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] scale-150 pointer-events-none transition-transform duration-1000 group-hover:scale-[1.7]">
              <img src="https://img.icons8.com/plasticine/200/lotus.png" alt="lotus" />
            </div>
          </div>
        </div>
      </div>

      {/* Daily Dossier Sidebar */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div 
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className="w-[450px] bg-white border-l border-slate-200 shadow-2xl flex flex-col z-50 sticky top-0 h-screen"
          >
            <div className="p-10 flex flex-col h-full overflow-hidden">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-2">Daily Dossier</p>
                  <h3 className="text-4xl font-serif font-black text-slate-900 leading-none">
                    {selectedDate.toLocaleDateString('default', { month: 'long', day: 'numeric' })}
                  </h3>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedDate(null)} className="w-12 h-12 flex items-center justify-center bg-darkGreen text-white hover:opacity-90 transition-opacity shadow-lg rounded-xl">
                    <FaTimes size={16} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-6 custom-scrollbar">
                {selectedBookings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-32 text-center">
                    <div className="w-20 h-20 bg-slate-50 flex items-center justify-center text-slate-200 mb-6">
                      <FaHistory size={28} />
                    </div>
                    <p className="font-serif italic text-slate-400">The dossier is empty for this solar cycle.</p>
                  </div>
                ) : (
                  selectedBookings.sort((a,b) => a.appointmentTime.localeCompare(b.appointmentTime)).map((b, idx) => (
                    <div key={b._id} className="border border-slate-100 p-8 hover:border-slate-900 transition-all group rounded-2xl">
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${b.bookingStatus === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                          <span className="text-sm font-bold text-slate-900">{b.appointmentTime} — {b.appointmentEndTime || 'Duration'}</span>
                        </div>
                        <span className={`text-[8px] font-black px-2 py-1 border ${getStatusStyle(b.bookingStatus)}`}>
                          {getBadgeText(b.bookingStatus)}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 bg-slate-50 flex items-center justify-center text-slate-300 rounded-xl">
                          <FaUser size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-lg leading-tight">{b.customerName}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{b.appointmentType || 'Soul Journey'}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 mb-6">
                        <div className="flex-1 bg-slate-50 p-4 flex items-center gap-3 rounded-xl">
                          {b.callType === 'Video Call' ? <FaVideo className="text-slate-400" size={14} /> : <FaPhoneAlt className="text-slate-400" size={12} />}
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter truncate">{b.callType}</span>
                        </div>
                        <div className="flex-1 bg-slate-50 p-4 flex items-center gap-3 rounded-xl">
                          <FaMapMarkerAlt className="text-slate-400" size={14} />
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter truncate">{b.district}</span>
                        </div>
                      </div>

                      {b.bookingStatus === 'Accepted' && (
                        <div className="flex gap-2">
                          <button className="w-full py-4 bg-darkGreen text-white font-black text-[10px] uppercase tracking-[0.2em] hover:opacity-90 transition-opacity flex items-center justify-center gap-2 rounded-xl">
                            <FaPhoneAlt size={10} /> Join Call
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              
              <div className="mt-10 pt-10 border-t border-slate-100 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Scheduled</span>
                <span className="text-lg font-serif font-black text-slate-900">{selectedBookings.length} Appointments</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookingCalendar;
