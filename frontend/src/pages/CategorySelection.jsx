import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaPhoneAlt, FaVideo } from 'react-icons/fa';
import { usePricing } from '../context/PricingContext';

const CategorySelection = () => {
  const { symbol, prices, countryCategory, loading } = usePricing();

  const getStartingPrice = (type) => {
    if (loading || !prices || !prices[type]) return '...';
    return prices[type][15] || prices[type]['15'];
  };

  return (
    <div className="min-h-screen pt-28 pb-16 bg-sage-50 px-4 md:px-8 flex flex-col justify-center items-center">
      <div className="max-w-4xl w-full">
        
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-sage-900 mb-4 tracking-tight">Choose Appointment Category</h2>
          <p className="text-sage-600 text-lg">Select how you would like to connect for your Tarot Reading.</p>
        </div>

        <div className="flex flex-col gap-6">
          
          {/* Voice Call Row */}
          <Link to="/classes?type=voice" className="block group">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 md:p-8 rounded-[2rem] border border-sage-200 shadow-sm hover:shadow-xl hover:border-darkGreen/40 hover:-translate-y-1 transition-all duration-300 flex flex-col md:flex-row items-center md:items-stretch gap-6 md:gap-8"
            >
              <div className="w-24 h-24 bg-sage-50 rounded-2xl flex items-center justify-center text-darkGreen shrink-0 group-hover:bg-darkGreen group-hover:text-white transition-colors duration-500 shadow-sm">
                <FaPhoneAlt size={32} />
              </div>
              
              <div className="flex-1 text-center md:text-left flex flex-col justify-center">
                <h3 className="text-3xl font-serif font-bold text-sage-900 mb-2 group-hover:text-darkGreen transition-colors">Voice Call</h3>
                <p className="text-sage-500">Connect through a direct audio call.</p>
              </div>
              
              <div className="flex flex-col justify-center text-center md:text-right border-t md:border-t-0 md:border-l border-sage-100 pt-6 md:pt-0 md:pl-8 mt-4 md:mt-0 min-w-[200px]">
                <p className="text-[10px] font-bold text-sage-400 uppercase tracking-widest mb-1.5">Starting From</p>
                <p className="text-3xl font-serif font-bold text-sage-900 mb-1">
                  {symbol}{getStartingPrice('voice')}
                </p>
                {countryCategory === 'india' && <p className="text-[9px] font-bold text-sage-400 uppercase">+ 18% GST</p>}
                
                <div className="mt-5 inline-flex items-center justify-center gap-2 bg-sage-50 text-darkGreen font-bold px-6 py-2.5 rounded-xl group-hover:bg-darkGreen group-hover:text-white transition-colors">
                  Select <span className="font-serif italic transform group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Video Call Row */}
          <Link to="/classes?type=video" className="block group">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 md:p-8 rounded-[2rem] border border-sage-200 shadow-sm hover:shadow-xl hover:border-darkGreen/40 hover:-translate-y-1 transition-all duration-300 flex flex-col md:flex-row items-center md:items-stretch gap-6 md:gap-8"
            >
              <div className="w-24 h-24 bg-sage-50 rounded-2xl flex items-center justify-center text-darkGreen shrink-0 group-hover:bg-darkGreen group-hover:text-white transition-colors duration-500 shadow-sm">
                <FaVideo size={32} />
              </div>
              
              <div className="flex-1 text-center md:text-left flex flex-col justify-center">
                <h3 className="text-3xl font-serif font-bold text-sage-900 mb-2 group-hover:text-darkGreen transition-colors">Video Call</h3>
                <p className="text-sage-500">Connect face-to-face via video meeting.</p>
              </div>
              
              <div className="flex flex-col justify-center text-center md:text-right border-t md:border-t-0 md:border-l border-sage-100 pt-6 md:pt-0 md:pl-8 mt-4 md:mt-0 min-w-[200px]">
                <p className="text-[10px] font-bold text-sage-400 uppercase tracking-widest mb-1.5">Starting From</p>
                <p className="text-3xl font-serif font-bold text-sage-900 mb-1">
                  {symbol}{getStartingPrice('video')}
                </p>
                {countryCategory === 'india' && <p className="text-[9px] font-bold text-sage-400 uppercase">+ 18% GST</p>}
                
                <div className="mt-5 inline-flex items-center justify-center gap-2 bg-sage-50 text-darkGreen font-bold px-6 py-2.5 rounded-xl group-hover:bg-darkGreen group-hover:text-white transition-colors">
                  Select <span className="font-serif italic transform group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </motion.div>
          </Link>

        </div>
      </div>
    </div>
  );
};

export default CategorySelection;
