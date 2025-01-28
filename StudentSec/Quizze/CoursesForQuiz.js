
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../FirebaseConfig';

const TakeQuiz = ({ navigation }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesRef = collection(db, 'courses');
        const snapshot = await getDocs(coursesRef);

        if (!snapshot.empty) {
          const coursesData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setCourses(coursesData);
        } else {
          Alert.alert('No Courses', 'No courses available.');
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        Alert.alert('Error', 'Failed to load courses.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleTakeQuiz = (courseId, courseName) => {
    navigation.navigate('QuizScreen', { courseId, courseName });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Courses</Text>
      {courses.map((course) => (
        <TouchableOpacity
          key={course.courseId}
          style={styles.courseButton}
          onPress={() => handleTakeQuiz(course.courseId, course.courseName)}
        >
          <Text style={styles.courseText}>{course.courseName}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
    marginTop:50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  courseButton: {
    backgroundColor: '#151B54',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  courseText: {
    color: '#fff',
    fontSize: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TakeQuiz;
