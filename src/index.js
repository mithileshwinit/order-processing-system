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

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });

    process.on('SIGINT', () => {
      console.log('Shutting down gracefully...');
      clearInterval(interval);
      process.exit(0);
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
