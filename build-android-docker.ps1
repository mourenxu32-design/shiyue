# Windows PowerShell Docker Build Script
# 为 Windows 用户优化的 APK 构建脚本

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   ShiYue APK Docker Build (Windows)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "C:\Users\Administrator\Desktop\计划\shiyue_app"
Set-Location $projectRoot

# Check if Docker is installed
try {
    docker --version | Out-Null
} catch {
    Write-Host "❌ ERROR: Docker Desktop not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install and start Docker Desktop:" -ForegroundColor Yellow
    Write-Host "  https://www.docker.com/products/docker-desktop/" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✓ Docker Desktop detected" -ForegroundColor Green
Write-Host ""

# Clean previous build artifacts
Write-Host "📦 Cleaning previous builds..." -ForegroundColor Yellow
docker compose down -v 2>$null

# Build APK using Docker
Write-Host "🔨 Starting Docker build process..." -ForegroundColor Cyan
Write-Host ""

docker compose up --build

# Extract the APK
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "           ✅ BUILD SUCCESS! ✅" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Find the latest APK file
$apkFiles = Get-ChildItem "$projectRoot/android/app/build/outputs/apk/debug/*.apk" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1

if ($apkFiles) {
    Write-Host "📦 APK File Details:" -ForegroundColor Cyan
    Write-Host "  Location: $($apkFiles.FullName)" -ForegroundColor White
    Write-Host "  Size:     $([math]::Round($apkFiles.Length / 1MB, 2)) MB" -ForegroundColor White
    Write-Host "  Name:     $($apkFiles.Name)" -ForegroundColor White
    Write-Host ""
    
    # Copy to output directory
    $outputDir = "C:\Users\Administrator\Desktop\计划\android"
    if (-not (Test-Path $outputDir)) {
        New-Item -ItemType Directory -Path $outputDir | Out-Null
    }
    
    Copy-Item $apkFiles.FullName "$outputDir\ShiYue_v1.0.apk" -Force
    
    Write-Host "✅ APK copied to:" -ForegroundColor Green
    Write-Host "  $outputDir\ShiYue_v1.0.apk" -ForegroundColor Yellow
    Write-Host ""
    
    # Open folder
    Start-Process explorer.exe -ArgumentList "/select," + $apkFiles.FullName
} else {
    Write-Host "⚠️ WARNING: No APK file found!" -ForegroundColor Yellow
    Write-Host ""
}

Read-Host "Press Enter to complete"
