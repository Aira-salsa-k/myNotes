import React, { useState } from "react";
import { GoalForm } from "./components/GoalForm";
import { SearchBar } from "./components/SearchBar";
import { GoalList } from "./components/GoalList";
import { Sidebar } from "./components/Sidebar";
import { Target, Plus } from "lucide-react";
import { useGoalStore } from "./stores/useGoalStore";
import { GridPattern } from "../../components/ui/grid-pattern";
import { Footer } from "../../components/ui/footer";
import { cn } from "../../lib/utils";

export default function GoalPlannerFeature() {
  const [editingGoal, setEditingGoal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isSidebarOpen, selectedTimeframe, setSidebarOpen, isGoalsLoading } =
    useGoalStore();

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingGoal(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingGoal(null);
    setIsModalOpen(false);
  };

  return (
    <div
      className="bg-[#0b0b0b] min-h-screen text-white relative overflow-x-hidden selection:bg-lime-500/30 selection:text-lime-200"
      onClick={() => isSidebarOpen && setSidebarOpen(false)}
    >
      <Sidebar />

      {/* Background Patterns & Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <GridPattern
          width={60}
          height={60}
          strokeDasharray={"4 4"}
          className={cn(
            "[mask-image:linear-gradient(to_right,white,transparent_50%,white)]",
            "opacity-20",
          )}
        />
        {/* Background Glows */}
        <div className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-[400px] h-[250px] bg-gradient-to-tr from-lime-500 via-lime-300 to-white opacity-15 blur-[70px] rounded-[40%]"></div>
        <div className="absolute bottom-1/20 right-0 transform -translate-y-[20%] translate-x-1/2 w-[200px] h-[250px] bg-gradient-to-tr from-lime-500 via-lime-300 to-white opacity-8 blur-[70px] rounded-[100%]"></div>
      </div>
      {/* Header */}
      <header
        className={`sticky top-0 z-40 bg-[#0b0b0b]/60 backdrop-blur-xl border-b border-white/5 transition-all duration-500 ease-in-out w-full overflow-hidden ${isSidebarOpen ? "pl-80" : "pl-0"}`}
      >
        <div className="max-w-[1600px] mx-auto px-6 py-6 font-bold relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
            <h1 className="text-3xl font-black flex items-center gap-3">
              <Target className="text-lime-300 animate-pulse" size={32} />
              <div className="flex flex-col leading-tight">
                <span className="text-white text-2xl font-bold tracking-tight">
                  Goal
                </span>
                <span className="text-lime-300 text-[10px] font-black tracking-widest uppercase opacity-70">
                  /planner
                </span>
              </div>
            </h1>
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              <div className="w-full md:w-auto min-w-[300px]">
                <SearchBar />
              </div>
              <button
                onClick={handleAdd}
                className="w-full md:w-auto hover:bg-lime-300 hover:text-black transition-all bg-lime-300/10 text-lime-300 px-6 py-3 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold border border-lime-300/20 whitespace-nowrap shadow-lg shadow-lime-300/5 hover:shadow-lime-300/20"
              >
                <Plus size={18} /> Tambah Goal Baru
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={`transition-all duration-500 ease-in-out py-12 relative z-10 w-full ${isSidebarOpen ? "pl-80" : "pl-0"}`}
      >
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="mb-12 flex items-center gap-4">
            <span className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black text-lime-300 uppercase tracking-widest">
              {selectedTimeframe} Mode
            </span>
            <div className="h-px bg-white/10 flex-grow"></div>
          </div>
          <div id="library" className="flex-col ">
            {isGoalsLoading ? (
              <div className="w-full flex items-center justify-center py-20">
                <div className="animate-spin h-8 w-8 border-b-2 border-lime-300 rounded-full"></div>
              </div>
            ) : (
              <GoalList onEdit={handleEdit} />
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-white/5 backdrop-blur-[2px]"
            onClick={closeModal}
          ></div>
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl z-10 custom-scrollbar shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10">
            <GoalForm editData={editingGoal} onCloseEdit={closeModal} />
          </div>
        </div>
      )}
    </div>
  );
}
