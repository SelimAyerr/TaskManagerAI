import { useEffect, useRef } from "react";
import { getTierForLevel } from "../../config/levels";

function ParticleBackground({ level = 1 }) {
  const canvasRef = useRef(null);
  const tier = getTierForLevel(level);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrame;
    let particles = [];
    let meteors = [];
    let stars = [];

    let width = 0;
    let height = 0;

    const isHighLevel = level >= 30;
    const isLegend = level >= 50;
    const isCosmic = level >= 75;
    const isImmortal = level >= 100;

    const palettes = {
      novice: ["#ffffff", "#94a3b8", "#cbd5e1", "#38bdf8"],
      hunter: ["#ffffff", "#f97316", "#ef4444", "#facc15"],
      expert: ["#ffffff", "#06b6d4", "#38bdf8", "#3b82f6"],
      master: ["#ffffff", "#facc15", "#f59e0b", "#fde047"],
      legend: ["#ffffff", "#22d3ee", "#a855f7", "#ec4899"],
      cosmic: ["#ffffff", "#818cf8", "#c084fc", "#f472b6", "#38bdf8"],
      immortal: ["#ffffff", "#facc15", "#fb923c", "#f472b6", "#a855f7", "#38bdf8"],
    };

    const currentPalette = palettes[tier.id] || palettes.novice;

    const randomColor = () => {
      return currentPalette[Math.floor(Math.random() * currentPalette.length)];
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    // Stars (Derinlik hissi veren durağan/parıldayan yıldızlar)
    const starCount = isImmortal ? 160 : isCosmic ? 130 : isLegend ? 95 : 60;
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * (isLegend ? 1.8 : 1.2) + 0.3,
        opacity: Math.random() * 0.6 + 0.15,
        speed: Math.random() * 0.015 + 0.004,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Particles (Yüzen dinamik enerji parçacıkları)
    const particleCount = isImmortal ? 100 : isCosmic ? 80 : isLegend ? 60 : isHighLevel ? 45 : 30;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * (isLegend ? 0.45 : 0.25),
        vy: (Math.random() - 0.5) * (isLegend ? 0.45 : 0.25),
        size: Math.random() * (isCosmic ? 2.6 : 1.8) + 0.6,
        color: randomColor(),
        opacity: Math.random() * 0.6 + 0.2,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    // Meteors (Level 30+)
    if (isHighLevel) {
      const meteorCount = isImmortal ? 7 : isCosmic ? 4 : isLegend ? 3 : 1;
      for (let i = 0; i < meteorCount; i++) {
        meteors.push({
          x: Math.random() * width,
          y: Math.random() * height * 0.4,
          length: 70 + Math.random() * 110,
          speed: 3.5 + Math.random() * 3.5,
          angle: Math.PI / 4,
          opacity: Math.random() * 0.4 + 0.3,
        });
      }
    }

    // Draw functions
    const drawStar = (x, y, size, opacity) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawParticle = (p, time) => {
      const pulse = Math.sin(time * 0.002 + p.pulse) * 0.25 + 0.75;
      ctx.save();
      ctx.globalAlpha = p.opacity * pulse;
      ctx.fillStyle = p.color;
      ctx.shadowBlur = isLegend ? 12 : 6;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawMeteor = (m) => {
      const grad = ctx.createLinearGradient(
        m.x,
        m.y,
        m.x - Math.cos(m.angle) * m.length,
        m.y - Math.sin(m.angle) * m.length
      );
      grad.addColorStop(0, `rgba(255,255,255,${m.opacity})`);
      grad.addColorStop(0.3, `${tier.color}${Math.floor(m.opacity * 200).toString(16).padStart(2, "0")}`);
      grad.addColorStop(1, "rgba(0,0,0,0)");

      ctx.save();
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(
        m.x - Math.cos(m.angle) * m.length,
        m.y - Math.sin(m.angle) * m.length
      );
      ctx.stroke();
      ctx.restore();
    };

    const drawConnections = () => {
      if (level < 20) return;
      const maxDistance = isCosmic ? 130 : 100;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const op = (1 - dist / maxDistance) * (isCosmic ? 0.14 : 0.08);
            ctx.save();
            ctx.strokeStyle = a.color;
            ctx.globalAlpha = op;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }
    };

    const animate = (time) => {
      ctx.clearRect(0, 0, width, height);

      // Stars
      stars.forEach((s) => {
        const twinkle = Math.sin(time * s.speed + s.phase);
        const op = s.opacity * (0.6 + twinkle * 0.4);
        drawStar(s.x, s.y, s.size, op);
      });

      // Particles
      particles.forEach((p) => {
        p.x += p.vx + Math.sin(time * 0.0004 + p.pulse) * 0.08;
        p.y += p.vy + Math.cos(time * 0.0003 + p.pulse) * 0.08;

        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        drawParticle(p, time);
      });

      // Energy connections (Level 20+)
      drawConnections();

      // Meteors (Level 30+)
      if (isHighLevel) {
        meteors.forEach((m) => {
          m.x += Math.cos(m.angle) * m.speed;
          m.y += Math.sin(m.angle) * m.speed;

          if (m.x > width + 200 || m.y > height + 200) {
            m.x = Math.random() * width - 150;
            m.y = -60 - Math.random() * 200;
          }
          drawMeteor(m);
        });
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, [level, tier]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      {/* Derin Kozmik Arka Plan Ambiyansı */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${tier.glowColor} 0%, rgba(9, 10, 16, 0.85) 60%, #090a10 100%)`,
        }}
      />

      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Ortalanmış hafif derinlik aydınlatması */}
      <div
        className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px] pointer-events-none transition-all duration-1000"
        style={{
          backgroundColor: tier.color,
          opacity: level >= 50 ? 0.08 : 0.04,
        }}
      />
    </div>
  );
}

export default ParticleBackground;