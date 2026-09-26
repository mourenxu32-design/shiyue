# ShiYue GitHub Cleanup Script
# Reduces to under 100 files for upload

Set-Location "C:\Users\Administrator\Desktop\计划\shiyue_app"

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "   🎯 Final Cleanup for GitHub Upload" -ForegroundColor Cyan
Write-Host "=========================================`n" -ForegroundColor Cyan

$countBefore = Get-ChildItem -Recurse | Measure-Object
Write-Host "Current files: $($countBefore.Count)" -ForegroundColor Yellow

Write-Host "`nRemoving build artifacts and caches..." -ForegroundColor Gray

# Remove node_modules completely (already removed .log files earlier)
if (Test-Path "node_modules") {
    Remove-Item "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✓ Removed node_modules" -ForegroundColor Gray
}

# Clean android gradle cache
Remove-Item "android/.gradle" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "android/app/.gradle" -Recurse -Force -ErrorAction SilentlyContinue

# Remove all gradle wrapper JARs (can be regenerated)
$wrapperJar = Get-ChildItem "android/gradle/wrapper/" -Filter "*.jar" -ErrorAction SilentlyContinue
foreach ($jar in $wrapperJar) {
    if ($jar.Name -like "*wrapper*.jar") {
        Remove-Item $jar.FullName -Force -ErrorAction SilentlyContinue
        Write-Host ("✓ Removed: " + $jar.Name) -ForegroundColor Gray
    }
}

# Remove dist folder
if (Test-Path "dist") {
    Remove-Item "dist" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✓ Removed dist" -ForegroundColor Gray
}

# Remove build logs
Get-ChildItem "*.log", "*_build.log", "build_log.txt" -ErrorAction SilentlyContinue | ForEach-Object {
    Remove-Item $_.FullName -Force -ErrorAction SilentlyContinue
    Write-Host ("✓ Removed: " + $_.Name) -ForegroundColor Gray
}

# Keep only essential Docker files, remove others
$dockerFilesToRemove = @("Dockerfile.android","DOCKER_GUIDE.md","Dokcer_QUicKSTART.md","DockerInstallationGuide.md","docker-setup.ps1","start-docker-build.ps1","build-android-docker.sh")
foreach ($file in $dockerFilesToRemove) {
    if (Test-Path $file) {
        Remove-Item $file -Force -ErrorAction SilentlyContinue
        Write-Host ("✓ Removed: " + $file) -ForegroundColor Gray
    }
}

# Remove unnecessary scripts
$scriptsToRemove = @("optimize-for-git.ps1","final-clean.ps1","monitor.ps1","push-to-git.ps1")
foreach ($script in $scriptsToRemove) {
    if (Test-Path $script) {
        Remove-Item $script -Force -ErrorAction SilentlyContinue
        Write-Host ("✓ Removed: " + $script) -ForegroundColor Gray
    }
}

$countAfter = Get-ChildItem -Recurse | Measure-Object
Write-Host "`n=========================================" -ForegroundColor Green
Write-Host "   ✅ Cleanup Complete!" -ForegroundColor Green
Write-Host "=========================================`n" -ForegroundColor Green

Write-Host "Summary:" -ForegroundColor White
Write-Host "  Before: $($countBefore.Count) files" -ForegroundColor Gray
Write-Host "  After:  $($countAfter.Count) files" -ForegroundColor Cyan
Write-Host "  Removed: $($countBefore.Count - $countAfter.Count) files" -ForegroundColor Green

if ($countAfter.Count -lt 100) {
    Write-Host "`n🎉 SUCCESS! Ready for GitHub upload!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️ Still has $($countAfter.Count) files" -ForegroundColor Yellow
}

Write-Host "`nTop level files:" -ForegroundColor Cyan
dir | Select-Object Name | Format-Table -AutoSize

Write-Host "`nReady to push?" -ForegroundColor Cyan
Read-Host "Press Enter to continue with git commands"

git add .
git commit -m "Optimize project for GitHub (<100 files)"
Write-Host "`nGit ready! Run 'git push origin main'" -ForegroundColor Green
