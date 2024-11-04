import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const FirebaseConfig = {
    apiKey: "AIzaSyCqxA4rLnwJB4hY41a-aaQtU2Sf6iehP2A",
    authDomain: "attendance-system-c0f83.firebaseapp.com",
    projectId: "attendance-system-c0f83",
    storageBucket: "attendance-system-c0f83.appspot.com",
    messagingSenderId: "766110167204",
    appId: "1:766110167204:web:ea9134da951388091d3631"
  };
  

const app = initializeApp(FirebaseConfig);
const secondaryApp = initializeApp(FirebaseConfig,"Secondary")
const auth = getAuth(app);
const secondaryAuth = getAuth(secondaryApp)
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, FirebaseConfig ,db, storage,secondaryAuth};