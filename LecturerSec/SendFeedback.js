import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { db } from '../FirebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

const SendFeedback = ({ route, navigation }) => {
  const { studentId, courseId } = route.params;
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      Alert.alert('Error', 'Feedback cannot be empty.');
      return;
    }

    try {
      const feedbackRef = doc(db, 'feedbacks', `${studentId}_${courseId}`);
      await setDoc(feedbackRef, {
        studentId,
        courseId,
        feedback,
        timestamp: new Date(),
      });

      Alert.alert('Feedback Sent', 'Your feedback has been sent successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error sending feedback:', error);
      Alert.alert('Error', 'Failed to send feedback.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Send Feedback</Text>
      <TextInput
        style={styles.textInput}
        multiline
        numberOfLines={4}
        value={feedback}
        onChangeText={setFeedback}
        placeholder="Enter your feedback"
      />
      <Button title="Submit Feedback" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  textInput: {
    marginTop: 10,
    padding: 10,
    height: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    textAlignVertical: 'top',
  },
});

export default SendFeedback;
