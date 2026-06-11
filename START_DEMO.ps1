# ============================================================
# DeepWork Sirkadian ToDoList - Start Script untuk Demo SQLite
# Jalankan dari root repo dengan PowerShell.
# ============================================================

param(
    [switch]$LocalFrontend,
    [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"

$rootPath = $PSScriptRoot
$backendPath = Join-Path $rootPath "backend"
$sqlitePath = Join-Path $backendPath "database\database.sqlite"
$envPath = Join-Path $backendPath ".env"
$envExamplePath = Join-Path $backendPath ".env.example"
$pagesUrl = "https://muhilham420.github.io/ToDoList_Kel7_V1/"
$phpCommand = (Get-Command php -ErrorAction SilentlyContinue)

if (-not $phpCommand -and (Test-Path -LiteralPath "C:\xampp\php\php.exe")) {
    $phpPath = "C:\xampp\php\php.exe"
} elseif ($phpCommand) {
    $phpPath = $phpCommand.Source
} else {
    throw "PHP tidak ditemukan. Install PHP 8.2+ atau tambahkan php.exe ke PATH."
}

Write-Host ""
Write-Host "  ================================================" -ForegroundColor Cyan
Write-Host "  DeepWork Sirkadian ToDoList - Backend SQLite" -ForegroundColor Cyan
Write-Host "  ================================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path -LiteralPath $envPath) -and (Test-Path -LiteralPath $envExamplePath)) {
    Copy-Item -LiteralPath $envExamplePath -Destination $envPath
}

if (-not (Test-Path -LiteralPath $sqlitePath)) {
    New-Item -ItemType File -Path $sqlitePath -Force | Out-Null
}

Write-Host "[1/2] Menyiapkan SQLite dan migrasi..." -ForegroundColor Yellow
Push-Location $backendPath
try {
    $envContent = Get-Content -LiteralPath $envPath -Raw
    if ($envContent -notmatch "APP_KEY=base64:") {
        & $phpPath artisan key:generate --force | Out-Host
    } else {
        Write-Host "      APP_KEY sudah tersedia." -ForegroundColor DarkGray
    }

    & $phpPath artisan migrate --force | Out-Host

    $sqliteForPhp = $sqlitePath.Replace("\", "/")
    $userCount = & $phpPath -r "echo (new PDO('sqlite:$sqliteForPhp'))->query('select count(*) from users')->fetchColumn();"
    if ([int]$userCount -eq 0) {
        & $phpPath artisan db:seed --force | Out-Host
    } else {
        Write-Host "      Seeder dilewati karena database sudah berisi data." -ForegroundColor DarkGray
    }
}
finally {
    Pop-Location
}
Write-Host "      SQLite siap di $sqlitePath" -ForegroundColor Green

Write-Host "[2/2] Menjalankan Laravel Backend API (port 8000)..." -ForegroundColor Yellow
Start-Process -FilePath "powershell.exe" `
    -ArgumentList "-NoExit -Command `"cd '$backendPath'; & '$phpPath' artisan serve --port=8000`"" `
    -WindowStyle Minimized
Start-Sleep -Seconds 3
Write-Host "      Backend berjalan di http://127.0.0.1:8000" -ForegroundColor Green

if ($LocalFrontend) {
    $frontendPath = Join-Path $rootPath "frontend"
    $npmCommand = (Get-Command npm.cmd -ErrorAction SilentlyContinue)
    if ($npmCommand) {
        $npmPath = $npmCommand.Source
    } elseif (Get-Command npm -ErrorAction SilentlyContinue) {
        $npmPath = "npm"
    } else {
        throw "npm tidak ditemukan. Install Node.js atau tambahkan npm ke PATH."
    }

    Write-Host "[Opsional] Menjalankan Vite Frontend lokal (port 5173)..." -ForegroundColor Yellow
    Start-Process -FilePath "powershell.exe" `
        -ArgumentList "-NoExit -Command `"cd '$frontendPath'; & '$npmPath' run dev`"" `
        -WindowStyle Minimized
    Start-Sleep -Seconds 4
    Write-Host "      Frontend lokal berjalan di http://localhost:5173/ToDoList_Kel7_V1/" -ForegroundColor Green
}

Write-Host ""
Write-Host "  ================================================" -ForegroundColor Cyan
Write-Host "  Backend berhasil dijalankan tanpa MySQL." -ForegroundColor Cyan
Write-Host ""
Write-Host "  Gunakan frontend GitHub Pages:" -ForegroundColor White
Write-Host "  $pagesUrl" -ForegroundColor Green
Write-Host ""
Write-Host "  Akun Demo:" -ForegroundColor White
Write-Host "  Email    : ahmad@example.com" -ForegroundColor Gray
Write-Host "  Password : password123" -ForegroundColor Gray
Write-Host "  ================================================" -ForegroundColor Cyan
Write-Host ""

if (-not $NoBrowser) {
    Start-Process $pagesUrl
}
