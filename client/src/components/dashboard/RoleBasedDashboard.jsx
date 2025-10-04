import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import AdminDashboard from './AdminDashboard';
import ManagerDashboard from './ManagerDashboard';
import EmployeeDashboard from './EmployeeDashboard';
import FinanceDashboard from './FinanceDashboard';
import { FiLoader } from 'react-icons/fi';

const RoleBasedDashboard = () => {
  const { user, isLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && !isLoading) {
      // Load dashboard data based on user role
      loadDashboardData();
    }
  }, [user, isLoading]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Dashboard data will be loaded by individual dashboard components
      setDashboardData({ loaded: true });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="animate-spin h-8 w-8 mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  // Render dashboard based on user role
  const renderDashboard = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard user={user} />;
      case 'manager':
        return <ManagerDashboard user={user} />;
      case 'employee':
        return <EmployeeDashboard user={user} />;
      case 'finance':
        return <FinanceDashboard user={user} />;
      default:
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-600">Invalid user role: {user.role}</p>
              <p className="text-gray-600 mt-2">Please contact your administrator.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderDashboard()}
    </div>
  );
};

export default RoleBasedDashboard;
