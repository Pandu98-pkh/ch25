#!/usr/bin/env pwsh
<#
.SYNOPSIS
Deploy CounselorHub ke Netlify dengan konfigurasi ngrok terbaru

.DESCRIPTION
Script ini akan:
1. Build aplikasi React dengan environment variable terbaru
2. Deploy ke Netlify
3. Menampilkan status deployment
#>

Write-Host "🚀 Deploying CounselorHub to Netlify..." -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Cek apakah Netlify CLI terinstall
if (-not (Get-Command "netlify" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Netlify CLI not found. Installing..." -ForegroundColor Red
    npm install -g netlify-cli
}

# Build aplikasi
Write-Host "📦 Building application..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
    
    # Deploy ke Netlify
    Write-Host "🌐 Deploying to Netlify..." -ForegroundColor Yellow
    netlify deploy --prod --dir=dist --site=counselor-hub
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Deployment successful!" -ForegroundColor Green
        Write-Host "🌍 Your site is live at: https://counselor-hub.netlify.app/" -ForegroundColor Cyan
        
        # Buka browser
        Write-Host "🔗 Opening site in browser..." -ForegroundColor Yellow
        Start-Process "https://counselor-hub.netlify.app/"
    } else {
        Write-Host "❌ Deployment failed!" -ForegroundColor Red
        Write-Host "💡 Try manual deployment through Netlify dashboard" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    Write-Host "🔍 Check build errors above" -ForegroundColor Yellow
}

Write-Host "=============================================" -ForegroundColor Green
Write-Host "✨ Deployment process completed!" -ForegroundColor Green
