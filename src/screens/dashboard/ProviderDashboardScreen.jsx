import React, { useContext, useState, useEffect, useCallback } from "react";
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
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
import API from "../../api/axios";
import colors from "../../styles/colors";

const { width } = Dimensions.get("window");

const ProviderDashboardScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);
  const { isDarkMode, toggleTheme, background, cardBackground, text, secondaryText, border } = useContext(ThemeContext);
  const [menuVisible, setMenuVisible] = useState(false);
  const [myService, setMyService] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fallback avatar image by default
  const avatarUrl = user?.profileUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150";

  const fetchMyService = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const response = await API.get("/services");
      const service = response.data.find(
        (s) => s.providerEmail.toLowerCase() === user.email.toLowerCase()
      );
      setMyService(service || null);
    } catch (error) {
      console.error("Failed to fetch provider service:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMyService();
    }, [user?.email])
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={cardBackground} />

      {/* Consistent Top Bar */}
      <View style={[styles.header, { backgroundColor: cardBackground, borderBottomColor: border }]}>
        <View style={styles.logoContainer}>
          <Text style={[styles.logoText, { color: isDarkMode ? '#FFFFFF' : '#6C63FF' }]}>Swiftly</Text>
          <View style={styles.logoDot} />

          {/* Theme Toggler Button just after Swiftly text */}
          <TouchableOpacity 
            onPress={toggleTheme} 
            style={[styles.themeToggle, { borderColor: border, backgroundColor: isDarkMode ? '#25252A' : '#F2F4F7' }]}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={isDarkMode ? "sunny" : "moon"} 
              size={16} 
              color={isDarkMode ? "#FFD700" : "#6C63FF"} 
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.profileContainer}
          onPress={() => setMenuVisible(true)}
          activeOpacity={0.7}
        >
          <View style={styles.userInfo}>
            <Text style={[styles.welcomeText, { color: secondaryText }]}>Hello,</Text>
            <Text style={[styles.userNameText, { color: text }]} numberOfLines={1}>
              {user?.name || "Guest"}
            </Text>
          </View>
          <Image source={{ uri: avatarUrl }} style={[styles.avatar, { borderColor: isDarkMode ? '#A0A5B5' : '#6C63FF' }]} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeBadge}>PARTNER PORTAL</Text>
          <Text style={styles.welcomeTitle}>Service Provider Panel</Text>
          <Text style={styles.welcomeDesc}>
            Manage your service solutions, define prices, outline policies, and process incoming customer requests.
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6C63FF" />
            <Text style={[styles.loadingText, { color: secondaryText }]}>Loading your service details...</Text>
          </View>
        ) : !myService ? (
          /* Blank state: No services listed */
          <View style={[styles.blankDashboard, { backgroundColor: cardBackground, borderColor: border }]}>
            <Text style={styles.blankIcon}>🛠️</Text>
            <Text style={[styles.blankTitle, { color: text }]}>Define Your Service</Text>
            <Text style={[styles.blankText, { color: secondaryText }]}>
              Your service catalog is currently empty. Define the type of services you provide so customers can book you on their dashboard!
            </Text>
            <TouchableOpacity
              style={styles.setupButton}
              onPress={() => navigation.navigate("Manage Service")}
            >
              <Text style={styles.setupButtonText}>Setup Service Profile</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Active state: Displays current service details */
          <View style={[styles.activeServiceCard, { backgroundColor: cardBackground, borderColor: border }]}>
            <View style={styles.activeServiceHeader}>
              <View style={[styles.activeIconBg, { backgroundColor: isDarkMode ? '#2E2E36' : '#EEECFF' }]}>
                <Text style={styles.activeIcon}>💼</Text>
              </View>
              <View style={styles.activeHeaderText}>
                <Text style={[styles.activeServiceTitle, { color: text }]}>Active Listing</Text>
                <Text style={styles.activeServiceCategory}>{myService.category}</Text>
              </View>
              <Text style={styles.activeServicePrice}>{myService.price}</Text>
            </View>

            <View style={[styles.divider, { backgroundColor: border }]} />

            <View style={styles.serviceDetailItem}>
              <Text style={[styles.detailLabel, { color: secondaryText }]}>Service Name / Type:</Text>
              <Text style={[styles.detailValue, { color: text }]}>{myService.name}</Text>
            </View>

            <View style={styles.serviceDetailItem}>
              <Text style={[styles.detailLabel, { color: secondaryText }]}>Contact Hotline:</Text>
              <Text style={[styles.detailValue, { color: text }]}>{myService.contact}</Text>
            </View>

            <View style={styles.serviceDetailItem}>
              <Text style={[styles.detailLabel, { color: secondaryText }]}>Service Policy / Solution Details:</Text>
              <Text style={[styles.policyText, { color: text }]}>{myService.description}</Text>
            </View>

            <View style={[styles.divider, { backgroundColor: border }]} />

            <Text style={[styles.helperText, { color: secondaryText }]}>
              Need to make updates? Go to the **Manage Service** tab to change rates, policies, or details.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Profile Logout Dialog Modal */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={[styles.menuCard, { backgroundColor: cardBackground }]}>
            <View style={styles.menuHeader}>
              <Image source={{ uri: avatarUrl }} style={styles.largeAvatar} />
              <View style={styles.menuUserDetail}>
                <Text style={[styles.menuUserName, { color: text }]} numberOfLines={1}>{user?.name}</Text>
                <Text style={[styles.menuUserEmail, { color: secondaryText }]} numberOfLines={1}>{user?.email}</Text>
              </View>
            </View>

            <View style={[styles.menuSeparator, { backgroundColor: border }]} />

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => {
                setMenuVisible(false);
                logout();
              }}
            >
              <Text style={styles.logoutText}>🚪 Logout</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setMenuVisible(false)}
            >
              <Text style={[styles.cancelText, { color: secondaryText }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default ProviderDashboardScreen;

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
  welcomeCard: {
    backgroundColor: "#6C63FF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: 25,
  },
  welcomeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 12,
    letterSpacing: 1,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  welcomeDesc: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.85)",
    lineHeight: 22,
  },
  loadingContainer: {
    paddingVertical: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  blankDashboard: {
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 3,
  },
  blankIcon: {
    fontSize: 50,
    marginBottom: 15,
  },
  blankTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  blankText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  setupButton: {
    backgroundColor: "#6C63FF",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  setupButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  activeServiceCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 3,
  },
  activeServiceHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  activeIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  activeIcon: {
    fontSize: 20,
  },
  activeHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  activeServiceTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  activeServiceCategory: {
    fontSize: 12,
    color: "#6C63FF",
    fontWeight: "600",
    marginTop: 2,
  },
  activeServicePrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6C63FF",
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  serviceDetailItem: {
    marginBottom: 14,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "bold",
  },
  policyText: {
    fontSize: 14,
    lineHeight: 20,
  },
  helperText: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 8,
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
