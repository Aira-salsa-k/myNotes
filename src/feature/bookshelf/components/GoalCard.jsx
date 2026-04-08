import React from "react";
import {
  Bookmark,
  Edit2,
  Trash2,
  CheckCircle,
  Circle,
  GripVertical,
} from "lucide-react";
import { useGoalStore } from "../stores/useGoalStore";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export const GoalCard = ({ goal, onEdit, isDragging, isOverlay }) => {
  const { deleteGoal, toggleGoalStatus } = useGoalStore();
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: goal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isOverlay ? "none" : transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isOverlay ? 999 : 1,
  };

  const categoryColors = {
    Home: "text-cyan-400 border-cyan-400/20 bg-cyan-400/10",
    Kuliah: "text-indigo-400 border-indigo-400/20 bg-indigo-400/10",
    Work: "text-amber-200 border-amber-400/20 bg-amber-400/10",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative border flex flex-col h-max rounded-2xl p-4 
        ${isOverlay || isDragging ? "" : "transition-all"}
        ${
          goal.isComplete
            ? "bg-black/40 border-white/5 opacity-30 grayscale saturate-0"
            : "bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 hover:border-white/20"
        } 
        ${isOverlay ? "scale-105 shadow-2xl shadow-lime-300/20 cursor-grabbing" : "cursor-grab active:cursor-grabbing"}`}
    >
      {/* Visual background indicator for whole-card drag */}
      {!goal.isComplete && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-40 transition-opacity">
          <GripVertical size={14} className="text-gray-400" />
        </div>
      )}

      {/* Category Label */}
      <div
        className={`absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold jakarta-text tracking-wide 
        ${
          goal.isComplete
            ? "border-white/5 text-gray-700 bg-white/5"
            : categoryColors[goal.category] ||
              "text-gray-400 border-gray-400/20 bg-gray-400/10"
        }`}
      >
        <Bookmark size={10} fill="currentColor" />
        {goal.category}
      </div>

      <div className="mt-7 flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <h3
            className={`text-sm font-bold leading-snug pr-4 jakarta-text ${goal.isComplete ? "text-gray-700 line-through" : "text-white"}`}
          >
            {goal.title}
          </h3>
        </div>

        {goal.description && (
          <p
            className={`text-xs leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all jakarta-text ${goal.isComplete ? "text-gray-800" : "text-gray-500"}`}
          >
            {goal.description}
          </p>
        )}
      </div>

      {/* Actions (Hidden normally, expand on hover) */}
      <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-300 pointer-events-auto">
        <div className="overflow-hidden">
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
            <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">
              {new Date(goal.createdAt).toLocaleDateString()}
            </span>
            <div
              className="flex items-center gap-2"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(goal);
                }}
                className="p-2 rounded-xl bg-white/5 text-gray-400 hover:bg-lime-300/20 hover:text-lime-300 transition-all border border-white/5"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteGoal(goal.id);
                }}
                className="p-2 rounded-xl bg-white/5 text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-all border border-white/5"
              >
                <Trash2 size={16} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleGoalStatus(goal.id);
                }}
                className={`p-2 rounded-xl bg-white/5 transition-all border border-white/5 ${goal.isComplete ? "text-lime-900 border-lime-900/20 hover:bg-lime-300/10" : "text-gray-400 hover:text-lime-300 hover:bg-lime-300/20"}`}
                title="Mark complete"
              >
                {goal.isComplete ? (
                  <CheckCircle size={16} />
                ) : (
                  <Circle size={16} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
