@echo off
REM DevTeam CLI 一键安装脚本 (Windows)
REM 需要: Node.js 16+, Git

setlocal enabledelayedexpansion

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║          DevTeam CLI v2.0.0 - 一键安装                   ║
echo ║          AI-Powered Development Team                      ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

REM 检查 Node.js
echo [i] 检查依赖...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [x] 未安装 Node.js
    echo.
    echo 请先安装 Node.js ^(v16+^):
    echo   下载地址: https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo [√] Node.js 已安装
node -v

REM 检查 npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [x] 未安装 npm
    pause
    exit /b 1
)

echo [√] npm 已安装
npm -v

REM 检查 git
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] 未安装 git ^(可选^)
) else (
    echo [√] git 已安装
    git --version
)

echo.
echo [i] 开始安装 DevTeam CLI...
echo.

REM 创建临时目录
set TEMP_DIR=%TEMP%\devteam-install-%RANDOM%
mkdir "%TEMP_DIR%"
cd /d "%TEMP_DIR%"

REM 克隆仓库
echo [i] 克隆仓库...
git clone https://github.com/kaijingWang/DevTeam.git devteam-cli >nul 2>&1
if %errorlevel% neq 0 (
    echo [x] 克隆失败
    pause
    exit /b 1
)
echo [√] 仓库克隆完成

cd devteam-cli

REM 安装依赖
echo [i] 安装依赖...
call npm install --production --silent
if %errorlevel% neq 0 (
    echo [x] 依赖安装失败
    pause
    exit /b 1
)
echo [√] 依赖安装完成

REM 全局安装
echo [i] 全局安装...
call npm link >nul 2>&1
if %errorlevel% neq 0 (
    echo [x] 全局安装失败
    echo [i] 请以管理员身份运行此脚本
    pause
    exit /b 1
)
echo [√] 全局安装完成

REM 清理临时目录
cd /d %USERPROFILE%
rmdir /s /q "%TEMP_DIR%" >nul 2>&1

echo.
echo [√] DevTeam CLI 安装完成！
echo.

REM 配置向导
set /p CONFIGURE="是否现在配置 Claude API Key? (y/n): "
if /i "%CONFIGURE%"=="y" (
    echo.
    set /p API_KEY="请输入你的 Claude API Key: "
    if not "!API_KEY!"=="" (
        call devteam config set llm.apiKey "!API_KEY!"
        echo [√] API Key 已配置
    ) else (
        echo [!] 未输入 API Key，跳过配置
    )
) else (
    echo [i] 跳过配置，稍后可运行: devteam config
)

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                    安装成功！                             ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo 🚀 快速开始:
echo.
echo   1. 配置 API Key ^(如果还没配置^):
echo      devteam config set llm.apiKey YOUR_KEY
echo.
echo   2. 创建新项目:
echo      devteam dev "用户登录功能"
echo.
echo   3. 使用模板:
echo      devteam template list
echo      devteam template init react-app my-app
echo.
echo   4. 代码审查:
echo      devteam review src/
echo.
echo   5. 修复 Bug:
echo      devteam fix "错误信息" --file src/app.js
echo.
echo   6. 生成文档:
echo      devteam docs all
echo.
echo   7. AI Pair Programming:
echo      devteam pair
echo.
echo 📖 查看帮助:
echo      devteam --help
echo.
echo 🌐 GitHub: https://github.com/kaijingWang/DevTeam
echo.

pause
