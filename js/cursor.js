(function() {
  function initCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    var ring = document.getElementById('cursor-ring');
    var dot = document.getElementById('cursor-dot');
    var trail = document.getElementById('cursor-trail');
    var pulse = document.getElementById('cursor-pulse');
    if (!ring || !dot) return;

    var mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    var ringX = mouseX, ringY = mouseY;
    var trailX = mouseX, trailY = mouseY;
    var isHovering = false;
    var hoverScale = 1;
    var targetHoverScale = 1;
    var particles = [];
    var lastParticleTime = 0;
    var speed = 0;
    var prevMouseX = mouseX, prevMouseY = mouseY;
    var _rafId = null;
    var _alive = true;
    var _energyPhase = 0;
    var _traceHistory = [];

    var COLOR_PRIM = '41,141,255';
    var COLOR_SEC = '108,92,231';
    var COLOR_TEAL = '0,212,170';

    function onMouseMove(e) {
      prevMouseX = mouseX;
      prevMouseY = mouseY;
      mouseX = e.clientX;
      mouseY = e.clientY;
      var dx = mouseX - prevMouseX;
      var dy = mouseY - prevMouseY;
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
      setTimeout(function() { document.body.classList.remove('cursor-click'); }, 400);
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
      for (var i = 0; i < 8; i++) {
        var angle = (Math.PI * 2 / 8) * i + Math.random() * 0.5;
        var vel = 1.5 + Math.random() * 2;
        var color = Math.random() < 0.6 ? COLOR_PRIM : Math.random() < 0.5 ? COLOR_SEC : COLOR_TEAL;
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
      if (particles.length > 80) particles.splice(0, particles.length - 80);
    }

    function spawnTrailParticles() {
      var now = performance.now();
      if (now - lastParticleTime < 50 || speed < 3) return;
      lastParticleTime = now;
      var color = Math.random() < 0.7 ? COLOR_PRIM : COLOR_TEAL;
      particles.push({
        x: mouseX, y: mouseY,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        life: 1,
        decay: 0.03 + Math.random() * 0.02,
        size: 1 + Math.random() * 2,
        color: color
      });
      if (particles.length > 80) particles.splice(0, particles.length - 80);
    }

    var particleCanvas = null;
    var particleCtx = null;

    function updateParticles() {
      if (!particleCanvas) {
        particleCanvas = document.getElementById('grid-canvas');
        if (particleCanvas) particleCtx = particleCanvas.getContext('2d');
      }
      if (!particleCanvas || !particleCtx || particles.length === 0) return;
      var ctx = particleCtx;
      for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.life -= p.decay;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + p.color + ',' + (p.life * 0.6) + ')';
        ctx.fill();
      }
    }

    function animate() {
      if (!_alive) return;

      _energyPhase += 0.04;
      hoverScale = lerp(hoverScale, targetHoverScale, 0.12);

      var ringLerp = isHovering ? 0.1 : 0.15;
      ringX = lerp(ringX, mouseX, ringLerp);
      ringY = lerp(ringY, mouseY, ringLerp);
      trailX = lerp(trailX, ringX, 0.08);
      trailY = lerp(trailY, ringY, 0.08);

      var energy = 1 + Math.sin(_energyPhase) * 0.06;
      var ringRotation = speed * 0.3;

      ring.style.transform = 'translate3d(' + ringX + 'px,' + ringY + 'px,0) translate(-50%,-50%) scale(' + (hoverScale * energy) + ') rotate(' + ringRotation + 'deg)';
      dot.style.transform = 'translate3d(' + mouseX + 'px,' + mouseY + 'px,0) translate(-50%,-50%)';
      if (trail) {
        trail.style.transform = 'translate3d(' + trailX + 'px,' + trailY + 'px,0) translate(-50%,-50%) scale(' + (hoverScale * 0.9) + ')';
      }

      _traceHistory.push({ x: ringX, y: ringY });
      if (_traceHistory.length > 8) _traceHistory.shift();

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
        _traceHistory = [];
        document.documentElement.setAttribute('data-theme-transitioning', '');
        setTimeout(function() { document.documentElement.removeAttribute('data-theme-transitioning'); }, 400);
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
