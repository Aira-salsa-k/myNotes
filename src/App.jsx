import { useEffect } from "react";
import GoalPlannerFeature from "./feature/bookshelf/GoalPlannerFeature";
import { AuthFeature } from "./feature/auth/AuthFeature";
import { useAuthStore } from "./feature/auth/stores/useAuthStore";
import { useGoalStore } from "./feature/bookshelf/stores/useGoalStore";
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
    } else {
      useGoalStore.getState().clearGoals();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center text-lime-300">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-300"></div>
      </div>
    );
  }

  return <>{user ? <GoalPlannerFeature /> : <AuthFeature />}</>;
}

export default App;
