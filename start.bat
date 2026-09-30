@echo off
echo ===================================================
echo   Starting FitBuddy AI Web Application Server...
echo ===================================================
echo.

cd /d "%~dp0"

IF EXIST "fitbuddy-backend\node_modules" (
    echo [1/2] Dependencies found.
) ELSE (
    echo [1/2] Installing dependencies...
    cd fitbuddy-backend
    call npm install
    cd ..
)

echo [2/2] Launching FitBuddy Server on http://localhost:5000 ...
start http://localhost:5000
node fitbuddy-backend\server.js
pause
