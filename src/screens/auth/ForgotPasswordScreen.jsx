import React from "react";
import { View, Text, StyleSheet } from "react-native";

const ForgotPasswordScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Forgot Password</Text>
    </View>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
