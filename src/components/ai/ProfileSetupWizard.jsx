import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAI } from "../../context/AIContext";
import {
  Code,
  Palette,
  GraduationCap,
  Rocket,
  PenTool,
  Coffee,
  Sparkles,
  Moon,
  Sun,
  Compass,
  Timer,
  Bot,
  X,
  Check,
  Plus,
  ExternalLink,
  Zap,
  Lightbulb,
} from "lucide-react";

const OCCUPATION_OPTIONS = [
  { id: "Yazılımcı", label: "Yazılımcı / Mühendis", Icon: Code },
  { id: "Tasarımcı", label: "UI/UX Tasarımcı", Icon: Palette },
  { id: "Öğrenci", label: "Öğrenci / Akademisyen", Icon: GraduationCap },
  { id: "Girişimci", label: "Girişimci / Kurucu", Icon: Rocket },
  { id: "İçerik Üreticisi", label: "İçerik Üreticisi", Icon: PenTool },
  { id: "Serbest Çalışan", label: "Serbest Çalışan (Freelancer)", Icon: Coffee },
  { id: "Diğer", label: "Diğer", Icon: Sparkles },
];

const WORK_STYLE_OPTIONS = [
  {
    id: "Gece Kuşu",
    title: "Gece Kuşu",
    desc: "Akşam ve gece saatlerinde en yüksek odak ve enerji",
    Icon: Moon,
  },
  {
    id: "Erken Kalkan",
    title: "Erken Kalkan",
    desc: "Güne erken başlayıp sabah saatlerinde kritik işleri bitirir",
    Icon: Sun,
  },
  {
    id: "Esnek & Dengeli",
    title: "Esnek & Dengeli",
    desc: "Günün ritmine göre dağıtılmış dengeli çalışma periyotları",
    Icon: Compass,
  },
  {
    id: "Aralıklı Odak",
    title: "Aralıklı Odak (Pomodoro)",
    desc: "Kısa ve yoğun sprintler halinde çalışma disiplini",
    Icon: Timer,
  },
];

const INTEREST_TAGS = [
  "Yazılım & Web",
  "Yapay Zeka & Prompting",
  "UI/UX Tasarım",
  "Sağlık & Spor",
  "Dil Öğrenimi",
  "Girişimcilik & Startuplar",
  "Kitap & Kişisel Gelişim",
  "Finans & Yatırım",
  "Proje Yönetimi",
  "Ders & Sınavlar",
];

function ProfileSetupWizard() {
  const {
    isWizardOpen,
    setIsWizardOpen,
    userMemory,
    saveMemory,
    apiKey,
    updateApiKey,
    testApiKey,
    fetchSuggestions,
  } = useAI();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(() => ({
    name:
      userMemory.identity.name && userMemory.identity.name !== "Oyuncu"
        ? userMemory.identity.name
        : "",
    occupation: userMemory.identity.occupation || "Yazılımcı",
    customOccupation: "",
    workStyle: userMemory.identity.workStyle || "Gece Kuşu",
    focusHoursPerDay: userMemory.identity.focusHoursPerDay || 6,
    interests: userMemory.identity.interests || ["Yazılım & Web", "Yapay Zeka & Prompting"],
    apiKey: apiKey || "",
  }));

  const [testingKey, setTestingKey] = useState(false);
  const [testResult, setTestResult] = useState(null); // { success: boolean, msg: string }

  if (!isWizardOpen) return null;

  const toggleInterest = (interest) => {
    setFormData((prev) => {
      const exists = prev.interests.includes(interest);
      if (exists) {
        return {
          ...prev,
          interests: prev.interests.filter((i) => i !== interest),
        };
      } else {
        return {
          ...prev,
          interests: [...prev.interests, interest],
        };
      }
    });
  };

  const handleTestKey = async () => {
    if (!formData.apiKey.trim()) {
      setTestResult({ success: false, msg: "Lütfen bir API anahtarı girin." });
      return;
    }
    setTestingKey(true);
    setTestResult(null);

    const res = await testApiKey(formData.apiKey.trim());
    setTestingKey(false);
    if (res.success) {
      setTestResult({
        success: true,
        msg: `Harika! Gemini API doğrulandı (Model: ${res.model || "Aktif"}).`,
      });
    } else {
      setTestResult({
        success: false,
        msg: res.error || "Doğrulama başarısız oldu. Lütfen anahtarınızı kontrol edin.",
      });
    }
  };

  const handleComplete = () => {
    // Hafızayı güncelle
    const chosenOccupation =
      formData.occupation === "Diğer" && formData.customOccupation.trim()
        ? formData.customOccupation.trim()
        : formData.occupation;

    const newMemory = {
      ...userMemory,
      identity: {
        name: formData.name.trim() || "Oyuncu",
        occupation: chosenOccupation,
        workStyle: formData.workStyle,
        focusHoursPerDay: formData.focusHoursPerDay,
        interests:
          formData.interests.length > 0
            ? formData.interests
            : ["Kişisel Gelişim", "Üretkenlik"],
      },
    };

    saveMemory(newMemory);

    if (formData.name.trim()) {
      localStorage.setItem("playerNameCustomized", "true");
    }

    if (formData.apiKey.trim()) {
      updateApiKey(formData.apiKey.trim());
    }

    setIsWizardOpen(false);

    // Eğer anahtar varsa ilk öneriyi tetikle
    if (formData.apiKey.trim()) {
      setTimeout(() => {
        fetchSuggestions(1);
      }, 300);
    }
  };

  return (
    <div
      onClick={() => setIsWizardOpen(false)}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md cursor-pointer"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-[#0d101d]/95 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl cursor-default"
      >
        {/* Arka plan ışık halkası */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-indigo-600/20 blur-3xl" />

        {/* Başlık ve Kapat Butonu */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400">
              <Bot className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight">
                AI Asistanını Kişiselleştir
              </h3>
              <p className="text-xs text-slate-400">
                Adım {step} / 4 · Seni tanıyarak sana özel görevler üretir
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsWizardOpen(false)}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
            title="Kapat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Adım İlerleme Çubuğu */}
        <div className="relative z-10 my-5 flex gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                s <= step
                  ? "bg-gradient-to-r from-purple-500 to-indigo-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                  : "bg-slate-800"
              }`}
            />
          ))}
        </div>

        {/* Adım İçerikleri */}
        <div className="relative z-10 min-h-[300px]">
          <AnimatePresence mode="wait">
            {/* ADIM 1: Kimlik & Meslek */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Sana nasıl hitap edelim?
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="İsminiz..."
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Mesleğin veya Temel Alanın
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {OCCUPATION_OPTIONS.map((opt) => {
                      const Icon = opt.Icon;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, occupation: opt.id })
                          }
                          className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left text-xs font-semibold transition ${
                            formData.occupation === opt.id
                              ? "border-purple-500 bg-purple-500/15 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                              : "border-white/5 bg-slate-900/50 text-slate-400 hover:border-white/15 hover:text-white"
                          }`}
                        >
                          <Icon className={`h-4 w-4 ${formData.occupation === opt.id ? "text-purple-400" : "text-slate-400"}`} />
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {formData.occupation === "Diğer" && (
                    <input
                      type="text"
                      placeholder="Mesleğinizi belirtin..."
                      value={formData.customOccupation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customOccupation: e.target.value,
                        })
                      }
                      className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500"
                    />
                  )}
                </div>
              </motion.div>
            )}

            {/* ADIM 2: Çalışma Tarzı */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Çalışma Tarzın & Ritmin
                  </label>
                  <div className="space-y-2">
                    {WORK_STYLE_OPTIONS.map((opt) => {
                      const Icon = opt.Icon;
                      return (
                        <div
                          key={opt.id}
                          onClick={() =>
                            setFormData({ ...formData, workStyle: opt.id })
                          }
                          className={`cursor-pointer rounded-2xl border p-3 transition flex items-start gap-3 ${
                            formData.workStyle === opt.id
                              ? "border-purple-500 bg-purple-500/15 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                              : "border-white/5 bg-slate-900/50 hover:border-white/15"
                          }`}
                        >
                          <div className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border ${
                            formData.workStyle === opt.id
                              ? "border-purple-500/40 bg-purple-500/20 text-purple-300"
                              : "border-white/5 bg-slate-800 text-slate-400"
                          }`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">{opt.title}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {opt.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Günlük Hedef Odaklanma Süresi
                    </label>
                    <span className="font-mono text-sm font-black text-purple-400">
                      {formData.focusHoursPerDay} Saat
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    step="1"
                    value={formData.focusHoursPerDay}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        focusHoursPerDay: Number(e.target.value),
                      })
                    }
                    className="w-full accent-purple-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>1 Saat (Hafif)</span>
                    <span>6 Saat (Standart)</span>
                    <span>12 Saat (Derin Maraton)</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ADIM 3: İlgi Alanları */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    İlgi Alanların & Odak Konuların
                  </label>
                  <p className="text-xs text-slate-400 mb-3">
                    AI, seçtiğin konulara göre sana en uygun görev önerilerini hazırlayacak.
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {INTEREST_TAGS.map((tag) => {
                      const selected = formData.interests.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleInterest(tag)}
                          className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                            selected
                              ? "bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                              : "border border-white/5 bg-slate-900/60 text-slate-400 hover:border-white/20 hover:text-white"
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            {selected ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                            <span>{tag}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ADIM 4: Gemini API Anahtarı */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Google Gemini API Anahtarı
                    </label>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-purple-400 hover:text-purple-300 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Ücretsiz Anahtar Al</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <p className="text-xs text-slate-400 mb-2.5 leading-relaxed">
                    API anahtarınız yalnızca kendi tarayıcınızda (localStorage) saklanır. Hiçbir sunucuya gönderilmez ve tamamen ücretsizdir.
                  </p>

                  <div className="relative">
                    <input
                      type="password"
                      placeholder="AIzaSy..."
                      value={formData.apiKey}
                      onChange={(e) => {
                        setFormData({ ...formData, apiKey: e.target.value });
                        setTestResult(null);
                      }}
                      className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2.5 text-sm font-mono text-white placeholder-slate-600 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestKey}
                    disabled={testingKey || !formData.apiKey.trim()}
                    className="rounded-xl border border-purple-500/40 bg-purple-500/10 px-4 py-2 text-xs font-bold text-purple-300 transition hover:bg-purple-500/20 disabled:opacity-50"
                  >
                    {testingKey ? (
                      "Doğrulanıyor..."
                    ) : (
                      <span className="inline-flex items-center gap-1.5">
                        <Zap className="h-3 w-3" />
                        <span>Anahtarı Test Et</span>
                      </span>
                    )}
                  </button>

                  {testResult && (
                    <span
                      className={`text-xs font-semibold ${
                        testResult.success ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {testResult.msg}
                    </span>
                  )}
                </div>

                <div className="rounded-2xl border border-white/5 bg-slate-900/40 p-3 text-[11px] text-slate-400 leading-relaxed flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-300">İpucu:</strong> API anahtarını daha sonra dilediğin zaman değiştirebilir veya silebilirsin. Anahtar olmadan da görevlerini manuel olarak yönetebilirsin.
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Alt Düğmeler (Geri / İleri / Tamamla) */}
        <div className="relative z-10 mt-6 flex items-center justify-between border-t border-white/10 pt-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="rounded-xl px-4 py-2 text-xs font-bold text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              ← Geri
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsWizardOpen(false)}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-500 transition hover:text-slate-400"
            >
              Daha Sonra Kur
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition hover:from-purple-500 hover:to-indigo-500"
            >
              İleri →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleComplete}
              className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2 text-xs font-black text-white shadow-lg shadow-emerald-600/30 transition hover:from-emerald-500 hover:to-teal-500 flex items-center gap-1.5"
            >
              <Rocket className="h-4 w-4" />
              <span>Kurulumu Tamamla</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default ProfileSetupWizard;
