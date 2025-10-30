// Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js"
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js"
import { getFirestore, addDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js"

const firebaseConfig = {
  apiKey: "AIzaSyCCOUhkqJILjR1qmfmQAfmQ-WkeSvnIFR0",
  authDomain: "invest-9731f.firebaseapp.com",
  databaseURL: "https://invest-9731f-default-rtdb.firebaseio.com",
  projectId: "invest-9731f",
  storageBucket: "invest-9731f.firebasestorage.app",
  messagingSenderId: "1054310074316",
  appId: "1:1054310074316:web:9f43c69e75163655873f69",
  measurementId: "G-M0F5TK590L",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

export { app, auth, db, addDoc, signOut }
