import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const PricingContext = createContext();

export const usePricing = () => useContext(PricingContext);

export const PricingProvider = ({ children }) => {
  const [pricingData, setPricingData] = useState({
    country: 'India',
    currency: 'INR',
    symbol: '₹',
    exchangeRate: 1,
    prices: {
      voice: { 15: 2000, 30: 4000, 45: 6000, 60: 8000 },
      video: { 15: 4000, 30: 8000, 45: 12000, 60: 16000 }
    },
    loading: true
  });

  const fetchPricing = async (manualCurrency = null, manualCountry = null, manualSymbol = null) => {
    try {
      setPricingData(prev => ({ ...prev, loading: true }));
      // Using relative URL so it works in production with proxy, or fallback to localhost
      // Assuming Vite proxy or environment variable is setup. Let's use full URL if proxy isn't guaranteed.
      // Wait, let's use the same base URL approach as other services. Since we don't have the context of how frontend calls backend, usually it's '/api/...'. I will use '/api/pricing/convert'. Wait, the project doesn't have proxy in vite config. I'll use `http://localhost:5000/api/pricing/convert` for dev, or dynamically.
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      let url = `${API_URL}/api/pricing/convert`;
      
      const savedCountry = localStorage.getItem('selectedCountry');
      let queryParams = [];
      
      if (manualCurrency) {
        queryParams.push(`currency=${manualCurrency}&country=${manualCountry}&symbol=${manualSymbol}`);
      } else if (savedCountry) {
        const parsed = JSON.parse(savedCountry);
        queryParams.push(`currency=${parsed.currency}&country=${parsed.country}&symbol=${parsed.symbol}`);
      }
      
      if (queryParams.length > 0) {
        url += `?${queryParams[0]}`;
      }

      const { data } = await axios.get(url);
      
      setPricingData({
        country: data.country,
        currency: data.currency,
        symbol: data.symbol,
        exchangeRate: data.exchangeRate,
        prices: data.prices,
        loading: false
      });

      // Save to localStorage if it was auto-detected for the first time
      if (!manualCurrency && !savedCountry) {
        localStorage.setItem('selectedCountry', JSON.stringify({
          country: data.country,
          currency: data.currency,
          symbol: data.symbol
        }));
      }

    } catch (error) {
      console.error('Pricing fetch error:', error);
      setPricingData(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchPricing();
  }, []);

  const changeCountry = (country, currency, symbol) => {
    localStorage.setItem('selectedCountry', JSON.stringify({ country, currency, symbol }));
    fetchPricing(currency, country, symbol);
  };

  const getPrice = (type, duration, fallbackPrice) => {
    if (pricingData.prices && pricingData.prices[type] && pricingData.prices[type][duration]) {
      return pricingData.prices[type][duration];
    }
    return fallbackPrice;
  };

  return (
    <PricingContext.Provider value={{ ...pricingData, changeCountry, getPrice }}>
      {children}
    </PricingContext.Provider>
  );
};
