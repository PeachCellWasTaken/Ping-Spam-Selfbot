@echo off
title Run Application

echo Checking for Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js is not installed.
    echo Please run install.bat first.
    pause
    exit /b
)

echo Starting application...
echo.

node index.js

echo.
echo Application exited.
pause
