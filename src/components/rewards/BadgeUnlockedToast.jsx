import { motion, AnimatePresence } from "motion/react";
import { useGame } from "../../context/GameContext";
import { Sparkles, X } from "lucide-react";

function BadgeUnlockedToast() {
  const { badgeUnlockedToast, closeBadgeToast } = useGame();

  if (!badgeUnlockedToast) return null;

  return (
    <AnimatePresence>
      <div className="fixed bottom-6 right-6 z-[140] pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="flex items-center gap-3.5 rounded-2xl border border-amber-400/40 bg-[#121526]/95 p-4 shadow-[0_10px_35px_rgba(245,158,11,0.25)] backdrop-blur-2xl"
        >
          {/* Parıldayan İkon */}
          <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-2xl shadow-lg shadow-amber-500/30">
            <span>{badgeUnlockedToast.icon}</span>
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-amber-600 shadow-sm">
              <Sparkles className="h-2.5 w-2.5" />
            </span>
          </div>

          <div className="min-w-0 pr-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-amber-400">
              YENİ ROZET AÇILDI!
            </p>
            <h4 className="font-extrabold text-sm text-white">
              {badgeUnlockedToast.name}
            </h4>
            <p className="text-xs text-purple-300 font-semibold">
              +{badgeUnlockedToast.rewardXp} Bonus XP Eklendi
            </p>
          </div>

          <button
            type="button"
            onClick={closeBadgeToast}
            className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default BadgeUnlockedToast;
