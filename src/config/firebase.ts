
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // You'll need to replace this with your actual API key
  authDomain: "your-project-id.firebaseapp.com", // Replace with your actual auth domain
  projectId: "your-project-id", // Replace with your actual project ID
  storageBucket: "your-project-id.appspot.com", // Replace with your actual storage bucket
  messagingSenderId: "425198427847",
  appId: "1:425198427847:web:your-app-id", // Replace with your actual app ID
  measurementId: "G-XXXXXXXXXX" // Replace with your actual measurement ID
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
export const isDevelopment = window.location.hostname.includes('lovable.dev') || 
                            window.location.hostname === 'localhost';

// Connect to emulator in development
if (isDevelopment && !db._delegate._databaseId.projectId.includes('demo-')) {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
  } catch (error) {
    console.log('Firestore emulator already connected or not available');
  }
}
