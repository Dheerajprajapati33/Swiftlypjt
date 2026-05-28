import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";

const { width } = Dimensions.get("window");

const Header = ({ showProfile = true }) => {
  const { user, logout } = useContext(AuthContext);
  const { isDarkMode, toggleTheme, background, cardBackground, text, secondaryText, border } = useContext(ThemeContext);
  const [menuVisible, setMenuVisible] = useState(false);

  const avatarUrl = user?.profileUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150";

  return (
    <>
      <View style={[styles.header, { backgroundColor: cardBackground, borderBottomColor: border }]}>
        <View style={styles.logoContainer}>
          <Text style={[styles.logoText, { color: isDarkMode ? '#FFFFFF' : '#6C63FF' }]}>Swiftly</Text>
          <View style={styles.logoDot} />

          {/* Theme Selector Segmented Control just after Swiftly text */}
          <View style={[styles.themeContainer, { backgroundColor: isDarkMode ? '#25252A' : '#F2F4F7', borderColor: border }]}>
            <TouchableOpacity
              onPress={() => isDarkMode && toggleTheme()}
              style={[
                styles.themeOption,
                !isDarkMode && styles.themeOptionActiveLight,
              ]}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="sunny" 
                size={11} 
                color={!isDarkMode ? "#6C63FF" : "#8E8E93"} 
              />
              <Text style={[styles.themeOptionText, { color: !isDarkMode ? "#6C63FF" : "#8E8E93" }]}>Light</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => !isDarkMode && toggleTheme()}
              style={[
                styles.themeOption,
                isDarkMode && styles.themeOptionActiveDark,
              ]}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="moon" 
                size={11} 
                color={isDarkMode ? "#FFD700" : "#8E8E93"} 
              />
              <Text style={[styles.themeOptionText, { color: isDarkMode ? "#F5F6FA" : "#8E8E93" }]}>Dark</Text>
            </TouchableOpacity>
          </View>
        </View>

        {showProfile && user ? (
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
        ) : null}
      </View>

      {/* Profile Logout Dialog Modal */}
      {showProfile && user && (
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
            <View style={[styles.menuCard, { backgroundColor: cardBackground, borderColor: border, borderWidth: 1 }]}>
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
      )}
    </>
  );
};

export default Header;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoText: {
    fontSize: 22,
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
    marginRight: 6,
  },
  themeContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 2,
    borderWidth: 1,
    marginLeft: 8,
  },
  themeOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  themeOptionActiveLight: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  themeOptionActiveDark: {
    backgroundColor: "#1A1A1E",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  themeOptionText: {
    fontSize: 10,
    fontWeight: "bold",
    marginLeft: 3,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: width * 0.45,
  },
  userInfo: {
    marginRight: 8,
    alignItems: "flex-end",
  },
  welcomeText: {
    fontSize: 11,
  },
  userNameText: {
    fontSize: 13,
    fontWeight: "bold",
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    backgroundColor: "#eee",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 70,
    paddingRight: 20,
  },
  menuCard: {
    borderRadius: 20,
    width: 240,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  largeAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#eee",
    borderWidth: 1.5,
    borderColor: "#6C63FF",
  },
  menuUserDetail: {
    marginLeft: 10,
    flex: 1,
  },
  menuUserName: {
    fontSize: 14,
    fontWeight: "bold",
  },
  menuUserEmail: {
    fontSize: 11,
    marginTop: 1,
  },
  menuSeparator: {
    height: 1,
    marginBottom: 12,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF2F2",
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  logoutText: {
    color: "#FF4D4D",
    fontWeight: "bold",
    fontSize: 13,
  },
  cancelButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  cancelText: {
    fontSize: 12,
  },
});
