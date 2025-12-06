//  config
const CONFIG = {
  baseDensity: 0.18, 
  maxSpeed: 0.5, 
  radius: [0.8, 2.0], 
  linkDist: 120, 
  linkAlpha: 0.15, 
  mouseInfluence: 120,
  repelStrength: 0.3,
  clickBurst: 100,
  colorParticle: "#c9e7ff",
  colorLink: "#7dd3fc"
};

// canvas setup
const canvas = document.getElementById("particle-bg");
if (canvas) {
  const ctx = canvas.getContext("2d", { alpha: true });
  let DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  let W = 0, H = 0;

  function resize() {
    DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    W = canvas.width = Math.floor(window.innerWidth * DPR);
    H = canvas.height = Math.floor(window.innerHeight * DPR);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    computeParticlesCount();
  }
  window.addEventListener("resize", resize, { passive: true });

  // particles
  let particles = [];
  let targetCount = 0;

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }
  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  class Particle {
    constructor() {
      this.reset(true);
    }
    reset(randomPos = false) {
      this.x = randomPos ? rand(0, W) : Math.random() < 0.5 ? 0 : W;
      this.y = randomPos ? rand(0, H) : rand(0, H);
      const ang = rand(0, Math.PI * 2);
      const speed = rand(0.05, CONFIG.maxSpeed);
      this.vx = Math.cos(ang) * speed;
      this.vy = Math.sin(ang) * speed;
      this.r = rand(CONFIG.radius[0], CONFIG.radius[1]) * DPR;
    }
    step(mx, my) {
      if (mx !== null && my !== null) {
        const dx = this.x - mx, dy = this.y - my;
        const d2 = dx * dx + dy * dy;
        const r = CONFIG.mouseInfluence * DPR;
        if (d2 < r * r) {
          const d = Math.sqrt(d2) || 0.001;
          const ux = dx / d, uy = dy / d;
          const strength = CONFIG.repelStrength;
          this.vx += ux * strength * (1 - d / r);
          this.vy += uy * strength * (1 - d / r);
        }
      }

      const sp = Math.hypot(this.vx, this.vy);
      const maxSp = CONFIG.maxSpeed;
      if (sp > maxSp) {
        this.vx *= maxSp / sp;
        this.vy *= maxSp / sp;
      }

      this.x += this.vx * DPR;
      this.y += this.vy * DPR;

      if (this.x < -50) this.x = W + 50;
      if (this.x > W + 50) this.x = -50;
      if (this.y < -50) this.y = H + 50;
      if (this.y > H + 50) this.y = -50;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = CONFIG.colorParticle;
      ctx.globalAlpha = 0.7;
      ctx.fill();
    }
  }

  function computeParticlesCount() {
    const area = (W * H) / (DPR * DPR);
    const per10k = CONFIG.baseDensity;
    targetCount = Math.round(per10k * (area / 10000));
    targetCount = clamp(targetCount, 30, 150);
    if (particles.length < targetCount) {
      const add = targetCount - particles.length;
      for (let i = 0; i < add; i++) particles.push(new Particle());
    } else if (particles.length > targetCount) {
      particles.length = targetCount;
    }
  }

  // mouse capture
  const mouse = { x: null, y: null };
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX * DPR;
    mouse.y = e.clientY * DPR;
  }, { passive: true });
  window.addEventListener("mouseleave", () => {
    mouse.x = mouse.y = null;
  });

  window.addEventListener("click", (e) => {
    const mx = e.clientX * DPR, my = e.clientY * DPR;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const dx = p.x - mx, dy = p.y - my;
      const d2 = dx * dx + dy * dy;
      const r = CONFIG.mouseInfluence * DPR;
      if (d2 < r * r) {
        const d = Math.sqrt(d2) || 0.001;
        const ux = dx / d, uy = dy / d;
        p.vx += ux * (CONFIG.clickBurst / 100);
        p.vy += uy * (CONFIG.clickBurst / 100);
      }
    }
  });

  // links 
  function drawLinks() {
    ctx.lineWidth = 1 * DPR;
    ctx.strokeStyle = CONFIG.colorLink;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < CONFIG.linkDist * DPR) {
          const alpha = CONFIG.linkAlpha * (1 - dist / (CONFIG.linkDist * DPR));
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  // loops
  function loop() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < particles.length; i++) {
      particles[i].step(mouse.x, mouse.y);
    }
    drawLinks();
    for (let i = 0; i < particles.length; i++) {
      particles[i].draw();
    }
    requestAnimationFrame(loop);
  }

  // Init
  resize();
  for (let i = 0; i < 80; i++) particles.push(new Particle());
  computeParticlesCount();
  loop();
}