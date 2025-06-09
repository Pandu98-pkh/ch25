# 🚀 LANGKAH-LANGKAH DEPLOY MANUAL KE NETLIFY

## Masalah yang Diselesaikan:
- Website blank setelah konfigurasi ngrok
- CORS error dari ngrok
- Environment variable tidak ter-update

## URL Ngrok Terbaru:
```
https://49f6-182-253-124-139.ngrok-free.app
```

## STEP 1: Update Environment Variable di Netlify Dashboard

1. **Buka Netlify Dashboard**
   - Pergi ke: https://app.netlify.com/
   - Login dengan akun Anda
   - Pilih site "counselor-hub"

2. **Navigasi ke Environment Variables**
   - Klik "Site configuration" di sidebar kiri
   - Pilih "Environment variables"

3. **Update Variable VITE_API_URL**
   - Cari variable `VITE_API_URL`
   - Klik "Edit" atau "Add a variable" jika belum ada
   - **Key**: `VITE_API_URL`
   - **Value**: `https://49f6-182-253-124-139.ngrok-free.app`
   - **Scopes**: Pilih "All deploy contexts"
   - Klik "Save"

## STEP 2: Trigger New Deployment

1. **Pergi ke Deploys Tab**
   - Klik tab "Deploys" di Netlify dashboard
   
2. **Trigger Deploy**
   - Klik "Trigger deploy" (tombol abu-abu)
   - Pilih "Clear cache and deploy site"
   - Tunggu sampai deployment selesai (biasanya 2-3 menit)

## STEP 3: Verifikasi

1. **Buka Website**
   - Setelah deployment selesai, buka: https://counselor-hub.netlify.app/
   - Website seharusnya tidak blank lagi

2. **Test API Connection**
   - Coba login atau akses fitur yang memerlukan API
   - Jika ada error CORS, tunggu beberapa menit dan refresh

## TROUBLESHOOTING

### Jika masih blank:
1. **Cek Browser Console**
   - Tekan F12 di browser
   - Lihat tab "Console" untuk error messages
   - Cari error terkait CORS atau network

2. **Clear Browser Cache**
   - Tekan Ctrl+Shift+R untuk hard refresh
   - Atau buka website di incognito mode

3. **Cek Network Tab**
   - Di Developer Tools, buka tab "Network"
   - Refresh halaman dan cek apakah ada request yang failed

### Jika ada CORS error:
1. **Pastikan ngrok masih running**
   - Cek di terminal apakah Flask dan ngrok masih aktif
   - URL ngrok berubah setiap restart

2. **Update URL jika berubah**
   - Jika ngrok URL berubah, ulangi STEP 1-2 dengan URL yang baru

## CARA CEK URL NGROK AKTIF

Buka Command Prompt dan jalankan:
```bash
curl -s http://localhost:4040/api/tunnels
```

Cari bagian "public_url" untuk mendapatkan URL aktif.

## CONTACTS & NOTES

- Jika masih ada masalah, screenshot error message dan kirim
- Ngrok URL akan berubah setiap kali restart, jadi perlu update manual
- Backend harus tetap running di localhost:5000 agar ngrok berfungsi
