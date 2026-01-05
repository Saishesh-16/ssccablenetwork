# 🚀 Step-by-Step Setup Instructions

Follow these instructions carefully to set up the system.

## Prerequisites Checklist

- [ ] Node.js installed (v14+)
- [ ] MongoDB installed and running
- [ ] Code editor (VS Code recommended)
- [ ] Internet connection (for npm packages)

## Detailed Setup Steps

### Step 1: Verify MongoDB Installation

1. **Check if MongoDB is installed:**
   ```bash
   mongosh --version
   ```

2. **Start MongoDB (if not running):**
   - **Windows:** MongoDB should run as a service automatically
   - **Manual start:** Open Command Prompt as Administrator and run:
     ```bash
     net start MongoDB
     ```

3. **Test MongoDB connection:**
   ```bash
   mongosh
   ```
   If you see `>` prompt, MongoDB is working! Type `exit` to leave.

### Step 2: Backend Setup

1. **Open terminal/command prompt**

2. **Navigate to Backend folder:**
   ```bash
   cd "C:\Users\ksais\OneDrive\Desktop\PROJECTS\SSC BETHIGAL\Backend"
   ```

3. **Install Node.js packages:**
   ```bash
   npm install
   ```
   Wait for installation to complete (may take 2-3 minutes).

4. **Create `.env` file:**
   - Create a new file named `.env` (not `.env.txt`)
   - Copy this content:
     ```env
     MONGODB_URI=mongodb://localhost:27017/ssc_bethigal
     PORT=3000
     NODE_ENV=development
     FRONTEND_URL=http://localhost:5500
     ```
   - Save the file in the `Backend` folder

5. **Import customer data:**
   ```bash
   npm run import-data
   ```
   You should see:
   ```
   ✅ Successfully imported X customers
   📈 Total customers in database: X
   ```

6. **Start the backend server:**
   ```bash
   npm start
   ```
   Keep this terminal window open! You should see:
   ```
   ✅ MongoDB Connected: localhost:27017
   🚀 Server running on port 3000
   ```

### Step 3: Frontend Setup

**Option A: Using VS Code Live Server (Easiest)**

1. **Install Live Server extension:**
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X)
   - Search for "Live Server"
   - Click "Install"

2. **Open the Frontend folder:**
   - In VS Code: File → Open Folder
   - Select the `Frontend` folder

3. **Start Live Server:**
   - Right-click on `index.html`
   - Select "Open with Live Server"
   - Browser will open automatically

**Option B: Using Python (If you have Python installed)**

1. **Open new terminal/command prompt**

2. **Navigate to Frontend folder:**
   ```bash
   cd "C:\Users\ksais\OneDrive\Desktop\PROJECTS\SSC BETHIGAL\Frontend"
   ```

3. **Start Python server:**
   ```bash
   python -m http.server 5500
   ```
   Or:
   ```bash
   python3 -m http.server 5500
   ```

4. **Open browser:**
   - Go to: http://localhost:5500

### Step 4: Verify Everything Works

1. **Check Backend:**
   - Open browser: http://localhost:3000/api/health
   - Should see: `{"success":true,"message":"Server is running",...}`

2. **Check Frontend:**
   - Open: http://localhost:5500
   - Should see the dashboard with statistics

3. **Test Search:**
   - Click "Search Customer"
   - Type a name (e.g., "PEDDI")
   - Should see search results

## 🎯 Quick Start Commands

**Terminal 1 (Backend):**
```bash
cd Backend
npm start
```

**Terminal 2 (Frontend - if using Python):**
```bash
cd Frontend
python -m http.server 5500
```

## ✅ Verification Checklist

- [ ] MongoDB is running
- [ ] Backend server shows "Server running on port 3000"
- [ ] Frontend opens in browser
- [ ] Dashboard shows customer statistics
- [ ] Search functionality works
- [ ] Can add new customer

## 🆘 If Something Doesn't Work

### Backend won't start:
1. Check MongoDB is running: `mongosh`
2. Check `.env` file exists and has correct content
3. Check port 3000 is not used by another program

### Frontend can't connect to backend:
1. Make sure backend is running
2. Check `Frontend/js/api.js` has correct URL: `http://localhost:3000/api`
3. Check browser console for errors (F12)

### Import data fails:
1. Check CSV file exists: `Backend/Data/SSC EXCEL.csv`
2. Check MongoDB is running
3. Try running import again: `npm run import-data`

## 📱 Daily Usage

**To use the system daily:**

1. **Start MongoDB** (usually runs automatically)
2. **Start Backend:**
   ```bash
   cd Backend
   npm start
   ```
3. **Open Frontend** (using Live Server or Python server)
4. **Use the web interface** - no Excel needed!

**To stop:**
- Press `Ctrl+C` in backend terminal
- Close browser tab for frontend

---

**Need help?** Check the main README.md for detailed troubleshooting.

