const Order = require('../models/Order');

/**
 * Creates a new order document from the request body.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware.
 * @returns {Promise<void>}
 */
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

/**
 * Retrieves a single order by its MongoDB ObjectId.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>}
 */
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

/**
 * Lists orders with optional filtering by status.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>}
 */
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

/**
 * Updates the status of an existing order.
 *
 * The request body may use any case for `status`, but the value is normalized
 * to uppercase before validation and persistence.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>}
 */
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

/**
 * Cancels an order if it is still in the PENDING state.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>}
 */
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
