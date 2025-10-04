import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import Button from '../components/common/Button.jsx';
import userService from '../api/userService.js';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await userService.getUserStats();
        if (response.success) {
          setStats(response.data.stats);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, []);


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%238B5CF6' fill-opacity='0.08'%3E%3Cpath d='M40 40c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm20 0c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Logout Button */}
        <div className="flex justify-between items-start mb-12">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-black bg-gradient-to-r from-purple-900 via-violet-800 to-purple-900 bg-clip-text text-transparent mb-3 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-xl text-purple-700 font-semibold">
              {user?.firstName}, here's your dashboard overview
            </p>
          </div>
          
          {/* Logout Button - Top Right */}
          <Button
            variant="danger"
            className="bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white font-bold px-6 py-3 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none"
            onClick={logout}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Profile Card */}
          <div className="xl:col-span-3">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-purple-200/30 shadow-2xl p-8 hover:shadow-3xl transition-all duration-300">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-900 to-violet-800 bg-clip-text text-transparent mb-2">Profile Information</h2>
                  <p className="text-purple-600 font-medium">View your personal details and account information</p>
                </div>
                <div className="flex space-x-3">
                  {/* Change Password Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/change-password')}
                    className="bg-purple-50 hover:bg-purple-100 border-purple-300 text-purple-700 hover:text-purple-800 transition-all duration-200 font-semibold"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    Change Password
                  </Button>
                </div>
              </div>

              <div className="space-y-8">
                {/* Profile Picture */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-28 h-28 bg-gradient-to-br from-purple-500 via-violet-600 to-purple-700 rounded-3xl flex items-center justify-center overflow-hidden shadow-2xl">
                      {user?.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-4xl font-black text-white">
                          {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center"></div>
                  </div>
                  <div>
                    <h3 className="text-3xl font-black bg-gradient-to-r from-purple-900 to-violet-800 bg-clip-text text-transparent mb-2">
                      {user?.firstName} {user?.lastName}
                    </h3>
                    <p className="text-purple-600 text-lg font-semibold mb-3">{user?.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats and Actions */}
          <div className="space-y-6">
            {/* Account Stats */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-purple-200/30 shadow-2xl p-6 hover:shadow-3xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-violet-700 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-900 to-violet-800 bg-clip-text text-transparent">Account Stats</h3>
              </div>

              <div className="space-y-4">                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-100 to-violet-100 rounded-2xl border border-purple-200">
                  <div className="flex items-center">
                    <span className="text-purple-700 font-bold">Status:</span>
                  </div>
                  <span className="font-bold text-purple-900">Active</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-100 to-purple-100 rounded-2xl border border-violet-200">
                  <div className="flex items-center">
                    <span className="text-purple-700 font-bold">Last Login:</span>
                  </div>
                  <span className="font-black text-purple-900">
                    {stats?.lastLogin ? new Date(stats.lastLogin).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;