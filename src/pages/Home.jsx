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
import { Zap } from "lucide-react";

function Home() {
  const {
    currentLevel,
    floatEvents,
    burstEvents,
    screenFlash,
  } = useGame();

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
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl space-y-8">
            
            {/* Oyuncu Profili, Level Barı ve İstatistikler */}
            <PlayerProfile />

            {/* Kişiselleştirilmiş Yapay Zeka Görev Önerileri */}
            <AITaskSuggestions />

            {/* Yeni Görev Ekleme / Düzenleme Formu */}
            <TaskForm />

            {/* Görev Listesi ve Arama / Filtreler */}
            <TaskList />

            {/* Yerel Depolama, Tarayıcı Temizliği ve Cihaz Senkronizasyonu Bilgilendirmesi */}
            <StorageNotice />
          </div>
        </main>

        {/* Footer Note */}
        <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-500 backdrop-blur-sm">
          <p className="flex items-center justify-center gap-1.5">
            <span>TaskManager<span className="text-purple-400">AI</span> · Üretkenliğini Seviye Atlat</span>
            <Zap className="h-3 w-3 text-purple-400" />
          </p>
        </footer>
      </div>

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