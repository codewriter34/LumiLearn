import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const WelcomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to LumiLearn</Text>
      <Button
        title="Continue to Register"
        onPress={() => navigation.navigate('Register')} // Replace 'Register' with your actual registration screen
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#151B54',
    marginBottom: 20,
  },
});

export default WelcomeScreen;
