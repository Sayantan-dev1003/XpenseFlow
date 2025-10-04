import React, { createContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { authService } from '../api/authService.js';
import { clearTokens, storeTokens } from '../api/userService.js';
import { toast } from 'react-toastify';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };

    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is logged in on app start
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const response = await authService.getCurrentUser();
        dispatch({
          type: AUTH_ACTIONS.SET_USER,
          payload: response.data.user
        });
      } catch (error) {
        console.error('Auth check failed:', error);
        clearTokens();
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    } else {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login function - Step 1: Check credentials
  const login = useCallback(async (credentials) => {
    try {
      const response = await authService.login(credentials);
      
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Send login OTP function - Step 2: Send OTP
  const sendLoginOTP = useCallback(async (userId, method) => {
    try {
      const response = await authService.sendLoginOTP(userId, method);
      
      if (response.success) {
        toast.success(response.message);
        return { success: true, data: response.data };
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send OTP';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Verify login OTP function - Step 3: Verify OTP and complete login
  const verifyLoginOTP = useCallback(async (userId, otp, method) => {
    try {
      const response = await authService.verifyLoginOTP(userId, otp, method);
      
      if (response.success) {
        const { user, accessToken, refreshToken } = response.data;
        
        storeTokens(accessToken, refreshToken);
        
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user }
        });
        
        toast.success('Login successful!');
        return { success: true, user };
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'OTP verification failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.REGISTER_START });
      
      const response = await authService.register(userData);
      
      if (response.success) {
        const { user, accessToken, refreshToken } = response.data;
        
        storeTokens(accessToken, refreshToken);
        
        dispatch({
          type: AUTH_ACTIONS.REGISTER_SUCCESS,
          payload: { user }
        });
        
        toast.success('Registration successful!');
        return { success: true, data: response.data };
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: errorMessage
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearTokens();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      toast.success('Logged out successfully');
    }
  }, []);



  // Social login functions
  const googleLogin = useCallback(() => {
    authService.googleAuth();
  }, []);

  const githubLogin = useCallback(() => {
    authService.githubAuth();
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  // Context value - memoized to prevent unnecessary re-renders
  const value = useMemo(() => ({
    ...state,
    login,
    sendLoginOTP,
    verifyLoginOTP,
    register,
    logout,
    googleLogin,
    githubLogin,
    clearError
  }), [state, login, sendLoginOTP, verifyLoginOTP, register, logout, googleLogin, githubLogin, clearError]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;