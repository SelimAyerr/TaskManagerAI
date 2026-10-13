// ==========================================
// Level Visual Effects Configuration
// Parçacık, Aura ve Arka Plan Efektleri
// ==========================================

export const levelEffectsConfig = {
  beginner: {
    minLevel: 1,
    tierId: "novice",
    colors: ["#94a3b8", "#cbd5e1", "#ffffff"],
    particleColor: ["#94a3b8", "#cbd5e1", "#ffffff"],
    background:
      "radial-gradient(circle at 20% 20%, rgba(148,163,184,0.14), transparent 30%), radial-gradient(circle at 80% 70%, rgba(203,213,225,0.12), transparent 35%)",
    glowColor: "rgba(148, 163, 184, 0.4)",
    particleCount: 50,
    speed: 0.35,
    size: 1.8,
    opacity: 0.55,
    links: false,
    aura: "none",
  },

  hunter: {
    minLevel: 10,
    tierId: "hunter",
    colors: ["#fb923c", "#ef4444", "#facc15"],
    particleColor: ["#fb923c", "#ef4444", "#facc15"],
    background:
      "radial-gradient(circle at 15% 80%, rgba(249,115,22,0.20), transparent 32%), radial-gradient(circle at 85% 20%, rgba(239,68,68,0.16), transparent 32%)",
    glowColor: "rgba(249, 115, 22, 0.5)",
    particleCount: 75,
    speed: 0.9,
    size: 2.2,
    opacity: 0.75,
    links: false,
    aura: "fire",
  },

  expert: {
    minLevel: 20,
    tierId: "expert",
    colors: ["#06b6d4", "#2563eb", "#67e8f9", "#ffffff"],
    particleColor: ["#06b6d4", "#2563eb", "#67e8f9", "#ffffff"],
    background:
      "radial-gradient(circle at 20% 30%, rgba(6,182,212,0.20), transparent 30%), radial-gradient(circle at 80% 70%, rgba(37,99,235,0.18), transparent 35%)",
    glowColor: "rgba(6, 182, 212, 0.55)",
    particleCount: 90,
    speed: 1.1,
    size: 2,
    opacity: 0.8,
    links: true,
    aura: "electric",
  },

  master: {
    minLevel: 30,
    tierId: "master",
    colors: ["#facc15", "#f59e0b", "#fde68a", "#ffffff"],
    particleColor: ["#facc15", "#f59e0b", "#fde68a", "#ffffff"],
    background:
      "radial-gradient(circle at 50% 15%, rgba(250,204,21,0.24), transparent 30%), radial-gradient(circle at 20% 80%, rgba(245,158,11,0.18), transparent 35%)",
    glowColor: "rgba(234, 179, 8, 0.6)",
    particleCount: 105,
    speed: 0.95,
    size: 2.4,
    opacity: 0.85,
    links: true,
    aura: "gold",
  },

  legendary: {
    minLevel: 50,
    tierId: "legend",
    colors: ["#22d3ee", "#a855f7", "#ec4899", "#ffffff"],
    particleColor: ["#22d3ee", "#a855f7", "#ec4899", "#ffffff"],
    background:
      "radial-gradient(circle at 15% 25%, rgba(34,211,238,0.22), transparent 30%), radial-gradient(circle at 85% 75%, rgba(168,85,247,0.24), transparent 35%), radial-gradient(circle at 50% 50%, rgba(236,72,153,0.15), transparent 45%)",
    glowColor: "rgba(168, 85, 247, 0.65)",
    particleCount: 130,
    speed: 0.85,
    size: 2.2,
    opacity: 0.9,
    links: true,
    aura: "cosmic",
  },

  cosmic: {
    minLevel: 75,
    tierId: "cosmic",
    colors: ["#22d3ee", "#818cf8", "#a855f7", "#ec4899", "#ffffff"],
    particleColor: ["#22d3ee", "#818cf8", "#a855f7", "#ec4899", "#ffffff"],
    background:
      "radial-gradient(circle at 20% 20%, rgba(34,211,238,0.20), transparent 30%), radial-gradient(circle at 80% 20%, rgba(168,85,247,0.22), transparent 32%), radial-gradient(circle at 50% 85%, rgba(236,72,153,0.18), transparent 35%)",
    glowColor: "rgba(236, 72, 153, 0.7)",
    particleCount: 155,
    speed: 0.75,
    size: 2.3,
    opacity: 0.92,
    links: true,
    aura: "galaxy",
  },

  immortal: {
    minLevel: 100,
    tierId: "immortal",
    colors: ["#fef08a", "#facc15", "#fb923c", "#f472b6", "#a78bfa", "#ffffff"],
    particleColor: ["#fef08a", "#facc15", "#fb923c", "#f472b6", "#a78bfa", "#ffffff"],
    background:
      "radial-gradient(circle at 50% 50%, rgba(250,204,21,0.22), transparent 25%), radial-gradient(circle at 15% 20%, rgba(244,114,182,0.22), transparent 30%), radial-gradient(circle at 85% 80%, rgba(167,139,250,0.24), transparent 35%)",
    glowColor: "rgba(251, 191, 36, 0.8)",
    particleCount: 190,
    speed: 0.8,
    size: 2.5,
    opacity: 1,
    links: true,
    aura: "divine",
  },
};

export function getLevelEffect(level) {
  const levels = Object.values(levelEffectsConfig).sort(
    (a, b) => b.minLevel - a.minLevel
  );

  return levels.find((eff) => level >= eff.minLevel) || levelEffectsConfig.beginner;
}