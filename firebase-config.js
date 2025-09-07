// Firebase Configuration for Angkor Compliance Platform
// Compatible with Firebase v9 CDN imports

// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyBqOzXXZJEsKsDEp8A2foFxEOi-EJ4eTI4",
  authDomain: "angkor-compliance-53a5b.firebaseapp.com",
  projectId: "angkor-compliance-53a5b",
  storageBucket: "angkor-compliance-53a5b.appspot.com",
  messagingSenderId: "75963971757",
  appId: "1:75963971757:web:b316be1852d1851e082e24"
};

// Initialize Firebase services
let app, auth, db, storage;

// Firebase service getters
function getFirebaseApp() {
  if (!app && window.firebase) {
    app = window.firebase.initializeApp(firebaseConfig);
  }
  return app;
}

function getFirebaseAuth() {
  if (!auth) {
    const firebaseApp = getFirebaseApp();
    if (firebaseApp && window.firebase) {
      auth = window.firebase.auth(firebaseApp);
    }
  }
  return auth;
}

function getFirebaseFirestore() {
  if (!db) {
    const firebaseApp = getFirebaseApp();
    if (firebaseApp && window.firebase) {
      db = window.firebase.firestore(firebaseApp);
    }
  }
  return db;
}

function getFirebaseStorage() {
  if (!storage) {
    const firebaseApp = getFirebaseApp();
    if (firebaseApp && window.firebase) {
      storage = window.firebase.storage(firebaseApp);
    }
  }
  return storage;
}

// Initialize Firebase function (for backward compatibility)
function initializeFirebase() {
  return window.Firebase.initialize();
}

// Make Firebase available globally
window.Firebase = {
  // Configuration
  config: firebaseConfig,
  
  // Service getters
  getApp: getFirebaseApp,
  getAuth: getFirebaseAuth,
  getFirestore: getFirebaseFirestore,
  getStorage: getFirebaseStorage,
  
  // Direct service access
  get auth() { return getFirebaseAuth(); },
  get db() { return getFirebaseFirestore(); },
  get storage() { return getFirebaseStorage(); },
  get app() { return getFirebaseApp(); },
  
  // Utility functions
  isAvailable() {
    return !!(window.firebase && getFirebaseApp());
  },
  
  // Initialize function
  initialize() {
    if (window.firebase) {
      app = getFirebaseApp();
      auth = getFirebaseAuth();
      db = getFirebaseFirestore();
      storage = getFirebaseStorage();
      console.log('✅ Firebase initialized successfully');
      return true;
    } else {
      console.warn('⚠️ Firebase CDN not loaded - using fallback mode');
      return false;
    }
  }
};

// Make individual services available globally
window.getFirebaseApp = getFirebaseApp;
window.getFirebaseAuth = getFirebaseAuth;
window.getFirebaseFirestore = getFirebaseFirestore;
window.getFirebaseStorage = getFirebaseStorage;
window.initializeFirebase = initializeFirebase;

// Auto-initialize if Firebase is available
if (typeof window !== 'undefined' && window.firebase) {
  window.Firebase.initialize();
}

console.log('✅ Firebase configuration loaded (npm package compatible)');
