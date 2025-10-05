import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth.js';
import SimpleLogin from '../components/auth/SimpleLogin.jsx';
import ForgotPassword from '../components/auth/ForgotPassword.jsx';

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const { login, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    clearError();
    
    if (location.state?.error) {
      setError(location.state.error);
    }
    
    const handleForgotPassword = () => {
      setShowForgotPassword(true);
    };
    
    window.addEventListener('showForgotPassword', handleForgotPassword);
    
    return () => {
      window.removeEventListener('showForgotPassword', handleForgotPassword);
    };
  }, [clearError, location.state]);

  // Helper function to determine redirect path based on user role
  const getRoleBasedRedirectPath = useCallback((user) => {
    if (!user || !user.role) {
      return from;
    }
    console.log(user.role)

    switch (user.role) {
      case 'admin':
        return '/admin-dashboard';
      case 'manager':
        return '/manager-dashboard';
      case 'employee':
        return '/employee-dashboard';
      case 'finance':
        return '/finance-dashboard';
      default:
        return from;
    }
  }, [from]);

  const handleLoginSubmit = useCallback(async (credentials) => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await login(credentials);  
      
      if (result.success) {
        // Redirect based on user role
        const redirectPath = getRoleBasedRedirectPath(result.user);
        console.log('Redirecting to:', redirectPath);
        
        navigate(redirectPath, { replace: true });
      } else {
        setError(result.error);
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [login, navigate, getRoleBasedRedirectPath]);

  const handleForgotPasswordBack = () => {
    setShowForgotPassword(false);
  };

  const handleForgotPasswordSuccess = (message) => {
    if (message?.toLowerCase().includes('error') || message?.toLowerCase().includes('failed')) {
      toast.error(message);
    } else {
      toast.success(message);
    }
  };
  
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Background Image (60%) - Fixed */}
      <div className="w-1/2 fixed h-full overflow-hidden bg-gradient-to-br from-purple-100 to-violet-300">
        <img 
          src="/background.png" 
          alt="Authentication Flow Illustration" 
          className="w-full h-full object-fit"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-transparent"></div>
      </div>

      {/* Right Side - Login Form (40%) - Scrollable */}
      <div className="w-1/2 ml-auto bg-white overflow-y-auto">
        <div className="min-h-screen flex flex-col justify-center px-16 lg:px-20 xl:px-24 py-12">
          <div className="max-w-lg w-full">
            {/* Header */}
            <div className="mb-12">
              <Link to="/" className="inline-flex items-center text-purple-600 hover:text-purple-700 text-sm font-medium mb-8">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Home
              </Link>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome Back
              </h1>
              <p className="text-lg text-gray-600">
                Sign in to your account and continue your journey
              </p>
            </div>

            {/* Content */}
            <div>
              {showForgotPassword ? (
                <ForgotPassword
                  onBack={handleForgotPasswordBack}
                  onSuccess={handleForgotPasswordSuccess}
                />
              ) : (
                <SimpleLogin
                  onSubmit={handleLoginSubmit}
                  isLoading={isLoading}
                  error={error}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
