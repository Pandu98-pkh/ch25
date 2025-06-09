# 🚀 CounselorHub - Panduan Deployment ke Netlify

## 📋 Prasyarat

1. **Akun Netlify** - Daftar di [netlify.com](https://netlify.com)
2. **GitHub Repository** - Push kode frontend ke GitHub
3. **Backend API** - Backend harus accessible (via ngrok atau VPS)

## 🔧 Persiapan Frontend untuk Deployment

### 1. Build Environment Variables

Buat file `.env.production`:

```env
# Production API URL (ganti dengan URL backend Anda)
VITE_API_URL=https://your-ngrok-url.ngrok.app

# Atau jika menggunakan VPS
# VITE_API_URL=https://api.counselorhub.com
```

### 2. Update Vite Config untuk Production

File `vite.config.ts` sudah dikonfigurasi dengan baik untuk production build.

### 3. Build Script

Pastikan `package.json` memiliki build script:

```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

## 🌐 Deployment ke Netlify

### Metode 1: Deploy via GitHub (Recommended)

1. **Push ke GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

2. **Connect Repository di Netlify**:
   - Login ke Netlify
   - Click "New site from Git"
   - Choose GitHub dan pilih repository
   - Set build settings:
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`
     - **Node version**: `18.x` (di Environment variables)

3. **Environment Variables di Netlify**:
   - Go to Site settings > Environment variables
   - Add:
     ```
     VITE_API_URL = https://your-ngrok-url.ngrok.app
     NODE_VERSION = 18.18.0
     ```

### Metode 2: Deploy Manual

1. **Build locally**:
   ```bash
   npm run build
   ```

2. **Deploy ke Netlify**:
   - Drag & drop folder `dist` ke Netlify dashboard
   - Atau gunakan Netlify CLI:
     ```bash
     npm install -g netlify-cli
     netlify deploy --prod --dir=dist
     ```

## ⚙️ Konfigurasi Netlify

### 1. Redirects untuk SPA

Buat file `public/_redirects`:

```
# SPA Redirect
/*    /index.html   200

# API Proxy (Optional - jika ingin proxy ke backend)
/api/*  https://your-ngrok-url.ngrok.app/api/:splat  200
```

### 2. Headers untuk CORS

Buat file `public/_headers`:

```
/*
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

/api/*
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
  Access-Control-Allow-Headers: Content-Type, Authorization
```

### 3. Netlify.toml (Optional)

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18.18.0"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
```

## 🔄 Update API URL untuk Production

### Script Otomatis untuk Update URL

Buat file `update-api-url.js`:

```javascript
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const API_URL = process.argv[2];
if (!API_URL) {
  console.log('Usage: node update-api-url.js <API_URL>');
  process.exit(1);
}

const envFile = path.join(__dirname, '.env');
const envContent = `VITE_API_URL=${API_URL}\n`;

fs.writeFileSync(envFile, envContent);
console.log(`✅ Updated API URL to: ${API_URL}`);
```

Gunakan:
```bash
node update-api-url.js https://your-new-ngrok-url.ngrok.app
```

## 🎯 Workflow Lengkap

### 1. Development dengan Ngrok

```bash
# Terminal 1: Start backend dengan ngrok
python ngrok_auto_setup.py

# Terminal 2: Update frontend API URL
python update_ngrok_url.py

# Terminal 3: Start frontend development
npm run dev
```

### 2. Deploy ke Netlify

```bash
# Update API URL untuk production
node update-api-url.js https://your-production-api.com

# Build dan deploy
npm run build
netlify deploy --prod --dir=dist
```

## 🔍 Testing Production Deployment

### 1. Test Frontend

```bash
# Test build locally
npm run build
npm run preview
```

### 2. Test API Connection

```javascript
// Browser console pada site Netlify
fetch('/api/health')
  .then(res => res.json())
  .then(data => console.log('API Health:', data))
  .catch(err => console.error('API Error:', err));
```

## 🚨 Troubleshooting

### 1. Build Errors

```bash
# Clear cache dan reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 2. API Connection Issues

- ✅ Pastikan backend accessible via HTTPS
- ✅ Check CORS configuration di backend
- ✅ Verify environment variables di Netlify
- ✅ Check Network tab di browser DevTools

### 3. Routing Issues

- ✅ Pastikan file `_redirects` ada di `public/`
- ✅ Check Netlify redirect rules

## 📱 Custom Domain (Optional)

1. **Beli Domain** (Namecheap, GoDaddy, etc.)
2. **Add Custom Domain di Netlify**:
   - Site settings > Domain management
   - Add custom domain
3. **Update DNS** di domain provider:
   ```
   A Record: @ -> Netlify IP
   CNAME: www -> your-site.netlify.app
   ```

## 📋 Checklist Deployment

- [ ] ✅ Backend accessible via HTTPS (ngrok/VPS)
- [ ] ✅ Frontend build berhasil
- [ ] ✅ Environment variables set di Netlify
- [ ] ✅ _redirects file untuk SPA routing
- [ ] ✅ CORS headers configured
- [ ] ✅ API endpoints tested
- [ ] ✅ Production domain working

## 🎉 Hasil Akhir

Setelah deployment berhasil:
- ✅ Frontend accessible via `https://your-app.netlify.app`
- ✅ Backend API accessible via ngrok/VPS
- ✅ Full-stack application accessible dari internet
- ✅ Users dapat mengakses dari mana saja

---

**💡 Tips**: Gunakan ngrok untuk development dan testing, namun untuk production sebaiknya gunakan VPS atau cloud hosting yang lebih stabil.
