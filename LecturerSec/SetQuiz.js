import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Import Picker
import { db } from '../FirebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

const SetQuiz = ({ route }) => {
  const { courseId, courseName } = route.params;

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']); // 4 options
  const [correctAnswer, setCorrectAnswer] = useState(''); // Correct answer A, B, C, or D
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddQuestion = () => {
    if (!currentQuestion || options.some((opt) => opt.trim() === '') || !correctAnswer) {
      Alert.alert('Incomplete Data', 'Please fill in all fields before adding a question.');
      return;
    }

    const answerIndex = ['A', 'B', 'C', 'D'].indexOf(correctAnswer);
    if (answerIndex === -1 || options[answerIndex].trim() === '') {
      Alert.alert('Invalid Answer', 'The correct answer must match one of the non-empty options.');
      return;
    }

    setQuestions([
      ...questions,
      {
        question: currentQuestion,
        options,
        correctAnswer, // Store as A, B, C, or D
      },
    ]);
    setCurrentQuestion('');
    setOptions(['', '', '', '']);
    setCorrectAnswer('');
  };

  const handleSubmitQuiz = async () => {
    if (questions.length < 5) {
      Alert.alert('Insufficient Questions', 'Please add at least 5 questions.');
      return;
    }

    setIsSubmitting(true);
    try {
      const quizzesRef = collection(db, 'quizzes');
      await addDoc(quizzesRef, {
        courseId,
        courseName,
        questions,
      });

      Alert.alert('Quiz Created', 'The quiz has been successfully created!');
      setQuestions([]);
    } catch (error) {
      console.error('Error submitting quiz:', error.message);
      Alert.alert('Error', 'There was an error creating the quiz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Set Quiz</Text>
      <Text style={styles.subtitle}>Course ID: {courseId}</Text>
      <Text style={styles.subtitle}>Course Name: {courseName}</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter question"
          value={currentQuestion}
          onChangeText={setCurrentQuestion}
        />
        {options.map((opt, index) => (
          <TextInput
            key={index}
            style={styles.input}
            placeholder={`Option ${String.fromCharCode(65 + index)}`} // A, B, C, D
            value={opt}
            onChangeText={(text) => {
              const newOptions = [...options];
              newOptions[index] = text;
              setOptions(newOptions);
            }}
          />
        ))}
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Correct Answer:</Text>
          <Picker
            selectedValue={correctAnswer}
            onValueChange={(itemValue) => setCorrectAnswer(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select Answer" value="" />
            <Picker.Item label="A" value="A" />
            <Picker.Item label="B" value="B" />
            <Picker.Item label="C" value="C" />
            <Picker.Item label="D" value="D" />
          </Picker>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddQuestion}>
          <Text style={styles.buttonText}>Add Question</Text>
        </TouchableOpacity>
      </View>

      {questions.length > 0 && (
        <View style={styles.questionsPreview}>
          <Text style={styles.questionsTitle}>Questions Preview:</Text>
          {questions.map((q, index) => (
            <View key={index} style={styles.questionItem}>
              <Text style={styles.questionText}>
                {index + 1}. {q.question}
              </Text>
              {q.options.map((opt, i) => (
                <Text key={i} style={styles.optionText}>
                  {String.fromCharCode(65 + i)}. {opt}
                </Text>
              ))}
              <Text style={styles.answerText}>Correct Answer: {q.correctAnswer}</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={[styles.submitButton, questions.length < 5 ? styles.disabledButton : null]}
        onPress={handleSubmitQuiz}
        disabled={questions.length < 5 || isSubmitting}
      >
        <Text style={styles.buttonText}>
          {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#151B54',
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    borderColor: '#151B54',
    borderWidth: 1,
  },
  pickerContainer: {
    marginBottom: 20,
  },
  pickerLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 5,
  },
  picker: {
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
    borderColor: '#151B54',
    borderWidth: 2,
  },
  buttonText: {
    color: '#151B54',
    fontWeight: 'bold',
    fontSize: 16,
  },
  questionsPreview: {
    marginBottom: 20,
  },
  questionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  questionItem: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    borderColor: '#151B54',
    borderWidth: 1,
  },
  questionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#151B54',
    marginBottom: 5,
  },
  optionText: {
    fontSize: 14,
    color: '#151B54',
  },
  answerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#151B54',
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    borderColor: '#151B54',
    borderWidth: 2,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default SetQuiz;
