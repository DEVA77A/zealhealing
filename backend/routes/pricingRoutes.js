const express = require('express');
const router = express.Router();
const { detectUserLocation, convertPrices } = require('../controllers/pricingController');

router.get('/detect', detectUserLocation);
router.get('/convert', convertPrices);

module.exports = router;
