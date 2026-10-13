import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ArrowDownRight } from "lucide-react";

/**
 * XPFloat Component
 * Ekranda XP kazanıldığında uçuşan ışıltılı floating XP bildirimi
 * @param {Array} floatEvents - [{ id, xp, x, y, label, offsetX }]
 */
function XPFloat({ floatEvents = [] }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[120] overflow-hidden">
      <AnimatePresence>
        {floatEvents.map((evt) => {
          const posX = evt.x !== undefined ? evt.x : window.innerWidth / 2;
          const posY = evt.y !== undefined ? evt.y : window.innerHeight / 2;
          const offsetDrift = (evt.id % 40) - 20;

          return (
            <motion.div
              key={evt.id}
              initial={{
                opacity: 0,
                y: posY,
                x: posX,
                scale: 0.6,
                filter: "blur(4px)",
              }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: posY - 90,
                x: posX + offsetDrift,
                scale: [0.6, 1.25, 1.1, 0.9],
                filter: "blur(0px)",
              }}
              exit={{
                opacity: 0,
                y: posY - 130,
                scale: 0.7,
              }}
              transition={{
                duration: 1.2,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 select-none"
            >
              {(() => {
                const isNegative = Number(evt.xp) < 0;
                return (
                  <div
                    className={`relative flex items-center gap-1.5 rounded-full px-4 py-1.5 backdrop-blur-md shadow-lg ${
                      isNegative
                        ? "border border-rose-400/60 bg-gradient-to-r from-rose-600/95 via-red-600/95 to-orange-600/95 shadow-[0_0_25px_rgba(244,63,94,0.6)]"
                        : "border border-amber-300/60 bg-gradient-to-r from-amber-500/90 via-purple-600/90 to-fuchsia-600/90 shadow-[0_0_25px_rgba(234,179,8,0.5)]"
                    }`}
                  >
                    {isNegative ? (
                      <ArrowDownRight className="h-4 w-4 text-white" />
                    ) : (
                      <Sparkles className="h-4 w-4 text-amber-200" />
                    )}
                    <span className="font-black tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-base">
                      {isNegative ? evt.xp : `+${evt.xp}`} {evt.label || "XP"}
                    </span>
                    <motion.span
                      className={`absolute inset-0 rounded-full border ${
                        isNegative ? "border-rose-300/40" : "border-white/40"
                      }`}
                      animate={{
                        scale: [1, 1.4, 1.8],
                        opacity: [0.8, 0.4, 0],
                      }}
                      transition={{
                        duration: 0.8,
                        ease: "easeOut",
                      }}
                    />
                  </div>
                );
              })()}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default XPFloat;
