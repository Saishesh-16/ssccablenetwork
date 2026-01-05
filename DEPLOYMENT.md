# 🚀 Deployment Guide - SSC Bethigal Cable Network

This guide will help you deploy the SSC Bethigal Cable Network application as a Progressive Web App (PWA).

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance like MongoDB Atlas)
- Web server (Nginx, Apache, or cloud hosting)
- Domain name (optional but recommended)

## 🎯 Deployment Options

### Option 1: Traditional Web Hosting (Recommended)

#### Backend Deployment

1. **Prepare Backend:**
   ```bash
   cd Backend
   npm install --production
   ```

2. **Configure Environment:**
   Create `.env` file:
   ```env
   MONGODB_URI=mongodb://your-mongodb-uri
   PORT=3000
   NODE_ENV=production
   FRONTEND_URL=https://your-domain.com
   ```

3. **Deploy Backend:**
   - Upload `Backend` folder to your server
   - Install PM2: `npm install -g pm2`
   - Start server: `pm2 start server.js --name ssc-backend`
   - Save PM2 config: `pm2 save`
   - Setup auto-start: `pm2 startup`

#### Frontend Deployment

1. **Update API Configuration:**
   - Edit `Frontend/js/api.js` or set environment variable
   - Change `API_BASE_URL` to your backend URL:
   ```javascript
   const API_BASE_URL = 'https://api.your-domain.com/api';
   ```

2. **Deploy Frontend:**
   - Upload `Frontend` folder to your web server
   - Ensure HTTPS is enabled (required for PWA)
   - Configure server to serve `index.html` for all routes

3. **Nginx Configuration Example:**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name your-domain.com;

       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;

       root /path/to/Frontend;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       location /api {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Option 2: Cloud Platform Deployment

#### Vercel / Netlify (Frontend)

1. **Connect Repository:**
   - Push code to GitHub
   - Connect to Vercel/Netlify
   - Set build command: (none needed for static site)
   - Set publish directory: `Frontend`

2. **Environment Variables:**
   - Set `API_URL` to your backend URL

#### Heroku / Railway / Render (Backend)

1. **Prepare:**
   ```bash
   cd Backend
   # Add Procfile:
   echo "web: node server.js" > Procfile
   ```

2. **Deploy:**
   - Connect repository
   - Set environment variables
   - Deploy

### Option 3: Docker Deployment

1. **Create Dockerfile (Backend):**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install --production
   COPY . .
   EXPOSE 3000
   CMD ["node", "server.js"]
   ```

2. **Create docker-compose.yml:**
   ```yaml
   version: '3.8'
   services:
     backend:
       build: ./Backend
       ports:
         - "3000:3000"
       environment:
         - MONGODB_URI=mongodb://mongo:27017/ssc_bethigal
         - NODE_ENV=production
       depends_on:
         - mongo
     
     mongo:
       image: mongo:latest
       volumes:
         - mongo-data:/data/db
   
   volumes:
     mongo-data:
   ```

## 🔧 Production Configuration

### 1. Reset Payment Data (Before First Deployment)

```bash
cd Backend
node scripts/reset-payment-data.js --clear-history
```

### 2. Update API URL

**Option A: Environment Variable**
```html
<script>
  window.APP_CONFIG = {
    API_URL: 'https://api.your-domain.com/api'
  };
</script>
```

**Option B: Direct Edit**
Edit `Frontend/js/api.js`:
```javascript
const API_BASE_URL = 'https://api.your-domain.com/api';
```

### 3. Enable HTTPS

PWA requires HTTPS. Use:
- Let's Encrypt (free)
- Cloudflare (free SSL)
- Your hosting provider's SSL

### 4. Configure CORS

Update `Backend/server.js`:
```javascript
const allowedOrigins = [
  'https://your-domain.com',
  'https://www.your-domain.com'
];
```

## 📱 PWA Features

### Install as App

Users can install the app:
- **Chrome/Edge:** Click install icon in address bar
- **Safari (iOS):** Share → Add to Home Screen
- **Firefox:** Menu → Install

### Offline Support

Service worker provides:
- Offline page caching
- Asset caching
- Background sync (future)

## 🔒 Security Checklist

- [ ] Enable HTTPS
- [ ] Set secure CORS origins
- [ ] Use environment variables for secrets
- [ ] Enable MongoDB authentication
- [ ] Set up firewall rules
- [ ] Regular backups
- [ ] Update dependencies regularly

## 📊 Monitoring

### PM2 Monitoring (Backend)
```bash
pm2 monit
pm2 logs ssc-backend
```

### Health Check
```bash
curl https://api.your-domain.com/api/health
```

## 🔄 Updates

### Update Frontend
1. Upload new files
2. Clear browser cache
3. Service worker auto-updates

### Update Backend
```bash
pm2 restart ssc-backend
```

## 🐛 Troubleshooting

### PWA Not Installing
- Check HTTPS is enabled
- Verify manifest.json is accessible
- Check service worker registration

### API Errors
- Verify CORS configuration
- Check API URL in frontend
- Verify backend is running

### Service Worker Issues
- Clear browser cache
- Unregister old service worker
- Check browser console for errors

## 📝 Post-Deployment

1. **Test All Features:**
   - Login
   - Search customers
   - Add customer
   - Mark payments
   - View reports

2. **Monitor:**
   - Server logs
   - Error rates
   - Performance

3. **Backup:**
   - Setup automated MongoDB backups
   - Backup configuration files

## 🎉 Success!

Your app is now deployed as a Progressive Web App!

Users can:
- Install it on their devices
- Use it offline (limited)
- Access it like a native app

---

**Need Help?** Check the main README.md for more information.

