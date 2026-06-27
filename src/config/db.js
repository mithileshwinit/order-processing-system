const mongoose = require('mongoose');

/**
 * Connects the application to MongoDB using the configured environment URI.
 *
 * This function centralizes database connection logic and ensures
 * the app does not start until MongoDB is reachable.
 *
 * @returns {Promise<void>}
 * @throws {Error} When `MONGO_URI` is missing or connection fails.
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log('Connected to MongoDB');
};

const db = mongoose.connection;
db.on('connected', () => console.log('✅ MongoDB connection established'));
db.on('disconnected', () => console.warn('⚠️ MongoDB disconnected'));
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

module.exports = connectDB;
