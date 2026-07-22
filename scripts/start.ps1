# start.ps1 — Kill old KifCover processes, then start all services in correct order
# Usage: powershell -File scripts/start.ps1

$ErrorActionPreference = "SilentlyContinue"
$root = Split-Path $PSScriptRoot

Write-Host ""
Write-Host "=== KifCover Pro - Starting All Services ===" -ForegroundColor Cyan
Write-Host ""

# ── Step 1: Kill only KifCover node processes (NOT all node.exe) ───────────
Write-Host "[1/4] Stopping old KifCover processes..." -ForegroundColor Yellow
$keywords = @("nest.js", "next.*dev", "kifcover_pro")
$killed = 0
Get-Process node -ErrorAction SilentlyContinue | ForEach-Object {
    $cmd = (Get-CimInstance Win32_Process -Filter "ProcessId=$($_.Id)" -ErrorAction SilentlyContinue).CommandLine
    if ($cmd) {
        foreach ($kw in $keywords) {
            if ($cmd -match $kw) {
                Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
                $killed++
                break
            }
        }
    }
}
Write-Host "  Killed $killed process(es)" -ForegroundColor Gray

# Wait for ports to be released
Start-Sleep -Seconds 3

# Verify ports are free
$busyPorts = @()
@(3000,3001,3002,3003,3004,3005,4000) | ForEach-Object {
    $conn = Get-NetTCPConnection -LocalPort $_ -State Listen -ErrorAction SilentlyContinue
    if ($conn) { $busyPorts += $_ }
}
if ($busyPorts.Count -gt 0) {
    Write-Host "  WARNING: Ports still busy: $($busyPorts -join ', ')" -ForegroundColor Red
    Write-Host "  Waiting 5 more seconds..." -ForegroundColor Red
    Start-Sleep -Seconds 5
}
Write-Host "  Ports clear" -ForegroundColor Green

# ── Step 2: Start microservices ─────────────────────────────────────────────
Write-Host "[2/4] Starting microservices..." -ForegroundColor Yellow
$services = @(
    @{ Name = "AUTH";     Dir = "apps\svc-auth";     Port = 3001 },
    @{ Name = "CUSTOMER"; Dir = "apps\svc-customer";  Port = 3002 },
    @{ Name = "INSURER";  Dir = "apps\svc-insurer";   Port = 3003 },
    @{ Name = "PARTNER";  Dir = "apps\svc-partner";   Port = 3004 },
    @{ Name = "ADMIN";    Dir = "apps\svc-admin";     Port = 3005 }
)

foreach ($svc in $services) {
    $svcPath = Join-Path $root $svc.Dir
    Start-Process -FilePath "cmd.exe" `
        -ArgumentList "/c", "title [$($svc.Name)] & cd /d $svcPath & node dist/main" `
        -WindowStyle Hidden
    Write-Host "  $($svc.Name) (port $($svc.Port)) launching..." -ForegroundColor Gray
}

# ── Step 3: Wait for microservices ──────────────────────────────────────────
Write-Host "[3/4] Waiting for microservices to be ready..." -ForegroundColor Yellow
$maxWait = 60
$elapsed = 0
$requiredPorts = @(3001,3002,3003,3004,3005)

while ($elapsed -lt $maxWait) {
    $ready = $true
    foreach ($port in $requiredPorts) {
        $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
        if (-not $conn) { $ready = $false; break }
    }
    if ($ready) { break }
    Start-Sleep -Seconds 2
    $elapsed += 2
    Write-Host "  Waiting... ($elapsed s)" -ForegroundColor DarkGray
}

if ($elapsed -ge $maxWait) {
    Write-Host "  TIMEOUT: Some microservices failed to start" -ForegroundColor Red
} else {
    Write-Host "  All 5 microservices ready (${elapsed}s)" -ForegroundColor Green
}

# ── Step 4: Start gateway ───────────────────────────────────────────────────
Write-Host "[4/4] Starting gateway (port 3000)..." -ForegroundColor Yellow
$gwPath = Join-Path $root "apps\gateway"
Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/c", "title [GW] & cd /d $gwPath & node dist/main" `
    -WindowStyle Hidden

$gwElapsed = 0
while ($gwElapsed -lt 20) {
    Start-Sleep -Seconds 2
    $gwElapsed += 2
    $conn = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
    if ($conn) { break }
}

if ($gwElapsed -ge 20) {
    Write-Host "  Gateway failed to start" -ForegroundColor Red
} else {
    Write-Host "  Gateway ready (${gwElapsed}s)" -ForegroundColor Green
}

# ── Start web frontend ──────────────────────────────────────────────────────
Write-Host ""
Write-Host "Starting web frontend (port 4000)..." -ForegroundColor Yellow
$webPath = Join-Path $root "apps\web"
Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/c", "title [WEB] & cd /d $webPath & node ..\..\node_modules\next\dist\bin\next dev -p 4000" `
    -WindowStyle Hidden

Start-Sleep -Seconds 10

# ── Final status ────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "=== Service Status ===" -ForegroundColor Cyan
$allPorts = @(3001,3002,3003,3004,3005,3000,4000)
$labels = @("AUTH","CUSTOMER","INSURER","PARTNER","ADMIN","GATEWAY","WEB")
for ($i = 0; $i -lt $allPorts.Count; $i++) {
    $conn = Get-NetTCPConnection -LocalPort $allPorts[$i] -State Listen -ErrorAction SilentlyContinue
    if ($conn) {
        Write-Host "  $($labels[$i]) -> localhost:$($allPorts[$i])  OK" -ForegroundColor Green
    } else {
        Write-Host "  $($labels[$i]) -> localhost:$($allPorts[$i])  FAILED" -ForegroundColor Red
    }
}
Write-Host ""
Write-Host "Done! Open http://localhost:4000 in your browser." -ForegroundColor Cyan
