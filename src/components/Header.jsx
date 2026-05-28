import React from "react";
import { View, Text, StyleSheet } from "react-native";

const Header = ({ title }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  header: {
    padding: 20,
    backgroundColor: "#6C63FF",
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
});
