# EduStack Mobile — Flutter Environment Setup Script
# Run this once in PowerShell as Administrator
# Usage: cd "c:\Users\Super\School ERP\mobile"; .\setup_mobile.ps1

Write-Host "=== EduStack Flutter Setup ===" -ForegroundColor Cyan

# Step 1: Check if Flutter already installed
if (Get-Command flutter -ErrorAction SilentlyContinue) {
    Write-Host "[OK] Flutter already installed: $(flutter --version | Select-Object -First 1)" -ForegroundColor Green
} else {
    # Try winget first; fall back to direct download if unavailable
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        Write-Host "[INFO] Installing Flutter via winget..." -ForegroundColor Yellow
        winget install Google.Flutter
        Write-Host "[ACTION] Close and reopen this terminal, then re-run this script." -ForegroundColor Red
        exit 0
    } else {
        Write-Host "[INFO] winget not found. Downloading Flutter SDK directly..." -ForegroundColor Yellow
        $flutterZip   = "$env:TEMP\flutter.zip"
        $flutterDir   = "C:\flutter"
        $flutterUrl   = "https://storage.googleapis.com/flutter_infra_release/releases/stable/windows/flutter_windows_3.32.1-stable.zip"

        if (-not (Test-Path $flutterDir)) {
            Write-Host "[INFO] Downloading Flutter (this may take a few minutes)..." -ForegroundColor Yellow
            Invoke-WebRequest -Uri $flutterUrl -OutFile $flutterZip -UseBasicParsing
            Write-Host "[INFO] Extracting Flutter to C:\flutter ..." -ForegroundColor Yellow
            Expand-Archive -Path $flutterZip -DestinationPath "C:\" -Force
            Remove-Item $flutterZip -Force
        } else {
            Write-Host "[OK] Flutter folder already exists at C:\flutter" -ForegroundColor Green
        }

        # Add to PATH for this session
        $env:PATH = "C:\flutter\bin;$env:PATH"

        # Persist in user PATH if not already present
        $userPath = [System.Environment]::GetEnvironmentVariable("PATH", "User")
        if ($userPath -notlike "*C:\flutter\bin*") {
            [System.Environment]::SetEnvironmentVariable("PATH", "C:\flutter\bin;$userPath", "User")
            Write-Host "[OK] Added C:\flutter\bin to your user PATH." -ForegroundColor Green
        }

        Write-Host "[ACTION] Flutter downloaded. Continuing setup in this session..." -ForegroundColor Cyan
    }
}

# Step 2: Accept Android licenses
Write-Host "[INFO] Accepting Android SDK licenses..." -ForegroundColor Yellow
flutter doctor --android-licenses

# Step 3: Run flutter doctor
Write-Host "[INFO] Running flutter doctor..." -ForegroundColor Yellow
flutter doctor

# Step 4: Create Flutter project (if not already created)
$projectDir = "c:\Users\Super\School ERP\mobile"
if (Test-Path "$projectDir\pubspec.yaml") {
    Write-Host "[OK] Flutter project already exists." -ForegroundColor Green
} else {
    Write-Host "[INFO] Creating Flutter project..." -ForegroundColor Yellow
    Set-Location "c:\Users\Super\School ERP"
    flutter create mobile --org com.wolfstack.edustack --project-name edustack_mobile --platforms android,ios
    Write-Host "[OK] Flutter project created." -ForegroundColor Green
}

# Step 5: Install dependencies
Write-Host "[INFO] Installing packages..." -ForegroundColor Yellow
Set-Location $projectDir
flutter pub get

Write-Host ""
Write-Host "=== SETUP COMPLETE ===" -ForegroundColor Green
Write-Host "Next: flutter run" -ForegroundColor Cyan
