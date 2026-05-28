import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DashboardCard = ({ title }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.text}>{title}</Text>
    </View>
  );
};

export default DashboardCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
  },
  text: {
    fontWeight: 'bold',
    fontSize: 18,
  },
});