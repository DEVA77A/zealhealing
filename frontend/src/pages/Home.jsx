import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiCompass, 
  FiZap, 
  FiWind, 
  FiHeart, 
  FiShield, 
  FiAward,
  FiArrowRight,
  FiCalendar,
  FiUser
} from 'react-icons/fi';

/* ── Animation variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
  }),
};

/* ── Modality card ── */
const ModalityCard = ({ icon: Icon, title, desc, index }) => (
  <motion.div
    custom={index}
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-40px' }}
    style={{
      background: '#fff',
      border: '1px solid var(--clr-border)',
      borderRadius: 'var(--r-xl)',
      padding: '36px var(--space-8)',
      boxShadow: 'var(--shadow-sm)',
      transition: 'box-shadow 350ms var(--ease-out-expo), transform 350ms var(--ease-out-expo), border-color 350ms ease',
      cursor: 'default',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      position: 'relative',
      overflow: 'hidden',
    }}
    whileHover={{ 
      y: -6, 
      boxShadow: '0 20px 40px rgba(79,70,229,0.06)', 
      borderColor: 'var(--clr-forest-200)' 
    }}
  >
    {/* Subtle card glow */}
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
      background: 'linear-gradient(90deg, var(--clr-forest-500), var(--clr-forest-700))',
      opacity: 0,
      transition: 'opacity 300ms ease',
    }} className="card-top-line" />

    <div style={{
      width: 52, height: 52,
      borderRadius: 'var(--r-md)',
      background: 'var(--clr-forest-50)',
      border: '1.5px solid var(--clr-border-strong)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--clr-forest-700)',
      fontSize: '1.5rem',
      transition: 'all 300ms ease',
    }} className="icon-wrapper">
      <Icon style={{ strokeWidth: 1.5 }} />
    </div>

    <div>
      <h3 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '1.3125rem',
        fontWeight: 700,
        color: 'var(--clr-ink)',
        marginBottom: '10px',
        lineHeight: 1.2,
      }}>{title}</h3>
      <p style={{ 
        fontSize: '0.9375rem', 
        color: 'var(--clr-ink-muted)', 
        lineHeight: 1.7, 
        margin: 0 
      }}>{desc}</p>
    </div>
  </motion.div>
);

/* ── Testimonial card ── */
const TestimonialCard = ({ quote, author, role, index }) => (
  <motion.div
    custom={index}
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-30px' }}
    style={{
      background: '#fff',
      border: '1px solid var(--clr-border)',
      borderRadius: 'var(--r-xl)',
      padding: '40px',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      position: 'relative',
    }}
  >
    {/* Large elegant quote mark */}
    <div style={{
      position: 'absolute', top: '24px', right: '40px',
      fontSize: '5rem', fontFamily: 'var(--font-display)',
      color: 'var(--clr-forest-50)',
      lineHeight: 1, pointerEvents: 'none',
      userSelect: 'none',
      fontWeight: 800,
    }}>
      “
    </div>

    {/* Stars */}
    <div style={{ display: 'flex', gap: '4px', zIndex: 1 }}>
      {[...Array(5)].map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="var(--clr-forest-500)">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>

    <p style={{
      fontFamily: 'var(--font-body)',
      fontSize: '1rem',
      lineHeight: 1.75,
      color: 'var(--clr-ink-muted)',
      fontStyle: 'normal',
      margin: 0,
      zIndex: 1,
    }}>"{quote}"</p>

    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: 'auto', zIndex: 1 }}>
      <div style={{
        width: 44, height: 44,
        borderRadius: '50%',
        background: 'var(--clr-forest-50)',
        border: '1.5px solid var(--clr-border-strong)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-display)',
        fontSize: '1rem',
        fontWeight: 700,
        color: 'var(--clr-forest-700)',
        flexShrink: 0,
      }}>
        {author[0]}
      </div>
      <div>
        <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--clr-ink)', lineHeight: 1.2 }}>{author}</div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--clr-warm-gray)', marginTop: '2px' }}>{role}</div>
      </div>
    </div>
  </motion.div>
);

/* ── Stat Block ── */
const StatBlock = ({ value, label, index }) => (
  <div style={{ 
    flex: 1, 
    textAlign: 'center', 
    padding: '12px var(--space-4)',
    borderRight: index < 2 ? '1px solid var(--clr-border-strong)' : 'none' 
  }}>
    <div style={{
      fontFamily: 'var(--font-display)',
      fontSize: 'clamp(1.75rem, 3.5vw, 2.25rem)',
      fontWeight: 800,
      color: 'var(--clr-forest-700)',
      lineHeight: 1,
      letterSpacing: '-0.02em',
      marginBottom: '6px',
    }}>{value}</div>
    <div style={{ 
      fontSize: '0.8125rem', 
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: 'var(--clr-warm-gray)' 
    }}>{label}</div>
  </div>
);

/* ═══════════════════════════════════════
   HOME PAGE component
═══════════════════════════════════════ */
const Home = () => {
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const imageY = useTransform(scrollY, [0, 800], [0, 80]);

  const modalities = [
    { icon: FiCompass, title: 'Tarot & Angel Cards', desc: 'Gain profound clarity on your path through intuitive readings tailored to your unique energy.' },
    { icon: FiZap, title: 'Reiki Energy Healing', desc: 'Restore balance and harmony through channeled universal life force energy.' },
    { icon: FiWind, title: 'Sound Bowl Healing', desc: 'Experience deep relaxation through the harmonic resonance of singing bowls.' },
    { icon: FiHeart, title: 'Bach Flower Therapy', desc: 'Address emotional imbalances with natural flower essence remedies.' },
    { icon: FiShield, title: 'Lama Fera Healing', desc: 'Ancient Tibetan technique to cleanse negative energies and promote spiritual wellbeing.' },
    { icon: FiAward, title: 'Energized Crystals', desc: 'Curated, energetically charged crystals for protection, abundance, and growth.' },
  ];

  const testimonials = [
    {
      quote: 'My session completely transformed my perspective. The cards revealed truths I had been avoiding for years. I left with clarity and a renewed sense of purpose.',
      author: 'Priya Sharma', role: 'Bangalore, India',
    },
    {
      quote: 'The Reiki energy healing session was deeply profound. I could physically feel the blockages dissolving. Baghya\'s guidance is both gentle and powerful.',
      author: 'Ananya Krishnan', role: 'Chennai, India',
    },
    {
      quote: 'As someone skeptical of healing modalities, I was surprised by how much the tarot reading resonated. The accuracy was uncanny.',
      author: 'Ravi Menon', role: 'Kerala, India',
    },
  ];

  return (
    <div style={{ background: 'var(--clr-parchment)', overflowX: 'hidden' }}>

      {/* ═══════════════════════════════════
          HERO — Unified high-end design
      ═══════════════════════════════════ */}
      <section
        ref={heroRef}
        style={{
          minHeight: '100svh',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 'calc(var(--nav-h) + 60px) 24px 80px',
          overflow: 'hidden',
          background: 'var(--clr-parchment)',
        }}
      >
        {/* Parallax background cover image with soft overlay */}
        <motion.div style={{
          position: 'absolute', inset: 0,
          y: imageY,
          pointerEvents: 'none',
          zIndex: 0,
        }}>
          <img
            src="/hero-bg.png"
            alt=""
            aria-hidden="true"
            style={{
              width: '100%',
              height: '115%',
              objectFit: 'cover',
              opacity: 0.12,
            }}
          />
        </motion.div>

        {/* Ambient Glowing Blobs to feel expensive */}
        <div style={{
          position: 'absolute', top: '15%', left: '10%',
          width: '450px', height: '450px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0) 70%)',
          filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0,
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '15%',
          width: '350px', height: '350px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, rgba(139, 92, 246, 0) 70%)',
          filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0,
        }} />

        {/* Hero content container */}
        <div style={{ 
          maxWidth: '860px', 
          margin: '0 auto', 
          textAlign: 'center', 
          position: 'relative', 
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          {/* Eyebrow Label badge */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ marginBottom: '24px' }}
          >
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '99px',
              background: 'var(--clr-forest-50)',
              border: '1.5px solid var(--clr-border-strong)',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--clr-forest-700)',
            }}>
              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--clr-forest-500)' }} />
              Spiritual Catalyst & Energy Healing Sanctuary
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 6.5vw, 4.75rem)',
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              color: 'var(--clr-ink)',
              marginBottom: '24px',
              maxWidth: '800px',
            }}
          >
            Discover Your{' '}
            <span style={{ 
              background: 'linear-gradient(135deg, var(--clr-forest-700) 0%, var(--clr-forest-500) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Spiritual Path
            </span>
          </motion.h1>

          {/* Subheading text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(1.0625rem, 2vw, 1.25rem)',
              lineHeight: 1.7,
              color: 'var(--clr-ink-muted)',
              marginBottom: '40px',
              maxWidth: '620px',
            }}
          >
            A curated sanctuary for healing, meditation, and inner guidance — crafted with intention and deep reverence for the spiritual arts.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ 
              display: 'flex', 
              gap: '16px', 
              justifyContent: 'center', 
              flexWrap: 'wrap',
              marginBottom: '60px',
            }}
          >
            <Link to="/sessions">
              <motion.button
                whileHover={{ scale: 1.02, translateY: -1 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary"
                style={{ height: 54, padding: '0 32px', fontSize: '1rem' }}
              >
                <FiCalendar style={{ marginRight: '8px' }} /> Book a Session
              </motion.button>
            </Link>
            <Link to="/classes">
              <motion.button
                whileHover={{ scale: 1.02, translateY: -1 }}
                whileTap={{ scale: 0.98 }}
                className="btn-secondary"
                style={{ height: 54, padding: '0 32px', fontSize: '1rem' }}
              >
                Explore Classes <FiArrowRight style={{ marginLeft: '8px' }} />
              </motion.button>
            </Link>
          </motion.div>

          {/* Floating Glass Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: '100%',
              maxWidth: '750px',
              background: 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: 'var(--r-xl)',
              border: '1.5px solid var(--clr-border-strong)',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              padding: '16px 20px',
            }}
          >
            {[
              { value: '500+', label: 'Sessions Guided' },
              { value: '20+ Yrs', label: 'Eldest Experience' },
              { value: '100%', label: 'Satisfied Souls' },
            ].map((stat, i) => (
              <StatBlock key={i} {...stat} index={i} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          MODALITIES GRID — elegant and airy
      ═══════════════════════════════════ */}
      <section style={{ 
        padding: 'clamp(80px, 10vw, 140px) 24px', 
        background: 'var(--clr-linen)', 
        borderTop: '1px solid var(--clr-border)' 
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Section Heading */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-end', 
            flexWrap: 'wrap', 
            gap: '24px',
            marginBottom: '60px' 
          }}>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <span className="eyebrow" style={{ marginBottom: '16px' }}>
                TRANSFORMATIVE MODALITIES
              </span>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.25rem, 4.5vw, 3.25rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: 'var(--clr-ink)',
                lineHeight: 1.1,
                maxWidth: '600px',
              }}>
                Our Sacred Healing Arts
              </h2>
            </motion.div>
            
            <motion.p 
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              style={{ 
                fontSize: '1.0625rem', 
                color: 'var(--clr-warm-gray)', 
                maxWidth: '400px', 
                lineHeight: 1.7,
                margin: 0
              }}
            >
              Discover curated ancient technologies and intuitive fields designed to restore somatic harmony and crystal clear vision.
            </motion.p>
          </div>

          {/* Grid Layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px',
          }}>
            {modalities.map((m, i) => (
              <ModalityCard key={i} {...m} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          FOUNDER BIO — luxurious presentation
      ═══════════════════════════════════ */}
      <section style={{
        background: 'var(--clr-parchment)',
        borderTop: '1px solid var(--clr-border)',
        borderBottom: '1px solid var(--clr-border)',
        padding: '0',
        overflow: 'hidden',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          alignItems: 'center',
          gap: '0',
        }}>
          {/* Image Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ 
              position: 'relative', 
              overflow: 'hidden', 
              padding: '24px',
              alignSelf: 'stretch',
              display: 'flex',
            }}
          >
            <div style={{
              width: '100%',
              borderRadius: 'var(--r-xl)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
              position: 'relative',
            }}>
              <img
                src="/founder.jpg"
                alt="Baghya Ashok — Founder of Zeal Healing"
                style={{
                  width: '100%',
                  height: '100%',
                  minHeight: '480px',
                  objectFit: 'cover',
                  objectPosition: 'center 20%',
                  display: 'block',
                }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0) 50%)',
              }} />
              {/* Image Floating Title Tag */}
              <div style={{
                position: 'absolute', bottom: '24px', left: '24px', right: '24px',
                padding: '20px',
                background: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderRadius: 'var(--r-lg)',
                border: '1px solid rgba(255,255,255,0.6)',
                boxShadow: 'var(--shadow-md)',
              }}>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--clr-ink)', lineHeight: 1.2 }}>Baghya Ashok</div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--clr-forest-700)', marginTop: '4px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Founder · Reiki Grand Master</div>
              </div>
            </div>
          </motion.div>

          {/* Narrative Content */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            style={{ padding: 'clamp(48px, 6vw, 96px) clamp(24px, 5vw, 64px)' }}
          >
            <span className="eyebrow" style={{ marginBottom: '20px' }}>
              OUR FOUNDER'S VOW
            </span>

            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.025em',
              color: 'var(--clr-ink)',
              marginBottom: '20px',
            }}>
              Decades of Devotion to Energy Alchemy
            </h2>

            <p style={{ fontSize: '1.0625rem', lineHeight: 1.75, color: 'var(--clr-ink-muted)', marginBottom: '20px' }}>
              Baghya Ashok is a certified <strong style={{ color: 'var(--clr-ink)', fontWeight: 700 }}>Reiki Grand Master</strong> and premier Tarot Consultant. Under her guidance, Zeal Healing has bloomed into a globally trusted refuge for deep soul retrieval, energetic realignments, and life guidance.
            </p>

            <blockquote style={{
              borderLeft: '4px solid var(--clr-forest-500)',
              paddingLeft: '24px',
              margin: '32px 0',
            }}>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.125rem',
                lineHeight: 1.65,
                color: 'var(--clr-ink)',
                fontStyle: 'italic',
                fontWeight: 500,
                margin: 0,
              }}>
                "Your energy is an ancient landscape. We don't change who you are; we simply remove the clouds so your internal sky can shine clearly."
              </p>
            </blockquote>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link to="/about">
                <button className="btn-primary" style={{ height: 48, padding: '0 24px' }}>
                  Read Our Story
                </button>
              </Link>
              <Link to="/sessions">
                <button className="btn-secondary" style={{ height: 48, padding: '0 24px' }}>
                  <FiUser style={{ marginRight: '8px' }} /> Connect with Baghya
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          CLIENT STORIES
      ═══════════════════════════════════ */}
      <section style={{ 
        padding: 'clamp(80px, 10vw, 140px) 24px', 
        background: 'var(--clr-linen)' 
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{ marginBottom: '60px', textAlign: 'center' }}
          >
            <span className="eyebrow" style={{ marginBottom: '16px' }}>
              CLIENT TESTIMONIALS
            </span>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.25rem, 4vw, 3.25rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'var(--clr-ink)',
              lineHeight: 1.1,
            }}>
              Voices of True Transformation
            </h2>
          </motion.div>

          {/* Testimonial Cards Layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px',
          }}>
            {testimonials.map((t, i) => (
              <TestimonialCard key={i} {...t} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          CTA BANNER CARD — luxurious Slate/Indigo card
      ═══════════════════════════════════ */}
      <section style={{
        padding: '0 24px clamp(80px, 10vw, 140px)',
        background: 'var(--clr-linen)',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            background: 'var(--clr-forest-900)',
            borderRadius: 'var(--r-2xl)',
            overflow: 'hidden',
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            alignItems: 'center',
            boxShadow: 'var(--shadow-xl)',
          }}
        >
          {/* Subtle nature background asset overlay */}
          <img
            src="/hero-bg.png"
            alt=""
            aria-hidden="true"
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              opacity: 0.12,
              mixBlendMode: 'overlay',
            }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.45) 0%, rgba(15, 23, 42, 0.9) 100%)',
          }} />

          {/* Ambient Purple radial mesh */}
          <div style={{
            position: 'absolute', top: '-10%', right: '-5%',
            width: '400px', height: '400px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.22) 0%, rgba(99,102,241,0) 70%)',
            pointerEvents: 'none',
          }} />

          {/* Copy Side */}
          <div style={{ position: 'relative', zIndex: 1, padding: 'clamp(48px, 6vw, 80px) clamp(32px, 5vw, 64px)' }}>
            <div style={{
              fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: 'var(--clr-forest-400)',
              marginBottom: '16px',
            }}>
              TRANSFORMATION STARTS HERE
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 3.5vw, 3rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.025em',
              color: '#fff',
              marginBottom: '20px',
              maxWidth: '520px',
            }}>
              Your Inner Balance is Waiting
            </h2>
            <p style={{
              fontSize: '1.0625rem',
              color: 'rgba(255,255,255,0.65)',
              lineHeight: 1.7,
              maxWidth: '430px',
              margin: 0,
            }}>
              Whether seeking immediate mental relief, custom crystals, or certification classes, let's light up your cosmic path with absolute clarity.
            </p>
          </div>

          {/* Actions Side */}
          <div style={{
            position: 'relative', zIndex: 1,
            padding: 'clamp(48px, 6vw, 80px) clamp(32px, 5vw, 64px)',
            display: 'flex', flexDirection: 'column', gap: '16px',
            alignItems: 'flex-start',
          }}>
            <Link to="/sessions" style={{ width: '100%', maxWidth: '280px' }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%', height: 54, padding: '0 32px',
                  background: '#fff', color: 'var(--clr-forest-900)',
                  border: 'none', borderRadius: 'var(--r-md)',
                  fontFamily: 'var(--font-body)', fontSize: '1rem', fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  transition: 'all 280ms ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                <FiCalendar /> Book a Consultation
              </motion.button>
            </Link>
            <Link to="/about" style={{ width: '100%', maxWidth: '280px' }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%', height: 54, padding: '0 32px',
                  background: 'rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.9)',
                  border: '1.5px solid rgba(255,255,255,0.16)',
                  borderRadius: 'var(--r-md)',
                  fontFamily: 'var(--font-body)', fontSize: '1rem', fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 280ms ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                Learn Our Philosophy
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
