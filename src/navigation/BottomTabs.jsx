import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';

// screens
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import BookingsScreen from '../screens/services/BookingsScreen';
import AboutScreen from '../screens/AboutScreen';

// provider Screens
import ProviderDashboardScreen from '../screens/dashboard/ProviderDashboardScreen';
import ManageServiceScreen from '../screens/provider/ManageServiceScreen';
import ProviderBookingsScreen from '../screens/provider/ProviderBookingsScreen';

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  const { user } = useContext(AuthContext);
  const isProvider = user?.role === 'service_provider';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home-outline';
          } else if (route.name === 'Bookings' || route.name === 'Client Bookings') {
            iconName = 'calendar-outline';
          } else if (route.name === 'Manage Service') {
            iconName = 'build-outline';
          } else if (route.name === 'About') {
            iconName = 'information-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6C63FF',
        tabBarInactiveTintColor: '#888888',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#EBF0FF',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: '#FFFFFF',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      })}
    >
      {isProvider ? (
        <>
          <Tab.Screen name="Home" component={ProviderDashboardScreen} />
          <Tab.Screen name="Manage Service" component={ManageServiceScreen} />
          <Tab.Screen name="Client Bookings" component={ProviderBookingsScreen} />
          <Tab.Screen name="About" component={AboutScreen} />
        </>
      ) : (
        <>
          <Tab.Screen name="Home" component={DashboardScreen} />
          <Tab.Screen name="Bookings" component={BookingsScreen} />
          <Tab.Screen name="About" component={AboutScreen} />
        </>
      )}
    </Tab.Navigator>
  );
};

export default BottomTabs;