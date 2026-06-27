const Order = require('../models/Order');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

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
    logger.error('Failed to create order', { error: error.message });
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
      throw new AppError('Order not found', 404);
    }
    res.json(order);
  } catch (error) {
    logger.error('Failed to fetch order by id', { error: error.message, orderId: req.params.id });
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

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const [orders, totalItems] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);

    res.json({
      data: orders,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    });
  } catch (error) {
    logger.error('Failed to list orders', { error: error.message, status: req.query.status });
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
      throw new AppError('Status is required', 400);
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    const normalizedStatus = status.toUpperCase();
    if (!['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(normalizedStatus)) {
      throw new AppError('Invalid status value', 400);
    }

    order.status = normalizedStatus;
    await order.save();
    res.json(order);
  } catch (error) {
    logger.error('Failed to update order status', { error: error.message, orderId: req.params.id });
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
      throw new AppError('Order not found', 404);
    }

    if (!order.canBeCancelled()) {
      throw new AppError('Only PENDING orders can be canceled', 400);
    }

    order.status = 'CANCELLED';
    await order.save();
    res.json(order);
  } catch (error) {
    logger.error('Failed to cancel order', { error: error.message, orderId: req.params.id });
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
