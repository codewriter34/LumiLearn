import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { auth, db } from '../FirebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import BottomMenu from './BottomNav';
import { ScrollView } from 'react-native-gesture-handler';

const StudentHome = ({ navigation }) => {
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(true);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          console.error('No user is currently signed in.');
          return;
        }

        // Fetch student name
        const userRef = collection(db, 'users');
        const userQuery = query(userRef, where('uid', '==', user.uid));
        const userSnapshot = await getDocs(userQuery);

        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          setStudentName(userData.name || 'Student');
        } else {
          console.error('No such document!');
        }

        // Fetch quiz scores
        const scoreRef = collection(db, 'quizScores');
        const scoreQuery = query(scoreRef, where('userId', '==', user.uid));
        const scoreSnapshot = await getDocs(scoreQuery);

        if (!scoreSnapshot.empty) {
          const scoresData = scoreSnapshot.docs.map(doc => doc.data());
          
          // Sort courses by the lowest scores
          const sortedScores = scoresData.sort((a, b) => a.scorePercentage - b.scorePercentage);
          const leastPassedCourses = sortedScores.slice(0, 3); // Get top 3 least passed courses
          
          // Fetch course details for each least passed course
          const coursePromises = leastPassedCourses.map(async (score) => {
            const courseRef = collection(db, 'courses');
            const courseQuery = query(courseRef, where('courseId', '==', score.courseId));
            const courseSnapshot = await getDocs(courseQuery);
            if (!courseSnapshot.empty) {
              return courseSnapshot.docs[0].data();
            }
          });

          const courses = await Promise.all(coursePromises);
          setRecommendedCourses(courses.filter(course => course !== undefined));
        } else {
          Alert.alert('No quiz scores found', 'You have not attempted any quizzes yet.');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Student Dashboard</Text>
        <TouchableOpacity style={styles.notificationIcon}>
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <ScrollView>
        <View style={styles.welcomeContainer}>
          <Ionicons name="school-outline" size={32} color="#151B54" style={styles.icon} />
          <Text style={styles.welcomeText}>Welcome</Text>
          <Text style={styles.studentName}>{studentName}</Text>
        </View>

        {/* Quick Actions Section */}
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('CoursesForQuiz')}
          >
            <Text style={styles.actionButtonText}>Take a Quiz</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Courses')}
          >
            <Text style={styles.actionButtonText}>View Courses</Text>
          </TouchableOpacity>
        </View>

        {/* Recommended Courses Section */}
        {recommendedCourses.length > 0 && (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Recommended Courses (Least Passed)</Text>
            {recommendedCourses.map((course, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionButton}
                onPress={() => navigation.navigate('CourseDetails', { courseId: course.courseId })}
              >
                <Text style={styles.actionButtonText}>{course.courseName}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

      </ScrollView>
      <BottomMenu navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  topBar: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#151B54',
  },
  welcomeContainer: {
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#151B54',
    marginBottom: 10,
    marginRight: 10,
  },
  studentName: {
    paddingLeft: 0,
    fontSize: 26,
    color: '#151B54',
  },
  icon: {
    marginRight: 10,
  },
  content: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#151B54',
    marginBottom: 15,
  },
  actionButton: {
    backgroundColor: '#151B54',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default StudentHome;
