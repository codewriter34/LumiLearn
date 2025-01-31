import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { auth, db } from '../FirebaseConfig'; 
import { Ionicons } from '@expo/vector-icons';
import BottomMenu from './BottomNav';
import { ScrollView } from 'react-native-gesture-handler';

const LecturerHome = ({ navigation }) => {
  const [lecturerName, setLecturerName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLecturerName = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          console.error('No user is currently signed in.');
          return;
        }

        const userRef = collection(db, 'users');
        const q = query(userRef, where('uid', '==', user.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          setLecturerName(userData.name || 'Lecturer');
        } else {
          console.error('No such document!');
        }
      } catch (error) {
        console.error('Error fetching lecturer name:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLecturerName();
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
        <Text style={styles.topBarTitle}>Lecturer Dashboard</Text>
        <TouchableOpacity style={styles.notificationIcon}>
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <ScrollView>
        <View style={styles.welcomeContainer}>
          {/* Learning Icon */}
          <Ionicons name="book-outline" size={32} color="#151B54" style={styles.icon} />
          {/* Welcome Text */}
          <Text style={styles.welcomeText}>Welcome</Text>
          <Text style={styles.lecturerName}>{lecturerName}</Text>
        </View>

        {/* View Course Performance Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>View Course Performance</Text>
          <Text style={styles.sectionDescription}>
            Check the performance of your courses and see how students are doing.
          </Text>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => navigation.navigate('LecturerCourses')}
          >
            <Text style={styles.buttonText}>View Course Performance</Text>
          </TouchableOpacity>
        </View>

        {/* Send Feedback Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Send Feedback</Text>
          <Text style={styles.sectionDescription}>
            Provide valuable feedback to your students to help them improve.
          </Text>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => navigation.navigate('SendFeedback')}
          >
            <Text style={styles.buttonText}>Send Feedback</Text>
          </TouchableOpacity>
        </View>

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
  appTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#151B54',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  lecturerName: {
    paddingLeft: 0,
    fontSize: 26,
    color: '#151B54',
  },
  icon: {
    marginRight: 10, 
  },
  sectionContainer: {
    marginTop: 30,
    marginHorizontal: 20,
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#151B54',
  },
  sectionDescription: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#151B54',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default LecturerHome;
