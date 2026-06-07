@echo off
title Habie Train Setup
cd /d "%~dp0"

echo.
echo ======================================
echo   Habie Train Voting - Server Setup
echo ======================================
echo.

set "INSTALL_DIR=C:\habie-train-voting"

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed.
    echo.
    echo 1. Go to https://nodejs.org
    echo 2. Download the LTS version
    echo 3. Install with all default options
    echo 4. REBOOT or re-open this script
    echo.
    pause
    exit
)

for /f "tokens=*" %%a in ('node --version') do echo Node.js %%a detected
echo.

echo Copying files to %INSTALL_DIR% ...
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"
xcopy /E /Y /Q "%~dp0src" "%INSTALL_DIR%\src\" >nul
xcopy /E /Y /Q "%~dp0public" "%INSTALL_DIR%\public\" >nul
xcopy /Y /Q "%~dp0*.json" "%INSTALL_DIR%\" >nul
xcopy /Y /Q "%~dp0*.mjs" "%INSTALL_DIR%\" >nul
xcopy /Y /Q "%~dp0*.ts" "%INSTALL_DIR%\" >nul
xcopy /Y /Q "%~dp0*.bat" "%INSTALL_DIR%\" >nul
echo Done.
echo.

cd /d "%INSTALL_DIR%"

echo Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo FAILED: npm install error.
    pause
    exit
)
echo Done.
echo.

echo Building project...
call npm run build
if %errorlevel% neq 0 (
    echo FAILED: Build error.
    pause
    exit
)
echo Done.
echo.

echo Configuring firewall and auto-start...
netsh advfirewall firewall add rule name="HabieTrain3000" dir=in action=allow protocol=tcp localport=3000 >nul 2>&1
schtasks /delete /tn "HabieTrain" /f >nul 2>&1
schtasks /create /tn "HabieTrain" /tr "cmd /c cd /d %INSTALL_DIR% && npm start" /sc onstart /delay 0000:15 /ru SYSTEM /f >nul 2>&1
echo Done.
echo.

echo Starting server...
start "habie-server" /B npm start
timeout /t 5 >nul

curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ======================================
    echo   SETUP COMPLETE!
    echo ======================================
    echo.
    echo   URL:    http://localhost:3000
    echo   Admin:  guanli / yi2san4wu6
    echo   Folder: %INSTALL_DIR%
    echo.
) else (
    echo WARNING: Server may not have started.
    echo Run this to start manually:
    echo   cd /d %INSTALL_DIR%
    echo   npm start
    echo.
)

pause
