const express = require('express');
const router = express.Router();

/**
 * Simple health endpoint used by load balancers and deployment platforms.
 */
router.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: "Order Processing API is running",
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
