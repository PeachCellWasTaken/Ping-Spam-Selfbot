@echo off
title Installer

echo Checking for Node.js...
where node >nul 2>nul

if %errorlevel% neq 0 (
    echo.
    echo Node.js is NOT installed.
    echo Please install Node.js from https://nodejs.org, run the installer - MAKE SURE YOU "ADD TO PATH"
    echo Then reopen this installer.
    echo.
    pause
    exit /b
)

echo ok found node
node -v
echo.

echo Installing packages...
npm i debug
if %errorlevel% neq 0 goto npmerror

npm i discord.js-selfbot-v13
if %errorlevel% neq 0 goto npmerror

npm i open
if %errorlevel% neq 0 goto npmerror

npm i chalk
if %errorlevel% neq 0 goto npmerror

echo.
echo Done!
pause
exit /b

:npmerror
echo.
echo An error occurred during npm install.
echo Make sure you have internet access and permissions.
pause
exit /b
