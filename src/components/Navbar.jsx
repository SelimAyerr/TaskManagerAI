import { motion } from "motion/react";
import { useGame } from "../context/GameContext";
import { useAI } from "../context/AIContext";
import BadgeMenu from "./BadgeMenu";
import { Bot, Volume2, VolumeX } from "lucide-react";

function Navbar() {
  const {
    activeTab,
    setActiveTab,
    activeTasks,
    completedTasks,
    tasks,
    currentLevel,
    totalXp,
    currentTier,
    currentTitle,
    soundOn,
    toggleSound,
    setRoadmapOpen,
  } = useGame();

  const { setIsChatOpen, isAIConfigured } = useAI();

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#0c0e18]/80 backdrop-blur-2xl">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-3">
          
          {/* Logo & Seviye / Unvan Bilgisi */}
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-purple-600/30 to-slate-900 shadow-[0_0_20px_rgba(168,85,247,0.3)] overflow-hidden"
              onClick={() => setRoadmapOpen(true)}
              title="Seviye Yol Haritasını Gör"
            >
              <img
                src="/brand-icon-64.png"
                alt="XFlowAI Logo"
                className="h-7 w-7 rounded-md object-contain"
              />
              {currentLevel >= 10 && (
                <span
                  className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#0c0e18] animate-pulse"
                  style={{ backgroundColor: currentTier.color }}
                />
              )}
            </motion.div>

            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight text-white">
                  XFlow<span className="text-purple-400">AI</span>
                </span>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: `${currentTier.color}25`,
                    color: currentTier.color,
                    border: `1px solid ${currentTier.color}40`,
                  }}
                >
                  {currentTier.name}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {currentTitle.icon} {currentTitle.title}
              </p>
            </div>
          </div>

          {/* Sekme Seçicileri (Masaüstü) */}
          <div className="hidden sm:flex items-center rounded-xl border border-white/5 bg-slate-900/60 p-1 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === "all"
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>Tümü</span>
              <span className="rounded-full bg-white/10 px-1.5 py-0.2 text-[10px] text-slate-300">
                {tasks.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("active")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
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
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
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

          {/* Sağ Alan: AI Asistan, Ses, XP/Level Pill, Rozetler */}
          <div className="flex items-center gap-2">
            {/* AI Asistanı / Koç Butonu */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => setIsChatOpen(true)}
              className="relative flex h-9 items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-600/15 px-2.5 text-xs font-bold text-purple-200 transition hover:bg-purple-600/25 hover:border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
              title="AI Üretkenlik Koçu ile Konuş"
            >
              <Bot className="h-4 w-4 text-purple-300" />
              <span className="hidden sm:inline">AI Koç</span>
              {isAIConfigured && (
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </motion.button>

            {/* Ses Efekti Aç/Kapat */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={toggleSound}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 bg-slate-900/60 text-slate-400 transition hover:border-white/15 hover:text-white"
              title={soundOn ? "Sesi Kapat" : "Sesi Aç"}
            >
              {soundOn ? (
                <Volume2 className="h-4 w-4 text-purple-300" />
              ) : (
                <VolumeX className="h-4 w-4 text-slate-500" />
              )}
            </motion.button>

            {/* Level / XP Rozeti (Tıklanınca Yol Haritası açılır) */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setRoadmapOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/70 px-3 py-1.5 transition hover:border-purple-500/40"
              title="Seviye ve Ödül Haritasını Aç"
            >
              <span
                className="flex h-5 w-5 items-center justify-center rounded-md text-[11px] font-black text-white"
                style={{ backgroundColor: currentTier.color }}
              >
                {currentLevel}
              </span>
              <div className="text-left hidden md:block">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                  Level {currentLevel}
                </p>
                <p className="text-xs font-black text-white leading-tight">
                  {totalXp.toLocaleString("tr-TR")} <span className="text-[10px] text-purple-400">XP</span>
                </p>
              </div>
            </motion.button>

            {/* Rozet Menüsü Butonu */}
            <BadgeMenu />
          </div>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;
