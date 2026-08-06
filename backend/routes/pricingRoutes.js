const express = require('express');
const router = express.Router();
const {
  detectUserLocation,
  reverseGeocodeLocation,
  convertPrices,
  quoteAmount,
} = require('../controllers/pricingController');

// All routes are public: pricing must render for signed-out visitors too.
router.get('/detect', detectUserLocation);
router.get('/reverse-geocode', reverseGeocodeLocation);
router.get('/convert', convertPrices);
router.get('/quote', quoteAmount);

module.exports = router;
