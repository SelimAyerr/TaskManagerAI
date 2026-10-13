import { motion, AnimatePresence } from "motion/react";
import { useGame } from "../../context/GameContext";
import { TIERS, LEVEL_MILESTONES } from "../../config/levels";
import { Map, X, Check, Unlock } from "lucide-react";

function LevelRoadmap() {
  const { roadmapOpen, setRoadmapOpen, currentLevel, totalXp } = useGame();

  if (!roadmapOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setRoadmapOpen(false)}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Kartı */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          className="relative z-10 w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl border border-white/15 bg-[#101323] shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 p-5 bg-slate-900/50">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Map className="h-5 w-5 text-purple-400" />
                <span>Seviye & Kademe Yol Haritası</span>
              </h3>
              <p className="text-xs text-slate-400">
                Mevcut Durum: <strong className="text-purple-300">Seviye {currentLevel}</strong> ({totalXp.toLocaleString("tr-TR")} XP)
              </p>
            </div>

            <button
              type="button"
              onClick={() => setRoadmapOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* İçerik: 7 Kademe ve Dönüm Noktaları */}
          <div className="overflow-y-auto p-5 space-y-6">
            
            {/* 7 Kademe Vitrini */}
            <div>
              <h4 className="mb-2.5 text-xs font-black uppercase tracking-wider text-slate-400">
                7 Ana Üretkenlik Kademesi
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TIERS.map((tier) => {
                  const isCurrent = currentLevel >= tier.minLevel && currentLevel <= tier.maxLevel;
                  const isUnlocked = currentLevel >= tier.minLevel;

                  return (
                    <div
                      key={tier.id}
                      className={`rounded-2xl border p-3 text-center transition-all ${
                        isCurrent
                          ? "border-purple-500 bg-purple-500/20 shadow-md shadow-purple-500/20"
                          : isUnlocked
                          ? "border-white/10 bg-slate-900/60"
                          : "border-white/5 bg-slate-950/40 opacity-40"
                      }`}
                    >
                      <span className="text-2xl">{tier.icon}</span>
                      <h5 className="mt-1 font-bold text-xs text-white">{tier.name}</h5>
                      <p className="text-[10px] text-slate-400">
                        {tier.minLevel === tier.maxLevel
                          ? `Lvl ${tier.minLevel}`
                          : tier.maxLevel === Infinity
                          ? `Lvl ${tier.minLevel}+`
                          : `Lvl ${tier.minLevel}-${tier.maxLevel}`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dönüm Noktaları Yol Haritası (Timeline) */}
            <div>
              <h4 className="mb-3 text-xs font-black uppercase tracking-wider text-slate-400">
                Önemli Seviye Kilidi Açılanlar
              </h4>

              <div className="relative pl-6 space-y-4 border-l-2 border-white/10 ml-3">
                {LEVEL_MILESTONES.map((m) => {
                  const isAchieved = currentLevel >= m.level;

                  return (
                    <div key={m.level} className="relative">
                      {/* Çizgi Üstü Nokta */}
                      <span
                        className={`absolute -left-[31px] top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 text-[10px] ${
                          isAchieved
                            ? "border-purple-400 bg-purple-600 text-white shadow-[0_0_10px_#a855f7]"
                            : "border-slate-700 bg-slate-900 text-slate-500"
                        }`}
                      >
                        {isAchieved ? <Check className="h-3 w-3" /> : m.level}
                      </span>

                      <div
                        className={`rounded-2xl border p-3.5 transition-all ${
                          isAchieved
                            ? "border-purple-500/30 bg-purple-500/10"
                            : "border-white/5 bg-slate-900/40 opacity-60"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{m.icon}</span>
                            <div>
                              <h5 className="text-xs font-extrabold text-white">
                                Seviye {m.level} · {m.title}
                              </h5>
                              <p className="text-[11px] text-purple-300 font-semibold flex items-center gap-1">
                                <Unlock className="h-3 w-3 inline text-purple-300" />
                                <span>Kilit: {m.unlock}</span>
                              </p>
                            </div>
                          </div>

                          {m.bonusXp > 0 && (
                            <span className="rounded-lg bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                              +{m.bonusXp} Bonus XP
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-[11px] text-slate-400">
                          {m.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="border-t border-white/10 p-4 bg-slate-900/50 text-center">
            <button
              type="button"
              onClick={() => setRoadmapOpen(false)}
              className="rounded-xl bg-white/10 px-6 py-2 text-xs font-bold text-white hover:bg-white/15 transition"
            >
              Kapat
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default LevelRoadmap;
