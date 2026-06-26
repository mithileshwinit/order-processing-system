const mongoose = require('mongoose');

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

OrderSchema.methods.canBeCancelled = function () {
  return this.status === 'PENDING';
};

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
