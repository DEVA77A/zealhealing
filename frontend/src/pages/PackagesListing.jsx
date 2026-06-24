import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { usePricing } from '../context/PricingContext';
import { FaClock, FaArrowRight, FaGlobeAmericas, FaMapMarkerAlt } from 'react-icons/fa';

const PackagesListing = () => {
  const location = useLocation();
  const { symbol, getPrice, countryCategory, loading: pricingLoading } = usePricing();
  const queryParams = new URLSearchParams(location.search);
  const type = queryParams.get('type') || 'voice'; 

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/classes');
        const activePackages = data.filter(pkg => pkg.status === 'Active' && pkg.type === type);
        setPackages(activePackages.sort((a, b) => a.duration - b.duration));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching classes:', error);
        setLoading(false);
      }
    };
    fetchClasses();
  }, [type]);

  const categoryName = type === 'voice' ? 'Voice Call Readings' : 'Video Call Readings';
  const regionLabel = countryCategory === 'india' ? 'India Pricing (Inc. 18% GST)' : 'International Pricing';

  if (loading || pricingLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex flex-col justify-center items-center bg-sage-50">
        <div className="w-12 h-12 border-4 border-darkGreen border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sage-600 font-serif italic">Preparing your session packages...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-sage-50 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-16 relative">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-sage-200 text-darkGreen text-xs font-bold uppercase tracking-widest shadow-sm mb-6"
          >
            {countryCategory === 'india' ? <FaMapMarkerAlt className="animate-pulse" /> : <FaGlobeAmericas />}
            {regionLabel}
          </motion.div>
          <h2 className="text-5xl md:text-6xl font-serif font-bold text-darkGreen mb-4 tracking-tight">{categoryName}</h2>
          <p className="text-sage-600 text-lg md:text-xl font-light italic max-w-2xl mx-auto">
            "Everything in the universe is connected. Select a duration for your guided clarity."
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {packages.map((pkg, index) => {
              const displayPrice = getPrice(pkg.type, pkg.duration, pkg.price);
              
              return (
                <motion.div 
                  key={pkg._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative"
                >
                  <div className="h-full bg-white rounded-3xl p-6 shadow-sm border border-sage-100 hover:shadow-2xl hover:shadow-darkGreen/10 transition-all duration-500 overflow-hidden relative z-10">
                    
                    {/* Image Area */}
                    <div className="relative aspect-[4/3] -mx-2 -mt-2 mb-6 rounded-2xl overflow-hidden bg-sage-50 group-hover:shadow-lg transition-transform duration-500">
                      <img 
                        src={pkg.image || "/tarot.png"} 
                        alt={pkg.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-darkGreen/40 to-transparent flex items-bottom p-4">
                         <div className="mt-auto">
                           <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur text-darkGreen text-[10px] font-bold rounded-full border border-white/50">
                             <FaClock /> {pkg.duration} MINUTES
                           </span>
                         </div>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex flex-col h-[calc(100%-200px)]">
                      <h3 className="text-2xl font-serif font-bold text-sage-900 mb-3 group-hover:text-darkGreen transition-colors line-clamp-2 leading-tight">
                        {pkg.title}
                      </h3>
                      <p className="text-sage-500 text-sm mb-6 leading-relaxed flex-grow italic line-clamp-3">
                        {pkg.description || "Divine guidance tailored to your specific energy and questions."}
                      </p>
                      
                      <div className="mt-auto">
                        <div className="flex items-end justify-between mb-6">
                           <div>
                              <p className="text-[10px] font-bold text-sage-400 uppercase tracking-widest mb-1">Honorarium</p>
                              <p className="text-3xl font-serif font-bold text-sage-900 leading-none">
                                {symbol}{displayPrice.toLocaleString()}
                              </p>
                           </div>
                           {countryCategory === 'india' && (
                             <div className="text-right">
                                <span className="text-[10px] font-bold text-darkGreen bg-darkGreen/5 px-2 py-1 rounded border border-darkGreen/10">GST INCL.</span>
                             </div>
                           )}
                        </div>
                        
                        <Link to={`/book/${pkg._id}`} className="block">
                          <button className="w-full py-4 bg-sage-50 text-darkGreen rounded-2xl font-bold hover:bg-darkGreen hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group/btn">
                            Commence Booking
                            <FaArrowRight className="text-xs transform group-link/btn-hover:translate-x-1" />
                          </button>
                        </Link>
                      </div>
                    </div>

                    {/* Background Pattern */}
                    <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-darkGreen/5 rounded-full blur-3xl group-hover:bg-darkGreen/10 transition-colors pointer-events-none" />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {packages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-20 text-center bg-white/50 rounded-3xl border-2 border-dashed border-sage-200"
            >
              <div className="w-20 h-20 mx-auto bg-sage-100 rounded-full flex items-center justify-center text-sage-300 text-4xl mb-6">
                <FaClock />
              </div>
              <h3 className="text-2xl font-serif text-sage-900 mb-2">No Active Timeframes</h3>
              <p className="text-sage-600">The divine timing for these packages is being recalibrated. Please check back shortly.</p>
            </motion.div>
          )}
        </div>

        {/* Support Section */}
        <div className="mt-20 text-center px-6 py-8 bg-darkGreen rounded-[3rem] text-white shadow-xl shadow-darkGreen/20">
           <p className="text-darkGreen-50 text-sm uppercase tracking-widest font-bold mb-2">Seeking Specific Guidance?</p>
           <h4 className="text-2xl font-serif mb-4">Custom Consultation durations available upon request.</h4>
           <div className="flex justify-center gap-4">
              <a href="https://wa.me/91XXXXXXXXXX" className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-xs font-bold tracking-widest transition-all">WHATSAPP SUPPORT</a>
              <Link to="/about" className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-xs font-bold tracking-widest transition-all">ABOUT ZEAL HEALING</Link>
           </div>
        </div>

      </div>
    </div>
  );
};

export default PackagesListing;
