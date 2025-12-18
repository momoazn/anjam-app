@echo off
REM ================================================================
REM Anjam App - Windows Launcher
REM This batch file runs anjam.exe with configurable host and port
REM Supports both command-line arguments and environment variables
REM ================================================================

REM Check for help first
if "%1"=="--help" (
    echo Usage: run.bat [host] [port]
    echo.
    echo Examples:
    echo   run.bat                          # Uses defaults or env vars
    echo   run.bat localhost 9000           # Uses: localhost:9000
    echo   run.bat 192.168.1.100 3000       # Uses: 192.168.1.100:3000
    echo   run.bat 0.0.0.0 8080             # Uses: 0.0.0.0:8080
    echo.
    echo Environment Variables:
    echo   HOST, PORT, PB_HTTP             # Used if no arguments provided
    echo.
    pause
    exit /b 0
)

REM Configure host and port with priority: args > env vars > defaults
if not "%1"=="" (
    set HOST=%1
) else if not "%HOST%"=="" (
    REM Use existing HOST environment variable
) else (
    set HOST=0.0.0.0
)

if not "%2"=="" (
    set PORT=%2
) else if not "%PORT%"=="" (
    REM Use existing PORT environment variable
) else (
    set PORT=8090
)

REM Build the server address
set SERVER_ADDR=%HOST%:%PORT%

REM Set PocketBase environment variable for compatibility
set PB_HTTP=%SERVER_ADDR%

REM Check if executable exists
if not exist "anjam.exe" (
    echo Error: anjam.exe not found in current directory
    echo Please ensure the executable is in the same folder as this batch file
    pause
    exit /b 1
)

REM Start the application
echo ==========================================
echo Starting Anjam App...
echo ==========================================
echo Host: %HOST%
echo Port: %PORT%
echo Server Address: %SERVER_ADDR%
echo PB_HTTP: %PB_HTTP%
echo.
echo The application will be available at: http://%SERVER_ADDR%
echo.
echo Press Ctrl+C to stop the application
echo ==========================================
echo.

REM Run with --http flag (PocketBase will also use PB_HTTP env var if set)
anjam.exe serve --http=%SERVER_ADDR%
