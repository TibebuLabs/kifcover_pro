# stop.ps1 — Kill only KifCover processes (safe for opencode agent)
# Usage: powershell -File scripts/stop.ps1

Write-Host ""
Write-Host "=== Stopping KifCover Services ===" -ForegroundColor Yellow

$keywords = @("nest.js", "next.*dev", "kifcover_pro")
$killed = 0

Get-Process node -ErrorAction SilentlyContinue | ForEach-Object {
    $cmd = (Get-CimInstance Win32_Process -Filter "ProcessId=$($_.Id)" -ErrorAction SilentlyContinue).CommandLine
    if ($cmd) {
        foreach ($kw in $keywords) {
            if ($cmd -match $kw) {
                Write-Host "  Killing PID $($_.Id)" -ForegroundColor Red
                Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
                $killed++
                break
            }
        }
    }
}

Start-Sleep -Seconds 2

if ($killed -eq 0) {
    Write-Host "  No KifCover processes found" -ForegroundColor Gray
} else {
    Write-Host "  Stopped $killed process(es)" -ForegroundColor Green
}
Write-Host ""
