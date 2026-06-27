const express = require('express');
const router = express.Router();
const { createToken } = require('../controllers/authController');

/**
 * Authentication route for issuing JWT tokens.
 */
router.post('/token', createToken);

module.exports = router;
