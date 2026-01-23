@echo off
echo ========================================
echo Smart Library - Database Setup
echo ========================================
echo.

echo Step 1: Stopping any running backend servers...
taskkill /F /IM node.exe /T 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Step 2: Generating Prisma Client...
call npx prisma generate

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to generate Prisma Client
    pause
    exit /b 1
)

echo.
echo Step 3: Creating SQLite database...
call npx prisma db push --accept-data-loss

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to create database
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! Database setup complete!
echo ========================================
echo.
echo You can now start your backend server.
echo.
pause
