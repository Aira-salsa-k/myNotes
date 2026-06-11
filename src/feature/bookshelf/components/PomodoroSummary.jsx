import React, { useState, useMemo } from "react";
import { usePomodoroStore } from "../stores/usePomodoroStore";
import { useGoalStore } from "../stores/useGoalStore";
import { Timer, Bookmark, Calendar as CalendarIcon, Pencil, X, Check, Clock } from "lucide-react";

export const PomodoroSummary = () => {
  const { sessions, isSessionsLoading } = usePomodoroStore();
  const { categories } = useGoalStore();
  const [filterMode, setFilterMode] = useState("daily"); // daily, monthly, range
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Editing state
  const [editingTask, setEditingTask] = useState(null); // { goalId, title, currentDuration, targetDate }
  const [editHours, setEditHours] = useState(0);
  const [editMinutes, setEditMinutes] = useState(0);
  const { adjustTotalTime } = usePomodoroStore();

  const handleStartEdit = (title, duration, goalId) => {
    // Find the sessions for this task in the filtered list
    const taskSessions = filteredSessions.filter(s => s.goalTitle === title && s.goalId === goalId);
    // Sort by date descending to get the most recent one
    const sorted = [...taskSessions].sort((a, b) => new Date(b.date) - new Date(a.date));
    const mostRecentDate = sorted[0]?.date || new Date().toISOString();

    setEditingTask({ goalId, title, currentDuration: duration, targetDate: mostRecentDate });
    setEditHours(Math.floor(duration / 3600));
    setEditMinutes(Math.floor((duration % 3600) / 60));
  };

  const handleSaveEdit = () => {
    const newTotalSeconds = (parseInt(editHours) * 3600) + (parseInt(editMinutes) * 60);
    adjustTotalTime(editingTask.goalId, newTotalSeconds, editingTask.targetDate);
    setEditingTask(null);
  };

  const getCategoryColor = (catName) => {
    const customCat = categories?.find(c => c.name === catName);
    return customCat ? customCat.color : "text-gray-400 border-gray-400/20 bg-gray-400/10";
  };

  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      const sessionDate = session.date.split('T')[0];
      if (filterMode === "daily") {
        return sessionDate === filterDate;
      } else if (filterMode === "monthly") {
        return sessionDate.startsWith(filterMonth);
      } else if (filterMode === "range") {
        return sessionDate >= startDate && sessionDate <= endDate;
      }
      return true;
    });
  }, [sessions, filterMode, filterDate, filterMonth, startDate, endDate]);

  const summaryByCategory = useMemo(() => {
    const acc = {};
    filteredSessions.forEach(session => {
      const cat = session.goalCategory || "Uncategorized";
      if (!acc[cat]) acc[cat] = { duration: 0, count: 0, tasks: {} };
      acc[cat].duration += session.duration;
      acc[cat].count += 1;
      
      const title = session.goalTitle || "Unknown Task";
      if (!acc[cat].tasks[title]) acc[cat].tasks[title] = { duration: 0, count: 0 };
      acc[cat].tasks[title].duration += session.duration;
      acc[cat].tasks[title].count += 1;
    });
    return acc;
  }, [filteredSessions]);

  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}j ${m}m`;
    return `${m}m`;
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-white/[0.02] border border-white/5 rounded-3xl p-6 gap-6">
        <h2 className="text-2xl font-black text-white flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-lime-300/20 text-lime-400 flex items-center justify-center">
            <Timer size={24} />
          </div>
          Rekapan Waktu Kerja
        </h2>

        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Mode Selector */}
          <div className="flex bg-black/40 border border-white/10 rounded-xl p-1 shadow-inner">
            {[
              { id: "daily", label: "Hari" },
              { id: "monthly", label: "Bulan" },
              { id: "range", label: "Rentang" },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setFilterMode(mode.id)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterMode === mode.id
                    ? "bg-lime-300 text-black shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {/* Filter Inputs */}
          <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-xl px-4 py-3 shadow-inner min-w-[200px] justify-center">
            <CalendarIcon size={18} className="text-lime-300 shrink-0" />
            {filterMode === "daily" && (
              <input 
                type="date" 
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-white font-bold cursor-pointer w-full"
                style={{ colorScheme: 'dark' }}
              />
            )}
            {filterMode === "monthly" && (
              <input 
                type="month" 
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-white font-bold cursor-pointer w-full"
                style={{ colorScheme: 'dark' }}
              />
            )}
            {filterMode === "range" && (
              <div className="flex items-center gap-2">
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent border-none outline-none text-[10px] text-white font-bold cursor-pointer w-24"
                  style={{ colorScheme: 'dark' }}
                />
                <span className="text-gray-600 text-xs">-</span>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent border-none outline-none text-[10px] text-white font-bold cursor-pointer w-24"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {isSessionsLoading ? (
        <div className="w-full flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-b-2 border-lime-300 rounded-full"></div>
        </div>
      ) : Object.keys(summaryByCategory).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-white/5 rounded-3xl border border-dashed border-white/10">
          <Timer size={64} className="mb-4 opacity-20" />
          <p className="text-xl font-medium">Belum ada sesi Pomodoro.</p>
          <p className="text-sm">Selesaikan pomodoro untuk melihat rekapan waktu.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Object.entries(summaryByCategory).map(([category, data]) => {
            const catColorClass = getCategoryColor(category);
            return (
            <div key={category} className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex flex-col gap-4 shadow-xl shadow-black/20">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${catColorClass}`}>
                    <Bookmark size={18} />
                  </div>
                  <h3 className="font-bold text-white tracking-tight">{category}</h3>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-lime-300 tracking-tighter">{formatDuration(data.duration)}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{data.count} Sesi</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-3 mt-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {Object.entries(data.tasks).map(([title, taskData]) => {
                  // Find goalId from filteredSessions for this title
                  const goalId = filteredSessions.find(s => s.goalTitle === title)?.goalId;
                  return (
                    <div
                      key={title}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group"
                    >
                      <div className="flex flex-col gap-1 pr-4 flex-1">
                        <p className="text-sm font-bold text-gray-200 line-clamp-2 leading-snug">
                          {title}
                        </p>
                        <p className="text-[10px] text-lime-300/70 font-bold">
                          {taskData.count} x session{" "}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-black bg-lime-300 px-3 py-1.5 rounded-full whitespace-nowrap shadow-[0_0_15px_rgba(190,242,100,0.3)]">
                          {formatDuration(taskData.duration)}
                        </span>
                        <button
                          onClick={() =>
                            handleStartEdit(title, taskData.duration, goalId)
                          }
                          className="p-2 rounded-xl bg-white/5 text-gray-500 hover:text-white hover:bg-white/10 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all"
                          title="Edit Waktu"
                        >
                          <Pencil size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* Edit Time Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#121212] border border-white/10 rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-lime-300/10 text-lime-300 flex items-center justify-center">
                  <Clock size={20} />
                </div>
                Edit Waktu
              </h3>
              <button onClick={() => setEditingTask(null)} className="p-2 text-gray-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="mb-8">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Target</p>
              <p className="text-lg font-bold text-white leading-tight">{editingTask.title}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Jam</label>
                <input 
                  type="number" 
                  min="0"
                  value={editHours}
                  onChange={(e) => setEditHours(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 text-2xl font-black text-white text-center focus:border-lime-300/50 outline-none transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Menit</label>
                <input 
                  type="number" 
                  min="0"
                  max="59"
                  value={editMinutes}
                  onChange={(e) => setEditMinutes(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 text-2xl font-black text-white text-center focus:border-lime-300/50 outline-none transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setEditingTask(null)}
                className="flex-1 py-4 rounded-2xl bg-white/5 text-white font-bold text-sm hover:bg-white/10 transition-all"
              >
                Batal
              </button>
              <button 
                onClick={handleSaveEdit}
                className="flex-[2] py-4 rounded-2xl bg-lime-300 text-black font-bold text-sm hover:bg-lime-400 transition-all flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(190,242,100,0.2)]"
              >
                <Check size={18} /> Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
