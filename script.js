
import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// Replace these values with your Firebase web app configuration.
const firebaseConfig = {
  apiKey: "AIzaSyB27HL1iLWOBWYo-FMUfHjeLrXm1qbndus",
  authDomain: "remoteshut-974df.firebaseapp.com",
  projectId: "remoteshut-974df",
  storageBucket: "remoteshut-974df.firebasestorage.app",
  messagingSenderId: "228348681702",
  appId: "1:228348681702:web:0f41ddb55ef1b049624a27"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const loginForm = document.getElementById("loginForm");
const dashboard = document.getElementById("dashboard");
const loginMessage = document.getElementById("loginMessage");
const commandMessage = document.getElementById("commandMessage");
const shutdownBtn = document.getElementById("shutdownBtn");
const logoutBtn = document.getElementById("logoutBtn");

let sendingCommand = false;

// Sign in with your Firebase user account.
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    loginMessage.textContent = "Signing in...";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        loginMessage.textContent = "";
        loginForm.reset();
    } catch (error) {
        console.error("Sign-in failed:", error.code);
        loginMessage.textContent =
            "Sign-in failed. Check your credentials and Firebase setup.";
    }
});

// Show the dashboard only for a signed-in user.
onAuthStateChanged(auth, (user) => {
    loginForm.hidden = Boolean(user);
    dashboard.hidden = !user;

    if (!user) {
        commandMessage.textContent = "";
    }
});

// Create a shutdown request; this does not shut down the laptop yet.
shutdownBtn.addEventListener("click", async () => {
    const user = auth.currentUser;

    if (!user || sendingCommand) return;

    const confirmed = window.confirm(
        "Request shutdown of your registered laptop? Save your work first."
    );

    if (!confirmed) return;

    sendingCommand = true;
    shutdownBtn.disabled = true;
    commandMessage.textContent = "Sending request...";

    try {
        await addDoc(collection(db, "commands"), {
            uid: user.uid,
            action: "shutdown",
            targetDeviceId: "my-windows-laptop",
            status: "pending",
            createdAt: serverTimestamp(),
            expireAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        commandMessage.textContent =
            "Request saved in Firebase. Laptop execution is not connected yet.";
    } catch (error) {
        console.error("Command request failed:", error.code);
        commandMessage.textContent =
            "Could not save the request. Check your connection and Firebase rules.";
    } finally {
        sendingCommand = false;
        shutdownBtn.disabled = false;
    }
});

logoutBtn.addEventListener("click", async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Sign-out failed:", error.code);
        commandMessage.textContent = "Could not sign out. Try again.";
    }
});
