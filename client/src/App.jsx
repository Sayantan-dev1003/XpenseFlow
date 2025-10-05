import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthProvider } from './context/AuthContext.jsx';

// Components
import ProtectedRoute from './components/layout/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import ContactSupportPage from './pages/ContactSupportPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { ForgotPasswordPage, ResetPasswordPage } from './pages/ForgotPasswordPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import NotFoundPage from './pages/NotFoundPage';

// Expense Components
import ExpenseSubmissionForm from './components/expense/ExpenseSubmissionForm';

// Dashboard Components
import RoleBasedDashboard from './components/dashboard/RoleBasedDashboard';

// OAuth Success/Error Pages
const AuthSuccessPage = () => {
  useEffect(() => {
    const handleOAuthSuccess = async () => {
      try {
        // Since we're using HTTP-only cookies, we need to make an API call to get user info
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/me`, {
          method: 'GET',
          credentials: 'include', // Include cookies
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const user = data.data.user;
          
          // Determine redirect path based on user role
          let redirectPath = '/';
          switch (user.role) {
            case 'admin':
              redirectPath = '/admin-dashboard';
              break;
            case 'manager':
              redirectPath = '/manager-dashboard';
              break;
            case 'employee':
              redirectPath = '/employee-dashboard';
              break;
            case 'finance':
              redirectPath = '/finance-dashboard';
              break;
            default:
              redirectPath = '/';
          }
          
          window.location.href = redirectPath;
        } else {
          // If auth check fails, redirect to login
          console.error('OAuth success but failed to get user info:', response.status);
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('Error during OAuth success handling:', error);
        window.location.href = '/login';
      }
    };

    handleOAuthSuccess();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};

const AuthErrorPage = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const message = urlParams.get('message') || 'Authentication failed';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-red-800 mb-2">Authentication Error</h2>
          <p className="text-red-700 mb-4">{message}</p>
          <a
            href="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Try Again
          </a>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/contact-support" element={<ContactSupportPage />} />
              <Route 
                path="/login" 
                element={
                  <ProtectedRoute requireAuth={false} allowInProgress={true}>
                    <LoginPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <RegisterPage />
                  </ProtectedRoute>
                } 
              />        
              <Route 
                path="/forgot-password" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <ForgotPasswordPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/reset-password" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <ResetPasswordPage />
                  </ProtectedRoute>
                } 
              />

              {/* OAuth Callback Routes */}
              <Route path="/auth/success" element={<AuthSuccessPage />} />
              <Route path="/auth/error" element={<AuthErrorPage />} />
              
              {/* Role-based Dashboard Routes */}
              <Route 
                path="/admin-dashboard" 
                element={
                  <ProtectedRoute requireAuth={true}>
                    <RoleBasedDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/manager-dashboard" 
                element={
                  <ProtectedRoute requireAuth={true}>
                    <RoleBasedDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/employee-dashboard" 
                element={
                  <ProtectedRoute requireAuth={true}>
                    <RoleBasedDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/finance-dashboard" 
                element={
                  <ProtectedRoute requireAuth={true}>
                    <RoleBasedDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/change-password" 
                element={
                  <ProtectedRoute requireAuth={true}>
                    <ChangePasswordPage />
                  </ProtectedRoute>
                } 
              />

              {/* Expense Routes */}
              <Route 
                path="/expenses/submit" 
                element={
                  <ProtectedRoute requireAuth={true}>
                    <ExpenseSubmissionForm />
                  </ProtectedRoute>
                } 
              />

              {/* Catch all route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>

        {/* Toast Notifications */}
        <ToastContainer
          position="top-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
