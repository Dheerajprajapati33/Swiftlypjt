import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const LandingScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Swiftly</Text>
      <Text style={styles.subtitle}>Professional Home Services</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LandingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#6C63FF',
  },
  subtitle: {
    marginTop: 10,
    color: '#666',
  },
  button: {
    marginTop: 40,
    backgroundColor: '#6C63FF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  buttonText: {color: '#fff',
    fontWeight: 'bold',
  },
});
