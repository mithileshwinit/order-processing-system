const Order = require('../models/Order');

const createOrder = async (req, res, next) => {
  try {
    const { customerName, customerEmail, items } = req.body;
    const order = new Order({ customerName, customerEmail, items });
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    next(error);
  }
};

const listOrders = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status.toUpperCase();
    }
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const normalizedStatus = status.toUpperCase();
    if (!['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(normalizedStatus)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    order.status = normalizedStatus;
    await order.save();
    res.json(order);
  } catch (error) {
    next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.canBeCancelled()) {
      return res.status(400).json({ message: 'Only PENDING orders can be canceled' });
    }

    order.status = 'CANCELLED';
    await order.save();
    res.json(order);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrderById,
  listOrders,
  updateOrderStatus,
  cancelOrder,
};
