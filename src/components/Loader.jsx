import React from "react";
import { View, ActivityIndicator } from "react-native";

const Loader = () => {
  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      <ActivityIndicator size="large" color="#6C63FF" />
    </View>
  );
};

export default Loader;
