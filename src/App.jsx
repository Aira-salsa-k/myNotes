import { useEffect } from "react";
import GoalPlannerFeature from "./feature/bookshelf/GoalPlannerFeature";
import { AuthFeature } from "./feature/auth/AuthFeature";
import { useAuthStore } from "./feature/auth/stores/useAuthStore";
import { useGoalStore } from "./feature/bookshelf/stores/useGoalStore";
import { usePomodoroStore } from "./feature/bookshelf/stores/usePomodoroStore";
import { useRoutineStore } from "./feature/bookshelf/stores/useRoutineStore";
import { LoadingState } from "./feature/bookshelf/components/LoadingState";
import "./App.css";

function App() {
  const { user, isLoading, initializeAuth } = useAuthStore();

  useEffect(() => {
    const unsubscribe = initializeAuth();
    return () => unsubscribe();
  }, [initializeAuth]);

  useEffect(() => {
    if (user) {
      useGoalStore.getState().initializeGoals();
      useGoalStore.getState().initializeCategories();
      usePomodoroStore.getState().initializeSessions();
      useRoutineStore.getState().initializeRoutines();
    } else {
      useGoalStore.getState().clearGoals();
      usePomodoroStore.getState().clearSessions();
      useRoutineStore.getState().clearRoutines();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center text-lime-300">
        <LoadingState message="menyiapkan aplikasi" />
      </div>
    );
  }

  return <>{user ? <GoalPlannerFeature /> : <AuthFeature />}</>;
}

export default App;
