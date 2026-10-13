import { useState } from "react";
import { motion } from "motion/react";
import { useGame } from "../context/GameContext";
import { useAI } from "../context/AIContext";
import PlayerAura from "./effects/PlayerAura";
import { Pencil, Bot, ArrowRight } from "lucide-react";

function PlayerProfile() {
  const {
    playerName,
    setPlayerName,
    totalXp,
    currentLevel,
    progress,
    currentTier,
    currentTitle,
    stats,
    setRoadmapOpen,
  } = useGame();

  const { userMemory, setIsWizardOpen } = useAI();

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(playerName);

  const handleSaveName = () => {
    const trimmed = tempName.trim();
    if (trimmed) {
      setPlayerName(trimmed);
      localStorage.setItem("playerNameCustomized", "true");
    }
    setIsEditingName(false);
  };

  const completionRate =
    stats.totalCount > 0
      ? Math.round((stats.completedCount / stats.totalCount) * 100)
      : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-visible rounded-3xl border border-white/[0.08] bg-[#111422]/70 p-6 shadow-2xl backdrop-blur-xl"
    >
      {/* Seviye Aurası */}
      <PlayerAura level={currentLevel} />

      <div className="relative z-10 flex flex-col gap-5">
        
        {/* Üst Satır: Oyuncu Kimliği (Sol) ve Mini Sayaçlar (Sağ) */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          
          {/* Sol: Avatar, İsim ve Rozetler */}
          <div className="flex items-center gap-4 sm:gap-5">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="relative flex-shrink-0"
            >
              <div
                className="flex h-16 w-16 sm:h-18 sm:w-18 items-center justify-center rounded-2xl text-3xl sm:text-4xl shadow-lg border border-white/20 transition-all duration-500"
                style={{
                  background: `linear-gradient(135deg, ${currentTier.color}35 0%, #151829 100%)`,
                  boxShadow: `0 10px 25px -5px ${currentTier.color}40`,
                }}
              >
                <span>{currentTitle.icon}</span>
              </div>

              {/* Tier Yıldızı / Rozet Rozet */}
              <span
                className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#111422] text-xs shadow-md"
                style={{ backgroundColor: currentTier.color }}
                title={`${currentTier.name} Tier`}
              >
                {currentTier.icon}
              </span>
            </motion.div>

            <div className="min-w-0">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                    autoFocus
                    maxLength={22}
                    className="rounded-xl border border-purple-500/50 bg-slate-900/90 px-3 py-1 text-base font-bold text-white outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                  <button
                    type="button"
                    onClick={handleSaveName}
                    className="rounded-xl bg-purple-600 px-3 py-1 text-xs font-bold text-white transition hover:bg-purple-500"
                  >
                    Tamam
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    {playerName}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setTempName(playerName === "Oyuncu" ? "" : playerName);
                      setIsEditingName(true);
                    }}
                    className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition ${
                      playerName === "Oyuncu"
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30"
                        : "text-slate-400 opacity-60 hover:bg-white/10 hover:opacity-100"
                    }`}
                    title="İsmini Düzenle"
                  >
                    <Pencil className="h-3 w-3" />
                    {playerName === "Oyuncu" && <span>İsim Belirle</span>}
                  </button>
                </div>
              )}

              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                  style={{
                    backgroundColor: `${currentTier.color}25`,
                    color: currentTier.color,
                    border: `1px solid ${currentTier.color}45`,
                  }}
                >
                  {currentTier.name} · Kademe {currentLevel}
                </span>

                <span className="text-xs text-slate-400 font-medium">
                  {currentTitle.title}
                </span>

                {userMemory?.identity?.occupation && (
                  <button
                    type="button"
                    onClick={() => setIsWizardOpen(true)}
                    className="rounded-full bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 text-[11px] font-semibold text-purple-300 transition hover:bg-purple-500/25 flex items-center gap-1.5"
                    title="AI Profilini Düzenle"
                  >
                    <Bot className="h-3.5 w-3.5" />
                    <span>{userMemory.identity.occupation}</span>
                    {userMemory.identity.workStyle ? ` · ${userMemory.identity.workStyle}` : ""}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sağ: Mini İstatistik Sayaçları */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 self-start sm:self-auto">
            <div className="rounded-2xl border border-white/5 bg-slate-900/60 px-3.5 py-2 sm:px-4 sm:py-2.5 text-center backdrop-blur-md min-w-[72px]">
              <p className="text-lg sm:text-xl font-black text-white leading-tight whitespace-nowrap">
                {stats.completedCount}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5 whitespace-nowrap">
                Biten
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-slate-900/60 px-3.5 py-2 sm:px-4 sm:py-2.5 text-center backdrop-blur-md min-w-[72px]">
              <p className="text-lg sm:text-xl font-black text-emerald-400 leading-tight whitespace-nowrap">
                %{completionRate}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5 whitespace-nowrap">
                Başarı
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-slate-900/60 px-3.5 py-2 sm:px-4 sm:py-2.5 text-center backdrop-blur-md min-w-[72px]">
              <p className="text-lg sm:text-xl font-black text-amber-400 leading-tight whitespace-nowrap">
                {stats.badgeCount}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5 whitespace-nowrap">
                Rozet
              </p>
            </div>
          </div>
        </div>

        {/* Alt Satır: Tam Genişlikte XP İlerleme Çubuğu Bölümü */}
        <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-4 backdrop-blur-md">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-slate-200 flex items-center gap-2 whitespace-nowrap">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: currentTier.color }}
              />
              Seviye {currentLevel} İlerlemesi · {currentTier.name} Kademesi
            </span>

            <span className="font-mono font-bold text-purple-300 whitespace-nowrap">
              {progress.current.toLocaleString("tr-TR")} /{" "}
              {progress.required.toLocaleString("tr-TR")} XP{" "}
              <span className="text-slate-400 font-normal ml-1">
                (%{Math.round(progress.percentage)})
              </span>
            </span>
          </div>

          {/* İlerleme Çubuğu */}
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-950/80 border border-white/5">
            <motion.div
              className="relative h-full rounded-full animate-shimmer"
              style={{
                width: `${progress.percentage}%`,
                background: `linear-gradient(90deg, #7c3aed 0%, ${currentTier.color} 50%, #ec4899 100%)`,
                boxShadow: `0 0 15px ${currentTier.color}60`,
              }}
              initial={false}
              animate={{ width: `${progress.percentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>

          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span className="whitespace-nowrap">
              Toplam Kazanılan:{" "}
              <strong className="text-white font-mono">
                {totalXp.toLocaleString("tr-TR")} XP
              </strong>
            </span>

            <button
              type="button"
              onClick={() => setRoadmapOpen(true)}
              className="font-bold text-purple-400 hover:text-purple-300 transition hover:underline flex items-center gap-1 whitespace-nowrap"
            >
              <span>Yol Haritasını Görüntüle</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

export default PlayerProfile;