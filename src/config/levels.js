// ==========================================
// Level & Tier Configuration System
// 7 Farklı Tier ve 1-100+ Seviye Matrisi
// ==========================================

export const TIERS = [
  {
    id: "novice",
    name: "Acemi",
    nameEn: "Novice",
    minLevel: 1,
    maxLevel: 9,
    icon: "🌱",
    color: "#94a3b8",
    accentColor: "rgba(148, 163, 184, 0.9)",
    bgGradient: "from-slate-900/60 via-slate-800/40 to-slate-950/70",
    borderClass: "border-slate-700/50 hover:border-slate-500/60",
    glowColor: "rgba(148, 163, 184, 0.35)",
    tag: "Acemi Muhafız",
    description: "Yolculuk yeni başlıyor. Temel alışkanlıklar inşa ediliyor.",
  },
  {
    id: "hunter",
    name: "Avcı",
    nameEn: "Hunter",
    minLevel: 10,
    maxLevel: 19,
    icon: "🔥",
    color: "#f97316",
    accentColor: "rgba(249, 115, 22, 0.95)",
    bgGradient: "from-orange-950/40 via-red-950/30 to-slate-950/80",
    borderClass: "border-orange-500/40 hover:border-orange-400/70",
    glowColor: "rgba(249, 115, 22, 0.45)",
    tag: "Alev Avcısı",
    description: "İrade ateşi parıldıyor. Görevler hızla eritiliyor.",
  },
  {
    id: "expert",
    name: "Uzman",
    nameEn: "Expert",
    minLevel: 20,
    maxLevel: 29,
    icon: "⚡",
    color: "#06b6d4",
    accentColor: "rgba(6, 182, 212, 0.95)",
    bgGradient: "from-cyan-950/40 via-blue-950/30 to-slate-950/80",
    borderClass: "border-cyan-500/40 hover:border-cyan-400/70",
    glowColor: "rgba(6, 182, 212, 0.5)",
    tag: "Şimşek Ustası",
    description: "Yüksek odak ve akış durumu. Elektriksel üretkenlik.",
  },
  {
    id: "master",
    name: "Usta",
    nameEn: "Master",
    minLevel: 30,
    maxLevel: 49,
    icon: "👑",
    color: "#eab308",
    accentColor: "rgba(234, 179, 8, 0.95)",
    bgGradient: "from-amber-950/40 via-yellow-950/30 to-slate-950/80",
    borderClass: "border-amber-500/50 hover:border-yellow-400/80",
    glowColor: "rgba(234, 179, 8, 0.55)",
    tag: "Altın Hükümdar",
    description: "Kusursuz disiplin ve kontrol. Görevler sana boyun eğiyor.",
  },
  {
    id: "legend",
    name: "Efsane",
    nameEn: "Legendary",
    minLevel: 50,
    maxLevel: 74,
    icon: "💎",
    color: "#a855f7",
    accentColor: "rgba(168, 85, 247, 0.95)",
    bgGradient: "from-purple-950/45 via-indigo-950/35 to-slate-950/85",
    borderClass: "border-purple-500/50 hover:border-purple-400/80",
    glowColor: "rgba(168, 85, 247, 0.6)",
    tag: "Kristal Zihin",
    description: "Efsanelere konu olacak üretkenlik boyutu.",
  },
  {
    id: "cosmic",
    name: "Kozmik",
    nameEn: "Cosmic",
    minLevel: 75,
    maxLevel: 99,
    icon: "🌌",
    color: "#ec4899",
    accentColor: "rgba(236, 72, 153, 0.95)",
    bgGradient: "from-fuchsia-950/50 via-purple-950/40 to-slate-950/90",
    borderClass: "border-pink-500/50 hover:border-pink-400/80",
    glowColor: "rgba(236, 72, 153, 0.65)",
    tag: "Galaksi Gezgini",
    description: "Zaman ve mekan ötesi hız. Yıldızların enerjisiyle çalışıyor.",
  },
  {
    id: "immortal",
    name: "Ölümsüz",
    nameEn: "Immortal",
    minLevel: 100,
    maxLevel: Infinity,
    icon: "☄️",
    color: "#f59e0b",
    accentColor: "rgba(251, 191, 36, 1)",
    bgGradient: "from-amber-900/60 via-purple-900/50 to-rose-950/90",
    borderClass: "border-amber-400/70 hover:border-amber-300 shadow-amber-500/20",
    glowColor: "rgba(251, 191, 36, 0.75)",
    tag: "İlahi Varlık",
    description: "100. Seviye ve ötesi. Yapay Zekanın Ulaştığı Nihai Zirve.",
  },
];

// Belirli bir seviyenin Tier bilgisini getir
export const getTierForLevel = (level) => {
  return (
    TIERS.find((t) => level >= t.minLevel && level <= t.maxLevel) || TIERS[0]
  );
};

// Seviye Unvanları ve Dönüm Noktaları (Roadmap & Unlocks)
export const LEVEL_MILESTONES = [
  {
    level: 1,
    title: "Yolcu",
    icon: "🌱",
    tierId: "novice",
    unlock: "Temel Görev Defteri",
    bonusXp: 0,
    description: "Büyük başarılar tek bir adımla başlar.",
  },
  {
    level: 3,
    title: "Çırak Planlayıcı",
    icon: "📝",
    tierId: "novice",
    unlock: "Öncelik Filtreleme",
    bonusXp: 75,
    description: "Görevleri önem derecelerine göre ayırıyorsun.",
  },
  {
    level: 5,
    title: "Disiplin Yolcusu",
    icon: "🔨",
    tierId: "novice",
    unlock: "Hızlı Tamamlayıcı Efekti",
    bonusXp: 150,
    description: "Alışkanlık zinciri kurulmaya başladı.",
  },
  {
    level: 10,
    title: "Alev Avcısı",
    icon: "🔥",
    tierId: "hunter",
    unlock: "Alev Aurası & Parçacık Işıltısı",
    bonusXp: 300,
    description: "1. Tier'ı aştın! Ateş auran aktifleşti.",
  },
  {
    level: 15,
    title: "Zaman Avcısı",
    icon: "⏱️",
    tierId: "hunter",
    unlock: "Özel Hızlı Önizleme",
    bonusXp: 400,
    description: "Görevleri planlama hızın katlandı.",
  },
  {
    level: 20,
    title: "Şimşek Uzmanı",
    icon: "⚡",
    tierId: "expert",
    unlock: "Elektrik Aurası & Enerji Ağları",
    bonusXp: 600,
    description: "2. Tier'ı aştın! Elektrik parçacıkları canlandı.",
  },
  {
    level: 25,
    title: "Fırtına Hakimi",
    icon: "🌪️",
    tierId: "expert",
    unlock: "Kritik Görev Çarpanı",
    bonusXp: 750,
    description: "Zorluklar seni yavaşlatamıyor.",
  },
  {
    level: 30,
    title: "Altın Usta",
    icon: "👑",
    tierId: "master",
    unlock: "Altın Taç Çerçevesi & Işık Halkası",
    bonusXp: 1000,
    description: "Ustalık basamağına eriştin! Profilin altın parıltısıyla ışıldıyor.",
  },
  {
    level: 40,
    title: "Büyük Muhafız",
    icon: "🛡️",
    tierId: "master",
    unlock: "Sonsuz Odak Aurası",
    bonusXp: 1250,
    description: "Hedeflerinden asla sapmıyorsun.",
  },
  {
    level: 50,
    title: "Efsanevi Ruh",
    icon: "💎",
    tierId: "legend",
    unlock: "Kozmik Meteorlar & Kristal Efekti",
    bonusXp: 2000,
    description: "Efsane kademesi! Arka planda kozmik meteorlar kayıyor.",
  },
  {
    level: 60,
    title: "Yıldız Bükücü",
    icon: "✨",
    tierId: "legend",
    unlock: "Süpernova Parıltısı",
    bonusXp: 2500,
    description: "Her tamamlanan görev bir yıldız yaratıyor.",
  },
  {
    level: 75,
    title: "Kozmik Hükümdar",
    icon: "🌌",
    tierId: "cosmic",
    unlock: "Galaksi Çekirdeği & Nebula Sisleri",
    bonusXp: 3500,
    description: "Kozmik boyuta ulaştın. Nebula dalgaları etrafını sarıyor.",
  },
  {
    level: 90,
    title: "Evren Mimarı",
    icon: "🔮",
    tierId: "cosmic",
    unlock: "Hiperuzay Enerji Halesi",
    bonusXp: 4500,
    description: "Ölümsüzlüğün eşiğinde bir üretkenlik dehası.",
  },
  {
    level: 100,
    title: "Ölümsüz Titan",
    icon: "☄️",
    tierId: "immortal",
    unlock: "İlahi Gökkuşağı Aurası & Sonsuz Prestij",
    bonusXp: 10000,
    description: "100. Seviye! Sen artık bir efsanesin. Sistem zirvesine ulaştın.",
  },
];

// Seviyeye göre unvan getir (varsayılan ara seviyeler için akıllı oluşturucu)
export const getTitleForLevel = (level) => {
  const milestone = [...LEVEL_MILESTONES]
    .reverse()
    .find((m) => level >= m.level);

  if (milestone) {
    return {
      title: milestone.title,
      icon: milestone.icon,
      unlock: milestone.unlock,
      description: milestone.description,
      milestoneLevel: milestone.level,
    };
  }

  const tier = getTierForLevel(level);
  return {
    title: `${tier.name} Lvl ${level}`,
    icon: tier.icon,
    unlock: "Seviye İlerlemesi",
    description: tier.description,
    milestoneLevel: 1,
  };
};

// Sonraki dönüm noktası (Roadmap için)
export const getNextMilestone = (level) => {
  return LEVEL_MILESTONES.find((m) => m.level > level) || LEVEL_MILESTONES[LEVEL_MILESTONES.length - 1];
};
