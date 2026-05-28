import React, { useState, useContext } from "react";
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
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
import Header from "../../components/Header";

const RegisterScreen = ({ navigation }) => {
  const { register } = useContext(AuthContext);
  const { isDarkMode, background, cardBackground, text, secondaryText, border, inputBackground } = useContext(ThemeContext);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [values, setValues] = useState({
    name: "",
    email: "",
    profileUrl: "",
    password: "",
    confirmPassword: "",
  });

  const [role, setRole] = useState("customer"); // 'customer' or 'service_provider'
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Client-side validator
  const validateField = (field, value, currentValues = values) => {
    let error = "";
    
    switch (field) {
      case "name":
        if (!value.trim()) {
          error = "Name is required";
        }
        break;
      case "email":
        if (!value.trim()) {
          error = "Email is required";
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
          error = "Invalid email address";
        }
        break;
      case "profileUrl":
        if (value.trim()) {
          const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
          if (!urlPattern.test(value)) {
            error = "Invalid URL format";
          }
        }
        break;
      case "password":
        if (!value) {
          error = "Password is required";
        } else if (value.length < 6) {
          error = "Password must be at least 6 characters";
        }
        break;
      case "confirmPassword":
        if (!value) {
          error = "Please confirm your password";
        } else if (value !== currentValues.password) {
          error = "Passwords must match";
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

    // Validate on change if touched
    if (touched[field]) {
      const error = validateField(field, value, newValues);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }

    // Special check: if we change password, revalidate confirmPassword if it was touched
    if (field === "password" && touched.confirmPassword) {
      const error = validateField("confirmPassword", newValues.confirmPassword, newValues);
      setErrors((prev) => ({ ...prev, confirmPassword: error }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, values[field]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleRegister = async () => {
    // Touch all fields to trigger full validation
    const fields = ["name", "email", "profileUrl", "password", "confirmPassword"];
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
      Alert.alert("Validation Error", "Please fix the errors in the form before submitting.");
      return;
    }

    setSubmitting(true);
    const result = await register(
      values.name,
      values.email,
      values.profileUrl,
      role,
      values.password
    );
    setSubmitting(false);

    if (result.success) {
      Alert.alert(
        "Account Created", 
        "Your account has been registered successfully! Please login with your details.",
        [
          { text: "OK", onPress: () => navigation.navigate("Login") }
        ]
      );
    } else {
      Alert.alert("Registration Failed", result.error);
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
      
      {/* Top Header with theme selector */}
      <Header showProfile={false} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={[styles.card, { backgroundColor: cardBackground, borderColor: border }]}>
            <Text style={[styles.heading, { color: text }]}>Create Account</Text>
            <Text style={[styles.subheading, { color: secondaryText }]}>Join Swiftly Home Services today</Text>

            {/* Name Field */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: text }]}>Full Name</Text>
              <TextInput
                placeholder="Enter your full name"
                style={getInputStyle("name")}
                value={values.name}
                onChangeText={(val) => handleChange("name", val)}
                onBlur={() => handleBlur("name")}
                placeholderTextColor={isDarkMode ? '#888' : '#999'}
              />
              {touched.name && errors.name ? (
                <Text style={styles.errorText}>{errors.name}</Text>
              ) : null}
            </View>

            {/* Email Field */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: text }]}>Email Address</Text>
              <TextInput
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                style={getInputStyle("email")}
                value={values.email}
                onChangeText={(val) => handleChange("email", val)}
                onBlur={() => handleBlur("email")}
                placeholderTextColor={isDarkMode ? '#888' : '#999'}
              />
              {touched.email && errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}
            </View>

            {/* Role Picker (Custom segmented buttons) */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: text }]}>Register As</Text>
              <View style={[styles.roleContainer, { borderColor: border }]}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    { backgroundColor: inputBackground },
                    role === "customer" && styles.roleButtonActive,
                  ]}
                  onPress={() => setRole("customer")}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      { color: secondaryText },
                      role === "customer" && styles.roleButtonTextActive,
                    ]}
                  >
                    Customer
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    { backgroundColor: inputBackground },
                    role === "service_provider" && styles.roleButtonActive,
                  ]}
                  onPress={() => setRole("service_provider")}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      { color: secondaryText },
                      role === "service_provider" && styles.roleButtonTextActive,
                    ]}
                  >
                    Service Provider
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Profile URL Field */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: text }]}>Profile Image URL (Optional)</Text>
              <TextInput
                placeholder="https://example.com/avatar.jpg"
                autoCapitalize="none"
                style={getInputStyle("profileUrl")}
                value={values.profileUrl}
                onChangeText={(val) => handleChange("profileUrl", val)}
                onBlur={() => handleBlur("profileUrl")}
                placeholderTextColor={isDarkMode ? '#888' : '#999'}
              />
              {touched.profileUrl && errors.profileUrl ? (
                <Text style={styles.errorText}>{errors.profileUrl}</Text>
              ) : null}
            </View>

            {/* Password Field */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: text }]}>Password</Text>
              <TextInput
                placeholder="Create a strong password"
                secureTextEntry
                autoCapitalize="none"
                style={getInputStyle("password")}
                value={values.password}
                onChangeText={(val) => handleChange("password", val)}
                onBlur={() => handleBlur("password")}
                placeholderTextColor={isDarkMode ? '#888' : '#999'}
              />
              {touched.password && errors.password ? (
                <Text style={styles.errorText}>{errors.password}</Text>
              ) : null}
            </View>

            {/* Confirm Password Field */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: text }]}>Confirm Password</Text>
              <TextInput
                placeholder="Repeat your password"
                secureTextEntry
                autoCapitalize="none"
                style={getInputStyle("confirmPassword")}
                value={values.confirmPassword}
                onChangeText={(val) => handleChange("confirmPassword", val)}
                onBlur={() => handleBlur("confirmPassword")}
                placeholderTextColor={isDarkMode ? '#888' : '#999'}
              />
              {touched.confirmPassword && errors.confirmPassword ? (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              ) : null}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleRegister}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Register</Text>
              )}
            </TouchableOpacity>

            {/* Navigate to Login */}
            <TouchableOpacity
              style={styles.linkContainer}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={[styles.linkText, { color: secondaryText }]}>
                Already have an account? <Text style={styles.linkTextBold}>Login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
    marginVertical: 20,
    borderWidth: 1,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  subheading: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
  },
  inputError: {
    borderColor: "#FF6363",
    backgroundColor: "#FFF6F6",
  },
  inputSuccess: {
    borderColor: "#6C63FF",
  },
  errorText: {
    color: "#FF6363",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  roleContainer: {
    flexDirection: "row",
    borderWidth: 1.5,
    borderRadius: 14,
    overflow: "hidden",
  },
  roleButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
  },
  roleButtonActive: {
    backgroundColor: "#6C63FF",
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  roleButtonTextActive: {
    color: "#fff",
  },
  button: {
    backgroundColor: "#6C63FF",
    padding: 16,
    borderRadius: 14,
    marginTop: 10,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  linkContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  linkText: {
    fontSize: 14,
  },
  linkTextBold: {
    color: "#6C63FF",
    fontWeight: "bold",
  },
});
