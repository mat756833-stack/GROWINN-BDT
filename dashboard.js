import { auth, db, addDoc, signOut } from "./firebase.js"
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js"
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js"

let currentUser = null

// Initialize Dashboard
export function initDashboard() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser = user
      console.log("[v0] Loading dashboard for user:", user.uid)
      await loadUserStats()
      await loadRecentActivity()
      await loadInvestments()
      await loadDeposits()
      await loadWithdrawals()
      await loadReferrals()
    } else {
      console.log("[v0] User not authenticated, redirecting to login")
      window.location.href = "index.html"
    }
  })
}

// Load User Stats (Balance, Profit, etc.)
async function loadUserStats() {
  try {
    const userRef = doc(db, "users", currentUser.uid)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      const userData = userSnap.data()

      // Update Dashboard Stats
      document.getElementById("dash-balance").textContent = "৳" + userData.balance.toLocaleString("bn-BD")
      document.getElementById("dash-profit").textContent = "৳" + userData.dailyProfit.toLocaleString("bn-BD")
      document.getElementById("dash-active").textContent = userData.activePlans || 0
      document.getElementById("dash-deposits").textContent = "৳" + userData.totalDeposits.toLocaleString("bn-BD")
      document.getElementById("dash-withdrawals").textContent = "৳" + userData.totalWithdrawals.toLocaleString("bn-BD")

      console.log("[v0] User stats loaded")
    }
  } catch (error) {
    console.error("[v0] Error loading user stats:", error)
  }
}

// Load Recent Activity
async function loadRecentActivity() {
  try {
    const tbody = document.querySelector("#recent-activity tbody")
    if (!tbody) return

    tbody.innerHTML = ""

    // Get recent deposits
    const depositsQuery = query(collection(db, "deposits"), where("uid", "==", currentUser.uid))
    const depositsSnap = await getDocs(depositsQuery)

    depositsSnap.forEach((doc) => {
      const data = doc.data()
      const row = document.createElement("tr")
      row.innerHTML = `
        <td>${new Date(data.date.toDate()).toLocaleDateString("bn-BD")}</td>
        <td>Deposit</td>
        <td>৳${data.amount.toLocaleString("bn-BD")}</td>
        <td><span class="badge badge-success">${data.status}</span></td>
      `
      tbody.appendChild(row)
    })

    console.log("[v0] Recent activity loaded")
  } catch (error) {
    console.error("[v0] Error loading recent activity:", error)
  }
}

// Load Investments
async function loadInvestments() {
  try {
    const tbody = document.querySelector("#investments-table tbody")
    if (!tbody) return

    tbody.innerHTML = ""

    const investmentsQuery = query(collection(db, "investments"), where("uid", "==", currentUser.uid))
    const investmentsSnap = await getDocs(investmentsQuery)

    investmentsSnap.forEach((doc) => {
      const data = doc.data()
      const row = document.createElement("tr")
      row.innerHTML = `
        <td>৳${data.amount.toLocaleString("bn-BD")}</td>
        <td>${(data.rate * 100).toFixed(2)}%</td>
        <td>${data.duration} days</td>
        <td>৳${data.dailyProfit.toLocaleString("bn-BD")}</td>
        <td><span class="badge badge-info">${data.status}</span></td>
      `
      tbody.appendChild(row)
    })

    console.log("[v0] Investments loaded")
  } catch (error) {
    console.error("[v0] Error loading investments:", error)
  }
}

// Load Deposits History
async function loadDeposits() {
  try {
    const tbody = document.querySelector("#deposit-table tbody")
    if (!tbody) return

    tbody.innerHTML = ""

    const depositsQuery = query(collection(db, "deposits"), where("uid", "==", currentUser.uid))
    const depositsSnap = await getDocs(depositsQuery)

    depositsSnap.forEach((doc) => {
      const data = doc.data()
      const row = document.createElement("tr")
      row.innerHTML = `
        <td>${new Date(data.date.toDate()).toLocaleDateString("bn-BD")}</td>
        <td>${data.method.toUpperCase()}</td>
        <td>${data.phone}</td>
        <td>৳${data.amount.toLocaleString("bn-BD")}</td>
        <td><span class="badge badge-success">${data.status}</span></td>
      `
      tbody.appendChild(row)
    })

    console.log("[v0] Deposits history loaded")
  } catch (error) {
    console.error("[v0] Error loading deposits:", error)
  }
}

// Load Withdrawals History
async function loadWithdrawals() {
  try {
    const tbody = document.querySelector("#withdraw-table tbody")
    if (!tbody) return

    tbody.innerHTML = ""

    const withdrawalsQuery = query(collection(db, "withdrawals"), where("uid", "==", currentUser.uid))
    const withdrawalsSnap = await getDocs(withdrawalsQuery)

    withdrawalsSnap.forEach((doc) => {
      const data = doc.data()
      const row = document.createElement("tr")
      row.innerHTML = `
        <td>${new Date(data.date.toDate()).toLocaleDateString("bn-BD")}</td>
        <td>${data.method.toUpperCase()}</td>
        <td>${data.phone}</td>
        <td>৳${data.amount.toLocaleString("bn-BD")}</td>
        <td><span class="badge badge-warning">${data.status}</span></td>
      `
      tbody.appendChild(row)
    })

    console.log("[v0] Withdrawals history loaded")
  } catch (error) {
    console.error("[v0] Error loading withdrawals:", error)
  }
}

// Load Referrals
async function loadReferrals() {
  try {
    const tbody = document.querySelector("#referral-table tbody")
    if (!tbody) return

    tbody.innerHTML = ""

    const referralsQuery = query(collection(db, "referrals"), where("referrerId", "==", currentUser.uid))
    const referralsSnap = await getDocs(referralsQuery)

    let totalBonus = 0
    referralsSnap.forEach((doc) => {
      const data = doc.data()
      totalBonus += data.income || 0

      const row = document.createElement("tr")
      row.innerHTML = `
        <td>${data.referredPhone}</td>
        <td>৳${data.income.toLocaleString("bn-BD")}</td>
        <td>${new Date(data.date.toDate()).toLocaleDateString("bn-BD")}</td>
      `
      tbody.appendChild(row)
    })

    // Update referral stats if elements exist
    const totalReferredEl = document.getElementById("total-referred")
    const totalBonusEl = document.getElementById("total-bonus")

    if (totalReferredEl) totalReferredEl.textContent = referralsSnap.size
    if (totalBonusEl) totalBonusEl.textContent = "৳" + totalBonus.toLocaleString("bn-BD")

    console.log("[v0] Referrals loaded")
  } catch (error) {
    console.error("[v0] Error loading referrals:", error)
  }
}

// Handle Deposit Form Submission
export function setupDepositForm() {
  const form = document.getElementById("deposit-form")
  if (!form) return

  form.addEventListener("submit", async (e) => {
    e.preventDefault()

    const amount = document.getElementById("deposit-amount").value
    const phone = document.getElementById("deposit-phone").value
    const trxId = document.getElementById("deposit-trx").value
    const method = document.querySelector(".method-btn.active")?.dataset.method || "bkash"

    try {
      // Add deposit to Firestore
      const depositsRef = collection(db, "deposits")
      await addDoc(depositsRef, {
        uid: currentUser.uid,
        amount: Number.parseFloat(amount),
        method: method,
        phone: phone,
        trxId: trxId,
        status: "Pending",
        date: new Date(),
      })

      alert("Deposit request submitted successfully!")
      form.reset()
      await loadDeposits()
      await loadRecentActivity()
    } catch (error) {
      console.error("[v0] Error submitting deposit:", error)
      alert("Error submitting deposit: " + error.message)
    }
  })
}

// Handle Withdraw Form Submission
export function setupWithdrawForm() {
  const form = document.getElementById("withdraw-form")
  if (!form) return

  form.addEventListener("submit", async (e) => {
    e.preventDefault()

    const amount = document.getElementById("withdraw-amount").value
    const phone = document.getElementById("withdraw-phone").value
    const method = document.querySelector(".method-btn.active")?.dataset.method || "bkash"

    try {
      // Add withdrawal to Firestore
      const withdrawalsRef = collection(db, "withdrawals")
      await addDoc(withdrawalsRef, {
        uid: currentUser.uid,
        amount: Number.parseFloat(amount),
        method: method,
        phone: phone,
        status: "Pending",
        date: new Date(),
      })

      alert("Withdrawal request submitted successfully!")
      form.reset()
      await loadWithdrawals()
      await loadRecentActivity()
    } catch (error) {
      console.error("[v0] Error submitting withdrawal:", error)
      alert("Error submitting withdrawal: " + error.message)
    }
  })
}

// Handle Logout
export function setupLogout() {
  const logoutBtn = document.getElementById("logout-btn")
  if (!logoutBtn) return

  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth)
      window.location.href = "index.html"
    } catch (error) {
      console.error("[v0] Logout error:", error)
    }
  })
}
