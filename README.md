# 📺 SSC Bethigal - Cable Network Billing System

A complete, production-ready full-stack web application for managing village cable network customers and billing.

## 🎯 Project Overview

This system is designed for a small village cable network operator (~120-130 customers) who needs a simple, user-friendly interface to:
- Search customers quickly
- Track payment status
- Mark payments
- View dashboard statistics
- Manage customer information

**Key Features:**
- ✅ Simple, non-technical user interface
- ✅ Fast customer search (case-insensitive, partial match)
- ✅ Payment tracking (Monthly, Half-Yearly, Yearly plans)
- ✅ Dashboard with statistics
- ✅ Upcoming due list (next 7 days)
- ✅ Mobile-friendly design

## 📁 Project Structure

```
SSC BETHIGAL/
├── Backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── customerController.js # Customer business logic
│   │   └── dashboardController.js # Dashboard statistics
│   ├── models/
│   │   └── Customer.js          # Customer schema/model
│   ├── routes/
│   │   ├── customerRoutes.js    # Customer API endpoints
│   │   └── dashboardRoutes.js   # Dashboard API endpoints
│   ├── scripts/
│   │   └── importData.js        # CSV import script
│   ├── Data/
│   │   └── SSC EXCEL.csv        # Customer data (existing)
│   ├── server.js                # Express server
│   ├── package.json             # Dependencies
│   └── .env                     # Environment variables
│
└── Frontend/
    ├── css/
    │   └── style.css            # Main stylesheet
    ├── js/
    │   ├── api.js               # API utility functions
    │   ├── dashboard.js         # Dashboard page logic
    │   ├── search.js            # Search page logic
    │   └── add-customer.js      # Add customer logic
    ├── index.html               # Dashboard page
    ├── search.html              # Search customer page
    └── add-customer.html        # Add customer page
```

## 🚀 Quick Start Guide

### Prerequisites

1. **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
2. **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
3. **VS Code Live Server** (or any static file server) for frontend

### Step 1: Install MongoDB

**Windows:**
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Install with default settings
3. MongoDB will run as a Windows service automatically

**Verify MongoDB is running:**
```bash
# Open new terminal
mongosh
# If connected, you'll see MongoDB shell
```

### Step 2: Setup Backend

1. **Navigate to Backend folder:**
```bash
cd Backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create `.env` file:**
Create a file named `.env` in the `Backend` folder with:
```env
MONGODB_URI=mongodb://localhost:27017/ssc_bethigal
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5500
```

4. **Import existing customer data:**
```bash
npm run import-data
```
This will import all customers from `Backend/Data/SSC EXCEL.csv` into MongoDB.

5. **Start the server:**
```bash
npm start
```
Or for development with auto-reload:
```bash
npm run dev
```

You should see:
```
✅ MongoDB Connected: localhost:27017
🚀 Server running on port 3000
```

### Step 3: Setup Frontend

**Option 1: Using VS Code Live Server (Recommended)**
1. Install "Live Server" extension in VS Code
2. Right-click on `Frontend/index.html`
3. Select "Open with Live Server"
4. Browser will open at `http://localhost:5500`

**Option 2: Using Python HTTP Server**
```bash
cd Frontend
python -m http.server 5500
# Or for Python 3
python3 -m http.server 5500
```

**Option 3: Using Node.js http-server**
```bash
# Install globally
npm install -g http-server

# Run in Frontend folder
cd Frontend
http-server -p 5500
```

### Step 4: Access the Application

Open your browser and go to:
- **Frontend:** http://localhost:5500
- **Backend API:** http://localhost:3000/api

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Customer Endpoints

#### Get All Customers
```http
GET /api/customers
```

#### Search Customers
```http
GET /api/customers/search?name=PEDDI
```

#### Get Customer by ID
```http
GET /api/customers/:id
```

#### Add New Customer
```http
POST /api/customers
Content-Type: application/json

{
  "name": "John Doe",
  "serialNumber": "123456",
  "paymentPlan": "Monthly"
}
```

#### Update Payment
```http
PUT /api/customers/:id/payment
Content-Type: application/json

{
  "paymentDate": "2024-01-15",
  "status": "Paid",
  "paymentPlan": "Monthly"
}
```

#### Update Customer
```http
PUT /api/customers/:id
Content-Type: application/json

{
  "name": "John Doe Updated",
  "serialNumber": "123456",
  "paymentPlan": "Yearly"
}
```

#### Delete Customer
```http
DELETE /api/customers/:id
```

### Dashboard Endpoints

#### Get Dashboard Statistics
```http
GET /api/dashboard
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
    "upcomingDue": [...]
  }
}
```

## 💡 How to Use

### For the Operator (Non-Technical User)

1. **View Dashboard:**
   - Open the application
   - See total customers, paid, due, and overdue counts
   - Check upcoming due list (next 7 days)

2. **Search Customer:**
   - Click "Search Customer" in navigation
   - Type customer name (even partial name works)
   - Results appear automatically
   - Click "Mark Paid" to record payment
   - Click "Mark Due Active" to change status

3. **Add New Customer:**
   - Click "Add Customer" in navigation
   - Enter name and serial number
   - Select payment plan
   - Click "Add Customer" button

4. **Edit Customer:**
   - Search for customer
   - Click "Edit" button
   - Update information
   - Save changes

## 🔧 Business Logic

### Payment Plans
- **Monthly:** +30 days from payment date
- **Half-Yearly:** +180 days from payment date
- **Yearly:** +365 days from payment date

### Status Auto-Update
- Status automatically updates based on `nextDueDate`
- If `nextDueDate` < today → Status = "Overdue"
- If `nextDueDate` >= today → Status = "Due but Active"
- "Paid" status is set manually when marking payment

### Search Functionality
- Case-insensitive search
- Partial name matching
- Real-time search (searches as you type after 500ms delay)

## 🐛 Troubleshooting

### MongoDB Connection Error
**Problem:** `Error connecting to MongoDB`

**Solutions:**
1. Make sure MongoDB is running:
   ```bash
   # Check MongoDB service (Windows)
   services.msc
   # Look for "MongoDB" service and start it
   ```

2. Check MongoDB URI in `.env` file

3. Try connecting manually:
   ```bash
   mongosh
   ```

### Port Already in Use
**Problem:** `Port 3000 is already in use`

**Solutions:**
1. Change port in `.env` file:
   ```env
   PORT=3001
   ```

2. Update frontend API URL in `Frontend/js/api.js`:
   ```javascript
   const API_BASE_URL = 'http://localhost:3001/api';
   ```

### CORS Error
**Problem:** `CORS policy blocked`

**Solutions:**
1. Make sure `FRONTEND_URL` in `.env` matches your frontend URL
2. Check that frontend is running on the correct port

### Import Data Fails
**Problem:** CSV import doesn't work

**Solutions:**
1. Check CSV file path: `Backend/Data/SSC EXCEL.csv`
2. Make sure CSV has correct headers: `Serial Number, Customer Name`
3. Check MongoDB connection

## 📝 Common Mistakes to Avoid

1. **Don't forget to start MongoDB** before starting the server
2. **Don't modify the CSV file** after importing (use the web interface)
3. **Don't change API_BASE_URL** in frontend without updating backend CORS
4. **Don't delete customers** without backup (data is in MongoDB)
5. **Always use the web interface** for data changes, not direct database access

## 🎓 Explaining This Project in Interviews

### Architecture Highlights:
1. **MVC Pattern:** Clear separation of routes, controllers, and models
2. **RESTful API:** Standard HTTP methods and status codes
3. **Database Design:** Proper schema with indexes for performance
4. **Error Handling:** Comprehensive error handling at all levels
5. **User Experience:** Simple, intuitive interface for non-technical users

### Technical Decisions:
1. **Vanilla JavaScript:** No framework overhead, easier for beginners
2. **MongoDB:** Flexible schema, easy to modify
3. **Express.js:** Industry standard, well-documented
4. **MVC Architecture:** Scalable, maintainable code structure

### Key Features Implemented:
1. **Fast Search:** Indexed database queries, case-insensitive matching
2. **Auto-calculation:** Payment dates calculated automatically
3. **Status Management:** Automatic status updates based on dates
4. **Dashboard Analytics:** Real-time statistics
5. **Data Import:** CSV to database migration script

### Challenges Solved:
1. **Scientific Notation:** Handled Excel's scientific notation in serial numbers
2. **Real-time Search:** Debounced search for better performance
3. **Date Management:** Automatic calculation of due dates
4. **Status Logic:** Complex business rules for payment status

## 📊 Sample Data

After importing, you'll have ~130 customers with:
- Various payment plans
- Different payment statuses
- Realistic names and serial numbers

## 🔒 Security Notes

**For Production:**
1. Add authentication/authorization
2. Use environment variables for sensitive data
3. Add input validation and sanitization
4. Use HTTPS
5. Add rate limiting
6. Implement proper error logging

**Current Setup:** Designed for local/private network use only.

## 📞 Support

If you encounter issues:
1. Check MongoDB is running
2. Verify `.env` file exists and is correct
3. Check console for error messages
4. Ensure all dependencies are installed (`npm install`)

## 📄 License

This project is for internal use only

