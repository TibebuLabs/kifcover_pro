$root = "C:\Users\Tibe\Desktop\projects\Kifcover_project\kifcover_pro"

$services = @(
  @{ Name = "AUTH";    Dir = "$root\apps\svc-auth" },
  @{ Name = "CUSTOMER"; Dir = "$root\apps\svc-customer" },
  @{ Name = "INSURER";  Dir = "$root\apps\svc-insurer" },
  @{ Name = "PARTNER";  Dir = "$root\apps\svc-partner" },
  @{ Name = "ADMIN";    Dir = "$root\apps\svc-admin" },
  @{ Name = "GATEWAY";  Dir = "$root\apps\gateway" }
)

foreach ($svc in $services) {
  Start-Process -FilePath "node" `
    -ArgumentList "..\..\node_modules\@nestjs\cli\bin\nest.js", "start", "--watch" `
    -WorkingDirectory $svc.Dir `
    -WindowStyle Hidden `
    -RedirectStandardOutput "$root\logs\$($svc.Name).log" `
    -RedirectStandardError "$root\logs\$($svc.Name).err.log"
  Write-Host "Started $($svc.Name) from $($svc.Dir)"
}

Write-Host "All 6 services started. Check logs\ folder for output."
