# 🚀 ShiYue - Bitrise.io CI/CD Setup
## Windows PowerShell Script

```powershell
# Quick Start for Windows Users
cd C:\Users\Administrator\Desktop\计划\shiyue_app

# Initialize Git if needed
if (-not (Test-Path .git)) {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
}

# Add remote origin (replace with your GitHub URL)
git remote add origin https://github.com/yourusername/shiyue-app.git

# Commit and push
git add bitrise.yml setup-bitrise.sh BITRISE_SETUP_GUIDE.md DOCKER_GUIDE.md DOKCER_QUICKSTART.md build-android-docker.ps1 build-android-docker.sh docker-compose.yml Dockerfile.android
git commit -m "Add Bitrise CI/CD configuration"

# Push to GitHub
git push -u origin main --force

Write-Host "`nNext step:" -ForegroundColor Cyan
Write-Host "Go to https://www.bitrise.io/" -ForegroundColor White
Write-Host "Connect your GitHub repo and deploy!" -ForegroundColor White
```
