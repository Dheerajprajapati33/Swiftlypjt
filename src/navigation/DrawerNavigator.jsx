import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";

// screens
import DashboardScreen from "../screens/dashboard/DashboardScreen";
import ServicesScreen from "../screens/services/ServicesScreen";

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator>
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />
      <Drawer.Screen name="Services" component={ServicesScreen} />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
