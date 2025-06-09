@echo off
echo ============================================
echo   CounselorHub - Update Netlify Config
echo ============================================
echo.

REM Get current ngrok URL
echo 🔍 Getting current ngrok URL...
for /f "tokens=*" %%i in ('curl -s http://localhost:4040/api/tunnels ^| findstr "public_url"') do set NGROK_RESPONSE=%%i

REM Extract URL (simple method)
echo %NGROK_RESPONSE% | findstr "https://" > temp_url.txt
for /f "tokens=2 delims=:" %%i in (temp_url.txt) do (
    for /f "tokens=1 delims=," %%j in ("%%i") do (
        set NGROK_URL=%%j
        set NGROK_URL=!NGROK_URL:"=!
        set NGROK_URL=https:!NGROK_URL!
    )
)
del temp_url.txt

echo ✅ Current ngrok URL: %NGROK_URL%
echo.

echo 📝 INSTRUKSI MANUAL UPDATE NETLIFY:
echo.
echo 1. Buka https://app.netlify.com/
echo 2. Pilih site "counselor-hub"
echo 3. Klik "Site configuration" → "Environment variables"
echo 4. Edit variable VITE_API_URL dengan value:
echo    %NGROK_URL%
echo 5. Klik "Deploys" → "Trigger deploy" → "Clear cache and deploy site"
echo.

echo ⏳ Tunggu deployment selesai, lalu test website:
echo    https://counselor-hub.netlify.app/
echo.

echo 🔗 Buka Netlify Dashboard?
choice /c YN /m "Buka browser untuk update manual (Y/N)?"
if errorlevel 2 goto end
if errorlevel 1 start https://app.netlify.com/

:end
echo.
echo ✨ Update instructions completed!
pause
