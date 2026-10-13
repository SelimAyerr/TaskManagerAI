import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAI } from "../../context/AIContext";
import { useGame } from "../../context/GameContext";
import { cleanField } from "../../ai/gemini";
import {
  Bot,
  Settings,
  Trash2,
  X,
  Sparkles,
  Plus,
  AlertTriangle,
  Zap,
  Flame,
  ListChecks,
} from "lucide-react";

function AIChat() {
  const {
    isChatOpen,
    setIsChatOpen,
    chatMessages,
    isChatLoading,
    sendMessage,
    clearChatHistory,
    userMemory,
    setIsWizardOpen,
    isAIConfigured,
  } = useAI();

  const { addTask, triggerXPFloat } = useGame();
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  // Otomatik aşağı kaydırma
  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isChatOpen]);

  // Escape tuşuna basınca paneli kapat
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsChatOpen(false);
      }
    };
    if (isChatOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isChatOpen, setIsChatOpen]);

  if (!isChatOpen) return null;

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || isChatLoading) return;
    sendMessage(inputText);
    setInputText("");
  };

  const handleQuickPrompt = (prompt) => {
    sendMessage(prompt);
  };

  // Satır içi biçimlendirme (**kalın**, `kod`, *italik*)
  const formatInline = (str) => {
    if (!str) return null;

    // Kalın (**...**), satır içi kod (`...`) ve italik (*...*) eşleştirmesi
    const tokens = str.split(/(\*\*[^*]+?\*\*|`[^`]+`|\*[^*]+?\*)/g);

    return tokens.map((token, i) => {
      if (!token) return null;

      // Kalın: **metin** -> Yıldızları kaldır, kalın ve belirgin göster
      if (token.startsWith("**") && token.endsWith("**") && token.length >= 4) {
        const content = token.slice(2, -2).trim();
        return (
          <strong key={i} className="font-extrabold text-white">
            {content}
          </strong>
        );
      }

      // Kod: `kod`
      if (token.startsWith("`") && token.endsWith("`") && token.length >= 2) {
        const content = token.slice(1, -1);
        return (
          <code
            key={i}
            className="rounded bg-purple-950/60 border border-purple-500/30 px-1.5 py-0.5 font-mono text-[11px] text-purple-300"
          >
            {content}
          </code>
        );
      }

      // İtalik: *metin*
      if (token.startsWith("*") && token.endsWith("*") && token.length >= 2) {
        const content = token.slice(1, -1).trim();
        return (
          <em key={i} className="italic text-slate-200">
            {content}
          </em>
        );
      }

      // Başıboş kalan gereksiz yıldız (*) işaretlerini temizle
      const clean = token.replace(/\*+/g, "");
      return clean;
    });
  };

  // Tüm mesaj metnini satır ve paragraflara göre düzenleme (Markdown temizleyici)
  const renderFormattedText = (text) => {
    if (!text) return null;

    const lines = text.split("\n");

    return (
      <div className="space-y-1.5 leading-relaxed">
        {lines.map((line, lineIndex) => {
          const trimmed = line.trim();

          // Boş satır -> hafif dikey boşluk
          if (!trimmed) {
            return <div key={lineIndex} className="h-1" />;
          }

          // Madde işareti (* veya - ile başlayan satırlar)
          const bulletMatch = line.match(/^(\s*)[*-]\s+(.+)$/);
          if (bulletMatch) {
            return (
              <div key={lineIndex} className="flex items-start gap-2 pl-1 my-0.5">
                <span className="text-purple-400 mt-1 text-[8px] flex-shrink-0">●</span>
                <span className="flex-1 text-slate-200">
                  {formatInline(bulletMatch[2])}
                </span>
              </div>
            );
          }

          // Başlıklar (### veya ##)
          const headingMatch = line.match(/^#{1,4}\s+(.+)$/);
          if (headingMatch) {
            return (
              <h5 key={lineIndex} className="font-bold text-white text-xs mt-2 mb-0.5">
                {formatInline(headingMatch[1])}
              </h5>
            );
          }

          // Normal satır
          return (
            <p key={lineIndex} className="text-slate-200">
              {formatInline(line)}
            </p>
          );
        })}
      </div>
    );
  };

  // Sohbet içindeki [TASK: {...}] formatını her türlü durumda (tam, kesilmiş veya eksik) hatasız ayrıştırıp render etme
  const renderMessageContent = (text) => {
    if (!text) return null;

    const taskIndex = text.indexOf("[TASK:");

    // Eğer metinde hiç [TASK: yoksa normal biçimlendirilmiş metin göster
    if (taskIndex === -1) {
      return renderFormattedText(text);
    }

    // [TASK: etiketinden önceki kısım daima temiz sohbet konuşmasıdır
    const cleanText = text.slice(0, taskIndex).trim();
    const taskPart = text.slice(taskIndex);

    let taskObj = null;

    // 1. Durum: Tam ve eksiksiz [TASK: {...}] JSON yakalama
    const fullMatch = taskPart.match(/\[TASK:\s*(\{.*?\})\]/s);
    if (fullMatch) {
      try {
        const parsed = JSON.parse(fullMatch[1]);
        if (parsed && (parsed.title || parsed.baslik)) {
          taskObj = {
            title: cleanField(parsed.title || parsed.baslik, "Önerilen Görev"),
            description: cleanField(parsed.description || parsed.aciklama, ""),
            priority: cleanField(parsed.priority || parsed.oncelik, "Orta"),
          };
        }
      } catch {
        // JSON.parse hatası olursa regex kurtarmasına geç
      }
    }

    // 2. Durum: Yarım kalmış veya kesilmiş JSON kurtarma (örn: [TASK: {"title": "...", "description": "...)
    if (!taskObj) {
      const titleMatch = taskPart.match(/["']?(?:title|baslik)["']?\s*:\s*["']([^"'\n\r}]+)["']?/i);
      const descMatch = taskPart.match(/["']?(?:description|aciklama)["']?\s*:\s*["']([^"'\n\r}]+)["']?/i);
      const prioMatch = taskPart.match(/["']?(?:priority|oncelik)["']?\s*:\s*["']([^"'\n\r}]+)["']?/i);

      if (titleMatch && titleMatch[1].trim()) {
        taskObj = {
          title: cleanField(titleMatch[1].trim(), "Önerilen Görev"),
          description: descMatch ? cleanField(descMatch[1].trim()) : "",
          priority: prioMatch ? cleanField(prioMatch[1].trim(), "Orta") : "Orta",
        };
      }
    }

    return (
      <div className="space-y-3">
        {cleanText && renderFormattedText(cleanText)}

        {taskObj && (
          <div className="mt-2 rounded-2xl border border-purple-500/40 bg-purple-950/40 p-3 shadow-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 border border-purple-500/40 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                <Sparkles className="h-3 w-3 text-purple-300" /> Önerilen Görev
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                {taskObj.priority || "Orta"}
              </span>
            </div>
            <p className="text-xs font-bold text-white">{taskObj.title}</p>
            {taskObj.description && (
              <p className="text-[11px] text-slate-300 mt-0.5">
                {taskObj.description}
              </p>
            )}

            <button
              type="button"
              onClick={(e) => {
                const rect = e?.currentTarget?.getBoundingClientRect();
                const clickX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
                const clickY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
                addTask({
                  title: taskObj.title,
                  description: taskObj.description || "AI Sohbeti üzerinden eklendi.",
                  priority: taskObj.priority || "Orta",
                  isAITask: true,
                  acceptanceBonus: 10,
                });
                triggerXPFloat(10, clickX, clickY, "AI Taahhüt Bonusu");
              }}
              className="mt-2 w-full rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-bold text-white shadow-md transition hover:bg-purple-500 flex items-center justify-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Görevlerime Ekle (+10 XP)
            </button>
            <p className="mt-1 text-[10px] text-amber-300/80 text-center flex items-center justify-center gap-1">
              <AlertTriangle className="h-3 w-3 text-amber-300 flex-shrink-0" />
              <span>Kabul edince +10 XP kazanırsın. Tamamlamadan silersen -10 XP düşülür.</span>
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      onClick={() => setIsChatOpen(false)}
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm cursor-pointer"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 220 }}
        className="relative flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#0d101e]/95 shadow-2xl backdrop-blur-2xl cursor-default"
      >
        {/* Üst Başlık (Header) */}
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                <Bot className="h-5 w-5" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0d101e] bg-emerald-500" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm text-white">
                  AI Üretkenlik Koçu
                </h3>
                <span className="rounded-full bg-purple-500/20 px-1.5 py-0.2 text-[9px] font-bold text-purple-300">
                  Gemini Flash
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {userMemory.identity.occupation} · {userMemory.identity.workStyle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Profil / Ayar Butonu */}
            <button
              type="button"
              onClick={() => setIsWizardOpen(true)}
              className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
              title="AI Hafızası & Ayarları"
            >
              <Settings className="h-4 w-4" />
            </button>

            {/* Temizle Butonu */}
            <button
              type="button"
              onClick={clearChatHistory}
              className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-rose-400"
              title="Geçmişi Temizle"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            {/* Kapat Butonu */}
            <button
              type="button"
              onClick={() => setIsChatOpen(false)}
              className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
              title="Kapat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* API Key Uyarısı (Eğer yoksa) */}
        {!isAIConfigured && (
          <div className="border-b border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
              Sohbet etmek için API anahtarınızı girin.
            </span>
            <button
              type="button"
              onClick={() => setIsWizardOpen(true)}
              className="rounded-lg bg-amber-500/20 px-2 py-1 font-bold underline"
            >
              Ayarla
            </button>
          </div>
        )}

        {/* Mesaj Listesi */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence initial={false}>
            {chatMessages.map((msg) => {
              const isUser = msg.role === "user";

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-md ${
                      isUser
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none"
                        : "border border-white/10 bg-slate-900/80 text-slate-200 rounded-bl-none backdrop-blur-md"
                    }`}
                  >
                    {renderMessageContent(msg.content)}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Yazıyor Animasyonu */}
          {isChatLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-xs text-purple-400">
                <span className="h-2 w-2 rounded-full bg-purple-400 animate-bounce" />
                <span
                  className="h-2 w-2 rounded-full bg-purple-400 animate-bounce"
                  style={{ animationDelay: "0.15s" }}
                />
                <span
                  className="h-2 w-2 rounded-full bg-purple-400 animate-bounce"
                  style={{ animationDelay: "0.3s" }}
                />
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Hızlı İstemler (Quick Chips) */}
        <div className="px-3 py-2 border-t border-white/5 bg-slate-900/30 flex gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => handleQuickPrompt("Günüme göre bana 1 odak görevi öner")}
            className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-800/60 px-2.5 py-1 text-[11px] text-slate-300 hover:border-purple-500/40 hover:text-white transition"
          >
            <Zap className="h-3 w-3 text-amber-400" />
            <span>Görev Öner</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickPrompt("Beni motive edecek bir taktik ver!")}
            className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-800/60 px-2.5 py-1 text-[11px] text-slate-300 hover:border-purple-500/40 hover:text-white transition"
          >
            <Flame className="h-3 w-3 text-rose-400" />
            <span>Motive Et</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickPrompt("Şu anki aktif görevlerimi nasıl önceliklendirmeliyim?")}
            className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-800/60 px-2.5 py-1 text-[11px] text-slate-300 hover:border-purple-500/40 hover:text-white transition"
          >
            <ListChecks className="h-3 w-3 text-indigo-400" />
            <span>Öncelik Analizi</span>
          </button>
        </div>

        {/* Mesaj Yazma Alanı */}
        <form
          onSubmit={handleSend}
          className="border-t border-white/10 p-3 bg-slate-950/60 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="AI koçuna bir şey sor..."
            disabled={isChatLoading}
            className="flex-1 rounded-xl border border-white/10 bg-slate-900/90 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
          />

          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!inputText.trim() || isChatLoading}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 transition hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40"
          >
            <svg
              className="h-4 w-4 stroke-current stroke-2 fill-none"
              viewBox="0 0 24 24"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

export default AIChat;
