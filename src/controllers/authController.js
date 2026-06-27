const jwt = require('jsonwebtoken');
const {
  AUTH_USERNAME,
  AUTH_PASSWORD,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
} = require('../config/auth');

/**
 * Generates a signed JWT access token containing the authenticated user.
 *
 * @param {Object} payload - Data to store inside the token.
 * @returns {string}
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
};

/**
 * Generates a signed JWT refresh token for long-lived session renewal.
 *
 * @param {Object} payload
 * @returns {string}
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
};

/**
 * Authenticates a username/password combo and returns access and refresh tokens.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>}
 */
const createToken = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    if (username !== AUTH_USERNAME || password !== AUTH_PASSWORD) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const payload = { username };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.json({ accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createToken,
};
