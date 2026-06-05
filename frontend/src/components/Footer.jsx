import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaYoutube, FaMapMarkerAlt, FaEnvelope, FaPhoneAlt, FaArrowRight } from 'react-icons/fa';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    // Placeholder – wire up to your newsletter backend later
    if (email) {
      alert('Thanks for subscribing!');
      setEmail('');
    }
  };

  return (
    <footer className="bg-white border-t border-gray-200">
      {/* ─── Main Footer Grid ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* ── Subscribe to our emails ── */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              Subscribe to our emails
            </h4>
            <p className="text-sm text-gray-600 leading-relaxed mb-5">
              Be the first to know about new collections and exclusive offers.
            </p>

            <form onSubmit={handleSubscribe} className="relative mb-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-400 rounded-full pl-5 pr-12 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-gray-900 transition-colors bg-transparent"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Subscribe"
              >
                <FaArrowRight className="text-sm" />
              </button>
            </form>

            <p className="text-xs text-gray-500 leading-relaxed">
              By subscribing you agree to the{' '}
              <Link to="/terms" className="underline hover:text-gray-900 transition-colors">
                Terms of Use
              </Link>{' '}
              &amp;{' '}
              <Link to="/privacy" className="underline hover:text-gray-900 transition-colors">
                Privacy Policy
              </Link>.
            </p>
          </div>

          {/* ── Quick Links ── */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              Quick links
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Privacy Policy', to: '/privacy' },
                { label: 'Refund Policy', to: '/refund' },
                { label: 'Terms of Service', to: '/terms' },
                { label: 'Shipping Policy', to: '/shipping' },
                { label: 'Contact', to: '/contact' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact Us ── */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              Contact Us
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-gray-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600 leading-relaxed">
                  19/10A Thiruchengode, AS Pettai, Namakkal
                </span>
              </li>
              <li className="flex items-center gap-3">
                <FaEnvelope className="text-gray-500 flex-shrink-0" />
                <a
                  href="mailto:baghyazeal@gmail.com"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  baghyazeal@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FaPhoneAlt className="text-gray-500 flex-shrink-0" />
                <a
                  href="tel:+919324175883"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  +919324175883
                </a>
              </li>
            </ul>
          </div>

          {/* ── Logo ── */}
          <div className="flex items-start justify-center lg:justify-end">
            <Link to="/" className="block">
              <img
                src="/logo.png"
                alt="Zeal Healing Logo"
                className="w-36 h-36 object-contain"
              />
            </Link>
          </div>

        </div>
      </div>

      {/* ─── Bottom Bar ─── */}
      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Social Icons */}
          <div className="flex items-center gap-5">
            <a
              href="https://www.facebook.com/baghyazealhealing/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-gray-900 transition-colors"
              aria-label="Facebook"
            >
              <FaFacebookF className="text-lg" />
            </a>
            <a
              href="https://www.instagram.com/zeal_healing/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-gray-900 transition-colors"
              aria-label="Instagram"
            >
              <FaInstagram className="text-lg" />
            </a>
            <a
              href="https://www.youtube.com/@zealhealingtamil"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-gray-900 transition-colors"
              aria-label="YouTube"
            >
              <FaYoutube className="text-lg" />
            </a>
          </div>

          {/* Copyright */}
          <p className="text-sm text-gray-500">
            Zeal Healing © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
