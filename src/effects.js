// ── EFECTOS VISUALES TÁCTICOS ─────────────────────────────────────────────

// ── Canvas: Red táctica animada ──────────────────────────────────────────────
export function initTacticalCanvas() {
  const canvas = document.createElement('canvas');
  canvas.id = 'tactical-canvas';
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let W, H, particles = [], animId;

  const PRIMARY = 'rgba(209,252,0,';

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: 60 }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const alpha = (1 - dist / 120) * 0.4;
          ctx.strokeStyle = PRIMARY + alpha + ')';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw dots
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = PRIMARY + '0.7)';
      ctx.fill();

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    });

    animId = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); particles = Array.from({ length: 60 }, createParticle); });
  init();
  draw();

  return () => cancelAnimationFrame(animId);
}

// ── Partículas de misión completada ────────────────────────────────────────
export function fireMissionComplete() {
  const colors = ['#d1fc00', '#00f5c8', '#ffffff', '#6b8e23', '#fdff74'];
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const count = 80;

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const speed = Math.random() * 220 + 80;
    const tx = Math.cos(angle) * speed;
    const ty = Math.sin(angle) * speed - Math.random() * 100;
    const size = Math.random() * 10 + 4;
    const dur = (Math.random() * 0.8 + 0.8).toFixed(2);
    const color = colors[Math.floor(Math.random() * colors.length)];

    const el = document.createElement('div');
    el.className = 'particle';
    el.style.cssText = `
      left:${cx - size / 2}px;
      top:${cy - size / 2}px;
      width:${size}px; height:${size}px;
      background:${color};
      box-shadow: 0 0 6px ${color};
      --tx:${tx}px; --ty:${ty}px;
      --duration:${dur}s;
      border-radius:${Math.random() > 0.5 ? '50%' : '0'};
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), parseFloat(dur) * 1000 + 100);
  }
}

// ── Contador animado de estadísticas ─────────────────────────────────────────
export function animateCounter(el, target, duration = 800) {
  if (!el) return;
  const start = performance.now();
  const from = 0;
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(from + (target - from) * ease);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ── Beep táctica de sonido ─────────────────────────────────────────────────
export function beep(freq = 880, dur = 150, gain = 0.3) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.frequency.value = freq;
    gainNode.gain.value = gain;
    osc.start();
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur / 1000);
    setTimeout(() => { osc.stop(); ctx.close(); }, dur + 50);
  } catch (e) {}
}
