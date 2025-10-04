# 🏢 Expense Management System

A comprehensive, enterprise-grade expense management system built with **React**, **Node.js**, **Express**, and **MongoDB**. Features multi-currency support, OCR receipt processing, role-based approval workflows, and automated company setup.

## 🚀 Features Implemented

### ✅ **Complete Feature Set**

#### **Authentication & User Management**
- ✅ JWT-based authentication with refresh tokens
- ✅ Multi-step login with OTP verification
- ✅ Google OAuth integration
- ✅ Auto-create Company with default currency on first signup
- ✅ Role-based system: Admin, Manager, Employee
- ✅ Manager-employee relationship management

#### **Company Management**
- ✅ Auto-detect currency based on country (via restcountries.com API)
- ✅ Company settings and expense categories
- ✅ Multi-currency support with real-time conversion
- ✅ Expense limits and approval thresholds

#### **Expense Submission & Management**
- ✅ Multi-currency expense submission
- ✅ Real-time currency conversion (via exchangerate-api.com)
- ✅ OCR receipt processing with Tesseract.js
- ✅ Auto-fill expense fields from receipt data
- ✅ File upload with validation (images, PDFs)
- ✅ Expense categories, tags, and notes

#### **Advanced Approval Workflows**
- ✅ **Percentage Rule**: X% of eligible approvers must approve
- ✅ **Specific Approver Rule**: Designated person auto-approves
- ✅ **Hybrid Rule**: Combination of percentage + specific approver
- ✅ Multi-level approval sequences
- ✅ Workflow testing and simulation

#### **Role-Based Dashboards**
- ✅ **Admin Dashboard**: Company overview, user management, workflow control
- ✅ **Manager Dashboard**: Team expense approvals, pending reviews
- ✅ **Employee Dashboard**: Personal expense tracking, submission

#### **UI/UX Excellence**
- ✅ Modern, responsive design with TailwindCSS
- ✅ Role-based navigation and permissions
- ✅ Real-time notifications and feedback
- ✅ OCR-powered receipt upload with preview
- ✅ Comprehensive expense history and filtering

#### **Production Ready**
- ✅ Docker containerization (Frontend + Backend + MongoDB)
- ✅ Nginx reverse proxy configuration
- ✅ Health checks and monitoring
- ✅ Security headers and best practices
- ✅ Error handling and logging

---

## 🏗️ **Architecture Overview**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │  Express API    │    │    MongoDB      │
│                 │    │                 │    │                 │
│ • Role Dashboards│◄──►│ • Auth System   │◄──►│ • Users         │
│ • OCR Processing│    │ • Expense APIs  │    │ • Companies     │
│ • Expense Forms │    │ • Workflow APIs │    │ • Expenses      │
│ • Approval UI   │    │ • Currency APIs │    │ • Workflows     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │ External APIs   │
                    │                 │
                    │ • REST Countries│
                    │ • Exchange Rates│
                    │ • Tesseract OCR │
                    └─────────────────┘
```

---

## 🛠️ **Quick Start**

### **Prerequisites**
- Node.js (v18 or higher)
- Docker & Docker Compose
- Git

### **1. Clone & Setup**
```bash
git clone <repository-url>
cd expense-management-system

# Install dependencies
npm run install:all
```

### **2. Environment Configuration**

#### **Backend (.env)**
Create `server/.env`:
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/expense_management
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-minimum-32-characters
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production-minimum-32-characters
CLIENT_URL=http://localhost:5173
BCRYPT_ROUNDS=12
LOG_LEVEL=info
```

#### **Frontend (.env)**
Create `client/.env`:
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Expense Management System
VITE_APP_VERSION=1.0.0
```

### **3. Run with Docker (Recommended)**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Access Points:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- MongoDB: localhost:27017

### **4. Run in Development Mode**
```bash
# Start MongoDB (if not using Docker)
mongod

# Start backend
cd server && npm start

# Start frontend (in new terminal)
cd client && npm run dev
```

---

## 📋 **Usage Guide**

### **First Time Setup**

1. **Register First User**
   - Visit http://localhost:5173
   - Click "Register"
   - Fill in personal details + company information
   - System auto-creates company with currency detection
   - First user becomes Admin automatically

2. **Admin Setup**
   - Create approval workflows
   - Add expense categories
   - Invite team members
   - Set company policies

3. **Manager Setup**
   - Assign employees to managers
   - Configure approval hierarchies
   - Set spending limits

4. **Employee Usage**
   - Submit expenses with receipt upload
   - Use OCR to auto-fill expense data
   - Track approval status
   - View expense history

### **Key Workflows**

#### **Expense Submission Flow**
1. Employee uploads receipt → OCR extracts data
2. System auto-fills amount, date, vendor
3. Employee reviews and submits
4. System finds applicable approval workflow
5. Routes to appropriate approvers
6. Automatic approval if rules met

#### **Approval Workflow Types**

**Percentage Rule Example:**
- 60% of managers must approve expenses >$500
- System tracks approvals and auto-approves when threshold met

**Specific Approver Example:**
- CFO approval auto-approves any expense
- Immediate approval without waiting for others

**Hybrid Rule Example:**
- Primary: 50% of managers approve
- Fallback: If CFO approves, auto-approve
- Flexible approval paths

---

## 🔧 **API Documentation**

### **Authentication Endpoints**
```http
POST /api/auth/register     # Register with company creation
POST /api/auth/login        # Multi-step login
POST /api/auth/send-login-otp
POST /api/auth/verify-login-otp
```

### **Company Management**
```http
GET  /api/company           # Get company details
PUT  /api/company           # Update company
GET  /api/company/countries # Get countries with currencies
GET  /api/company/exchange-rates # Get current rates
```

### **Expense Management**
```http
POST /api/expenses          # Submit expense (with file upload)
GET  /api/expenses/my-expenses # User's expenses
GET  /api/expenses/pending  # Pending approvals (managers)
POST /api/expenses/:id/process # Approve/reject expense
```

### **Workflow Management**
```http
POST /api/workflows         # Create workflow (admin)
GET  /api/workflows         # List workflows
POST /api/workflows/:id/test # Test workflow with sample data
```

---

## 🎯 **Advanced Features**

### **OCR Receipt Processing**
- Supports JPEG, PNG, WebP, PDF
- Extracts amount, date, vendor automatically
- Confidence scoring for accuracy
- Manual review and correction

### **Multi-Currency Support**
- Real-time exchange rate conversion
- Company base currency setting
- Historical rate tracking
- Support for 100+ currencies

### **Intelligent Approval Routing**
- Rule-based workflow selection
- Automatic approval conditions
- Escalation and fallback rules
- Audit trail for all approvals

### **Role-Based Security**
- JWT with refresh token rotation
- Route-level permission checks
- Data isolation by company
- Audit logging for sensitive operations

---

## 🐳 **Docker Configuration**

The system includes production-ready Docker configuration:

- **Frontend**: Nginx-served React build
- **Backend**: Node.js API server
- **Database**: MongoDB with initialization
- **Proxy**: Nginx reverse proxy
- **Volumes**: Persistent data and file uploads
- **Networks**: Isolated container communication

---

## 🔒 **Security Features**

- Password hashing with bcrypt
- JWT token security with rotation
- Rate limiting and account lockout
- Input validation and sanitization
- CORS protection
- Security headers (Helmet.js)
- File upload validation
- SQL injection prevention

---

## 📊 **Performance & Monitoring**

- Database indexing for fast queries
- Caching for exchange rates and countries
- Health check endpoints
- Comprehensive logging with Winston
- Error tracking and monitoring
- Optimized Docker images

---

## 🚀 **Deployment**

### **Production Deployment**
1. Update environment variables for production
2. Configure SSL certificates in nginx
3. Set up monitoring and backup systems
4. Deploy with `docker-compose up -d`

### **Scaling Considerations**
- Load balancer for multiple backend instances
- MongoDB replica set for high availability
- CDN for static assets
- Redis for session management

---

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

---

## 📄 **License**

This project is licensed under the MIT License.

---

## 🆘 **Support**

For issues and questions:
1. Check existing issues
2. Create detailed bug reports
3. Include logs and reproduction steps

---

**Built with ❤️ for hackathons and enterprise use**

**Tech Stack**: React 19 • Node.js • Express • MongoDB • Docker • TailwindCSS • Tesseract.js
