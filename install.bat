@echo off
REM Star Citizen Trade Route Planner - Installation Script for Windows
REM This script helps set up and run the application

echo ==============================================
echo Star Citizen Trade Route Planner - Installer
echo ==============================================
echo.

REM Check if we're in the right directory
if not exist "index.html" (
    echo Error: This script must be run from the project root directory
    echo Expected files: index.html, app.js, style.css
    pause
    exit /b 1
)

if not exist "app.js" (
    echo Error: This script must be run from the project root directory
    echo Expected files: index.html, app.js, style.css
    pause
    exit /b 1
)

echo [OK] Found application files
echo.

REM Check for available web servers
echo Checking for available web servers...
set WEB_SERVER=

REM Check for Python
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Python found ^(can use built-in HTTP server^)
    set WEB_SERVER=python
)

REM Check for Python 3
where python3 >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Python 3 found ^(can use built-in HTTP server^)
    set WEB_SERVER=python3
)

REM Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Node.js found ^(can use http-server if installed^)
    if not defined WEB_SERVER (
        set WEB_SERVER=node
    )
)

REM Check for PHP
where php >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] PHP found ^(can use built-in HTTP server^)
    if not defined WEB_SERVER (
        set WEB_SERVER=php
    )
)

echo.
echo ==============================================
echo Installation Complete!
echo ==============================================
echo.
echo Getting Started:
echo.
echo 1. Get your UEX Corp API key:
echo    Visit: https://uexcorp.space/api
echo    Register and create an API application
echo.
echo 2. Run the application:
echo.

if defined WEB_SERVER (
    echo Option A: Use a local web server ^(recommended^)
    echo.
    if "%WEB_SERVER%"=="python" (
        echo    python -m http.server 8000
    )
    if "%WEB_SERVER%"=="python3" (
        echo    python3 -m http.server 8000
    )
    if "%WEB_SERVER%"=="node" (
        echo    npx http-server -p 8000
    )
    if "%WEB_SERVER%"=="php" (
        echo    php -S localhost:8000
    )
    echo.
    echo    Then open: http://localhost:8000
    echo.
    echo Option B: Open directly in browser
    echo    Double-click index.html
    echo    ^(Note: Some browsers may restrict API calls from file:// URLs^)
) else (
    echo No web server found.
    echo You can:
    echo    - Double-click index.html to open in your browser
    echo    - Install Python 3, Node.js, or PHP to use a local server
)

echo.
echo ==============================================
echo.

REM Offer to start the server
if defined WEB_SERVER (
    set /p response="Would you like to start the web server now? (y/N): "
    if /i "%response%"=="y" (
        echo.
        echo Starting web server on http://localhost:8000
        echo Press Ctrl+C to stop the server
        echo.
        
        REM Try to open the browser
        timeout /t 2 /nobreak >nul
        start http://localhost:8000
        
        REM Start the server
        if "%WEB_SERVER%"=="python" (
            python -m http.server 8000
        )
        if "%WEB_SERVER%"=="python3" (
            python3 -m http.server 8000
        )
        if "%WEB_SERVER%"=="node" (
            npx http-server -p 8000
        )
        if "%WEB_SERVER%"=="php" (
            php -S localhost:8000
        )
    )
)

echo.
echo Happy trading in the verse! [ship emoji]
echo.
pause
