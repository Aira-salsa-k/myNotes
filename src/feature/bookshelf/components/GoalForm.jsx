import React, { useEffect, useState } from "react";
import { X, Save, Plus, Edit2, Trash2 } from "lucide-react";
import { useGoalStore, TIMEFRAME_PERIODS, UNASSIGNED_PERIOD } from "../stores/useGoalStore";

const COLOR_OPTIONS = [
  "text-cyan-400 border-cyan-400/20 bg-cyan-400/10",
  "text-indigo-400 border-indigo-400/20 bg-indigo-400/10",
  "text-amber-200 border-amber-400/20 bg-amber-400/10",
  "text-rose-400 border-rose-400/20 bg-rose-400/10",
  "text-emerald-400 border-emerald-400/20 bg-emerald-400/10",
  "text-fuchsia-400 border-fuchsia-400/20 bg-fuchsia-400/10",
  "text-lime-300 border-lime-300/20 bg-lime-300/10",
];

export const GoalForm = ({ editData, onCloseEdit }) => {
  const { addGoal, updateGoal, selectedTimeframe, categories, addCategory, updateCategory, deleteCategory } = useGoalStore();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Work",
    timeframe: selectedTimeframe || "Daily",
    isComplete: false,
  });

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState(COLOR_OPTIONS[0]);

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

  const handleSaveCategory = () => {
    if (!newCatName.trim()) return;
    
    if (editingCategoryId) {
      updateCategory(editingCategoryId, { name: newCatName, color: newCatColor });
    } else {
      addCategory({ name: newCatName, color: newCatColor });
      setFormData({ ...formData, category: newCatName });
    }
    
    setIsAddingCategory(false);
    setEditingCategoryId(null);
    setNewCatName("");
  };

  const startEditCategory = (cat) => {
    setEditingCategoryId(cat.id);
    setNewCatName(cat.name);
    setNewCatColor(cat.color);
    setIsAddingCategory(true);
  };

  const handleDeleteCategory = (catId) => {
    deleteCategory(catId);
  };

  const timeframes = ["Yearly", "Monthly", "Weekly", "Daily"];

  return (
    <div className="bg-[#0f0f0f] border border-white/10 rounded-3xl p-5 max-w-md mx-auto shadow-md backdrop-blur-md max-h-[90vh] overflow-y-auto custom-scrollbar">
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
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-lime-500/50 transition-all resize-none"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-400">
                Kategori
              </label>
              <button 
                type="button" 
                onClick={() => {
                  setIsAddingCategory(!isAddingCategory);
                  setEditingCategoryId(null);
                  setNewCatName("");
                }}
                className="text-[10px] text-lime-300 font-bold hover:underline"
              >
                {isAddingCategory ? "Batal" : "+ Kategori Baru"}
              </button>
            </div>

            {isAddingCategory ? (
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-3 flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Nama kategori"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none"
                />
                <div className="flex gap-2">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewCatColor(color)}
                      className={`w-6 h-6 rounded-full border-2 ${color} ${newCatColor === color ? "border-white" : "border-transparent"}`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between mt-1">
                  {editingCategoryId ? (
                    <button type="button" onClick={() => { handleDeleteCategory(editingCategoryId); setIsAddingCategory(false); }} className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1">
                      <Trash2 size={12}/> Hapus
                    </button>
                  ) : <div></div>}
                  <button type="button" onClick={handleSaveCategory} className="bg-lime-300 text-black px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-lime-400">
                    {editingCategoryId ? "Simpan Perubahan" : "Simpan Kategori"}
                  </button>
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <div key={cat.id} className="relative group">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.name })}
                    className={`px-3 py-2 rounded-lg border transition-all text-[12px] font-bold ${
                      formData.category === cat.name
                        ? cat.color
                        : "bg-white/5 text-gray-400 border-white/5 hover:border-white/10"
                    }`}
                  >
                    {cat.name}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); startEditCategory(cat); }}
                    className="absolute -top-2 -right-2 p-1 rounded-full bg-black/80 text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit2 size={10} />
                  </button>
                </div>
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
                  onClick={() => {
                    const allowedPeriods = TIMEFRAME_PERIODS[tf] || [];
                    const isPeriodValid =
                      formData.period === UNASSIGNED_PERIOD ||
                      allowedPeriods.includes(formData.period);
                    setFormData({
                      ...formData,
                      timeframe: tf,
                      period: isPeriodValid ? formData.period : UNASSIGNED_PERIOD,
                    });
                  }}
                  className={`px-3 py-3 rounded-lg border transition-all text-[12px] font-bold ${
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
