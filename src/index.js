require('dotenv').config();
const app = require('./config/app');
const connectDB = require('./config/db');
const { startOrderStatusJob } = require('./jobs/orderStatusJob');

const PORT = process.env.PORT || 3000;

/**
 * Starts the Express API server after establishing a MongoDB connection.
 *
 * This entrypoint initializes application configuration, begins the
 * background order status updater, and gracefully shuts down on SIGINT.
 */
async function startServer() {
  try {
    await connectDB();
    const interval = startOrderStatusJob();

    const server = app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(
          `Port ${PORT} is already in use. Please free the port or set a different PORT in .env.`
        );
      } else {
        console.error('Server error:', error);
      }
      clearInterval(interval);
      process.exit(1);
    });

    process.on('SIGINT', () => {
      console.log('Shutting down gracefully...');
      clearInterval(interval);
      server.close(() => process.exit(0));
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

/**
 * Handles unhandled promise rejections at the process level to avoid
 * silent failures and ensure the application exits cleanly.
 *
 * @param {unknown} reason - The rejection reason value.
 */
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});
