import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
import API from "../../api/axios";
import colors from "../../styles/colors";

const { width } = Dimensions.get("window");

const ManageServiceScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);
  const { isDarkMode, toggleTheme, background, cardBackground, text, secondaryText, border, inputBackground } = useContext(ThemeContext);
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Form Fields
  const [serviceName, setServiceName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [contact, setContact] = useState("");
  const [displayImage, setDisplayImage] = useState("");

  const avatarUrl = user?.profileUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150";

  // Load existing service configuration if available
  useEffect(() => {
    const fetchExistingService = async () => {
      if (!user?.email) return;
      try {
        const response = await API.get("/services");
        const service = response.data.find(
          (s) => s.providerEmail.toLowerCase() === user.email.toLowerCase()
        );
        if (service) {
          setServiceName(service.name);
          setDescription(service.description);
          setPrice(service.price);
          setContact(service.contact);
          setDisplayImage(service.providerAvatar || "");
        }
      } catch (error) {
        console.error("Failed to load service data:", error);
      } finally {
        setFetching(false);
      }
    };
    fetchExistingService();
  }, [user?.email]);

  const handleSaveService = async () => {
    if (!serviceName.trim() || !description.trim() || !price.trim() || !contact.trim()) {
      alert("Validation Error", "All fields are required to setup your service profile.");
      return;
    }

    setLoading(true);
    try {
      const response = await API.post("/services/setup", {
        providerEmail: user?.email,
        providerName: user?.name,
        providerAvatar: displayImage.trim() || user?.profileUrl || "",
        name: serviceName,
        description,
        price,
        contact,
      });

      if (response.data.success) {
        alert(
          "Service Catalog Updated",
          "Your service details have been successfully saved and published! Customers can now book your services.",
          [{ text: "OK", onPress: () => navigation.navigate("Home") }]
        );
      }
    } catch (error) {
      console.error("Failed to save service:", error);
      alert("Error", error.response?.data?.message || "Could not publish service profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={cardBackground} />

      {/* Header / Top Bar */}
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

      {fetching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={[styles.loadingText, { color: secondaryText }]}>Fetching profile config...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.formCard, { backgroundColor: cardBackground, borderColor: border }]}>
            <Text style={[styles.formTitle, { color: text }]}>Define Service Solutions</Text>
            <Text style={[styles.formSubtitle, { color: secondaryText }]}>Enter details of what services you provide</Text>

            {/* Service Name Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: text }]}>Service Name / Title</Text>
              <TextInput
                style={[styles.input, { backgroundColor: inputBackground, borderColor: border, color: text }]}
                placeholder="e.g. Pro Aircon Cleaning or Wire Leakage Repair"
                placeholderTextColor={isDarkMode ? '#888' : '#999'}
                value={serviceName}
                onChangeText={setServiceName}
              />
            </View>

            {/* Policy & solutions description */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: text }]}>Service Policies & Solutions Description</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: inputBackground, borderColor: border, color: text }]}
                placeholder="Describe your service checklist, guarantee policy, materials used, etc."
                placeholderTextColor={isDarkMode ? '#888' : '#999'}
                value={description}
                onChangeText={setDescription}
                multiline={true}
                numberOfLines={5}
              />
            </View>

            {/* Price Cost */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: text }]}>Rate / Service Cost</Text>
              <TextInput
                style={[styles.input, { backgroundColor: inputBackground, borderColor: border, color: text }]}
                placeholder="e.g. $85/hr or $150/flat"
                placeholderTextColor={isDarkMode ? '#888' : '#999'}
                value={price}
                onChangeText={setPrice}
              />
            </View>

            {/* Contact Number */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: text }]}>Business Hotline / Phone</Text>
              <TextInput
                style={[styles.input, { backgroundColor: inputBackground, borderColor: border, color: text }]}
                placeholder="e.g. 555-0199"
                placeholderTextColor={isDarkMode ? '#888' : '#999'}
                keyboardType="phone-pad"
                value={contact}
                onChangeText={setContact}
              />
            </View>

            {/* Display Image URL */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: text }]}>Service Image URL (Optional)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: inputBackground, borderColor: border, color: text }]}
                placeholder="https://example.com/service-banner.jpg"
                placeholderTextColor={isDarkMode ? '#888' : '#999'}
                autoCapitalize="none"
                value={displayImage}
                onChangeText={setDisplayImage}
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveService}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Publish Service Profile</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Logout Dropdown Popup Modal */}
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

export default ManageServiceScreen;

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
  formCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 3,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  formSubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
  },
  textArea: {
    textAlignVertical: "top",
    height: 100,
  },
  saveButton: {
    backgroundColor: "#6C63FF",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
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
