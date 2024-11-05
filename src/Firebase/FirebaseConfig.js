import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const FirebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_KEY,
    authDomain: import.meta.env.VITE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
    appId:import.meta.env.VITE_APP_ID,
  };
  

const app = initializeApp(FirebaseConfig);
const secondaryApp = initializeApp(FirebaseConfig,"Secondary")
const auth = getAuth(app);
const secondaryAuth = getAuth(secondaryApp)
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, FirebaseConfig ,db, storage,secondaryAuth};