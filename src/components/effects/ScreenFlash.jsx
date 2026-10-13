import { motion, AnimatePresence } from "motion/react";

/**
 * ScreenFlash Component
 * Seviye atlandığında veya efsanevi bir ödül açıldığında
 * ekranı kaplayan sinematik, yumuşak parıltı ve şok dalgası
 * @param {boolean} active - Flaş aktif mi?
 * @param {string} color - Flaş aydınlatma rengi (hex veya rgba)
 */
function ScreenFlash({ active, color = "rgba(168, 85, 247, 0.45)" }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="pointer-events-none fixed inset-0 z-[110] overflow-hidden"
        >
          {/* Merkezi Işık Patlaması */}
          <motion.div
            initial={{ scale: 0.4, opacity: 0.9 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-1/2 top-1/2 h-[80vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background: `radial-gradient(circle, ${color} 0%, rgba(255,255,255,0.2) 25%, transparent 70%)`,
              filter: "blur(40px)",
            }}
          />

          {/* Dış Kenar Şok Dalgası Halka */}
          <motion.div
            initial={{ scale: 0.8, opacity: 1, borderWidth: "12px" }}
            animate={{ scale: 2.2, opacity: 0, borderWidth: "1px" }}
            transition={{ duration: 0.85, ease: "easeOut" }}
            className="absolute left-1/2 top-1/2 h-[60vh] w-[60vw] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/60"
          />

          {/* İnce Vignette Flaş */}
          <motion.div
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-0 bg-white/20 backdrop-blur-[2px]"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ScreenFlash;
