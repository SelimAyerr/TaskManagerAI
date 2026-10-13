import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGame } from "../context/GameContext";
import { getTaskXp } from "../interfaces/gamification";
import { evaluateResearchNotes, cleanField } from "../ai/gemini";
import {
  Bot,
  BookOpen,
  AlertTriangle,
  FileText,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Check,
  Zap,
} from "lucide-react";

function TaskCard({ task }) {
  const {
    toggleTask,
    setEditingTask,
    deleteTask,
    updateTaskSubtopicNotes,
    awardSubtopicBonus,
  } = useGame();

  const xpReward = getTaskXp(task.priority);

  const [isSubtopicsOpen, setIsSubtopicsOpen] = useState(false);
  const [localNotes, setLocalNotes] = useState({});
  const [evaluatingId, setEvaluatingId] = useState(null);
  const [evalError, setEvalError] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const subtopics = task.subtopics || [];
  const totalSubs = subtopics.length;
  const completedSubs = subtopics.filter((st) => st.completed).length;
  const totalBonusXpEarned = subtopics.reduce(
    (acc, st) => acc + (st.bonusXp || 0),
    0
  );

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

  const pStyle = priorityStyles[task.priority] || priorityStyles.Orta;

  const handleNotesChange = (stId, value) => {
    setLocalNotes((prev) => ({ ...prev, [stId]: value }));
    updateTaskSubtopicNotes(task.id, stId, value);
  };

  const handleEvaluate = async (subtopic, e) => {
    const noteText = (
      localNotes[subtopic.id] !== undefined
        ? localNotes[subtopic.id]
        : subtopic.notes || ""
    ).trim();

    if (!noteText) return;

    setEvaluatingId(subtopic.id);
    setEvalError((prev) => ({ ...prev, [subtopic.id]: null }));

    const rect = e?.currentTarget?.getBoundingClientRect();
    const coords = {
      x: rect ? rect.left + rect.width / 2 : window.innerWidth / 2,
      y: rect ? rect.top + rect.height / 2 : window.innerHeight / 2,
    };

    try {
      const res = await evaluateResearchNotes(task.title, subtopic.title, noteText);
      if (res.approved) {
        awardSubtopicBonus(task.id, subtopic.id, res.bonusXp, res.feedback, coords);
      } else {
        setEvalError((prev) => ({
          ...prev,
          [subtopic.id]:
            res.feedback ||
            "Notlar yetersiz görüldü. Lütfen öğrendiğin bilgileri biraz daha detaylandır.",
        }));
      }
    } catch (err) {
      console.error("Evaluation error:", err);
      setEvalError((prev) => ({
        ...prev,
        [subtopic.id]: "Yapay zeka değerlendirmesi sırasında bir hata oluştu.",
      }));
    } finally {
      setEvaluatingId(null);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25 }}
      className={`group relative overflow-hidden rounded-2xl border p-4 sm:p-5 backdrop-blur-xl transition-all duration-300 ${
        task.completed
          ? "border-emerald-500/25 bg-[#0e171b]/60 shadow-[0_4px_20px_rgba(16,185,129,0.06)]"
          : "border-white/[0.08] bg-[#121524]/70 hover:border-white/20 hover:bg-[#15192c]/80 shadow-lg shadow-black/30"
      }`}
    >
      {/* Tamamlanma durumunda sol kenar neon çizgisi */}
      {task.completed && (
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-teal-500 shadow-[0_0_10px_#10b981]" />
      )}

      {/* Ana Görev Satırı */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Sol Alan: Checkbox & Başlık/Açıklama */}
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          {/* Standart Tamamlama Butonu / Checkbox (Kullanıcı alt başlık yapmasa bile buradan görev XP'sini alabilir) */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            type="button"
            onClick={(e) => toggleTask(task.id, e)}
            className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg border transition-all duration-300 ${
              task.completed
                ? "border-emerald-400 bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                : "border-white/20 bg-slate-900/80 text-transparent hover:border-purple-400 hover:text-purple-400/50"
            }`}
            title={task.completed ? "Görevi Geri Al" : "Görevi Tamamla (+XP)"}
          >
            <svg
              className="h-3.5 w-3.5 stroke-current stroke-[3] fill-none"
              viewBox="0 0 24 24"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </motion.button>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4
                className={`font-bold text-sm tracking-tight transition-all duration-300 ${
                  task.completed
                    ? "text-slate-400 line-through"
                    : "text-white"
                }`}
              >
                {cleanField(task.title, "Görev")}
              </h4>

              {/* Öncelik Rozeti */}
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${pStyle.bg} ${pStyle.border} ${pStyle.text}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${pStyle.dot}`} />
                {task.priority}
              </span>

              {/* AI Görevi Rozeti */}
              {task.isAITask && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                  <Bot className="h-3 w-3" /> AI Görevi
                </span>
              )}
            </div>

            {task.description && (
              <p
                className={`mt-1 text-xs line-clamp-2 transition-all ${
                  task.completed ? "text-slate-500" : "text-slate-400"
                }`}
              >
                {cleanField(task.description)}
              </p>
            )}
          </div>
        </div>

        {/* Sağ Alan: XP Rozeti & Aksiyon Düğmeleri */}
        <div className="flex flex-shrink-0 items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t border-white/5 sm:border-t-0">
          {/* XP Etiketi */}
          {task.completed ? (
            <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-extrabold text-emerald-400">
              <Check className="h-3 w-3" /> +{task.xpReward || xpReward} XP
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-xl bg-purple-500/15 border border-purple-500/30 px-2.5 py-1 text-[11px] font-extrabold text-purple-300">
              <Zap className="h-3 w-3" /> +{xpReward} XP
            </span>
          )}

          <div className="flex items-center gap-1">
            {!task.completed && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setEditingTask(task)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
                title="Görevi Düzenle"
              >
                <svg
                  className="h-4 w-4 stroke-current stroke-2 fill-none"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={(e) => {
                if (task.isAITask && !task.completed && !showDeleteConfirm) {
                  setShowDeleteConfirm(true);
                  return;
                }
                deleteTask(task.id, e);
              }}
              className={`rounded-lg p-1.5 transition ${
                showDeleteConfirm
                  ? "bg-rose-500 text-white"
                  : "text-slate-400 hover:bg-rose-500/20 hover:text-rose-400"
              }`}
              title={
                task.isAITask && !task.completed
                  ? "AI Görevini Sil (-10 XP Ceza)"
                  : "Görevi Sil"
              }
            >
              <svg
                className="h-4 w-4 stroke-current stroke-2 fill-none"
                viewBox="0 0 24 24"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>

      {/* AI Görevi Silme Onayı & Ceza Uyarısı */}
      <AnimatePresence>
        {showDeleteConfirm && task.isAITask && !task.completed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mt-3 rounded-2xl border border-rose-500/30 bg-rose-950/30 p-3 text-xs backdrop-blur-md"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-rose-300">
                <AlertTriangle className="h-4 w-4 text-rose-400 flex-shrink-0" />
                <span>
                  Bu AI görevini henüz tamamlamadın. Şimdi silersen taahhüt cezası olarak <strong>-10 XP</strong> düşülecek!
                </span>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    setShowDeleteConfirm(false);
                    deleteTask(task.id, e);
                  }}
                  className="rounded-xl bg-rose-600 hover:bg-rose-500 px-3 py-1.5 text-xs font-bold text-white transition shadow-md shadow-rose-600/30"
                >
                  Evet, Sil (-10 XP)
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition"
                >
                  Vazgeç
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====================================================
          ARAŞTIRMA ALT BAŞLIKLARI VE NOT GİRME ALANI (OPSİYONEL BONUS XP)
      ==================================================== */}
      {totalSubs > 0 && (
        <div className="mt-3.5 border-t border-white/5 pt-3">
          {/* Aç/Kapat Düğmesi */}
          <button
            type="button"
            onClick={() => setIsSubtopicsOpen((prev) => !prev)}
            className="flex w-full items-center justify-between rounded-xl border border-purple-500/20 bg-purple-950/20 px-3 py-2 text-xs font-semibold text-purple-300 transition hover:bg-purple-950/35"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5 text-purple-300" />
              <span>
                Araştırma Notları ({completedSubs}/{totalSubs} Tamamlandı)
              </span>
              {totalBonusXpEarned > 0 && (
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.2 text-[10px] font-black text-emerald-300">
                  +{totalBonusXpEarned} XP Kazanıldı
                </span>
              )}
            </div>

            <span className="text-[11px] font-bold text-purple-400 flex items-center gap-1">
              <span>{isSubtopicsOpen ? "Gizle" : "Not Defterini Aç"}</span>
              {isSubtopicsOpen ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </span>
          </button>

          {/* Açılan Defter Bölümü */}
          <AnimatePresence>
            {isSubtopicsOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden pt-3 space-y-3"
              >
                {subtopics.map((st, i) => {
                  const currentNote =
                    localNotes[st.id] !== undefined
                      ? localNotes[st.id]
                      : st.notes || "";
                  const isEvaluating = evaluatingId === st.id;
                  const errorMsg = evalError[st.id];

                  return (
                    <div
                      key={st.id || i}
                      className={`rounded-2xl border p-3.5 transition-all ${
                        st.completed
                          ? "border-emerald-500/30 bg-emerald-950/15"
                          : "border-white/10 bg-slate-900/60"
                      }`}
                    >
                      {/* Alt Başlık Üst Başlığı */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-[10px] font-black text-purple-300">
                            {i + 1}
                          </span>
                          <h5 className="font-bold text-xs text-white truncate">
                            {cleanField(st.title)}
                          </h5>
                        </div>

                        {st.completed ? (
                          <span className="flex-shrink-0 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-black text-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>+{st.bonusXp} XP Onaylandı</span>
                          </span>
                        ) : (
                          <span className="flex-shrink-0 text-[10px] font-semibold text-purple-300">
                            +15-30 XP Bonus
                          </span>
                        )}
                      </div>

                      {/* Onaylanmış Durum */}
                      {st.completed ? (
                        <div className="space-y-2 mt-2">
                          <div className="rounded-xl bg-slate-900/80 p-2.5 text-xs text-slate-300 border border-white/5 whitespace-pre-wrap">
                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mb-1">
                              <FileText className="h-3 w-3" />
                              <span>Notun:</span>
                            </span>
                            {st.notes}
                          </div>

                          {st.feedback && (
                            <div className="rounded-xl bg-emerald-950/30 border border-emerald-500/30 p-2.5 text-[11px] text-emerald-300 flex items-start gap-1.5">
                              <Bot className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                              <span>
                                <strong className="text-white">AI Değerlendirmesi:</strong>{" "}
                                {st.feedback}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Henüz Onaylanmamış Durum - Not Yazma & AI Değerlendirmesi */
                        <div className="space-y-2 mt-1.5">
                          <textarea
                            rows={3}
                            value={currentNote}
                            onChange={(e) =>
                              handleNotesChange(st.id, e.target.value)
                            }
                            placeholder="Bu alt başlıkla ilgili öğrendiklerini veya araştırma özetini buraya yaz..."
                            className="w-full rounded-xl border border-white/10 bg-slate-950/70 p-2.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
                          />

                          {errorMsg && (
                            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2 text-[11px] text-amber-300 flex items-center gap-1.5">
                              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                              <span>{errorMsg}</span>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] text-slate-500">
                              {currentNote.trim().length > 0
                                ? `${currentNote.trim().length} karakter`
                                : "Not girip yapay zekaya onaylat"}
                            </span>

                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              type="button"
                              disabled={
                                !currentNote.trim() || isEvaluating
                              }
                              onClick={(e) => handleEvaluate(st, e)}
                              className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-purple-600/30 transition hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 flex items-center gap-1.5"
                            >
                              {isEvaluating ? (
                                <>
                                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                  <span>İnceleniyor...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-3.5 w-3.5" />
                                  <span>AI'ya İncelet & Bonus XP Al</span>
                                </>
                              )}
                            </motion.button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

export default TaskCard;