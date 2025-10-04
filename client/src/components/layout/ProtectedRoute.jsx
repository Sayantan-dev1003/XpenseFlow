import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import Spinner from '../common/Spinner';

const ProtectedRoute = ({ children, requireAuth = true, allowInProgress = false }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="xl" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authentication is not required but user is authenticated (e.g., login/register pages)
  // Allow in-progress authentication flows to continue
  if (!requireAuth && isAuthenticated && !allowInProgress) {
    // Redirect based on user role
    const redirectPath = getRoleBasedRedirectPath(user);
    return <Navigate to={redirectPath} replace />;
  }

  return children;
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
    case 'finance':
      return '/finance-dashboard';
    default:
      return '/dashboard';
  }
};

export default ProtectedRoute;