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
} from 'react-native';

import { AuthContext } from '../../context/AuthContext';
import colors from '../../styles/colors';

const LoginScreen = ({ navigation }) => {
  const { login } = useContext(AuthContext);
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
      alert("Validation Error", "Please fix the errors in the form before submitting.");
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
    if (touched[field] && errors[field]) {
      return [styles.input, styles.inputError];
    }
    if (touched[field] && !errors[field]) {
      return [styles.input, styles.inputSuccess];
    }
    return styles.input;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardContainer}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.heading}>Welcome Back</Text>
          <Text style={styles.subheading}>Log in to manage your services</Text>

          {/* Email Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              placeholder="Enter your registered email"
              keyboardType="email-address"
              autoCapitalize="none"
              style={getInputStyle('email')}
              value={values.email}
              onChangeText={(val) => handleChange('email', val)}
              onBlur={() => handleBlur('email')}
              placeholderTextColor="#999"
            />
            {touched.email && errors.email ? (
              <Text style={styles.errorText}>{errors.email}</Text>
            ) : null}
          </View>

          {/* Password Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              placeholder="Enter your password"
              secureTextEntry
              autoCapitalize="none"
              style={getInputStyle('password')}
              value={values.password}
              onChangeText={(val) => handleChange('password', val)}
              onBlur={() => handleBlur('password')}
              placeholderTextColor="#999"
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
            <Text style={styles.linkText}>
              Don't have an account? <Text style={styles.linkTextBold}>Create Account</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
    marginVertical: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111',
    textAlign: 'center',
  },
  subheading: {
    fontSize: 14,
    color: '#666',
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
    color: '#444',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E8F0',
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: '#111',
    backgroundColor: '#F9FAFC',
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
    color: '#666',
  },
  linkTextBold: {
    color: '#6C63FF',
    fontWeight: 'bold',
  },
});