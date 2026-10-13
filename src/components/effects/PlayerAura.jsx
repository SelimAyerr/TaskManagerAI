import { motion } from "motion/react";
import { getLevelEffect } from "../../config/levelEffects";

function PlayerAura({ level = 1 }) {
  const effect = getLevelEffect(level);
  const colors = effect.colors || ["#94a3b8", "#cbd5e1"];

  const particleCount =
    level >= 100
      ? 16
      : level >= 75
      ? 12
      : level >= 50
      ? 9
      : level >= 30
      ? 6
      : level >= 20
      ? 4
      : level >= 10
      ? 3
      : 0;

  return (
    <>
      {/* Ana yumuşak renk halesi (Ambient Glow) */}
      <motion.div
        className="pointer-events-none absolute -inset-4 rounded-3xl blur-2xl"
        animate={{
          scale: [0.98, 1.04, 0.98],
          opacity: [0.15, 0.35, 0.15],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          background: `radial-gradient(circle, ${colors[0]}70 0%, transparent 70%)`,
        }}
      />

      {/* Dönen Conic Enerji Halkası (Level 10+) */}
      {level >= 10 && (
        <motion.div
          className="pointer-events-none absolute -inset-[2px] rounded-2xl opacity-40 blur-[1px]"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: level >= 75 ? 8 : 14,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            background: `conic-gradient(
              from 0deg,
              transparent 0deg,
              ${colors[0]}00 40deg,
              ${colors[0]}90 90deg,
              transparent 140deg,
              ${colors[1] || colors[0]}80 220deg,
              transparent 280deg,
              ${colors[0]}70 330deg,
              transparent 360deg
            )`,
          }}
        />
      )}

      {/* Yüzen mikro parçacıklar */}
      {particleCount > 0 && (
        <div className="pointer-events-none absolute inset-0 overflow-visible">
          {Array.from({ length: particleCount }).map((_, index) => {
            const color = colors[index % colors.length];
            const left = 6 + ((index * 21) % 88);
            const top = 10 + ((index * 29) % 80);
            const duration = 2.6 + (index % 4) * 0.5;

            return (
              <motion.span
                key={index}
                className="absolute rounded-full"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  width: level >= 75 ? "5px" : "3.5px",
                  height: level >= 75 ? "5px" : "3.5px",
                  backgroundColor: color,
                  boxShadow: `0 0 10px 2px ${color}`,
                }}
                animate={{
                  x: [0, index % 2 === 0 ? 8 : -8, 0],
                  y: [4, -16 - (index % 3) * 6, 4],
                  opacity: [0.1, 0.9, 0.1],
                  scale: [0.5, 1.2, 0.5],
                }}
                transition={{
                  duration,
                  delay: index * 0.15,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            );
          })}
        </div>
      )}

      {/* Yüksek seviye kozmik çerçeve hatları (Level 50+) */}
      {level >= 50 && (
        <motion.div
          className="pointer-events-none absolute -inset-2 rounded-2xl border opacity-20"
          style={{
            borderColor: colors[0],
          }}
          animate={{
            scale: [0.99, 1.02, 0.99],
            opacity: [0.15, 0.35, 0.15],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </>
  );
}

export default PlayerAura;