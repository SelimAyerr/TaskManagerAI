// ==========================================
// Web Audio API Procedural Sound Effects
// Harici mp3/ses dosyası gerektirmeden saf synth
// ==========================================

let audioCtx = null;
let soundEnabled = true;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export const toggleSound = (enabled) => {
  soundEnabled = enabled;
  if (typeof window !== "undefined") {
    localStorage.setItem("sound_enabled", String(enabled));
  }
};

export const isSoundEnabled = () => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("sound_enabled");
    if (saved !== null) return saved === "true";
  }
  return soundEnabled;
};

// Görev tamamlanma tatmin edici "pop & bell" sesi
export const playTaskCompleteSound = () => {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Ton 1: E6 (1318.5 Hz)
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(587.33, now); // D5
  osc1.frequency.exponentialRampToValueAtTime(880, now + 0.1); // A5

  gain1.gain.setValueAtTime(0.15, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.35);

  // Ton 2: Çan ışıltısı
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = "triangle";
  osc2.frequency.setValueAtTime(1174.66, now + 0.08); // D6
  osc2.frequency.exponentialRampToValueAtTime(1760, now + 0.2);

  gain2.gain.setValueAtTime(0, now);
  gain2.gain.setValueAtTime(0.18, now + 0.08);
  gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(now + 0.08);
  osc2.stop(now + 0.5);
};

// Level Up Zafer Tınısı (Arpeggio fanfare)
export const playLevelUpSound = () => {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51]; // A major arpeggio
  const duration = 0.12;

  notes.forEach((freq, idx) => {
    const startTime = now + idx * 0.09;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = idx === notes.length - 1 ? "triangle" : "sine";
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      startTime + (idx === notes.length - 1 ? 0.7 : duration)
    );

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + (idx === notes.length - 1 ? 0.75 : duration));
  });
};

// Rozet Açılma Sesi (Sparkle chord)
export const playBadgeUnlockSound = () => {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const chords = [523.25, 659.25, 783.99, 1046.5]; // C major

  chords.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + idx * 0.04);

    gain.gain.setValueAtTime(0.12, now + idx * 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + idx * 0.04);
    osc.stop(now + 0.6);
  });
};

// Hafif mikro tıklama sesi
export const playClickSound = () => {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

  gain.gain.setValueAtTime(0.06, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.04);
};
