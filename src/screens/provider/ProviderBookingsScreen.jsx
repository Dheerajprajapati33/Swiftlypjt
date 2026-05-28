import React, { useContext, useState, useCallback } from "react";
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
  Dimensions,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
import API from "../../api/axios";
import colors from "../../styles/colors";

const { width } = Dimensions.get("window");

const ProviderBookingsScreen = () => {
  const { user, logout } = useContext(AuthContext);
  const { isDarkMode, toggleTheme, background, cardBackground, text, secondaryText, border, inputBackground } = useContext(ThemeContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const avatarUrl = user?.profileUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150";

  const fetchClientBookings = async (showLoader = true) => {
    if (!user?.email) return;
    if (showLoader) setLoading(true);
    try {
      const response = await API.get(`/bookings/provider?email=${user.email}`);
      const sorted = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setBookings(sorted);
    } catch (error) {
      console.error("Failed to fetch client bookings:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchClientBookings(true);
    }, [user?.email])
  );

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      const response = await API.patch(`/bookings/${bookingId}/status`, { status: newStatus });
      if (response.data.success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
        );
        let alertMessage = "";
        if (newStatus === "in_progress") alertMessage = "Booking accepted and set to In Progress.";
        else if (newStatus === "completed") alertMessage = "Booking marked as Completed.";
        else if (newStatus === "cancelled") alertMessage = "Booking rejected and marked as Cancelled.";
        alert("Status Updated", alertMessage);
      }
    } catch (error) {
      console.error("Failed to change status:", error);
      alert("Error", "Could not update booking status.");
    }
  };

  const getStatusStyle = (status) => {
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

  const renderBookingCard = ({ item }) => {
    const statusStyle = getStatusStyle(item.status);

    return (
      <View style={[styles.bookingCard, { backgroundColor: cardBackground, borderColor: border }]}>
        <View style={styles.cardHeader}>
          <View style={styles.customerInfo}>
            <Text style={[styles.customerName, { color: text }]}>{item.userName || "Valued Customer"}</Text>
            <Text style={[styles.customerEmail, { color: secondaryText }]}>{item.userEmail}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {statusStyle.label}
            </Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: border }]} />

        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: secondaryText }]}>🛠️ Requested Service:</Text>
          <Text style={[styles.detailValue, { color: text }]}>{item.serviceName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: secondaryText }]}>📅 Scheduled Date:</Text>
          <Text style={[styles.detailValue, { color: text }]}>{item.date}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: secondaryText }]}>⏰ Scheduled Time:</Text>
          <Text style={[styles.detailValue, { color: text }]}>{item.time}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: secondaryText }]}>💳 Payment Selected:</Text>
          <Text style={[styles.detailValue, { color: text }]}>
            {item.paymentMethod === "cod" ? "Cash on Delivery" : "Card Payment"}
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: border }]} />

        {/* Provider Action Buttons (Three Options) */}
        <Text style={[styles.actionsHeader, { color: text }]}>Manage Request Status:</Text>
        <View style={styles.actionButtonsRow}>

          
          {/* Accept Button */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.acceptButton,
              item.status === "in_progress" && styles.buttonDisabled,
            ]}
            onPress={() => handleUpdateStatus(item.id, "in_progress")}
            disabled={item.status === "in_progress"}
          >
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>

          {/* Complete Button */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.completeButton,
              item.status === "completed" && styles.buttonDisabled,
            ]}
            onPress={() => handleUpdateStatus(item.id, "completed")}
            disabled={item.status === "completed"}
          >
            <Text style={styles.completeButtonText}>Complete</Text>
          </TouchableOpacity>

          {/* Reject Button */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.rejectButton,
              item.status === "cancelled" && styles.buttonDisabled,
            ]}
            onPress={() => handleUpdateStatus(item.id, "cancelled")}
            disabled={item.status === "cancelled"}
          >
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={cardBackground} />

      {/* Consistent Header */}
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
          <Text style={[styles.sectionTitle, { color: text }]}>Client Bookings</Text>
          <Text style={[styles.sectionSubtitle, { color: secondaryText }]}>Accept, reject, or complete requests</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6C63FF" />
            <Text style={[styles.loadingText, { color: secondaryText }]}>Fetching bookings...</Text>
          </View>
        ) : bookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📬</Text>
            <Text style={[styles.emptyTitle, { color: text }]}>No Client Bookings</Text>
            <Text style={[styles.emptySubtitle, { color: secondaryText }]}>
              When customers book your defined services, requests will appear here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={bookings}
            keyExtractor={(item) => item.id}
            renderItem={renderBookingCard}
            contentContainerStyle={styles.listContent}
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchClientBookings(false);
            }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Logout popover dialog */}
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

export default ProviderBookingsScreen;

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
  customerInfo: {
    flex: 1,
    marginRight: 10,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  customerEmail: {
    fontSize: 12,
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
  actionsHeader: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  actionButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
    justifyContent: "center",
  },
  acceptButton: {
    backgroundColor: "#E6F7FF",
    borderWidth: 1,
    borderColor: "#1890FF",
  },
  acceptButtonText: {
    color: "#1890FF",
    fontWeight: "bold",
    fontSize: 13,
  },
  completeButton: {
    backgroundColor: "#F6FFED",
    borderWidth: 1,
    borderColor: "#52C41A",
  },
  completeButtonText: {
    color: "#52C41A",
    fontWeight: "bold",
    fontSize: 13,
  },
  rejectButton: {
    backgroundColor: "#FFF1F0",
    borderWidth: 1,
    borderColor: "#F5222D",
  },
  rejectButtonText: {
    color: "#F5222D",
    fontWeight: "bold",
    fontSize: 13,
  },
  buttonDisabled: {
    opacity: 0.4,
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
