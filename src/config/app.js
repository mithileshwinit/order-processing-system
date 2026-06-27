const express = require('express');
const ordersRouter = require('../routes/orders');
const authRouter = require('../routes/auth');
const healthRouter = require('../routes/health');
const authenticateToken = require('../middleware/authMiddleware');
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

const app = express();

/**
 * Express middleware that parses incoming JSON request bodies.
 * This is required for the order API to receive structured payloads.
 */
app.use(express.json());

app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    url: req.originalUrl,
  });
  next();
});

/**
 * Health check route used by deployment platforms and monitoring systems.
 */
app.use('/health', healthRouter);

/**
 * Authentication routes are public and do not require an existing token.
 */
app.use('/api/auth', authRouter);

/**
 * Protect all order routes with JWT authentication.
 * Clients must send a valid `Authorization: Bearer <token>` header.
 */
app.use('/orders', authenticateToken, ordersRouter);

/**
 * Fallback route handler for unknown endpoints.
 * Returns a 404 response so clients clearly know the route is invalid.
 */
app.use((req, res, next) => {
  next(new AppError('Route not found', 404));
});

/**
 * Global error handler for Express.
 * Sends a standardized JSON error response for any thrown error.
 *
 * @param {Error & {status?: number}} err - The error raised by route handlers.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  logger.error('Request failed', {
    statusCode,
    message,
    path: req.originalUrl,
    method: req.method,
  });

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

module.exports = app;
