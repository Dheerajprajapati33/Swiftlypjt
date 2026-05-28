import React, { useState, useContext } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import ServiceCard from '../../components/ServiceCard';
import { AuthContext } from '../../context/AuthContext';
import API from '../../api/axios';
import colors from '../../styles/colors';

const SERVICES_DATA = [
  {
    _id: '1',
    name: 'Premium Home Cleaning',
    category: 'Cleaning',
    providerName: 'John Cleaning Services Ltd.',
    description: 'Complete home dusting, kitchen deep scrub, floor sanitization, bathroom disinfection. Eco-friendly cleaning agents used.',
    price: '$80/hr',
    providerAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100',
  },
  {
    _id: '2',
    name: 'Electrical Leakage Repair',
    category: 'Electrical',
    providerName: 'Mike Sparks & Wiring',
    description: 'Diagnose short circuits, broken switches, socket installations, safety breaker audits and rewiring.',
    price: '$95/hr',
    providerAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=100',
  },
  {
    _id: '3',
    name: 'Emergency Pipeline Repair',
    category: 'Plumbing',
    providerName: 'Alex Pipemasters Ltd.',
    description: 'Clogged drains clearing, kitchen pipe leakage repairs, bathroom faucet installations, and sink replacements.',
    price: '$75/hr',
    providerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100',
  },
  {
    _id: '4',
    name: 'Pest Control & Spraying',
    category: 'Sanitization',
    providerName: 'EcoShield Pest Solvers',
    description: 'Targeted organic spray sanitization for bedbugs, roaches, termites, and rodents. 100% safe for pets and kids.',
    price: '$120/flat',
    providerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100',
  }
];

const ServicesScreen = () => {
  const { user } = useContext(AuthContext);
  const [selectedService, setSelectedService] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod'); // cod or card
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });

  // Booking Result State
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleOpenBookModal = (service) => {
    setSelectedService(service);
    setModalVisible(true);
    setBookingSuccess(false);
    setPreviewUrl(null);

    // Initialize date with tomorrow's date by default
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

    setLoading(true);
    try {
      const response = await API.post('/bookings/book', {
        userEmail: user?.email,
        userName: user?.name,
        serviceName: selectedService.name,
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
      setLoading(false);
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore Services</Text>
        <Text style={styles.headerSubtitle}>Book trusted local professionals</Text>
      </View>

// use FlatList to render services with better performance and built-in optimizations for large lists
      <FlatList
        data={SERVICES_DATA}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ServiceCard item={item} onBook={handleOpenBookModal} />
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Booking Form Modal */}
      {selectedService && (
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
                
                {/* Success View */}
                {bookingSuccess ? (
                  <View style={styles.successContainer}>
                    <Text style={styles.successIcon}>🎉</Text>
                    <Text style={styles.successTitle}>Booking Successful!</Text>
                    <Text style={styles.successMessage}>
                      Your service request for <Text style={styles.boldText}>{selectedService.name}</Text> has been registered.
                    </Text>
                    <Text style={styles.successMailInfo}>
                      A confirmation email has been sent to your registered address: <Text style={styles.boldText}>{user?.email}</Text>
                    </Text>

                    {previewUrl && (
                      <TouchableOpacity style={styles.previewButton} onPress={handleOpenEmailPreview}>
                        <Text style={styles.previewButtonText}>📧 View Sent Email Sandbox</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.closeButtonText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  
                  /* Form View */
                  <View>
                    <Text style={styles.modalTitle}>Book Service</Text>
                    <Text style={styles.modalSubtitle}>
                      {selectedService.name} by {selectedService.providerName}
                    </Text>

                    <View style={styles.divider} />

                    {/* Date Field */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Select Date</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="YYYY-MM-DD"
                        value={date}
                        onChangeText={setDate}
                      />
                    </View>

                    {/* Time Field */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Select Time Slot</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="e.g. 10:00 AM"
                        value={time}
                        onChangeText={setTime}
                      />
                    </View>

                    {/* Payment Option */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Payment Method</Text>
                      <View style={styles.paymentToggleContainer}>
                        <TouchableOpacity
                          style={[
                            styles.paymentToggle,
                            paymentMethod === 'cod' && styles.paymentToggleActive,
                          ]}
                          onPress={() => setPaymentMethod('cod')}
                        >
                          <Text
                            style={[
                              styles.paymentToggleText,
                              paymentMethod === 'cod' && styles.paymentToggleTextActive,
                            ]}
                          >
                            Cash on Delivery
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.paymentToggle,
                            paymentMethod === 'card' && styles.paymentToggleActive,
                          ]}
                          onPress={() => setPaymentMethod('card')}
                        >
                          <Text
                            style={[
                              styles.paymentToggleText,
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
                      <View style={styles.cardForm}>
                        <Text style={styles.cardFormTitle}>Card Information</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="Card Number (1234 5678 1234 5678)"
                          keyboardType="numeric"
                          maxLength={19}
                          value={cardDetails.number}
                          onChangeText={(val) => setCardDetails({ ...cardDetails, number: val })}
                        />
                        <View style={styles.cardRow}>
                          <TextInput
                            style={[styles.input, { flex: 2, marginRight: 10 }]}
                            placeholder="Expiry (MM/YY)"
                            maxLength={5}
                            value={cardDetails.expiry}
                            onChangeText={(val) => setCardDetails({ ...cardDetails, expiry: val })}
                          />
                          <TextInput
                            style={[styles.input, { flex: 1 }]}
                            placeholder="CVV"
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
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.submitButtonText}>Confirm Booking</Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.cancelLink}
                      onPress={() => setModalVisible(false)}
                      disabled={loading}
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
    </SafeAreaView>
  );
};

export default ServicesScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EBF0FF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  listContainer: {
    padding: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: '90%',
    padding: 24,
  },
  modalScroll: {
    flexGrow: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 18,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E8F0',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#111',
    backgroundColor: '#F9FAFC',
  },
  paymentToggleContainer: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: '#E5E8F0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  paymentToggle: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F9FAFC',
  },
  paymentToggleActive: {
    backgroundColor: '#6C63FF',
  },
  paymentToggleText: {
    fontWeight: '600',
    color: '#666',
  },
  paymentToggleTextActive: {
    color: '#fff',
  },
  cardForm: {
    backgroundColor: '#F9FAFC',
    borderWidth: 1.5,
    borderColor: '#E5E8F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
  },
  cardFormTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#444',
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
    color: '#111',
    marginBottom: 10,
  },
  successMessage: {
    fontSize: 15,
    color: '#444',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 10,
  },
  successMailInfo: {
    fontSize: 13,
    color: '#666',
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
});