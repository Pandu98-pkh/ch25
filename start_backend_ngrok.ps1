# CounselorHub Backend with Ngrok
# Script PowerShell untuk menjalankan backend dengan ngrok

Write-Host "=" -ForegroundColor Cyan -NoNewline
Write-Host ("=" * 59) -ForegroundColor Cyan
Write-Host "🎯 CounselorHub Backend with Ngrok" -ForegroundColor Yellow
Write-Host "=" -ForegroundColor Cyan -NoNewline  
Write-Host ("=" * 59) -ForegroundColor Cyan
Write-Host "📋 This will:" -ForegroundColor White
Write-Host "   1. Start Flask backend server on localhost:5000" -ForegroundColor Gray
Write-Host "   2. Create ngrok tunnel for internet access" -ForegroundColor Gray
Write-Host "   3. Display public URL for your API" -ForegroundColor Gray
Write-Host "=" -ForegroundColor Cyan -NoNewline
Write-Host ("=" * 59) -ForegroundColor Cyan

# Function to start Flask server
function Start-FlaskServer {
    Write-Host "🚀 Starting Flask server..." -ForegroundColor Green
    Set-Location backend
    python app.py
}

# Function to start ngrok
function Start-Ngrok {
    Write-Host "🌐 Starting ngrok tunnel..." -ForegroundColor Blue
    Start-Sleep -Seconds 3
    ngrok http 5000
}

# Start Flask server in background job
Write-Host "📡 Starting Flask server in background..." -ForegroundColor Cyan
$flaskJob = Start-Job -ScriptBlock { 
    Set-Location $using:PWD
    Set-Location backend
    python app.py 
}

# Wait a moment for Flask to start
Start-Sleep -Seconds 5

# Check if Flask server is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Flask server is running!" -ForegroundColor Green
        Write-Host "🌐 Starting ngrok tunnel..." -ForegroundColor Blue
        
        # Start ngrok
        ngrok http 5000
    }
    else {
        Write-Host "❌ Flask server not responding" -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ Error checking Flask server: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "🔄 Trying to start ngrok anyway..." -ForegroundColor Yellow
    ngrok http 5000
}

# Cleanup
Write-Host "🧹 Cleaning up background jobs..." -ForegroundColor Yellow
Stop-Job $flaskJob
Remove-Job $flaskJob

Write-Host "👋 Goodbye!" -ForegroundColor Green
