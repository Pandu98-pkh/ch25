@echo off
title Update Netlify dengan Ngrok URL Baru

echo ============================================================
echo 🌐 Update Netlify Environment untuk Backend Ngrok
echo ============================================================
echo.

echo 📋 Langkah-langkah:
echo    1. Pastikan ngrok sudah berjalan untuk backend
echo    2. Dapatkan URL ngrok yang baru
echo    3. Update environment variable di Netlify
echo    4. Deploy ulang website
echo.

:get_ngrok_url
set /p NGROK_URL="📝 Masukkan URL ngrok Anda (contoh: https://xxxx.ngrok-free.app): "

if "%NGROK_URL%"=="" (
    echo ❌ URL ngrok tidak boleh kosong!
    goto get_ngrok_url
)

echo.
echo 🎯 URL ngrok yang akan digunakan: %NGROK_URL%
echo.

choice /M "Apakah URL ini sudah benar?"
if errorlevel 2 goto get_ngrok_url

echo.
echo 📝 Updating .env file...
echo # Database Configuration > .env
echo DB_HOST=localhost >> .env
echo DB_USER=root >> .env
echo DB_PASSWORD= >> .env
echo DB_NAME=counselorhub >> .env
echo. >> .env
echo # API Configuration >> .env
echo VITE_API_URL=%NGROK_URL% >> .env

echo ✅ .env file updated

echo.
echo 📝 Updating netlify.toml...
(
echo # Netlify Configuration File
echo [build]
echo   command = "npm run build"
echo   publish = "dist"
echo   
echo # Environment variables for Netlify
echo [build.environment]
echo   VITE_API_URL = "%NGROK_URL%"
echo   NODE_VERSION = "18"
echo.
echo # Headers for API calls to ngrok
echo [[headers]]
echo   for = "/api/*"
echo   [headers.values]
echo     Access-Control-Allow-Origin = "*"
echo     Access-Control-Allow-Methods = "GET, POST, PUT, DELETE, OPTIONS"
echo     Access-Control-Allow-Headers = "Content-Type, Authorization"
echo.
echo # Redirect rules for SPA
echo [[redirects]]
echo   from = "/*"
echo   to = "/index.html"
echo   status = 200
echo.
echo # API proxy to ngrok ^(fallback^)
echo [[redirects]]
echo   from = "/api/*"
echo   to = "%NGROK_URL%/api/:splat"
echo   status = 200
echo   force = true
) > netlify.toml

echo ✅ netlify.toml updated

echo.
echo 🚀 Building project...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed! Please check for errors.
    pause
    exit /b 1
)

echo ✅ Build successful!

echo.
echo 📤 Deploying to Netlify...
echo 💡 Upload folder 'dist' ke Netlify atau gunakan Netlify CLI

echo.
echo ============================================================
echo ✅ KONFIGURASI SELESAI!
echo ============================================================
echo.
echo 📋 Langkah selanjutnya:
echo    1. Buka https://app.netlify.com/sites/counselor-hub
echo    2. Pergi ke Site settings ^> Environment variables
echo    3. Update atau tambah: VITE_API_URL = %NGROK_URL%
echo    4. Klik Save
echo    5. Pergi ke Deploys ^> Trigger deploy ^> Deploy site
echo.
echo 🌐 Website Anda: https://counselor-hub.netlify.app
echo 🔧 Ngrok URL: %NGROK_URL%
echo.

pause
