import React, { useEffect, useState } from "react";
import { X, Save, Bookmark, Calendar } from "lucide-react";
import { useGoalStore } from "../stores/useGoalStore";

export const GoalForm = ({ editData, onCloseEdit }) => {
  const { addGoal, updateGoal } = useGoalStore();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Kerjaan",
    timeframe: "Daily",
    isComplete: false,
  });

  useEffect(() => {
    if (editData) {
      setFormData(editData);
    }
  }, [editData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editData) {
      updateGoal(editData.id, formData);
    } else {
      addGoal(formData);
    }
    onCloseEdit();
  };

  const categories = ["Work", "Kuliah", "Home"];
  const timeframes = ["Yearly", "Monthly", "Weekly", "Daily"];

  return (
    <div className="bg-[#0f0f0f] border border-white/10 rounded-3xl p-5 max-w-md mx-auto shadow-md backdrop-blur-md">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-lime-300" />
          {editData ? "Edit Target" : "New Target"}
        </h2>
        <button
          onClick={onCloseEdit}
          className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Judul Goal
          </label>
          <input
            type="text"
            required
            placeholder="Apa yang ingin kamu capai?"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-lime-500/50 transition-all"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Deskripsi (Opsional)
          </label>
          <textarea
            placeholder="Tambahkan detail jika perlu..."
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-lime-500/50 transition-all resize-none"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Kategori
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat })}
                  className={`px-3 py-3 rounded-lg border transition-all text-[11px] font-bold ${
                    formData.category === cat
                      ? "bg-lime-300/10 text-lime-300 border-lime-300/30"
                      : "bg-white/5 text-gray-500 border-white/5 hover:border-white/10"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Waktu (Timeframe)
            </label>
            <div className="flex flex-wrap gap-2">
              {timeframes.map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setFormData({ ...formData, timeframe: tf })}
                  className={`px-3 py-3 rounded-lg border transition-all text-[11px] font-bold ${
                    formData.timeframe === tf
                      ? "bg-lime-300/10 text-lime-300 border-lime-300/30"
                      : "bg-white/5 text-gray-500 border-white/5 hover:border-white/10"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-lime-300 text-black text-sm font-medium py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-lime-200 transition-all mt-4"
        >
          <Save size={20} />
          {editData ? "Simpan Perubahan" : "Simpan Goal"}
        </button>
      </form>
    </div>
  );
};
