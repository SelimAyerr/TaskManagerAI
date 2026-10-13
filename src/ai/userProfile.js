import { hasApiKey } from "./gemini";

const MEMORY_STORAGE = "userMemory";

export const DEFAULT_USER_MEMORY = {
  identity: {
    name: "Oyuncu",
    occupation: "Üretken Profesyonel",
    workStyle: "Esnek & Dengeli",
    focusHoursPerDay: 4,
    interests: ["Kişisel Gelişim", "Üretkenlik & Planlama"],
  },
  behaviorPatterns: {
    completionRate: 0,
    preferredPriority: "Orta",
    preferredTaskTime: "Akşam",
    avgTasksPerDay: 0,
    topCategories: [],
  },
  learnedContext: {
    recentCompletions: [], // [{ title, priority, completedAt }]
    rejectedSuggestions: [], // [title]
    acceptedSuggestions: [], // [title]
    notes: [], // Genel AI çıkarımları
  },
};

/**
 * Kullanıcı hafızasını yerel depolamadan okur
 */
export function getUserMemory() {
  try {
    const raw = localStorage.getItem(MEMORY_STORAGE);
    if (!raw) return DEFAULT_USER_MEMORY;

    const parsed = JSON.parse(raw);
    const isCustomized = localStorage.getItem("playerNameCustomized") === "true";
    if (parsed?.identity?.name === "Selim" && !isCustomized) {
      parsed.identity.name = "Oyuncu";
    }
    return {
      identity: { ...DEFAULT_USER_MEMORY.identity, ...(parsed.identity || {}) },
      behaviorPatterns: {
        ...DEFAULT_USER_MEMORY.behaviorPatterns,
        ...(parsed.behaviorPatterns || {}),
      },
      learnedContext: {
        ...DEFAULT_USER_MEMORY.learnedContext,
        ...(parsed.learnedContext || {}),
      },
    };
  } catch (err) {
    console.error("UserMemory okuma hatası:", err);
    return DEFAULT_USER_MEMORY;
  }
}

/**
 * Kullanıcı hafızasını kaydeder
 */
export function saveUserMemory(memory) {
  try {
    localStorage.setItem(MEMORY_STORAGE, JSON.stringify(memory));
  } catch (err) {
    console.error("UserMemory kaydetme hatası:", err);
  }
}

/**
 * Görev geçmişine göre kullanıcı alışkanlıklarını ve kalıplarını günceller
 */
export function updateBehaviorPatterns(tasks = []) {
  const memory = getUserMemory();
  const total = tasks.length;
  if (total === 0) return memory;

  const completed = tasks.filter((t) => t.completed);
  const completionRate = Math.round((completed.length / total) * 100);

  // En çok tamamlanan öncelik seviyesi
  const priorityCounts = completed.reduce((acc, t) => {
    acc[t.priority] = (acc[t.priority] || 0) + 1;
    return acc;
  }, {});

  let preferredPriority = "Orta";
  let maxCount = -1;
  for (const [prio, count] of Object.entries(priorityCounts)) {
    if (count > maxCount) {
      maxCount = count;
      preferredPriority = prio;
    }
  }

  // Günün hangi saatinde daha aktif?
  const hours = completed.map((t) =>
    new Date(t.completedAt || t.createdAt || Date.now()).getHours()
  );
  let preferredTaskTime = "Gündüz";
  if (hours.length > 0) {
    const nightTasks = hours.filter((h) => h >= 20 || h < 6).length;
    const morningTasks = hours.filter((h) => h >= 6 && h < 12).length;
    const afternoonTasks = hours.filter((h) => h >= 12 && h < 20).length;

    if (nightTasks >= morningTasks && nightTasks >= afternoonTasks) {
      preferredTaskTime = "Gece / Akşam";
    } else if (morningTasks >= afternoonTasks) {
      preferredTaskTime = "Sabah";
    } else {
      preferredTaskTime = "Öğle / İkindi";
    }
  }

  const updated = {
    ...memory,
    behaviorPatterns: {
      ...memory.behaviorPatterns,
      completionRate,
      preferredPriority,
      preferredTaskTime,
    },
  };

  saveUserMemory(updated);
  return updated;
}

/**
 * Yeni tamamlanan görevi son tamamlananlar listesine ekler
 */
export function addRecentCompletion(task) {
  const memory = getUserMemory();
  const recent = [
    {
      title: task.title,
      priority: task.priority,
      completedAt: Date.now(),
    },
    ...(memory.learnedContext.recentCompletions || []),
  ].slice(0, 15); // Son 15 görevi tut

  const updated = {
    ...memory,
    learnedContext: {
      ...memory.learnedContext,
      recentCompletions: recent,
    },
  };

  saveUserMemory(updated);
  return updated;
}

/**
 * Öneri kabul edildiğinde kaydeder
 */
export function markSuggestionAccepted(title) {
  const memory = getUserMemory();
  const accepted = [
    title,
    ...(memory.learnedContext.acceptedSuggestions || []).filter((t) => t !== title),
  ].slice(0, 20);

  const updated = {
    ...memory,
    learnedContext: {
      ...memory.learnedContext,
      acceptedSuggestions: accepted,
    },
  };

  saveUserMemory(updated);
  return updated;
}

/**
 * Öneri reddedildiğinde (Geç butonuna basıldığında) kaydeder
 */
export function markSuggestionRejected(title) {
  const memory = getUserMemory();
  const rejected = [
    title,
    ...(memory.learnedContext.rejectedSuggestions || []).filter((t) => t !== title),
  ].slice(0, 20);

  const updated = {
    ...memory,
    learnedContext: {
      ...memory.learnedContext,
      rejectedSuggestions: rejected,
    },
  };

  saveUserMemory(updated);
  return updated;
}

/**
 * Kurulum sihirbazının tamamlanıp tamamlanmadığını kontrol eder
 */
export function isProfileSetupComplete() {
  const hasKey = hasApiKey();
  const raw = localStorage.getItem(MEMORY_STORAGE);
  if (!raw || !hasKey) return false;

  try {
    const memory = JSON.parse(raw);
    return Boolean(memory?.identity?.occupation && memory?.identity?.workStyle);
  } catch {
    return false;
  }
}
