@echo off
REM ================================================================
REM Task Manager App - Windows Launcher
REM This batch file runs the task-manager-app.exe with configurable
REM host and port settings
REM ================================================================

REM Configure these variables as needed
REM Can be overridden via command line: run.bat [host] [port]
if "%1"=="" (
    set HOST=0.0.0.0
) else (
    set HOST=%1
)

if "%2"=="" (
    set PORT=8090
) else (
    set PORT=%2
)

REM Build the server address
set SERVER_ADDR=%HOST%:%PORT%

REM Check if executable exists
if not exist "task-manager.exe" (
    echo Error: task-manager.exe not found in current directory
    echo Please ensure the executable is in the same folder as this batch file
    pause
    exit /b 1
)

REM Display usage information if help requested
if "%1"=="--help" (
    echo Usage: run.bat [host] [port]
    echo.
    echo Examples:
    echo   run.bat                          # Uses default: 0.0.0.0:8090
    echo   run.bat localhost 9000           # Uses: localhost:9000
    echo   run.bat 192.168.1.100 3000       # Uses: 192.168.1.100:3000
    echo   run.bat 0.0.0.0 8080             # Uses: 0.0.0.0:8080
    echo.
    pause
    exit /b 0
)

REM Start the application with specified host and port
echo ==========================================
echo Starting Task Manager App...
echo ==========================================
echo Host: %HOST%
echo Port: %PORT%
echo Server Address: %SERVER_ADDR%
echo.
echo The application will be available at: http://%SERVER_ADDR%
echo.
echo Press Ctrl+C to stop the application
echo ==========================================
echo.

REM Pass host and port using the correct --http flag
REM Don't set --https at all - this prevents PocketBase from trying to use HTTPS
task-manager.exe serve --http=%SERVER_ADDR%
