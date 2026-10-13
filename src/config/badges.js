// ==========================================
// Badges Configuration & Eligibility Logic
// Kapsamlı ve Otomatik Rozet Sistemi
// ==========================================

export const BADGE_CATEGORIES = {
  TASKS: { id: "tasks", name: "Görev Başarımları", icon: "🎯" },
  PRIORITY: { id: "priority", name: "Zorluk & Öncelik", icon: "⚔️" },
  LEVEL: { id: "level", name: "Seviye Basamakları", icon: "⭐" },
  SPECIAL: { id: "special", name: "Özel Marifetler", icon: "✨" },
};

export const BADGES = [
  // --- Görev Başarımları ---
  {
    id: "first-step",
    name: "İlk Adım",
    category: "tasks",
    icon: "🌱",
    description: "İlk görevini başarıyla tamamla.",
    requirementText: "1 Görev",
    rewardXp: 50,
    check: ({ completedCount }) => completedCount >= 1,
    progress: ({ completedCount }) => ({ current: Math.min(completedCount, 1), target: 1 }),
  },
  {
    id: "task-5",
    name: "Çırak Avcı",
    category: "tasks",
    icon: "🎯",
    description: "Toplam 5 görev tamamla.",
    requirementText: "5 Görev",
    rewardXp: 120,
    check: ({ completedCount }) => completedCount >= 5,
    progress: ({ completedCount }) => ({ current: Math.min(completedCount, 5), target: 5 }),
  },
  {
    id: "task-10",
    name: "Görev Makinesi",
    category: "tasks",
    icon: "⚡",
    description: "Toplam 10 görev tamamla.",
    requirementText: "10 Görev",
    rewardXp: 250,
    check: ({ completedCount }) => completedCount >= 10,
    progress: ({ completedCount }) => ({ current: Math.min(completedCount, 10), target: 10 }),
  },
  {
    id: "task-25",
    name: "Üretkenlik Efendisi",
    category: "tasks",
    icon: "👑",
    description: "Toplam 25 görev tamamla.",
    requirementText: "25 Görev",
    rewardXp: 500,
    check: ({ completedCount }) => completedCount >= 25,
    progress: ({ completedCount }) => ({ current: Math.min(completedCount, 25), target: 25 }),
  },
  {
    id: "task-50",
    name: "Zaman Bükücü",
    category: "tasks",
    icon: "💎",
    description: "Toplam 50 görev tamamla.",
    requirementText: "50 Görev",
    rewardXp: 1000,
    check: ({ completedCount }) => completedCount >= 50,
    progress: ({ completedCount }) => ({ current: Math.min(completedCount, 50), target: 50 }),
  },
  {
    id: "task-100",
    name: "Yüzlük Titan",
    category: "tasks",
    icon: "🏆",
    description: "Toplam 100 görev tamamla. Efsaneler arasına gir.",
    requirementText: "100 Görev",
    rewardXp: 2500,
    check: ({ completedCount }) => completedCount >= 100,
    progress: ({ completedCount }) => ({ current: Math.min(completedCount, 100), target: 100 }),
  },

  // --- Öncelik & Zorluk ---
  {
    id: "high-priority-3",
    name: "Cesur Savaşçı",
    category: "priority",
    icon: "⚔️",
    description: "3 adet 'Yüksek' öncelikli görevi tamamla.",
    requirementText: "3 Yüksek Görev",
    rewardXp: 180,
    check: ({ highPriorityCompleted }) => highPriorityCompleted >= 3,
    progress: ({ highPriorityCompleted }) => ({
      current: Math.min(highPriorityCompleted, 3),
      target: 3,
    }),
  },
  {
    id: "high-priority-10",
    name: "Kriz Çözücü",
    category: "priority",
    icon: "🛡️",
    description: "10 adet 'Yüksek' öncelikli zorlu görevi tamamla.",
    requirementText: "10 Yüksek Görev",
    rewardXp: 550,
    check: ({ highPriorityCompleted }) => highPriorityCompleted >= 10,
    progress: ({ highPriorityCompleted }) => ({
      current: Math.min(highPriorityCompleted, 10),
      target: 10,
    }),
  },

  // --- Seviye Rozetleri ---
  {
    id: "reach-level-5",
    name: "Yükselen Yıldız",
    category: "level",
    icon: "🌟",
    description: "Seviye 5'e ulaş.",
    requirementText: "Seviye 5",
    rewardXp: 150,
    check: ({ level }) => level >= 5,
    progress: ({ level }) => ({ current: Math.min(level, 5), target: 5 }),
  },
  {
    id: "reach-level-10",
    name: "Alev Muhafızı",
    category: "level",
    icon: "🔥",
    description: "Seviye 10'a ulaş ve Avcı aurasını aç.",
    requirementText: "Seviye 10",
    rewardXp: 350,
    check: ({ level }) => level >= 10,
    progress: ({ level }) => ({ current: Math.min(level, 10), target: 10 }),
  },
  {
    id: "reach-level-25",
    name: "Şimşek Hakimi",
    category: "level",
    icon: "⚡",
    description: "Seviye 25'e ulaş.",
    requirementText: "Seviye 25",
    rewardXp: 750,
    check: ({ level }) => level >= 25,
    progress: ({ level }) => ({ current: Math.min(level, 25), target: 25 }),
  },
  {
    id: "reach-level-50",
    name: "Efsanevi Hüküm",
    category: "level",
    icon: "🌌",
    description: "Seviye 50'ye ulaşarak Kozmik kapıları arala.",
    requirementText: "Seviye 50",
    rewardXp: 1500,
    check: ({ level }) => level >= 50,
    progress: ({ level }) => ({ current: Math.min(level, 50), target: 50 }),
  },

  // --- Özel Marifetler ---
  {
    id: "all-clear",
    name: "Temiz Masa",
    category: "special",
    icon: "✨",
    description: "Hiç bekleyen aktif görev bırakma (En az 3 görev tamamlanmışken).",
    requirementText: "0 Aktif Görev",
    rewardXp: 200,
    check: ({ activeCount, completedCount }) => completedCount >= 3 && activeCount === 0,
    progress: ({ activeCount, completedCount }) => ({
      current: completedCount >= 3 && activeCount === 0 ? 1 : 0,
      target: 1,
    }),
  },
];

// Kazanılabilir ve henüz alınmamış rozetleri tespit et
export const findNewEligibleBadges = (stats, claimedBadgeIds = []) => {
  return BADGES.filter((badge) => {
    if (claimedBadgeIds.includes(badge.id)) return false;
    return badge.check(stats);
  });
};
