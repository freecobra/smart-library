// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const checkAuth = async () => {
      const token = localStorage.getItem('smartlib_token');
      if (token) {
        try {
          // Verify token is still valid by fetching user
          const response = await authAPI.getCurrentUser();
          // Normalize role to lowercase
          const userWithNormalizedRole = {
            ...response.user,
            role: response.user.role.toLowerCase()
          };
          setUser(userWithNormalizedRole);
        } catch (error) {
          // Token is invalid, clear it
          localStorage.removeItem('smartlib_token');
          localStorage.removeItem('smartlib_user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);

      // Normalize role to lowercase for frontend compatibility
      const userWithNormalizedRole = {
        ...response.user,
        role: response.user.role.toLowerCase()
      };

      // Save token and user data
      localStorage.setItem('smartlib_token', response.token);
      localStorage.setItem('smartlib_user', JSON.stringify(userWithNormalizedRole));

      setUser(userWithNormalizedRole);
      setLoading(false);

      return userWithNormalizedRole;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint to log the action
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local data regardless of API call result
      setUser(null);
      localStorage.removeItem('smartlib_token');
      localStorage.removeItem('smartlib_user');
    }
  };

  const updateUser = (updatedUserData) => {
    // Normalize role to lowercase for frontend compatibility
    const normalizedUser = {
      ...updatedUserData,
      role: updatedUserData.role ? updatedUserData.role.toLowerCase() : user.role
    };

    setUser(normalizedUser);
    localStorage.setItem('smartlib_user', JSON.stringify(normalizedUser));
  };

  const value = {
    user,
    login,
    logout,
    updateUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};