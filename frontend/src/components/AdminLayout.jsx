import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaHome, 
  FaBoxOpen, 
  FaCalendarAlt, 
  FaUsers, 
  FaFileInvoiceDollar, 
  FaChartLine, 
  FaSignOutAlt,
  FaBars,
  FaTimes
} from 'react-icons/fa';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Calendar', path: '/admin/calendar', icon: <FaCalendarAlt /> },
    { name: 'Dashboard', path: '/admin', icon: <FaHome /> },
    { name: 'Classes', path: '/admin/classes', icon: <FaBoxOpen /> },
    { name: 'Bookings', path: '/admin/bookings', icon: <FaCalendarAlt /> },
    { name: 'Users', path: '/admin/users', icon: <FaUsers /> },
    { name: 'Invoices', path: '/admin/invoices', icon: <FaFileInvoiceDollar /> },
    { name: 'Analytics', path: '/admin/analytics', icon: <FaChartLine /> },
  ];

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 w-72 bg-[#1a2f23] text-white z-50 transform transition-transform duration-500 ease-out md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col shadow-2xl border-r border-[#2d4d3a]`}
      >
        <div className="p-8 flex flex-col items-center border-b border-[#2d4d3a]/50">
          <div className="relative group cursor-pointer" onClick={() => navigate('/')}>
            <div className="absolute inset-0 bg-gold/20 rounded-full blur-xl group-hover:bg-gold/40 transition-all"></div>
            <img 
              src="/logo.png" 
              alt="Zeal Healing Logo" 
              className="h-20 w-20 object-contain relative z-10 bg-white rounded-full p-2 shadow-lg transform group-hover:scale-110 transition-transform duration-500" 
            />
          </div>
          <h2 className="mt-4 text-xl font-serif font-bold tracking-[0.2em] text-gold drop-shadow-sm">ZEAL HEALING</h2>
          <p className="text-[10px] text-sage-400/60 font-bold uppercase tracking-widest mt-1">Management Portal</p>
          <button className="absolute top-6 right-6 md:hidden text-white" onClick={toggleSidebar}>
            <FaTimes size={20} />
          </button>
        </div>

        <nav className="flex-grow px-4 mt-8 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.name} 
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center space-x-4 px-6 py-3.5 rounded-xl transition-all duration-300 relative overflow-hidden ${
                  isActive 
                    ? 'bg-gradient-to-r from-darkGreen to-[#2d4d3a] text-gold shadow-lg shadow-black/20' 
                    : 'text-sage-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {isActive && <motion.div layoutId="activeNav" className="absolute left-0 w-1 h-6 bg-gold rounded-full" />}
                <span className={`text-lg transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 opacity-70 group-hover:opacity-100'}`}>
                  {item.icon}
                </span>
                <span className="font-semibold tracking-wide text-sm">{item.name}</span>
                {!isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-gold/5 transition-opacity opacity-0 group-hover:opacity-100" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-[#2d4d3a]/50">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-4 w-full px-6 py-3.5 rounded-xl text-sage-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 group"
          >
            <FaSignOutAlt className="group-hover:rotate-12 transition-transform" />
            <span className="font-semibold text-sm tracking-wide">Secure Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full h-full relative">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 z-30 px-8 py-5 flex items-center justify-between sticky top-0">
          <button 
            className="md:hidden text-slate-600 hover:text-darkGreen transition-colors"
            onClick={toggleSidebar}
          >
            <FaBars size={24} />
          </button>
          
          <div className="hidden md:flex items-center space-x-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <Link to="/admin" className="hover:text-darkGreen transition-colors">Portal</Link>
            <span>/</span>
            <span className="text-darkGreen">{navItems.find(n => location.pathname === n.path || (n.path !== '/admin' && location.pathname.startsWith(n.path)))?.name || 'Overview'}</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-gold to-darkGreen rounded-full opacity-60 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-white w-10 h-10 rounded-full flex items-center justify-center text-darkGreen font-bold border-2 border-white cursor-pointer overflow-hidden shadow-sm">
                <span className="relative z-10">A</span>
                <div className="absolute inset-0 bg-sage-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#f8fafc]">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;
