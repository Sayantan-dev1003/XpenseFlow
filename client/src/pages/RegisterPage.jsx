import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegistration } from '../context/RegistrationContext';
import { toast } from 'react-toastify';
import AdminDetailsStep from '../components/auth/AdminDetailsStep.jsx';
import CompanyDetailsStep from '../components/auth/CompanyDetailsStep.jsx';
import Button from '../components/common/Button.jsx';
import { authService } from '../api/authService';

const RegisterPage = () => {
  const navigate = useNavigate();
  const {
    registrationData,
    currentStep,
    nextStep,
    prevStep,
    isLoading,
    setIsLoading,
    error,
    setError
  } = useRegistration();


  // Helper functions for validation and submission
  const validateStep1 = () => {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      dateOfBirth,
      gender,
      password,
      confirmPassword
    } = registrationData;

    if (!firstName || !lastName || !email || !phoneNumber || !dateOfBirth || !gender || !password) {
      toast.error('Please fill in all required fields');
      return false;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }

    const emailRegex = /^[\w.-]+@[\w.-]+\.[\w]{2,}$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    const { companyName, address, industry, baseCurrency } = registrationData;

    if (!companyName || !address.city || !address.state || !address.country || !industry) {
      toast.error('Please fill in all required fields');
      return false;
    }

    if (!baseCurrency.code) {
      toast.error('Please select a valid country to set the base currency');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      nextStep();
    }
  };

  const handlePrevious = () => {
    prevStep();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep2()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authService.register(registrationData);

      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Background Image (60%) - Fixed */}
      <div className="w-1/2 fixed h-full overflow-hidden bg-gradient-to-br from-purple-100 to-violet-300">
        <img 
          src="/background.png" 
          alt="Authentication Flow Illustration" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-transparent"></div>
      </div>

      {/* Right Side - Register Form (40%) - Scrollable */}
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
                Create Admin Account
              </h1>
              <p className="text-lg text-gray-600">
                Register as an admin to create your company and get started
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <div className={`h-2 rounded-full transition-colors duration-300 ${currentStep >= 1 ? 'bg-purple-500' : 'bg-gray-200'}`} />
                </div>
                <div className="flex-1 ml-4">
                  <div className={`h-2 rounded-full transition-colors duration-300 ${currentStep >= 2 ? 'bg-purple-500' : 'bg-gray-200'}`} />
                </div>
              </div>
              <div className="flex justify-around">
                <span className={`text-sm font-medium transition-colors duration-300 ${currentStep >= 1 ? 'text-purple-500' : 'text-gray-500'}`}>
                  Admin Details
                </span>
                <span className={`text-sm font-medium transition-colors duration-300 ${currentStep >= 2 ? 'text-purple-500' : 'text-gray-500'}`}>
                  Company Details
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={currentStep === 2 ? handleSubmit : undefined} className="space-y-8">

              {currentStep === 1 ? (
                <AdminDetailsStep />
              ) : (
                <CompanyDetailsStep />
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex justify-between items-center mt-8">
                {currentStep === 2 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="px-6 py-3 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg font-medium transition-colors duration-200"
                  >
                    ← Previous
                  </button>
                )}

                <button
                  type={currentStep === 2 ? 'submit' : 'button'}
                  onClick={currentStep === 1 ? handleNext : undefined}
                  className="px-8 py-3 bg-purple-600 text-white hover:bg-purple-700 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                  disabled={isLoading}
                >
                  {isLoading
                    ? 'Processing...'
                    : currentStep === 1
                    ? 'Next →'
                    : 'Complete Registration'}
                </button>
              </div>

              {/* Login Link */}
              <p className="text-center text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-purple-600 hover:text-purple-700"
                >
                  Sign In
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
