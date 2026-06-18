(function() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  const canvas = document.getElementById('grid-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width, height;
  let mouseX = -1000, mouseY = -1000;
  let offset = 0;
  let animId = null;
  let active = false;
  let time = 0;

  const GRID_SPACING = 50;
  const HORIZON_Y_RATIO = 0.35;
  const LINE_COLOR = [0, 240, 255];
  const BASE_ALPHA = 0.06;
  const GLOW_ALPHA = 0.35;
  const GLOW_RADIUS = 180;
  const SCROLL_SPEED = 0.3;

  let floatingParticles = [];
  let dataStreams = [];
  let scanY = -100;

  function initFloatingParticles() {
    floatingParticles = [];
    const count = width < 768 ? 20 : 40;
    for (let i = 0; i < count; i++) {
      floatingParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.2 - Math.random() * 0.5,
        size: 1 + Math.random() * 2,
        alpha: 0.1 + Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  function initDataStreams() {
    dataStreams = [];
    const count = width < 768 ? 4 : 8;
    for (let i = 0; i < count; i++) {
      dataStreams.push({
        x: Math.random() * width,
        y: -Math.random() * height,
        speed: 1 + Math.random() * 2,
        chars: '01'.split(''),
        length: 5 + Math.floor(Math.random() * 10),
        alpha: 0.05 + Math.random() * 0.1
      });
    }
  }

  let _resizeTimer = null;
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initFloatingParticles();
    initDataStreams();
  }

  function debouncedResize() {
    if (_resizeTimer) clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(resize, 200);
  }

  function draw() {
    if (!active) return;
    ctx.clearRect(0, 0, width, height);
    time++;

    const horizonY = height * HORIZON_Y_RATIO;
    const centerX = width / 2;
    offset = (offset + SCROLL_SPEED) % GRID_SPACING;

    const numHLines = 30;
    for (let i = 0; i <= numHLines; i++) {
      const t = i / numHLines;
      const y = horizonY + (height - horizonY) * Math.pow(t, 1.5);
      const adjustedY = y + offset * Math.pow(t, 1.5);
      if (adjustedY < horizonY || adjustedY > height) continue;

      let alpha = BASE_ALPHA * (0.3 + t * 0.7);
      const distToMouse = Math.abs(adjustedY - mouseY);
      if (distToMouse < GLOW_RADIUS) {
        alpha = Math.min(GLOW_ALPHA, alpha + (1 - distToMouse / GLOW_RADIUS) * 0.2);
      }

      ctx.beginPath();
      ctx.moveTo(0, adjustedY);
      ctx.lineTo(width, adjustedY);
      ctx.strokeStyle = `rgba(${LINE_COLOR[0]},${LINE_COLOR[1]},${LINE_COLOR[2]},${alpha})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    const numVLines = 24;
    for (let i = -numVLines / 2; i <= numVLines / 2; i++) {
      const bottomX = centerX + i * GRID_SPACING * 2;
      let alpha = BASE_ALPHA;
      const distToMouse = Math.sqrt(Math.pow(bottomX - mouseX, 2) + Math.pow(height - mouseY, 2));
      if (distToMouse < GLOW_RADIUS * 1.5) {
        alpha = Math.min(GLOW_ALPHA, alpha + (1 - distToMouse / (GLOW_RADIUS * 1.5)) * 0.15);
      }

      ctx.beginPath();
      ctx.moveTo(centerX, horizonY);
      ctx.lineTo(bottomX, height + 50);
      ctx.strokeStyle = `rgba(${LINE_COLOR[0]},${LINE_COLOR[1]},${LINE_COLOR[2]},${alpha})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    for (let i = 0; i <= numHLines; i++) {
      const t = i / numHLines;
      const y = horizonY + (height - horizonY) * Math.pow(t, 1.5);
      const adjustedY = y + offset * Math.pow(t, 1.5);
      if (adjustedY < horizonY || adjustedY > height) continue;

      const spread = (adjustedY - horizonY) / (height - horizonY);
      const numDots = Math.floor(numVLines * spread);

      for (let j = -numDots / 2; j <= numDots / 2; j++) {
        const dotX = centerX + j * GRID_SPACING * 2 * spread;
        const dotY = adjustedY;
        const distToMouse = Math.sqrt(Math.pow(dotX - mouseX, 2) + Math.pow(dotY - mouseY, 2));
        let dotAlpha = BASE_ALPHA * 0.5;
        let dotSize = 1;

        if (distToMouse < GLOW_RADIUS) {
          const glowFactor = 1 - (distToMouse / GLOW_RADIUS);
          dotAlpha = Math.min(0.6, dotAlpha + glowFactor * 0.4);
          dotSize = 1 + glowFactor * 2.5;
        }

        ctx.beginPath();
        ctx.arc(dotX, dotY, dotSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${LINE_COLOR[0]},${LINE_COLOR[1]},${LINE_COLOR[2]},${dotAlpha})`;
        ctx.fill();
      }
    }

    for (const p of floatingParticles) {
      p.x += p.vx + Math.sin(time * 0.01 + p.phase) * 0.1;
      p.y += p.vy;
      if (p.y < -10) { p.y = height + 10; p.x = Math.random() * width; }
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;

      const distToMouse = Math.sqrt(Math.pow(p.x - mouseX, 2) + Math.pow(p.y - mouseY, 2));
      let alpha = p.alpha;
      let size = p.size;
      if (distToMouse < GLOW_RADIUS) {
        const f = 1 - distToMouse / GLOW_RADIUS;
        alpha = Math.min(0.8, alpha + f * 0.4);
        size = p.size * (1 + f * 1.5);
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${LINE_COLOR[0]},${LINE_COLOR[1]},${LINE_COLOR[2]},${alpha})`;
      ctx.fill();
    }

    ctx.font = '10px JetBrains Mono, monospace';
    for (const s of dataStreams) {
      s.y += s.speed;
      if (s.y > height + s.length * 14) { s.y = -s.length * 14; s.x = Math.random() * width; }

      for (let c = 0; c < s.length; c++) {
        const charY = s.y + c * 14;
        if (charY < 0 || charY > height) continue;
        const charAlpha = s.alpha * (1 - c / s.length);
        const char = s.chars[Math.floor(Math.random() * s.chars.length)];
        ctx.fillStyle = `rgba(${LINE_COLOR[0]},${LINE_COLOR[1]},${LINE_COLOR[2]},${charAlpha})`;
        ctx.fillText(char, s.x, charY);
      }
    }

    scanY = (scanY + 0.5) % height;
    const scanGrad = ctx.createLinearGradient(0, scanY - 2, 0, scanY + 2);
    scanGrad.addColorStop(0, 'rgba(0,240,255,0)');
    scanGrad.addColorStop(0.5, 'rgba(0,240,255,0.06)');
    scanGrad.addColorStop(1, 'rgba(0,240,255,0)');
    ctx.fillStyle = scanGrad;
    ctx.fillRect(0, scanY - 2, width, 4);

    if (mouseX > 0 && mouseY > 0) {
      const glow = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, GLOW_RADIUS);
      glow.addColorStop(0, 'rgba(0,240,255,0.08)');
      glow.addColorStop(0.5, 'rgba(0,240,255,0.03)');
      glow.addColorStop(1, 'rgba(0,240,255,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(mouseX - GLOW_RADIUS, mouseY - GLOW_RADIUS, GLOW_RADIUS * 2, GLOW_RADIUS * 2);
    }

    window.cursorEngine?.updateParticles?.();
    animId = requestAnimationFrame(draw);
  }

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  window.gridNexus = {
    start: function() { if (active) return; active = true; resize(); draw(); },
    stop: function() { active = false; if (animId) cancelAnimationFrame(animId); ctx.clearRect(0, 0, width, height); },
    resize: resize
  };

  window.addEventListener('resize', () => { if (active) debouncedResize(); });
})();
