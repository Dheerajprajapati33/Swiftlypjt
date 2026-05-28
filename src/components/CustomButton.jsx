import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

const CustomButton = ({ title, onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#6C63FF",
    padding: 15,
    borderRadius: 10,
  },
  text: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});
