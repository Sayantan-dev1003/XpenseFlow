import { useContext } from 'react';
import AuthContext from '../context/AuthContext.jsx';

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Additional auth-related hooks
export const useAuthState = () => {
  const { user, isAuthenticated, isLoading, error } = useAuth();
  return { user, isAuthenticated, isLoading, error };
};

export const useAuthActions = () => {
  const { 
    login, 
    sendLoginOTP,
    verifyLoginOTP,
    register, 
    logout, 
    verifyOTP, 
    resendOTP, 
    googleLogin,
    githubLogin,
    clearError 
  } = useAuth();
  
  return {
    login,
    sendLoginOTP,
    verifyLoginOTP,
    register,
    logout,
    verifyOTP,
    resendOTP,
    googleLogin,
    githubLogin,
    clearError
  };
};