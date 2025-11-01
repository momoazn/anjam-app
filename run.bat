@echo off
REM ================================================================
REM Task Manager App - Windows Launcher
REM This batch file runs the task-manager-app.exe with configurable
REM host and port settings
REM ================================================================

REM Configure these variables as needed
set HOST=0.0.0.0
set PORT=8090

REM Build the server address
set SERVER_ADDR=%HOST%:%PORT%

REM Check if executable exists
if not exist "task-manager-app.exe" (
    echo Error: task-manager-app.exe not found in current directory
    echo Please ensure the executable is in the same folder as this batch file
    pause
    exit /b 1
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

REM Try multiple approaches to pass host and port
REM Approach 1: Using --httpAddr flag
REM Approach 2: Using environment variables
REM Approach 3: Using --http flag

task-manager-app.exe serve --httpAddr=%SERVER_ADDR%
