const { default: firebase } = require("firebase/compat/app");

//configuring firebase attributes
const firebaseConfig = {
  apiKey: "AIzaSyBIa6IIz5bx7SLQuv4jQiEc2UOZnZXVIS4",
  authDomain: "agronovex.firebaseapp.com",
  projectId: "agronovex",
  storageBucket: "agronovex.firebasestorage.app",
  messagingSenderId: "682615382223",
  appId: "1:682615382223:web:490073ed100cd323b5d7ba",
  measurementId: "G-0837LFCRHT"
};

// Initialize Firebase App
// This must use the Firebase v9 Compat SDKs linked in your HTML (firebase-app-compat.js)
const app = firebase.initializeApp(firebaseConfig);

// Initializing and exporting the core services used across the project
// The admin-auth.js file requires 'auth'
// The public-news.js file requires 'db'
// The admin-crud.js file requires 'auth', 'db', and 'storage'
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();