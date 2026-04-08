import { create } from "zustand";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../../../lib/firebase";

export const useAuthStore = create((set) => ({
  user: null,
  isLoading: true,
  error: null,

  // Setup auth listener
  initializeAuth: () => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      set({ user, isLoading: false });
    });
    return unsubscribe;
  },

  register: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // User will be automatically picked up by onAuthStateChanged
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await signOut(auth);
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  resetPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await sendPasswordResetEmail(auth, email);
      set({ isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
