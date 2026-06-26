const express = require('express');
const ordersRouter = require('../routes/orders');

const app = express();

app.use(express.json());

app.use('/orders', ordersRouter);

app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

module.exports = app;
