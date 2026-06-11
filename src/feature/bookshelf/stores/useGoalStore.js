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
  currentView: "routine", // "planner", "pomodoro" or "routine"
  isSidebarOpen: true,
  isGoalsLoading: true,
  unsubscribeGoals: null,

  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  setSelectedTimeframe: (timeframe) => set({ selectedTimeframe: timeframe, currentView: "planner" }),
  setCurrentView: (view) => set({ currentView: view }),
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
    const { unsubscribeGoals, unsubscribeCategories } = get();
    if (unsubscribeGoals) unsubscribeGoals();
    if (unsubscribeCategories) unsubscribeCategories();
    set({ 
      goals: [], 
      categories: [],
      unsubscribeGoals: null, 
      unsubscribeCategories: null,
      isGoalsLoading: true,
      isCategoriesLoading: true,
      hasSeededCategories: false
    });
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
    const currentGoal = get().goals.find((g) => g.id === id);
    let finalUpdatedGoal = { ...updatedGoal };

    if (currentGoal && updatedGoal.timeframe && updatedGoal.timeframe !== currentGoal.timeframe) {
      const allowedPeriods = TIMEFRAME_PERIODS[updatedGoal.timeframe] || [];
      const currentPeriod = updatedGoal.period || currentGoal.period;
      if (currentPeriod !== UNASSIGNED_PERIOD && !allowedPeriods.includes(currentPeriod)) {
        finalUpdatedGoal.period = UNASSIGNED_PERIOD;
      }
    }

    // Optimistic UI
    set((state) => ({
      goals: state.goals.map((goal) =>
        goal.id === id ? { ...goal, ...finalUpdatedGoal } : goal,
      ),
    }));

    try {
      const goalRef = doc(db, "goals", id);
      await updateDoc(goalRef, finalUpdatedGoal);
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

  // Categories State
  categories: [],
  isCategoriesLoading: true,
  unsubscribeCategories: null,
  hasSeededCategories: false,

  initializeCategories: () => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "goalCategories"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const catData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Seed defaults if empty and haven't seeded yet
      if (snapshot.empty && !get().hasSeededCategories) {
        set({ hasSeededCategories: true });
        const defaults = [
          { key: "work", name: "Work", color: "text-cyan-400 border-cyan-400/20 bg-cyan-400/10" },
          { key: "kuliah", name: "Kuliah", color: "text-indigo-400 border-indigo-400/20 bg-indigo-400/10" },
          { key: "home", name: "Home", color: "text-amber-200 border-amber-400/20 bg-amber-400/10" },
        ];
        
        try {
          const batch = writeBatch(db);
          defaults.forEach(cat => {
            // Use deterministic ID to prevent duplicates
            const catRef = doc(db, "goalCategories", `${user.uid}_${cat.key}`);
            batch.set(catRef, {
              name: cat.name,
              color: cat.color,
              userId: user.uid,
              createdAt: serverTimestamp(),
            });
          });
          await batch.commit();
        } catch (error) {
          console.error("Error seeding categories:", error);
          set({ hasSeededCategories: false });
        }
        return; 
      }

      set({ categories: catData, isCategoriesLoading: false });
    });

    set({ unsubscribeCategories: unsubscribe });
  },

  addCategory: async (category) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await addDoc(collection(db, "goalCategories"), {
        ...category,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error adding category:", error);
    }
  },

  updateCategory: async (id, updatedCategory) => {
    try {
      const catRef = doc(db, "goalCategories", id);
      await updateDoc(catRef, updatedCategory);
    } catch (error) {
      console.error("Error updating category:", error);
    }
  },

  deleteCategory: async (id) => {
    try {
      const catRef = doc(db, "goalCategories", id);
      await deleteDoc(catRef);
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  },
}));
