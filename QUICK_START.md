# ⚡ Quick Start Guide - 5 Minutes Setup

## Prerequisites Check
- [ ] Node.js installed (`node --version`)
- [ ] MongoDB installed and running (`mongosh` should work)
- [ ] Code editor (VS Code recommended)

## Setup Steps

### 1️⃣ Backend Setup (2 minutes)

```bash
# Navigate to Backend folder
cd Backend

# Install packages
npm install

# Create .env file (copy this content):
# MONGODB_URI=mongodb://localhost:27017/ssc_bethigal
# PORT=3000
# NODE_ENV=development
# FRONTEND_URL=http://localhost:5500

# Import data
npm run import-data

# Start server
npm start
```

✅ You should see: `🚀 Server running on port 3000`

### 2️⃣ Frontend Setup (1 minute)

**Option A - VS Code Live Server:**
1. Install "Live Server" extension
2. Right-click `Frontend/index.html`
3. Click "Open with Live Server"

**Option B - Python:**
```bash
cd Frontend
python -m http.server 5500
```

✅ Open browser: http://localhost:5500

### 3️⃣ Verify (1 minute)

1. **Backend:** http://localhost:3000/api/health
   - Should show: `{"success":true,"message":"Server is running"}`

2. **Frontend:** http://localhost:5500
   - Should show dashboard with statistics

3. **Test Search:**
   - Click "Search Customer"
   - Type "PEDDI"
   - Should show results

## 🎉 Done!

You're ready to use the system!

## Daily Usage

**To start daily:**
1. Start MongoDB (usually automatic)
2. Run `cd Backend && npm start`
3. Open frontend (Live Server or Python)

**To stop:**
- Press `Ctrl+C` in backend terminal

## 🆘 Quick Troubleshooting

**Backend won't start?**
- Check MongoDB: `mongosh`
- Check `.env` file exists

**Frontend can't connect?**
- Check backend is running
- Check browser console (F12) for errors

**Need more help?**
- See `SETUP_INSTRUCTIONS.md` for detailed guide
- See `README.md` for full documentation

---

**That's it! You're all set! 🚀**

