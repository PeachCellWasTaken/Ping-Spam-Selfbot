@echo off
setlocal enabledelayedexpansion
title Installer

echo ============================================
echo        Node.js + Package Installer
echo ============================================
echo.

:: -------------------------------
:: 1. Check for Node.js
:: -------------------------------
echo Checking for Node.js...
where node >nul 2>nul
if %errorlevel%==0 (
    echo Node.js found: 
    node -v
    echo.
    goto install_packages
)

echo Node.js is NOT installed.
echo.

choice /c YN /m "Would you like to install Node.js now"
if errorlevel 2 (
    echo Installation cancelled.
    pause
    exit /b
)

echo.
echo Attempting automatic installation...
echo.

:: -------------------------------
:: 2. Try winget
:: -------------------------------
where winget >nul 2>nul
if %errorlevel%==0 (
    echo Using winget to install Node.js...
    winget install OpenJS.NodeJS -e --silent
    goto verify_node
)

:: -------------------------------
:: 3. Try Chocolatey
:: -------------------------------
where choco >nul 2>nul
if %errorlevel%==0 (
    echo Using Chocolatey to install Node.js...
    choco install nodejs -y
    goto verify_node
)

:: -------------------------------
:: 4. Fallback: download MSI
:: -------------------------------
echo No package manager found.
echo Downloading Node.js installer directly...

set NODE_URL=https://nodejs.org/dist/latest/node-v22.11.0-x64.msi
set NODE_INSTALLER=node_installer.msi

powershell -command "(New-Object Net.WebClient).DownloadFile('%NODE_URL%', '%NODE_INSTALLER%')"
if %errorlevel% neq 0 (
    echo Failed to download Node.js installer.
    pause
    exit /b
)

echo Running Node.js installer...
msiexec /i "%NODE_INSTALLER%" /passive
echo Waiting for installation to complete...
timeout /t 5 >nul

del "%NODE_INSTALLER%"

:: -------------------------------
:: 5. Verify installation
:: -------------------------------
:verify_node
echo.
echo Re-checking Node.js installation...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js installation failed.
    echo Please install manually from https://nodejs.org
    pause
    exit /b
)

echo Node.js installed successfully!
echo Node version:
node -v
echo.

:: -------------------------------
:: 6. Install npm packages
:: -------------------------------
:install_packages
echo Installing npm packages...
set PACKAGES=debug discord.js-selfbot-v13 open chalk

for %%p in (%PACKAGES%) do (
    echo.
    echo Installing %%p...
    npm install %%p --save
    if !errorlevel! neq 0 (
        echo.
        echo Failed to install %%p
        goto npmerror
    )
)

echo.
echo ============================================
echo        All packages installed!
echo ============================================
pause
exit /b

:npmerror
echo.
echo An error occurred during npm install.
echo Check your internet connection and permissions.
pause
exit /b
