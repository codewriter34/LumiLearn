import React from 'react';
import { View, Text, StyleSheet, Button, Image } from 'react-native';

const WelcomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Add your logo here */}
      <Image
        source={require('./Lu-logo.jpg')} 
        style={styles.logo}
      />
      <Text style={styles.title}>Welcome to LumiLearn</Text>
      <Button
        title="Register"
        color="#151B54" 
        onPress={() => navigation.navigate('RegisterScreen')} 
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
  logo: {
    width: 120, 
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#151B54',
    marginBottom: 20,
  },
});

export default WelcomeScreen;
