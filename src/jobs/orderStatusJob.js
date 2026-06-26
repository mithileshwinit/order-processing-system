const Order = require('../models/Order');

const STATUS_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes

const promotePendingOrders = async () => {
  const result = await Order.updateMany(
    { status: 'PENDING' },
    { status: 'PROCESSING' }
  );

  if (result.modifiedCount > 0) {
    console.log(`Promoted ${result.modifiedCount} order(s) from PENDING to PROCESSING`);
  }
};

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
