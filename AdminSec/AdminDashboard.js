import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { auth, db } from '../FirebaseConfig';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

const AdminDashboard = ({ navigation }) => {
  const [students, setStudents] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersRef);
        const studentList = [];
        const lecturerList = [];
        const adminList = [];

        querySnapshot.forEach(doc => {
          const data = doc.data();
          switch (data.role) {
            case 'Student':
              studentList.push({ id: doc.id, ...data });
              break;
            case 'Lecturer':
              lecturerList.push({ id: doc.id, ...data });
              break;
            case 'Admin':
              adminList.push({ id: doc.id, ...data });
              break;
            default:
              break;
          }
        });

        setStudents(studentList);
        setLecturers(lecturerList);
        setAdmins(adminList);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    Alert.alert(
      "Delete User",
      "Are you sure you want to delete this user?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK", onPress: async () => {
            try {
              await deleteDoc(doc(db, 'users', userId));
              setStudents(students.filter(user => user.id !== userId));
              setLecturers(lecturers.filter(user => user.id !== userId));
              setAdmins(admins.filter(user => user.id !== userId));
              Alert.alert("User deleted successfully!");
            } catch (error) {
              console.error('Error deleting user:', error);
            }
          }
        }
      ]
    );
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('RegisterScreen');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.userItem}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userRole}>{item.role}</Text>
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteUser(item.id)}>
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return <Text style={styles.loadingText}>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <Text style={styles.navbarText}>Admin Dashboard</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.header}>Manage your system with ease</Text>
      <FlatList
        ListHeaderComponent={() => (
          <>
            <View style={styles.sectionHeaderContainer}>
              <Text style={styles.sectionHeader}>Students</Text>
            </View>
            <FlatList
              data={students}
              keyExtractor={item => item.id}
              renderItem={renderUserItem}
            />
            <View style={styles.sectionHeaderContainer}>
              <Text style={styles.sectionHeader}>Lecturers</Text>
            </View>
            <FlatList
              data={lecturers}
              keyExtractor={item => item.id}
              renderItem={renderUserItem}
            />
            <View style={styles.sectionHeaderContainer}>
              <Text style={styles.sectionHeader}>Admins</Text>
            </View>
            <FlatList
              data={admins}
              keyExtractor={item => item.id}
              renderItem={renderUserItem}
            />
          </>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F0F2',
    marginTop: 45,
  },
  navbar: {
    backgroundColor: '#151B54',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navbarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#FF4C4C',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginVertical: 10,
  },
  loadingText: {
    flex: 1,
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
    color: '#666',
  },
  sectionHeaderContainer: {
    backgroundColor: '#151B54',
    padding: 10,
  },
  sectionHeader: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  userInfo: {
    flexDirection: 'column',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  userRole: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF4C4C',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default AdminDashboard;