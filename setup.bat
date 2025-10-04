@echo off
echo 🚀 Setting up AuthFlow Authentication System...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js (v16 or higher) first.
    pause
    exit /b 1
)

echo 📦 Installing dependencies...

REM Install root dependencies
echo Installing root dependencies...
npm install

REM Install server dependencies
echo Installing server dependencies...
npm run install:server

REM Install client dependencies
echo Installing client dependencies...
npm run install:client

echo ✅ Dependencies installed successfully!

REM Create environment files if they don't exist
if not exist "server\.env" (
    echo 📝 Creating server environment file...
    copy "server\env.example" "server\.env"
    echo ⚠️  Please update server\.env with your configuration
)

if not exist "client\.env" (
    echo 📝 Creating client environment file...
    copy "client\env.example" "client\.env"
    echo ⚠️  Please update client\.env with your configuration
)

echo.
echo 🎉 Setup completed successfully!
echo.
echo Next steps:
echo 1. Update server\.env with your MongoDB URI and other configuration
echo 2. Update client\.env with your API URL
echo 3. Set up Google OAuth credentials (see README.md)
echo 4. Configure email settings for OTP verification
echo 5. Run 'npm run dev' to start the development servers
echo.
echo 📚 For detailed setup instructions, see README.md
echo 🌐 Frontend will be available at: http://localhost:5173
echo 🔧 Backend API will be available at: http://localhost:5000
pause
