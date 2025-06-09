@echo off
REM CounselorHub - Netlify Deployment Script (Windows)
echo ============================================================
echo 🚀 CounselorHub - Netlify Deployment
echo ============================================================

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python and try again
    pause
    exit /b 1
)

REM Run the Python deployment script
echo 📋 Running deployment script...
python deploy_to_netlify.py

if %errorlevel% neq 0 (
    echo ❌ Deployment script failed
    pause
    exit /b 1
)

echo.
echo ✅ Deployment preparation completed!
echo 📁 Your build is ready in the 'dist' folder
echo 🌐 Upload the 'dist' folder to Netlify
echo.
pause
