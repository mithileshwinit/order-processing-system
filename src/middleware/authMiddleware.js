const jwt = require('jsonwebtoken');
const { ACCESS_TOKEN_SECRET } = require('../config/auth');

/**
 * Express middleware to verify a Bearer JWT access token.
 *
 * If the token is valid, the decoded payload is attached to req.user.
 * Otherwise a 401 response is returned.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
