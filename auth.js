import { auth, db } from "./firebase.js"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js"
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js"

// Register Function
export async function registerUser(email, password, name, phone) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const uid = userCredential.user.uid

    // Create user document in Firestore
    await setDoc(doc(db, "users", uid), {
      name: name,
      email: email,
      phone: phone,
      balance: 0,
      dailyProfit: 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
      activePlans: 0,
      createdAt: new Date(),
    })

    console.log("[v0] User registered successfully:", uid)
    return { success: true, uid: uid }
  } catch (error) {
    console.error("[v0] Registration error:", error.message)
    return { success: false, error: error.message }
  }
}

// Login Function
export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    console.log("[v0] User logged in:", userCredential.user.uid)
    return { success: true, uid: userCredential.user.uid }
  } catch (error) {
    console.error("[v0] Login error:", error.message)
    return { success: false, error: error.message }
  }
}

// Logout Function
export async function logoutUser() {
  try {
    await signOut(auth)
    console.log("[v0] User logged out")
    return { success: true }
  } catch (error) {
    console.error("[v0] Logout error:", error.message)
    return { success: false, error: error.message }
  }
}

// Check Auth State
export function checkAuthState(callback) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("[v0] User is logged in:", user.uid)
      callback(user)
    } else {
      console.log("[v0] User is logged out")
      callback(null)
    }
  })
}

// Get Current User
export function getCurrentUser() {
  return auth.currentUser
}
