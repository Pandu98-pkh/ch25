#!/usr/bin/env pwsh
# Script untuk deploy ke Netlify dengan ngrok backend

param(
    [string]$NgrokUrl = "",
    [switch]$Deploy = $false,
    [switch]$Help = $false
)

if ($Help) {
    Write-Host "=" -ForegroundColor Cyan -NoNewline
    Write-Host ("=" * 59) -ForegroundColor Cyan
    Write-Host "🚀 CounselorHub Netlify Deployment Script" -ForegroundColor Yellow
    Write-Host "=" -ForegroundColor Cyan -NoNewline  
    Write-Host ("=" * 59) -ForegroundColor Cyan
    Write-Host "Usage:" -ForegroundColor White
    Write-Host "  .\deploy-netlify.ps1 -NgrokUrl <url> [-Deploy]" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Parameters:" -ForegroundColor White
    Write-Host "  -NgrokUrl   Your ngrok URL (e.g., https://abc123.ngrok.app)" -ForegroundColor Gray
    Write-Host "  -Deploy     Actually deploy to Netlify (without this, just build)" -ForegroundColor Gray
    Write-Host "  -Help       Show this help message" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor White
    Write-Host "  .\deploy-netlify.ps1 -NgrokUrl https://abc123.ngrok.app" -ForegroundColor Gray
    Write-Host "  .\deploy-netlify.ps1 -NgrokUrl https://abc123.ngrok.app -Deploy" -ForegroundColor Gray
    return
}

Write-Host "=" -ForegroundColor Cyan -NoNewline
Write-Host ("=" * 59) -ForegroundColor Cyan
Write-Host "🚀 CounselorHub Netlify Deployment" -ForegroundColor Yellow
Write-Host "=" -ForegroundColor Cyan -NoNewline  
Write-Host ("=" * 59) -ForegroundColor Cyan

# Validate ngrok URL
if (-not $NgrokUrl) {
    Write-Host "❌ Error: NgrokUrl parameter is required" -ForegroundColor Red
    Write-Host "💡 Usage: .\deploy-netlify.ps1 -NgrokUrl https://your-ngrok-url.ngrok.app" -ForegroundColor Yellow
    return
}

if ($NgrokUrl -notmatch "^https://.*\.ngrok\.app$" -and $NgrokUrl -notmatch "^https://.*\.ngrok-free\.app$") {
    Write-Host "⚠️  Warning: URL doesn't look like a valid ngrok URL" -ForegroundColor Yellow
    Write-Host "   Expected format: https://xxxxx.ngrok.app or https://xxxxx.ngrok-free.app" -ForegroundColor Gray
}

Write-Host "📋 Configuration:" -ForegroundColor White
Write-Host "   Backend URL: $NgrokUrl" -ForegroundColor Gray
Write-Host "   Deploy Mode: $(if ($Deploy) { 'DEPLOY' } else { 'BUILD ONLY' })" -ForegroundColor Gray
Write-Host ""

# Step 1: Update environment files
Write-Host "🔧 Step 1: Updating environment configuration..." -ForegroundColor Blue

try {
    # Update .env
    $envContent = @"
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=counselorhub

# API Configuration
# Production ngrok URL
VITE_API_URL=$NgrokUrl

# Local development (commented out)
# VITE_API_URL=http://localhost:5000
"@
    
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ Updated .env" -ForegroundColor Green
    
    # Update .env.production
    $envProdContent = @"
# Production Environment Variables for Netlify
VITE_API_URL=$NgrokUrl
VITE_NODE_VERSION=18
VITE_BUILD_COMMAND=npm run build
VITE_PUBLISH_DIR=dist
VITE_VERBOSE=true
"@
    
    $envProdContent | Out-File -FilePath ".env.production" -Encoding UTF8
    Write-Host "✅ Updated .env.production" -ForegroundColor Green
    
    # Update netlify.toml
    $netlifyContent = @"
# Netlify Configuration File
[build]
  command = "npm run build"
  publish = "dist"
  
# Environment variables for Netlify
[build.environment]
  VITE_API_URL = "$NgrokUrl"
  NODE_VERSION = "18"

# Headers for API calls to ngrok
[[headers]]
  for = "/api/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Methods = "GET, POST, PUT, DELETE, OPTIONS"
    Access-Control-Allow-Headers = "Content-Type, Authorization"

# Redirect rules for SPA
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# API proxy to ngrok (fallback)
[[redirects]]
  from = "/api/*"
  to = "$NgrokUrl/api/:splat"
  status = 200
  force = true
"@
    
    $netlifyContent | Out-File -FilePath "netlify.toml" -Encoding UTF8
    Write-Host "✅ Updated netlify.toml" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error updating configuration files: $($_.Exception.Message)" -ForegroundColor Red
    return
}

# Step 2: Test ngrok endpoint
Write-Host ""
Write-Host "🌐 Step 2: Testing ngrok endpoint..." -ForegroundColor Blue

try {
    $healthUrl = "$NgrokUrl/health"
    Write-Host "   Testing: $healthUrl" -ForegroundColor Gray
    
    $response = Invoke-RestMethod -Uri $healthUrl -Method GET -TimeoutSec 10
    
    if ($response.status -eq "healthy") {
        Write-Host "✅ Backend is healthy and accessible!" -ForegroundColor Green
        Write-Host "   Database: $($response.database)" -ForegroundColor Gray
    } else {
        Write-Host "⚠️  Backend responded but status is: $($response.status)" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "❌ Error testing ngrok endpoint: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Make sure your Flask backend is running with ngrok" -ForegroundColor Yellow
    return
}

# Step 3: Install dependencies and build
Write-Host ""
Write-Host "📦 Step 3: Installing dependencies and building..." -ForegroundColor Blue

try {
    Write-Host "   Installing npm dependencies..." -ForegroundColor Gray
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        throw "npm install failed"
    }
    
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
    
    Write-Host "   Building for production..." -ForegroundColor Gray
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        throw "Build failed"
    }
    
    Write-Host "✅ Build completed successfully" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error during build: $($_.Exception.Message)" -ForegroundColor Red
    return
}

# Step 4: Deploy to Netlify (if requested)
if ($Deploy) {
    Write-Host ""
    Write-Host "🚀 Step 4: Deploying to Netlify..." -ForegroundColor Blue
    
    # Check if Netlify CLI is installed
    try {
        netlify --version | Out-Null
        Write-Host "✅ Netlify CLI found" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Netlify CLI not found. Installing..." -ForegroundColor Red
        npm install -g netlify-cli
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Failed to install Netlify CLI" -ForegroundColor Red
            return
        }
        
        Write-Host "✅ Netlify CLI installed" -ForegroundColor Green
    }
    
    try {
        Write-Host "   Deploying to https://counselor-hub.netlify.app..." -ForegroundColor Gray
        netlify deploy --prod --dir=dist
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Deployment successful!" -ForegroundColor Green
            Write-Host ""
            Write-Host "🎉 Your app is now live at: https://counselor-hub.netlify.app" -ForegroundColor Green
            Write-Host "🔗 Backend URL: $NgrokUrl" -ForegroundColor Blue
        } else {
            Write-Host "❌ Deployment failed" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "❌ Error during deployment: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host ""
    Write-Host "📋 Build completed successfully!" -ForegroundColor Green
    Write-Host "💡 To deploy to Netlify, run:" -ForegroundColor Yellow
    Write-Host "   .\deploy-netlify.ps1 -NgrokUrl $NgrokUrl -Deploy" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=" -ForegroundColor Cyan -NoNewline
Write-Host ("=" * 59) -ForegroundColor Cyan
Write-Host "🎯 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Make sure your Flask backend is running" -ForegroundColor Gray
Write-Host "2. Make sure ngrok tunnel is active: $NgrokUrl" -ForegroundColor Gray
Write-Host "3. Test your app at: https://counselor-hub.netlify.app" -ForegroundColor Gray
Write-Host "4. Monitor ngrok traffic at: http://localhost:4040" -ForegroundColor Gray
Write-Host "=" -ForegroundColor Cyan -NoNewline
Write-Host ("=" * 59) -ForegroundColor Cyan
