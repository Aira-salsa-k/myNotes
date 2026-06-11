import React, { useState, useEffect } from "react";
import { Play, Pause, Square, Timer, Coffee, X } from "lucide-react";
import { usePomodoroStore } from "../stores/usePomodoroStore";

export const PomodoroTimer = () => {
  const {
    activeGoal,
    timeLeft,
    isRunning,
    isBreakTime,
    startTimer,
    pauseTimer,
    stopTimer,
    setActiveGoal,
    sessions
  } = usePomodoroStore();

  if (!activeGoal) return null;

  // Calculate total time spent on this specific task
  const totalTimeSpent = sessions
    ? sessions
        .filter(session => session.goalId === activeGoal?.id)
        .reduce((total, session) => total + session.duration, 0)
    : 0;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = isBreakTime 
    ? ((5 * 60 - timeLeft) / (5 * 60)) * 100 
    : ((25 * 60 - timeLeft) / (25 * 60)) * 100;

  const formatTotalTime = (seconds) => {
    if (seconds === 0) return "0m";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}j ${m}m`;
    return `${m}m`;
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] w-80 bg-[#121212] border border-white/10 rounded-3xl p-5 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl">
      <div className="absolute inset-0 bg-gradient-to-tr from-lime-500/5 to-transparent rounded-3xl pointer-events-none" />
      
      <div className="relative z-10 flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            {isBreakTime ? (
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                <Coffee size={14} />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-lime-500/20 flex items-center justify-center text-lime-400">
                <Timer size={14} />
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {isBreakTime ? "Waktu Istirahat" : "Pomodoro Aktif"}
              </span>
              <span className="text-sm font-black text-white line-clamp-1 pr-4">
                {activeGoal.title}
              </span>
              <span className="text-[10px] text-lime-300/80 font-semibold">
                Total: {formatTotalTime(totalTimeSpent)}
              </span>
            </div>
          </div>
          <button 
            onClick={() => setActiveGoal(null)}
            className="p-1.5 text-gray-500 hover:text-white transition-colors hover:bg-white/10 rounded-full"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex items-end justify-center py-4 mb-2">
          <span className={`text-6xl font-black tabular-nums tracking-tighter ${isBreakTime ? "text-blue-400" : "text-lime-300"}`}>
            {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-6 relative">
          <div 
            className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-linear ${isBreakTime ? "bg-blue-400" : "bg-lime-300"}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-center gap-4">
          {!isRunning ? (
            <button
              onClick={startTimer}
              className={`flex items-center justify-center gap-2 flex-1 py-3 rounded-2xl font-bold text-sm transition-all ${
                isBreakTime 
                  ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/20" 
                  : "bg-lime-300 text-black hover:bg-lime-400 border border-lime-300 shadow-[0_0_20px_rgba(190,242,100,0.3)]"
              }`}
            >
              <Play size={16} fill="currentColor" /> Mulai
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="flex items-center justify-center gap-2 flex-1 py-3 rounded-2xl font-bold text-sm bg-white/10 text-white hover:bg-white/20 border border-white/10 transition-all"
            >
              <Pause size={16} fill="currentColor" /> Pause
            </button>
          )}
          
          <button
            onClick={stopTimer}
            className="p-3 rounded-2xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all flex items-center justify-center"
            title="Stop Timer"
          >
            <Square size={16} fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
};
