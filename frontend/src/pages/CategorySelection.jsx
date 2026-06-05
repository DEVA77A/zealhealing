import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaPhoneAlt, FaVideo } from 'react-icons/fa';

const CategorySelection = () => {
  return (
    <div className="min-h-screen pt-24 pb-12 bg-sage-50 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold text-darkGreen mb-4">Choose Appointment Category</h2>
          <p className="text-sage-800 text-lg">Select how you would like to connect for your Tarot Reading.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Voice Call Card */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="card cursor-pointer border-2 border-transparent hover:border-darkGreen group text-center py-12"
          >
            <Link to="/classes?type=voice" className="block">
              <div className="w-20 h-20 mx-auto bg-sage-100 rounded-full flex items-center justify-center text-darkGreen text-3xl mb-6 group-hover:bg-darkGreen group-hover:text-white transition-colors">
                <FaPhoneAlt />
              </div>
              <h3 className="text-2xl font-serif font-semibold text-sage-900 mb-2">Voice Call</h3>
              <p className="text-sage-700 mb-4">(Abroad only)</p>
              <span className="text-darkGreen font-medium flex items-center justify-center gap-2">
                View Packages <span className="transform transition-transform group-hover:translate-x-1">→</span>
              </span>
            </Link>
          </motion.div>

          {/* Video Call Card */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="card cursor-pointer border-2 border-transparent hover:border-darkGreen group text-center py-12"
          >
            <Link to="/classes?type=video" className="block">
              <div className="w-20 h-20 mx-auto bg-sage-100 rounded-full flex items-center justify-center text-darkGreen text-3xl mb-6 group-hover:bg-darkGreen group-hover:text-white transition-colors">
                <FaVideo />
              </div>
              <h3 className="text-2xl font-serif font-semibold text-sage-900 mb-2">Video Call</h3>
              <p className="text-sage-700 mb-4">(Abroad only)</p>
              <span className="text-darkGreen font-medium flex items-center justify-center gap-2">
                View Packages <span className="transform transition-transform group-hover:translate-x-1">→</span>
              </span>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CategorySelection;
