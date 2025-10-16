# XpenseFlow - Enterprise Expense Management System

A comprehensive, full-stack expense management system built with React, Node.js, Express, and MongoDB. XpenseFlow provides enterprise-grade expense tracking, approval workflows, OCR receipt processing, and multi-role user management with advanced security features.

## 🌟 Product Overview

XpenseFlow is a modern expense management solution designed for businesses of all sizes. It streamlines the entire expense lifecycle from submission to approval, featuring intelligent receipt processing, multi-currency support, and role-based access control.

### Key Value Propositions
- **Automated Receipt Processing**: OCR-powered receipt scanning with automatic data extraction
- **Multi-Role Workflow**: Seamless approval process with manager and finance team coordination  
- **Real-time Currency Conversion**: Automatic currency detection and conversion
- **Enterprise Security**: JWT authentication, rate limiting, and comprehensive audit trails
- **Responsive Design**: Mobile-first interface for expense submission on-the-go
- **Scalable Architecture**: Microservices-ready with Docker containerization

## 🚀 Features & Capabilities

### Core Expense Management
- ✅ **Expense Submission** - Easy expense creation with receipt upload
- ✅ **OCR Receipt Processing** - Automatic data extraction from receipt images using Tesseract.js
- ✅ **Multi-Currency Support** - Real-time currency conversion with exchange rates
- ✅ **Category Management** - Customizable expense categories per company
- ✅ **Expense Tracking** - Comprehensive expense history and status tracking
- ✅ **Budget Management** - Monthly budget allocation and spending tracking

### Advanced Approval Workflows
- ✅ **Dual Approval System** - Manager and finance team approval requirements
- ✅ **Role-Based Access Control** - Admin, Manager, Employee, and Finance roles
- ✅ **Approval Notifications** - Real-time notifications for pending approvals
- ✅ **Workflow Automation** - Configurable approval thresholds and auto-approval
- ✅ **Audit Trail** - Complete history of all expense actions and approvals

### Authentication & Security
- ✅ **Multi-Step Authentication** - Enhanced login with OTP verification
- ✅ **Google OAuth Integration** - Single sign-on with Google accounts
- ✅ **JWT Token Management** - Secure token-based authentication with refresh tokens
- ✅ **Account Security** - Rate limiting, account lockout, and password policies
- ✅ **Session Management** - Secure session handling with HTTP-only cookies
- ✅ **Input Validation** - Comprehensive server-side validation with Joi

### User & Company Management
- ✅ **Multi-Tenant Architecture** - Support for multiple companies
- ✅ **User Role Management** - Hierarchical user roles and permissions
- ✅ **Employee Onboarding** - Streamlined user creation and company setup
- ✅ **Profile Management** - User profile updates and password management
- ✅ **Team Management** - Manager-employee relationships and team views

### Technical Features
- ✅ **Responsive Design** - Mobile-first UI with Tailwind CSS
- ✅ **Real-time Notifications** - Toast notifications and status updates
- ✅ **File Upload & Storage** - Secure receipt image storage and processing
- ✅ **API Documentation** - Comprehensive REST API with proper error handling
- ✅ **Docker Support** - Containerized deployment with Docker Compose
- ✅ **Logging & Monitoring** - Winston-based logging with security event tracking

## 🏗️ System Architecture

### Technology Stack

#### Frontend (React + Vite)
- **React 19.1.1** - Modern React with hooks and context
- **Vite** - Fast build tool and development server
- **Tailwind CSS 4.1.13** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API communication
- **Tesseract.js** - Client-side OCR processing
- **React Toastify** - Notification system

#### Backend (Node.js + Express)
- **Node.js** - JavaScript runtime
- **Express 5.1.0** - Web application framework
- **MongoDB + Mongoose** - NoSQL database with ODM
- **JWT** - JSON Web Token authentication
- **Passport.js** - Authentication middleware
- **Multer** - File upload handling
- **Winston** - Logging framework
- **Helmet** - Security headers
- **Rate Limiting** - DDoS protection

#### DevOps & Deployment
- **Docker & Docker Compose** - Containerization
- **Nginx** - Reverse proxy and load balancing
- **MongoDB Atlas** - Cloud database hosting
- **Vercel** - Frontend deployment platform

### Project Structure

```
xpenseflow/
├── client/                          # Frontend React Application
│   ├── src/
│   │   ├── api/                    # API service functions
│   │   │   ├── authService.js      # Authentication API calls
│   │   │   ├── companyService.js   # Company management API
│   │   │   ├── expenseService.js   # Expense management API
│   │   │   ├── userService.js      # User management API
│   │   │   └── workflowService.js  # Workflow API calls
│   │   ├── components/             # Reusable UI components
│   │   │   ├── auth/              # Authentication components
│   │   │   │   ├── AdminDetailsStep.jsx
│   │   │   │   ├── CompanyDetailsStep.jsx
│   │   │   │   ├── ForgotPassword.jsx
│   │   │   │   └── SimpleLogin.jsx
│   │   │   ├── common/            # Common UI components
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   └── Spinner.jsx
│   │   │   ├── dashboard/         # Role-based dashboards
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── EmployeeDashboard.jsx
│   │   │   │   ├── FinanceDashboard.jsx
│   │   │   │   ├── ManagerDashboard.jsx
│   │   │   │   ├── RoleBasedDashboard.jsx
│   │   │   │   ├── UserCreationForm.jsx
│   │   │   │   └── UserList.jsx
│   │   │   ├── expense/           # Expense management components
│   │   │   │   ├── ExpenseSubmissionForm.jsx
│   │   │   │   └── ReceiptUpload.jsx
│   │   │   ├── landing/           # Landing page components
│   │   │   │   ├── CTASection.jsx
│   │   │   │   ├── FAQSection.jsx
│   │   │   │   ├── FeaturesSection.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── HeroSection.jsx
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── TestimonialsSection.jsx
│   │   │   │   └── WorkflowSection.jsx
│   │   │   └── layout/            # Layout components
│   │   │       └── ProtectedRoute.jsx
│   │   ├── context/               # React Context providers
│   │   │   ├── AuthContext.jsx    # Authentication state management
│   │   │   └── RegistrationContext.jsx
│   │   ├── hooks/                 # Custom React hooks
│   │   │   └── useAuth.js
│   │   ├── pages/                 # Page components
│   │   │   ├── ChangePasswordPage.jsx
│   │   │   ├── ContactSupportPage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── NotFoundPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── services/              # Client-side services
│   │   │   └── ocrService.js      # OCR processing service
│   │   ├── App.jsx                # Main application component
│   │   └── main.jsx               # Application entry point
│   ├── public/                    # Static assets
│   ├── Dockerfile                 # Frontend container configuration
│   ├── nginx.conf                 # Nginx configuration for production
│   ├── package.json               # Frontend dependencies
│   ├── vite.config.js             # Vite configuration
│   └── vercel.json                # Vercel deployment configuration
├── server/                        # Backend Node.js Application
│   ├── src/
│   │   ├── config/                # Configuration files
│   │   │   ├── db.js              # Database connection
│   │   │   ├── index.js           # Environment configuration
│   │   │   └── passport.js        # Passport authentication setup
│   │   ├── controllers/           # Request handlers
│   │   │   ├── auth.controller.js # Authentication logic
│   │   │   ├── company.controller.js # Company management
│   │   │   ├── expense.controller.js # Expense management
│   │   │   ├── user.controller.js # User management
│   │   │   └── workflow.controller.js # Workflow management
│   │   ├── middleware/            # Express middleware
│   │   │   ├── auth.middleware.js # Authentication middleware
│   │   │   ├── error.middleware.js # Error handling
│   │   │   ├── formdata.middleware.js # File upload handling
│   │   │   ├── rateLimiter.js     # Rate limiting
│   │   │   ├── validation.js      # Input validation schemas
│   │   │   └── validation.middleware.js
│   │   ├── models/                # MongoDB schemas
│   │   │   ├── ApprovalWorkflow.model.js # Workflow definitions
│   │   │   ├── Company.model.js   # Company data model
│   │   │   ├── Expense.model.js   # Expense data model
│   │   │   ├── Token.model.js     # Token management
│   │   │   └── User.model.js      # User data model
│   │   ├── routes/                # API route definitions
│   │   │   ├── auth.routes.js     # Authentication endpoints
│   │   │   ├── company.routes.js  # Company management endpoints
│   │   │   ├── expense.routes.js  # Expense management endpoints
│   │   │   ├── index.js           # Route aggregation
│   │   │   ├── user.routes.js     # User management endpoints
│   │   │   └── workflow.routes.js # Workflow endpoints
│   │   ├── services/              # Business logic services
│   │   │   ├── budget.service.js  # Budget management
│   │   │   ├── currency.service.js # Currency conversion
│   │   │   ├── notification.service.js # Notification system
│   │   │   └── receipt.service.js # Receipt processing
│   │   └── utils/                 # Utility functions
│   │       ├── generateTokens.js  # Token generation utilities
│   │       └── logger.js          # Logging configuration
│   ├── Dockerfile                 # Backend container configuration
│   ├── package.json               # Backend dependencies
│   └── server.js                  # Main server file
├── nginx/                         # Nginx configuration
│   └── nginx.conf                 # Production nginx setup
├── docker-compose.yml             # Multi-container orchestration
├── package.json                   # Root package configuration
├── setup.bat                      # Windows setup script
├── setup.sh                       # Unix setup script
└── README.md                      # This documentation
```

## 📊 Database Schema

### User Model
```javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  phoneNumber: String,
  company: ObjectId (ref: Company),
  role: ['admin', 'manager', 'employee', 'finance'],
  manager: ObjectId (ref: User),
  employeeId: String,
  loginAttempts: Number,
  lockUntil: Date,
  isActive: Boolean,
  timestamps: true
}
```

### Company Model
```javascript
{
  _id: ObjectId,
  name: String,
  country: String,
  baseCurrency: {
    code: String,
    name: String,
    symbol: String
  },
  address: Object,
  industry: String,
  settings: {
    expenseCategories: Array,
    expenseLimits: Object,
    approvalSettings: Object
  },
  budgetHistory: Array,
  createdBy: ObjectId (ref: User),
  timestamps: true
}
```

### Expense Model
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  amount: Number,
  currency: Object,
  convertedAmount: Number,
  exchangeRate: Number,
  category: String,
  expenseDateTime: Date,
  submissionDateTime: Date,
  receipt: {
    image: Buffer,
    ocrData: Object
  },
  submittedBy: ObjectId (ref: User),
  company: ObjectId (ref: Company),
  status: ['pending', 'approved', 'rejected', 'processing'],
  approvals: {
    manager: Object,
    finance: Object
  },
  timestamps: true
}
```

## 🔐 Security Features

### Authentication & Authorization
- **Multi-Step Login Process**: Credential verification → OTP method selection → OTP verification
- **JWT Token Management**: Short-lived access tokens (15 minutes) with refresh tokens (7 days)
- **Google OAuth Integration**: Seamless social login with account linking
- **Role-Based Access Control**: Granular permissions based on user roles
- **Account Security**: Rate limiting, account lockout after failed attempts

### Data Protection
- **Password Security**: bcrypt hashing with 12 salt rounds
- **Input Validation**: Joi-based server-side validation
- **SQL Injection Protection**: MongoDB with parameterized queries
- **XSS Protection**: Helmet.js security headers
- **CORS Configuration**: Secure cross-origin resource sharing

### Infrastructure Security
- **HTTP-Only Cookies**: Secure token storage
- **Rate Limiting**: Protection against brute force attacks
- **Security Headers**: Comprehensive security headers with Helmet
- **Environment Variables**: Secure configuration management
- **Audit Logging**: Complete security event tracking

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Git

### Quick Setup

#### Option 1: Automated Setup (Recommended)
```bash
# Clone the repository
git clone <repository-url>
cd xpenseflow

# Windows
setup.bat

# Linux/Mac
chmod +x setup.sh
./setup.sh
```

#### Option 2: Manual Installation
```bash
# Install all dependencies
npm run install:all

# Or install individually
npm install                    # Root dependencies
npm run install:server        # Backend dependencies
npm run install:client        # Frontend dependencies
```

### Environment Configuration

#### Backend Environment (server/.env)
```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/xpenseflow
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/xpenseflow

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRE=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-minimum-32-characters
JWT_REFRESH_EXPIRE=7d

# Client Configuration
CLIENT_URL=http://localhost:5173

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Email Configuration (Optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Security Configuration
BCRYPT_ROUNDS=12
LOG_LEVEL=info
```

#### Frontend Environment (client/.env)
```env
# API Configuration
VITE_API_URL=http://localhost:3000/api

# App Configuration
VITE_APP_NAME=XpenseFlow
VITE_APP_VERSION=1.0.0
```

### Start the Application

#### Development Mode
```bash
# Start both frontend and backend
npm start

# Or start individually
npm run server    # Backend only (port 3000)
npm run client    # Frontend only (port 5173)
```

#### Production Mode (Docker)
```bash
# Build and start all services
docker-compose up --build

# Start in background
docker-compose up -d
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Production (Docker)**: http://localhost:80

## 📱 User Roles & Workflows

### Role Hierarchy
1. **Admin**: Full system access, company management, user creation
2. **Manager**: Team management, expense approval, budget oversight
3. **Finance**: Final expense approval, financial reporting, budget management
4. **Employee**: Expense submission, personal expense tracking

### Expense Workflow
1. **Employee** submits expense with receipt
2. **OCR Processing** extracts data automatically
3. **Manager** reviews and approves/rejects
4. **Finance Team** provides final approval
5. **System** updates budget and generates reports

### User Onboarding Flow
1. **Admin Registration**: Creates company and admin account
2. **Company Setup**: Configures categories, budgets, and policies
3. **User Creation**: Admin creates employee accounts
4. **Role Assignment**: Users assigned appropriate roles and managers
5. **Team Structure**: Hierarchical reporting relationships established

## 🔧 API Documentation

### Authentication Endpoints

#### Register Company & Admin
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "admin@company.com",
  "password": "SecurePassword123",
  "phoneNumber": "+1234567890",
  "companyName": "Acme Corp",
  "address": {
    "area": "Business District",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "United States"
  },
  "industry": "Technology"
}
```

#### Login (Multi-Step)
```http
# Step 1: Credential Verification
POST /api/auth/login
{
  "email": "user@company.com",
  "password": "password123"
}

# Step 2: Send OTP
POST /api/auth/send-login-otp
{
  "userId": "user_id_from_step1",
  "method": "email"
}

# Step 3: Verify OTP
POST /api/auth/verify-login-otp
{
  "userId": "user_id_from_step1",
  "otp": "123456",
  "method": "email"
}
```

### Expense Management Endpoints

#### Submit Expense
```http
POST /api/expenses
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "title": "Business Lunch",
  "description": "Client meeting lunch",
  "amount": 45.50,
  "category": "Meals",
  "expenseDateTime": "2024-01-15T12:30:00Z",
  "receipt": <file>
}
```

#### Get Expenses
```http
GET /api/expenses?status=pending&page=1&limit=10
Authorization: Bearer <token>
```

#### Approve/Reject Expense
```http
PATCH /api/expenses/:id/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "action": "approved", // or "rejected"
  "comments": "Approved for business purposes"
}
```

### User Management Endpoints

#### Create User
```http
POST /api/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@company.com",
  "role": "employee",
  "manager": "manager_user_id",
  "employeeId": "EMP001"
}
```

#### Get Team Members
```http
GET /api/users/team
Authorization: Bearer <token>
```

## 🐳 Docker Deployment

### Development Environment
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# With live reload
docker-compose -f docker-compose.dev.yml up --build
```

### Production Environment
```bash
# Build and deploy production
docker-compose up --build -d

# View logs
docker-compose logs -f

# Scale services
docker-compose up --scale backend=3 -d
```

### Docker Services
- **Frontend**: React app served by Nginx
- **Backend**: Node.js API server
- **Database**: MongoDB (or MongoDB Atlas)
- **Nginx**: Reverse proxy and load balancer

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and company setup
- [ ] Multi-step login process
- [ ] Google OAuth authentication
- [ ] Expense submission with receipt upload
- [ ] OCR data extraction and validation
- [ ] Manager expense approval workflow
- [ ] Finance team final approval
- [ ] Budget tracking and limits
- [ ] User role permissions
- [ ] Password reset functionality
- [ ] Account lockout protection
- [ ] Rate limiting effectiveness

### API Testing
```bash
# Health check
curl http://localhost:3000/health

# Register new company
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"Admin","email":"test@company.com","password":"Password123","companyName":"Test Corp"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@company.com","password":"Password123"}'
```

## 🔍 Monitoring & Logging

### Application Monitoring
- **Winston Logging**: Structured logging with multiple levels
- **Security Events**: Authentication attempts, failed logins, suspicious activity
- **Performance Metrics**: API response times, database query performance
- **Error Tracking**: Comprehensive error logging and stack traces

### Log Levels
- **Error**: System errors, authentication failures
- **Warn**: Security warnings, rate limit hits
- **Info**: User actions, successful operations
- **Debug**: Detailed application flow (development only)

### Health Checks
```http
GET /health
Response: {
  "status": "OK",
  "message": "XpenseFlow server is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "production"
}
```

## 🚨 Troubleshooting

### Common Issues

#### Authentication Problems
- **"Invalid credentials"**: Check email/password combination
- **"Account locked"**: Wait 2 hours or contact admin
- **"OTP expired"**: Request new OTP code
- **Google OAuth fails**: Verify OAuth credentials and callback URLs

#### File Upload Issues
- **Receipt upload fails**: Check file size (max 10MB) and format (JPG, PNG, PDF)
- **OCR not working**: Ensure clear, high-quality receipt images
- **Currency not detected**: Manually select currency if auto-detection fails

#### Performance Issues
- **Slow API responses**: Check database connection and indexes
- **Frontend loading slowly**: Verify API URL configuration
- **OCR processing slow**: Use smaller image files or compress images

#### Database Issues
- **Connection failed**: Verify MongoDB URI and network connectivity
- **Authentication failed**: Check MongoDB credentials
- **Collection errors**: Ensure proper database permissions

### Support & Maintenance

#### Regular Maintenance Tasks
- Monitor log files for errors and security events
- Update dependencies regularly for security patches
- Backup database regularly (automated with MongoDB Atlas)
- Review and rotate JWT secrets periodically
- Monitor disk space for uploaded receipts

#### Performance Optimization
- Implement database indexing for frequently queried fields
- Use CDN for static assets in production
- Enable gzip compression for API responses
- Implement caching for currency exchange rates
- Optimize images before OCR processing

## 📈 Future Enhancements

### Planned Features
- **Mobile App**: Native iOS and Android applications
- **Advanced Reporting**: Detailed expense analytics and insights
- **Integration APIs**: Connect with accounting software (QuickBooks, Xero)
- **Bulk Operations**: Mass expense import/export functionality
- **Advanced OCR**: Machine learning-enhanced receipt processing
- **Multi-Language Support**: Internationalization for global companies
- **Expense Policies**: Automated policy enforcement and validation
- **Real-time Notifications**: Push notifications for mobile apps

### Technical Improvements
- **Microservices Architecture**: Split into independent services
- **GraphQL API**: More efficient data fetching
- **Redis Caching**: Improve performance with caching layer
- **Elasticsearch**: Advanced search and analytics
- **Kubernetes**: Container orchestration for scalability
- **CI/CD Pipeline**: Automated testing and deployment

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📞 Support

For technical support or questions:
- Create an issue in the GitHub repository
- Email: support@xpenseflow.com
- Documentation: [Project Wiki](link-to-wiki)

---

**Built with ❤️ using React, Node.js, Express, MongoDB, and modern web technologies**

*XpenseFlow - Simplifying expense management for modern businesses*