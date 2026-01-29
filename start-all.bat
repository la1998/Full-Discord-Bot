@echo off
echo [1/3] Installiere und starte Backend-API...
cd backend
call npm install
start cmd /k "node index.js"
cd ..

timeout /t 3 >nul

echo [2/3] Starte Frontend (Vite)...
cd frontend
call npm install
start cmd /k "npm run dev"
cd ..

timeout /t 3 >nul

echo [3/3] Starte Discord Bot...
start cmd /k "cd backend/discord && node bot.js"

echo ✅ Alle Dienste wurden gestartet.
pause
