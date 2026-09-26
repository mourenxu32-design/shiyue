# 🚀 ShiYue - 本地 APK 构建一键脚本

## Windows PowerShell (推荐)

```powershell
<#
.SYNOPSIS
    ShiYue Android APK Build Script
.DESCRIPTION
    一键完成 Android APK 本地构建流程
.REQUIREMENTS
    - JDK 17+
    - Android SDK (通过 Android Studio 安装)
    - Git (可选，用于版本控制)
#>

param(
    [switch]$Clean,           # Clean + Build
    [switch]$Help             # 显示帮助信息
)

# 设置控制台颜色
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

# 检查 Java 环境
Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "   ShiYue - Local APK Build" -ForegroundColor Cyan
Write-Host "=========================================`n" -ForegroundColor Cyan

$scriptDir = Split-Path $MyInvocation.MyCommand.Path
$androidPath = Join-Path $PSScriptRoot "..\android"

# Check JAVA_HOME
if ($null -eq $env:JAVA_HOME -or -not (Test-Path "$env:JAVA_HOME")) {
    Write-Warn "JAVA_HOME not set or invalid"
    Write-Info "Installing JDK 17..." -ForegroundColor Cyan
    
    # Try to download OpenJDK 17
    $jdkUrl = "https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.9%2B9/OpenJDK17U-jdk_x64_windows_hotspot_17.0.9_9.msi"
    $installer = "$env:TEMP\jdk17-installer.msi"
    
    try {
        Invoke-WebRequest -Uri $jdkUrl -OutFile $installer -UseBasicParsing
        Start-Process msiexec.exe -ArgumentList "/i `"$installer`" /qn /norestart" -Wait
        
        # Set environment variable for current session
        $javaHome = "C:\Program Files\Eclipse Adoptium\jdk-17"
        $env:JAVA_HOME = $javaHome
        $env:Path = "$javaHome\bin;$env:Path"
        
        Write-Success "JDK 17 installed successfully!"
    } catch {
        Write-Error "Failed to install JDK 17. Please install manually from https://adoptium.net/"
        exit 1
    } finally {
        Remove-Item $installer -Force -ErrorAction SilentlyContinue
    }
} else {
    Write-Success "Java is available at: $($env:JAVA_HOME)"
}

# Verify Java version
$javaVersion = java -version 2>&1 | Select-Object -First 1
Write-Info "Current Java version: $javaVersion"

# Check ANDROID_HOME
if ($null -eq $env:ANDROID_HOME -or -not (Test-Path "$env:ANDROID_HOME")) {
    Write-Warn "ANDROID_HOME not set. Using default path."
    $env:ANDROID_HOME = "C:\Users\Administrator\AppData\Local\Android\Sdk"
    if (-not (Test-Path $env:ANDROID_HOME)) {
        Write-Error "Android SDK not found! Please install Android Studio first."
        exit 1
    }
}

Write-Success "Android SDK found at: $env:ANDROID_HOME"

# Navigate to Android project
Set-Location $androidPath
Write-Info "Working directory: $PWD"

# Clean build if requested
if ($Clean) {
    Write-Host "`n🧹 Cleaning previous builds..." -ForegroundColor Yellow
    if (Test-Path "gradlew.bat") {
        & .\gradlew.bat clean
        Write-Success "Clean completed!"
    } else {
        Write-Warn "gradlew.bat not found, skipping clean"
    }
}

# Build APK
Write-Host "`n🔨 Starting build process..." -ForegroundColor Yellow
$start = Get-Date

if (Test-Path "gradlew.bat") {
    $result = & .\gradlew.bat assembleDebug --no-daemon 2>&1
    $buildResult = $LASTEXITCODE
    
    $end = Get-Date
    $duration = New-TimeSpan -Start $start -End $end
    $minutes = [math]::Round($duration.TotalMinutes, 2)
} else {
    Write-Warn "Using system gradle command instead of wrapper"
    $result = gradle assembleDebug 2>&1
    $buildResult = $LASTEXITCODE
    $duration = New-TimeSpan -Start $start -End $end
    $minutes = [math]::Round($duration.TotalMinutes, 2)
}

# Check build result
if ($buildResult -eq 0) {
    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host "            ✅ BUILD SUCCESS!" -ForegroundColor Green
    Write-Host "=========================================" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "Build time: $minutes minutes" -ForegroundColor Cyan
    
    # Find APK files
    $apkDir = Join-Path $PSScriptRoot "..\app\build\outputs\apk\debug"
    $apkFiles = Get-ChildItem -Path $apkDir -Filter "*.apk" -ErrorAction SilentlyContinue
    
    if ($apkFiles.Count -gt 0) {
        Write-Host "`n📦 Generated APK files:" -ForegroundColor Cyan
        
        foreach ($apk in $apkFiles) {
            $sizeMB = [math]::Round($apk.Length / 1MB, 2)
            Write-Host "  - $($apk.Name) ($sizeMB MB)" -ForegroundColor White
            
            # Copy to output directory
            $outputDir = Join-Path $PSScriptRoot "..\..\android"
            if (-not (Test-Path $outputDir)) {
                New-Item -ItemType Directory -Path $outputDir | Out-Null
            }
            
            Copy-Item $apk.FullName (Join-Path $outputDir $apk.Name) -Force
        }
        
        Write-Host ""
        Write-Success "APK copied to: C:\Users\Administrator\Desktop\计划\android\"
        
        # Ask to open folder
        $openFolder = Read-Host "Open APK directory now? (y/n)"
        if ($openFolder -eq 'y') {
            Start-Process explorer.exe -ArgumentList (Get-ChildItem "$outputDir\*.apk" | Select-Object -First 1).FullName
        }
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
    Write-Host "  1. Make sure JDK 17 is installed" -ForegroundColor White
    Write-Host "  2. Check if Android SDK is properly configured" -ForegroundColor White
    Write-Host "  3. Run 'gradlew clean' and try again" -ForegroundColor White
    Write-Host "  4. See LOCAL_BUILD_GUIDE.md for detailed help" -ForegroundColor White
}

Set-Location $scriptDir
Write-Host "`nScript completed at $(Get-Date)" -ForegroundColor Gray
