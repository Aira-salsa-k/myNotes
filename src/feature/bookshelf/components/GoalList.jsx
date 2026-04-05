import React, { useMemo } from "react";
import { useGoalStore } from "../stores/useGoalStore";
import { GoalCard } from "./GoalCard";
import { ClipboardList, CheckCircle2 } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

export const GoalList = ({ onEdit }) => {
  const { goals, searchQuery, selectedTimeframe, toggleGoalStatus } =
    useGoalStore();
  const setGoals = useGoalStore((state) => state.setGoals); // We need to add this
  const [activeId, setActiveId] = React.useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const filteredGoals = useMemo(() => {
    return goals.filter((goal) => {
      const matchesSearch =
        goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        goal.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTimeframe = goal.timeframe === selectedTimeframe;
      return matchesSearch && matchesTimeframe;
    });
  }, [goals, searchQuery, selectedTimeframe]);

  const inProgressGoals = filteredGoals.filter((g) => !g.isComplete);
  const completedGoals = filteredGoals.filter((g) => g.isComplete);

  const activeGoal = useMemo(
    () => goals.find((g) => g.id === activeId),
    [activeId, goals],
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

    const isActiveInCompleted = completedGoals.some((g) => g.id === activeId);
    const isOverInCompleted = completedGoals.some((g) => g.id === overId);

    // If dragging to a different container
    if (isActiveInCompleted !== isOverInCompleted) {
      toggleGoalStatus(activeId);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = goals.findIndex((g) => g.id === active.id);
      const newIndex = goals.findIndex((g) => g.id === over.id);

      if (setGoals) {
        setGoals(arrayMove(goals, oldIndex, newIndex));
      }
    }
  };

  if (filteredGoals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-white/5 rounded-3xl border border-dashed border-white/10">
        <ClipboardList size={64} className="mb-4 opacity-20" />
        <p className="text-xl font-medium">
          Belum ada goal untuk {selectedTimeframe.toLowerCase()} ini.
        </p>
        <p className="text-sm">Klik tombol "Tambah Goal Baru" untuk memulai.</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Kolom Kiri: Belum Selesai */}
        <section className="lg:pr-10 lg:border-r lg:border-white/5 pb-10 lg:pb-0">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-2 h-2 rounded-full bg-lime-300 animate-pulse shadow-[0_0_10px_rgba(190,242,100,0.3)]" />
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">
              Active Focus ({inProgressGoals.length})
            </h2>
          </div>
          <SortableContext
            items={inProgressGoals.map((g) => g.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 min-h-[100px]">
              {inProgressGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={onEdit}
                  isDragging={activeId === goal.id}
                />
              ))}
              {inProgressGoals.length === 0 && (
                <div className="col-span-full py-16 flex flex-col items-center justify-center bg-white/[0.02] rounded-3xl border border-dashed border-white/5">
                  <p className="text-[10px] font-black text-gray-700 uppercase tracking-wider">
                    All caught up!
                  </p>
                </div>
              )}
            </div>
          </SortableContext>
        </section>

        {/* Kolom Kanan: Sudah Selesai */}
        <section className="lg:pl-10 pt-10 lg:pt-0">
          <div className="flex items-center gap-3 mb-6 px-2">
            <CheckCircle2 className="text-gray-700" size={14} />
            <h2 className="text-xs font-black text-gray-600 uppercase tracking-widest">
              Success Log ({completedGoals.length})
            </h2>
          </div>
          <SortableContext
            items={completedGoals.map((g) => g.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 min-h-[100px]">
              {completedGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={onEdit}
                  isDragging={activeId === goal.id}
                />
              ))}
              {completedGoals.length === 0 && (
                <div className="col-span-full py-16 flex flex-col items-center justify-center bg-white/[0.01] rounded-3xl border border-dashed border-white/5 text-gray-800">
                  <p className="text-[10px] font-black uppercase tracking-wider">
                    No history yet.
                  </p>
                </div>
              )}
            </div>
          </SortableContext>
        </section>
      </div>

      <DragOverlay>
        {activeGoal ? (
          <GoalCard goal={activeGoal} onEdit={() => {}} isOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
