import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { ThemeContext } from '../../context/ThemeContext';
import Header from '../../components/Header';

const ForgotPasswordScreen = ({ navigation }) => {
  const { isDarkMode, background, cardBackground, text, secondaryText, border, inputBackground } = useContext(ThemeContext);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleResetPassword = () => {
    if (!email.trim()) {
      alert('Validation Error', 'Please enter your email address.');
      return;
    }
    
    setSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      alert(
        'Reset Link Sent',
        'If an account exists for this email, we have sent password reset instructions.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    }, 1500);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={cardBackground} />
      
      {/* Top Header with theme selector */}
      <Header showProfile={false} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={[styles.card, { backgroundColor: cardBackground, borderColor: border }]}>
            <Text style={[styles.heading, { color: text }]}>Reset Password</Text>
            <Text style={[styles.subheading, { color: secondaryText }]}>
              Enter your email and we'll send you instructions to reset your password.
            </Text>

            {/* Email Field */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: text }]}>Email Address</Text>
              <TextInput
                placeholder="Enter your registered email"
                keyboardType="email-address"
                autoCapitalize="none"
                style={[styles.input, { backgroundColor: inputBackground, borderColor: border, color: text }]}
                value={email}
                onChangeText={setEmail}
                placeholderTextColor={isDarkMode ? '#888' : '#999'}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleResetPassword}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Send Reset Link</Text>
              )}
            </TouchableOpacity>

            {/* Navigate back to Login */}
            <TouchableOpacity
              style={styles.linkContainer}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.linkText}>
                Back to <Text style={styles.linkTextBold}>Login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
    marginVertical: 20,
    borderWidth: 1,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subheading: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
  },
  button: {
    backgroundColor: '#6C63FF',
    padding: 16,
    borderRadius: 14,
    marginTop: 10,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: '#666',
  },
  linkTextBold: {
    color: '#6C63FF',
    fontWeight: 'bold',
  },
});
