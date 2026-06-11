import React, { useMemo } from "react";
import {
  useGoalStore,
  TIMEFRAME_PERIODS,
  UNASSIGNED_PERIOD,
} from "../stores/useGoalStore";
import { GoalCard } from "./GoalCard";
import { ClipboardList, ChevronLeft, ChevronRight } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Sunrise, Sun, Sunset, Moon, Trash2 } from "lucide-react";

const SortableGoalColumn = ({
  periodId,
  title,
  goals,
  onEdit,
  activeId,
  className = "",
}) => {
  const { setNodeRef } = useDroppable({ id: periodId });

  return (
    <div
      className={`flex flex-col bg-white/[0.02] rounded-3xl border border-white/5 p-4 shrink-0 h-max ${className}`}
    >
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          {title === "Pagi" && <Sunrise size={14} className="text-lime-300" />}
          {title === "Siang" && <Sun size={14} className="text-lime-300" />}
          {title === "Sore" && <Sunset size={14} className="text-lime-300" />}
          {title === "Malam" && <Moon size={14} className="text-lime-300" />}
          <h2 className="text-[11px] font-black text-lime-300 uppercase tracking-widest">
            {title}
          </h2>
        </div>
        <span className="text-[11px] text-gray-600 font-bold px-2 py-0.5 rounded-full bg-white/5">
          {goals.length}
        </span>
      </div>
      <div ref={setNodeRef} className="flex flex-col gap-3 min-h-[150px]">
        <SortableContext
          items={goals.map((g) => g.id)}
          strategy={verticalListSortingStrategy}
        >
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={onEdit}
              isDragging={activeId === goal.id}
            />
          ))}
        </SortableContext>
        {goals.length === 0 && (
          <div className="flex-1 flex items-center justify-center py-10 border border-dashed border-white/5 rounded-2xl">
            <span className="text-[10px] text-gray-700 font-black uppercase tracking-widest">
              Kosong
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const YearlyGrid = ({ selectedYear, goals, onEdit, activeId }) => {
  const { setNodeRef } = useDroppable({ id: `year-${selectedYear}` });

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center gap-2 px-1">
        <h2 className="text-[11px] font-black text-lime-300 uppercase tracking-widest">
          Goals Tahunan {selectedYear}
        </h2>
        <span className="text-[11px] text-gray-600 font-bold px-2 py-0.5 rounded-full bg-white/5">
          {goals.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full min-h-[400px] bg-white/[0.01] p-4 rounded-3xl border border-white/5"
      >
        <SortableContext
          items={goals.map((g) => g.id)}
          strategy={verticalListSortingStrategy}
        >
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={onEdit}
              isDragging={activeId === goal.id}
            />
          ))}
        </SortableContext>
        {goals.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 border border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
            <span className="text-xs text-gray-700 font-bold uppercase tracking-widest">
              Tidak ada goal di tahun {selectedYear}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export const GoalList = ({ onEdit }) => {
  const {
    goals,
    searchQuery,
    selectedTimeframe,
    updateGoalPeriod,
    selectedYear,
    setSelectedYear,
  } = useGoalStore();
  const setGoals = useGoalStore((state) => state.setGoals);
  const [activeId, setActiveId] = React.useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { 
      activationConstraint: { distance: 8 } 
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const activeGoal = useMemo(
    () => goals.find((g) => g.id === activeId),
    [activeId, goals],
  );

  const columns = useMemo(() => {
    return [UNASSIGNED_PERIOD, ...(TIMEFRAME_PERIODS[selectedTimeframe] || [])];
  }, [selectedTimeframe]);

  const filteredGoals = useMemo(() => {
    return goals.filter((goal) => {
      const matchesSearch =
        goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        goal.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTimeframe = goal.timeframe === selectedTimeframe;
      const matchesYear =
        selectedTimeframe === "Yearly"
          ? goal.targetYear === selectedYear
          : true;

      return matchesSearch && matchesTimeframe && matchesYear;
    });
  }, [goals, searchQuery, selectedTimeframe, selectedYear]);

  const activeGoals = useMemo(
    () => filteredGoals.filter((g) => !g.isComplete),
    [filteredGoals],
  );

  const completedGoals = useMemo(
    () => filteredGoals.filter((g) => g.isComplete),
    [filteredGoals],
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeGoal = filteredGoals.find((g) => g.id === activeId);
    if (!activeGoal) return;
    const activeContainer = activeGoal.period || UNASSIGNED_PERIOD;

    const overGoal = filteredGoals.find((g) => g.id === overId);
    // Target could be a goal (swap) or a column ID (empty drop)
    let overContainer = overGoal
      ? overGoal.period || UNASSIGNED_PERIOD
      : columns.includes(overId)
        ? overId
        : null;

    // Special check for Yearly mode drop target
    if (
      selectedTimeframe === "Yearly" &&
      !overContainer &&
      overId === `year-${selectedYear}`
    ) {
      overContainer = "Assigned"; // For yearly we just need to move it out of Inbox
    }

    if (overContainer && activeContainer !== overContainer) {
      updateGoalPeriod(activeId, overContainer);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    if (active.id !== over.id) {
      const overGoal = filteredGoals.find((g) => g.id === over.id);
      if (overGoal) {
        const oldIndex = goals.findIndex((g) => g.id === active.id);
        const newIndex = goals.findIndex((g) => g.id === over.id);

        if (setGoals && oldIndex !== -1 && newIndex !== -1) {
          setGoals(arrayMove(goals, oldIndex, newIndex));
        }
      }
    }
  };

  if (filteredGoals.length === 0 && selectedTimeframe !== "Yearly") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-white/5 rounded-3xl border border-dashed border-white/10">
        <ClipboardList size={64} className="mb-4 opacity-20" />
        <p className="text-xl font-medium">Beban tugasmu kosong.</p>
        <p className="text-sm">Klik tombol "Tambah Goal Baru" untuk memulai.</p>
      </div>
    );
  }

  const unassignedGoals = activeGoals.filter(
    (g) => (g.period || UNASSIGNED_PERIOD) === UNASSIGNED_PERIOD,
  );

  const assignedYearlyGoals = activeGoals.filter(
    (g) => g.period !== UNASSIGNED_PERIOD,
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col lg:flex-row gap-4 pb-8 items-start relative z-10 w-full">
        {/* Inbox Column - Sticky */}
        <div className="w-full lg:w-[280px] shrink-0 lg:sticky lg:top-32 lg:max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar pr-1">
          <SortableGoalColumn
            periodId={UNASSIGNED_PERIOD}
            title="Inbox"
            goals={unassignedGoals}
            onEdit={onEdit}
            activeId={activeId}
            className="w-full shadow-2xl shadow-black/50 border-lime-500/50"
          />
        </div>

        {/* Period Columns - Grid */}
        <div className="flex-1 w-full flex flex-col gap-6">
          {/* Yearly Selector */}
          {selectedTimeframe === "Yearly" && (
            <div className="flex items-center justify-between gap-4 bg-white/[0.02] border border-white/5 px-6 py-4 rounded-3xl w-max shadow-sm backdrop-blur-xl">
              <h3 className="text-[11px] font-black text-gray-500 uppercase tracking-widest mr-4">
                Pilih Tahun
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedYear(selectedYear - 1)}
                  className="p-1.5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-all bg-white/5 border border-white/5"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="px-4 py-1.5 rounded-xl bg-lime-300/10 border border-lime-300/20 text-lime-300 font-black text-sm w-20 text-center">
                  {selectedYear}
                </div>
                <button
                  onClick={() => setSelectedYear(selectedYear + 1)}
                  className="p-1.5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-all bg-white/5 border border-white/5"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {selectedTimeframe === "Yearly" ? (
            <YearlyGrid
              selectedYear={selectedYear}
              goals={assignedYearlyGoals}
              onEdit={onEdit}
              activeId={activeId}
            />
          ) : (
            <div
              className={`grid gap-5 w-full md:px-4 lg:px-8  ${
                selectedTimeframe === "Daily"
                  ? "grid-cols-1 md:grid-cols-2"
                  : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              }`}
            >
              {columns.map((colId) => {
                if (colId === UNASSIGNED_PERIOD) return null;

                const columnGoals = activeGoals.filter(
                  (g) => (g.period || UNASSIGNED_PERIOD) === colId,
                );
                return (
                  <SortableGoalColumn
                    key={colId}
                    periodId={colId}
                    title={colId}
                    goals={columnGoals}
                    onEdit={onEdit}
                    activeId={activeId}
                    className="w-full"
                  />
                );
              })}
            </div>
          )}

          {/* Completed Section Area */}
          {completedGoals.length > 0 && (
            <div className="mt-12 pt-8 border-t border-white/5">
              <div className="flex items-center gap-3 mb-6 px-1">
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-500">
                  <Trash2 size={16} />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-sm font-bold text-white tracking-tight">
                    Selesai & Arsip
                  </h2>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none mt-1">
                    Target yang telah kamu capai
                  </p>
                </div>
                <div className="flex-grow h-px bg-white/5 ml-4" />
                <span className="text-[11px] text-gray-600 font-bold px-3 py-1 rounded-full bg-white/5 border border-white/5">
                  {completedGoals.length} Selesai
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {completedGoals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} onEdit={onEdit} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <DragOverlay>
        {activeGoal ? (
          <GoalCard goal={activeGoal} onEdit={() => {}} isOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
