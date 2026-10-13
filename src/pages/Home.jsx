import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import ParticleBackground from "../components/effects/ParticleBackground";
import Navbar from "../components/Navbar";
import PlayerProfile from "../components/PlayerProfile";
import AITaskSuggestions from "../components/ai/AITaskSuggestions";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import StorageNotice from "../components/StorageNotice";
import ProfileSetupWizard from "../components/ai/ProfileSetupWizard";
import AIChat from "../components/ai/AIChat";
import LevelUpModal from "../components/LevelUpModal";
import LevelRoadmap from "../components/rewards/LevelRoadmap";
import BadgeUnlockedToast from "../components/rewards/BadgeUnlockedToast";
import XPFloat from "../components/effects/XPFloat";
import EnergyBurst from "../components/effects/EnergyBurst";
import ScreenFlash from "../components/effects/ScreenFlash";
import { useGame } from "../context/GameContext";
import { useAI } from "../context/AIContext";
import {
  Zap,
  CheckCircle2,
  Bot,
  User,
  Plus,
  X,
  MessageSquare,
  Sparkles,
} from "lucide-react";

function Home() {
  const {
    currentLevel,
    floatEvents,
    burstEvents,
    screenFlash,
    currentTier,
    progress,
    editingTask,
    setEditingTask,
    activeTasks,
  } = useGame();

  const { setIsChatOpen } = useAI();

  // Mobilde aktif olan sekme: 'tasks' | 'ai' | 'profile'
  const [mobileTab, setMobileTab] = useState("tasks");

  // Mobilde hızlı görev ekleme modalı
  const [isMobileTaskModalOpen, setIsMobileTaskModalOpen] = useState(false);

  return (
    <div className="relative min-h-screen text-slate-100 overflow-x-hidden selection:bg-purple-500/30">
      
      {/* =========================================
          FANTASY & COSMIC CANVAS BACKGROUND
      ========================================= */}
      <ParticleBackground level={currentLevel} />

      {/* =========================================
          GLOBAL VISUAL EFFECTS LAYER
      ========================================= */}
      <XPFloat floatEvents={floatEvents} />
      <EnergyBurst burstEvents={burstEvents} />
      <ScreenFlash active={screenFlash.active} color={screenFlash.color} />

      {/* =========================================
          MAIN APPLICATION SHELL
      ========================================= */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Sticky Header Navbar */}
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-1 px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto max-w-4xl">
            
            {/* =========================================================
                MASAÜSTÜ GÖRÜNÜMÜ (Desktop: md:block) - Tamamen Korunuyor
            ========================================================= */}
            <div className="hidden md:block space-y-8">
              {/* Oyuncu Profili, Level Barı ve İstatistikler */}
              <PlayerProfile />

              {/* Kişiselleştirilmiş Yapay Zeka Görev Önerileri */}
              <AITaskSuggestions />

              {/* Yeni Görev Ekleme / Düzenleme Formu */}
              <TaskForm />

              {/* Görev Listesi ve Arama / Filtreler */}
              <TaskList />

              {/* Yerel Depolama ve Cihaz Senkronizasyonu */}
              <StorageNotice />
            </div>

            {/* =========================================================
                MOBİL ÖZEL GÖRÜNÜMÜ (Mobile-Only: md:hidden) - Ergonomik
            ========================================================= */}
            <div className="block md:hidden pb-24">
              
              {/* 1. SEKME: GÖREVLER (Varsayılan ve Doğrudan Erişim) */}
              {mobileTab === "tasks" && (
                <div className="space-y-3.5">
                  {/* Mobil Üst Özet Kartı */}
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#111422]/80 p-3 shadow-lg backdrop-blur-xl">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-xl font-black text-xs text-white shadow-md"
                        style={{ backgroundColor: currentTier.color }}
                      >
                        {currentLevel}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">
                          {currentTier.name} Kademe
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {activeTasks.length} bekleyen görev · {progress.current}/{progress.required} XP
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsMobileTaskModalOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-3 py-2 text-xs font-bold text-white shadow-md shadow-purple-600/30 active:scale-95 transition"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Ekle</span>
                    </button>
                  </div>

                  {/* Doğrudan Görev Listesi (Arama, Öncelik Filtreleri ve Kartlar) */}
                  <TaskList />
                </div>
              )}

              {/* 2. SEKME: AI KOÇU */}
              {mobileTab === "ai" && (
                <div className="space-y-4">
                  {/* AI Sohbet Başlatıcı Hızlı Banner */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-900/40 via-[#121524]/90 to-indigo-950/50 p-4 shadow-xl backdrop-blur-xl"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                          <Bot className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                            AI Koç ile Sohbet
                            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                          </h4>
                          <p className="text-xs text-slate-400">
                            Hedeflerini böl, sorular sor veya tavsiye al.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsChatOpen(true)}
                        className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-purple-600/40 active:scale-95 transition"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Sohbet</span>
                      </button>
                    </div>
                  </motion.div>

                  {/* Kişiselleştirilmiş AI Görev Önerileri */}
                  <AITaskSuggestions />
                </div>
              )}

              {/* 3. SEKME: KARAKTER & SEVİYE */}
              {mobileTab === "profile" && (
                <div className="space-y-5">
                  <PlayerProfile />
                  <StorageNotice />
                </div>
              )}

            </div>
          </div>
        </main>

        {/* Masaüstü Footer Note */}
        <footer className="hidden md:block border-t border-white/5 py-6 text-center text-xs text-slate-500 backdrop-blur-sm">
          <p className="flex items-center justify-center gap-1.5">
            <span>XFlow<span className="text-purple-400">AI</span> · Üretkenliğini Seviye Atlat</span>
            <Zap className="h-3 w-3 text-purple-400" />
          </p>
        </footer>
      </div>

      {/* =========================================================
          MOBİL ALT DOCK / SABİT NAVİGASYON ÇUBUĞU (md:hidden)
      ========================================================= */}
      <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-white/[0.08] bg-[#090b16]/95 backdrop-blur-2xl px-4 py-2 shadow-[0_-5px_25px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-around relative max-w-md mx-auto">
          
          {/* Görevler Butonu */}
          <button
            type="button"
            onClick={() => setMobileTab("tasks")}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition active:scale-95 ${
              mobileTab === "tasks"
                ? "text-purple-300 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <div className={`p-1 rounded-xl ${mobileTab === "tasks" ? "bg-purple-500/20 text-purple-300" : ""}`}>
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <span className="text-[10px] tracking-tight">Görevler</span>
          </button>

          {/* ORTA FAB: + Hızlı Görev Ekleme Butonu */}
          <button
            type="button"
            onClick={() => setIsMobileTaskModalOpen(true)}
            className="-mt-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 via-purple-500 to-indigo-600 shadow-[0_0_25px_rgba(168,85,247,0.6)] border-4 border-[#090b16] text-white active:scale-90 transition transform"
            title="Hızlı Görev Ekle"
          >
            <Plus className="h-7 w-7" />
          </button>

          {/* AI Koç Butonu */}
          <button
            type="button"
            onClick={() => setMobileTab("ai")}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition active:scale-95 ${
              mobileTab === "ai"
                ? "text-purple-300 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <div className={`p-1 rounded-xl ${mobileTab === "ai" ? "bg-purple-500/20 text-purple-300" : ""}`}>
              <Bot className="h-5 w-5" />
            </div>
            <span className="text-[10px] tracking-tight">AI Koç</span>
          </button>

          {/* Karakter / Profil Butonu */}
          <button
            type="button"
            onClick={() => setMobileTab("profile")}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition active:scale-95 ${
              mobileTab === "profile"
                ? "text-purple-300 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <div className={`p-1 rounded-xl ${mobileTab === "profile" ? "bg-purple-500/20 text-purple-300" : ""}`}>
              <User className="h-5 w-5" />
            </div>
            <span className="text-[10px] tracking-tight">Karakter</span>
          </button>

        </div>
      </nav>

      {/* =========================================================
          MOBİL GÖREV EKLEME / DÜZENLEME MODAL (Bottom Sheet)
      ========================================================= */}
      <AnimatePresence>
        {(isMobileTaskModalOpen || Boolean(editingTask)) && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm md:hidden p-0 sm:p-4"
            onClick={() => {
              setIsMobileTaskModalOpen(false);
              setEditingTask(null);
            }}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 26, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-white/10 bg-[#0e1122] p-5 shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <h3 className="font-extrabold text-base text-white">
                    {editingTask ? "Görevi Düzenle" : "Yeni Görev Ekle"}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsMobileTaskModalOpen(false);
                    setEditingTask(null);
                  }}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <TaskForm
                onSubmitted={() => {
                  setIsMobileTaskModalOpen(false);
                  setEditingTask(null);
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================
          MODALS & TOAST NOTIFICATIONS & AI PANELS
      ========================================= */}
      <LevelUpModal />
      <LevelRoadmap />
      <BadgeUnlockedToast />
      <ProfileSetupWizard />
      <AIChat />
    </div>
  );
}

export default Home;