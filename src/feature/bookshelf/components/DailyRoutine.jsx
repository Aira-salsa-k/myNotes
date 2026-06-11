import React, { useState, useMemo, useEffect } from "react";
import { useRoutineStore } from "../stores/useRoutineStore";
import { Plus, CheckCircle, Circle, Trash2, CalendarDays, TrendingUp, GripVertical, ChevronLeft, ChevronRight, Edit2, X, Check } from "lucide-react";
import { LoadingState } from "./LoadingState";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const RoutineItem = ({ routine, isCompleted, toggleRoutineStatus, deleteRoutine, dateString, updateRoutine }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(routine.title);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: routine.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = () => {
    if(editTitle.trim() && editTitle !== routine.title) {
      updateRoutine(routine.id, editTitle);
    }
    setIsEditing(false);
  }

  const handleDelete = () => {
    if(window.confirm("Apakah Anda yakin ingin menghapus rutinitas ini?")) {
      deleteRoutine(routine.id);
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center justify-between p-4 rounded-2xl border transition-all ${
        isCompleted
          ? "bg-lime-500/5 border-lime-500/20"
          : "bg-white/5 border-white/10 hover:bg-white/10"
      }`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div 
          {...attributes} 
          {...listeners} 
          className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-lime-300 opacity-40 lg:opacity-0 lg:group-hover:opacity-40 transition-opacity p-1 touch-none"
        >
          <GripVertical size={16} />
        </div>
        
        <button
          onClick={() => toggleRoutineStatus(routine.id, dateString)}
          className={`transition-colors flex-shrink-0 ${
            isCompleted ? "text-lime-400" : "text-gray-500 group-hover:text-lime-400"
          }`}
        >
          {isCompleted ? <CheckCircle size={24} /> : <Circle size={24} />}
        </button>
        
        {isEditing ? (
           <div className="flex items-center gap-2 flex-1">
             <input 
               autoFocus
               value={editTitle}
               onChange={(e) => setEditTitle(e.target.value)}
               onKeyDown={(e) => { if(e.key === 'Enter') handleSave(); if(e.key === 'Escape') setIsEditing(false); }}
               className="flex-1 bg-black/50 border border-lime-500/30 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:border-lime-400"
             />
             <button onClick={handleSave} className="text-lime-400 hover:text-lime-300"><Check size={16}/></button>
             <button onClick={() => { setIsEditing(false); setEditTitle(routine.title); }} className="text-gray-400 hover:text-white"><X size={16}/></button>
           </div>
        ) : (
          <span
            onDoubleClick={() => setIsEditing(true)}
            className={`font-bold text-sm truncate ${
              isCompleted ? "text-gray-400 line-through" : "text-white"
            }`}
          >
            {routine.title}
          </span>
        )}
      </div>

      {!isEditing && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all ml-2">
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-600 hover:text-lime-400 hover:bg-lime-400/10 rounded-xl"
            title="Edit Rutinitas"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl"
            title="Hapus Rutinitas"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export const DailyRoutine = () => {
  const { routines, routineLogs, isLoading, addRoutine, deleteRoutine, toggleRoutineStatus, updateRoutine, setRoutines } = useRoutineStore();
  const [newRoutine, setNewRoutine] = useState("");
  
  // Selected Date for checking off routines (defaults to today)
  const todayDate = new Date();
  const [selectedDate, setSelectedDate] = useState(todayDate);
  const selectedDateString = formatDate(selectedDate);
  const todayString = formatDate(todayDate);

  // Navigation for month calendar
  const [viewDate, setViewDate] = useState(new Date(todayDate.getFullYear(), todayDate.getMonth(), 1));

  // Sync calendar view month with selectedDate when selectedDate changes
  useEffect(() => {
    setViewDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  }, [selectedDate]);

  const parseDateString = (dateStr) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  const isSameDay = (d1, d2) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isSelectedToday = isSameDay(selectedDate, todayDate);
  const yesterdayDate = new Date(todayDate);
  yesterdayDate.setDate(todayDate.getDate() - 1);
  const isSelectedYesterday = isSameDay(selectedDate, yesterdayDate);

  const prevDay = () => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 1);
      return d;
    });
  };

  const nextDay = () => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 1);
      return d;
    });
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = routines.findIndex((r) => r.id === active.id);
      const newIndex = routines.findIndex((r) => r.id === over.id);
      setRoutines(arrayMove(routines, oldIndex, newIndex));
    }
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (newRoutine.trim()) {
      addRoutine(newRoutine);
      setNewRoutine("");
    }
  };

  // Monthly stats for viewDate
  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => {
    return formatDate(new Date(currentYear, currentMonth, i + 1));
  });

  const getDayStats = (dateStr) => {
    if (routines.length === 0) return { percent: 0, completed: 0, total: 0 };
    const completed = routineLogs.filter((log) => log.date === dateStr).length;
    const total = routines.length;
    return {
      percent: Math.round((completed / total) * 100),
      completed,
      total,
    };
  };

  const nextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  }

  const prevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  }

  const goToTodayMonth = () => {
    setViewDate(new Date(todayDate.getFullYear(), todayDate.getMonth(), 1));
  }

  if (isLoading) {
    return <LoadingState message="Menyiapkan Rutinitas" />;
  }

  return (
    <div className="flex flex-col gap-10">
      
      {/* Header Info */}
      <div className="flex items-center gap-4 mb-4">
        <span className="px-4 py-2 rounded-2xl bg-lime-500/10 border border-lime-500/20 text-[10px] font-black text-lime-300 uppercase tracking-widest flex items-center gap-2">
          <TrendingUp size={14} /> Daily Routine Tracker
        </span>
        <div className="h-px bg-white/10 flex-grow"></div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Col: Selected Tasks */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 shadow-xl backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-black text-white flex items-center gap-3 flex-wrap">
                {isSelectedToday ? "Rutinitas Hari Ini" : isSelectedYesterday ? "Rutinitas Kemarin" : "Rutinitas"}
                <span className="text-[10px] bg-white/10 px-2.5 py-1.5 rounded-full text-gray-400 font-bold">
                  {selectedDate.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
                </span>
              </h2>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                  <button
                    onClick={prevDay}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                    title="Hari Sebelumnya"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={goToToday}
                    className="text-[11px] font-bold text-lime-300 px-2 hover:underline transition-all"
                  >
                    Hari Ini
                  </button>
                  <button
                    onClick={nextDay}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                    title="Hari Berikutnya"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Routine List */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <div className="flex flex-col gap-3">
                <SortableContext items={routines.map((r) => r.id)} strategy={verticalListSortingStrategy}>
                  {routines.map((routine) => {
                    const isCompleted = routineLogs.some(
                      (log) => log.routineId === routine.id && log.date === selectedDateString
                    );
                    return (
                      <RoutineItem 
                        key={routine.id}
                        routine={routine}
                        isCompleted={isCompleted}
                        toggleRoutineStatus={toggleRoutineStatus}
                        deleteRoutine={deleteRoutine}
                        dateString={selectedDateString}
                        updateRoutine={updateRoutine}
                      />
                    );
                  })}
                </SortableContext>

                {routines.length === 0 && (
                  <div className="text-center py-10 text-gray-500 font-medium text-sm border border-dashed border-white/10 rounded-2xl">
                    Belum ada rutinitas. Tambahkan di bawah!
                  </div>
                )}
              </div>
            </DndContext>

            {/* Add New Routine */}
            <form onSubmit={handleAdd} className="mt-6 flex items-center gap-3">
              <input
                type="text"
                value={newRoutine}
                onChange={(e) => setNewRoutine(e.target.value)}
                placeholder="Tambahkan rutinitas baru..."
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-lime-500/50 transition-all focus:bg-white/10"
              />
              <button
                type="submit"
                disabled={!newRoutine.trim()}
                className="bg-lime-400 text-black p-4 rounded-2xl hover:bg-lime-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={20} />
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: Monthly Report */}
        <div className="flex flex-col gap-6">
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 shadow-xl backdrop-blur-xl h-full flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h2 className="text-lg font-black text-white flex items-center gap-3">
                <CalendarDays className="text-lime-400" size={20} />
                Laporan
              </h2>
              <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                <button onClick={prevMonth} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={goToTodayMonth} className="text-[11px] font-bold text-lime-300 px-2 min-w-[100px] text-center">
                  {viewDate.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
                </button>
                <button onClick={nextMonth} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {/* Day Headers */}
              {["M", "S", "S", "R", "K", "J", "S"].map((day, i) => (
                <div key={i} className="text-[10px] font-bold text-gray-500 text-center mb-2">
                  {day}
                </div>
              ))}

              {/* Offset for first day of month */}
              {Array.from({ length: new Date(currentYear, currentMonth, 1).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {/* Day Cells */}
              {monthDays.map((dateStr, i) => {
                const stats = getDayStats(dateStr);
                const isCellToday = dateStr === todayString;
                const isCellSelected = dateStr === selectedDateString;
                
                // Determine color intensity based on percentage
                let bgClass = "bg-white/5 border-white/5";
                if (stats.percent > 0) {
                  if (stats.percent === 100) bgClass = "bg-lime-400 border-lime-400 text-black";
                  else if (stats.percent >= 75) bgClass = "bg-lime-500/70 border-lime-500/50";
                  else if (stats.percent >= 50) bgClass = "bg-lime-500/40 border-lime-500/30";
                  else bgClass = "bg-lime-500/20 border-lime-500/20";
                }

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(parseDateString(dateStr))}
                    className="relative group aspect-square flex items-center justify-center w-full h-full p-0 bg-transparent border-0"
                  >
                    <div
                      className={`w-full h-full rounded-lg border flex items-center justify-center text-xs font-bold transition-all ${bgClass} ${
                        isCellSelected
                          ? "ring-2 ring-lime-300 ring-offset-2 ring-offset-[#0b0b0b] scale-105"
                          : ""
                      } ${isCellToday && !isCellSelected ? "border-white/40" : ""}`}
                    >
                      <span className={stats.percent === 100 ? "text-lime-900" : "text-white/80"}>
                        {i + 1}
                      </span>
                    </div>

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 w-max bg-black/90 text-white text-[10px] px-3 py-1.5 rounded-lg border border-white/10 shadow-xl">
                      <p className="font-bold text-lime-300 mb-0.5">{new Date(dateStr).toLocaleDateString("id-ID", { dateStyle: "medium" })}</p>
                      <p className="text-gray-400">{stats.completed} dari {stats.total} selesai ({stats.percent}%)</p>
                    </div>
                  </button>
                );
              })}
            </div>
            
            <div className="mt-auto pt-8 flex flex-col gap-2">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest text-center mb-2">Tingkat Konsistensi</p>
              <div className="flex items-center justify-between text-[10px] text-gray-500 font-medium">
                <span>0%</span>
                <span>100%</span>
              </div>
              <div className="flex gap-1 h-3">
                <div className="flex-1 rounded-sm bg-white/5"></div>
                <div className="flex-1 rounded-sm bg-lime-500/20"></div>
                <div className="flex-1 rounded-sm bg-lime-500/40"></div>
                <div className="flex-1 rounded-sm bg-lime-500/70"></div>
                <div className="flex-1 rounded-sm bg-lime-400"></div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
