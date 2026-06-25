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
    { name: 'Dashboard', path: '/admin', icon: <FaHome /> },
    { name: 'Calendar', path: '/admin/calendar', icon: <FaCalendarAlt /> },
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
        className={`fixed inset-y-0 left-0 w-64 z-50 transform transition-transform duration-500 ease-out md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col bg-white border-r border-sage-100 shadow-sm`}
      >
        {/* Logo Header */}
        <div className="relative p-6 flex flex-col items-center border-b border-sage-100">
          <button className="absolute top-5 right-5 md:hidden text-sage-400 hover:text-sage-700" onClick={toggleSidebar}>
            <FaTimes size={18} />
          </button>
          <div className="relative cursor-pointer group" onClick={() => navigate('/')}>
            <div className="absolute inset-0 bg-darkGreen/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-16 h-16 rounded-full bg-sage-50 border-2 border-sage-100 flex items-center justify-center shadow-sm group-hover:border-darkGreen/30 transition-all duration-500 relative z-10">
              <img src="/logo.png" alt="Zeal Healing" className="h-12 w-12 object-contain rounded-full" />
            </div>
          </div>
          <h2 className="mt-4 text-sm font-serif font-bold tracking-[0.2em] text-sage-900">ZEAL HEALING</h2>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-darkGreen animate-pulse" />
            <p className="text-[9px] text-sage-400 font-bold uppercase tracking-widest">Admin Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-grow px-3 mt-5 space-y-1 overflow-y-auto">
          <p className="text-[9px] font-bold text-sage-400 uppercase tracking-widest px-3 mb-3">Main Menu</p>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.name} 
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative ${
                  isActive 
                    ? 'bg-darkGreen text-white shadow-md shadow-darkGreen/20' 
                    : 'text-sage-600 hover:text-darkGreen hover:bg-sage-50'
                }`}
              >
                {/* Icon container */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 transition-all duration-200 ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : 'bg-sage-100 text-sage-500 group-hover:bg-darkGreen/10 group-hover:text-darkGreen'
                }`}>
                  {item.icon}
                </div>

                {/* Label */}
                <span className="font-semibold text-sm tracking-wide">{item.name}</span>

                {/* Active right dot */}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60 shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 mt-2">
          <div className="h-px bg-sage-100 mb-4" />
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sage-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 group"
          >
            <div className="w-8 h-8 rounded-lg bg-sage-100 flex items-center justify-center group-hover:bg-red-100 transition-colors">
              <FaSignOutAlt size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
            <span className="font-semibold text-sm tracking-wide">Logout</span>
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
