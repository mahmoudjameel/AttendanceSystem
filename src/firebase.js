import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAzY6WVHdZrECAIOaXO7Vyyz23Udzm2bfg",
  apiKey: "AIzaSyAP9i2BRZsSieiXrb7N0O28QPTPLjLuXRA",
  authDomain: "toqsallll.firebaseapp.com",
  databaseURL: "https://toqsallll-default-rtdb.firebaseio.com",
  projectId: "toqsallll",
  storageBucket: "toqsallll.firebasestorage.app",
  messagingSenderId: "713233113931",
  appId: "1:713233113931:web:3b3c4b56cb49dba5497ece",
  measurementId: "G-5D0Z4S7N60"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// إضافة معالجة الأخطاء
export const initializeFirestore = () => {
  try {
    return db;
  } catch (error) {
    console.error('خطأ في تهيئة Firestore:', error);
    return null;
  }
};

export default app;
