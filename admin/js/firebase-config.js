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

// Initialize Firebase App using the v8 compat library
const app = firebase.initializeApp(firebaseConfig);


const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();