import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

const CustomInput = (props) => {
  return <TextInput style={styles.input} {...props} />;
};

export default CustomInput;

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 14,
    borderRadius: 10,
    marginBottom: 15,
  },
});