import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { packages } from '../data/packages';
import { usePricing } from '../context/PricingContext';

const PackagesListing = () => {
  const location = useLocation();
  const { symbol, getPrice } = usePricing();
  const queryParams = new URLSearchParams(location.search);
  const type = queryParams.get('type') || 'voice'; // default to voice if none

  const filteredPackages = packages.filter(pkg => pkg.type === type);
  const typeTitle = type === 'voice' ? 'Voice Call Appointments (Abroad only)' : 'Video Call Appointments (Abroad only)';

  return (
    <div className="min-h-screen pt-24 pb-12 bg-sage-50 px-4">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold text-darkGreen mb-4">{typeTitle}</h2>
          <p className="text-sage-800 text-lg">Choose a package that best fits your journey.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPackages.map((pkg, index) => (
            <motion.div 
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card flex flex-col h-full overflow-hidden group cursor-pointer border-transparent hover:border-darkGreen"
            >
              <div className="relative h-48 -mx-6 -mt-6 mb-4 overflow-hidden bg-sage-200">
                <img 
                  src="/tarot.png" 
                  alt="Tarot Card" 
                  className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-darkGreen/10 group-hover:bg-transparent transition-colors" />
              </div>
              
              <div className="flex-grow flex flex-col">
                <span className="text-xs font-bold text-sage-500 uppercase tracking-wider mb-2">{pkg.type} call</span>
                <h3 className="text-xl font-serif font-bold text-sage-900 mb-2">{pkg.title}</h3>
                <p className="text-sage-700 text-sm mb-4 flex-grow">{pkg.description}</p>
                
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-sage-100">
                  <span className="text-darkGreen font-medium">{pkg.duration} Mins</span>
                  <span className="text-xl font-bold text-sage-900">{symbol}{getPrice(pkg.type, pkg.duration, pkg.price)}</span>
                </div>
                
                <Link to={`/book/${pkg.id}`} className="w-full">
                  <button className="btn-primary w-full group-hover:bg-sage-800">
                    Book Now
                  </button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default PackagesListing;
