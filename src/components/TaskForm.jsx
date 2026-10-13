import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGame } from "../context/GameContext";
import { getTaskXp } from "../interfaces/gamification";
import { Pencil, Sparkles, PlusCircle, Check } from "lucide-react";

function TaskForm() {
  const { addTask, editingTask, updateTask, setEditingTask } = useGame();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Orta");
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title || "");
      setDescription(editingTask.description || "");
      setPriority(editingTask.priority || "Orta");
      setIsExpanded(true);
    }
  }, [editingTask]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingTask) {
      updateTask({
        ...editingTask,
        title: title.trim(),
        description: description.trim(),
        priority,
      });
    } else {
      addTask({
        title: title.trim(),
        description: description.trim(),
        priority,
      });
      setTitle("");
      setDescription("");
      setPriority("Orta");
      setIsExpanded(false);
    }
  };

  const handleCancel = () => {
    setEditingTask(null);
    setTitle("");
    setDescription("");
    setPriority("Orta");
    setIsExpanded(false);
  };

  const priorityOptions = [
    { label: "Düşük", value: "Düşük", color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10", xp: getTaskXp("Düşük") },
    { label: "Orta", value: "Orta", color: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/10", xp: getTaskXp("Orta") },
    { label: "Yüksek", value: "Yüksek", color: "text-rose-400", border: "border-rose-500/30", bg: "bg-rose-500/10", xp: getTaskXp("Yüksek") },
  ];

  return (
    <motion.div
      layout
      className="mb-8 rounded-3xl border border-white/[0.08] bg-[#111422]/80 p-5 shadow-2xl backdrop-blur-xl transition-all"
    >
      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400">
              {editingTask ? <Pencil className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            </span>
            <h3 className="font-extrabold text-white text-base tracking-tight">
              {editingTask ? "Görevi Düzenle" : "Yeni Görev Oluştur"}
            </h3>
          </div>

          <span className="text-[11px] font-medium text-slate-400">
            Ödül: <strong className="text-purple-300">+{getTaskXp(priority)} XP</strong>
          </span>
        </div>

        {/* Görev Başlığı Girişi */}
        <div className="relative">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder="Ne başarmak istiyorsun? (Örn: Proje mimarisini tamamla)"
            required
            className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm font-semibold text-white placeholder-slate-500 outline-none transition focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        {/* Genişletilmiş Alanlar (Açıklama & Öncelik) */}
        <AnimatePresence>
          {(isExpanded || editingTask) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-3 space-y-3 overflow-hidden"
            >
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Açıklama veya alt adımlar ekle (isteğe bağlı)..."
                rows={2}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 outline-none transition focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20"
              />

              {/* Öncelik Seçim Hapları */}
              <div>
                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Öncelik Seviyesi
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {priorityOptions.map((opt) => {
                    const isSelected = priority === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setPriority(opt.value)}
                        className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-bold transition ${
                          isSelected
                            ? `${opt.bg} ${opt.border} ${opt.color} shadow-sm ring-1 ring-purple-500/40`
                            : "border-white/5 bg-slate-900/50 text-slate-400 hover:border-white/15 hover:text-slate-200"
                        }`}
                      >
                        <span>{opt.label}</span>
                        <span className="text-[10px] opacity-80">+{opt.xp} XP</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Aksiyon Butonları */}
        {(isExpanded || editingTask) && (
          <div className="mt-4 flex items-center justify-end gap-2 border-t border-white/5 pt-3">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
            >
              Vazgeç
            </button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-fuchsia-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition hover:from-purple-500 hover:to-fuchsia-500"
            >
              {editingTask ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Değişiklikleri Kaydet</span>
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4" />
                  <span>Görevi Başlat</span>
                </>
              )}
            </motion.button>
          </div>
        )}
      </form>
    </motion.div>
  );
}

export default TaskForm;