# Script untuk mengupdate environment variable di Netlify
# Membutuhkan Netlify CLI (npm install -g netlify-cli)

param(
    [string]$NgrokUrl = "",
    [string]$SiteName = "counselor-hub"
)

Write-Host "🌐 Netlify Environment Update Script" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

# Function to get current ngrok URL
function Get-NgrokUrl {
    try {
        # Try to get ngrok URL from local ngrok API
        $response = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -TimeoutSec 5
        $tunnel = $response.tunnels | Where-Object { $_.proto -eq "https" } | Select-Object -First 1
        if ($tunnel) {
            return $tunnel.public_url
        }
    }
    catch {
        Write-Host "⚠️  Cannot auto-detect ngrok URL. Please provide manually." -ForegroundColor Yellow
    }
    return $null
}

# Get ngrok URL
if (-not $NgrokUrl) {
    Write-Host "🔍 Trying to auto-detect ngrok URL..." -ForegroundColor Blue
    $NgrokUrl = Get-NgrokUrl
}

if (-not $NgrokUrl) {
    $NgrokUrl = Read-Host "📝 Please enter your ngrok URL (e.g., https://xxxx.ngrok-free.app)"
}

if (-not $NgrokUrl) {
    Write-Host "❌ No ngrok URL provided. Exiting." -ForegroundColor Red
    exit 1
}

Write-Host "🎯 Using ngrok URL: $NgrokUrl" -ForegroundColor Green

# Check if Netlify CLI is installed
try {
    $netlifyVersion = netlify --version
    Write-Host "✅ Netlify CLI found: $netlifyVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Netlify CLI not found. Installing..." -ForegroundColor Red
    Write-Host "💡 Run: npm install -g netlify-cli" -ForegroundColor Yellow
    Write-Host "💡 Then login: netlify login" -ForegroundColor Yellow
    exit 1
}

try {
    # Update environment variable
    Write-Host "📝 Updating VITE_API_URL environment variable..." -ForegroundColor Blue
    
    $result = netlify env:set VITE_API_URL $NgrokUrl --site $SiteName
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Environment variable updated successfully!" -ForegroundColor Green
        
        # Trigger new deployment
        Write-Host "🚀 Triggering new deployment..." -ForegroundColor Blue
        netlify deploy --prod --site $SiteName
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Deployment triggered successfully!" -ForegroundColor Green
            Write-Host "🌐 Your site will be updated shortly at: https://counselor-hub.netlify.app" -ForegroundColor Cyan
            Write-Host "📊 Monitor deployment at: https://app.netlify.com/sites/$SiteName/deploys" -ForegroundColor Cyan
        }
        else {
            Write-Host "❌ Failed to trigger deployment. Please deploy manually." -ForegroundColor Red
        }
    }
    else {
        Write-Host "❌ Failed to update environment variable." -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Make sure you're logged in: netlify login" -ForegroundColor Yellow
    Write-Host "💡 Make sure site name is correct: $SiteName" -ForegroundColor Yellow
}

Write-Host "`n🔗 Useful links:" -ForegroundColor Cyan
Write-Host "   Site: https://counselor-hub.netlify.app" -ForegroundColor Gray
Write-Host "   Netlify Dashboard: https://app.netlify.com/sites/$SiteName" -ForegroundColor Gray
Write-Host "   Ngrok Web Interface: http://localhost:4040" -ForegroundColor Gray
