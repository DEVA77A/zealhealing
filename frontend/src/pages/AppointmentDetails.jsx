import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { packages } from '../data/packages';
import { usePricing } from '../context/PricingContext';

const AppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { symbol, getPrice } = usePricing();
  
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [relatedPkgs, setRelatedPkgs] = useState([]);

  useEffect(() => {
    const pkg = packages.find(p => p.id === id);
    if (pkg) {
      setSelectedPkg(pkg);
      // Find other packages of the same type (voice or video)
      setRelatedPkgs(packages.filter(p => p.type === pkg.type));
    }
  }, [id]);

  if (!selectedPkg) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const handleDurationSelect = (pkgId) => {
    navigate(`/book/${pkgId}`);
  };

  const handleContinue = () => {
    navigate(`/checkout/${selectedPkg.id}`);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-sage-50 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-sm overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Image */}
        <div className="w-full md:w-1/2 bg-sage-200">
          <img src="/tarot.png" alt="Tarot Appointment" className="w-full h-full object-cover min-h-[400px]" />
        </div>

        {/* Right Side: Details */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <span className="text-sm font-bold text-sage-500 uppercase tracking-wider mb-2">
            {selectedPkg.type === 'voice' ? 'Voice Call (Abroad only)' : 'Video Call (Abroad only)'}
          </span>
          <h2 className="text-3xl font-serif font-bold text-sage-900 mb-4">{selectedPkg.title}</h2>
          <p className="text-sage-700 mb-8 leading-relaxed">
            {selectedPkg.description}
          </p>

          {/* Duration Selection */}
          <div className="mb-8">
            <h4 className="text-sage-900 font-semibold mb-4">Select Duration</h4>
            <div className="grid grid-cols-2 gap-3">
              {relatedPkgs.map(pkg => (
                <button
                  key={pkg.id}
                  onClick={() => handleDurationSelect(pkg.id)}
                  className={`py-3 px-4 rounded-xl border-2 transition-all ${
                    selectedPkg.id === pkg.id
                      ? 'border-darkGreen bg-sage-50 text-darkGreen font-semibold shadow-sm'
                      : 'border-sage-100 text-sage-600 hover:border-sage-300'
                  }`}
                >
                  {pkg.duration} Mins
                </button>
              ))}
            </div>
          </div>

          {/* Pricing & Booking Summary */}
          <div className="bg-sage-50 rounded-xl p-6 mb-8 border border-sage-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sage-700">Total Price</span>
              <span className="text-2xl font-bold text-darkGreen">
                {symbol}{getPrice(selectedPkg.type, selectedPkg.duration, selectedPkg.price)}
              </span>
            </div>
            <p className="text-sm text-sage-500">* Exclusive of GST (5%)</p>
          </div>

          <button onClick={handleContinue} className="btn-primary w-full py-4 text-lg">
            Continue to Booking
          </button>
        </div>

      </div>
    </div>
  );
};

export default AppointmentDetails;
