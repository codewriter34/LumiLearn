import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator,
} from 'react-native';
import { db, auth } from '../FirebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const Quizzes = ({ navigation }) => {
  const [lecturerId, setLecturerId] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get the authenticated lecturer's ID
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLecturerId(user.uid);
      } else {
        console.error('No user is logged in.');
      }
    });

    return unsubscribe;
  }, []);

  // Fetch courses from Firestore
  useEffect(() => {
    const fetchCourses = async () => {
      if (!lecturerId) return;

      try {
        const coursesRef = collection(db, 'courses');
        const q = query(coursesRef, where('lecturerId', '==', lecturerId));
        const querySnapshot = await getDocs(q);

        const coursesList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCourses(coursesList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching courses:', error.message);
        setLoading(false);
      }
    };

    fetchCourses();
  }, [lecturerId]);

  // Handle course click to navigate to quiz creation or management
  const handleCourseClick = (courseId, courseName) => {
    navigation.navigate('SetQuiz', { courseId, courseName });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Quizzes</Text>
      <Text style={styles.subtitle}>Select a course to set or manage quizzes:</Text>

      {courses.length === 0 ? (
        <Text style={styles.noCoursesText}>No courses found. Add some courses first!</Text>
      ) : (
        courses.map((course) => (
          <TouchableOpacity
            key={course.id}
            style={styles.courseItem}
            onPress={() => handleCourseClick(course.courseId, course.courseName)}
          >
            <Text style={styles.courseText}>Course ID: {course.courseId}</Text>
            <Text style={styles.courseText}>Course Name: {course.courseName}</Text>
          </TouchableOpacity>
        ))
      )}
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
  noCoursesText: {
    fontSize: 16,
    color: '#FFFFFF', 
    textAlign: 'center',
  },
  courseItem: {
    backgroundColor: '#FFFFFF', 
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    borderColor: '#151B54', 
    borderWidth: 2,
  },
  courseText: {
    fontSize: 16,
    color: '#151B54', 
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#151B54', 
  },
});

export default Quizzes;
