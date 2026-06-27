const express = require('express');
const ordersRouter = require('../routes/orders');

const app = express();

/**
 * Express middleware that parses incoming JSON request bodies.
 * This is required for the order API to receive structured payloads.
 */
app.use(express.json());

/**
 * Mounts the order routes at `/orders`.
 * All CRUD operations and status updates are handled by this router.
 */
app.use('/orders', ordersRouter);

/**
 * Fallback route handler for unknown endpoints.
 * Returns a 404 response so clients clearly know the route is invalid.
 */
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
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
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

module.exports = app;
