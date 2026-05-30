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
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import Header from '../../components/Header';

const LoginScreen = ({ navigation }) => {
  const { login } = useContext(AuthContext);
  const { isDarkMode, background, cardBackground, text, secondaryText, border, inputBackground } = useContext(ThemeContext);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [values, setValues] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (field, value) => {
    let error = '';
    switch (field) {
      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
          error = 'Invalid email address';
        }
        break;
      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 6) {
          error = 'Password must be at least 6 characters';
        }
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (field, value) => {
    const newValues = { ...values, [field]: value };
    setValues(newValues);

    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, values[field]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleLogin = async () => {
    const fields = ['email', 'password'];
    const newTouched = {};
    const newErrors = {};
    let hasError = false;

    fields.forEach((field) => {
      newTouched[field] = true;
      const error = validateField(field, values[field]);
      if (error) {
        newErrors[field] = error;
        hasError = true;
      }
    });

    setTouched(newTouched);
    setErrors(newErrors);

    if (hasError) {
      return;
    }

    setSubmitting(true);
    const result = await login(values.email, values.password);
    setSubmitting(false);

    if (result.success) {
      // User is redirected by the StackNavigator conditional check
    } else {
      alert('Login Failed', result.error);
    }
  };

  const getInputStyle = (field) => {
    const baseStyle = [
      styles.input,
      { backgroundColor: inputBackground, borderColor: border, color: text }
    ];
    if (touched[field] && errors[field]) {
      return [...baseStyle, styles.inputError];
    }
    if (touched[field] && !errors[field]) {
      return [...baseStyle, styles.inputSuccess];
    }
    return baseStyle;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={cardBackground} />
      
      {/* Top Header with Theme selector */}
      <Header showProfile={false} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={[styles.card, { backgroundColor: cardBackground, borderColor: border }]}>
            <Text style={[styles.heading, { color: text }]}>Welcome Back</Text>
            <Text style={[styles.subheading, { color: secondaryText }]}>Log in to manage your services</Text>

            {/* Email Field */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: text }]}>Email Address</Text>
              <TextInput
                placeholder="Enter your registered email"
                keyboardType="email-address"
                autoCapitalize="none"
                style={getInputStyle('email')}
                value={values.email}
                onChangeText={(val) => handleChange('email', val)}
                onBlur={() => handleBlur('email')}
                placeholderTextColor={isDarkMode ? '#888' : '#999'}
              />
              {touched.email && errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}
            </View>

            {/* Password Field */}
            <View style={styles.inputContainer}>
              <View style={styles.passwordLabelRow}>
                <Text style={[styles.label, { color: text }]}>Password</Text>
                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                  <Text style={styles.forgotPasswordLink}>Forgot?</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                placeholder="Enter your password"
                secureTextEntry
                autoCapitalize="none"
                style={getInputStyle('password')}
                value={values.password}
                onChangeText={(val) => handleChange('password', val)}
                onBlur={() => handleBlur('password')}
                placeholderTextColor={isDarkMode ? '#888' : '#999'}
              />
              {touched.password && errors.password ? (
                <Text style={styles.errorText}>{errors.password}</Text>
              ) : null}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>

            {/* Navigate to Register */}
            <TouchableOpacity
              style={styles.linkContainer}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={[styles.linkText, { color: secondaryText }]}>
                Don't have an account? <Text style={styles.linkTextBold}>Create Account</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

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
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  forgotPasswordLink: {
    color: '#6C63FF',
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
  },
  inputError: {
    borderColor: '#FF6363',
    backgroundColor: '#FFF6F6',
  },
  inputSuccess: {
    borderColor: '#6C63FF',
  },
  errorText: {
    color: '#FF6363',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
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
  },
  linkTextBold: {
    color: '#6C63FF',
    fontWeight: 'bold',
  },
});