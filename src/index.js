require('dotenv').config();
const app = require('./config/app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3000;

const { startOrderStatusJob } = require('./jobs/orderStatusJob');

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

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});
