import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useGame } from "./GameContext";
import {
  getApiKey,
  saveApiKey,
  hasApiKey,
  testApiKey,
  generateTaskSuggestions,
  sendChatMessage,
} from "../ai/gemini";
import {
  getUserMemory,
  saveUserMemory,
  updateBehaviorPatterns,
  addRecentCompletion,
  markSuggestionAccepted,
  markSuggestionRejected,
  isProfileSetupComplete,
} from "../ai/userProfile";
import {
  buildSuggestionPrompt,
  buildChatSystemPrompt,
} from "../ai/promptBuilder";

const AIContext = createContext(null);

const CHAT_STORAGE_KEY = "aiChatHistory";

export function AIProvider({ children }) {
  const {
    tasks,
    addTask,
    currentLevel,
    totalXp,
    currentTier,
    playerName,
    setPlayerName,
    triggerXPFloat,
  } = useGame();

  // =========================
  // STATE
  // =========================
  const [apiKey, setApiKeyState] = useState(() => getApiKey());
  const [isAIConfigured, setIsAIConfigured] = useState(() => hasApiKey());
  const [userMemory, setUserMemoryState] = useState(() => getUserMemory());
  
  // Wizard modalı: Kurulum tamamlanmadıysa ilk açılışta otomatik açık gelir
  const [isWizardOpen, setIsWizardOpen] = useState(() => !isProfileSetupComplete());

  // Öneriler State'i
  const [suggestions, setSuggestions] = useState([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState(null);

  // Sohbet State'i
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (err) {
      console.error("Chat history okunamadı", err);
    }
    return [
      {
        id: "initial-ai-welcome",
        role: "model",
        content: `Selam ${playerName || "Dostum"}! ⚡ Ben senin yapay zeka üretkenlik koçunum. Gününü planlamana, hedeflerini bölmene ve seviye atlamana yardımcı olmak için buradayım. Bugün ne üzerinde çalışmak istersin?`,
        timestamp: Date.now(),
      },
    ];
  });

  // Chat geçmişini kaydet
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatMessages));
    } catch (err) {
      console.error("Chat history kaydedilemedi", err);
    }
  }, [chatMessages]);

  // Tasks değiştikçe son tamamlananları hafızaya aktar
  const prevTasksRef = useRef(tasks);
  useEffect(() => {
    const prev = prevTasksRef.current;
    tasks.forEach((t) => {
      const prevTask = prev.find((pt) => pt.id === t.id);
      if (t.completed && (!prevTask || !prevTask.completed)) {
        // Yeni tamamlanan bir görev var
        const updated = addRecentCompletion(t);
        updateBehaviorPatterns(tasks);
        setUserMemoryState(updated);
      }
    });
    prevTasksRef.current = tasks;
  }, [tasks]);

  // Oyuncu ismi değişirse kimlik hafızasını senkronize et
  useEffect(() => {
    if (playerName && userMemory.identity.name !== playerName) {
      const updated = {
        ...userMemory,
        identity: {
          ...userMemory.identity,
          name: playerName,
        },
      };
      saveUserMemory(updated);
      setUserMemoryState(updated);
    }
  }, [playerName, userMemory]);

  // =========================
  // API KEY & KURULUM
  // =========================
  const updateApiKey = useCallback((newKey) => {
    saveApiKey(newKey);
    setApiKeyState(newKey);
    setIsAIConfigured(Boolean(newKey.trim()));
  }, []);

  const saveMemory = useCallback((newMemory) => {
    saveUserMemory(newMemory);
    setUserMemoryState(newMemory);
    if (newMemory.identity?.name) {
      setPlayerName(newMemory.identity.name);
    }
  }, [setPlayerName]);

  // =========================
  // GÖREV ÖNERİLERİ ALMA
  // =========================
  const fetchSuggestions = useCallback(
    async (count = 1) => {
      if (!hasApiKey()) {
        setSuggestionsError("Gemini API anahtarı ayarlanmamış.");
        return;
      }

      setIsSuggestionsLoading(true);
      setSuggestionsError(null);

      try {
        const prompt = buildSuggestionPrompt(userMemory, count, tasks);
        const newSuggestions = await generateTaskSuggestions(prompt, userMemory);

        setSuggestions((prev) => {
          // Var olanlara ekle (veya count 1 ise ilki olarak yenile)
          if (count === 1) {
            return newSuggestions;
          }
          // Çift kayıtları engelle
          const existingTitles = new Set(prev.map((s) => s.title));
          const filtered = newSuggestions.filter((s) => !existingTitles.has(s.title));
          return [...prev, ...filtered];
        });
      } catch (err) {
        setSuggestionsError(err.message || "Öneriler alınırken hata oluştu.");
      } finally {
        setIsSuggestionsLoading(false);
      }
    },
    [userMemory, tasks]
  );

  // Açılışta 1 öneri al (Eğer kurulum tamsa ve öneri listesi boşsa)
  const initialFetchDone = useRef(false);
  useEffect(() => {
    if (!initialFetchDone.current && isProfileSetupComplete() && hasApiKey()) {
      initialFetchDone.current = true;
      fetchSuggestions(1);
    }
  }, [fetchSuggestions]);

  // Öneriyi Kabul Et (Göreve Dönüştür)
  const acceptSuggestion = useCallback(
    (suggestion, event) => {
      const rect = event?.currentTarget?.getBoundingClientRect();
      const clickX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
      const clickY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;

      // Görevlere ekle (AI görevi olarak işaretle ve 10 XP bonus bağla)
      addTask({
        title: suggestion.title,
        description: suggestion.description || "",
        priority: suggestion.priority,
        subtopics: suggestion.subtopics || [],
        isAITask: true,
        acceptanceBonus: 10,
      });

      // Hafızaya kabul edildi olarak kaydet
      const updated = markSuggestionAccepted(suggestion.title);
      setUserMemoryState(updated);

      // Listeden çıkar
      setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));

      // XP Bildirimi
      triggerXPFloat(10, clickX, clickY, "AI Taahhüt Bonusu");
    },
    [addTask, triggerXPFloat]
  );

  // Öneriyi Reddet (Geç)
  const rejectSuggestion = useCallback((suggestionId, title) => {
    const updated = markSuggestionRejected(title);
    setUserMemoryState(updated);
    setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
  }, []);

  // =========================
  // AI SOHBET (CHAT)
  // =========================
  const sendMessage = useCallback(
    async (text) => {
      if (!text.trim()) return;

      if (!hasApiKey()) {
        setIsWizardOpen(true);
        return;
      }

      const userMsg = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text.trim(),
        timestamp: Date.now(),
      };

      const updatedHistory = [...chatMessages, userMsg];
      setChatMessages(updatedHistory);
      setIsChatLoading(true);

      try {
        const playerStats = {
          level: currentLevel,
          tierName: currentTier.name,
          xp: totalXp,
        };
        const systemPrompt = buildChatSystemPrompt(userMemory, tasks, playerStats);
        
        // Son 10 mesajı API'ye gönder (token tasarrufu ve odaklanma için)
        const replyText = await sendChatMessage(
          recentMessages,
          systemPrompt,
          userMemory,
          playerStats
        );

        const aiMsg = {
          id: `ai-${Date.now()}`,
          role: "model",
          content: replyText,
          timestamp: Date.now(),
        };

        setChatMessages((prev) => [...prev, aiMsg]);
      } catch (err) {
        const errorMsg = {
          id: `error-${Date.now()}`,
          role: "model",
          content: `⚠️ Bir hata oluştu: ${err.message || "Bağlantı sağlanamadı"}. Lütfen API anahtarınızı veya internetinizi kontrol edin.`,
          timestamp: Date.now(),
          isError: true,
        };
        setChatMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsChatLoading(false);
      }
    },
    [chatMessages, currentLevel, currentTier.name, totalXp, userMemory, tasks]
  );

  const clearChatHistory = useCallback(() => {
    const welcome = [
      {
        id: "initial-ai-welcome",
        role: "model",
        content: `Sohbet geçmişi sıfırlandı. Yeniden başlamaya hazırım ${playerName}! Sana nasıl yardımcı olabilirim?`,
        timestamp: Date.now(),
      },
    ];
    setChatMessages(welcome);
    localStorage.removeItem(CHAT_STORAGE_KEY);
  }, [playerName]);

  const value = {
    apiKey,
    updateApiKey,
    isAIConfigured,
    testApiKey,

    userMemory,
    saveMemory,

    isWizardOpen,
    setIsWizardOpen,

    suggestions,
    isSuggestionsLoading,
    suggestionsError,
    fetchSuggestions,
    acceptSuggestion,
    rejectSuggestion,

    isChatOpen,
    setIsChatOpen,
    chatMessages,
    isChatLoading,
    sendMessage,
    clearChatHistory,
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
}

export function useAI() {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error("useAI must be used within an AIProvider");
  }
  return context;
}
