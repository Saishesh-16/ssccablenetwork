# 📡 API Request Examples

This document provides sample API requests you can test using tools like Postman, curl, or browser.

## Base URL
```
http://localhost:3000/api
```

## 1. Health Check

**Request:**
```http
GET http://localhost:3000/api/health
```

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**cURL:**
```bash
curl http://localhost:3000/api/health
```

---

## 2. Get All Customers

**Request:**
```http
GET http://localhost:3000/api/customers
```

**Response:**
```json
{
  "success": true,
  "count": 130,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "serialNumber": "15CA30033868",
      "name": "PEDDI POCHAMMA",
      "paymentPlan": "Monthly",
      "lastPaidDate": "2024-01-01T00:00:00.000Z",
      "nextDueDate": "2024-01-31T00:00:00.000Z",
      "status": "Paid",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T00:00:00.000Z"
    },
    ...
  ]
}
```

**cURL:**
```bash
curl http://localhost:3000/api/customers
```

---

## 3. Search Customers

**Request:**
```http
GET http://localhost:3000/api/customers/search?name=PEDDI
```

**Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "serialNumber": "15CA30033868",
      "name": "PEDDI POCHAMMA",
      "paymentPlan": "Monthly",
      "lastPaidDate": "2024-01-01T00:00:00.000Z",
      "nextDueDate": "2024-01-31T00:00:00.000Z",
      "status": "Paid"
    }
  ]
}
```

**cURL:**
```bash
curl "http://localhost:3000/api/customers/search?name=PEDDI"
```

**JavaScript (Fetch):**
```javascript
fetch('http://localhost:3000/api/customers/search?name=PEDDI')
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## 4. Get Customer by ID

**Request:**
```http
GET http://localhost:3000/api/customers/65a1b2c3d4e5f6g7h8i9j0k1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "serialNumber": "15CA30033868",
    "name": "PEDDI POCHAMMA",
    "paymentPlan": "Monthly",
    "lastPaidDate": "2024-01-01T00:00:00.000Z",
    "nextDueDate": "2024-01-31T00:00:00.000Z",
    "status": "Paid"
  }
}
```

**cURL:**
```bash
curl http://localhost:3000/api/customers/65a1b2c3d4e5f6g7h8i9j0k1
```

---

## 5. Add New Customer

**Request:**
```http
POST http://localhost:3000/api/customers
Content-Type: application/json

{
  "name": "John Doe",
  "serialNumber": "123456789",
  "paymentPlan": "Monthly"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Customer added successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
    "serialNumber": "123456789",
    "name": "John Doe",
    "paymentPlan": "Monthly",
    "lastPaidDate": "2024-01-15T00:00:00.000Z",
    "nextDueDate": "2024-02-14T00:00:00.000Z",
    "status": "Paid",
    "createdAt": "2024-01-15T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z"
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "serialNumber": "123456789",
    "paymentPlan": "Monthly"
  }'
```

**JavaScript (Fetch):**
```javascript
fetch('http://localhost:3000/api/customers', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'John Doe',
    serialNumber: '123456789',
    paymentPlan: 'Monthly'
  })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## 6. Update Payment

**Request:**
```http
PUT http://localhost:3000/api/customers/65a1b2c3d4e5f6g7h8i9j0k1/payment
Content-Type: application/json

{
  "paymentDate": "2024-01-15",
  "status": "Paid",
  "paymentPlan": "Monthly"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment updated successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "serialNumber": "15CA30033868",
    "name": "PEDDI POCHAMMA",
    "paymentPlan": "Monthly",
    "lastPaidDate": "2024-01-15T00:00:00.000Z",
    "nextDueDate": "2024-02-14T00:00:00.000Z",
    "status": "Paid",
    "updatedAt": "2024-01-15T00:00:00.000Z"
  }
}
```

**cURL:**
```bash
curl -X PUT http://localhost:3000/api/customers/65a1b2c3d4e5f6g7h8i9j0k1/payment \
  -H "Content-Type: application/json" \
  -d '{
    "paymentDate": "2024-01-15",
    "status": "Paid",
    "paymentPlan": "Monthly"
  }'
```

---

## 7. Update Customer Details

**Request:**
```http
PUT http://localhost:3000/api/customers/65a1b2c3d4e5f6g7h8i9j0k1
Content-Type: application/json

{
  "name": "PEDDI POCHAMMA UPDATED",
  "serialNumber": "15CA30033868",
  "paymentPlan": "Yearly"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Customer updated successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "serialNumber": "15CA30033868",
    "name": "PEDDI POCHAMMA UPDATED",
    "paymentPlan": "Yearly",
    "lastPaidDate": "2024-01-01T00:00:00.000Z",
    "nextDueDate": "2024-01-31T00:00:00.000Z",
    "status": "Paid"
  }
}
```

**cURL:**
```bash
curl -X PUT http://localhost:3000/api/customers/65a1b2c3d4e5f6g7h8i9j0k1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "PEDDI POCHAMMA UPDATED",
    "serialNumber": "15CA30033868",
    "paymentPlan": "Yearly"
  }'
```

---

## 8. Delete Customer

**Request:**
```http
DELETE http://localhost:3000/api/customers/65a1b2c3d4e5f6g7h8i9j0k1
```

**Response:**
```json
{
  "success": true,
  "message": "Customer deleted successfully"
}
```

**cURL:**
```bash
curl -X DELETE http://localhost:3000/api/customers/65a1b2c3d4e5f6g7h8i9j0k1
```

---

## 9. Get Dashboard Statistics

**Request:**
```http
GET http://localhost:3000/api/dashboard
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCustomers": 130,
    "paidCustomers": 85,
    "dueCustomers": 35,
    "overdueCustomers": 10,
    "upcomingDue": [
      {
        "id": "65a1b2c3d4e5f6g7h8i9j0k1",
        "name": "PEDDI POCHAMMA",
        "serialNumber": "15CA30033868",
        "nextDueDate": "2024-01-20T00:00:00.000Z",
        "status": "Due but Active",
        "paymentPlan": "Monthly"
      },
      ...
    ]
  }
}
```

**cURL:**
```bash
curl http://localhost:3000/api/dashboard
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error message here",
  "error": "Detailed error (only in development)"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created (for POST requests)
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

---

## Testing with Postman

1. **Import Collection:**
   - Create new collection in Postman
   - Add all endpoints above
   - Set base URL variable: `{{baseUrl}} = http://localhost:3000/api`

2. **Test Flow:**
   - Health check → Get all customers → Search → Add customer → Update payment → Dashboard

---

## Testing with Browser Console

Open browser console (F12) and try:

```javascript
// Search customers
fetch('http://localhost:3000/api/customers/search?name=PEDDI')
  .then(res => res.json())
  .then(data => console.log(data));

// Get dashboard
fetch('http://localhost:3000/api/dashboard')
  .then(res => res.json())
  .then(data => console.log(data));
```

---

**Note:** Replace `65a1b2c3d4e5f6g7h8i9j0k1` with actual customer IDs from your database.

