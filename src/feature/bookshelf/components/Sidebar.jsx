import React from "react";
import {
  ChevronRight,
  ChevronLeft,
  Calendar,
  LayoutGrid,
  ListTodo,
  Target,
} from "lucide-react";
import { useGoalStore } from "../stores/useGoalStore";

export const Sidebar = () => {
  const {
    isSidebarOpen,
    setSidebarOpen,
    selectedTimeframe,
    setSelectedTimeframe,
  } = useGoalStore();

  const timeframes = [
    { id: "Yearly", icon: <Target size={20} />, label: "Tahun Ini" },
    { id: "Monthly", icon: <Calendar size={20} />, label: "Bulan Ini" },
    { id: "Weekly", icon: <LayoutGrid size={20} />, label: "Minggu Ini" },
    { id: "Daily", icon: <ListTodo size={20} />, label: "Hari Ini" },
  ];

  return (
    <aside
      onClick={(e) => e.stopPropagation()}
      className={`fixed left-0 top-0 h-screen transition-all duration-500 ease-in-out z-50 ${
        isSidebarOpen ? "w-80" : "w-0"
      }`}
    >
      <div
        className={`absolute top-0 left-0 w-full h-full bg-[#0b0b0b] border-r border-white/5 flex flex-col transition-all duration-500 ease-in-out overflow-hidden shadow-2xl ${isSidebarOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full pointer-events-none"}`}
      >
        <div className="p-6 flex flex-col gap-8 h-full">
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">
              Timeframe Planner
            </h2>
            <p className="text-gray-400 text-xs text-balance">
              Petakan targetmu dan capai goalsmu secara bertahap.
            </p>
          </div>

          <nav className="flex flex-col gap-3">
            {timeframes.map((tf) => (
              <button
                key={tf.id}
                onClick={() => setSelectedTimeframe(tf.id)}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all border whitespace-nowrap ${
                  selectedTimeframe === tf.id
                    ? "bg-lime-300/10 border-lime-300/30 text-lime-300 shadow-[0_0_20px_rgba(190,242,100,0.1)]"
                    : "bg-white/5 border-transparent text-gray-400 hover:bg-white/10"
                }`}
              >
                <span
                  className={
                    selectedTimeframe === tf.id
                      ? "text-lime-300"
                      : "text-gray-500"
                  }
                >
                  {tf.icon}
                </span>
                <span className="font-semibold text-sm">{tf.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto p-5 rounded-3xl bg-gradient-to-br from-teal-500/10 to-transparent border border-white/5">
            <p className="text-[10px] text-gray-500 font-medium">STATISTIK</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">45%</span>
              <span className="text-xs text-lime-300 font-bold whitespace-nowrap">
                Goal Tercapai
              </span>
            </div>
            <div className="mt-3 w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-lime-300 w-[45%]" />
            </div>
          </div>
        </div>
      </div>

      {/* Toggle Button Container overlaying on the right of sidebar border */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSidebarOpen(!isSidebarOpen);
        }}
        className={`fixed top-20 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-lime-300 hover:bg-lime-300 hover:text-black transition-all duration-500 ease-in-out backdrop-blur-3xl z-50 ${isSidebarOpen ? "left-[300px]" : "left-6"}`}
      >
        {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>
    </aside>
  );
};
