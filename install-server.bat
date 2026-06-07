@echo off
chcp 65001 >nul
title 哈比列车 - 服务器安装

echo.
echo   ╔══════════════════════════════════╗
echo   ║  🎭 哈比列车投票 - 服务器安装  ║
echo   ╚══════════════════════════════════╝
echo.

:: 检查管理员权限
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo   [X] 请右键以管理员身份运行此脚本
    pause
    exit /b 1
)

set "INSTALL_DIR=C:\habie-train-voting"

:: ===== 1. 检查 Node.js =====
echo   [1/5] 检查 Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo        正在安装 Node.js（需要网络）...
    winget install OpenJS.NodeJS.LTS --accept-source-agreements --silent
    if %errorlevel% neq 0 (
        echo        [X] Node.js 安装失败，请手动下载安装:
        echo        https://nodejs.org
        pause
        exit /b 1
    )
    echo        安装完成，请重新打开此脚本继续。
    pause
    exit /b 0
)
echo        Node.js 已就绪

:: ===== 2. 部署项目 =====
echo.
echo   [2/5] 部署项目到 %INSTALL_DIR%...
if exist "%INSTALL_DIR%" (
    echo        目录已存在，仅更新代码文件...
    xcopy /E /Y /Q "%~dp0src" "%INSTALL_DIR%\src\" >nul
    xcopy /E /Y /Q "%~dp0public" "%INSTALL_DIR%\public\" >nul
    xcopy /Y /Q "%~dp0*.json" "%INSTALL_DIR%\" >nul
    xcopy /Y /Q "%~dp0*.mjs" "%INSTALL_DIR%\" >nul
    xcopy /Y /Q "%~dp0*.ts" "%INSTALL_DIR%\" >nul
) else (
    mkdir "%INSTALL_DIR%"
    xcopy /E /Y /Q "%~dp0*" "%INSTALL_DIR%\" >nul
)

:: 确保 data.db 不被覆盖（已有数据时保留）
echo. >nul

cd /d "%INSTALL_DIR%"

:: ===== 3. 安装依赖 + 构建 =====
echo.
echo   [3/5] 安装依赖（需要网络，约1-2分钟）...
call npm install --omit=dev 2>&1 | findstr /V "audit funding idealTree"

echo.
echo   [4/5] 构建项目...
call npm run build 2>&1 | findstr /V "audit"

:: ===== 4. 防火墙 =====
echo.
echo   [5/5] 配置防火墙 + 开机自启...
netsh advfirewall firewall add rule name="哈比列车投票-3000" dir=in action=allow protocol=tcp localport=3000 >nul 2>&1
echo        防火墙端口 3000 已开放

:: 删除旧的自启任务（如果有）
schtasks /delete /tn "哈比列车投票" /f >nul 2>&1

:: 创建开机自启任务（延迟15秒等网络就绪）
schtasks /create /tn "哈比列车投票" /tr "cmd /c cd /d %INSTALL_DIR% && npm start" /sc onstart /delay 0000:15 /ru SYSTEM /f >nul 2>&1
echo        开机自启已配置

:: ===== 5. 启动服务 =====
echo.
echo   启动服务中...
start "habie-server" /B npm start

timeout /t 4 >nul

curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo.
    echo   ╔══════════════════════════════════════╗
    echo   ║        ✅ 安装完成！                  ║
    echo   ╚══════════════════════════════════════╝
    echo.
    echo   🌐 访问地址（局域网）: http://localhost:3000
    echo.
    echo   📌 管理员账号:
    echo       ID:     guanli
    echo       密码:   yi2san4wu6
    echo.
    echo   💡 如果服务器有公网 IP，用这个地址访问:
    for /f "delims=" %%a in ('curl -s ifconfig.me 2^>nul') do echo       http://%%a:3000
    echo.
    echo   📂 项目目录: %INSTALL_DIR%
    echo   🔄 重启服务器后会自动启动
    echo   ⏹  停止: 任务管理器结束 node.exe
    echo.
) else (
    echo.
    echo   [X] 服务启动可能失败，请手动检查:
    echo   cd /d %INSTALL_DIR%  ^&^&  npm start
    echo.
)

pause
