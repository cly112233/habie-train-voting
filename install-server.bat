@echo off
title Habie Train Setup
cd /d "%~dp0"

echo ======================================
echo   Habie Train Voting - Setup
echo ======================================
echo.

set "DIR=C:\habie-train-voting"

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [FAIL] Node.js not installed.
    echo Download: https://nodejs.org
    pause & exit
)

echo Killing old processes...
taskkill /f /im node.exe >nul 2>&1

echo Releasing port 80...
net stop http /y >nul 2>&1
sc config http start=disabled >nul 2>&1

echo Opening firewall port 80...
netsh advfirewall firewall add rule name="HabieTrain80" dir=in action=allow protocol=tcp localport=80 >nul 2>&1

echo Copying files to %DIR%...
if not exist "%DIR%" mkdir "%DIR%"
xcopy /E /Y /Q "%~dp0src" "%DIR%\src\" >nul
xcopy /E /Y /Q "%~dp0public" "%DIR%\public\" >nul
xcopy /Y /Q "%~dp0*.json" "%DIR%\" >nul
xcopy /Y /Q "%~dp0*.mjs" "%DIR%\" >nul
xcopy /Y /Q "%~dp0*.ts" "%DIR%\" >nul
xcopy /Y /Q "%~dp0*.bat" "%DIR%\" >nul
del "%DIR%\.env" >nul 2>&1

cd /d "%DIR%"

echo Installing dependencies...
call npm install
if %errorlevel% neq 0 ( echo [FAIL] npm install & pause & exit )

echo Building...
call npm run build
if %errorlevel% neq 0 ( echo [FAIL] Build & pause & exit )

echo Configuring auto-start...
schtasks /delete /tn "HabieTrain" /f >nul 2>&1
schtasks /create /tn "HabieTrain" /tr "cmd /c cd /d %DIR% && npm start" /sc onstart /delay 0000:15 /ru SYSTEM /f >nul 2>&1

echo Starting server on port 80...
start "habie-server" /B npm start
timeout /t 4 >nul

curl -s http://localhost:80 >nul 2>&1
if %errorlevel% equ 0 (
    echo.
    echo ======================================
    echo   SETUP COMPLETE!
    echo   http://localhost:80
    echo   Admin: guanli / yi2san4wu6
    echo ======================================
) else (
    echo.
    echo   Server not detected on port 80 yet.
    echo   Wait 10 seconds and try:
    echo   http://localhost:80
)

pause
