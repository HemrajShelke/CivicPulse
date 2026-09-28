import { CivicIssue, Comment } from "../types";
import { db } from "../firebase";
import { collection, doc, getDocs, setDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import { handleFirestoreError, OperationType } from "../utils/firestoreErrorHandler";

let currentListeners: (() => void)[] = [];

export const issueStore = {
  issues: [] as CivicIssue[],
  loading: false,
  error: null as string | null,
  unsubscribeSync: null as (() => void) | null,

  subscribe(listener: () => void) {
    currentListeners.push(listener);
    return () => {
      currentListeners = currentListeners.filter(l => l !== listener);
    };
  },

  notify() {
    currentListeners.forEach(listener => listener());
  },

  async fetchIssues() {
    this.loading = true;
    this.error = null;
    this.notify();

    try {
      // 1. Initial Seeding Check (using single getDocs first to seed if empty)
      let querySnapshot;
      try {
        querySnapshot = await getDocs(query(collection(db, "issues"), orderBy("createdAt", "desc")));
      } catch (err: any) {
        handleFirestoreError(err, OperationType.LIST, "issues");
      }

      const list: CivicIssue[] = [];
      querySnapshot.forEach((doc) => {
        list.push(doc.data() as CivicIssue);
      });

      if (list.length === 0) {
        const response = await fetch("/api/issues");
        const json = await response.json();
        if (json.success && json.data && json.data.length > 0) {
          const seeds = json.data as CivicIssue[];
          for (const s of seeds) {
            try {
              await setDoc(doc(db, "issues", s.id), s);
            } catch (seedErr) {
              console.error("Error seeding issue:", s.id, seedErr);
            }
          }
        }
      }

      // 2. Setup Real-time listener if not already listening
      if (!this.unsubscribeSync) {
        const q = query(collection(db, "issues"), orderBy("createdAt", "desc"));
        this.unsubscribeSync = onSnapshot(q, (snapshot) => {
          const updatedList: CivicIssue[] = [];
          snapshot.forEach((doc) => {
            updatedList.push(doc.data() as CivicIssue);
          });
          this.issues = updatedList;
          this.notify();
        }, (err) => {
          console.error("Real-time issues sync error:", err);
        });
      }
    } catch (err: any) {
      console.error("fetchIssues real-time setup error, falling back to local api:", err);
      try {
        const response = await fetch("/api/issues");
        const json = await response.json();
        if (json.success) {
          this.issues = json.data;
        } else {
          throw new Error(json.message || "Failed to load issues");
        }
      } catch (fallbackErr: any) {
        this.error = fallbackErr.message || "Could not retrieve civic issues.";
      }
    } finally {
      this.loading = false;
      this.notify();
    }
  },

  async reportIssue(payload: Partial<CivicIssue>) {
    this.loading = true;
    this.notify();

    try {
      const response = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await response.json();
      if (json.success) {
        const newIssue = json.data as CivicIssue;
        
        // Save to Firestore!
        try {
          await setDoc(doc(db, "issues", newIssue.id), newIssue);
        } catch (fsErr) {
          console.error("Firestore save error on report:", fsErr);
          handleFirestoreError(fsErr, OperationType.WRITE, "issues/" + newIssue.id);
        }

        this.issues.unshift(newIssue);
        return { success: true, data: newIssue };
      } else {
        throw new Error(json.message || "Failed to submit civic report");
      }
    } catch (err: any) {
      console.error("reportIssue error:", err);
      return { success: false, error: err.message };
    } finally {
      this.loading = false;
      this.notify();
    }
  },

  async voteIssue(id: string) {
    try {
      const response = await fetch(`/api/issues/${id}/vote`, { method: "POST" });
      const json = await response.json();
      if (json.success) {
        this.issues = this.issues.map(issue => {
          if (issue.id === id) {
            const updatedIssue = {
              ...issue,
              votes: json.votes,
              karmaPoints: json.karmaPoints
            };

            // Sync with Firestore
            setDoc(doc(db, "issues", id), updatedIssue, { merge: true })
              .catch(err => {
                console.error("Firestore vote update error:", err);
                handleFirestoreError(err, OperationType.WRITE, "issues/" + id);
              });

            return updatedIssue;
          }
          return issue;
        });
        this.notify();
        return true;
      }
    } catch (err) {
      console.error("voteIssue error:", err);
    }
    return false;
  },

  async addComment(id: string, author: string, text: string) {
    try {
      const response = await fetch(`/api/issues/${id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author, text })
      });
      const json = await response.json();
      if (json.success) {
        this.issues = this.issues.map(issue => {
          if (issue.id === id) {
            const updatedIssue = {
              ...issue,
              comments: [...issue.comments, json.data]
            };

            // Sync with Firestore
            setDoc(doc(db, "issues", id), updatedIssue, { merge: true })
              .catch(err => {
                console.error("Firestore comment update error:", err);
                handleFirestoreError(err, OperationType.WRITE, "issues/" + id);
              });

            return updatedIssue;
          }
          return issue;
        });
        this.notify();
        return true;
      }
    } catch (err) {
      console.error("addComment error:", err);
    }
    return false;
  },

  async updateStatus(id: string, status: "Reported" | "In Progress" | "Resolved", remarks?: string) {
    try {
      const response = await fetch(`/api/issues/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, remarks })
      });
      const json = await response.json();
      if (json.success) {
        this.issues = this.issues.map(issue => {
          if (issue.id === id) {
            const updatedIssue = json.data;

            // Sync with Firestore
            setDoc(doc(db, "issues", id), updatedIssue)
              .catch(err => {
                console.error("Firestore status update error:", err);
                handleFirestoreError(err, OperationType.WRITE, "issues/" + id);
              });

            return updatedIssue;
          }
          return issue;
        });
        this.notify();
        return true;
      }
    } catch (err) {
      console.error("updateStatus error:", err);
    }
    return false;
  }
};

import { useState, useEffect } from "react";

export function useIssueStore() {
  const [issues, setIssues] = useState<CivicIssue[]>(issueStore.issues);
  const [loading, setLoading] = useState<boolean>(issueStore.loading);
  const [error, setError] = useState<string | null>(issueStore.error);

  useEffect(() => {
    const unsubscribe = issueStore.subscribe(() => {
      setIssues([...issueStore.issues]);
      setLoading(issueStore.loading);
      setError(issueStore.error);
    });

    // Auto-fetch if empty
    if (issueStore.issues.length === 0) {
      issueStore.fetchIssues();
    }

    return unsubscribe;
  }, []);

  return {
    issues,
    loading,
    error,
    fetchIssues: () => issueStore.fetchIssues(),
    reportIssue: (payload: Partial<CivicIssue>) => issueStore.reportIssue(payload),
    voteIssue: (id: string) => issueStore.voteIssue(id),
    addComment: (id: string, author: string, text: string) => issueStore.addComment(id, author, text),
    updateStatus: (id: string, status: "Reported" | "In Progress" | "Resolved", remarks?: string) => issueStore.updateStatus(id, status, remarks)
  };
}
