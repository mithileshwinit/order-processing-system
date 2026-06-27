const Order = require('../models/Order');

/**
 * Interval length for the automated order promotion job.
 * This runs every five minutes and moves stale pending orders forward.
 *
 * @type {number}
 */
const STATUS_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Promotes all currently pending orders to processing.
 *
 * This business rule keeps orders moving through the workflow without
 * manual intervention for orders that remain pending too long.
 *
 * @returns {Promise<void>}
 */
const promotePendingOrders = async () => {
  const result = await Order.updateMany(
    { status: 'PENDING' },
    { status: 'PROCESSING' }
  );

  if (result.modifiedCount > 0) {
    console.log(`Promoted ${result.modifiedCount} order(s) from PENDING to PROCESSING`);
  }
};

/**
 * Starts the periodic order status updater job.
 *
 * @returns {NodeJS.Timeout} The interval timer handle, which can be cleared on shutdown.
 */
const startOrderStatusJob = () => {
  console.log('Starting order status background job');
  promotePendingOrders().catch((error) => {
    console.error('Error running order status job:', error);
  });

  const interval = setInterval(() => {
    promotePendingOrders().catch((error) => {
      console.error('Error running order status job:', error);
    });
  }, STATUS_UPDATE_INTERVAL);

  return interval;
};

module.exports = {
  startOrderStatusJob,
  promotePendingOrders,
};
