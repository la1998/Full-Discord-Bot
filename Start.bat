@echo off
setlocal

set "ROOT=C:\bot-dashboard-full-testlunch"
set "CFCONFIG=C:\Users\lanz-\.cloudflared\config.yml"

echo [0/5] Frontend build sicherstellen...
cd /d "%ROOT%\frontend"
if not exist "node_modules" call npm install
if not exist "dist\index.html" (
  echo dist fehlt -> baue Frontend...
  call npm run build
) else (
  echo dist vorhanden -> Build uebersprungen.
)

echo [1/5] Backend starten...
cd /d "%ROOT%\backend"
if not exist "node_modules" call npm install
call npx prisma generate
start "Backend" cmd /k "cd /d %ROOT%\backend && node index.js"

timeout /t 2 >nul

echo [2/5] Caddy starten...
start "Caddy" cmd /k "cd /d %ROOT% && caddy run --config %ROOT%\Caddyfile"

timeout /t 2 >nul

echo [3/5] Cloudflare Tunnel starten...
start "Cloudflared" cmd /k "cloudflared tunnel --config ""%CFCONFIG%"" run arty-dash"

timeout /t 2 >nul

echo [4/5] Discord Bot starten...
if exist "%ROOT%\backend\discord\bot.js" (
  start "DiscordBot" cmd /k "cd /d %ROOT%\backend && node discord\bot.js"
) else (
  echo bot.js nicht gefunden unter %ROOT%\backend\discord\bot.js -> uebersprungen.
)

echo ✅ Alle Dienste wurden gestartet (aus %ROOT%).
pause
