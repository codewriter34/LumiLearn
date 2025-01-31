import React, { useState, useEffect } from 'react';
import {
  View,  Text, TextInput, TouchableOpacity, StyleSheet, 
  ScrollView, KeyboardAvoidingView,Platform,Keyboard,TouchableWithoutFeedback,
} from 'react-native';
import { auth, db } from '../FirebaseConfig';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const CoursesScreen = () => {
  const [courseId, setCourseId] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courses, setCourses] = useState([]);
  const [lecturerId, setLecturerId] = useState(null);

  // Get the authenticated lecturer's ID
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLecturerId(user.uid); // Set the lecturer's UID
      } else {
        console.error('No user is logged in.');
      }
    });

    return unsubscribe; 
  }, []);

  // Fetch courses from Firestore
  useEffect(() => {
    if (lecturerId) {
      const fetchCourses = async () => {
        try {
          const coursesRef = collection(db, 'courses');
          const q = query(coursesRef, where('lecturerId', '==', lecturerId));
          const querySnapshot = await getDocs(q);

          const coursesList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setCourses(coursesList);
        } catch (error) {
          console.error('Error fetching courses:', error.message);
        }
      };

      fetchCourses();
    }
  }, [lecturerId]);

  // Add a new course
  const handleAddCourse = async () => {
    if (!courseId || !courseName) {
      alert('Please provide both course ID and course name.');
      return;
    }

    try {
      const coursesRef = collection(db, 'courses');

      // Check if the course ID already exists
      const q = query(coursesRef, where('courseId', '==', courseId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        alert('A course with this ID already exists.');
        return;
      }

      // Add the course to Firestore
      await addDoc(coursesRef, {
        lecturerId,
        courseId,
        courseName,
      });

      // Update the courses state
      setCourses([...courses, { courseId, courseName }]);
      setCourseId('');
      setCourseName('');
      alert('Course added successfully!');
    } catch (error) {
      console.error('Error adding course:', error.message);
      alert(`Error adding course: ${error.message}`);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Courses Screen</Text>
          <Text style={styles.subtitle}>Your Courses</Text>

          {/* Input Section */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter Course ID"
              value={courseId}
              onChangeText={setCourseId}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Enter Course Name"
              value={courseName}
              onChangeText={setCourseName}
              autoCapitalize="words"
            />
            <TouchableOpacity style={styles.button} onPress={handleAddCourse}>
              <Text style={styles.buttonText}>Add Course</Text>
            </TouchableOpacity>
          </View>

          {/* Render Courses */}
          <View>
            {courses.map((item, index) => (
              <View key={index} style={styles.courseItem}>
                <Text style={styles.courseText}>Course ID: {item.courseId}</Text>
                <Text style={styles.courseText}>Course Name: {item.courseName}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    marginVertical: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  courseItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
  },
  courseText: {
    fontSize: 16,
  },
});

export default CoursesScreen;
