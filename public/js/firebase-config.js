// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBIa6IIz5bx7SLQuv4jQiEc2UOZnZXVIS4",
  authDomain: "agronovex.firebaseapp.com",
  projectId: "agronovex",
  storageBucket: "agronovex.firebasestorage.app",
  messagingSenderId: "682615382223",
  appId: "1:682615382223:web:490073ed100cd323b5d7ba",
  measurementId: "G-0837LFCRHT"
};

console.log(firebaseConfig)
const app = firebase.initializeApp(firebaseConfig)
// Initialize Firebase
window.auth  = app.auth();
window.db = app.firestore();
window.storage = app.storage();