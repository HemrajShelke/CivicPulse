import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAVIrFqKquLQd3hQD-eZ6EnzKwxrs76uQE",
  authDomain: "unique-region-kjk7s.firebaseapp.com",
  projectId: "unique-region-kjk7s",
  storageBucket: "unique-region-kjk7s.firebasestorage.app",
  messagingSenderId: "991031736120",
  appId: "1:991031736120:web:a93c4d30a6a4b94a56b3cd"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-955a37ad-8d25-4ab3-acb4-4b2dfef88cc6");
export const googleProvider = new GoogleAuthProvider();

export { signInWithPopup };
