import React, { useContext, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  StatusBar,
  Alert,
  Linking,
  Dimensions,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
import API from "../../api/axios";
import colors from "../../styles/colors";

const { width } = Dimensions.get("window");

const BookingsScreen = () => {
  const { user, logout } = useContext(AuthContext);
  const { isDarkMode, toggleTheme, background, cardBackground, text, secondaryText, border, inputBackground } = useContext(ThemeContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  // Fallback avatar image
  const avatarUrl = user?.profileUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150";

  const fetchBookings = async (showLoader = true) => {
    if (!user?.email) return;
    if (showLoader) setLoading(true);
    try {
      const response = await API.get(`/bookings?email=${user.email}`);
      // Sort bookings by creation date descending
      const sorted = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setBookings(sorted);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refetch bookings when screen gets focus
  useFocusEffect(
    useCallback(() => {
      fetchBookings(true);
    }, [user?.email])
  );

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      const response = await API.patch(`/bookings/${bookingId}/status`, { status: newStatus });
      if (response.data.success) {
        
        // Update local state
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
        );
        alert("Status Updated", `Booking status set to "${newStatus === 'processing' ? 'Processing' : newStatus === 'in_progress' ? 'In Progress' : 'Completed'}".`);
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Error", "Unable to update booking status.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "processing":
        return { bg: isDarkMode ? "#3C2216" : "#FFF2E8", text: "#FA541C", label: "Processing" };
      case "in_progress":
        return { bg: isDarkMode ? "#112E51" : "#E6F7FF", text: "#1890FF", label: "In Progress" };
      case "completed":
        return { bg: isDarkMode ? "#1C3F1B" : "#F6FFED", text: "#52C41A", label: "Completed" };
      case "cancelled":
        return { bg: isDarkMode ? "#4A181C" : "#FFF1F0", text: "#F5222D", label: "Rejected" };
      default:
        return { bg: "#F5F5F5", text: "#888888", label: "Processing" };
    }
  };

  const renderBookingItem = ({ item }) => {
    const statusInfo = getStatusColor(item.status);

    return (
      <View style={[styles.bookingCard, { backgroundColor: cardBackground, borderColor: border }]}>
        <View style={styles.cardHeader}>
          <View style={styles.serviceInfo}>
            <Text style={[styles.serviceName, { color: text }]}>{item.serviceName}</Text>
            <Text style={styles.bookingId}>ID: #{item.id}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
            <Text style={[styles.statusText, { color: statusInfo.text }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: border }]} />

        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: secondaryText }]}>📅 Scheduled Date:</Text>
          <Text style={[styles.detailValue, { color: text }]}>{item.date}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: secondaryText }]}>⏰ Scheduled Time:</Text>
          <Text style={[styles.detailValue, { color: text }]}>{item.time}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: secondaryText }]}>💳 Payment Method:</Text>
          <Text style={[styles.detailValue, { color: text }]}>
            {item.paymentMethod === "cod" ? "Cash on Delivery" : "Card Payment"}
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: border }]} />

        {/* Interactive Status Options (Three Options) */}
        <Text style={[styles.statusSectionTitle, { color: text }]}>Simulate Status Update:</Text>
        <View style={styles.statusButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.statusOptionButton,
              { backgroundColor: inputBackground, borderColor: border },
              item.status === "processing" && styles.statusOptionButtonActive,
            ]}
            onPress={() => handleUpdateStatus(item.id, "processing")}
          >
            <Text
              style={[
                styles.statusOptionText,
                { color: secondaryText },
                item.status === "processing" && styles.statusOptionTextActive,
              ]}
            >
              Processing
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statusOptionButton,
              { backgroundColor: inputBackground, borderColor: border },
              item.status === "in_progress" && styles.statusOptionButtonActive,
            ]}
            onPress={() => handleUpdateStatus(item.id, "in_progress")}
          >
            <Text
              style={[
                styles.statusOptionText,
                { color: secondaryText },
                item.status === "in_progress" && styles.statusOptionTextActive,
              ]}
            >
              In Progress
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statusOptionButton,
              { backgroundColor: inputBackground, borderColor: border },
              item.status === "completed" && styles.statusOptionButtonActive,
            ]}
            onPress={() => handleUpdateStatus(item.id, "completed")}
          >
            <Text
              style={[
                styles.statusOptionText,
                { color: secondaryText },
                item.status === "completed" && styles.statusOptionTextActive,
              ]}
            >
              Completed
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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

      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: text }]}>My Purchased Services</Text>
          <Text style={[styles.sectionSubtitle, { color: secondaryText }]}>Track your orders and booking status</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6C63FF" />
            <Text style={[styles.loadingText, { color: secondaryText }]}>Fetching your bookings...</Text>
          </View>
        ) : bookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={[styles.emptyTitle, { color: text }]}>No Bookings Yet</Text>
            <Text style={[styles.emptySubtitle, { color: secondaryText }]}>
              Services you book from the Home tab will appear here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={bookings}
            keyExtractor={(item) => item.id}
            renderItem={renderBookingItem}
            contentContainerStyle={styles.listContent}
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchBookings(false);
            }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Dropdown Profile logout Modal */}
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

export default BookingsScreen;

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
  content: {
    flex: 1,
    padding: 20,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  sectionSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  listContent: {
    paddingBottom: 20,
  },
  bookingCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  serviceInfo: {
    flex: 1,
    marginRight: 10,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  bookingId: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 13,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  statusSectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statusButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statusOptionButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    marginHorizontal: 4,
    alignItems: "center",
  },
  statusOptionButtonActive: {
    backgroundColor: "#6C63FF",
    borderColor: "#6C63FF",
  },
  statusOptionText: {
    fontSize: 11,
    fontWeight: "600",
  },
  statusOptionTextActive: {
    color: "#fff",
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
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
