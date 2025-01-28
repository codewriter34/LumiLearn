import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const LearningProgress = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Student Learning Progress</Text>
      {/* Add dynamic content for learning progress */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#f8f8f8',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default LearningProgress;
