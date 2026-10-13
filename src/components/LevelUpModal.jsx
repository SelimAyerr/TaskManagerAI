import { motion, AnimatePresence } from "motion/react";
import { useGame } from "../context/GameContext";
import { Sparkles } from "lucide-react";

function LevelUpModal() {
  const { levelUpModalData, closeLevelUpModal } = useGame();

  if (!levelUpModalData) return null;

  const { level, reward, tier } = levelUpModalData;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeLevelUpModal}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Kartı */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-[#121526] shadow-[0_0_60px_rgba(168,85,247,0.4)]"
        >
          {/* Üst Zafer Başlığı (Gradient Header) */}
          <div
            className="relative px-6 py-10 text-center text-white overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${tier.color}40 0%, #171a2e 100%)`,
            }}
          >
            {/* Arka plan ışık halkası */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute -top-12 left-1/2 -translate-x-1/2 h-56 w-56 rounded-full border border-white/10 border-dashed"
            />

            {/* İkon */}
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: [0, 1.25, 1], rotate: [0, 10, 0] }}
              transition={{ duration: 0.6 }}
              className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-3xl border border-white/20 text-5xl shadow-2xl backdrop-blur-md"
              style={{
                backgroundColor: `${tier.color}30`,
                boxShadow: `0 0 35px ${tier.color}60`,
              }}
            >
              <span>{reward.icon}</span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-xs font-black uppercase tracking-[0.3em] text-purple-300"
            >
              SEVİYE YÜKSELDİ!
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-1 text-4xl font-black tracking-tight"
            >
              Seviye {level}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-1 text-sm font-bold text-slate-300"
            >
              {tier.name} Kademesi · {reward.title}
            </motion.p>
          </div>

          {/* Gövde: Açılan Ayrıcalıklar */}
          <div className="p-6 text-center space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              {reward.description || "Görevlerindeki disiplin ve hız sayesinde yeni bir zirveye ulaştın!"}
            </p>

            {/* Kazanılan Ayrıcalık Kutusu */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                Açılan Yeni Güç & Unvan
              </span>
              <div className="mt-1.5 flex items-center gap-3">
                <span className="text-2xl">{reward.icon}</span>
                <div>
                  <h4 className="text-sm font-bold text-white">{reward.title}</h4>
                  <p className="text-xs text-slate-400">{reward.unlock || "Gelişmiş Arayüz Aurası"}</p>
                </div>
              </div>
            </div>

            {/* Kapat Butonu */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={closeLevelUpModal}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-fuchsia-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-purple-600/40 transition hover:from-purple-500 hover:to-fuchsia-500"
            >
              <Sparkles className="h-4 w-4" />
              <span>Harika! Yolculuğa Devam Et</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default LevelUpModal;