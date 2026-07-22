import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const expertiseData = [
  {
    icon: '🔮',
    title: 'Full Moon Day Healing Sessions',
    description:
      'Baghya conducts powerful healing sessions on full moon days, leveraging the heightened energy during this time. These sessions help individuals release negativity, manifest desires, and experience deep spiritual cleansing.',
  },
  {
    icon: '🌅',
    title: 'Brahmamuhurta Healing Sessions',
    description:
      'Early morning healing sessions during the sacred pre-dawn hours (Brahmamuhurta). This time is considered highly auspicious for spiritual alignment, mental clarity, and internal calm.',
  },
  {
    icon: '🌸',
    title: 'Bach Flower Medicine certified',
    description:
      'Qualified in Bach Flower Therapy, a natural remedy system that uses flower essences to balance emotions, resolve deep inner stress, and improve mental and emotional alignment.',
  },
  {
    icon: '🃏',
    title: 'Angel Card & Tarot Readings',
    description:
      'Baghya teaches comprehensive interpretive reading systems. The course certifies participants on completion to offer professional energy readings and divine translation.',
  },
  {
    icon: '✨',
    title: 'Lama Fera healing practitioner',
    description:
      'Mastery in Lama Fera, a powerful ancient Tibetan system designed to actively clear negative fields and restore physical, emotional, and spiritual balance.',
  },
  {
    icon: '🔔',
    title: 'Singing Bowl sound restoration',
    description:
      'Harnessing custom harmonic resonance and acoustic frequencies to guide brainwaves, dissolve physical stress, and introduce deep energetic restoration.',
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
};

const About = () => {
  return (
    <div style={{ background: 'var(--clr-parchment)', minHeight: '100svh' }}>
      
      {/* ── Custom CSS Injection ── */}
      <style dangerouslySetInnerHTML={{__html: `
        .founder-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 60px;
          align-items: center;
        }
        .founder-image-wrapper {
          position: relative;
          border-radius: var(--r-2xl);
          overflow: hidden;
          width: 100%;
          max-width: 380px;
          aspect-ratio: 3/4;
          border: 1px solid var(--clr-border);
          box-shadow: var(--shadow-md);
          justify-self: center;
        }
        @media (max-width: 992px) {
          .founder-grid {
            grid-template-columns: 1fr;
            gap: 40px;
            text-align: center;
          }
          .founder-image-wrapper {
            max-width: 320px;
            margin: 0 auto;
          }
        }
      `}} />
      
      {/* ─── Hero Section ─── */}
      <section style={{
        position: 'relative',
        height: '60vh',
        minHeight: '440px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: 'var(--clr-forest-900)',
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url("/about-hero.png")', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.4)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, var(--clr-parchment))' }} />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 24px', maxWidth: '800px' }}
        >
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', fontWeight: 500, color: 'var(--clr-ink)', letterSpacing: '-0.02em', marginBottom: '16px' }}>
            Our Sanctuary
          </h1>
          <p style={{ fontSize: '1.0625rem', color: 'var(--clr-ink-muted)', lineHeight: 1.6, maxWidth: '580px', margin: '0 auto' }}>
            Learn about Zeal Healing: an editorial space curated to guide the modern seeker toward internal resonance, light, and restoration.
          </p>
        </motion.div>
      </section>

      {/* ─── Founder Spotlight ─── */}
      <section style={{ padding: '80px 24px 100px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div className="founder-grid">
            
            {/* Image Column */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}
            >
              <div className="founder-image-wrapper">
                <img 
                  src="/founder.jpg" 
                  alt="Baghya Ashok - Founder of Zeal Healing" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 15%' }}
                />
              </div>
            </motion.div>

            {/* Content Column */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={fadeInUp}
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
            >
              <span className="section-eyebrow" style={{ marginBottom: '12px' }}>
                MEET THE FOUNDER
              </span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.75rem', fontWeight: 500, color: 'var(--clr-ink)', letterSpacing: '-0.02em', marginBottom: '24px' }}>
                Baghya Ashok
              </h2>
              <p style={{ fontSize: '1rem', color: 'var(--clr-ink-muted)', lineHeight: 1.75, marginBottom: '20px' }}>
                Baghya Ashok is a distinguished <strong style={{ color: 'var(--clr-ink)', fontWeight: 600 }}>Reiki Grand Master</strong> and a premier <strong style={{ color: 'var(--clr-ink)', fontWeight: 600 }}>Tarot and Angel Card reader</strong> based in Navi Mumbai. She founded, directs, and leads Zeal Healing as a space focused on energy transformation.
              </p>
              <p style={{ fontSize: '0.9375rem', color: 'var(--clr-warm-gray)', lineHeight: 1.7, fontStyle: 'italic' }}>
                "We hold the path to restoration deep inside ourselves. Healing is simply a matter of identifying the resonance that unlocks that path. Through reiki, crystals, and intuitive tarot, we help you clear the static to reveal your authentic inner wisdom."
              </p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ─── Experience and Offerings ─── */}
      <section style={{ background: '#fff', borderTop: '1px solid var(--clr-border)', borderBottom: '1px solid var(--clr-border)', padding: '100px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <span className="section-eyebrow" style={{ marginBottom: '12px' }}>Our Disciplines</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.75rem', fontWeight: 500, color: 'var(--clr-ink)', letterSpacing: '-0.02em', marginBottom: '16px' }}>
              Expertise & Modalities
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--clr-warm-gray)', maxWidth: '580px', margin: '0 auto', lineHeight: 1.6 }}>
              A handpicked selection of spiritual practices designed to restore emotional, mental, and energetic balance.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {expertiseData.map((item, idx) => (
              <motion.div
                key={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={fadeInUp}
                custom={idx}
                style={{
                  background: 'var(--clr-parchment)',
                  border: '1px solid var(--clr-border)',
                  borderRadius: 'var(--r-xl)',
                  padding: '36px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{
                  width: 48, height: 48,
                  borderRadius: 'var(--r-lg)',
                  background: '#fff',
                  border: '1px solid var(--clr-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.25rem',
                }}>
                  {item.icon}
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 500, color: 'var(--clr-ink)', marginBottom: '8px' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--clr-warm-gray)', lineHeight: 1.6 }}>
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── Philosophy pillars ─── */}
      <section style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <span className="section-eyebrow" style={{ marginBottom: '12px' }}>OUR PHILOSOPHY</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.75rem', fontWeight: 500, color: 'var(--clr-ink)', letterSpacing: '-0.02em' }}>
              Why Choose Zeal Healing?
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {[
              {
                id: '01',
                title: 'Holistic alignment',
                desc: 'We address the soul, the intelligence, and the biology in tandem, realizing that true health and clarity starts from a unified core.',
              },
              {
                id: '02',
                title: 'Certified guidance',
                desc: 'Years of professional initiation, credentials, and practice with thousands of seekers ensure consistent, safe, and deeply felt energy work.',
              },
              {
                id: '03',
                title: 'Personalized integration',
                desc: 'Each session, custom crystal, or course certificate is individually tuned to validate and scale with your specific path and timeline.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={fadeInUp}
                custom={i}
                style={{
                  background: '#fff',
                  border: '1px solid var(--clr-border)',
                  borderRadius: 'var(--r-xl)',
                  padding: '40px',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <span style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-10px',
                  fontSize: '5.5rem',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  color: 'var(--clr-forest-50)',
                  lineHeight: 1,
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}>
                  {item.id}
                </span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 500, color: 'var(--clr-ink)', marginBottom: '12px', position: 'relative', zIndex: 1 }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--clr-warm-gray)', lineHeight: 1.6, position: 'relative', zIndex: 1 }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── Call to Action ─── */}
      <section style={{
        background: 'var(--clr-forest-900)',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
        padding: '100px 24px',
        textAlign: 'center',
      }}>
        {/* Glow */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(165,214,167,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '720px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 500, color: '#fff', letterSpacing: '-0.02em', marginBottom: '20px' }}>
            Initiate Your Session
          </h2>
          <p style={{ fontSize: '1.0625rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: '40px' }}>
            Book an intuitive reading, reserve a space in our upcoming certified crystal classes, or find balance through custom energy alignments.
          </p>
          <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
            <Link to="/sessions">
              <button className="btn-primary" style={{ background: '#fff', color: 'var(--clr-forest-900)', padding: '0 32px' }}>
                Consultations
              </button>
            </Link>
            <Link to="/classes">
              <button className="btn-secondary" style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#fff', padding: '0 32px' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
              >
                Explore Classes
              </button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;
