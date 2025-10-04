import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth.js';
import LoginStep1 from '../components/auth/LoginStep1.jsx';
import LoginStep3 from '../components/auth/LoginStep3.jsx';
import ForgotPassword from '../components/auth/ForgotPassword.jsx';

const LoginPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loginData, setLoginData] = useState(null);
  const [otpMethod, setOtpMethod] = useState(null);
  const [maskedContact, setMaskedContact] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');

  const { login, verifyLoginOTP, clearError } = useAuth();
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

  const handleStep1Submit = useCallback(async (credentials) => {
    setIsLoading(true);
    setError('');
    
    // Validate role selection
    if (!selectedRole) {
      setError('Please select your role');
      setIsLoading(false);
      return;
    }
    
    try {
      // Include role in credentials
      const credentialsWithRole = { ...credentials, role: selectedRole };
      const result = await login(credentialsWithRole);  
      
      if (result.success) {
        setLoginData(result.data);
        // Skip step 2 (method selection) and go directly to step 2 (OTP verification)
        setOtpMethod('phone'); // Always use phone/SMS
        setMaskedContact(result.data.maskedPhone || 'your phone');
        setCurrentStep(2);
      } else {
        setError(result.error);
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [login, selectedRole]);

  const handleOtpVerify = async (otp) => {
    setIsLoading(true);
    setError('');
    
    const result = await verifyLoginOTP(loginData.userId, otp, otpMethod);
    setIsLoading(false);

    if (result.success) {
      // Debug logging
      console.log('Login successful, user object:', result.user);
      console.log('User role:', result.user?.role);
      
      // Redirect based on user role
      const redirectPath = getRoleBasedRedirectPath(result.user);
      console.log('Redirecting to:', redirectPath);
      
      navigate(redirectPath, { replace: true });
    } else {
      setError(result.error);
    }
  };

  // Helper function to determine redirect path based on user role
  const getRoleBasedRedirectPath = (user) => {
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
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Since we're using SMS-only, we need to call login again to resend SMS
      const credentialsWithRole = { 
        email: loginData.email, 
        password: loginData.password, 
        role: selectedRole 
      };
      const result = await login(credentialsWithRole);
      setIsLoading(false);

      if (!result.success) {
        setError(result.error);
      }
    } catch {
      setIsLoading(false);
      setError('Failed to resend SMS. Please try again.');
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      setLoginData(null);
      setOtpMethod(null);
      setMaskedContact('');
    }
    setError('');
  };

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
      <div className="w-3/5 fixed h-full overflow-hidden bg-purple-100/80">
        <img 
          src="/background.png" 
          alt="Authentication Flow Illustration" 
          className="w-full h-full object-contain"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-transparent"></div>
      </div>

      {/* Right Side - Login Form (40%) - Scrollable */}
      <div className="w-2/5 ml-auto bg-white overflow-y-auto">
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

            {/* Step Indicator - Only show during login flow */}
            {!showForgotPassword && (
              <div className="mb-8">
                <div className="flex items-center justify-center space-x-4">
                  {[1, 2].map((step) => (
                    <div key={step} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step <= currentStep 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {step}
                      </div>
                      {step < 2 && (
                        <div className={`w-12 h-0.5 mx-2 ${
                          step < currentStep ? 'bg-purple-600' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step Content */}
            <div>
              {showForgotPassword ? (
                <ForgotPassword
                  onBack={handleForgotPasswordBack}
                  onSuccess={handleForgotPasswordSuccess}
                />
              ) : (
                <>
                  {currentStep === 1 && (
                    <LoginStep1
                      onSubmit={handleStep1Submit}
                      isLoading={isLoading}
                      error={error}
                      selectedRole={selectedRole}
                      onRoleChange={setSelectedRole}
                    />
                  )}
                  
                  {currentStep === 2 && (
                    <LoginStep3
                      userData={loginData}
                      method={otpMethod}
                      maskedContact={maskedContact}
                      onVerify={handleOtpVerify}
                      onBack={handleBack}
                      onResend={handleResendOtp}
                      isLoading={isLoading}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
