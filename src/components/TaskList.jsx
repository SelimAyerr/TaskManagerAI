import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGame } from "../context/GameContext";
import TaskCard from "./TaskCard";
import { Search, X, Flame, Zap, Sprout, Trophy, Target, Layers } from "lucide-react";

function TaskList() {
  const { tasks, activeTab, setActiveTab, activeTasks, completedTasks } = useGame();
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filtreleme mantığı
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Sekme Filtresi
      if (activeTab === "active" && task.completed) return false;
      if (activeTab === "completed" && !task.completed) return false;

      // Öncelik Filtresi
      if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;

      // Arama Filtresi
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = (task.description || "").toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }

      return true;
    });
  }, [tasks, activeTab, priorityFilter, searchQuery]);

  return (
    <div className="space-y-3.5">
      {/* Mobil Öncelikli Sekmeler (Tümü / Aktif / Biten) */}
      <div className="flex sm:hidden items-center rounded-2xl border border-white/5 bg-slate-900/70 p-1 w-full gap-1 shadow-md">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition active:scale-95 ${
            activeTab === "all"
              ? "bg-white/10 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span>Tümü</span>
          <span className="rounded-full bg-white/10 px-1.5 py-0.2 text-[10px]">
            {tasks.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("active")}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition active:scale-95 ${
            activeTab === "active"
              ? "bg-purple-600/30 text-purple-300 shadow-sm border border-purple-500/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span>Aktif</span>
          <span className="rounded-full bg-purple-500/20 px-1.5 py-0.2 text-[10px] text-purple-300">
            {activeTasks.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("completed")}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition active:scale-95 ${
            activeTab === "completed"
              ? "bg-emerald-600/30 text-emerald-300 shadow-sm border border-emerald-500/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span>Biten</span>
          <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[10px] text-emerald-300">
            {completedTasks.length}
          </span>
        </button>
      </div>

      {/* Liste Üstü: Arama ve Hızlı Öncelik Filtreleri */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        
        {/* Arama Kutusu */}
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Görevlerde ara..."
            className="w-full rounded-xl border border-white/10 bg-slate-900/60 pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 outline-none transition focus:border-purple-500/50"
          />
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Öncelik Hapları */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 hidden md:inline">
            Filtre:
          </span>
          {[
            { id: "all", label: "Tümü", Icon: Layers },
            { id: "Yüksek", label: "Yüksek", Icon: Flame, color: "text-rose-400" },
            { id: "Orta", label: "Orta", Icon: Zap, color: "text-amber-400" },
            { id: "Düşük", label: "Düşük", Icon: Sprout, color: "text-emerald-400" },
          ].map((item) => {
            const Icon = item.Icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setPriorityFilter(item.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                  priorityFilter === item.id
                    ? "bg-purple-600/30 text-purple-300 border border-purple-500/40"
                    : "bg-slate-900/40 text-slate-400 border border-white/5 hover:text-slate-200"
                }`}
              >
                <Icon className={`h-3 w-3 ${item.color || ""}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Görev Listesi */}
      {filteredTasks.length > 0 ? (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* Boş Durum (Empty State) */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-dashed border-white/10 bg-[#111422]/40 p-12 text-center backdrop-blur-md"
        >
          <div className="flex justify-center mb-2">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/10 shadow-xl">
              {searchQuery ? (
                <Search className="h-8 w-8 text-slate-400" />
              ) : activeTab === "completed" ? (
                <Trophy className="h-8 w-8 text-amber-400" />
              ) : (
                <Target className="h-8 w-8 text-purple-400" />
              )}
            </div>
          </div>

          <h3 className="mt-4 font-bold text-base text-white">
            {searchQuery
              ? "Aramana uygun görev bulunamadı"
              : activeTab === "completed"
              ? "Henüz tamamlanan görev yok"
              : "Harika! Bekleyen aktif görev kalmadı"}
          </h3>

          <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? "Farklı bir arama terimi veya filtre seçmeyi deneyebilirsin."
              : activeTab === "completed"
              ? "Görevlerini tamamladıkça kazandığın XP'ler ve tamamlananlar burada listelenecek."
              : "Yeni bir hedef ekle veya biraz dinlenip başarının tadını çıkar."}
          </p>
        </motion.div>
      )}
    </div>
  );
}

export default TaskList;