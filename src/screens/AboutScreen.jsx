import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import colors from "../styles/colors";
import Header from "../components/Header";

const { width } = Dimensions.get("window");

const AboutScreen = () => {
  const { user, logout } = useContext(AuthContext);
  const { isDarkMode, toggleTheme, background, cardBackground, text, secondaryText, border } = useContext(ThemeContext);

  // Fallback avatar image
  const avatarUrl = user?.profileUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150";

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={cardBackground} />

      {/* Unified Header */}
      <Header />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Project Header */}
        <View style={[styles.projectHeaderCard, { backgroundColor: cardBackground, borderColor: border }]}>
          <Text style={styles.projectBadge}>ACADEMIC PROTOTYPE</Text>
          <Text style={[styles.projectTitle, { color: text }]}>About Project Swiftly</Text>
          <Text style={[styles.projectSubtitle, { color: secondaryText }]}>Swiftly Home Services Platform</Text>
        </View>

        {/* Section: What is it? */}
        <View style={[styles.infoCard, { backgroundColor: cardBackground, borderColor: border }]}>
          <Text style={[styles.cardHeading, { color: text }]}>✨ What is Project Swiftly?</Text>
          <Text style={[styles.cardBody, { color: text }]}>
            Project Swiftly, branded as **Swiftly**, is a state-of-the-art mobile application designed to bridge the gap between household needs and professional service providers. 
          </Text>
          <Text style={[styles.cardBody, { color: text }]}>
            It delivers a robust platform where customers can effortlessly locate trusted experts for home repairs, cleanings, plumbing, and sanitization, booking them instantly.
          </Text>
        </View>

        {/* Section: How it works? */}
        <View style={[styles.infoCard, { backgroundColor: cardBackground, borderColor: border }]}>
          <Text style={[styles.cardHeading, { color: text }]}>⚙️ How It Works</Text>
          
          <View style={styles.stepRow}>
            <View style={styles.stepNumberContainer}>
              <Text style={styles.stepNumber}>1</Text>
            </View>
            <View style={styles.stepTextContainer}>
              <Text style={[styles.stepTitle, { color: text }]}>Multi-Role Registration</Text>
              <Text style={[styles.stepDesc, { color: secondaryText }]}>
                Users sign up with custom credentials, defining their role as either a **Customer** seeking services or a **Service Provider** offering solutions.
              </Text>
            </View>
          </View>

          <View style={styles.stepRow}>
            <View style={styles.stepNumberContainer}>
              <Text style={styles.stepNumber}>2</Text>
            </View>
            <View style={styles.stepTextContainer}>
              <Text style={[styles.stepTitle, { color: text }]}>Browse & Book Instantly</Text>
              <Text style={[styles.stepDesc, { color: secondaryText }]}>
                Customers inspect verified provider rates on the Dashboard and schedule bookings by slots using COD or Card payment gates.
              </Text>
            </View>
          </View>

          <View style={styles.stepRow}>
            <View style={styles.stepNumberContainer}>
              <Text style={styles.stepNumber}>3</Text>
            </View>
            <View style={styles.stepTextContainer}>
              <Text style={[styles.stepTitle, { color: text }]}>Real-time SMTP Dispatch</Text>
              <Text style={[styles.stepDesc, { color: secondaryText }]}>
                Completing a booking submits data to our Node.js Express API, firing automated confirmation drafts via **Nodemailer**.
              </Text>
            </View>
          </View>

          <View style={styles.stepRow}>
            <View style={styles.stepNumberContainer}>
              <Text style={styles.stepNumber}>4</Text>
            </View>
            <View style={styles.stepTextContainer}>
              <Text style={[styles.stepTitle, { color: text }]}>Simulate Booking Progress</Text>
              <Text style={[styles.stepDesc, { color: secondaryText }]}>
                Users follow their purchases on the **Bookings** list and simulate state updates across Processing, In Progress, and Completed states.
              </Text>
            </View>
          </View>
        </View>

        {/* Section: Tech Stack */}
        <View style={[styles.infoCard, { backgroundColor: cardBackground, borderColor: border }]}>
          <Text style={[styles.cardHeading, { color: text }]}>🛠️ Technology Stack</Text>
          <View style={styles.tagGrid}>
            <View style={[styles.techTag, { backgroundColor: isDarkMode ? '#25252A' : '#F5F6FA' }]}><Text style={[styles.tagText, { color: text }]}>React Native</Text></View>
            <View style={[styles.techTag, { backgroundColor: isDarkMode ? '#25252A' : '#F5F6FA' }]}><Text style={[styles.tagText, { color: text }]}>Expo v56</Text></View>
            {/* <View style={[styles.techTag, { backgroundColor: isDarkMode ? '#25252A' : '#F5F6FA' }]}><Text style={[styles.tagText, { color: text }]}>Express.js</Text></View> */}
            <View style={[styles.techTag, { backgroundColor: isDarkMode ? '#25252A' : '#F5F6FA' }]}><Text style={[styles.tagText, { color: text }]}>Nodemailer</Text></View>
            <View style={[styles.techTag, { backgroundColor: isDarkMode ? '#25252A' : '#F5F6FA' }]}><Text style={[styles.tagText, { color: text }]}>AsyncStorage</Text></View>
            <View style={[styles.techTag, { backgroundColor: isDarkMode ? '#25252A' : '#F5F6FA' }]}><Text style={[styles.tagText, { color: text }]}>Axios APIs</Text></View>
          </View>
        </View>
      </ScrollView>

    </SafeAreaView>
  );
};

export default AboutScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoText: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  logoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF5E5E",
    marginLeft: 3,
    marginTop: 6,
  },
  themeToggle: {
    marginLeft: 12,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: width * 0.5,
  },
  userInfo: {
    marginRight: 10,
    alignItems: "flex-end",
  },
  welcomeText: {
    fontSize: 12,
  },
  userNameText: {
    fontSize: 15,
    fontWeight: "bold",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    backgroundColor: "#eee",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  projectHeaderCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  projectBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#EEECFF",
    color: "#6C63FF",
    fontSize: 10,
    fontWeight: "bold",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 10,
    letterSpacing: 1,
  },
  projectTitle: {
    fontSize: 26,
    fontWeight: "bold",
  },
  projectSubtitle: {
    fontSize: 15,
    marginTop: 4,
  },
  infoCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 10,
  },
  stepRow: {
    flexDirection: "row",
    marginBottom: 18,
  },
  stepNumberContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#6C63FF",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  stepNumber: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  stepTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: "bold",
  },
  stepDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  tagGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  techTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 80,
    paddingRight: 20,
  },
  menuCard: {
    borderRadius: 20,
    width: 250,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
  },
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  largeAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#eee",
    borderWidth: 1.5,
    borderColor: "#6C63FF",
  },
  menuUserDetail: {
    marginLeft: 12,
    flex: 1,
  },
  menuUserName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  menuUserEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  menuSeparator: {
    height: 1,
    marginBottom: 15,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF2F2",
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  logoutText: {
    color: "#FF4D4D",
    fontWeight: "bold",
    fontSize: 14,
  },
  cancelButton: {
    alignItems: "center",
    paddingVertical: 10,
  },
  cancelText: {
    fontSize: 13,
  },
});
