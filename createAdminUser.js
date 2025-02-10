const admin = require('firebase-admin');
const path = require('path');

// Set the path to your service account key file
const serviceAccountPath = path.resolve('C:\\Users\\HP\\Downloads\\lumi-learn-firebase-adminsdk-fbsvc-d9c5c1f346.json');

// Initialize Firebase Admin SDK
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const auth = admin.auth();
const db = admin.firestore();

async function createAdminUser() {
  const email = 'admin23@gmail.com';
  const password = '1234567890';
  const adminUser = {
    name: 'Admin',
    email: email,
    phone: '1234567890',
    role: 'Admin',
  };

  try {
    // Create user in Firebase Authentication
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      emailVerified: true, 
      displayName: adminUser.name,
    });

    // Add user data to Firestore
    await db.collection('users').doc(userRecord.uid).set({
      ...adminUser,
      uid: userRecord.uid,
    });

    console.log('Admin user created and added to Firestore successfully');
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdminUser();