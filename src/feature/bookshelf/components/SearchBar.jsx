import React from "react";
import { useGoalStore } from "../stores/useGoalStore";
import { Search } from "lucide-react";

export function SearchBar() {
  const searchQuery = useGoalStore((state) => state.searchQuery);
  const setSearchQuery = useGoalStore((state) => state.setSearchQuery);

  return (
    <div className="relative group w-full md:max-w-md">
      <Search
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-teal-400 transition-colors"
        size={18}
      />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 focus:outline-none rounded-2xl focus:ring-1 focus:ring-teal-500/50 focus:border-teal-500/50 focus:bg-white/10 text-sm text-white placeholder-gray-500 transition-all"
        placeholder="Cari goal/tugas..."
      />
    </div>
  );
}
