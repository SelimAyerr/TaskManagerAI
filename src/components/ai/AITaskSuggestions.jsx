import { motion, AnimatePresence } from "motion/react";
import { useAI } from "../../context/AIContext";
import { cleanField } from "../../ai/gemini";
import {
  Bot,
  Zap,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Compass,
  Lightbulb,
  Check,
} from "lucide-react";

function AITaskSuggestions() {
  const {
    isAIConfigured,
    setIsWizardOpen,
    suggestions,
    isSuggestionsLoading,
    suggestionsError,
    fetchSuggestions,
    acceptSuggestion,
    rejectSuggestion,
  } = useAI();

  const priorityStyles = {
    Yüksek: {
      border: "border-rose-500/30",
      bg: "bg-rose-500/10",
      text: "text-rose-400",
      dot: "bg-rose-500",
    },
    Orta: {
      border: "border-amber-500/30",
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      dot: "bg-amber-500",
    },
    Düşük: {
      border: "border-emerald-500/30",
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      dot: "bg-emerald-500",
    },
  };

  // Eğer API anahtarı yoksa tanıtım / aktifleştirme kartı göster
  if (!isAIConfigured) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-r from-purple-950/30 via-[#111422]/80 to-indigo-950/30 p-5 backdrop-blur-xl shadow-xl"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                Kişisel Yapay Zeka Görev Koçunu Başlat
                <span className="rounded-full bg-purple-500/20 border border-purple-500/30 px-2 py-0.2 text-[10px] font-extrabold text-purple-300">
                  YENİ
                </span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Mesleğinize, çalışma tarzınıza ve alışkanlıklarınıza özel nokta atışı görev önerileri alın.
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => setIsWizardOpen(true)}
            className="flex-shrink-0 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition hover:from-purple-500 hover:to-indigo-500 flex items-center justify-center gap-1.5"
          >
            <Zap className="h-3.5 w-3.5" /> Profili Ayarla
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Üst Başlık & Butonlar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-400">
            <Sparkles className="h-3 w-3" />
          </span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Kişiselleştirilmiş AI Önerileri
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchSuggestions(3)}
            disabled={isSuggestionsLoading}
            className="flex items-center gap-1.5 rounded-xl border border-white/5 bg-slate-900/60 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-purple-500/30 hover:text-white disabled:opacity-50"
            title="Daha fazla öneri üret"
          >
            <RefreshCw
              className={`h-3 w-3 ${isSuggestionsLoading ? "animate-spin text-purple-400" : ""}`}
            />
            <span>{isSuggestionsLoading ? "Üretiliyor..." : "Daha Fazla Öneri"}</span>
          </button>
        </div>
      </div>

      {/* Hata Durumu */}
      {suggestionsError && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-400 flex-shrink-0" />
            <span>{suggestionsError}</span>
          </div>
          <button
            type="button"
            onClick={() => fetchSuggestions(1)}
            className="font-bold underline ml-2"
          >
            Tekrar Dene
          </button>
        </div>
      )}

      {/* Yükleniyor İskeleti */}
      {isSuggestionsLoading && suggestions.length === 0 && (
        <div className="animate-pulse rounded-3xl border border-purple-500/20 bg-[#121524]/60 p-5 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-4 w-28 rounded-full bg-purple-500/20" />
            <div className="h-4 w-16 rounded-full bg-slate-800" />
          </div>
          <div className="h-5 w-3/4 rounded bg-slate-700/50 mb-2" />
          <div className="h-4 w-1/2 rounded bg-slate-800/60 mb-4" />
          <div className="flex gap-2">
            <div className="h-8 w-28 rounded-xl bg-purple-600/30" />
            <div className="h-8 w-16 rounded-xl bg-slate-800" />
          </div>
        </div>
      )}

      {/* Öneri Listesi */}
      <AnimatePresence mode="popLayout">
        {suggestions.map((sugg) => {
          const pStyle = priorityStyles[sugg.priority] || priorityStyles.Orta;

          return (
            <motion.div
              key={sugg.id}
              layout
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-[#131627]/90 via-[#101322]/80 to-[#161a2f]/90 p-5 shadow-2xl backdrop-blur-xl"
            >
              {/* Sol gradyan vurgusu */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-purple-500 via-indigo-500 to-pink-500" />

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 min-w-0">
                  {/* Etiketler */}
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/20 border border-purple-500/40 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-purple-300">
                      <Sparkles className="h-3 w-3 text-purple-300" /> AI Önerisi
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${pStyle.bg} ${pStyle.border} ${pStyle.text}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${pStyle.dot}`} />
                      {sugg.priority}
                    </span>
                  </div>

                  {/* Başlık */}
                  <h4 className="text-base font-bold text-white tracking-tight">
                    {cleanField(sugg.title, "Önerilen Görev")}
                  </h4>

                  {/* Açıklama */}
                  {sugg.description && (
                    <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                      {cleanField(sugg.description)}
                    </p>
                  )}

                  {/* Araştırma Alt Başlıkları (+Ekstra XP) */}
                  {sugg.subtopics && sugg.subtopics.length > 0 && (
                    <div className="mt-3 rounded-2xl border border-purple-500/25 bg-purple-950/25 p-3 backdrop-blur-md">
                      <div className="flex items-center justify-between mb-2">
                        <span className="flex items-center gap-1.5 text-[11px] font-bold text-purple-300">
                          <Compass className="h-3.5 w-3.5 text-purple-300" /> Araştırılacak Alt Başlıklar
                        </span>
                        <span className="rounded-full bg-purple-500/20 border border-purple-500/40 px-2 py-0.5 text-[10px] font-black text-purple-300">
                          +{sugg.subtopics.length * 25} XP Ekstra Bonus
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {sugg.subtopics.map((st, i) => (
                          <div
                            key={st.id || i}
                            className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/60 rounded-xl px-2.5 py-1.5 border border-white/5"
                          >
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-purple-500/25 text-[10px] font-black text-purple-300 flex-shrink-0">
                              {i + 1}
                            </span>
                            <span className="font-medium text-slate-200">
                              {cleanField(typeof st === "string" ? st : st.title)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <p className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                        <Lightbulb className="h-3 w-3 text-amber-400 flex-shrink-0" />
                        <span><strong className="text-slate-300">İpucu:</strong> Görevi ekledikten sonra bu başlıklar için araştırma notlarını yazıp AI'ya onaylatarak bonus XP kazanabilirsin.</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Aksiyon Butonları & Uyarı */}
                <div className="flex flex-col sm:items-end gap-1.5 flex-shrink-0 pt-2 sm:pt-0 border-t border-white/5 sm:border-t-0">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={(e) => acceptSuggestion(sugg, e)}
                      className="flex-1 sm:flex-initial rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-purple-600/30 transition hover:from-purple-500 hover:to-indigo-500 flex items-center justify-center gap-1.5"
                    >
                      <Check className="h-3.5 w-3.5" /> Görevlerime Ekle (+10 XP)
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => rejectSuggestion(sugg.id, sugg.title)}
                      className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2.5 text-xs font-bold text-slate-400 transition hover:bg-white/10 hover:text-white"
                      title="Bu öneriyi geç (AI bir dahakine benzerlerini önermez)"
                    >
                      Geç
                    </motion.button>
                  </div>

                  <span className="text-[10px] text-amber-400/90 flex items-center gap-1 font-medium">
                    <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                    <span>Peşin +10 XP. Bitirmeden silinirse -10 XP düşülür.</span>
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default AITaskSuggestions;
