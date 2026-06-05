import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaMoon, FaSun, FaSeedling, FaBookOpen, FaHandSparkles, FaBell, FaGem } from 'react-icons/fa';

const expertiseData = [
  {
    icon: <FaMoon className="text-3xl" />,
    title: 'Full Moon Day Healing Sessions',
    description:
      'Baghya conducts powerful healing sessions on full moon days, leveraging the heightened energy during this time. These sessions are designed to help individuals release negativity, manifest their desires, and experience deep spiritual cleansing.',
  },
  {
    icon: <FaSun className="text-3xl" />,
    title: 'Brahmamuhurta Healing Sessions',
    description:
      'She organizes early morning healing sessions during the sacred Brahmamuhurta (the pre-dawn hours). This time is considered highly auspicious for spiritual practices, and her sessions focus on enhancing mental clarity, peace, and spiritual growth.',
  },
  {
    icon: <FaSeedling className="text-3xl" />,
    title: 'Bach Flower Medicine Certified Practitioner',
    description:
      'Baghya is certified in Bach Flower Therapy, a natural remedy system that uses flower essences to balance emotions and improve mental well-being. She provides personalized Bach Flower consultations to support emotional healing.',
  },
  {
    icon: <FaBookOpen className="text-3xl" />,
    title: 'Angel Card & Tarot Card Reading Classes with Certification',
    description:
      'Baghya teaches comprehensive Angel Card and Tarot Card reading courses. These classes are designed for beginners and advanced learners, equipping them with the skills to interpret cards and provide readings. Participants receive certificates upon completion.',
  },
  {
    icon: <FaHandSparkles className="text-3xl" />,
    title: 'Renowned Lama Fera Healer',
    description:
      'Baghya is a skilled practitioner of Lama Fera, a Tibetan healing technique known for its ability to cleanse negativity and promote physical, emotional, and spiritual healing.',
  },
  {
    icon: <FaBell className="text-3xl" />,
    title: 'Expert in Singing Bowl Sound Healing',
    description:
      'She specializes in sound healing using singing bowls. These sessions use harmonic vibrations to induce relaxation, reduce stress, and promote overall well-being.',
  },
  {
    icon: <FaGem className="text-3xl" />,
    title: 'Energized Crystals',
    description:
      'Baghya gives energized crystals online in various forms, including jewelry, clusters, and tumbled stones. These crystals are infused with healing energy and tailored to her followers\' specific needs, helping them attract positivity, prosperity, and spiritual growth.',
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const About = () => {
  return (
    <div className="bg-sage-50 min-h-screen">
      {/* ─── Hero Banner ─── */}
      <section className="relative h-[70vh] min-h-[480px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/about-hero.png"
            alt="Zeal Healing spiritual atmosphere"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-sage-900/60 via-sage-900/40 to-sage-50" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="relative z-10 text-center px-4 max-w-3xl"
        >
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4 drop-shadow-lg leading-tight">
            About Us
          </h1>
          <p className="text-lg md:text-xl text-white/90 font-medium leading-relaxed drop-shadow-md">
            Discover the heart behind Zeal Healing &mdash; a sanctuary dedicated to holistic well-being and spiritual growth.
          </p>
        </motion.div>
      </section>

      {/* ─── Founder Section ─── */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeInUp}
            custom={0.2}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="inline-block text-sm font-semibold uppercase tracking-widest text-darkGreen mb-3">
              Our Founder
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-sage-900 mb-6 leading-tight">
              Baghya Ashok
            </h2>
            <div className="w-16 h-1 bg-darkGreen rounded-full mb-8 mx-auto" />
            <p className="text-sage-800 text-lg leading-relaxed mb-6">
              Baghya Ashok is a distinguished <strong className="text-sage-900">Reiki Grand Master</strong> and a premier <strong className="text-sage-900">Tarot and Angel Card reader</strong> based in Navi Mumbai, India. She is the founder, director, and CEO of Zeal Healing, an organization dedicated to promoting well-being through various healing modalities.
            </p>
            <p className="text-sage-700 leading-relaxed">
              With years of profound experience in energy healing, spiritual consultation, and holistic wellness, Baghya has empowered countless individuals on their journey toward inner peace, clarity, and transformation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── Expertise Section ─── */}
      <section className="py-20 md:py-28 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <span className="inline-block text-sm font-semibold uppercase tracking-widest text-darkGreen mb-3">
              What We Offer
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-sage-900 mb-4">
              Baghya Ashok's Expertise
            </h2>
            <div className="w-16 h-1 bg-darkGreen rounded-full mx-auto mt-4 mb-6" />
            <p className="text-sage-700 max-w-2xl mx-auto text-lg leading-relaxed">
              Explore a wide range of healing modalities and spiritual services, each crafted to nurture your mind, body, and soul.
            </p>
          </motion.div>

          {/* Expertise Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {expertiseData.map((item, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={fadeInUp}
                custom={index}
                className="group"
              >
                <div className="h-full bg-white rounded-2xl p-8 shadow-sm border border-sage-100 transition-all duration-300 hover:shadow-xl hover:border-darkGreen/20 hover:-translate-y-1">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-sage-100 flex items-center justify-center text-darkGreen mb-5 transition-all duration-300 group-hover:bg-darkGreen group-hover:text-white group-hover:shadow-lg group-hover:shadow-darkGreen/20">
                    {item.icon}
                  </div>
                  {/* Title */}
                  <h3 className="text-xl font-serif font-bold text-sage-900 mb-3 leading-snug">
                    {item.title}
                  </h3>
                  {/* Description */}
                  <p className="text-sage-700 leading-relaxed text-[0.95rem]">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Mission / Values Strip ─── */}
      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeInUp}
            className="text-center mb-14"
          >
            <span className="inline-block text-sm font-semibold uppercase tracking-widest text-darkGreen mb-3">
              Our Mission
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-sage-900 mb-4">
              Why Zeal Healing?
            </h2>
            <div className="w-16 h-1 bg-darkGreen rounded-full mx-auto mt-4" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                number: '01',
                heading: 'Holistic Approach',
                text: 'We address the whole person — mind, body, and spirit — through time-tested healing modalities from around the world.',
              },
              {
                number: '02',
                heading: 'Certified Expertise',
                text: 'All our practices are backed by years of training, certifications, and real-world experience helping thousands of individuals.',
              },
              {
                number: '03',
                heading: 'Personal Transformation',
                text: 'Every session, class, and crystal is designed to empower you on your unique journey toward inner peace and spiritual awakening.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={fadeInUp}
                custom={i}
                className="relative bg-gradient-to-br from-sage-100/70 to-white rounded-2xl p-8 border border-sage-200/60 overflow-hidden group hover:shadow-lg transition-shadow duration-300"
              >
                <span className="absolute -top-4 -right-2 text-[7rem] font-serif font-bold text-sage-200/40 leading-none select-none pointer-events-none group-hover:text-darkGreen/10 transition-colors duration-500">
                  {item.number}
                </span>
                <h3 className="text-xl font-serif font-bold text-sage-900 mb-3 relative z-10">
                  {item.heading}
                </h3>
                <p className="text-sage-700 leading-relaxed relative z-10">
                  {item.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="py-20 md:py-24 bg-darkGreen relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="max-w-3xl mx-auto text-center px-4 relative z-10"
        >
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight">
            Begin Your Healing Journey Today
          </h2>
          <p className="text-white/80 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
            Whether you seek clarity through Tarot, peace through Reiki, or transformation through sound healing — we're here to guide you every step of the way.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/sessions">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="bg-white text-darkGreen px-8 py-3.5 rounded-full font-semibold text-lg transition-all hover:shadow-xl hover:shadow-white/20"
              >
                Book a Session
              </motion.button>
            </Link>
            <Link to="/classes">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="border-2 border-white/40 text-white px-8 py-3.5 rounded-full font-semibold text-lg transition-all hover:bg-white/10 hover:border-white/60"
              >
                Explore Classes
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default About;
