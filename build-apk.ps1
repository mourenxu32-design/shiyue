# 🚀 ShiYue - 本地 APK 构建脚本 v2.0
# 完整版：包含前端构建和 Android 打包

param(
    [switch]$Clean,           # 清理 + 构建
    [switch]$FrontendOnly,    # 仅构建前端（不生成 APK）
    [switch]$AndroidOnly,     # 仅构建 Android（跳过前端）
    [switch]$Help             # 显示帮助信息
)

$ProgressPreference = 'SilentlyContinue'

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Cyan
}

function Write-Warn {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

if ($Help) {
    Write-Host "`n=========================================" -ForegroundColor Cyan
    Write-Host "   ShiYue - Local Build Help" -ForegroundColor Cyan
    Write-Host "=========================================`n" -ForegroundColor Cyan
    Write-Host "Usage: .\build-apk.ps1 [options]`n" -ForegroundColor White
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  -Clean       Clean previous builds before building" -ForegroundColor White
    Write-Host "  -FrontendOnly    Only build frontend (npm run build)" -ForegroundColor White
    Write-Host "  -AndroidOnly     Only build Android APK (skip npm install/build)" -ForegroundColor White
    Write-Host "  -Help            Show this help message" -ForegroundColor White
    Write-Host "`nExamples:" -ForegroundColor Cyan
    Write-Host "  .\build-apk.ps1                 # Full build (frontend + APK)" -ForegroundColor Gray
    Write-Host "  .\build-apk.ps1 -Clean          # Clean and rebuild" -ForegroundColor Gray
    Write-Host "  .\build-apk.ps1 -FrontendOnly   # Only build web app" -ForegroundColor Gray
    exit 0
}

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "   ShiYue - Local APK Build v2.0" -ForegroundColor Cyan
Write-Host "=========================================`n" -ForegroundColor Cyan

$scriptDir = Split-Path $MyInvocation.MyCommand.Path
Set-Location $scriptDir

$nodeModulesPath = Join-Path $PSScriptRoot "node_modules"
$appBuildOutput = Join-Path $PSScriptRoot "..\android"

# Step 0: Check Node.js and Install Dependencies
if (-not $FrontendOnly) {
    Write-Host "`n📦 Step 0: Checking Node.js..." -ForegroundColor Yellow
    
    try {
        $nodeVersion = node --version 2>&1
        if ($LASTEXITCODE -ne 0) { throw "Node not found" }
        Write-Success "Node.js found: $nodeVersion"
    } catch {
        Write-Error "Node.js is required but not installed!"
        Write-Info "Please install from: https://nodejs.org/"
        exit 1
    }
    
    # Install npm dependencies
    if ((Test-Path $nodeModulesPath) -and (Get-ChildItem $nodeModulesPath | Measure-Object).Count -eq 0) {
        Write-Info "Empty node_modules found, reinstalling..." -ForegroundColor Cyan
        Remove-Item $nodeModulesPath -Recurse -Force
    }
    
    if (-not (Test-Path $nodeModulesPath)) {
        Write-Host "`n🔧 Installing Node.js dependencies..." -ForegroundColor Cyan
        Write-Info "This may take a few minutes..." -ForegroundColor Gray
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to install npm dependencies! Check error messages above."
            exit 1
        }
        Write-Success "npm packages installed successfully!"
    } else {
        Write-Success "node_modules already exists"
    }
}

# Step 1: Build Frontend (Web App)
if (-not $AndroidOnly) {
    Write-Host "`n🌐 Step 1: Building Frontend (Vite)..." -ForegroundColor Yellow
    
    $start = Get-Date
    
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Frontend build failed! Check error messages above."
        exit 1
    }
    
    $end = Get-Date
    $duration = New-TimeSpan -Start $start -End $end
    $minutes = [math]::Round($duration.TotalMinutes, 2)
    
    Write-Success "Frontend built successfully! (${minutes} min)"
    
    # Verify dist directory exists
    $distDir = Join-Path $PSScriptRoot "dist"
    if (-not (Test-Path $distDir)) {
        Write-Error "Frontend build completed but 'dist' directory not found!"
        exit 1
    }
    
    $distFiles = Get-ChildItem $distDir -Recurse | Measure-Object
    Write-Info "Generated $distFiles.Count files in dist/ directory"
}

# Navigate to Android project
$androidPath = Join-Path $PSScriptRoot "android"
Set-Location $androidPath

# Step 2: Setup Environment Variables
Write-Host "`n⚙️ Step 2: Setting up Android build environment..." -ForegroundColor Yellow

if (-not $env:JAVA_HOME) {
    # Try to find JDK 17
    $jdkPaths = @(
        "C:\Program Files\jdk-17",
        "C:\Program Files\Eclipse Adoptium\jdk-17",
        "D:\java\jdk-17",
        "C:\Program Files\Java\jdk-17"
    )
    
    foreach ($path in $jdkPaths) {
        if (Test-Path (Join-Path $path "bin\java.exe")) {
            $env:JAVA_HOME = $path
            Write-Success "Found JDK at: $path"
            break
        }
    }
}

if (-not $env:JAVA_HOME) {
    Write-Error "JDK 17 not found! Please install JDK 17 from https://adoptium.net/"
    exit 1
}

# Set ANDROID_HOME if not set
if (-not $env:ANDROID_HOME) {
    $androidSdkPaths = @(
        "C:\Users\Administrator\AppData\Local\Android\Sdk",
        "C:\Android\sdk"
    )
    
    foreach ($path in $androidSdkPaths) {
        if (Test-Path $path) {
            $env:ANDROID_HOME = $path
            Write-Success "Found Android SDK at: $path"
            break
        }
    }
}

if (-not (Test-Path $env:ANDROID_HOME)) {
    Write-Warn "ANDROID_HOME not set. You need Android SDK installed via Android Studio."
    Write-Info "Download: https://developer.android.com/studio"
    Read-Host "Press Enter to continue anyway (may fail)"
}

# Step 3: Clean & Build APK
if ($Clean) {
    Write-Host "`n🧹 Step 3a: Cleaning..." -ForegroundColor Yellow
    if (Test-Path "gradlew.bat") {
        & .\gradlew.bat clean --no-daemon > $null 2>&1
        Write-Success "Clean completed!"
    }
}

Write-Host "`n Step 3b: Building APK (Gradle)..." -ForegroundColor Yellow

$start = Get-Date

if (Test-Path "gradlew.bat") {
    Write-Info "Using Gradle Wrapper (recommended)..." -ForegroundColor Gray
    $result = & .\gradlew.bat assembleDebug --no-daemon 2>&1
    $buildResult = $LASTEXITCODE
} else {
    Write-Error "gradlew.bat not found! Make sure Gradle wrapper is set up correctly."
    exit 1
}

$end = Get-Date
$duration = New-TimeSpan -Start $start -End $end
$totalMinutes = [math]::Round($duration.TotalMinutes, 2)

# Check build result
if ($buildResult -eq 0) {
    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host "            ✅ BUILD SUCCESS!" -ForegroundColor Green
    Write-Host "=========================================" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "Total build time: ${totalMinutes} minutes" -ForegroundColor Cyan
    
    # Find APK files
    $apkDir = Join-Path $PSScriptRoot "app\build\outputs\apk\debug"
    $apkFiles = Get-ChildItem -Path $apkDir -Filter "*.apk" -ErrorAction SilentlyContinue
    
    if ($apkFiles.Count -gt 0) {
        Write-Host "`n📦 Generated APK files:" -ForegroundColor Cyan
        
        foreach ($apk in $apkFiles) {
            $sizeMB = [math]::Round($apk.Length / 1MB, 2)
            Write-Host "  - $($apk.Name) ($sizeMB MB)" -ForegroundColor White
            
            # Copy to output directory with timestamp
            $outputDir = Join-Path $PSScriptRoot "..\..\android"
            if (-not (Test-Path $outputDir)) {
                New-Item -ItemType Directory -Path $outputDir | Out-Null
            }
            
            $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
            $destPath = Join-Path $outputDir "$($apk.BaseName)_v${timestamp}.apk"
            Copy-Item $apk.FullName $destPath -Force
            Write-Host "  ✓ Copied to: $($destPath.Substring(0, [Math]::Min(80, $destPath.Length)))..." -ForegroundColor Green
        }
        
        Write-Host ""
        Write-Success "APK saved to: C:\Users\Administrator\Desktop\计划\android\"
        Write-Host ""
        
        # Auto-open folder after 2 seconds
        Start-Sleep -Seconds 2
        explorer.exe $outputDir
    } else {
        Write-Warn "No APK file found! Check console output above."
    }
} else {
    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Red
    Write-Host "              ❌ BUILD FAILED!" -ForegroundColor Red
    Write-Host "=========================================" -ForegroundColor Red
    
    Write-Host "`nBuild logs:" -ForegroundColor Yellow
    $result | Out-String | Write-Host
    
    # Suggest troubleshooting
    Write-Host "`n💡 Troubleshooting tips:" -ForegroundColor Cyan
    Write-Host "  1. Make sure JDK 17 is installed and JAVA_HOME is set" -ForegroundColor White
    Write-Host "  2. Check if Android SDK is properly configured" -ForegroundColor White
    Write-Host "  3. Run 'gradlew clean' and try again" -ForegroundColor White
    Write-Host "  4. See LOCAL_BUILD_GUIDE.md for detailed help" -ForegroundColor White
    Write-Host "  5. Check Bitrise.io for CI/CD alternative" -ForegroundColor White
}

# Return to project root
Set-Location $scriptDir
Write-Host "`n✓ Script completed at $(Get-Date)" -ForegroundColor Gray