#!/usr/bin/env pwsh
# Script lengkap untuk setup CounselorHub dengan ngrok dan Netlify

Write-Host "=" -ForegroundColor Cyan -NoNewline
Write-Host ("=" * 69) -ForegroundColor Cyan
Write-Host "🎯 CounselorHub - Complete Setup with Ngrok & Netlify" -ForegroundColor Yellow
Write-Host "=" -ForegroundColor Cyan -NoNewline  
Write-Host ("=" * 69) -ForegroundColor Cyan
Write-Host "📋 This script will:" -ForegroundColor White
Write-Host "   1. Start Flask backend server" -ForegroundColor Gray
Write-Host "   2. Create ngrok tunnel for internet access" -ForegroundColor Gray
Write-Host "   3. Get the ngrok URL" -ForegroundColor Gray
Write-Host "   4. Configure frontend to use ngrok URL" -ForegroundColor Gray
Write-Host "   5. Build and deploy to Netlify" -ForegroundColor Gray
Write-Host "=" -ForegroundColor Cyan -NoNewline
Write-Host ("=" * 69) -ForegroundColor Cyan
Write-Host ""

# Step 1: Check prerequisites
Write-Host "🔍 Step 1: Checking prerequisites..." -ForegroundColor Blue

$prerequisites = @()

# Check Python
try {
    python --version | Out-Null
    Write-Host "✅ Python is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found" -ForegroundColor Red
    $prerequisites += "Python"
}

# Check Node.js
try {
    node --version | Out-Null
    Write-Host "✅ Node.js is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found" -ForegroundColor Red
    $prerequisites += "Node.js"
}

# Check ngrok
try {
    ngrok version | Out-Null
    Write-Host "✅ ngrok is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ ngrok not found" -ForegroundColor Red
    $prerequisites += "ngrok"
}

if ($prerequisites.Count -gt 0) {
    Write-Host ""
    Write-Host "❌ Missing prerequisites: $($prerequisites -join ', ')" -ForegroundColor Red
    Write-Host "💡 Please install missing software and try again" -ForegroundColor Yellow
    return
}

Write-Host ""

# Step 2: Start backend
Write-Host "🚀 Step 2: Starting Flask backend..." -ForegroundColor Blue

$backendJob = $null
try {
    Write-Host "   Starting Flask server in background..." -ForegroundColor Gray
    $backendJob = Start-Job -ScriptBlock { 
        Set-Location "d:\ch25\backend"
        python app.py 
    }
    
    # Wait for backend to start
    Start-Sleep -Seconds 10
    
    # Test if backend is running
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5000/health" -TimeoutSec 5
        if ($response.status -eq "healthy") {
            Write-Host "✅ Flask backend is running and healthy!" -ForegroundColor Green
        } else {
            throw "Backend unhealthy"
        }
    } catch {
        Write-Host "❌ Backend failed to start properly" -ForegroundColor Red
        if ($backendJob) { Stop-Job $backendJob; Remove-Job $backendJob }
        return
    }
} catch {
    Write-Host "❌ Error starting backend: $($_.Exception.Message)" -ForegroundColor Red
    return
}

Write-Host ""

# Step 3: Start ngrok
Write-Host "🌐 Step 3: Creating ngrok tunnel..." -ForegroundColor Blue

$ngrokJob = $null
try {
    Write-Host "   Starting ngrok tunnel for port 5000..." -ForegroundColor Gray
    
    # Start ngrok in background and capture output
    $ngrokJob = Start-Job -ScriptBlock { 
        ngrok http 5000 --log=stdout 2>&1
    }
    
    # Wait for ngrok to establish tunnel
    Start-Sleep -Seconds 8
    
    # Get ngrok URL from API
    try {
        $ngrokApi = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -TimeoutSec 5
        $ngrokUrl = $ngrokApi.tunnels[0].public_url
        
        if ($ngrokUrl) {
            Write-Host "✅ Ngrok tunnel established!" -ForegroundColor Green
            Write-Host "   Public URL: $ngrokUrl" -ForegroundColor Cyan
        } else {
            throw "No tunnel URL found"
        }
    } catch {
        Write-Host "❌ Failed to get ngrok URL" -ForegroundColor Red
        if ($ngrokJob) { Stop-Job $ngrokJob; Remove-Job $ngrokJob }
        if ($backendJob) { Stop-Job $backendJob; Remove-Job $backendJob }
        return
    }
} catch {
    Write-Host "❌ Error starting ngrok: $($_.Exception.Message)" -ForegroundColor Red
    if ($backendJob) { Stop-Job $backendJob; Remove-Job $backendJob }
    return
}

Write-Host ""

# Step 4: Test ngrok endpoint
Write-Host "🧪 Step 4: Testing ngrok endpoint..." -ForegroundColor Blue

try {
    $healthUrl = "$ngrokUrl/health"
    Write-Host "   Testing: $healthUrl" -ForegroundColor Gray
    
    $response = Invoke-RestMethod -Uri $healthUrl -Method GET -TimeoutSec 10
    
    if ($response.status -eq "healthy") {
        Write-Host "✅ Backend is accessible via ngrok!" -ForegroundColor Green
        Write-Host "   Database: $($response.database)" -ForegroundColor Gray
    } else {
        Write-Host "⚠️  Backend responded but status is: $($response.status)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error testing ngrok endpoint: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Continuing anyway..." -ForegroundColor Yellow
}

Write-Host ""

# Step 5: Configure and deploy
Write-Host "📦 Step 5: Configuring and deploying to Netlify..." -ForegroundColor Blue

try {
    Write-Host "   Running deployment script..." -ForegroundColor Gray
    
    # Run our deployment script
    & ".\deploy-netlify.ps1" -NgrokUrl $ngrokUrl -Deploy
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Deployment completed!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Deployment may have issues (exit code: $LASTEXITCODE)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error during deployment: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=" -ForegroundColor Cyan -NoNewline
Write-Host ("=" * 69) -ForegroundColor Cyan
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "=" -ForegroundColor Cyan -NoNewline
Write-Host ("=" * 69) -ForegroundColor Cyan
Write-Host "📋 Your application is now running:" -ForegroundColor White
Write-Host "   🌐 Website: https://counselor-hub.netlify.app" -ForegroundColor Cyan
Write-Host "   🔗 Backend: $ngrokUrl" -ForegroundColor Cyan
Write-Host "   📊 Ngrok Inspector: http://localhost:4040" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANT NOTES:" -ForegroundColor Yellow
Write-Host "   • Keep this PowerShell window open to maintain the ngrok tunnel" -ForegroundColor Gray
Write-Host "   • The ngrok URL will change when you restart ngrok" -ForegroundColor Gray
Write-Host "   • You'll need to redeploy to Netlify if ngrok URL changes" -ForegroundColor Gray
Write-Host "   • Backend jobs are running in background (Flask & ngrok)" -ForegroundColor Gray
Write-Host ""
Write-Host "🛑 To stop servers:" -ForegroundColor Red
Write-Host "   Press Ctrl+C to stop this script and cleanup background jobs" -ForegroundColor Gray
Write-Host "=" -ForegroundColor Cyan -NoNewline
Write-Host ("=" * 69) -ForegroundColor Cyan

# Keep script running and handle cleanup on exit
try {
    Write-Host ""
    Write-Host "⏳ Servers are running... Press Ctrl+C to stop" -ForegroundColor Yellow
    
    # Wait indefinitely
    while ($true) {
        Start-Sleep -Seconds 30
        
        # Check if jobs are still running
        if ($backendJob -and $backendJob.State -ne "Running") {
            Write-Host "⚠️  Backend job stopped unexpectedly" -ForegroundColor Yellow
        }
        
        if ($ngrokJob -and $ngrokJob.State -ne "Running") {
            Write-Host "⚠️  Ngrok job stopped unexpectedly" -ForegroundColor Yellow
        }
    }
} finally {
    Write-Host ""
    Write-Host "🧹 Cleaning up background jobs..." -ForegroundColor Yellow
    
    if ($backendJob) {
        Stop-Job $backendJob -ErrorAction SilentlyContinue
        Remove-Job $backendJob -ErrorAction SilentlyContinue
        Write-Host "✅ Backend job stopped" -ForegroundColor Green
    }
    
    if ($ngrokJob) {
        Stop-Job $ngrokJob -ErrorAction SilentlyContinue
        Remove-Job $ngrokJob -ErrorAction SilentlyContinue
        Write-Host "✅ Ngrok job stopped" -ForegroundColor Green
    }
    
    Write-Host "👋 Goodbye!" -ForegroundColor Green
}
