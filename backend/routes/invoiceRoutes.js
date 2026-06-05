const express = require('express');
const { generateInvoice } = require('../controllers/invoiceController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:bookingId', protect, generateInvoice); // Open or protected based on requirement (usually protected but keeping open for easy download link)

module.exports = router;
