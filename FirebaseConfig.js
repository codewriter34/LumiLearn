import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBuokJdZE9qtrE0oNfg8KrbdTh5diqMsY8',
  authDomain: 'lumi-learn.firebaseapp.com',
  projectId: 'lumi-learn',
  storageBucket: 'lumi-learn.appspot.com',
  messagingSenderId: '661927450087',
  appId: '1:661927450087:web:2eac3dcf330fc0eadb1942',
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with React Native Persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// Initialize Firestore
const db = getFirestore(app);

export { app, auth, db };
