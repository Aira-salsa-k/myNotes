import { useState } from "react";
import {
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Calendar,
  LayoutGrid,
  ListTodo,
  Target,
  LogOut,
  User,
  Repeat
} from "lucide-react";
import { useGoalStore } from "../stores/useGoalStore";
import { useAuthStore } from "../../auth/stores/useAuthStore";
import { GridPattern } from "../../../components/ui/grid-pattern";
import { cn } from "../../../lib/utils";

export const Sidebar = () => {
  const {
    isSidebarOpen,
    setSidebarOpen,
    selectedTimeframe,
    setSelectedTimeframe,
    currentView,
    setCurrentView,
  } = useGoalStore();
  const { user, logout } = useAuthStore();
  const [isGoalsExpanded, setIsGoalsExpanded] = useState(true);

  const handleMenuClick = (action) => {
    action();
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const timeframes = [
    { id: "Yearly", icon: <Target size={20} />, label: "Tahun Ini" },
    { id: "Monthly", icon: <Calendar size={20} />, label: "Bulan Ini" },
    { id: "Weekly", icon: <LayoutGrid size={20} />, label: "Minggu Ini" },
    { id: "Daily", icon: <ListTodo size={20} />, label: "Hari Ini" },
  ];

  return (
    <aside
      onClick={(e) => e.stopPropagation()}
      className={`fixed lg:left-0 lg:right-auto right-0 top-0 h-screen transition-all duration-500 ease-in-out z-50 ${
        isSidebarOpen ? "w-72 lg:w-80" : "w-0"
      }`}
    >
      <div
        className={`absolute top-0 w-full h-full bg-[#0b0b0b] flex flex-col transition-all duration-500 ease-in-out overflow-hidden shadow-2xl ${
          isSidebarOpen
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-full lg:-translate-x-full pointer-events-none"
        } right-0 lg:right-auto lg:left-0 border-l lg:border-r lg:border-l-0 border-white/5`}
      >
        <GridPattern
          width={65}
          height={65}
          strokeDasharray={"2 2"}
          className={cn(
            "[mask-image:linear-gradient(to_top,transparent,white_20%,white_20%,transparent)]",
            "opacity-22",
          )}
        />
        <div className="p-6 flex flex-col h-full relative z-10 overflow-hidden">
          {/* Header - Fixed */}
          <div className="flex flex-col gap-2 mb-8 flex-shrink-0">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">
              Timeframe Planner
            </h2>
            <p className="text-gray-400 text-xs text-balance">
              Petakan targetmu dan capai goalsmu secara bertahap.
            </p>
          </div>

          {/* Middle Section - Scrollable */}
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
            
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setIsGoalsExpanded(!isGoalsExpanded)}
                className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-widest px-2 py-2 hover:text-lime-300 transition-colors"
              >
                <span>Goals Planner</span>
                {isGoalsExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              
              {isGoalsExpanded && (
                <nav className="flex flex-col gap-3 pl-3 border-l border-white/5 ml-2">
                  {timeframes.map((tf) => (
                    <button
                      key={tf.id}
                      onClick={() => handleMenuClick(() => setSelectedTimeframe(tf.id))}
                      className={`flex items-center gap-4 px-4 py-4 rounded-lg transition-all border whitespace-nowrap ${
                        currentView === "planner" && selectedTimeframe === tf.id
                          ? "bg-lime-300/10 border-lime-300/40 text-lime-300 shadow-[0_0_30px_rgba(190,242,100,0.15)]"
                          : "bg-white/[0.03] border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/10"
                      }`}
                    >
                      <span
                        className={
                          currentView === "planner" && selectedTimeframe === tf.id
                            ? "text-lime-300"
                            : "text-gray-500"
                        }
                      >
                        {tf.icon}
                      </span>
                      <span className="font-bold text-sm tracking-tight">
                        {tf.label}
                      </span>
                    </button>
                  ))}
                </nav>
              )}
            </div>

            <nav className="flex flex-col gap-3">
              <button
                onClick={() => handleMenuClick(() => setCurrentView("routine"))}
                className={`flex items-center gap-4 px-5 py-5 rounded-lg transition-all border whitespace-nowrap ${
                  currentView === "routine"
                    ? "bg-lime-300/10 border-lime-300/40 text-lime-300 shadow-[0_0_30px_rgba(190,242,100,0.15)]"
                    : "bg-white/[0.03] border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/10"
                }`}
              >
                <span className={currentView === "routine" ? "text-lime-300" : "text-gray-500"}>
                  <Repeat size={20} />
                </span>
                <span className="font-bold text-sm tracking-tight">
                  Daily Routine
                </span>
              </button>

              <button
                onClick={() => handleMenuClick(() => setCurrentView("pomodoro"))}
                className={`flex items-center gap-4 px-5 py-5 rounded-lg transition-all border whitespace-nowrap ${
                  currentView === "pomodoro"
                    ? "bg-lime-300/10 border-lime-300/40 text-lime-300 shadow-[0_0_30px_rgba(190,242,100,0.15)]"
                    : "bg-white/[0.03] border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/10"
                }`}
              >
                <span className={currentView === "pomodoro" ? "text-lime-300" : "text-gray-500"}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </span>
                <span className="font-bold text-sm tracking-tight">
                  Rekapan Waktu
                </span>
              </button>
            </nav>

          {/* Dynamic Statistics */}
          {(() => {
            const timeframeGoals = useGoalStore
              .getState()
              .goals.filter((g) => g.timeframe === selectedTimeframe);
            const completedCount = timeframeGoals.filter(
              (g) => g.isComplete,
            ).length;
            const totalCount = timeframeGoals.length;
            const percentage =
              totalCount > 0
                ? Math.round((completedCount / totalCount) * 100)
                : 0;

            return (
              <div className="mt-auto p-5 rounded-3xl bg-gradient-to-br from-teal-500/10 to-transparent border border-white/5">
                <p className="text-[10px] text-gray-500 font-medium">
                  STATISTIK {selectedTimeframe.toUpperCase()}
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">
                    {percentage}%
                  </span>
                  <span className="text-xs text-lime-300 font-bold whitespace-nowrap">
                    Goal Tercapai
                  </span>
                </div>
                <div className="mt-3 w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-lime-300 transition-all duration-1000 ease-out"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-[9px] text-gray-600 mt-2 font-medium">
                  {completedCount} dari {totalCount} target selesai
                </p>
              </div>
            );
          })()}
          </div>

          {/* Footer - Fixed */}
          {user && (
            <div className="mt-auto pt-4 border-t border-white/5 flex-shrink-0">
              <div className="flex items-center gap-3 p-2 rounded-2xl bg-white/5 hover:bg-white/[0.08] transition-all group">
                <div className="w-8 h-8 rounded-full bg-lime-300/10 flex items-center justify-center text-lime-300 flex-shrink-0">
                  <User size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate pr-2">
                    {user.email}
                  </p>
                </div>
                <button
                  onClick={logout}
                  title="Keluar"
                  className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all flex-shrink-0"
                >
                  <LogOut size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toggle Button Container overlaying on the right of sidebar border */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSidebarOpen(!isSidebarOpen);
        }}
        className={`fixed top-76 lg:top-20 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-lime-300 hover:bg-lime-300 hover:text-black transition-all duration-500 ease-in-out backdrop-blur-3xl z-50 ${
          isSidebarOpen
            ? "right-[300px] lg:left-[300px] lg:right-auto"
            : "right-6 lg:left-6 lg:right-auto"
        }`}
      >
        {isSidebarOpen ? (
          <>
            <ChevronLeft size={20} className="hidden lg:block" />
            <ChevronRight size={20} className="block lg:hidden" />
          </>
        ) : (
          <>
            <ChevronRight size={20} className="hidden lg:block" />
            <ChevronLeft size={20} className="block lg:hidden" />
          </>
        )}
      </button>
    </aside>
  );
};
