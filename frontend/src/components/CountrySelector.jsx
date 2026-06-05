import { useState, useRef, useEffect } from 'react';
import { FaSearch, FaChevronDown, FaGlobeAmericas } from 'react-icons/fa';

const CountrySelector = ({ countriesList, country, currency, onCountryChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const filteredCountries = countriesList.filter((c) =>
    c.country.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (c) => {
    onCountryChange(c);
    setIsOpen(false);
    setSearch('');
  };

  // Find current selected country object
  const currentCountry = countriesList.find((c) => c.country === country);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-transparent border border-sage-300 text-sage-800 text-sm rounded-lg px-3 py-2 cursor-pointer hover:border-darkGreen focus:ring-2 focus:ring-darkGreen focus:border-darkGreen transition-all outline-none min-w-[180px]"
        title="Change Country"
      >
        <FaGlobeAmericas className="text-sage-500 flex-shrink-0" />
        <span className="truncate max-w-[140px]">
          {currentCountry ? currentCountry.country : country}
        </span>
        <span className="text-sage-500 text-xs">({currency})</span>
        <FaChevronDown className={`text-sage-400 text-xs ml-auto transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-sage-200 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Search Input */}
          <div className="p-2.5 border-b border-sage-100">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-sage-400 text-xs" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search country..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-darkGreen focus:border-darkGreen bg-sage-50 placeholder:text-sage-400 transition-colors"
              />
            </div>
          </div>

          {/* Country List */}
          <ul className="max-h-60 overflow-y-auto py-1">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((c) => {
                const isSelected = c.country === country;
                return (
                  <li key={c.code}>
                    <button
                      type="button"
                      onClick={() => handleSelect(c)}
                      className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between gap-2 transition-colors ${
                        isSelected
                          ? 'bg-darkGreen/10 text-darkGreen font-medium'
                          : 'text-sage-800 hover:bg-sage-50'
                      }`}
                    >
                      <span className="truncate">{c.country}</span>
                      <span className="text-sage-500 text-xs flex-shrink-0">
                        {c.symbol} {c.currency}
                      </span>
                    </button>
                  </li>
                );
              })
            ) : (
              <li className="px-4 py-6 text-center text-sage-400 text-sm">
                No countries found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CountrySelector;
