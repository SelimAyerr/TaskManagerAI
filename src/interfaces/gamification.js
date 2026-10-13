import {
  TIERS,
  LEVEL_MILESTONES,
  getTierForLevel,
  getTitleForLevel,
  getNextMilestone,
} from "../config/levels";
import { BADGES } from "../config/badges";

// Görev önceliğine göre kazanılan temel XP
export const getTaskXp = (priority) => {
  if (priority === "Yüksek") return 150;
  if (priority === "Orta") return 75;
  return 35; // Düşük
};

// Seviye atlamak için gereken toplam XP eşikleri
// Formül: Kademeli ve dengeli büyüme:
// Seviye n için toplam kümülatif XP:
// 1-10 arası hızlı ilerleme, ardından tatmin edici ritim.
export const getTotalXpForLevel = (level) => {
  if (level <= 1) return 0;
  // Parabolik + doğrusal yumuşak eğri
  // Level 2: 120 XP
  // Level 5: 900 XP
  // Level 10: 2,800 XP
  // Level 20: 8,500 XP
  // Level 50: 38,000 XP
  // Level 100: 130,000 XP
  const l = level - 1;
  return Math.floor(65 * l + 28 * Math.pow(l, 1.85));
};

// Belirli bir seviyenin o seviye içinde istediği tekil XP
export const getXpForLevel = (level) => {
  if (level <= 1) return 0;
  return getTotalXpForLevel(level) - getTotalXpForLevel(level - 1);
};

// Toplam XP'den seviyeyi hesapla (ikili arama veya hızlı döngü)
export const calculateLevel = (xp) => {
  if (!xp || xp <= 0) return 1;

  let low = 1;
  let high = 500; // max search ceiling

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const requiredXp = getTotalXpForLevel(mid);

    if (requiredXp <= xp) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return Math.max(1, high);
};

// Seviye içi ilerleme yüzdesi ve detayları
export const getLevelProgress = (xp = 0) => {
  const safeXp = Math.max(0, Number(xp) || 0);
  const level = calculateLevel(safeXp);

  const currentLevelBaseXp = getTotalXpForLevel(level);
  const nextLevelBaseXp = getTotalXpForLevel(level + 1);

  const required = Math.max(1, nextLevelBaseXp - currentLevelBaseXp);
  const current = Math.max(0, safeXp - currentLevelBaseXp);

  const percentage = Math.min(100, Math.max(0, (current / required) * 100));
  const tier = getTierForLevel(level);
  const titleInfo = getTitleForLevel(level);

  return {
    level,
    current,
    required,
    percentage,
    nextLevelXp: nextLevelBaseXp,
    tier,
    titleInfo,
  };
};

// Geriye dönük uyumluluk için levelRewards
export const levelRewards = LEVEL_MILESTONES;

// Unvan getirici
export const getCurrentTitle = (level) => {
  return getTitleForLevel(level);
};

// Dışa aktarma
export { TIERS, LEVEL_MILESTONES, BADGES, getTierForLevel, getNextMilestone };