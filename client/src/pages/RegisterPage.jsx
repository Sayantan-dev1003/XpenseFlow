import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    companyName: '',
    country: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [countries, setCountries] = useState([]);

  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
    loadCountries();
  }, [clearError]);

  const loadCountries = () => {
    // Use static country list
    setCountries([
      { name: 'United States', code: 'US' },
      { name: 'United Kingdom', code: 'GB' },
      { name: 'Canada', code: 'CA' },
      { name: 'Australia', code: 'AU' },
      { name: 'Germany', code: 'DE' },
      { name: 'France', code: 'FR' },
      { name: 'India', code: 'IN' },
      { name: 'Japan', code: 'JP' },
      { name: 'Brazil', code: 'BR' },
      { name: 'Mexico', code: 'MX' },
      { name: 'China', code: 'CN' },
      { name: 'South Korea', code: 'KR' },
      { name: 'Italy', code: 'IT' },
      { name: 'Spain', code: 'ES' },
      { name: 'Netherlands', code: 'NL' },
      { name: 'Sweden', code: 'SE' },
      { name: 'Norway', code: 'NO' },
      { name: 'Denmark', code: 'DK' },
      { name: 'Finland', code: 'FI' },
      { name: 'Switzerland', code: 'CH' }
    ]);
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one lowercase letter, one uppercase letter, and one number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.phoneNumber && !/^\+?[\d\s\-()]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    // Remove confirmPassword from the data sent to server
    const registerData = { ...formData };
    delete registerData.confirmPassword;
    
    const result = await register(registerData);
    setIsLoading(false);

    if (result.success) {
      // Redirect based on user role
      const redirectPath = getRoleBasedRedirectPath(result.data.user);
      navigate(redirectPath);
    }
  };

  // Helper function to determine redirect path based on user role
  const getRoleBasedRedirectPath = (user) => {
    if (!user || !user.role) {
      return '/dashboard';
    }

    switch (user.role) {
      case 'admin':
        return '/admin-dashboard';
      case 'manager':
        return '/manager-dashboard';
      case 'employee':
        return '/employee-dashboard';
      default:
        return '/dashboard';
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Full Name Input */}
            <div className="space-y-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  name="firstName"
                  type="text"
                  placeholder="Enter Full Name"
                  value={`${formData.firstName} ${formData.lastName}`.trim()}
                  onChange={(e) => {
                    const fullName = e.target.value;
                    const names = fullName.split(' ');
                    setFormData(prev => ({
                      ...prev,
                      firstName: names[0] || '',
                      lastName: names.slice(1).join(' ') || ''
                    }));
                  }}
                  className="w-full pl-10 pr-4 py-3 text-gray-500 border border-gray-300 rounded-lg outline-purple-500"
                  required
                />
              </div>
              {(errors.firstName || errors.lastName) && <p className="text-red-500 text-sm">{errors.firstName || errors.lastName}</p>}
            </div>

            {/* Email Input */}
            <div className="space-y-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  name="email"
                  type="email"
                  placeholder="Enter Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 text-gray-500 border border-gray-300 rounded-lg outline-purple-500"
                  required
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            {/* Company Name Input */}
            <div className="space-y-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <input
                  name="companyName"
                  type="text"
                  placeholder="Enter Company Name"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 text-gray-500 border border-gray-300 rounded-lg outline-purple-500"
                  required
                />
              </div>
              {errors.companyName && <p className="text-red-500 text-sm">{errors.companyName}</p>}
            </div>

            {/* Country Selection */}
            <div className="space-y-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 text-gray-500 border border-gray-300 rounded-lg outline-purple-500 appearance-none bg-white"
                  required
                >
                  <option value="">Select your country</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {errors.country && <p className="text-red-500 text-sm">{errors.country}</p>}
            </div>

            {/* Phone Number Input */}
            <div className="space-y-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <input
                  name="phoneNumber"
                  type="tel"
                  placeholder="Enter Phone Number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 text-gray-500 border border-gray-300 rounded-lg outline-purple-500"
                />
              </div>
              {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber}</p>}
            </div>

            {/* Date of Birth Input */}
            <div className="space-y-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Enter Date of Birth"
                  className="w-full pl-10 pr-4 py-3 text-gray-500 border border-gray-300 rounded-lg outline-purple-500"
                />
              </div>
            </div>

            {/* Gender Select */}
            <div className="space-y-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <select className="w-full pl-10 pr-4 py-3 text-gray-500 border border-gray-300 rounded-lg outline-purple-500 appearance-none bg-white">
                  <option>Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  name="password"
                  type="password"
                  placeholder="Enter Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 text-gray-500 border border-gray-300 rounded-lg outline-purple-500"
                  required
                />
              </div>
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="Enter Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 text-gray-500 border border-gray-300 rounded-lg outline-purple-500"
                  required
                />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-lg"
              loading={isLoading}
              disabled={isLoading}
            >
              Register →
            </Button>

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
