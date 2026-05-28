import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';

const ServiceCard = ({ item, onBook }) => {
  const { isDarkMode, text, secondaryText, cardBackground, border } = useContext(ThemeContext);
  const providerAvatar = item.providerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100';

  return (
    <View style={[styles.card, { backgroundColor: cardBackground, borderColor: border }]}>

      {/* Provider Details Header */}
      <View style={styles.providerRow}>
        <Image source={{ uri: providerAvatar }} style={styles.providerAvatar} />
        <View style={styles.providerInfo}>
          <Text style={[styles.providerName, { color: text }]}>{item.providerName}</Text>
          <View style={[styles.categoryBadge, { backgroundColor: isDarkMode ? '#2E2E36' : '#F0EEFF' }]}>
            <Text style={[styles.categoryText, { color: isDarkMode ? '#A0A5B5' : '#6C63FF' }]}>{item.category}</Text>
          </View>
          
        </View>
        <Text style={styles.price}>{item.price}</Text>
      </View>

      {/* Service Details */}
      <Text style={[styles.title, { color: text }]}>{item.name}</Text>
      <Text style={[styles.description, { color: secondaryText }]}>{item.description}</Text>

      {/* Action Button */}
      <TouchableOpacity style={styles.button} onPress={() => onBook(item)}>
        <Text style={styles.buttonText}>Book Service</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ServiceCard;

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  providerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eee',
  },
  providerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  providerName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6C63FF',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#6C63FF',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});