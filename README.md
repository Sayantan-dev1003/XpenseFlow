# AuthFlow - Complete Authentication System

A comprehensive, enterprise-grade authentication system built with React, Node.js, Express, and MongoDB. Features multi-step login with OTP verification, Google OAuth, account lockout protection, and secure session management.

## 🚀 Features

### Core Authentication
- ✅ **Manual User Registration & Login** - Email/password authentication with validation
- ✅ **Multi-Step Login Process** - Enhanced security with OTP verification for every login
- ✅ **Google OAuth Integration** - One-click social login with Google
- ✅ **OTP Verification** - Email and SMS verification for enhanced security
- ✅ **Password Reset** - Secure password reset via email
- ✅ **JWT Authentication** - Secure token-based authentication with refresh tokens
- ✅ **Session Management** - Automatic token refresh and secure logout
- ✅ **Account Lockout Protection** - Temporary lockout after failed login attempts

### Security Features
- ✅ **Password Hashing** - bcrypt with salt rounds for secure password storage
- ✅ **Rate Limiting** - Protection against brute force attacks
- ✅ **Account Lockout** - Temporary account lockout after failed attempts
- ✅ **Input Validation** - Server-side validation with Joi
- ✅ **CORS Protection** - Configured CORS for secure cross-origin requests
- ✅ **Environment Variables** - Secure configuration management
- ✅ **HttpOnly Cookies** - Secure token storage with HttpOnly cookies
- ✅ **Token Rotation** - Refresh token rotation for enhanced security
- ✅ **Helmet Security** - Security headers with Helmet.js
- ✅ **Comprehensive Logging** - Winston-based logging system
- ✅ **Error Handling** - Centralized error handling middleware

### User Experience
- ✅ **Responsive Design** - Mobile-first design with Tailwind CSS
- ✅ **Real-time Notifications** - Toast notifications for user feedback
- ✅ **Loading States** - Proper loading indicators throughout the app
- ✅ **Error Handling** - Comprehensive error handling and user feedback
- ✅ **Protected Routes** - Route protection based on authentication status
- ✅ **Email Verification** - Email verification for manual signups
- ✅ **Account Linking** - Link social accounts to existing manual accounts
- ✅ **Step-by-Step Login Flow** - Intuitive multi-step authentication process
- ✅ **Forgot Password Flow** - Seamless password recovery experience

## 🏗️ Architecture

### Backend (Node.js + Express)
```
server/
├── src/
│   ├── config/          # Database and OAuth configuration
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Authentication and error middleware
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic (OTP, Email, SMS)
│   └── utils/           # Helper functions
├── logs/                # Application logs
├── env.example          # Environment variables template
├── server.js            # Main server file
└── package.json
```

### Frontend (React + Vite)
```
client/
├── src/
│   ├── api/             # API service functions
│   ├── components/      # Reusable UI components
│   │   ├── auth/        # Authentication components
│   │   ├── common/      # Common UI components
│   │   └── layout/      # Layout components
│   ├── context/         # React Context for state management
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components
│   ├── App.jsx          # Main application component
│   └── main.jsx         # Application entry point
├── public/              # Static assets
├── env.example          # Environment variables template
└── package.json
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/Sayantan-dev1003/AuthFlow.git
cd AuthFlow
```

### 2. Install Dependencies

#### Option A: Quick Setup (Recommended)
```bash
# Install all dependencies at once
npm run install:all
```

#### Option B: Manual Installation
```bash
# Install root dependencies
npm install

# Install server dependencies
npm run install:server

# Install client dependencies
npm run install:client
```

#### Option C: Automated Setup Scripts
```bash
# For Windows
setup.bat

# For Linux/Mac
chmod +x setup.sh
./setup.sh
```

### 3. Environment Configuration

#### Backend Environment (.env)
Create `server/.env` file:
```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/authflow

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-minimum-32-characters
JWT_EXPIRE=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production-minimum-32-characters
JWT_REFRESH_EXPIRE=7d

# Client URL
CLIENT_URL=http://localhost:5173

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# SMS Configuration (Twilio)
SMS_SERVICE_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# Logging Configuration
LOG_LEVEL=info

# Security Configuration
BCRYPT_ROUNDS=12
TOKEN_EXPIRY_HOURS=24
PASSWORD_RESET_EXPIRY_HOURS=1
```

#### Frontend Environment (.env)
Create `client/.env` file:
```env
# Client Configuration
VITE_API_URL=http://localhost:3000/api

# App Configuration
VITE_APP_NAME=AuthFlow
VITE_APP_VERSION=1.0.0
```

### 4. OAuth Provider Setup

#### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/google/callback` (development)
   - `https://yourdomain.com/api/auth/google/callback` (production)
6. Copy Client ID and Client Secret to your `.env` files

### 5. Email Configuration (Gmail)

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use the app password in your `EMAIL_PASS` environment variable

### 6. Understanding Authentication Flow

#### Multi-Step Authentication Process

The AuthFlow system implements a sophisticated multi-step authentication process:

1. **Step 1 - Credential Verification**: User enters email/password
2. **Step 2 - OTP Method Selection**: Choose between email or SMS verification
3. **Step 3 - OTP Verification**: Complete authentication with OTP

#### OAuth Integration

**Social Login Flow:**
1. User clicks Google button
2. Redirected to provider's OAuth page
3. User authorizes the application
4. Provider redirects back with authorization code
5. Server exchanges code for access token
6. Server fetches user profile data
7. User is automatically logged in

**Account Linking:**
- If user exists with same email → Link OAuth account to existing user
- If user doesn't exist → Create new account with OAuth data
- Supports linking multiple OAuth providers to same account

#### Security Features

- **Rate Limiting**: Prevents brute force attacks
- **Account Locking**: Temporary lockout after failed attempts
- **Token Management**: Secure JWT with refresh tokens
- **Session Security**: HttpOnly cookies, secure flags
- **Input Validation**: Comprehensive data validation
- **Password Hashing**: bcrypt with salt rounds

### 7. Start the Application

#### Development Mode (Both servers)
```bash
npm start
```

#### Individual Servers
```bash
# Backend only
cd server && npm start

# Frontend only
cd client && npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "Password123",
  "phoneNumber": "+1234567890"
}
```

#### Login User (Step 1: Credentials)
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}
```

#### Send Login OTP (Step 2: Choose Method)
```http
POST /api/auth/send-login-otp
Content-Type: application/json

{
  "userId": "user_id_from_step1",
  "method": "email"
}
```

#### Verify Login OTP (Step 3: Complete Login)
```http
POST /api/auth/verify-login-otp
Content-Type: application/json

{
  "userId": "user_id_from_step1",
  "otp": "123456",
  "method": "email"
}
```

#### Verify Email (Registration)
```http
GET /api/auth/verify-email/:token
```

#### Google OAuth
```http
GET /api/auth/google
```

#### Refresh Token
```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

#### Password Reset Request
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Password Reset
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "password": "Newpassword123"
}
```

### User Management Endpoints

#### Get Current User
```http
GET /api/user/profile
Authorization: Bearer <access-token>
```

#### Update Profile
```http
PUT /api/user/profile
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "phoneNumber": "+1234567890"
}
```

## 🔐 Security Features

### Password Security
- Passwords are hashed using bcrypt with 12 salt rounds
- Strong password requirements (uppercase, lowercase, numbers)
- Password confirmation on registration
- Secure password change functionality

### Account Protection
- Rate limiting: 5 login attempts per 15 minutes per IP
- Account lockout after 5 failed attempts for 2 hours
- OTP verification required for every login attempt
- Email verification for new accounts
- Multi-step authentication process for enhanced security

### Token Security
- JWT access tokens expire in 15 minutes (short-lived)
- Refresh tokens expire in 7 days (long-lived)
- Tokens are stored securely in HTTP-only cookies
- Automatic token refresh with rotation
- SameSite cookie protection against CSRF

### Data Validation & Sanitization
- Server-side validation using Joi schemas
- Input sanitization and validation
- Email format validation
- Phone number format validation
- SQL injection protection
- XSS protection with Helmet.js

### Security Headers
- Helmet.js for security headers
- Content Security Policy (CSP)
- CORS configuration for production
- Secure cookie settings

### Logging & Monitoring
- Winston-based comprehensive logging
- Security event logging (login attempts, password resets)
- Request/response logging
- Error tracking and monitoring

## 🎨 Frontend Features

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Responsive navigation and layouts
- Touch-friendly interface elements

### User Experience
- Real-time form validation
- Loading states and progress indicators
- Toast notifications for user feedback
- Smooth transitions and animations

### State Management
- React Context for global state
- Custom hooks for easy state access
- Persistent authentication state
- Automatic token refresh

## 🔧 Troubleshooting

### Common OAuth Issues

#### Google OAuth Problems
- **"redirect_uri_mismatch"**: Ensure callback URL exactly matches Google Console settings
- **"invalid_client"**: Check Client ID and Secret are correct
- **"access_denied"**: User denied permission or app not verified

#### General OAuth Troubleshooting
1. **Check Environment Variables**: Ensure all OAuth credentials are set correctly
2. **Verify URLs**: Callback URLs must match exactly (including http/https)
3. **Check Scopes**: Ensure required scopes are requested (profile, email)
4. **Test in Incognito**: Clear browser cache and test in private window
5. **Check Logs**: Monitor server logs for detailed error messages

### Database Issues
- **Connection failed**: Check MongoDB is running and connection string is correct
- **Authentication failed**: Verify MongoDB credentials
- **Collection errors**: Ensure database exists and user has proper permissions

### Email/SMS Issues
- **Email not sending**: Check Gmail app password and SMTP settings
- **SMS not working**: Verify Twilio credentials and phone number format
- **OTP not received**: Check spam folder, verify phone number format

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration with email verification
- [ ] Multi-step login process (credentials → OTP method → OTP verification)
- [ ] Login with incorrect credentials (rate limiting)
- [ ] Account lockout after multiple failed attempts
- [ ] Google OAuth login
- [ ] Password reset flow
- [ ] Profile update
- [ ] Logout functionality
- [ ] Protected route access
- [ ] Token refresh
- [ ] OTP verification via email
- [ ] OTP verification via SMS (if configured)

### API Testing
Use tools like Postman or curl to test API endpoints:
```bash
# Test health endpoint
curl http://localhost:3000/health

# Test registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","password":"Password123","phoneNumber":"+1234567890"}'

# Test multi-step login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed description
3. Include error logs and steps to reproduce

---

**Built with ❤️ using React, Node.js, Express, and MongoDB**