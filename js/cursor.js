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
  let isHovering = false;
  let hoverScale = 1;
  let targetHoverScale = 1;
  let particles = [];
  let lastParticleTime = 0;
  let speed = 0;
  let prevMouseX = mouseX, prevMouseY = mouseY;
  let _rafId = null;
  let _alive = true;
  let _nbSatAngle = [0, Math.PI * 0.66, Math.PI * 1.33];
  let _nbSatSpeed = [0.04, 0.03, 0.05];

  function onMouseMove(e) {
    prevMouseX = mouseX;
    prevMouseY = mouseY;
    mouseX = e.clientX;
    mouseY = e.clientY;
    const dx = mouseX - prevMouseX;
    const dy = mouseY - prevMouseY;
    speed = Math.sqrt(dx * dx + dy * dy);
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
    ring.style.transform = 'translate3d(-9999px, -9999px, 0)';
    dot.style.transform = 'translate3d(-9999px, -9999px, 0)';
    if (trail) trail.style.transform = 'translate3d(-9999px, -9999px, 0)';
  }
  function onMouseEnter() {
    ringX = mouseX; ringY = mouseY;
    trailX = mouseX; trailY = mouseY;
  }

  document.addEventListener('mousemove', onMouseMove, { passive: true });
  document.addEventListener('mouseover', onMouseOver, { passive: true });
  document.addEventListener('mouseout', onMouseOut, { passive: true });
  document.addEventListener('mousedown', onMouseDown);
  document.addEventListener('mouseup', onMouseUp);
  document.addEventListener('mouseleave', onMouseLeave);
  document.addEventListener('mouseenter', onMouseEnter);

  function lerp(a, b, f) { return a + (b - a) * f; }

  function spawnClickParticles() {
    const theme = document.documentElement.getAttribute('data-theme');
    const colors = { nexus: '0,240,255', bloom: '107,144,128', nebula: '140,122,230', forge: '205,127,50' };
    const color = colors[theme] || colors.nexus;
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
    if (particles.length > 60) particles.splice(0, particles.length - 60);
  }

  function spawnTrailParticles() {
    const now = performance.now();
    if (now - lastParticleTime < 50 || speed < 3) return;
    lastParticleTime = now;
    const theme = document.documentElement.getAttribute('data-theme');
    const colors = { nexus: '0,240,255', bloom: '107,144,128', nebula: '140,122,230', forge: '205,127,50' };
    const color = colors[theme] || colors.nexus;
    particles.push({
      x: mouseX, y: mouseY,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      life: 1,
      decay: 0.03 + Math.random() * 0.02,
      size: 1 + Math.random() * 2,
      color: color
    });
    if (particles.length > 60) particles.splice(0, particles.length - 60);
  }

  let particleCanvas = null;
  let particleCtx = null;
  let _particleFrameClear = false;

  function updateParticles() {
    if (!particleCanvas) {
      particleCanvas = document.getElementById('grid-canvas');
      if (particleCanvas) particleCtx = particleCanvas.getContext('2d');
    }
    if (!particleCanvas || !particleCtx || particles.length === 0) return;
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
    _particleFrameClear = true;
  }

  function animate() {
    if (!_alive) return;
    const theme = document.documentElement.getAttribute('data-theme');

    hoverScale = lerp(hoverScale, targetHoverScale, 0.12);

    if (theme === 'nexus' || theme === 'nebula') {
      const ringLerp = isHovering ? 0.1 : 0.15;
      ringX = lerp(ringX, mouseX, ringLerp);
      ringY = lerp(ringY, mouseY, ringLerp);
      trailX = lerp(trailX, ringX, 0.08);
      trailY = lerp(trailY, ringY, 0.08);

      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) scale(${hoverScale})`;
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      if (trail) trail.style.transform = `translate3d(${trailX}px, ${trailY}px, 0) translate(-50%, -50%) scale(${hoverScale * 0.9})`;
    } else if (theme === 'forge') {
      const ringLerp = isHovering ? 0.1 : 0.15;
      ringX = lerp(ringX, mouseX, ringLerp);
      ringY = lerp(ringY, mouseY, ringLerp);
      trailX = lerp(trailX, ringX, 0.08);
      trailY = lerp(trailY, ringY, 0.08);

      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) scale(${hoverScale})`;
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      if (trail) trail.style.transform = `translate3d(${trailX}px, ${trailY}px, 0) translate(-50%, -50%) scale(${hoverScale * 0.9})`;
    } else {
      ringX = lerp(ringX, mouseX, 0.12);
      ringY = lerp(ringY, mouseY, 0.12);
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) scale(${hoverScale})`;
    }

    spawnTrailParticles();

    if (theme === 'nebula') {
      var satCanvas = document.getElementById('grid-canvas');
      if (satCanvas) {
        var sCtx = satCanvas.getContext('2d');
        if (sCtx) {
          var orbitRadius = isHovering ? 20 : 14;
          var satColors = ['140,122,230', '232,107,138', '106,232,176'];
          var spinMult = isHovering ? 2.5 : 1;
          for (var si = 0; si < 3; si++) {
            _nbSatAngle[si] += _nbSatSpeed[si] * spinMult;
            var sx = ringX + Math.cos(_nbSatAngle[si]) * orbitRadius;
            var sy = ringY + Math.sin(_nbSatAngle[si]) * orbitRadius;
            sCtx.beginPath();
            sCtx.arc(sx, sy, 1.5, 0, Math.PI * 2);
            sCtx.fillStyle = 'rgba(' + satColors[si] + ',0.7)';
            sCtx.fill();
          }
        }
      }
    }

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
