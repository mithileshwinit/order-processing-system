const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/config/app');
const Order = require('../src/models/Order');
const { promotePendingOrders } = require('../src/jobs/orderStatusJob');

let mongoServer;

describe('Order API', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterEach(async () => {
    await Order.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  test('creates an order and returns calculated total amount', async () => {
    const response = await request(app)
      .post('/orders')
      .send({
        customerName: 'Jane Doe',
        customerEmail: 'jane@example.com',
        items: [
          { productId: 'p1', name: 'Widget', quantity: 2, price: 10 },
          { productId: 'p2', name: 'Gadget', quantity: 1, price: 15 },
        ],
      })
      .expect(201);

    expect(response.body.totalAmount).toBe(35);
    expect(response.body.status).toBe('PENDING');
  });

  test('retrieves an order by id', async () => {
    const order = await Order.create({
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      items: [{ productId: 'p1', name: 'Widget', quantity: 1, price: 20 }],
    });

    const response = await request(app).get(`/orders/${order._id}`).expect(200);

    expect(response.body.customerEmail).toBe('john@example.com');
    expect(response.body._id).toBe(String(order._id));
  });

  test('lists orders and can filter by status', async () => {
    await Order.create({
      customerName: 'A',
      customerEmail: 'a@example.com',
      items: [{ productId: 'p1', name: 'Widget', quantity: 1, price: 10 }],
      status: 'PENDING',
    });
    await Order.create({
      customerName: 'B',
      customerEmail: 'b@example.com',
      items: [{ productId: 'p1', name: 'Widget', quantity: 1, price: 10 }],
      status: 'SHIPPED',
    });

    const response = await request(app).get('/orders?status=pending').expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].status).toBe('PENDING');
  });

  test('updates an order status', async () => {
    const order = await Order.create({
      customerName: 'Alice',
      customerEmail: 'alice@example.com',
      items: [{ productId: 'p1', name: 'Widget', quantity: 1, price: 10 }],
    });

    const response = await request(app)
      .patch(`/orders/${order._id}/status`)
      .send({ status: 'processing' })
      .expect(200);

    expect(response.body.status).toBe('PROCESSING');
  });

  test('cancels a pending order only', async () => {
    const pendingOrder = await Order.create({
      customerName: 'Bob',
      customerEmail: 'bob@example.com',
      items: [{ productId: 'p1', name: 'Widget', quantity: 1, price: 10 }],
      status: 'PENDING',
    });

    const cancelResponse = await request(app).delete(`/orders/${pendingOrder._id}`).expect(200);
    expect(cancelResponse.body.status).toBe('CANCELLED');

    const processingOrder = await Order.create({
      customerName: 'Cara',
      customerEmail: 'cara@example.com',
      items: [{ productId: 'p1', name: 'Widget', quantity: 1, price: 10 }],
      status: 'PROCESSING',
    });

    const rejectResponse = await request(app).delete(`/orders/${processingOrder._id}`).expect(400);
    expect(rejectResponse.body.message).toBe('Only PENDING orders can be canceled');
  });

  test('promotes pending orders to processing through the background job', async () => {
    const order = await Order.create({
      customerName: 'Dana',
      customerEmail: 'dana@example.com',
      items: [{ productId: 'p1', name: 'Widget', quantity: 1, price: 10 }],
      status: 'PENDING',
    });

    await promotePendingOrders();

    const updatedOrder = await Order.findById(order._id);
    expect(updatedOrder.status).toBe('PROCESSING');
  });
});
