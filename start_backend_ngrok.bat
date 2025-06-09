@echo off
title CounselorHub - Backend with Ngrok

echo ============================================================
echo 🎯 CounselorHub Backend with Ngrok
echo ============================================================
echo 📋 This will:
echo    1. Start Flask backend server on localhost:5000
echo    2. Create ngrok tunnel for internet access  
echo    3. Display public URL for your API
echo ============================================================
echo.

echo 🚀 Starting Flask server...
cd backend
start "Flask Server" python app.py

echo ⏳ Waiting for Flask server to start...
timeout /t 5 /nobreak >nul

echo 🌐 Starting ngrok tunnel...
echo 📝 Press Ctrl+C to stop both services
echo.

ngrok http 5000

echo.
echo 👋 Ngrok stopped. Flask server may still be running.
echo 💡 Check Task Manager to close python.exe if needed.
pause
