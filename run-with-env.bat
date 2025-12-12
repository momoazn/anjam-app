@echo off
REM ================================================================
REM Task Manager App - Windows Launcher (Environment Variables)
REM This batch file runs task-manager.exe using environment
REM variables to configure host and port
REM ================================================================

REM Configure these variables as needed
set HOST=0.0.0.0
set PORT=8090

REM Set PocketBase environment variables
set PB_HTTP=%HOST%:%PORT%

REM Check if executable exists
if not exist "task-manager.exe" (
    echo Error: task-manager.exe not found in current directory
    echo Please ensure the executable is in the same folder as this batch file
    pause
    exit /b 1
)

REM Start the application
echo ==========================================
echo Starting Task Manager App (with env vars)...
echo ==========================================
echo Host: %HOST%
echo Port: %PORT%
echo PB_HTTP: %PB_HTTP%
echo.
echo The application will be available at: http://%HOST%:%PORT%
echo.
echo Press Ctrl+C to stop the application
echo ==========================================
echo.

task-manager.exe serve
