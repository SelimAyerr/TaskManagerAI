import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGame } from "../context/GameContext";
import { BADGE_CATEGORIES } from "../config/badges";
import { Trophy, Sparkles, Check, Target, Flame, Award } from "lucide-react";

const CATEGORY_ICONS = {
  tasks: Target,
  priority: Flame,
  level: Award,
  special: Sparkles,
};

function BadgeMenu() {
  const { badges, claimedBadges, stats } = useGame();
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const menuRef = useRef(null);

  // Kullanıcının daha önce görüp incelediği rozetler
  const [seenBadges, setSeenBadges] = useState(() => {
    try {
      const saved = localStorage.getItem("seenBadges");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Henüz görülmemiş yeni kazanılmış rozet sayısı
  const unseenCount = claimedBadges.filter((id) => !seenBadges.includes(id)).length;

  // Kullanıcı menüyü açtığında kazanılmış rozetleri "görüldü" olarak işaretle
  useEffect(() => {
    if (open && claimedBadges.length > 0) {
      const hasUnseen = claimedBadges.some((id) => !seenBadges.includes(id));
      if (hasUnseen) {
        setSeenBadges(claimedBadges);
        try {
          localStorage.setItem("seenBadges", JSON.stringify(claimedBadges));
        } catch (err) {
          console.error("seenBadges kaydetme hatası:", err);
        }
      }
    }
  }, [open, claimedBadges, seenBadges]);

  // Dışarı tıklayınca menüyü kapat
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Filtrelenmiş rozetler
  const filteredBadges = badges.filter((b) => {
    if (selectedCategory === "all") return true;
    return b.category === selectedCategory;
  });

  const claimedCount = claimedBadges.length;
  const totalCount = badges.length;

  return (
    <div className="relative" ref={menuRef}>
      {/* Rozet Butonu */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="button"
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-slate-900/70 text-base shadow-sm transition hover:border-amber-400/50"
        title="Başarım Rozetleri"
      >
        <Trophy className="h-4 w-4 text-amber-400" />

        {/* Yeni/Görülmemiş Rozet Bildirim Balonu (Açılınca kaybolur) */}
        {unseenCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-1 text-[9px] font-black text-slate-950 shadow-md animate-pulse"
          >
            {unseenCount}
          </motion.span>
        )}
      </motion.button>

      {/* Rozet Vitrin Popover */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-12 z-50 w-[360px] sm:w-[400px] overflow-hidden rounded-3xl border border-white/15 bg-[#101323]/95 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
          >
            {/* Başlık */}
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-400" />
                  <span>Başarım Rozetleri</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  {claimedCount} / {totalCount} rozet tamamlandı
                </p>
              </div>

              {/* İlerleme Rozeti */}
              <span className="rounded-full bg-amber-500/20 px-2.5 py-1 text-xs font-black text-amber-400 border border-amber-500/30">
                %{Math.round((claimedCount / totalCount) * 100)}
              </span>
            </div>

            {/* Kategori Sekmeleri */}
            <div className="mb-3 flex gap-1 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition flex-shrink-0 ${
                  selectedCategory === "all"
                    ? "bg-purple-600/40 text-purple-200 border border-purple-500/40"
                    : "bg-slate-900/60 text-slate-400 hover:text-white"
                }`}
              >
                Tümü
              </button>
              {Object.values(BADGE_CATEGORIES).map((cat) => {
                const CatIcon = CATEGORY_ICONS[cat.id] || Sparkles;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold transition flex-shrink-0 ${
                      selectedCategory === cat.id
                        ? "bg-purple-600/40 text-purple-200 border border-purple-500/40"
                        : "bg-slate-900/60 text-slate-400 hover:text-white"
                    }`}
                  >
                    <CatIcon className="h-3 w-3" />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Rozet Listesi */}
            <div className="max-h-80 space-y-2.5 overflow-y-auto pr-1">
              {filteredBadges.map((badge) => {
                const isClaimed = claimedBadges.includes(badge.id);
                const prog = badge.progress(stats);
                const pct = Math.min(100, Math.round((prog.current / prog.target) * 100));

                return (
                  <div
                    key={badge.id}
                    className={`rounded-2xl border p-3 transition-all ${
                      isClaimed
                        ? "border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-purple-500/10 shadow-sm"
                        : "border-white/5 bg-slate-900/50 opacity-80"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* İkon */}
                      <div
                        className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-xl shadow-md ${
                          isClaimed
                            ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-amber-500/20"
                            : "bg-slate-800 text-slate-400 grayscale"
                        }`}
                      >
                        {badge.icon}
                      </div>

                      {/* Bilgiler */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs text-white">
                            {badge.name}
                          </h4>
                          <span className="text-[10px] font-black text-amber-400">
                            +{badge.rewardXp} XP
                          </span>
                        </div>

                        <p className="mt-0.5 text-[11px] text-slate-400">
                          {badge.description}
                        </p>

                        {/* İlerleme Durumu */}
                        <div className="mt-2 flex items-center justify-between text-[10px]">
                          <span className="text-slate-500">
                            {isClaimed
                              ? "Tamamlandı"
                              : `${prog.current} / ${prog.target}`}
                          </span>

                          {isClaimed ? (
                            <span className="font-bold text-emerald-400 flex items-center gap-1">
                              <Check className="h-3 w-3" />
                              <span>Kazanıldı</span>
                            </span>
                          ) : (
                            <span className="font-bold text-purple-400">
                              %{pct}
                            </span>
                          )}
                        </div>

                        {/* Mini Bar */}
                        {!isClaimed && (
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-800">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Alt Kısım İpucu */}
            <div className="mt-4 border-t border-white/10 pt-3 text-center">
              <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-400" />
                <span>Rozetler koşullar sağlandığında otomatik olarak kazanılır ve XP anında hesabına geçer.</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default BadgeMenu;