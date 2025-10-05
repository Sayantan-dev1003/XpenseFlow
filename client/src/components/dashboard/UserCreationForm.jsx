import React, { useState, useEffect } from 'react';
import { FiX, FiUser, FiMail, FiShield, FiUsers } from 'react-icons/fi';
import Button from '../common/Button.jsx';
import Input from '../common/Input.jsx';
import userService from '../../api/userService.js';
import { toast } from 'react-toastify';

const UserCreationForm = ({ onClose, onUserCreated }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: '',
    manager: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [managers, setManagers] = useState([]);

  useEffect(() => {
    loadManagers();
  }, []);

  const loadManagers = async () => {
    try {
      const response = await userService.getManagers();
      if (response.success) {
        setManagers(response.data.managers || []);
      }
    } catch (error) {
      console.error('Failed to load managers:', error);
    }
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

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\+?[\d\s\-()]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one lowercase letter, one uppercase letter, and one number';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    if (formData.role === 'employee' && !formData.manager) {
      newErrors.manager = 'Manager is required for employees';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const result = await userService.createUser(formData);
      
      if (result.success) {
        // Check email status
        if (result.data.emailStatus && result.data.emailStatus.sent) {
          toast.success('User created successfully! Welcome email sent.');
        } else if (result.data.emailStatus && !result.data.emailStatus.sent) {
          toast.warning(`User created successfully, but welcome email could not be sent. ${result.data.emailStatus.error || 'Please contact the administrator.'}`);
        } else {
          toast.success('User created successfully!');
        }
        
        onUserCreated && onUserCreated(result.data.user);
        onClose();
        
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          password: '',
          role: '',
          manager: ''
        });
      } else {
        toast.error(result.message || 'Failed to create user');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create user';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiUser className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Create New User</h2>
              <p className="text-sm text-gray-500">Add a new team member to your company</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Full Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                label="First Name"
                name="firstName"
                type="text"
                placeholder="Enter first name"
                value={formData.firstName}
                onChange={handleChange}
                error={errors.firstName}
                required
                className="bg-gray-50 text-gray-500 border-gray-200 focus:border-purple-500 rounded-xl text-grey-500"
              />
            </div>
            <div>
              <Input
                label="Last Name"
                name="lastName"
                type="text"
                placeholder="Enter last name"
                value={formData.lastName}
                onChange={handleChange}
                error={errors.lastName}
                required
                className="bg-gray-50 text-gray-500 border-gray-200 focus:border-purple-500 rounded-xl text-grey-500"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
              className="bg-gray-50 text-gray-500 border-gray-200 focus:border-purple-500 rounded-xl text-grey-500"
            />
          </div>

          {/* Phone Number */}
          <div>
            <Input
              label="Phone Number"
              name="phoneNumber"
              type="tel"
              placeholder="Enter phone number"
              value={formData.phoneNumber}
              onChange={handleChange}
              error={errors.phoneNumber}
              required
              className="bg-gray-50 text-gray-500 border-gray-200 focus:border-purple-500 rounded-xl text-grey-500"
            />
          </div>

          {/* Password */}
          <div>
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
              className="bg-gray-50 text-gray-500 border-gray-200 focus:border-purple-500 rounded-xl text-grey-500"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <div className="relative">
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 text-gray-500 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                required
              >
                <option value="">Select a role</option>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="finance">Finance Team</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
          </div>

          {/* Manager Selection (only for employees) */}
          {formData.role === 'employee' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manager
              </label>
              <div className="relative">
                <select
                  name="manager"
                  value={formData.manager}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-gray-500 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                  required
                >
                  <option value="">Select a manager</option>
                  {managers.map((manager) => (
                    <option key={manager._id} value={manager._id}>
                      {manager.firstName} {manager.lastName}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {errors.manager && <p className="text-red-500 text-sm mt-1">{errors.manager}</p>}
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-gray-50 hover:bg-gray-100 border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              loading={isLoading}
              disabled={isLoading}
            >
              Create User
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserCreationForm;
