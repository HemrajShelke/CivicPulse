import { User } from "../types";
import { db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { handleFirestoreError, OperationType } from "../utils/firestoreErrorHandler";

// Helper to load state from localStorage
const getStoredUser = (): User | null => {
  const stored = localStorage.getItem("civic_user");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
};

let currentListeners: (() => void)[] = [];

export const authStore = {
  user: getStoredUser(),

  subscribe(listener: () => void) {
    currentListeners.push(listener);
    return () => {
      currentListeners = currentListeners.filter(l => l !== listener);
    };
  },

  notify() {
    currentListeners.forEach(listener => listener());
  },

  async signIn(name: string, email: string, city: string, ward: string, uid?: string, photoURL?: string) {
    let userId = uid;
    let existingUser: User | null = null;

    // If no stable uid is provided but an email is, look up by email first to keep data persistent across devices!
    if (!userId && email) {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          userId = docSnap.id;
          existingUser = docSnap.data() as User;
        }
      } catch (e) {
        console.error("Error looking up user by email in Firestore:", e);
      }
    }

    if (!userId) {
      userId = "user-" + Date.now();
    }

    try {
      const userDocRef = doc(db, "users", userId);
      const userSnapshot = await getDoc(userDocRef);
      if (userSnapshot.exists()) {
        existingUser = userSnapshot.data() as User;
      }
    } catch (e) {
      console.error("Error reading user from firestore:", e);
      handleFirestoreError(e, OperationType.GET, "users/" + userId);
    }

    const finalUser: User = {
      uid: userId,
      name: name || existingUser?.name || "Civic Hero",
      email: email || existingUser?.email || "",
      photoURL: photoURL || existingUser?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name || "Hero")}`,
      ward: ward || existingUser?.ward || "General Ward",
      city: city || existingUser?.city || "Mumbai",
      karmaPoints: existingUser?.karmaPoints !== undefined ? existingUser.karmaPoints : 100,
      streak: existingUser?.streak !== undefined ? existingUser.streak : 1,
      reportedCount: existingUser?.reportedCount !== undefined ? existingUser.reportedCount : 0
    };

    this.user = finalUser;
    localStorage.setItem("civic_user", JSON.stringify(finalUser));

    try {
      const userDocRef = doc(db, "users", userId);
      await setDoc(userDocRef, finalUser, { merge: true });
    } catch (e) {
      console.error("Error writing user to firestore:", e);
      handleFirestoreError(e, OperationType.WRITE, "users/" + userId);
    }

    this.notify();
    return finalUser;
  },

  signOut() {
    this.user = null;
    localStorage.removeItem("civic_user");
    this.notify();
  },

  async addKarma(points: number) {
    if (this.user) {
      this.user.karmaPoints += points;
      localStorage.setItem("civic_user", JSON.stringify(this.user));
      this.notify();

      try {
        const userDocRef = doc(db, "users", this.user.uid);
        await updateDoc(userDocRef, { karmaPoints: this.user.karmaPoints });
      } catch (e) {
        console.error("Error updating karma in Firestore:", e);
        handleFirestoreError(e, OperationType.WRITE, "users/" + this.user.uid);
      }
    }
  },

  async incrementReports() {
    if (this.user) {
      this.user.reportedCount += 1;
      this.user.karmaPoints += 50; // reward for reporting
      this.user.streak += 1; // boost streak
      localStorage.setItem("civic_user", JSON.stringify(this.user));
      this.notify();

      try {
        const userDocRef = doc(db, "users", this.user.uid);
        await setDoc(userDocRef, {
          reportedCount: this.user.reportedCount,
          karmaPoints: this.user.karmaPoints,
          streak: this.user.streak
        }, { merge: true });
      } catch (e) {
        console.error("Error updating reports in Firestore:", e);
        handleFirestoreError(e, OperationType.WRITE, "users/" + this.user.uid);
      }
    }
  }
};

// React hook to use the auth store easily
import { useState, useEffect } from "react";

export function useAuthStore() {
  const [user, setUser] = useState<User | null>(authStore.user);

  useEffect(() => {
    const unsubscribe = authStore.subscribe(() => {
      setUser(authStore.user);
    });
    return unsubscribe;
  }, []);

  return {
    user,
    userData: user,
    signInUser: (name: string, email: string, city: string, ward: string, uid?: string, photoURL?: string) => authStore.signIn(name, email, city, ward, uid, photoURL),
    signOutUser: () => authStore.signOut(),
    addKarma: (points: number) => authStore.addKarma(points),
    incrementReports: () => authStore.incrementReports()
  };
}
