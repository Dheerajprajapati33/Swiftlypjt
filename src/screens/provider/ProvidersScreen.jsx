import React from "react";
import { View, FlatList, StyleSheet } from "react-native";
import ProviderCard from "../../components/ProviderCard";

const providers = [
  { id: "1", name: "John", service: "Cleaning" },
  { id: "2", name: "Mike", service: "Electrician" },
];

const ProvidersScreen = () => {
  return (
    <View style={styles.container}>
      <FlatList
        data={providers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProviderCard item={item} />}
      />
    </View>
  );
};

export default ProvidersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
});
