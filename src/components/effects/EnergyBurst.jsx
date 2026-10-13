import { motion, AnimatePresence } from "motion/react";

/**
 * EnergyBurst Component
 * Göreve tıklandığında veya buton tetiklendiğinde koordinat merkezli
 * parçacık ve şok dalgası patlaması
 * @param {Array} burstEvents - [{ id, x, y, color }]
 */
function EnergyBurst({ burstEvents = [] }) {
  const PARTICLE_COUNT = 14;

  return (
    <div className="pointer-events-none fixed inset-0 z-[115] overflow-hidden">
      <AnimatePresence>
        {burstEvents.map((burst) => {
          const posX = burst.x || window.innerWidth / 2;
          const posY = burst.y || window.innerHeight / 2;
          const primaryColor = burst.color || "#a855f7";

          return (
            <div
              key={burst.id}
              className="absolute"
              style={{ left: posX, top: posY }}
            >
              {/* Genişleyen Şok Halkası 1 */}
              <motion.div
                initial={{ scale: 0.2, opacity: 0.9, borderWidth: "6px" }}
                animate={{ scale: 3.5, opacity: 0, borderWidth: "1px" }}
                transition={{ duration: 0.65, ease: [0.1, 0.9, 0.2, 1] }}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full h-16 w-16"
                style={{
                  borderColor: primaryColor,
                  boxShadow: `0 0 20px ${primaryColor}`,
                }}
              />

              {/* Genişleyen Şok Halkası 2 (Hafif gecikmeli) */}
              <motion.div
                initial={{ scale: 0.1, opacity: 0.7 }}
                animate={{ scale: 2.8, opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.05, ease: "easeOut" }}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full h-12 w-12 border border-white"
              />

              {/* Dışarı Fırlayan Parçacıklar */}
              {Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
                const angle = (i * (360 / PARTICLE_COUNT) * Math.PI) / 180;
                const distance = 45 + Math.random() * 45;
                const targetX = Math.cos(angle) * distance;
                const targetY = Math.sin(angle) * distance;
                const size = 3 + Math.random() * 4;

                return (
                  <motion.span
                    key={i}
                    initial={{
                      x: 0,
                      y: 0,
                      scale: 1,
                      opacity: 1,
                    }}
                    animate={{
                      x: targetX,
                      y: targetY,
                      scale: 0,
                      opacity: 0,
                    }}
                    transition={{
                      duration: 0.55 + Math.random() * 0.2,
                      ease: [0.15, 0.85, 0.35, 1],
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                      width: size,
                      height: size,
                      backgroundColor: i % 2 === 0 ? "#ffffff" : primaryColor,
                      boxShadow: `0 0 10px ${primaryColor}`,
                    }}
                  />
                );
              })}
            </div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default EnergyBurst;
