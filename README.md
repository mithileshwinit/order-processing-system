# order-processing-system

A backend system for processing e-commerce orders using Node.js, Express, and MongoDB.

## Features

- Create, retrieve, list, update, and cancel orders
- Order status life cycle with `PENDING`, `PROCESSING`, `SHIPPED`, and `CANCELLED`
- Background job that updates pending orders every 5 minutes
- Jest + Supertest integration tests

## Setup

1. Copy `.env.example` to `.env`
2. Update `MONGO_URI` to point at your MongoDB instance 
3. Run `npm install`
4. Start the server with `npm run dev`

## Environment variables

Use `.env.example` as a starting point.

- `MONGO_URI` - MongoDB connection string
- `PORT` - Application port (defaults to `3000`)

## Scripts

- `npm start` - Run the production server
- `npm run dev` - Run the server with `nodemon`
- `npm test` - Run Jest tests

## API Endpoints

- `POST /orders` - Create a new order
- `GET /orders` - List all orders
- `GET /orders/:id` - Get order details by ID
- `PATCH /orders/:id/status` - Update an order status
- `DELETE /orders/:id` - Cancel an order

## Sample API Requests & Responses

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
