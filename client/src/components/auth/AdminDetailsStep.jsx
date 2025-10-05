import React from 'react';
import { useRegistration } from '../../context/RegistrationContext';
import { FiUser, FiMail, FiPhone, FiCalendar, FiLock } from 'react-icons/fi';

const AdminDetailsStep = () => {
  const { registrationData, updateRegistrationData } = useRegistration();

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateRegistrationData({ [name]: value });
  };

  return (
    <div className="space-y-6">
      {/* First Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiUser className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            name="firstName"
            value={registrationData.firstName}
            onChange={handleChange}
            className="pl-10 block w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-500 outline-purple-500 transition-colors duration-200"
            placeholder="Enter first name"
            required
          />
        </div>
      </div>

      {/* Last Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiUser className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            name="lastName"
            value={registrationData.lastName}
            onChange={handleChange}
            className="pl-10 block w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-500 outline-purple-500 transition-colors duration-200"
            placeholder="Enter last name"
            required
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiMail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="email"
            name="email"
            value={registrationData.email}
            onChange={handleChange}
            className="pl-10 block w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-500 outline-purple-500 transition-colors duration-200"
            placeholder="Enter email address"
            required
          />
        </div>
      </div>

      {/* Phone Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiPhone className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="tel"
            name="phoneNumber"
            value={registrationData.phoneNumber}
            onChange={handleChange}
            className="pl-10 block w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-500 outline-purple-500 transition-colors duration-200"
            placeholder="Enter phone number"
            required
          />
        </div>
      </div>

      {/* Date of Birth */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiCalendar className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="date"
            name="dateOfBirth"
            value={registrationData.dateOfBirth}
            onChange={handleChange}
            className="pl-10 block w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-500 outline-purple-500 transition-colors duration-200"
            required
          />
        </div>
      </div>

      {/* Gender */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
        <select
          name="gender"
          value={registrationData.gender}
          onChange={handleChange}
          className="block w-full py-3 px-4 border border-gray-300 bg-white rounded-lg text-gray-500 outline-purple-500 transition-colors duration-200"
          required
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="prefer-not-to-say">Prefer not to say</option>
        </select>
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiLock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="password"
            name="password"
            value={registrationData.password}
            onChange={handleChange}
            className="pl-10 block w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-500 outline-purple-500 transition-colors duration-200"
            placeholder="Enter password"
            required
            minLength={6}
          />
        </div>
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiLock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="password"
            name="confirmPassword"
            value={registrationData.confirmPassword}
            onChange={handleChange}
            className="pl-10 block w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-500 outline-purple-500 transition-colors duration-200"
            placeholder="Confirm password"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDetailsStep;