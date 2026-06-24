import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden pt-16">
        <div className="absolute inset-0">
          <img src="/hero-bg.png" alt="Spiritual Path Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/20" /> {/* Subtle dark overlay for contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-sage-50/10 via-transparent to-sage-50/90" />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-4xl flex flex-col items-center"
        >
          <img src="/logo.png" alt="Zeal Healing Logo" className="w-48 h-48 md:w-56 md:h-56 mb-8 object-contain drop-shadow-2xl" />
          <h1 className="text-5xl md:text-8xl font-serif font-bold text-darkGreen mb-6 leading-tight drop-shadow-sm">
            Discover Your <br /> Spiritual Path
          </h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-sage-800 mb-10 leading-relaxed font-medium"
          >
            Discover a path to healing, meditation, and inner peace through our curated digital sanctuary of mindfulness.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/sessions">
              <button className="btn-primary w-full sm:w-auto text-lg px-8 py-3">
                Book a Session
              </button>
            </Link>
            <Link to="/classes">
              <button className="btn-secondary w-full sm:w-auto text-lg px-8 py-3 bg-sage-100/80 backdrop-blur-sm">
                Explore Classes
              </button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Decorative subtle platform/deck at the bottom of hero as seen in reference */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-[80%] md:w-[60%] h-8 bg-white/20 backdrop-blur-md border-t border-white/40 rounded-t-xl" style={{ perspective: '1000px', transformStyle: 'preserve-3d', transform: 'translateX(-50%) rotateX(70deg)' }}></div>
      </section>

      {/* Other Sections can go here (e.g., Services Highlights) */}
    </div>
  );
};

export default Home;
