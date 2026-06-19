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

  const STAR_COLOR = [140, 122, 230];
  const CONNECTION_DIST = 150;
  const GLOW_RADIUS = 200;
  const BASE_LINE_ALPHA = 0.04;
  const MOUSE_LINE_ALPHA = 0.2;
  const DRIFT_SPEED = 0.05;

  let stars = [];

  function initStars() {
    stars = [];
    const count = width < 768 ? 40 : 80;
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 0.5 + Math.random() * 2,
        baseAlpha: 0.1 + Math.random() * 0.4,
        twinkleSpeed: 0.02 + Math.random() * 0.04,
        twinklePhase: Math.random() * Math.PI * 2,
        vx: (Math.random() - 0.5) * DRIFT_SPEED,
        vy: (Math.random() - 0.5) * DRIFT_SPEED
      });
    }
  }

  let _resizeTimer = null;
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initStars();
  }

  function debouncedResize() {
    if (_resizeTimer) clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(resize, 200);
  }

  function draw() {
    if (!active) return;
    ctx.clearRect(0, 0, width, height);
    time++;

    for (const star of stars) {
      star.x += star.vx;
      star.y += star.vy;

      if (star.x < -10) star.x = width + 10;
      if (star.x > width + 10) star.x = -10;
      if (star.y < -10) star.y = height + 10;
      if (star.y > height + 10) star.y = -10;

      const twinkle = 0.5 + 0.5 * Math.sin(time * star.twinkleSpeed + star.twinklePhase);
      const distToMouse = Math.sqrt(Math.pow(star.x - mouseX, 2) + Math.pow(star.y - mouseY, 2));

      let alpha = star.baseAlpha * (0.5 + twinkle * 0.5);
      let size = star.size;

      if (distToMouse < GLOW_RADIUS) {
        const f = 1 - distToMouse / GLOW_RADIUS;
        alpha = Math.min(1, alpha + f * 0.5);
        size = star.size + f * 1.5;
      }

      ctx.beginPath();
      ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${STAR_COLOR[0]},${STAR_COLOR[1]},${STAR_COLOR[2]},${alpha})`;
      ctx.fill();
    }

    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const a = stars[i];
        const b = stars[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DIST) {
          const midX = (a.x + b.x) / 2;
          const midY = (a.y + b.y) / 2;
          const distToMouse = Math.sqrt(Math.pow(midX - mouseX, 2) + Math.pow(midY - mouseY, 2));

          let alpha = BASE_LINE_ALPHA * (1 - dist / CONNECTION_DIST);

          if (distToMouse < GLOW_RADIUS) {
            const f = 1 - distToMouse / GLOW_RADIUS;
            alpha = alpha + f * (MOUSE_LINE_ALPHA - BASE_LINE_ALPHA) * (1 - dist / CONNECTION_DIST);
          }

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${STAR_COLOR[0]},${STAR_COLOR[1]},${STAR_COLOR[2]},${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    if (mouseX > 0 && mouseY > 0) {
      const glow = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, GLOW_RADIUS);
      glow.addColorStop(0, `rgba(${STAR_COLOR[0]},${STAR_COLOR[1]},${STAR_COLOR[2]},0.06)`);
      glow.addColorStop(0.5, `rgba(${STAR_COLOR[0]},${STAR_COLOR[1]},${STAR_COLOR[2]},0.02)`);
      glow.addColorStop(1, `rgba(${STAR_COLOR[0]},${STAR_COLOR[1]},${STAR_COLOR[2]},0)`);
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

  window.gridNebula = {
    start: function() { if (active) return; active = true; resize(); draw(); },
    stop: function() { active = false; if (animId) cancelAnimationFrame(animId); ctx.clearRect(0, 0, width, height); },
    resize: resize
  };

  window.addEventListener('resize', () => { if (active) debouncedResize(); });
})();
