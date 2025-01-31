import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Alert, StyleSheet, ScrollView
} from 'react-native';
import { db } from '../FirebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const LecturerCourses = ({ navigation }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const lecturerId = currentUser ? currentUser.uid : null; 

  useEffect(() => {
    // Fetch the courses lecturer is teaching once the lecturerId is available
    const fetchCourses = async () => {
      if (!lecturerId) return; // If lecturerId is not available, do nothing

      try {
        const coursesRef = collection(db, 'courses');
        const q = query(coursesRef, where('lecturerId', '==', lecturerId));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          Alert.alert('No Courses', 'You have no courses available.');
        }

        // Map the courses data to an array
        const coursesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(), 
        }));

        setCourses(coursesData);
      } catch (error) {
        console.error('Error fetching courses:', error);
        Alert.alert('Error', 'Failed to load courses.');
      } finally {
        setLoading(false); 
      }
    };

    fetchCourses();
  }, [lecturerId]); 

  const handleCourseClick = (courseId, courseName) => {
   
    navigation.navigate('CoursePerformance', { courseId, courseName });
  };

  if (loading) {
    return <Text>Loading courses...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Courses</Text>
      {courses.length === 0 ? (
        <Text>No courses found for this lecturer.</Text>
      ) : (
        <ScrollView>
          {courses.map((course) => (
            <TouchableOpacity
              key={course.id}
              style={styles.courseItem}
              onPress={() => handleCourseClick(course.id, course.courseName)}
            >
              <Text style={styles.courseText}>Course Name: {course.courseName}</Text>
              <Text style={styles.courseText}>Course ID: {course.courseId}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  courseItem: {
    padding: 10,
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  courseText: {
    fontSize: 16,
  },
});

export default LecturerCourses;
