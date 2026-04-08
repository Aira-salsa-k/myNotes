import { create } from "zustand";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db, auth } from "../../../lib/firebase";

export const UNASSIGNED_PERIOD = "Unassigned";

export const TIMEFRAME_PERIODS = {
  Yearly: [],
  Monthly: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  Weekly: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"],
  Daily: ["Pagi", "Siang", "Sore", "Malam"],
};

export const useGoalStore = create((set, get) => ({
  goals: [],
  searchQuery: "",
  selectedTimeframe: "Daily",
  selectedYear: new Date().getFullYear(),
  isSidebarOpen: true,
  isGoalsLoading: true,
  unsubscribeGoals: null,

  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  setSelectedTimeframe: (timeframe) => set({ selectedTimeframe: timeframe }),
  setSelectedYear: (year) => set({ selectedYear: year }),

  initializeGoals: () => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "goals"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const goalsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Sort by orderIndex if needed, or by createdAt
      goalsData.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
      set({ goals: goalsData, isGoalsLoading: false });
    });

    set({ unsubscribeGoals: unsubscribe });
  },

  clearGoals: () => {
    const { unsubscribeGoals } = get();
    if (unsubscribeGoals) unsubscribeGoals();
    set({ goals: [], unsubscribeGoals: null, isGoalsLoading: true });
  },

  addGoal: async (goal) => {
    const user = auth.currentUser;
    if (!user) return;

    const newGoal = {
      ...goal,
      userId: user.uid,
      period: goal.period || UNASSIGNED_PERIOD,
      targetYear: goal.targetYear || get().selectedYear,
      createdAt: new Date().toISOString(),
      orderIndex: get().goals.length, // initial order
    };

    // Optimistic UI
    const tempId = Date.now().toString();
    set((state) => ({ goals: [...state.goals, { id: tempId, ...newGoal }] }));

    try {
      await addDoc(collection(db, "goals"), newGoal);
    } catch (error) {
      console.error("Error adding goal:", error);
    }
  },

  updateGoal: async (id, updatedGoal) => {
    // Optimistic UI
    set((state) => ({
      goals: state.goals.map((goal) =>
        goal.id === id ? { ...goal, ...updatedGoal } : goal,
      ),
    }));

    try {
      const goalRef = doc(db, "goals", id);
      await updateDoc(goalRef, updatedGoal);
    } catch (error) {
      console.error("Error updating goal:", error);
    }
  },

  updateGoalPeriod: async (id, newPeriod) => {
    // Optimistic UI
    set((state) => ({
      goals: state.goals.map((goal) =>
        goal.id === id ? { ...goal, period: newPeriod } : goal,
      ),
    }));

    try {
      const goalRef = doc(db, "goals", id);
      await updateDoc(goalRef, { period: newPeriod });
    } catch (error) {
      console.error("Error updating goal period:", error);
    }
  },

  deleteGoal: async (id) => {
    // Optimistic UI
    set((state) => ({
      goals: state.goals.filter((goal) => goal.id !== id),
    }));

    try {
      const goalRef = doc(db, "goals", id);
      await deleteDoc(goalRef);
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  },

  toggleGoalStatus: async (id) => {
    const goal = get().goals.find((g) => g.id === id);
    if (!goal) return;

    const newStatus = !goal.isComplete;

    // Optimistic UI
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === id ? { ...g, isComplete: newStatus } : g,
      ),
    }));

    try {
      const goalRef = doc(db, "goals", id);
      await updateDoc(goalRef, { isComplete: newStatus });
    } catch (error) {
      console.error("Error toggling goal status:", error);
    }
  },

  setGoals: async (newGoals) => {
    // Optimistic Reordering UI
    set({ goals: newGoals });

    // Batch update orderIndex in Firestore
    try {
      const batch = writeBatch(db);
      newGoals.forEach((goal, index) => {
        if (!goal.id.includes(Date.now().toString().slice(0, 5))) {
          // Avoid updating temp IDs
          const goalRef = doc(db, "goals", goal.id);
          batch.update(goalRef, { orderIndex: index });
        }
      });
      await batch.commit();
    } catch (error) {
      console.error("Error reordering goals:", error);
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
}));
