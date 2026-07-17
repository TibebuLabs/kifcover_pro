@echo off
cd /d C:\Users\Tibe\Desktop\projects\Kifcover_project\kifcover_pro
start "AUTH" cmd /c "cd apps\svc-auth && node ..\..\node_modules\@nestjs\cli\bin\nest.js start --watch > ..\..\logs\auth.log 2>&1"
start "CUST" cmd /c "cd apps\svc-customer && node ..\..\node_modules\@nestjs\cli\bin\nest.js start --watch > ..\..\logs\customer.log 2>&1"
start "INSUR" cmd /c "cd apps\svc-insurer && node ..\..\node_modules\@nestjs\cli\bin\nest.js start --watch > ..\..\logs\insurer.log 2>&1"
start "PART" cmd /c "cd apps\svc-partner && node ..\..\node_modules\@nestjs\cli\bin\nest.js start --watch > ..\..\logs\partner.log 2>&1"
start "ADMIN" cmd /c "cd apps\svc-admin && node ..\..\node_modules\@nestjs\cli\bin\nest.js start --watch > ..\..\logs\admin.log 2>&1"
echo Microservices started. Waiting 15s before gateway...
timeout /t 15 /nobreak > nul
start "GW" cmd /c "cd apps\gateway && node ..\..\node_modules\@nestjs\cli\bin\nest.js start --watch > ..\..\logs\gateway.log 2>&1"
echo Gateway started. Waiting 5s before Next.js...
timeout /t 5 /nobreak > nul
start "WEB" cmd /c "cd apps\web && npx next dev -p 4000 > ..\..\logs\web.log 2>&1"
echo All services launched.
