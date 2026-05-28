import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ProviderCard = ({ item }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text>{item.service}</Text>
    </View>
  );
};

export default ProviderCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 18,
     borderRadius: 12,
    marginBottom: 15,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});