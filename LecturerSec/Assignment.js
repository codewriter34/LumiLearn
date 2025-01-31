import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Platform,
} from 'react-native';
import { db, auth } from '../FirebaseConfig';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const Assignments = ({ navigation }) => {
  const [lecturerId, setLecturerId] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [assignmentText, setAssignmentText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [deadline, setDeadline] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

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

  useEffect(() => {
    const fetchCourses = async () => {
      if (!lecturerId) return;
      try {
        const coursesRef = collection(db, 'courses');
        const q = query(coursesRef, where('lecturerId', '==', lecturerId));
        const querySnapshot = await getDocs(q);
        setCourses(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error fetching courses:', error.message);
      }
      setLoading(false);
    };
    fetchCourses();
  }, [lecturerId]);

  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      });
  
      if (!result.canceled) {
        const file = result.assets[0];
        console.log('Selected File:', file.uri, file.name);
  
        const response = await fetch(file.uri);
        const blob = await response.blob();
  
        // 🔹 Generate a safe filename (no spaces/special characters)
        const safeFileName = file.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
        const uniqueFileName = `${Date.now()}_${safeFileName}`;
  
        const storage = getStorage();
        const storageRef = ref(storage, `assignments/${uniqueFileName}`);
  
        await uploadBytes(storageRef, blob);
        console.log('File uploaded successfully');
  
        const downloadURL = await getDownloadURL(storageRef);
        console.log('Download URL:', downloadURL);
        setFileUrl(downloadURL);
        setSelectedFile(safeFileName);
        return downloadURL;
      }
    } catch (error) {
      console.error('File upload error:', error);
      alert('File upload failed. Please try again.');
      return null;
    }
  };
  

  const handleSubmitAssignment = async () => {
    if (!selectedCourse) {
      alert('Please select a course.');
      return;
    }
    if (!assignmentText && !selectedFile) {
      alert('Please enter an assignment or upload a file.');
      return;
    }

    let uploadedFileUrl = fileUrl;
    if (!fileUrl) {
      uploadedFileUrl = await handleFileUpload();
    }

    if (!uploadedFileUrl) {
      alert('File upload failed. Try again.');
      return;
    }

    console.log('Submitting Assignment with File URL:', uploadedFileUrl);

    try {
      await addDoc(collection(db, 'assignments'), {
        lecturerId,
        courseId: selectedCourse.id,
        courseName: selectedCourse.courseName,
        assignmentText,
        fileName: selectedFile || null,
        fileUrl: uploadedFileUrl,
        deadline: deadline.toISOString(),
        createdAt: new Date().toISOString(),
      });
      alert('Assignment submitted successfully!');
      setAssignmentText('');
      setSelectedFile(null);
      setFileUrl(null);
      setSelectedCourse(null);
    } catch (error) {
      console.error('Error submitting assignment:', error.message);
      alert('Failed to submit assignment.');
    }
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
      <Text style={styles.title}>Submit Assignment</Text>
      {courses.map(course => (
        <TouchableOpacity key={course.id} style={[styles.courseItem, selectedCourse?.id === course.id && styles.selectedCourse]} onPress={() => setSelectedCourse(course)}>
          <Text style={styles.courseText}>{course.courseName}</Text>
        </TouchableOpacity>
      ))}
      <TextInput style={styles.input} placeholder="Type assignment details here..." placeholderTextColor="#FFFFFF" multiline numberOfLines={5} value={assignmentText} onChangeText={setAssignmentText} />
      <TouchableOpacity style={styles.uploadButton} onPress={handleFileUpload}>
        <Text style={styles.uploadText}>{selectedFile ? `File Uploaded: ${selectedFile}` : 'Upload Assignment File'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
        <Text style={styles.dateText}>{deadline.toDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && <DateTimePicker value={deadline} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={(event, date) => { setShowDatePicker(false); if (date) setDeadline(date); }} />}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmitAssignment}>
        <Text style={styles.submitText}>Submit Assignment</Text>
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
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  noCoursesText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  courseItem: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  selectedCourse: {
    backgroundColor: '#FFD700',
  },
  courseText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#151B54',
  },
  input: {
    backgroundColor: '#1E2A78',
    color: '#FFFFFF',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  uploadButton: {
    backgroundColor: '#FFD700',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  uploadText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#151B54',
  },
  dateButton: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  dateText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#151B54',
  },
  submitButton: {
    backgroundColor: '#FFD700',
    padding: 15,
    borderRadius: 5,
  },
  submitText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#151B54',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#151B54',
  },
});

export default Assignments;
