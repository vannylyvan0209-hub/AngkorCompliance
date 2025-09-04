// Firebase v12+ Configuration using ES6 modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile, 
  sendPasswordResetEmail, 
  EmailAuthProvider, 
  reauthenticateWithCredential, 
  updatePassword 
} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  serverTimestamp, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  writeBatch 
} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js';

// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyBqOzXXZJEsKsDEp8A2foFxEOi-EJ4eTI4",
  authDomain: "angkor-compliance-53a5b.firebaseapp.com",
  projectId: "angkor-compliance-53a5b",
  storageBucket: "angkor-compliance-53a5b.appspot.com",
  messagingSenderId: "75963971757",
  appId: "1:75963971757:web:b316be1852d1851e082e24"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export Firebase services and functions
export const Firebase = {
  // Services
  auth,
  db,
  storage,
  app,
  
  // Auth functions
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  
  // Firestore functions
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  writeBatch
};

// Also export individual services for direct import
export { auth, db, storage, app };

console.log('✅ Firebase v12 initialized successfully with ES6 modules');
