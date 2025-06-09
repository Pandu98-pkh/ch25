# PANDUAN KONFIGURASI NETLIFY UNTUK TERHUBUNG DENGAN NGROK

## 1. Environment Variables di Netlify Dashboard

Masuk ke Netlify Dashboard Anda di https://app.netlify.com dan ikuti langkah berikut:

### A. Buka Site Settings
1. Pilih site "counselor-hub" Anda
2. Klik "Site settings" 
3. Pilih "Environment variables" di sidebar

### B. Tambahkan Environment Variables
Klik "Add variable" dan tambahkan:

```
Key: VITE_API_URL
Value: https://c30c-182-253-124-139.ngrok-free.app
```

⚠️ **PENTING**: Ganti URL ngrok di atas dengan URL ngrok aktual Anda yang sedang berjalan.

### C. Cara Mendapatkan URL Ngrok Anda:
1. Jalankan script ngrok: `./start_backend_ngrok.bat`
2. Lihat output terminal untuk URL seperti: `https://xxxx-xxx-xxx-xxx.ngrok-free.app`
3. Copy URL tersebut dan paste di Netlify environment variable

## 2. Build Settings di Netlify

### A. Build Command
```
npm run build
```

### B. Publish Directory
```
dist
```

### C. Node Version (opsional)
Tambahkan file .nvmrc di root project jika perlu:
```
18
```

## 3. Redirect Rules (sudah ada di _redirects)

File `_redirects` yang sudah ada akan menangani SPA routing dengan baik.

## 4. Headers Configuration

File `_headers` akan menangani CORS dan security headers.

## 5. Deploy Ulang

Setelah environment variable ditambahkan:
1. Klik "Deploys" tab
2. Klik "Trigger deploy" > "Deploy site"
3. Tunggu hingga build selesai

## 6. Testing Koneksi

Setelah deploy selesai, buka https://counselor-hub.netlify.app dan:
1. Buka Developer Tools (F12)
2. Pergi ke tab Network
3. Coba akses halaman Students atau Classes
4. Lihat apakah API calls berhasil ke ngrok URL Anda

## 7. Troubleshooting

### Jika API calls gagal:
1. ✅ Pastikan backend Flask berjalan di localhost:5000
2. ✅ Pastikan ngrok tunnel aktif
3. ✅ Pastikan VITE_API_URL di Netlify sesuai URL ngrok
4. ✅ Pastikan tidak ada typo di URL ngrok
5. ✅ Deploy ulang setelah mengubah environment variable

### Jika ada CORS error:
- Backend Flask sudah dikonfigurasi dengan CORS, tapi pastikan ngrok tidak memblokir

### Jika ngrok URL berubah:
- Update VITE_API_URL di Netlify
- Trigger deploy ulang

## 8. Script Otomatis (Opsional)

Gunakan script yang telah dibuat untuk:
- `update_ngrok_and_deploy.ps1` - Update ngrok URL dan deploy otomatis
- `start_backend_ngrok.bat` - Start backend dengan ngrok

## URL Penting:
- Netlify Site: https://counselor-hub.netlify.app/
- Netlify Dashboard: https://app.netlify.com/sites/counselor-hub
- Ngrok Web Interface: http://localhost:4040 (saat ngrok berjalan)
