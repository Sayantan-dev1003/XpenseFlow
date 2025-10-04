#!/bin/bash

# AuthFlow Setup Script
echo "🚀 Setting up AuthFlow Authentication System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v16 or higher) first."
    exit 1
fi

# Check if MongoDB is running
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not installed. Please install MongoDB or use MongoDB Atlas."
    echo "   You can install MongoDB from: https://www.mongodb.com/try/download/community"
fi

echo "📦 Installing dependencies..."

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install server dependencies
echo "Installing server dependencies..."
npm run install:server

# Install client dependencies
echo "Installing client dependencies..."
npm run install:client

echo "✅ Dependencies installed successfully!"

# Create environment files if they don't exist
if [ ! -f "server/.env" ]; then
    echo "📝 Creating server environment file..."
    cp server/env.example server/.env
    echo "⚠️  Please update server/.env with your configuration"
fi

if [ ! -f "client/.env" ]; then
    echo "📝 Creating client environment file..."
    cp client/env.example client/.env
    echo "⚠️  Please update client/.env with your configuration"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Update server/.env with your MongoDB URI and other configuration"
echo "2. Update client/.env with your API URL"
echo "3. Set up Google OAuth credentials (see README.md)"
echo "4. Configure email settings for OTP verification"
echo "5. Run 'npm run dev' to start the development servers"
echo ""
echo "📚 For detailed setup instructions, see README.md"
echo "🌐 Frontend will be available at: http://localhost:5173"
echo "🔧 Backend API will be available at: http://localhost:5000"
