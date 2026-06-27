# order-processing-system

A backend system for processing e-commerce orders using Node.js, Express, and MongoDB.

## Features

- Create, retrieve, list, update, and cancel orders
- Order status life cycle with `PENDING`, `PROCESSING`, `SHIPPED`, and `CANCELLED`
- Background job that updates pending orders every 5 minutes
- Jest + Supertest integration tests

## Order Status Flow
                    Create Order
                         │
                         ▼
                    PENDING
                    /      \
                   /        \
        Cancel Order        Scheduler (Every 5 min)
        (Only Allowed)             │
               │                   ▼
               ▼             PROCESSING
         CANCELLED                 │
                                   ▼
                               SHIPPED
                                   │
                                   ▼
                              DELIVERED

## Setup

1. Copy `.env.example` to `.env`
2. Update `MONGO_URI` to point at MongoDB instance
3. Optionally set `PORT`, `AUTH_USERNAME`, `AUTH_PASSWORD`, `ACCESS_TOKEN_SECRET`, and `REFRESH_TOKEN_SECRET`
4. Run `npm install`
5. Start the server with `npm run dev`

## Environment variables

Use `.env.example` as a starting point.

- `MONGO_URI` - MongoDB connection string
- `PORT` - Application port (defaults to `3000`)
- `AUTH_USERNAME` - JWT auth username (default: `admin`)
- `AUTH_PASSWORD` - JWT auth password (default: `admin123`)
- `ACCESS_TOKEN_SECRET` - Secret for signing access tokens
- `REFRESH_TOKEN_SECRET` - Secret for signing refresh tokens

## Scripts

- `npm start` - Run the production server
- `npm run dev` - Run the server with `nodemon`
- `npm test` - Run Jest tests

## Project structure

- `src/index.js` - Application entrypoint; starts MongoDB, background job, and Express server
- `src/config/app.js` - Express app setup, middleware, and route mounting
- `src/config/db.js` - MongoDB connection logic
- `src/config/auth.js` - JWT authentication configuration and secrets
- `src/routes/auth.js` - Authentication endpoint for token issuance
- `src/routes/orders.js` - Order-related API route definitions
- `src/controllers/authController.js` - Handles login and token generation
- `src/controllers/orderController.js` - CRUD and status operations for orders
- `src/models/Order.js` - Mongoose order schema, validation, and helpers
- `src/middleware/authMiddleware.js` - JWT verification for protected routes
- `src/jobs/orderStatusJob.js` - Periodic promotion of pending orders to processing
- `tests/order.test.js` - Integration tests for order APIs and business behavior

## API Endpoints

- `POST /api/auth/token` - Authenticate and receive JWT access and refresh tokens
- `POST /orders` - Create a new order (requires JWT access token)
- `GET /orders` - List all orders (requires JWT access token)
- `GET /orders/:id` - Get order details by ID (requires JWT access token)
- `PATCH /orders/:id/status` - Update an order status (requires JWT access token)
- `DELETE /orders/:id` - Cancel an order (requires JWT access token)

## Sample API Requests & Responses

### Create auth token

Request:
```json
POST /api/auth/token
{
  "username": "admin",
  "password": "admin123"
}
```

Response:
```json
200 OK
{
  "accessToken": "<jwt-access-token>",
  "refreshToken": "<jwt-refresh-token>"
}
```

### Create order

Request:
```json
POST /orders
{
  "customerName": "Jane Doe",
  "customerEmail": "jane@example.com",
  "items": [
    { "productId": "p1", "name": "Widget", "quantity": 2, "price": 10 },
    { "productId": "p2", "name": "Gadget", "quantity": 1, "price": 15 }
  ]
}
```

Headers:
```http
Authorization: Bearer <jwt-access-token>
```

Response:
```json
201 Created
{
  "_id": "64b9e77f8f1a2d5c6e8b1234",
  "customerName": "Jane Doe",
  "customerEmail": "jane@example.com",
  "items": [
    { "productId": "p1", "name": "Widget", "quantity": 2, "price": 10 },
    { "productId": "p2", "name": "Gadget", "quantity": 1, "price": 15 }
  ],
  "status": "PENDING",
  "totalAmount": 35,
  "createdAt": "2026-06-26T12:34:56.789Z",
  "updatedAt": "2026-06-26T12:34:56.789Z",
  "__v": 0
}
```

### List orders

Request:
```http
GET /orders
```

Response:
```json
200 OK
[
  {
    "_id": "64b9e77f8f1a2d5c6e8b1234",
    "customerName": "Jane Doe",
    "customerEmail": "jane@example.com",
    "items": [
      { "productId": "p1", "name": "Widget", "quantity": 2, "price": 10 },
      { "productId": "p2", "name": "Gadget", "quantity": 1, "price": 15 }
    ],
    "status": "PENDING",
    "totalAmount": 35,
    "createdAt": "2026-06-26T12:34:56.789Z",
    "updatedAt": "2026-06-26T12:34:56.789Z",
    "__v": 0
  }
]
```

### Get order by ID

Request:
```http
GET /orders/64b9e77f8f1a2d5c6e8b1234
```

Response:
```json
200 OK
{
  "_id": "64b9e77f8f1a2d5c6e8b1234",
  "customerName": "Jane Doe",
  "customerEmail": "jane@example.com",
  "items": [
    { "productId": "p1", "name": "Widget", "quantity": 2, "price": 10 },
    { "productId": "p2", "name": "Gadget", "quantity": 1, "price": 15 }
  ],
  "status": "PENDING",
  "totalAmount": 35,
  "createdAt": "2026-06-26T12:34:56.789Z",
  "updatedAt": "2026-06-26T12:34:56.789Z",
  "__v": 0
}
```

### Update order status

Request:
```json
PATCH /orders/64b9e77f8f1a2d5c6e8b1234/status
{
  "status": "processing"
}
```

Response:
```json
200 OK
{
  "_id": "64b9e77f8f1a2d5c6e8b1234",
  "customerName": "Jane Doe",
  "customerEmail": "jane@example.com",
  "items": [
    { "productId": "p1", "name": "Widget", "quantity": 2, "price": 10 },
    { "productId": "p2", "name": "Gadget", "quantity": 1, "price": 15 }
  ],
  "status": "PROCESSING",
  "totalAmount": 35,
  "createdAt": "2026-06-26T12:34:56.789Z",
  "updatedAt": "2026-06-26T12:45:12.345Z",
  "__v": 0
}
```

### Cancel order

Request:
```http
DELETE /orders/64b9e77f8f1a2d5c6e8b1234
```

Response:
```json
200 OK
{
  "_id": "64b9e77f8f1a2d5c6e8b1234",
  "customerName": "Jane Doe",
  "customerEmail": "jane@example.com",
  "items": [
    { "productId": "p1", "name": "Widget", "quantity": 2, "price": 10 },
    { "productId": "p2", "name": "Gadget", "quantity": 1, "price": 15 }
  ],
  "status": "CANCELLED",
  "totalAmount": 35,
  "createdAt": "2026-06-26T12:34:56.789Z",
  "updatedAt": "2026-06-26T12:50:00.000Z",
  "__v": 0
}
```

## Testing

Run the test suite with:

```bash
npm test
```

## Notes

- The background status updater starts automatically when the app boots.
- For local development, use a MongoDB URI such as `mongodb://localhost:27017/order-processing-system`.
