import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import confetti from "canvas-confetti";

import {
  getTaskXp,
  calculateLevel,
  getLevelProgress,
  getCurrentTitle,
  getTierForLevel,
} from "../interfaces/gamification";
import { BADGES, findNewEligibleBadges } from "../config/badges";
import {
  playTaskCompleteSound,
  playLevelUpSound,
  playBadgeUnlockSound,
  playClickSound,
  isSoundEnabled,
  toggleSound as setSoundStorage,
} from "../utils/soundEffects";

const GameContext = createContext(null);

export function GameProvider({ children }) {
  // =========================
  // PLAYER STATE
  // =========================
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem("playerName") || "Oyuncu";
  });

  const [soundOn, setSoundOn] = useState(() => isSoundEnabled());

  // =========================
  // TASKS STATE
  // =========================
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("tasks");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed
          .filter((t) => t.id !== 1 && t.id !== 2 && t.id !== 3)
          .map((t) => ({
            ...t,
            xpEarned: Boolean(t.xpEarned),
            xpReward:
              typeof t.xpReward === "number"
                ? t.xpReward
                : t.xpEarned
                ? getTaskXp(t.priority)
                : 0,
          }));
      } catch (err) {
        console.error("Tasks parse error", err);
      }
    }
    return [];
  });

  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'active' | 'completed'
  const [priorityFilter, setPriorityFilter] = useState("all"); // 'all' | 'Yüksek' | 'Orta' | 'Düşük'
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTask, setEditingTask] = useState(null);

  // =========================
  // XP & GAMIFICATION
  // =========================
  const [bonusXp, setBonusXp] = useState(() => {
    return Number(localStorage.getItem("bonusXp")) || 0;
  });

  const [claimedBadges, setClaimedBadges] = useState(() => {
    const saved = localStorage.getItem("claimedBadges");
    return saved ? JSON.parse(saved) : [];
  });

  const [lastLevel, setLastLevel] = useState(() => {
    const saved = localStorage.getItem("lastLevel");
    return saved ? Number(saved) : 1;
  });

  // =========================
  // VISUAL EFFECTS STATE
  // =========================
  const [floatEvents, setFloatEvents] = useState([]);
  const [burstEvents, setBurstEvents] = useState([]);
  const [screenFlash, setScreenFlash] = useState({ active: false, color: "" });
  const [levelUpModalData, setLevelUpModalData] = useState(null);
  const [roadmapOpen, setRoadmapOpen] = useState(false);
  const [badgeUnlockedToast, setBadgeUnlockedToast] = useState(null);

  // =========================
  // PERSISTENCE
  // =========================
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("bonusXp", String(bonusXp));
  }, [bonusXp]);

  useEffect(() => {
    localStorage.setItem("claimedBadges", JSON.stringify(claimedBadges));
  }, [claimedBadges]);

  useEffect(() => {
    localStorage.setItem("playerName", playerName);
  }, [playerName]);

  // =========================
  // XP & STATS COMPUTATION
  // =========================
  const taskXp = useMemo(() => {
    return tasks.reduce((acc, t) => {
      if (t.xpEarned) {
        return acc + Number(t.xpReward || 0);
      }
      return acc;
    }, 0);
  }, [tasks]);

  const totalXp = useMemo(() => taskXp + bonusXp, [taskXp, bonusXp]);

  const currentLevel = useMemo(() => calculateLevel(totalXp), [totalXp]);

  const progress = useMemo(() => getLevelProgress(totalXp), [totalXp]);

  const currentTier = useMemo(() => getTierForLevel(currentLevel), [currentLevel]);

  const currentTitle = useMemo(() => getCurrentTitle(currentLevel), [currentLevel]);

  const activeTasks = useMemo(() => tasks.filter((t) => !t.completed), [tasks]);
  const completedTasks = useMemo(() => tasks.filter((t) => t.completed), [tasks]);

  const stats = useMemo(() => {
    const highPriorityCompleted = tasks.filter(
      (t) => t.completed && t.priority === "Yüksek"
    ).length;
    return {
      totalCount: tasks.length,
      activeCount: activeTasks.length,
      completedCount: completedTasks.length,
      highPriorityCompleted,
      level: currentLevel,
      xp: totalXp,
      badgeCount: claimedBadges.length,
    };
  }, [tasks, activeTasks.length, completedTasks.length, currentLevel, totalXp, claimedBadges.length]);

  // =========================
  // EFFECT DISPATCHERS
  // =========================
  const triggerXPFloat = useCallback((xp, x, y, label = "XP") => {
    const id = Date.now() + Math.random();
    setFloatEvents((prev) => [...prev, { id, xp, x, y, label }]);
    setTimeout(() => {
      setFloatEvents((prev) => prev.filter((item) => item.id !== id));
    }, 1400);
  }, []);

  const triggerEnergyBurst = useCallback((x, y, color) => {
    const id = Date.now() + Math.random();
    setBurstEvents((prev) => [...prev, { id, x, y, color }]);
    setTimeout(() => {
      setBurstEvents((prev) => prev.filter((item) => item.id !== id));
    }, 800);
  }, []);

  const triggerScreenFlash = useCallback((color) => {
    setScreenFlash({ active: true, color });
    setTimeout(() => {
      setScreenFlash({ active: false, color: "" });
    }, 650);
  }, []);

  // =========================
  // AUTOMATIC BADGE CHECKER
  // =========================
  const checkAndAwardBadges = useCallback(
    (currentStats) => {
      const eligible = findNewEligibleBadges(currentStats, claimedBadges);
      if (eligible.length > 0) {
        const newlyClaimedIds = eligible.map((b) => b.id);
        const totalAwardedXp = eligible.reduce((acc, b) => acc + b.rewardXp, 0);

        setClaimedBadges((prev) => [...prev, ...newlyClaimedIds]);
        setBonusXp((prev) => prev + totalAwardedXp);

        // Ses ve Toast
        playBadgeUnlockSound();
        const firstBadge = eligible[0];
        setBadgeUnlockedToast(firstBadge);
        setTimeout(() => setBadgeUnlockedToast(null), 5000);

        // Ekstra konfeti
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.8 },
          colors: ["#facc15", "#a855f7", "#38bdf8"],
        });
      }
    },
    [claimedBadges]
  );

  // Stats her değiştiğinde rozetleri denetle
  useEffect(() => {
    checkAndAwardBadges(stats);
  }, [stats, checkAndAwardBadges]);

  // =========================
  // LEVEL UP LISTENER
  // =========================
  useEffect(() => {
    if (currentLevel > lastLevel) {
      const reward = getCurrentTitle(currentLevel);
      const tier = getTierForLevel(currentLevel);

      setLevelUpModalData({
        level: currentLevel,
        reward,
        tier,
      });

      setLastLevel(currentLevel);
      localStorage.setItem("lastLevel", String(currentLevel));

      // Ses, flaş ve konfeti
      playLevelUpSound();
      triggerScreenFlash(tier.glowColor || "rgba(168, 85, 247, 0.6)");

      confetti({
        particleCount: 220,
        spread: 120,
        startVelocity: 45,
        origin: { y: 0.6 },
        colors: [tier.color, "#ffffff", "#facc15", "#a855f7"],
      });
    }
  }, [currentLevel, lastLevel, triggerScreenFlash]);

  // =========================
  // TASK ACTIONS
  // =========================
  const addTask = useCallback(
    (taskData) => {
      playClickSound();
      const rawSubtopics = Array.isArray(taskData.subtopics) ? taskData.subtopics : [];
      const formattedSubtopics = rawSubtopics.map((st, i) => {
        if (typeof st === "string") {
          return {
            id: `st-${Date.now()}-${i}`,
            title: st,
            notes: "",
            completed: false,
            evaluated: false,
            bonusXp: 0,
            feedback: "",
          };
        }
        return {
          id: st.id || `st-${Date.now()}-${i}`,
          title: st.title || "",
          notes: st.notes || "",
          completed: Boolean(st.completed),
          evaluated: Boolean(st.evaluated),
          bonusXp: Number(st.bonusXp) || 0,
          feedback: st.feedback || "",
        };
      });

      const isAITask = Boolean(taskData.isAITask);
      const acceptanceBonus = isAITask ? Number(taskData.acceptanceBonus) || 10 : 0;

      const newTask = {
        id: Date.now(),
        title: taskData.title.trim(),
        description: taskData.description ? taskData.description.trim() : "",
        priority: taskData.priority || "Orta",
        completed: false,
        xpEarned: false,
        xpReward: 0,
        subtopics: formattedSubtopics,
        isAITask,
        acceptanceBonus,
        createdAt: Date.now(),
      };

      // AI görevi kabul edildiğinde peşin taahhüt bonusunu gerçek XP'ye ekle
      if (isAITask && acceptanceBonus > 0) {
        setBonusXp((prev) => prev + acceptanceBonus);
      }

      setTasks((prev) => [newTask, ...prev]);
    },
    []
  );

  const updateTaskSubtopicNotes = useCallback((taskId, subtopicId, notes) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId || !t.subtopics) return t;
        return {
          ...t,
          subtopics: t.subtopics.map((st) =>
            st.id === subtopicId ? { ...st, notes } : st
          ),
        };
      })
    );
  }, []);

  const awardSubtopicBonus = useCallback(
    (taskId, subtopicId, bonusAmount, feedback, coords = {}) => {
      playTaskCompleteSound();
      setBonusXp((prev) => prev + bonusAmount);

      const clickX = coords.x ?? window.innerWidth / 2;
      const clickY = coords.y ?? window.innerHeight / 2;

      triggerXPFloat(bonusAmount, clickX, clickY, "Araştırma XP");
      triggerEnergyBurst(clickX, clickY, currentTier.color);

      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== taskId || !t.subtopics) return t;
          return {
            ...t,
            subtopics: t.subtopics.map((st) =>
              st.id === subtopicId
                ? {
                    ...st,
                    completed: true,
                    evaluated: true,
                    bonusXp: bonusAmount,
                    feedback,
                  }
                : st
            ),
          };
        })
      );
    },
    [currentTier.color, triggerEnergyBurst, triggerXPFloat]
  );

  const updateTask = useCallback((updatedTask) => {
    playClickSound();
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? { ...t, ...updatedTask } : t))
    );
    setEditingTask(null);
  }, []);

  const deleteTask = useCallback(
    (taskId, event) => {
      const taskToDelete = tasks.find((t) => t.id === taskId);
      playClickSound();

      // Eğer AI tarafından önerilen görev henüz tamamlanmadan siliniyorsa taahhüt cezası kes
      if (taskToDelete?.isAITask && !taskToDelete.completed) {
        const penalty = Number(taskToDelete.acceptanceBonus) || 10;
        const rect = event?.currentTarget?.getBoundingClientRect();
        const clickX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
        const clickY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;

        setBonusXp((prev) => Math.max(0, prev - penalty));
        triggerXPFloat(-penalty, clickX, clickY, "İptal Cezası");
      }

      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      if (editingTask && editingTask.id === taskId) {
        setEditingTask(null);
      }
    },
    [tasks, editingTask, triggerXPFloat]
  );

  const toggleTask = useCallback(
    (taskId, event) => {
      // Koordinatları al
      const rect = event?.currentTarget?.getBoundingClientRect();
      const clickX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
      const clickY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;

      setTasks((prev) =>
        prev.map((task) => {
          if (task.id !== taskId) return task;

          // Görev tamamlanıyorsa
          if (!task.completed) {
            const reward = getTaskXp(task.priority);
            const wasEarnedBefore = task.xpEarned;

            // Efektleri ateşle
            playTaskCompleteSound();
            triggerEnergyBurst(clickX, clickY, currentTier.color);

            if (!wasEarnedBefore) {
              triggerXPFloat(reward, clickX, clickY, "XP");
            }

            return {
              ...task,
              completed: true,
              xpEarned: true,
              xpReward: reward,
              completedAt: Date.now(),
            };
          }

          // Görev geri alınıyorsa
          playClickSound();
          return {
            ...task,
            completed: false,
          };
        })
      );
    },
    [currentTier.color, triggerEnergyBurst, triggerXPFloat]
  );

  // Manuel rozet claim (opsiyonel butonlar için)
  const claimBadge = useCallback(
    (badge) => {
      if (claimedBadges.includes(badge.id)) return;
      setClaimedBadges((prev) => [...prev, badge.id]);
      setBonusXp((prev) => prev + badge.rewardXp);
      playBadgeUnlockSound();
      triggerXPFloat(badge.rewardXp, window.innerWidth / 2, window.innerHeight / 2, "Rozet XP");
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.7 },
      });
    },
    [claimedBadges, triggerXPFloat]
  );

  // Geliştirici/Test XP desteği (gizli veya ihtiyaç halinde)
  const addTestXp = useCallback(
    (amount) => {
      setBonusXp((prev) => prev + amount);
      triggerXPFloat(amount, window.innerWidth / 2, window.innerHeight / 2, "Bonus XP");
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 } });
    },
    [triggerXPFloat]
  );

  // Ses ayarını değiştir
  const handleToggleSound = useCallback(() => {
    const nextState = !soundOn;
    setSoundOn(nextState);
    setSoundStorage(nextState);
    if (nextState) {
      playClickSound();
    }
  }, [soundOn]);

  const value = {
    // Player
    playerName,
    setPlayerName,
    soundOn,
    toggleSound: handleToggleSound,

    // Tasks & Filter
    tasks,
    activeTasks,
    completedTasks,
    activeTab,
    setActiveTab,
    priorityFilter,
    setPriorityFilter,
    searchQuery,
    setSearchQuery,
    editingTask,
    setEditingTask,

    // CRUD & Subtopics
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    updateTaskSubtopicNotes,
    awardSubtopicBonus,

    // XP & Stats
    totalXp,
    bonusXp,
    currentLevel,
    progress,
    currentTier,
    currentTitle,
    stats,

    // Badges
    badges: BADGES,
    claimedBadges,
    claimBadge,
    badgeUnlockedToast,
    closeBadgeToast: () => setBadgeUnlockedToast(null),

    // Modals & Popups
    levelUpModalData,
    closeLevelUpModal: () => setLevelUpModalData(null),
    roadmapOpen,
    setRoadmapOpen,

    // Effects
    floatEvents,
    burstEvents,
    screenFlash,
    triggerXPFloat,
    triggerEnergyBurst,
    triggerScreenFlash,

    // Helpers
    addTestXp,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
