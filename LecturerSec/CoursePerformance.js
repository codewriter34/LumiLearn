import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { db } from '../FirebaseConfig';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

const CoursePerformance = ({ route }) => {
  const { courseId, courseName } = route.params || {};
  const [studentsPerformance, setStudentsPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        // Check and log the received courseId to ensure it is correct
        console.log("Course ID passed to this component:", courseId);
        
        if (!courseId) {
          Alert.alert('Error', 'Course ID is missing or incorrect');
          return;
        }

        const quizScoresRef = collection(db, 'quizScores');
        const snapshot = await getDocs(quizScoresRef);

        console.log("Number of documents in quizScores:", snapshot.docs.length);

        const studentScores = {};

        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const { userId, scorePercentage, courseId: docCourseId } = data;

          // Log each document's courseId and score for debugging
          console.log(`Document: courseId=${docCourseId}, userId=${userId}, score=${scorePercentage}`);

          // Check if the courseId in the document matches the courseId being passed
          if (docCourseId === courseId) {
            if (!studentScores[userId]) {
              studentScores[userId] = { totalScore: 0, quizCount: 0 };
            }

            studentScores[userId].totalScore += scorePercentage;
            studentScores[userId].quizCount += 1;
          }
        });

        // Log the calculated student scores
        console.log("Calculated student scores:", studentScores);

        // Calculate average scores for each student
        const studentsData = Object.keys(studentScores).map((userId) => {
          const { totalScore, quizCount } = studentScores[userId];
          const averageScore = totalScore / quizCount;

          return { userId, averageScore };
        });

        // Log the students' average scores
        console.log("Students' average scores:", studentsData);

        // Sort students by their average scores in descending order
        studentsData.sort((a, b) => b.averageScore - a.averageScore);

        // Get top 5 students (highest average scores)
        const top5Students = studentsData.slice(0, 5);

        // Get bottom 5 students (lowest average scores)
        const bottom5Students = studentsData.slice(-5);

        // Log top and bottom students
        console.log("Top 5 Students:", top5Students);
        console.log("Bottom 5 Students:", bottom5Students);

        // Fetch names for each student and add them to the leaderboard data
        const studentsWithNames = await Promise.all([
          ...top5Students.map(async (entry) => {
            const userRef = doc(db, 'users', entry.userId);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
              return { ...entry, name: userDoc.data().name };
            }
            return { ...entry, name: entry.userId };  // Use userId if no name found
          }),
          ...bottom5Students.map(async (entry) => {
            const userRef = doc(db, 'users', entry.userId);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
              return { ...entry, name: userDoc.data().name };
            }
            return { ...entry, name: entry.userId };  // Use userId if no name found
          }),
        ]);

        setStudentsPerformance(studentsWithNames);
      } catch (error) {
        console.error('Error fetching performance data:', error);
        Alert.alert('Error', 'Failed to load performance data.');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch data if courseId exists
    if (courseId) {
      fetchPerformanceData();
    }
  }, [courseId]);

  const handleSendFeedback = (studentId) => {
    Alert.alert('Send Feedback', `Send feedback to student with ID: ${studentId}`);
  };

  if (loading) {
    return <Text>Loading performance data...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Performance for {courseName}</Text>

      {studentsPerformance.length === 0 ? (
        <Text>No student performance data available for this course.</Text>
      ) : (
        <ScrollView>
          {/* Displaying Top 5 Performing Students */}
          <Text style={styles.subtitle}>Top Performing Students</Text>
          {studentsPerformance.slice(0, 5).map((student, index) => (
            <View key={student.userId} style={styles.studentItem}>
              <Text>{index + 1}. {student.name}</Text>
              <Text>Score: {student.averageScore.toFixed(2)}%</Text>
              <TouchableOpacity onPress={() => handleSendFeedback(student.userId)}>
                <Text style={styles.feedbackButton}>Send Feedback</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Displaying Least Performing Students */}
          <Text style={styles.subtitle}>Least Performing Students</Text>
          {studentsPerformance.slice(-5).map((student, index) => (
            <View key={student.userId} style={styles.studentItem}>
              <Text>{studentsPerformance.length - 5 + index + 1}. {student.name}</Text>
              <Text>Score: {student.averageScore.toFixed(2)}%</Text>
              <TouchableOpacity onPress={() => handleSendFeedback(student.userId)}>
                <Text style={styles.feedbackButton}>Send Feedback</Text>
              </TouchableOpacity>
            </View>
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
  subtitle: {
    fontSize: 18,
    marginTop: 20,
  },
  studentItem: {
    padding: 10,
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  feedbackButton: {
    color: 'blue',
    marginTop: 5,
  },
});

export default CoursePerformance;
