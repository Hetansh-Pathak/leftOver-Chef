import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());

  useEffect(() => {
    // Check if user is already logged in (e.g., from localStorage)
    const checkAuthStatus = () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      const savedFavorites = localStorage.getItem('userFavorites');

      if (token && userData) {
        setIsAuthenticated(true);
        setUser(JSON.parse(userData));
        // Set axios default authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      // Load saved favorites
      if (savedFavorites) {
        try {
          const favoritesArray = JSON.parse(savedFavorites);
          setFavorites(new Set(favoritesArray));
        } catch (error) {
          console.error('Error loading favorites:', error);
          setFavorites(new Set());
        }
      }

      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = (userData, token) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // Set axios default authorization header
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    // Remove axios default authorization header
    delete axios.defaults.headers.common['Authorization'];
  };

  // API functions
  const registerUser = async (userData) => {
    try {
      const response = await axios.post('/api/users/register', userData);
      const { user, token } = response.data;
      login(user, token);
      return { success: true, user, token };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };
  
  const loginUser = async (credentials) => {
    try {
      const response = await axios.post('/api/users/login', credentials);
      const { user, token } = response.data;
      login(user, token);
      return { success: true, user, token };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
                error: error.response?.data?.message || 'Login failed',
        userNotFound: error.response?.data?.userNotFound,
        invalidPassword: error.response?.data?.invalidPassword 
      };
    }
  };

    // OAuth functions
  const googleAuth = async (token, isSignup = false) => {
    try {
      const response = await axios.post('/api/auth/google/verify', {
        token,
        isSignup
      });

      if (response.data.success) {
        const { user, token: jwtToken } = response.data;
        login(user, jwtToken);
        return { success: true, user, token: jwtToken };
      }

      return response.data;
    } catch (error) {
      console.error('Google auth error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Google authentication failed',
        ...error.response?.data
      };
    }
  };

  const facebookAuth = async (accessToken, userID, isSignup = false) => {
    try {
      const response = await axios.post('/api/auth/facebook/verify', {
        accessToken,
        userID,
        isSignup
      });

      if (response.data.success) {
        const { user, token: jwtToken } = response.data;
        login(user, jwtToken);
        return { success: true, user, token: jwtToken };
      }

      return response.data;
    } catch (error) {
      console.error('Facebook auth error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Facebook authentication failed',
        ...error.response?.data
      };
    }
  };

  const checkEmailExists = async (email) => {
    try {
      const response = await axios.post('/api/auth/check-email', { email });
      return response.data;
    } catch (error) {
      console.error('Email check error:', error);
      return { success: false, error: 'Failed to check email' };
    }
  };

  const value = {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
    registerUser,
    loginUser,
    googleAuth,
    facebookAuth,
    checkEmailExists
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
