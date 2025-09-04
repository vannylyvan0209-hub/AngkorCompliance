// Firebase v9+ Configuration using CDN scripts
// This file should be loaded with <script type="module">

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
const app = firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth(app);
const db = firebase.firestore(app);
const storage = firebase.storage(app);

// Export Firebase services and functions to global object
window.Firebase = {
  auth,
  db,
  storage,
  app,
  // Auth functions - bind the functions to the auth instance
  signInWithEmailAndPassword: (email, password) => firebase.auth.signInWithEmailAndPassword(auth, email, password),
  createUserWithEmailAndPassword: (email, password) => firebase.auth.createUserWithEmailAndPassword(auth, email, password),
  signOut: () => firebase.auth.signOut(auth),
  onAuthStateChanged: (callback) => firebase.auth.onAuthStateChanged(auth, callback),
  updateProfile: (user, profile) => firebase.auth.updateProfile(user, profile),
  sendPasswordResetEmail: (email) => firebase.auth.sendPasswordResetEmail(auth, email),
  EmailAuthProvider: firebase.auth.EmailAuthProvider,
  reauthenticateWithCredential: (user, credential) => firebase.auth.reauthenticateWithCredential(user, credential),
  updatePassword: (user, password) => firebase.auth.updatePassword(user, password),
  // Firestore functions - bind the functions to the db instance
  doc: (collectionRef, path) => firebase.firestore.doc(collectionRef, path),
  setDoc: (docRef, data) => firebase.firestore.setDoc(docRef, data),
  getDoc: (docRef) => firebase.firestore.getDoc(docRef),
  updateDoc: (docRef, data) => firebase.firestore.updateDoc(docRef, data),
  collection: (db, path) => firebase.firestore.collection(db, path),
  query: (collectionRef, ...queryConstraints) => firebase.firestore.query(collectionRef, ...queryConstraints),
  where: (fieldPath, opStr, value) => firebase.firestore.where(fieldPath, opStr, value),
  getDocs: (query) => firebase.firestore.getDocs(query),
  serverTimestamp: () => firebase.firestore.FieldValue.serverTimestamp(),
  orderBy: (fieldPath, directionStr) => firebase.firestore.orderBy(fieldPath, directionStr),
  onSnapshot: (query, observer) => firebase.firestore.onSnapshot(query, observer),
  addDoc: (collectionRef, data) => firebase.firestore.addDoc(collectionRef, data),
  deleteDoc: (docRef) => firebase.firestore.deleteDoc(docRef),
  writeBatch: (db) => firebase.firestore.writeBatch(db)
};

console.log('✅ Firebase initialized successfully');
