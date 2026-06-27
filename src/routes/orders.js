const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

/**
 * Order API routes.
 * These endpoints provide CRUD functionality and status management for orders.
 */
router.post('/', orderController.createOrder);
router.get('/', orderController.listOrders);
router.get('/:id', orderController.getOrderById);
router.patch('/:id/status', orderController.updateOrderStatus);
router.delete('/:id', orderController.cancelOrder);

module.exports = router;
