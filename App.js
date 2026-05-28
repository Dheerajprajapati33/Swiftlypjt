import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthProvider from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import StackNavigator from './src/navigation/StackNavigator';

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NavigationContainer>
          <StackNavigator />
        </NavigationContainer>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;