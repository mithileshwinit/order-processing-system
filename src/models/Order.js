const mongoose = require('mongoose');

/**
 * Schema for a single order item.
 * Each item includes a product reference, quantity, and price information.
 */
const OrderItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
});

/**
 * Schema for an order document.
 * Includes customer details, line items, status, and a calculated total amount.
 */
const OrderSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    items: {
      type: [OrderItemSchema],
      validate: {
        validator(items) {
          return Array.isArray(items) && items.length > 0;
        },
        message: 'Order must contain at least one item.',
      },
    },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
      default: 'PENDING',
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Calculates and stores the order total before validation.
 * This ensures totalAmount always reflects the line item values.
 */
OrderSchema.pre('validate', function (next) {
  if (this.items && this.items.length > 0) {
    this.totalAmount = this.items.reduce((sum, item) => {
      const quantity = Number(item.quantity || 0);
      const price = Number(item.price || 0);
      return sum + quantity * price;
    }, 0);
  }
  next();
});

/**
 * Returns true if the order is eligible for cancellation.
 * Orders can only be canceled before processing begins.
 *
 * @returns {boolean}
 */
OrderSchema.methods.canBeCancelled = function () {
  return this.status === 'PENDING';
};

/**
 * Indicates whether the order may transition from the current status to the
 * requested next status according to the allowed business workflow.
 *
 * @param {string} nextStatus - Target status to validate.
 * @returns {boolean}
 */
OrderSchema.methods.canTransitionTo = function (nextStatus) {
  const transitions = {
    PENDING: ['PROCESSING', 'CANCELLED'],
    PROCESSING: ['SHIPPED'],
    SHIPPED: ['DELIVERED'],
    DELIVERED: [],
    CANCELLED: [],
  };

  return transitions[this.status]?.includes(nextStatus);
};

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
