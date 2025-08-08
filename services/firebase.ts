import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { Auth, getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCVgg653oikNPfUxHvOPQEG1iwnAEZ_RVY",
  authDomain: "mehayom-e400b.firebaseapp.com",
  projectId: "mehayom-e400b",
  storageBucket: "mehayom-e400b.firebasestorage.app",
  messagingSenderId: "311596941398",
  appId: "1:311596941398:web:474f40d8bf454b3a237bf7",
  measurementId: "G-2NY7QQFSGM"
};

const app = initializeApp(firebaseConfig);

let auth: Auth;
try {
  auth = getAuth(app);
} catch (e) {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

export { auth };
export const db = getFirestore(app); 