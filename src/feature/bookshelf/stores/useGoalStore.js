import { create } from "zustand";
import { persist } from "zustand/middleware";

const DUMMY_GOALS = [
  {
    id: 1,
    title: "Selesaikan Projek Skripsi",
    description: "Menyelesaikan Bab 4 dan 5 sebelum sidang akhir.",
    category: "Kuliah",
    timeframe: "Yearly",
    isComplete: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Belajar Next.js",
    description: "Mempelajari App Router dan Server Actions.",
    category: "Kerjaan",
    timeframe: "Monthly",
    isComplete: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: "Beres-beres Gudang",
    description: "Memilah barang yang sudah tidak terpakai.",
    category: "Rumahan",
    timeframe: "Weekly",
    isComplete: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    title: "Workout 30 Menit",
    description: "Cardio dan light strength training.",
    category: "Rumahan",
    timeframe: "Daily",
    isComplete: true,
    createdAt: new Date().toISOString(),
  },
];

export const useGoalStore = create(
  persist(
    (set) => ({
      goals: DUMMY_GOALS,
      searchQuery: "",
      selectedTimeframe: "Daily",
      isSidebarOpen: true,

      setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
      setSelectedTimeframe: (timeframe) =>
        set({ selectedTimeframe: timeframe }),

      addGoal: (goal) =>
        set((state) => ({
          goals: [
            ...state.goals,
            { ...goal, id: Date.now(), createdAt: new Date().toISOString() },
          ],
        })),

      updateGoal: (id, updatedGoal) =>
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id ? { ...goal, ...updatedGoal } : goal,
          ),
        })),

      deleteGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter((goal) => goal.id !== id),
        })),

      toggleGoalStatus: (id) =>
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id ? { ...goal, isComplete: !goal.isComplete } : goal,
          ),
        })),

      setGoals: (newGoals) => set({ goals: newGoals }),
      setSearchQuery: (query) => set({ searchQuery: query }),
    }),
    {
      name: "GOAL_PLANNER",
    },
  ),
);
