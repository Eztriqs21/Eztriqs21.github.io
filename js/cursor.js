(function() {
  function initCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  const ring = document.getElementById('cursor-ring');
  const dot = document.getElementById('cursor-dot');
  const trail = document.getElementById('cursor-trail');
  const pulse = document.getElementById('cursor-pulse');
  if (!ring || !dot) return;

  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let ringX = mouseX, ringY = mouseY;
  let trailX = mouseX, trailY = mouseY;
  let dotX = mouseX, dotY = mouseY;
  let isHovering = false;
  let hoverScale = 1;
  let targetHoverScale = 1;
  let particles = [];
  let lastParticleTime = 0;
  let lastMouseX = -100, lastMouseY = -100;
  let speed = 0;
  let _rafId = null;
  let _alive = true;

  function onMouseMove(e) {
    const dx = e.clientX - mouseX;
    const dy = e.clientY - mouseY;
    speed = Math.sqrt(dx * dx + dy * dy);
    mouseX = e.clientX;
    mouseY = e.clientY;
  }

  function onMouseOver(e) {
    if (e.target instanceof Element && e.target.closest('[data-interactive]')) {
      if (!isHovering) {
        isHovering = true;
        targetHoverScale = 1.8;
        document.body.classList.add('cursor-hover');
      }
    }
  }

  function onMouseOut(e) {
    if (e.target instanceof Element && e.target.closest('[data-interactive]')) {
      isHovering = false;
      targetHoverScale = 1;
      document.body.classList.remove('cursor-hover');
    }
  }

  function onMouseDown() {
    document.body.classList.add('cursor-click');
    spawnClickParticles();
  }
  function onMouseUp() {
    setTimeout(() => document.body.classList.remove('cursor-click'), 400);
  }

  function onMouseLeave() {
    ring.style.opacity = '0';
    dot.style.opacity = '0';
    if (trail) trail.style.opacity = '0';
  }
  function onMouseEnter() {
    ring.style.opacity = '1';
    dot.style.opacity = '1';
    if (trail) trail.style.opacity = '1';
  }

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseover', onMouseOver);
  document.addEventListener('mouseout', onMouseOut);
  document.addEventListener('mousedown', onMouseDown);
  document.addEventListener('mouseup', onMouseUp);
  document.addEventListener('mouseleave', onMouseLeave);
  document.addEventListener('mouseenter', onMouseEnter);

  function lerp(a, b, f) { return a + (b - a) * f; }

  function spawnClickParticles() {
    const theme = document.documentElement.getAttribute('data-theme');
    const color = theme === 'nexus' ? '0,240,255' : '107,144,128';
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 / 6) * i + Math.random() * 0.5;
      const vel = 1.5 + Math.random() * 2;
      particles.push({
        x: mouseX, y: mouseY,
        vx: Math.cos(angle) * vel,
        vy: Math.sin(angle) * vel,
        life: 1,
        decay: 0.02 + Math.random() * 0.02,
        size: 2 + Math.random() * 3,
        color: color
      });
    }
  }

  function spawnTrailParticles() {
    const now = performance.now();
    if (now - lastParticleTime < 50) return;
    if (speed < 3) return;
    lastParticleTime = now;

    const theme = document.documentElement.getAttribute('data-theme');
    const color = theme === 'nexus' ? '0,240,255' : '107,144,128';
    particles.push({
      x: mouseX, y: mouseY,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      life: 1,
      decay: 0.03 + Math.random() * 0.02,
      size: 1 + Math.random() * 2,
      color: color
    });
  }

  let particleCanvas = null;
  let particleCtx = null;

  function updateParticles() {
    if (!particleCanvas) {
      particleCanvas = document.getElementById('grid-canvas');
      if (particleCanvas) particleCtx = particleCanvas.getContext('2d');
    }
    if (!particleCanvas || !particleCtx) return;
    const ctx = particleCtx;

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05;
      p.life -= p.decay;
      if (p.life <= 0) { particles.splice(i, 1); continue; }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.life * 0.6})`;
      ctx.fill();
    }
  }

  function animate() {
    if (!_alive) return;
    const theme = document.documentElement.getAttribute('data-theme');

    hoverScale = lerp(hoverScale, targetHoverScale, 0.12);

    if (theme === 'nexus') {
      const ringLerp = isHovering ? 0.1 : 0.15;
      ringX = lerp(ringX, mouseX, ringLerp);
      ringY = lerp(ringY, mouseY, ringLerp);
      trailX = lerp(trailX, ringX, 0.08);
      trailY = lerp(trailY, ringY, 0.08);

      ring.style.transform = `translate(calc(-50% + ${ringX}px), calc(-50% + ${ringY}px)) scale(${hoverScale})`;
      dot.style.transform = `translate(calc(-50% + ${mouseX}px), calc(-50% + ${mouseY}px))`;

      if (trail) {
        trail.style.transform = `translate(calc(-50% + ${trailX}px), calc(-50% + ${trailY}px)) scale(${hoverScale * 0.9})`;
      }
    } else {
      ringX = lerp(ringX, mouseX, 0.12);
      ringY = lerp(ringY, mouseY, 0.12);
      ring.style.transform = `translate(calc(-50% + ${ringX}px), calc(-50% + ${ringY}px)) scale(${hoverScale})`;
    }

    spawnTrailParticles();
    _rafId = requestAnimationFrame(animate);
  }

  _rafId = requestAnimationFrame(animate);
  document.body.classList.add('cursor-active');

  function stop() {
    _alive = false;
    if (_rafId !== null) { cancelAnimationFrame(_rafId); _rafId = null; }
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseover', onMouseOver);
    document.removeEventListener('mouseout', onMouseOut);
    document.removeEventListener('mousedown', onMouseDown);
    document.removeEventListener('mouseup', onMouseUp);
    document.removeEventListener('mouseleave', onMouseLeave);
    document.removeEventListener('mouseenter', onMouseEnter);
    document.body.classList.remove('cursor-active', 'cursor-hover', 'cursor-click');
  }

  window.cursorEngine = {
    morph: function() {
      ringX = mouseX; ringY = mouseY;
      trailX = mouseX; trailY = mouseY;
      document.documentElement.setAttribute('data-theme-transitioning', '');
      setTimeout(() => document.documentElement.removeAttribute('data-theme-transitioning'), 400);
    },
    updateParticles: updateParticles,
    stop: stop
  };
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCursor);
  } else {
    initCursor();
  }
})();
