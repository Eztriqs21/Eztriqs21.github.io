(function() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  const canvas = document.getElementById('grid-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width, height;
  let mouseX = -1000, mouseY = -1000;
  let animId = null;
  let active = false;
  let time = 0;

  const SPACING = 40;
  const DOT_BASE_SIZE = 1.5;
  const DOT_COLOR = [139, 119, 101];
  const BASE_ALPHA = 0.1;
  const REPULSION_RADIUS = 140;
  const REPULSION_FORCE = 10;
  const BREATH_SPEED = 0.008;
  const BREATH_AMOUNT = 0.35;

  let dots = [];
  let pollen = [];
  let butterflies = [];

  function initDots() {
    dots = [];
    const cols = Math.ceil(width / SPACING) + 1;
    const rows = Math.ceil(height / SPACING) + 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dots.push({
          baseX: c * SPACING, baseY: r * SPACING,
          x: c * SPACING, y: r * SPACING,
          phase: Math.random() * Math.PI * 2,
          size: DOT_BASE_SIZE
        });
      }
    }
  }

  function initPollen() {
    pollen = [];
    for (let i = 0; i < 25; i++) {
      pollen.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: -0.1 - Math.random() * 0.3,
        size: 1 + Math.random() * 2.5,
        alpha: 0.08 + Math.random() * 0.15,
        phase: Math.random() * Math.PI * 2,
        color: Math.random() > 0.5 ? [107, 144, 128] : [224, 122, 95]
      });
    }
  }

  function initButterflies() {
    butterflies = [];
    for (let i = 0; i < 5; i++) {
      butterflies.push({
        x: Math.random() * width,
        y: Math.random() * height,
        targetX: Math.random() * width,
        targetY: Math.random() * height,
        size: 3 + Math.random() * 3,
        wingPhase: Math.random() * Math.PI * 2,
        alpha: 0.15 + Math.random() * 0.15,
        color: Math.random() > 0.5 ? [107, 144, 128] : [196, 168, 130]
      });
    }
  }

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initDots();
    initPollen();
    initButterflies();
  }

  function draw() {
    if (!active) return;
    ctx.clearRect(0, 0, width, height);
    time++;

    // Dot grid with breathing and repulsion
    for (const dot of dots) {
      const breathScale = 1 + Math.sin(time * BREATH_SPEED + dot.phase) * BREATH_AMOUNT;
      const dx = dot.baseX - mouseX;
      const dy = dot.baseY - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let offsetX = 0, offsetY = 0;
      let alpha = BASE_ALPHA;
      let size = dot.size * breathScale;

      if (dist < REPULSION_RADIUS && dist > 0) {
        const force = (1 - dist / REPULSION_RADIUS) * REPULSION_FORCE;
        offsetX = (dx / dist) * force;
        offsetY = (dy / dist) * force;
        alpha = Math.min(0.3, alpha + (1 - dist / REPULSION_RADIUS) * 0.15);
        size = dot.size * (1 + (1 - dist / REPULSION_RADIUS) * 0.5);
      }

      dot.x = dot.baseX + offsetX;
      dot.y = dot.baseY + offsetY;

      ctx.beginPath();
      ctx.arc(dot.x, dot.y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${DOT_COLOR[0]},${DOT_COLOR[1]},${DOT_COLOR[2]},${alpha})`;
      ctx.fill();
    }

    // Organic connections between nearby dots (with early exit optimization)
    const maxDist = SPACING * 1.2;
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dx = dots[i].x - dots[j].x;
        if (Math.abs(dx) > maxDist) continue;
        const dy = dots[i].y - dots[j].y;
        if (Math.abs(dy) > maxDist) continue;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.04;
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(dots[j].x, dots[j].y);
          ctx.strokeStyle = `rgba(${DOT_COLOR[0]},${DOT_COLOR[1]},${DOT_COLOR[2]},${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Floating pollen
    for (const p of pollen) {
      p.x += p.vx + Math.sin(time * 0.005 + p.phase) * 0.3;
      p.y += p.vy;
      if (p.y < -10) { p.y = height + 10; p.x = Math.random() * width; }
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;

      const distToMouse = Math.sqrt(Math.pow(p.x - mouseX, 2) + Math.pow(p.y - mouseY, 2));
      let alpha = p.alpha;
      let size = p.size;
      if (distToMouse < REPULSION_RADIUS) {
        const f = 1 - distToMouse / REPULSION_RADIUS;
        alpha = Math.min(0.5, alpha + f * 0.2);
        size = p.size * (1 + f * 0.8);
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${alpha})`;
      ctx.fill();
    }

    // Butterflies
    for (const b of butterflies) {
      const dx = b.targetX - b.x;
      const dy = b.targetY - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 10) {
        b.targetX = Math.random() * width;
        b.targetY = Math.random() * height;
      }
      b.x += dx * 0.005;
      b.y += dy * 0.005;
      b.wingPhase += 0.08;

      const wingSpread = Math.sin(b.wingPhase) * b.size;
      const bodyAngle = Math.atan2(dy, dx);

      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(bodyAngle);

      // Wings
      ctx.beginPath();
      ctx.ellipse(-b.size * 0.3, wingSpread * 0.5, b.size * 0.6, Math.abs(wingSpread) * 0.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${b.color[0]},${b.color[1]},${b.color[2]},${b.alpha * 0.6})`;
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(-b.size * 0.3, -wingSpread * 0.5, b.size * 0.6, Math.abs(wingSpread) * 0.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${b.color[0]},${b.color[1]},${b.color[2]},${b.alpha * 0.6})`;
      ctx.fill();

      // Body
      ctx.beginPath();
      ctx.ellipse(0, 0, b.size * 0.4, b.size * 0.15, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${b.color[0]},${b.color[1]},${b.color[2]},${b.alpha})`;
      ctx.fill();

      ctx.restore();
    }

    // Cursor glow
    if (mouseX > 0 && mouseY > 0) {
      const glow = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, REPULSION_RADIUS);
      glow.addColorStop(0, 'rgba(107,144,128,0.06)');
      glow.addColorStop(0.5, 'rgba(107,144,128,0.02)');
      glow.addColorStop(1, 'rgba(107,144,128,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(mouseX - REPULSION_RADIUS, mouseY - REPULSION_RADIUS, REPULSION_RADIUS * 2, REPULSION_RADIUS * 2);
    }

    // Particle system from cursor engine
    window.cursorEngine?.updateParticles?.();

    animId = requestAnimationFrame(draw);
  }

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  window.gridBloom = {
    start: function() { active = true; resize(); draw(); },
    stop: function() { active = false; if (animId) cancelAnimationFrame(animId); ctx.clearRect(0, 0, width, height); },
    resize: resize
  };

  window.addEventListener('resize', () => { if (active) resize(); });
})();
