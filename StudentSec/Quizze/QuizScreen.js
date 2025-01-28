import React, { useEffect, useState } from 'react';
import { Alert, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../../FirebaseConfig'; 
import { getAuth } from 'firebase/auth';
import { collection, getDocs, query, where, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';

const QuizScreen = ({ route, navigation }) => {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const userId = currentUser ? currentUser.uid : null; 
  const { courseId, courseName } = route.params || {};  // Safely destructure route params

  if (!courseId || !courseName) {
    return (
      <View style={styles.container}>
        <Text style={styles.noQuizText}>Invalid course or quiz data.</Text>
      </View>
    );
  }

  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30);
  const fadeAnim = new Animated.Value(1);
  const [scorePercentage, setScorePercentage] = useState(0); 
  const [isRegistered, setIsRegistered] = useState(false); 

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const quizzesRef = collection(db, 'quizzes');
        const q = query(quizzesRef, where('courseId', '==', courseId));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const quizData = snapshot.docs[0].data();
          console.log('Fetched Quiz Data:', quizData);  
          setQuiz(quizData);
        } else {
          Alert.alert('No Quiz Found', `No quiz available for ${courseName}.`);
        }
      } catch (error) {
        console.error('Error fetching quiz:', error);
        Alert.alert('Error', 'Failed to load quiz.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [courseId]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (timeLeft > 0) {
        setTimeLeft(timeLeft - 1);
      } else {
        handleAnswerSelection();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAnswerSelection = (selectedOption = null) => {
    const currentQuestion = quiz.questions[currentQuestionIndex];

    if (!currentQuestion || !Array.isArray(currentQuestion.options) || currentQuestion.options.length === 0) {
      console.error('Invalid options for the current question.');
      Alert.alert('Error', 'No valid options available for this question.');
      return;
    }

    let selectedLetter = 'X'; // Default selection if the option is invalid

    if (selectedOption) {
      const optionIndex = currentQuestion.options.indexOf(selectedOption);

      if (optionIndex !== -1) {
        selectedLetter = String.fromCharCode(65 + optionIndex); // Map to 'A', 'B', 'C', etc.
      } else {
        console.error('Selected option is not valid:', selectedOption);
        Alert.alert('Error', 'Selected option is not valid.');
      }
    }

    const updatedAnswers = [...studentAnswers];
    updatedAnswers[currentQuestionIndex] = selectedLetter;
    setStudentAnswers(updatedAnswers);

    if (currentQuestionIndex < quiz.questions.length - 1) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        setTimeLeft(30);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    } else {
      calculateScore(updatedAnswers);
    }
  };

  const calculateScore = (answers) => {
    const correctAnswers = quiz.questions.map((q) => q.correctAnswer);
    const score = answers.filter((answer, index) => answer === correctAnswers[index]).length;

    const scorePercentage = (score / quiz.questions.length) * 100;
    setScorePercentage(scorePercentage); // Update the score percentage

    showResultPopup(scorePercentage); // Call a popup to display result
  };

  const showResultPopup = (scorePercentage) => {
    // First, check the quizScores collection to see if the user already has a score
    const scoreRef = doc(db, 'quizScores', `${userId}_${courseId}`);

    getDoc(scoreRef).then((scoreSnapshot) => {
      if (scoreSnapshot.exists()) {
        // If a score exists, we show the "updated" popup and return early
        setIsRegistered(true);
        Alert.alert(
          'Score Updated',
          `Your score has been updated: ${scorePercentage.toFixed(2)}%`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        // If no score exists, proceed to register the score
        handleCourseRegistration(scorePercentage);
      }
    }).catch((error) => {
      console.error('Error checking score:', error);
      Alert.alert('Error', 'Failed to check if the score exists.');
    });
  };

  const handleCourseRegistration = async (scorePercentage) => {
    try {
      if (!courseId || !userId) {
        Alert.alert('Error', 'Invalid course or user ID');
        return;
      }

      // Register the score if no previous score is found
      const scoreRef = doc(db, 'quizScores', `${userId}_${courseId}`);
      await setDoc(scoreRef, {
        userId,
        courseId,
        scorePercentage,
      });

      setIsRegistered(true); // Set to true so next time the registration prompt doesn't show
      Alert.alert('Quiz Completed', `Your score: ${scorePercentage.toFixed(2)}%`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error saving score:', error);
      Alert.alert('Error', 'Failed to save score.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!quiz) {
    return (
      <View style={styles.container}>
        <Text style={styles.noQuizText}>No quiz available for {courseName}.</Text>
      </View>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{courseName} Quiz</Text>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.timerText}>{timeLeft}s</Text>
      <Animated.View style={[styles.questionContainer, { opacity: fadeAnim }]}>
        <Text style={styles.questionText}>
          {currentQuestionIndex + 1}. {currentQuestion.question}
        </Text>
        {currentQuestion.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionButton}
            activeOpacity={0.8}
            onPress={() => handleAnswerSelection(option)}
          >
            <Text style={styles.optionText}>
              {String.fromCharCode(65 + index)}. {option}
            </Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#151B54',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#151B54',
  },
  timerText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: 'red',
  },
  questionContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: '#E3E3E3',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noQuizText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
});

export default QuizScreen;
