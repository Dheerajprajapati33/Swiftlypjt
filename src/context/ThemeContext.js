import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('@swiftly_dark_mode');
        if (storedTheme !== null) {
          setIsDarkMode(JSON.parse(storedTheme));
        }
      } catch (e) {
        console.error("Failed to load theme preference", e);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    try {
      const nextTheme = !isDarkMode;
      setIsDarkMode(nextTheme);
      await AsyncStorage.setItem('@swiftly_dark_mode', JSON.stringify(nextTheme));
    } catch (e) {
      console.error("Failed to save theme preference", e);
    }
  };

  //used For theme colors and values across the app, making it easy to switch between light and dark modes
  const theme = {
    isDarkMode,
    toggleTheme,
    background: isDarkMode ? '#121214' : '#F5F6FA',
    cardBackground: isDarkMode ? '#1A1A1E' : '#FFFFFF',
    text: isDarkMode ? '#F5F6FA' : '#111111',
    secondaryText: isDarkMode ? '#A0A5B5' : '#666666',
    border: isDarkMode ? '#2E2E36' : '#EBF0FF',
    inputBackground: isDarkMode ? '#25252A' : '#F9FAFC',
    primary: '#6C63FF',
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};
