import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, ScrollView, Dimensions } from 'react-native';
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from './FirebaseConfig';

const RegisterScreen = ({ navigation }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isStudent, setIsStudent] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (errorMessage) {
      const timeout = setTimeout(() => setErrorMessage(''), 5000);
      return () => clearTimeout(timeout);
    }
  }, [errorMessage]);

  const handleRegister = async () => {
    const role = isStudent ? 'Student' : 'Lecturer';

    if (!name || !email || !password || !phone) {
      setErrorMessage('All fields are required.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Send verification email
      await sendEmailVerification(user);

      // Add user data to Firestore
      const userRef = collection(db, 'users');
      await addDoc(userRef, {
        name,
        email,
        phone,
        role,
        uid: user.uid,
      });

      Alert.alert('Success', 'Registration complete! Please verify your email before logging in.');
      setIsLoginMode(true); // Switch to login mode
    } catch (error) {
      console.error('Firebase Error:', error);
      if (error.code === 'auth/weak-password') {
        setErrorMessage('Password should be at least 6 characters long.');
      } else if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('The email address is already in use.');
      } else if (error.code === 'auth/invalid-email') {
        setErrorMessage('The email address is not valid.');
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if the email is verified
      if (!user.emailVerified) {
        setErrorMessage('Please verify your email before logging in.');
        await auth.signOut();
        return;
      }

      // Fetch user role from Firestore
      const userRef = collection(db, 'users');
      const q = query(userRef, where('uid', '==', user.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        const role = userData.role;

        Alert.alert('Success', 'Logged in successfully!');

        // Redirect based on role
        switch (role) {
          case 'Student':
            navigation.replace('StudentSec/Home');
            break;
          case 'Lecturer':
            navigation.replace('LecturerSec/Home');
            break;
          case 'Admin':
            navigation.replace('AdminDashboard');
            break;
          default:
            setErrorMessage('User role not recognized. Please contact support.');
        }
      } else {
        setErrorMessage('User data not found. Please contact support.');
      }
    } catch (error) {
      console.error('Firebase Error:', error);
      if (error.code === 'auth/user-not-found') {
        setErrorMessage('No user found with this email.');
      } else if (error.code === 'auth/wrong-password') {
        setErrorMessage('Incorrect password.');
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setErrorMessage('Please enter your email to reset your password.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Password Reset', 'A password reset link has been sent to your email.');
    } catch (error) {
      console.error('Firebase Error:', error);
      setErrorMessage('Failed to send password reset email. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.header}>{isLoginMode ? 'Login' : 'Create an Account'}</Text>

        {!isLoginMode && (
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#ccc"
            value={name}
            onChangeText={setName}
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#ccc"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#ccc"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {!isLoginMode && (
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor="#ccc"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        )}

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        {!isLoginMode && (
          <View style={styles.checkboxGroup}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setIsStudent(true)}
            >
              <View style={[styles.checkbox, isStudent && styles.checkedCheckbox]} />
              <Text style={styles.checkboxLabel}>Register as Student</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setIsStudent(false)}
            >
              <View
                style={[styles.checkbox, !isStudent && styles.checkedCheckbox]}
              />
              <Text style={styles.checkboxLabel}>Register as Lecturer</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={isLoginMode ? handleLogin : handleRegister}
        >
          <Text style={styles.buttonText}>{isLoginMode ? 'Login' : 'Register'}</Text>
        </TouchableOpacity>

        {isLoginMode && (
          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => setIsLoginMode(!isLoginMode)}>
          <Text style={styles.toggleText}>
            {isLoginMode
              ? "Don't have an account? Register"
              : 'Already have an account? Login'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  inner: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#151B54',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
    color: '#151B54',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  checkboxGroup: {
    marginVertical: 20,
    width: '100%',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#151B54',
    marginRight: 10,
    borderRadius: 3,
  },
  checkedCheckbox: {
    backgroundColor: '#151B54',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#151B54',
    flexShrink: 1,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#151B54',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotPasswordText: {
    color: '#151B54',
    fontSize: 16,
    marginTop: 10,
  },
  toggleText: {
    color: '#151B54',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
});

export default RegisterScreen;