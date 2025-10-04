import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import { userService } from '../api/authService.js';
import { toast } from 'react-toastify';

const ChangePasswordPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

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

  const validateCurrentPassword = () => {
    const newErrors = {};
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateNewPassword = () => {
    const newErrors = {};

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters long';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one lowercase letter, one uppercase letter, and one number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    
    if (!validateCurrentPassword()) return;

    // Move to step 2 to collect new password
    setStep(2);
    setError('');
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    
    if (!validateNewPassword()) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await userService.changePassword(formData.currentPassword, formData.newPassword);
      if (result.success) {
        toast.success('Password changed successfully!');
        navigate('/dashboard');
      } else {
        setError(result.message || 'Failed to change password');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to change password';
      if (errorMessage.includes('Current password is incorrect')) {
        setError('Current password is incorrect');
        setStep(1); // Go back to step 1
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (validateCurrentPassword()) {
      setStep(2);
      setError('');
    }
  };

  const handleBack = () => {
    setStep(1);
    setError('');
    setFormData(prev => ({
      ...prev,
      newPassword: '',
      confirmPassword: ''
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%238B5CF6' fill-opacity='0.08'%3E%3Cpath d='M40 40c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm20 0c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 via-violet-600 to-purple-800 rounded-2xl mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-900 to-violet-800 bg-clip-text text-transparent mb-2">
              Change Password
            </h1>
            <p className="text-purple-600 font-medium">
              {step === 1 ? 'Enter your current password' : 'Enter your new password'}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
          </div>

          {/* Form */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-purple-200/30 shadow-2xl p-8">
            {step === 1 ? (
              <form onSubmit={handleStep1Submit} className="space-y-6">
                <div>
                  <Input
                    label="Current Password"
                    name="currentPassword"
                    type="password"
                    placeholder="Enter your current password"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    error={errors.currentPassword}
                    required
                    className="bg-purple-50/80 border-purple-200 focus:border-purple-500 rounded-xl"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-red-600 text-sm font-medium">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    Continue
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => navigate('/dashboard')}
                      className="font-medium text-purple-600 hover:text-purple-800 transition-colors duration-200"
                    >
                      Back to Dashboard
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleStep2Submit} className="space-y-6">
                <div>
                  <Input
                    label="New Password"
                    name="newPassword"
                    type="password"
                    placeholder="Enter your new password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    error={errors.newPassword}
                    required
                    className="bg-purple-50/80 border-purple-200 focus:border-purple-500 rounded-xl"
                  />
                </div>

                <div>
                  <Input
                    label="Confirm New Password"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your new password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                    required
                    className="bg-purple-50/80 border-purple-200 focus:border-purple-500 rounded-xl"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-red-600 text-sm font-medium">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    Change Password
                  </Button>

                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      className="flex-1 bg-purple-50 hover:bg-purple-100 border-purple-300 text-purple-700 hover:text-purple-800 font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                    >
                      Back
                    </Button>
                    <button
                      type="button"
                      onClick={() => navigate('/dashboard')}
                      className="flex-1 text-center font-medium text-purple-600 hover:text-purple-800 transition-colors duration-200 py-3"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
