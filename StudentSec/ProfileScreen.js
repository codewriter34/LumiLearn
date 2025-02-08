import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from '../FirebaseConfig';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';

const ProfileScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('English');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setName(userData.name);
          setEmail(userData.email);
          setImageUri(userData.imageUri);
          setDarkMode(userData.darkMode || false);
          setNotificationsEnabled(userData.notificationsEnabled || true);
        } else {
          // Create a new document if it doesn't exist
          await setDoc(userDocRef, {
            name: '',
            email: user.email,
            imageUri: null,
            darkMode: false,
            notificationsEnabled: true,
          });
          setEmail(user.email);
        }
      }
    };
    fetchUserData();
  }, []);

  const handleImageUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      // Save the new image URI to Firestore
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          imageUri: uri,
        });
      }
    }
  };

  const handleSaveChanges = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          name: name,
          email: email,
          darkMode: darkMode,
          notificationsEnabled: notificationsEnabled,
          language: language,
        });
        Alert.alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Failed to update profile. Please try again.');
    }
  };

  return (
    <ScrollView style={[styles.container, darkMode && styles.darkBackground]}>
      {/* Profile Picture */}
      <View style={styles.profileSection}>
        <Image 
          source={imageUri ? { uri: imageUri } : { uri: 'https://randomuser.me/api/portraits/men/41.jpg' }} 
          style={styles.profileImage} 
        />
        <TouchableOpacity style={styles.editIcon} onPress={handleImageUpload}>
          <Ionicons name="camera" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Editable Profile Fields */}
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />
        
        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} keyboardType="email-address" onChangeText={setEmail} />
      </View>

      <View style={styles.separator}></View>

      {/* Language Change Section */}
      <TouchableOpacity style={styles.card} onPress={() => { /* Add language change logic here */ }}>
        <Text style={styles.sectionTitle}>Language</Text>
        <View style={styles.cardRow}>
          <Text style={styles.cardText}>{language}</Text>
          <Ionicons name="chevron-forward" size={20} color="#4A90E2" />
        </View>
      </TouchableOpacity>

      <View style={styles.separator}></View>

      {/* Dark Mode Toggle */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Dark Mode</Text>
        <Switch value={darkMode} onValueChange={() => setDarkMode(!darkMode)} />
      </View>

      <View style={styles.separator}></View>

      {/* Notification Settings */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <Switch value={notificationsEnabled} onValueChange={() => setNotificationsEnabled(!notificationsEnabled)} />
      </View>

      <View style={styles.separator}></View>

      {/* Privacy Settings */}
      <TouchableOpacity style={styles.card} onPress={() => { /* Add privacy settings logic here */ }}>
        <Text style={styles.sectionTitle}>Privacy Settings</Text>
        <View style={styles.cardRow}>
          <Ionicons name="chevron-forward" size={20} color="#4A90E2" />
        </View>
      </TouchableOpacity>

      <View style={styles.separator}></View>

      {/* Change Password */}
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ChangePassword')}>
        <Text style={styles.sectionTitle}>Change Password</Text>
        <View style={styles.cardRow}>
          <Ionicons name="chevron-forward" size={20} color="#4A90E2" />
        </View>
      </TouchableOpacity>

      <View style={styles.separator}></View>

      {/* Contact Support */}
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ContactSupport')}>
        <Text style={styles.sectionTitle}>Contact Support</Text>
        <View style={styles.cardRow}>
          <Ionicons name="chevron-forward" size={20} color="#4A90E2" />
        </View>
      </TouchableOpacity>

      <View style={styles.separator}></View>

      {/* About */}
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('About')}>
        <Text style={styles.sectionTitle}>About This App</Text>
        <View style={styles.cardRow}>
          <Ionicons name="chevron-forward" size={20} color="#4A90E2" />
        </View>
      </TouchableOpacity>

      <View style={styles.separator}></View>

      {/* Save Changes Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutButton} onPress={() => auth.signOut()}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9',
  },
  darkBackground: {
    backgroundColor: '#1E1E1E',
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#4A90E2',
  },
  editIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#4A90E2',
    padding: 8,
    borderRadius: 20,
  },
  infoContainer: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardText: {
    fontSize: 14,
    color: '#4A90E2',
    marginRight: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginHorizontal: 16,
  },
  saveButton: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    margin: 16,
  },
  logoutButton: {
    backgroundColor: '#D9534F',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    margin: 16,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ProfileScreen;