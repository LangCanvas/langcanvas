
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBpmUCou786tHZ2yJpDNzQL7-rIjobMTdE",
  authDomain: "langcanvas.firebaseapp.com",
  projectId: "langcanvas",
  storageBucket: "langcanvas.firebasestorage.app",
  messagingSenderId: "882832843852",
  appId: "1:882832843852:web:ad7d4a261136ab7274c0e9",
  measurementId: "G-KDTWVNE39J"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Analytics (only in browser environment)
let analytics: any = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { analytics };

// Environment detection
export const isDevelopment = typeof window !== 'undefined' && 
                            (window.location.hostname.includes('lovable.dev') || 
                             window.location.hostname === 'localhost');

// Connect to emulator in development
if (isDevelopment && typeof window !== 'undefined') {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
  } catch (error) {
    console.log('Firestore emulator already connected or not available');
  }
}
