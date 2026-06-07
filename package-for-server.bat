@echo off
chcp 65001 >nul
title 打包部署包

echo.
echo   📦 打包哈比列车投票 - 服务器部署包
echo   ====================================
echo.

cd /d "%~dp0"

set "OUTPUT=%~dp0habie-train-deploy.zip"

:: 删除旧包
if exist "%OUTPUT%" del "%OUTPUT%"

echo   正在打包...

:: 用 PowerShell 压缩（排除不必要文件）
powershell -Command "Compress-Archive -Path @(
    'src',
    'public',
    'package.json',
    'package-lock.json',
    'next.config.ts',
    'tsconfig.json',
    'postcss.config.mjs',
    'eslint.config.mjs',
    'install-server.bat',
    'start.bat',
    'stop.bat'
) -DestinationPath '%OUTPUT%' -Force"

if exist "%OUTPUT%" (
    echo.
    echo   ✅ 打包完成！
    echo.
    echo   📁 文件: %OUTPUT%
    for %%A in ("%OUTPUT%") do echo   📏 大小: %%~zA bytes
    echo.
    echo   🚀 部署步骤:
    echo       1. 把 %~nx0 上传到服务器
    echo       2. 在服务器上解压
    echo       3. 右键 install-server.bat → 以管理员身份运行
    echo.
) else (
    echo   [X] 打包失败
)
pause
