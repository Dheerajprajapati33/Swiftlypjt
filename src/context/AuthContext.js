import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../api/axios';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {

  //useState
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    // Check if user is logged in
    const checkLoginStatus = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@swiftly_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error("Failed to load user state from AsyncStorage", e);
      } finally {
        setLoading(false);
      }
    };
    checkLoginStatus();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await API.post('/auth/login', { email, password });
      const userData = response.data;
      await AsyncStorage.setItem('@swiftly_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Invalid email or password';
      return { success: false, error: errorMsg };
    }
  };

  const register = async (name, email, profileUrl, role, password) => {
    try {
      await API.post('/auth/register', {
        name,
        email,
        profileUrl,
        role,
        password,
      });
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Registration failed';
      return { success: false, error: errorMsg };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('@swiftly_user');
      setUser(null);
    } catch (e) {
      console.error("Failed to clear user storage on logout", e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;