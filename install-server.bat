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
taskkill /f /im cloudflared.exe >nul 2>&1

echo Copying files to %DIR%...
if not exist "%DIR%" mkdir "%DIR%"
xcopy /E /Y /Q "%~dp0src" "%DIR%\src\" >nul
xcopy /E /Y /Q "%~dp0public" "%DIR%\public\" >nul
xcopy /Y /Q "%~dp0*.json" "%DIR%\" >nul
xcopy /Y /Q "%~dp0*.mjs" "%DIR%\" >nul
xcopy /Y /Q "%~dp0*.ts" "%DIR%\" >nul
xcopy /Y /Q "%~dp0*.bat" "%DIR%\" >nul
xcopy /Y /Q "%~dp0cloudflared.exe" "%DIR%\" >nul
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

echo Starting local server...
start "habie-server" /B npm start
echo Waiting for server...
timeout /t 4 >nul

echo Starting public tunnel...
start "habie-tunnel" /B cloudflared.exe tunnel --url http://localhost:80
echo Waiting for tunnel...
timeout /t 10 >nul

echo.
echo ======================================
echo   SETUP COMPLETE!
echo ======================================
echo.
echo   Local:   http://localhost:80
echo.
echo   >>> The public URL is shown in the tunnel window. <<<
echo   >>> Look for: https://XXXX.trycloudflare.com <<<
echo.
echo   Admin:   guanli / yi2san4wu6
echo   Folder:  %DIR%
echo.
echo   To stop:  run stop.bat
echo ======================================
echo.
pause
