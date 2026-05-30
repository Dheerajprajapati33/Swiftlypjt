import React, { useContext, useState, useCallback } from "react";
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
  TextInput,
  ActivityIndicator,
  Alert,
  Linking,
  FlatList,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
import colors from "../../styles/colors";
import ServiceCard from "../../components/ServiceCard";
import API from "../../api/axios";
import Header from "../../components/Header";

const { width } = Dimensions.get("window");

const DashboardScreen = () => {
  const { user, logout } = useContext(AuthContext);
  const { isDarkMode, toggleTheme, background, cardBackground, text, secondaryText, border, inputBackground } = useContext(ThemeContext);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Booking Form State
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod'); // cod or card
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });

  // Booking Result State
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // avatar image
  const avatarUrl = user?.profileUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150";

  // AI Diagnostic State
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const handleResetAiAssistant = () => {
    setAiQuery('');
    setAiResult(null);
    setAiLoading(false);
  };

  const handleCloseAiModal = () => {
    setAiModalVisible(false);
    handleResetAiAssistant();
  };

  const handleRunDiagnosis = async () => {
    if (!aiQuery.trim()) {
      alert('Input Required', 'Please enter a description of your household problem.');
      return;
    }
    setAiLoading(true);
    try {
      const response = await API.post('/ai/diagnose', { query: aiQuery });
      if (response.data.success === false && response.data.errorType === 'MISSING_API_KEY') {
        setAiResult({
          diagnosis: response.data.message,
          urgency: 'Low',
          recommendedCategory: 'General',
          actions: ['Get Gemini API Key from aistudio.google.com', 'Paste it in your server/.env file under GEMINI_API_KEY'],
          bookingSuggestionText: 'Configure your Gemini key on the backend to activate fully.'
        });
      } else {
        setAiResult(response.data);
      }
    } catch (error) {
      console.error("AI Diagnostic query failed:", error);
      alert('Network Error', 'Failed to reach AI Diagnostic server. Please ensure backend is running.');
    } finally {
      setAiLoading(false);
    }
  };

  const getUrgencyStyle = (urgency) => {
    const norm = (urgency || 'low').toLowerCase();
    if (norm.includes('emergency')) {
      return { bg: '#FFCCC7', text: '#CF1322' };
    }
    if (norm.includes('high')) {
      return { bg: '#FFF1F0', text: '#F5222D' };
    }
    if (norm.includes('medium')) {
      return { bg: '#FFF7E6', text: '#D46B08' };
    }
    return { bg: '#F6FFED', text: '#389E0D' };
  };

  const getMatchingServices = (category) => {
    if (!category || !services) return [];
    return services.filter(s => s.category && s.category.toLowerCase() === category.toLowerCase());
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await API.get("/services");
      setServices(response.data);
    } catch (error) {
      console.error("Failed to fetch services:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchServices();
    }, [])
  );

  const handleOpenBookModal = (service) => {
    setSelectedService(service);
    setBookingModalVisible(true);
    setBookingSuccess(false);
    setPreviewUrl(null);
    
    // Set default tomorrow date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDate(tomorrow.toISOString().split('T')[0]);
    setTime('10:00 AM');
    setPaymentMethod('cod');
    setCardDetails({ number: '', expiry: '', cvv: '' });
  };

  const handleBookService = async () => {
    if (!date.trim() || !time.trim()) {
      alert('Validation Error', 'Please fill in both Date and Time.');
      return;
    }

    if (paymentMethod === 'card') {
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv) {
        alert('Validation Error', 'Please enter card payment details.');
        return;
      }
    }

    setBookingLoading(true);
    try {
      const response = await API.post('/bookings/book', {
        userEmail: user?.email,
        userName: user?.name,
        serviceName: selectedService.name,
        providerEmail: selectedService.providerEmail, // Link provider's email!
        date,
        time,
        paymentMethod,
      });

      if (response.data.success) {
        setBookingSuccess(true);
        if (response.data.previewUrl) {
          setPreviewUrl(response.data.previewUrl);
        }
      } else {
        alert('Booking Error', 'Failed to complete booking. Please try again.');
      }
    } catch (error) {
      console.error('Booking request failed:', error);
      alert('Network Error', error.response?.data?.message || 'Could not reach server.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleOpenEmailPreview = async () => {
    if (previewUrl) {
      const supported = await Linking.canOpenURL(previewUrl);
      if (supported) {
        await Linking.openURL(previewUrl);
      } else {
        alert('Error', "Can't open preview URL: " + previewUrl);
      }
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={cardBackground} />

      {/* Unified Header */}
      <Header />

      {/* Dynamic Services List */}
      {loading && services.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={[styles.centerText, { color: secondaryText }]}>Loading services solutions...</Text>
        </View>
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <ServiceCard item={item} onBook={handleOpenBookModal} />
          )}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View>
              
              {/* Hero Card: About Swiftly */}
              <View style={styles.heroCard}>
                <Text style={styles.heroBadge}>PRO SERVICES</Text>
                <Text style={styles.heroTitle}>Swiftly Home Solutions</Text>
                <Text style={styles.heroDescription}>
                  Welcome back! Explore our available home services, examine provider details, and book your solutions in seconds.
                </Text>
              </View>

              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: text }]}>Available Services</Text>
                <Text style={[styles.sectionSubtitle, { color: secondaryText }]}>Select and book professional providers</Text>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={[styles.emptyTitle, { color: text }]}>No Services Available</Text>
              <Text style={[styles.emptyText, { color: secondaryText }]}>There are currently no active home services listed.</Text>
            </View>
          }
        />
      )}

      {/* Booking Form Modal */}
      {selectedService && (
        <Modal
          visible={bookingModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setBookingModalVisible(false)}
        >
          <View style={styles.bookingModalOverlay}>
            <View style={[styles.bookingModalContent, { backgroundColor: cardBackground }]}>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.bookingModalScroll}>
                
                {/* Success View */}
                {bookingSuccess ? (
                  <View style={styles.successContainer}>
                    <Text style={styles.successIcon}>🎉</Text>
                    <Text style={[styles.successTitle, { color: text }]}>Booking Successful!</Text>
                    <Text style={[styles.successMessage, { color: text }]}>
                      Your service request for <Text style={styles.boldText}>{selectedService.name}</Text> has been registered.
                    </Text>
                    <Text style={[styles.successMailInfo, { color: secondaryText }]}>
                      A confirmation email has been sent to your registered address: <Text style={styles.boldText}>{user?.email}</Text>
                    </Text>

                    {previewUrl && (
                      <TouchableOpacity style={styles.previewButton} onPress={handleOpenEmailPreview}>
                        <Text style={styles.previewButtonText}>📧 View Sent Email Sandbox</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setBookingModalVisible(false)}
                    >
                      <Text style={styles.closeButtonText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                ) : (

                  /* Form View */
                  <View>
                    <Text style={[styles.modalTitle, { color: text }]}>Book Service</Text>
                    <Text style={[styles.modalSubtitle, { color: secondaryText }]}>
                      {selectedService.name} by {selectedService.providerName}
                    </Text>

                    <View style={[styles.divider, { backgroundColor: border }]} />

                    {/* Date Field */}
                    <View style={styles.inputGroup}>
                      <Text style={[styles.label, { color: text }]}>Select Date</Text>
                      <TextInput
                        style={[styles.input, { backgroundColor: inputBackground, borderColor: border, color: text }]}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor={isDarkMode ? '#888' : '#999'}
                        value={date}
                        onChangeText={setDate}
                      />
                    </View>

                    {/* Time Field */}
                    <View style={styles.inputGroup}>
                      <Text style={[styles.label, { color: text }]}>Select Time Slot</Text>
                      <TextInput
                        style={[styles.input, { backgroundColor: inputBackground, borderColor: border, color: text }]}
                        placeholder="e.g. 10:00 AM"
                        placeholderTextColor={isDarkMode ? '#888' : '#999'}
                        value={time}
                        onChangeText={setTime}
                      />
                    </View>

                    {/* Payment Option */}
                    <View style={styles.inputGroup}>
                      <Text style={[styles.label, { color: text }]}>Payment Method</Text>
                      <View style={[styles.paymentToggleContainer, { borderColor: border }]}>
                        <TouchableOpacity
                          style={[
                            styles.paymentToggle,
                            { backgroundColor: inputBackground },
                            paymentMethod === 'cod' && styles.paymentToggleActive,
                          ]}
                          onPress={() => setPaymentMethod('cod')}
                        >
                          <Text
                            style={[
                              styles.paymentToggleText,
                              { color: secondaryText },
                              paymentMethod === 'cod' && styles.paymentToggleTextActive,
                            ]}
                          >
                            Cash on Delivery
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.paymentToggle,
                            { backgroundColor: inputBackground },
                            paymentMethod === 'card' && styles.paymentToggleActive,
                          ]}
                          onPress={() => setPaymentMethod('card')}
                        >
                          <Text
                            style={[
                              styles.paymentToggleText,
                              { color: secondaryText },
                              paymentMethod === 'card' && styles.paymentToggleTextActive,
                            ]}
                          >
                            Card Payment
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Conditional Card Form */}
                    {paymentMethod === 'card' && (
                      <View style={[styles.cardForm, { backgroundColor: inputBackground, borderColor: border }]}>
                        <Text style={[styles.cardFormTitle, { color: text }]}>Card Information</Text>
                        <TextInput
                          style={[styles.input, { backgroundColor: cardBackground, borderColor: border, color: text }]}
                          placeholder="Card Number (1234 5678 1234 5678)"
                          placeholderTextColor={isDarkMode ? '#888' : '#999'}
                          keyboardType="numeric"
                          maxLength={19}
                          value={cardDetails.number}
                          onChangeText={(val) => setCardDetails({ ...cardDetails, number: val })}
                        />
                        <View style={styles.cardRow}>
                          <TextInput
                            style={[styles.input, { flex: 2, marginRight: 10, backgroundColor: cardBackground, borderColor: border, color: text }]}
                            placeholder="Expiry (MM/YY)"
                            placeholderTextColor={isDarkMode ? '#888' : '#999'}
                            maxLength={5}
                            value={cardDetails.expiry}
                            onChangeText={(val) => setCardDetails({ ...cardDetails, expiry: val })}
                          />
                          <TextInput
                            style={[styles.input, { flex: 1, backgroundColor: cardBackground, borderColor: border, color: text }]}
                            placeholder="CVV"
                            placeholderTextColor={isDarkMode ? '#888' : '#999'}
                            secureTextEntry
                            keyboardType="numeric"
                            maxLength={3}
                            value={cardDetails.cvv}
                            onChangeText={(val) => setCardDetails({ ...cardDetails, cvv: val })}
                          />
                        </View>
                      </View>
                    )}

                    {/* Action Buttons */}
                    <TouchableOpacity
                      style={styles.submitButton}
                      onPress={handleBookService}
                      disabled={bookingLoading}
                    >
                      {bookingLoading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.submitButtonText}>Confirm Booking</Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.cancelLink}
                      onPress={() => setBookingModalVisible(false)}
                      disabled={bookingLoading}
                    >
                      <Text style={styles.cancelLinkText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/*  AI Diagnostic Assistant Button */}
      <TouchableOpacity
        style={styles.floatingAiButton}
        onPress={() => setAiModalVisible(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="sparkles" size={18} color="#FFF" />
        <Text style={styles.floatingAiButtonText}>AI Diagnostic</Text>
      </TouchableOpacity>

      {/* AI Diagnostic Assistant Modal */}
      <Modal
        visible={aiModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseAiModal}
      >
        <View style={styles.aiModalOverlay}>
          <View style={[styles.aiModalContent, { backgroundColor: cardBackground }]}>
            <View style={styles.aiModalHeader}>
              <View style={styles.aiHeaderTitleContainer}>
                <Ionicons name="sparkles" size={20} color="#6C63FF" />
                <Text style={[styles.aiModalTitle, { color: text }]}>AI Diagnostic Helper</Text>
              </View>
              <TouchableOpacity onPress={handleCloseAiModal} style={styles.aiCloseButton}>
                <Ionicons name="close" size={24} color={secondaryText} />
              </TouchableOpacity>
            </View>

            <View style={[styles.divider, { backgroundColor: border }]} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.aiModalScroll}>
              {!aiResult ? (
                <View>
                  <Text style={[styles.aiInstructionText, { color: secondaryText }]}>
                    Describe your household problem in detail (e.g., "my washing machine is leaking soapy water" or "my socket is sparking when plugged in"). Our AI will diagnose the issue, provide safety warnings, and find the best service provider category.
                  </Text>
                  
                  <TextInput
                    style={[styles.aiInput, { backgroundColor: inputBackground, borderColor: border, color: text }]}
                    placeholder="Describe your issue..."
                    placeholderTextColor={isDarkMode ? '#888' : '#999'}
                    multiline={true}
                    numberOfLines={4}
                    value={aiQuery}
                    onChangeText={setAiQuery}
                  />

                  <TouchableOpacity
                    style={styles.aiSubmitButton}
                    onPress={handleRunDiagnosis}
                    disabled={aiLoading}
                  >
                    {aiLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="flash" size={16} color="#FFF" style={{ marginRight: 6 }} />
                        <Text style={styles.aiSubmitButtonText}>Diagnose Issue</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  {/* Diagnosis Report Card */}
                  <View style={[styles.aiResultCard, { backgroundColor: inputBackground, borderColor: border }]}>
                    <View style={styles.aiResultHeader}>
                      <Text style={[styles.aiResultLabel, { color: secondaryText }]}>DIAGNOSIS REPORT</Text>
                      <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyStyle(aiResult.urgency).bg }]}>
                        <Text style={[styles.urgencyBadgeText, { color: getUrgencyStyle(aiResult.urgency).text }]}>
                          {aiResult.urgency} Urgency
                        </Text>
                      </View>
                    </View>

                    <Text style={[styles.aiDiagnosisText, { color: text }]}>{aiResult.diagnosis}</Text>
                  </View>

                  {/* Safety check*/}
                  {aiResult.actions && aiResult.actions.length > 0 && (
                    <View style={styles.actionsSection}>
                      <Text style={[styles.sectionSubtitleText, { color: text }]}>⚠️ Recommended Safety Checks:</Text>
                      {aiResult.actions.map((action, idx) => (
                        <View key={idx} style={styles.actionItemRow}>
                          <Ionicons name="checkmark-circle-outline" size={16} color="#6C63FF" style={{ marginTop: 2, marginRight: 8 }} />
                          <Text style={[styles.actionItemText, { color: secondaryText }]}>{action}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <View style={[styles.divider, { backgroundColor: border }]} />

                  {/* Recommended Category Matcher */}
                  <View style={styles.suggestionSection}>
                    <Text style={[styles.sectionSubtitleText, { color: text }]}>Matched Service Category:</Text>
                    <Text style={styles.categoryMatchBadge}>{aiResult.recommendedCategory}</Text>
                    <Text style={[styles.bookingSuggestText, { color: secondaryText }]}>{aiResult.bookingSuggestionText}</Text>
                    
                    {/* Matching Services List */}
                    <Text style={[styles.matchingServicesTitle, { color: text }]}>Available Providers for this Category:</Text>
                    {getMatchingServices(aiResult.recommendedCategory).length === 0 ? (
                      <Text style={[styles.noMatchingServicesText, { color: secondaryText }]}>
                        No active providers listed in the {aiResult.recommendedCategory} category at the moment.
                      </Text>
                    ) : (
                      getMatchingServices(aiResult.recommendedCategory).map((srv) => (
                        <View key={srv._id} style={[styles.matchedProviderCard, { backgroundColor: cardBackground, borderColor: border }]}>
                          <View style={styles.matchedProviderHeader}>
                            <Image source={{ uri: srv.providerAvatar }} style={styles.matchedAvatar} />
                            <View style={styles.matchedInfo}>
                              <Text style={[styles.matchedName, { color: text }]} numberOfLines={1}>{srv.name}</Text>
                              <Text style={styles.matchedCategory} numberOfLines={1}>{srv.providerName}</Text>
                            </View>
                            <Text style={styles.matchedPrice}>{srv.price}</Text>
                          </View>
                          <TouchableOpacity
                            style={styles.matchedBookButton}
                            onPress={() => {
                              handleCloseAiModal();
                              handleOpenBookModal(srv);
                            }}
                          >
                            <Text style={styles.matchedBookText}>Book This Provider</Text>
                          </TouchableOpacity>
                        </View>
                      ))
                    )}
                  </View>

                  <TouchableOpacity
                    style={[styles.aiResetButton, { borderColor: border }]}
                    onPress={handleResetAiAssistant}
                  >
                    <Text style={[styles.aiResetButtonText, { color: text }]}>Diagnose Another Problem</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default DashboardScreen;

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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  heroCard: {
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
  heroBadge: {
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
  heroTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.85)",
    lineHeight: 22,
  },
  sectionHeader: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  sectionSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centerText: {
    marginTop: 10,
    fontSize: 14,
  },
  emptyContainer: {
    padding: 30,
    alignItems: "center",
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  emptyText: {
    fontSize: 13,
    textAlign: "center",
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
  bookingModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bookingModalContent: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: '90%',
    padding: 24,
  },
  bookingModalScroll: {
    flexGrow: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  divider: {
    height: 1,
    marginVertical: 18,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
  },
  paymentToggleContainer: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderRadius: 12,
    overflow: 'hidden',
  },
  paymentToggle: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  paymentToggleActive: {
    backgroundColor: '#6C63FF',
  },
  paymentToggleText: {
    fontWeight: '600',
  },
  paymentToggleTextActive: {
    color: '#fff',
  },
  cardForm: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
  },
  cardFormTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: '#6C63FF',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelLink: {
    alignItems: 'center',
    marginTop: 15,
    paddingVertical: 10,
  },
  cancelLinkText: {
    color: '#888',
    fontSize: 15,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  successMessage: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 10,
  },
  successMailInfo: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 25,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#6C63FF',
  },
  previewButton: {
    backgroundColor: '#EEECFF',
    borderWidth: 1,
    borderColor: '#6C63FF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  previewButtonText: {
    color: '#6C63FF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  closeButton: {
    backgroundColor: '#6C63FF',
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  floatingAiButton: {
    position: "absolute",
    bottom: 25,
    right: 25,
    backgroundColor: "#6C63FF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  floatingAiButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 6,
    fontSize: 14,
  },
  aiModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  aiModalContent: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: "90%",
    padding: 24,
  },
  aiModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  aiHeaderTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  aiModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 8,
  },
  aiCloseButton: {
    padding: 4,
  },
  aiModalScroll: {
    paddingBottom: 40,
    paddingTop: 10,
  },
  aiInstructionText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  aiInput: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    height: 100,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  aiSubmitButton: {
    backgroundColor: "#6C63FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 14,
  },
  aiSubmitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  aiResultCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  aiResultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  aiResultLabel: {
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  urgencyBadgeText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  aiDiagnosisText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionsSection: {
    marginBottom: 18,
  },
  actionItemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  actionItemText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  suggestionSection: {
    marginTop: 8,
  },
  categoryMatchBadge: {
    backgroundColor: "#EEECFF",
    color: "#6C63FF",
    fontWeight: "bold",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 8,
  },
  bookingSuggestText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  matchingServicesTitle: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 10,
  },
  noMatchingServicesText: {
    fontSize: 13,
    fontStyle: "italic",
    marginBottom: 15,
  },
  matchedProviderCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  matchedProviderHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  matchedAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  matchedInfo: {
    marginLeft: 10,
    flex: 1,
  },
  matchedName: {
    fontSize: 13,
    fontWeight: "bold",
  },
  matchedCategory: {
    fontSize: 11,
    color: "#888",
    marginTop: 1,
  },
  matchedPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#6C63FF",
  },
  matchedBookButton: {
    backgroundColor: "#EEECFF",
    borderWidth: 1,
    borderColor: "#6C63FF",
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10,
    marginTop: 10,
  },
  matchedBookText: {
    color: "#6C63FF",
    fontSize: 12,
    fontWeight: "bold",
  },
  aiResetButton: {
    borderWidth: 1.5,
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 15,
  },
  aiResetButtonText: {
    fontWeight: "bold",
    fontSize: 14,
  },
});
