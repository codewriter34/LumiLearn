import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const LoadingScreen = ({ navigation }) => {
  const [step, setStep] = useState(0); // Tracks which part of the text to show

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prevStep) => prevStep + 1); // Show the next part of the text
    }, 1000); // 1-second delay between each step

    const navigateTimer = setTimeout(() => {
      navigation.navigate('WelcomeScreen'); // Navigate to WelcomeScreen after all text is shown
    }, 4000); // Total duration is 4 seconds

    return () => {
      clearInterval(timer);
      clearTimeout(navigateTimer);
    };
  }, [navigation]);

  return (
    <View style={styles.container}>
      {step >= 0 && <Text style={styles.text}>L</Text>}
      {step >= 1 && <Text style={styles.text}>u</Text>}
      {step >= 2 && <Text style={styles.text}>m</Text>}
      {step >= 3 && <Text style={styles.text}>iLearn</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#151B54', // Dark blue background
  },
  text: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default LoadingScreen;
