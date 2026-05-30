import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from "react-native";
import { ThemeContext } from "../context/ThemeContext";
import Header from "../components/Header";

const LandingScreen = ({ navigation }) => {
  const { isDarkMode, background, text, secondaryText, cardBackground, border } = useContext(ThemeContext);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={background} />
      
      {/* Unified Header with Theme Switcher, no Profile Dropdown */}
      <Header showProfile={false} />

      <View style={styles.container}>
        <View style={[styles.heroCard, { backgroundColor: cardBackground, borderColor: border }]}>
          <Text style={styles.brandTitle}>Swiftly</Text>
          <Text style={[styles.subtitle, { color: secondaryText }]}>
            Professional Household Solutions, Delivered Instantly.
          </Text>
          <Text style={[styles.description, { color: text }]}>
            Connecting you to certified electricians, emergency plumbers, pro cleaning solutions, and sanitization partners in seconds.
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Login")}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.footerText, { color: secondaryText }]}>
          Project Swiftly Prototype App • All Rights Reserved
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default LandingScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  heroCard: {
    borderRadius: 30,
    borderWidth: 1,
    padding: 30,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  brandTitle: {
    fontSize: 48,
    fontWeight: "900",
    color: "#6C63FF",
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
    lineHeight: 22,
  },
  description: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 35,
  },
  button: {
    backgroundColor: "#6C63FF",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  footerText: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 40,
  },
});
