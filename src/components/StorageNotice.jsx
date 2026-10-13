import { useState, useRef } from "react";
import { motion } from "motion/react";
import {
  ShieldCheck,
  Trash2,
  Smartphone,
  Lock,
  Download,
  Upload,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

function StorageNotice() {
  const [isOpen, setIsOpen] = useState(false);
  const [backupStatus, setBackupStatus] = useState(null);
  const fileInputRef = useRef(null);

  // Verileri JSON dosyası olarak dışa aktar
  const handleExportBackup = () => {
    try {
      const backupData = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        tasks: localStorage.getItem("tasks") ? JSON.parse(localStorage.getItem("tasks")) : [],
        bonusXp: Number(localStorage.getItem("bonusXp")) || 0,
        claimedBadges: localStorage.getItem("claimedBadges") ? JSON.parse(localStorage.getItem("claimedBadges")) : [],
        seenBadges: localStorage.getItem("seenBadges") ? JSON.parse(localStorage.getItem("seenBadges")) : [],
        lastLevel: Number(localStorage.getItem("lastLevel")) || 1,
        playerName: localStorage.getItem("playerName") || "Selim",
        sound_enabled: localStorage.getItem("sound_enabled") || "true",
        userMemory: localStorage.getItem("userMemory") ? JSON.parse(localStorage.getItem("userMemory")) : null,
        geminiActiveModel: localStorage.getItem("geminiActiveModel") || "gemini-2.5-flash",
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement("a");
      const dateStr = new Date().toISOString().slice(0, 10);
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `xflow-ai-yedek-${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setBackupStatus({ success: true, message: "Yedek dosyası başarıyla indirildi!" });
      setTimeout(() => setBackupStatus(null), 4000);
    } catch (err) {
      console.error("Yedek alma hatası:", err);
      setBackupStatus({ success: false, message: "Yedek alınırken bir sorun oluştu." });
      setTimeout(() => setBackupStatus(null), 4000);
    }
  };

  // JSON dosyasından yedeği içe aktar
  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!parsed || typeof parsed !== "object") {
          throw new Error("Geçersiz yedek dosyası formatı");
        }

        if (Array.isArray(parsed.tasks)) {
          localStorage.setItem("tasks", JSON.stringify(parsed.tasks));
        }
        if (typeof parsed.bonusXp === "number") {
          localStorage.setItem("bonusXp", String(parsed.bonusXp));
        }
        if (Array.isArray(parsed.claimedBadges)) {
          localStorage.setItem("claimedBadges", JSON.stringify(parsed.claimedBadges));
        }
        if (Array.isArray(parsed.seenBadges)) {
          localStorage.setItem("seenBadges", JSON.stringify(parsed.seenBadges));
        }
        if (typeof parsed.lastLevel === "number") {
          localStorage.setItem("lastLevel", String(parsed.lastLevel));
        }
        if (parsed.playerName) {
          localStorage.setItem("playerName", parsed.playerName);
        }
        if (parsed.userMemory) {
          localStorage.setItem("userMemory", JSON.stringify(parsed.userMemory));
        }

        setBackupStatus({ success: true, message: "Yedek başarıyla yüklendi! Sayfa yenileniyor..." });
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } catch (err) {
        console.error("Yedek yükleme hatası:", err);
        setBackupStatus({ success: false, message: "Dosya okunamadı. Geçerli bir JSON yedek dosyası seçin." });
        setTimeout(() => setBackupStatus(null), 4000);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-[#0f1220]/70 p-5 backdrop-blur-xl shadow-xl transition-all">
      {/* Üst Başlık & Açılır/Kapanır Düğmesi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              Yerel Depolama & Cihaz Senkronizasyonu Bilgilendirmesi
              <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-[10px] font-extrabold text-amber-300">
                ÖNEMLİ
              </span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Verileriniz bulutta değil, yalnızca kendi cihazınızda (bu tarayıcıda) saklanır.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <span>{isOpen ? "Detayları Gizle" : "Detayları Gör"}</span>
            {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Detay Kartları */}
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* 1. Tarayıcı Temizliği */}
            <div className="rounded-2xl border border-rose-500/20 bg-rose-950/15 p-3.5 backdrop-blur-md">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-xs mb-1.5">
                <Trash2 className="h-4 w-4" />
                <span>Tarayıcı Temizliği Uyarısı</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tüm görevleriniz, XP puanlarınız, seviyeniz ve AI profiliniz tarayıcınızın yerel hafızasında (<code className="text-rose-300 bg-rose-950/40 px-1 py-0.5 rounded text-[11px]">localStorage</code>) tutulur. 
                Tarayıcı geçmişini, önbelleği veya site verilerini temizlerseniz ilerlemeniz sıfırlanabilir.
              </p>
            </div>

            {/* 2. Cihazlar Arası Eşitleme */}
            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/15 p-3.5 backdrop-blur-md">
              <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs mb-1.5">
                <Smartphone className="h-4 w-4" />
                <span>Cihazlar Arası Eşitleme</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Uygulama sunucusuz (tamamen yerel ve gizlilik odaklı) çalıştığı için, telefon veya farklı bir tarayıcıdan giriş yaptığınızda veriler otomatik eşitlenmez. Her tarayıcı kendi ilerlemesini bağımsız saklar.
              </p>
            </div>
          </div>

          {/* Gizlilik & Yedekleme Çözümü */}
          <div className="rounded-2xl border border-purple-500/20 bg-purple-950/20 p-3.5 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-300">
              <span className="font-bold text-purple-300 flex items-center gap-1.5 mb-0.5">
                <Lock className="h-3.5 w-3.5 text-purple-400" /> %100 Gizlilik & Çözüm:
              </span>
              <span>
                Cihaz değiştirmek veya verilerinizi yedeklemek isterseniz tek tıkla yedeğinizi indirebilir ve diğer cihazınıza yükleyebilirsiniz.
              </span>
            </div>

            {/* Yedekleme Düğmeleri */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={handleExportBackup}
                className="flex items-center gap-1.5 rounded-xl bg-purple-600/30 border border-purple-500/40 px-3 py-1.5 text-xs font-bold text-purple-200 transition hover:bg-purple-600/50 hover:text-white"
                title="İlerlemenizi JSON formatında bilgisayarınıza indirin"
              >
                <Download className="h-3.5 w-3.5" /> Yedeği İndir
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-1.5 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
                title="Daha önce indirdiğiniz JSON yedeğini yükleyin"
              >
                <Upload className="h-3.5 w-3.5" /> Yedeği Yükle
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </div>
          </div>

          {backupStatus && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl p-2.5 text-xs font-semibold text-center border ${
                backupStatus.success
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/15 border-rose-500/30 text-rose-300"
              }`}
            >
              {backupStatus.message}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default StorageNotice;
