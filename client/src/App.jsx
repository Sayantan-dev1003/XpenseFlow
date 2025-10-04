import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthProvider } from './context/AuthContext.jsx';

// Components
import ProtectedRoute from './components/layout/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';
import ContactSupportPage from './pages/ContactSupportPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { ForgotPasswordPage, ResetPasswordPage } from './pages/ForgotPasswordPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';

// Dashboard Components
import RoleBasedDashboard from './components/dashboard/RoleBasedDashboard';

// OAuth Success/Error Pages
const AuthSuccessPage = () => {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const refreshToken = urlParams.get('refresh');
    
    if (token && refreshToken) {
      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Get user info from token to determine redirect path
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userRole = payload.role;
        
        let redirectPath = '/dashboard';
        switch (userRole) {
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
            redirectPath = '/dashboard';
        }
        
        window.location.href = redirectPath;
      } catch (error) {
        console.error('Error parsing token:', error);
        window.location.href = '/dashboard';
      }
    } else {
      window.location.href = '/login';
    }
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
              <Route path="/home" element={<HomePage />} />
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
              

              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute requireAuth={true}>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
              
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
