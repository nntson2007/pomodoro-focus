// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// --- PASTE YOUR CONFIG HERE ---
const firebaseConfig = {
    apiKey: "AIzaSyBtLoL4iuu03bZa5GFdZfnGMRwSobo0Bws",
    authDomain: "pomodoro-focus-41574.firebaseapp.com",
    projectId: "pomodoro-focus-41574",
    storageBucket: "pomodoro-focus-41574.firebasestorage.app",
    messagingSenderId: "858362115636",
    appId: "1:858362115636:web:8f71dcf80c4b90ca65bc61"
};
// ------------------------------

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the tools we need
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);