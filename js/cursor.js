// js/cursor.js — Advanced cursor system for JEE HQ
// Particle trails, click bursts, magnetic buttons, hover scale lerp
// Non-module script — exports to window.*

(function () {
  'use strict';

  // Bail on coarse pointer or no support
  if (!window.matchMedia || !window.matchMedia('(pointer:fine)').matches) return;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Theme color map (RGB triplets for canvas fillStyle)
  var THEME_COLORS = {
    dark:  { ring: '136,136,136', dot: '136,136,136', particle: '136,136,136', trail: '136,136,136' },
    amber: { ring: '232,148,90',  dot: '232,148,90',  particle: '232,148,90',  trail: '232,148,90' }
  };

  function getThemeColors() {
    var theme = document.documentElement.getAttribute('data-theme') || 'dark';
    return THEME_COLORS[theme] || THEME_COLORS.dark;
  }

  function lerp(a, b, f) { return a + (b - a) * f; }

  // ── Create cursor DOM elements ──────────────────────────────
  var ring = document.createElement('div');
  ring.id = 'cursor-ring';
  ring.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;z-index:99998;will-change:transform;transform:translate(-50%,-50%);border-radius:50%;transition:width .25s ease,height .25s ease,border .25s ease,box-shadow .25s ease,opacity .25s ease;opacity:0;';
  document.body.appendChild(ring);

  var dot = document.getElementById('cursor-dot');
  if (!dot) {
    dot = document.createElement('div');
    dot.id = 'cursor-dot';
    document.body.appendChild(dot);
  }

  var trail = document.createElement('div');
  trail.id = 'cursor-trail';
  trail.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;z-index:9997;will-change:transform;transform:translate(-50%,-50%);border-radius:50%;transition:width .3s ease,height .3s ease;opacity:0;';
  document.body.appendChild(trail);

  var pulse = document.createElement('div');
  pulse.id = 'cursor-pulse';
  pulse.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;z-index:9996;will-change:transform;transform:translate(-50%,-50%);border-radius:50%;opacity:0;pointer-events:none;';
  document.body.appendChild(pulse);

  // ── State ───────────────────────────────────────────────────
  var mouseX = -200, mouseY = -200;
  var ringX = -200, ringY = -200;
  var trailX = -200, trailY = -200;
  var dotX = -200, dotY = -200;
  var isHovering = false;
  var hoverScale = 1;
  var targetHoverScale = 1;
  var particles = [];
  var lastParticleTime = 0;
  var speed = 0;
  var animating = false;
  var rafId = null;
  var listeners = [];

  // ── Apply theme to elements ─────────────────────────────────
  function applyThemeStyles() {
    var c = getThemeColors();
    // Ring: accent border, no fill
    ring.style.width = '20px';
    ring.style.height = '20px';
    ring.style.border = '2px solid rgba(' + c.ring + ',0.8)';
    ring.style.boxShadow = '0 0 8px rgba(' + c.ring + ',0.25)';
    // Dot: filled center
    dot.style.background = 'rgba(' + c.dot + ',1)';
    dot.style.boxShadow = '0 0 6px rgba(' + c.dot + ',0.6)';
    // Trail: subtle ring
    trail.style.width = '20px';
    trail.style.height = '20px';
    trail.style.border = '1px solid rgba(' + c.trail + ',0.15)';
    // Pulse
    pulse.style.width = '20px';
    pulse.style.height = '20px';
    pulse.style.border = '2px solid rgba(' + c.ring + ',0.6)';
  }

  // ── Mouse tracking ──────────────────────────────────────────
  function onMouseMove(e) {
    var dx = e.clientX - mouseX;
    var dy = e.clientY - mouseY;
    speed = Math.sqrt(dx * dx + dy * dy);
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!animating) { animating = true; animate(); }
  }
  document.addEventListener('mousemove', onMouseMove, { passive: true });
  listeners.push(['mousemove', onMouseMove, false]);

  // ── Hover detection ─────────────────────────────────────────
  var INTERACTIVE_SEL = 'a,button,.si,.bni,.fab,.fab-action,.theme-dot,.cmt-chip,.cmt-source-opt,.cmt-time-btn,.pyq-tab,.ds-tab,.chip,.mt-month-head,.mt-subj-header,[onclick],[data-interactive]';

  function onMouseOver(e) {
    if (e.target.closest(INTERACTIVE_SEL)) {
      if (!isHovering) {
        isHovering = true;
        targetHoverScale = 1.8;
        document.body.classList.add('cursor-hover');
      }
    }
  }
  function onMouseOut(e) {
    if (e.target.closest(INTERACTIVE_SEL)) {
      isHovering = false;
      targetHoverScale = 1;
      document.body.classList.remove('cursor-hover');
    }
  }
  document.addEventListener('mouseover', onMouseOver, true);
  document.addEventListener('mouseout', onMouseOut, true);
  listeners.push(['mouseover', onMouseOver, true]);
  listeners.push(['mouseout', onMouseOut, true]);

  // ── Click feedback ──────────────────────────────────────────
  function onMouseDown() {
    document.body.classList.add('cursor-click');
    spawnClickParticles();
  }
  function onMouseUp() {
    setTimeout(function () { document.body.classList.remove('cursor-click'); }, 400);
  }
  document.addEventListener('mousedown', onMouseDown);
  document.addEventListener('mouseup', onMouseUp);
  listeners.push(['mousedown', onMouseDown, false]);
  listeners.push(['mouseup', onMouseUp, false]);

  // ── Visibility on leave/enter ───────────────────────────────
  function onMouseLeave() {
    ring.style.opacity = '0';
    dot.style.opacity = '0';
    trail.style.opacity = '0';
  }
  function onMouseEnter() {
    ring.style.opacity = '1';
    dot.style.opacity = '1';
    trail.style.opacity = '1';
  }
  document.addEventListener('mouseleave', onMouseLeave);
  document.addEventListener('mouseenter', onMouseEnter);
  listeners.push(['mouseleave', onMouseLeave, false]);
  listeners.push(['mouseenter', onMouseEnter, false]);

  // ── Particle system ─────────────────────────────────────────
  function spawnClickParticles() {
    if (reducedMotion) return;
    var c = getThemeColors();
    for (var i = 0; i < 6; i++) {
      var angle = (Math.PI * 2 / 6) * i + Math.random() * 0.5;
      var vel = 1.5 + Math.random() * 2;
      particles.push({
        x: mouseX, y: mouseY,
        vx: Math.cos(angle) * vel,
        vy: Math.sin(angle) * vel,
        life: 1,
        decay: 0.02 + Math.random() * 0.02,
        size: 2 + Math.random() * 3,
        color: c.particle
      });
    }
  }

  function spawnTrailParticles() {
    if (reducedMotion) return;
    var now = performance.now();
    if (now - lastParticleTime < 50) return;
    if (speed < 3) return;
    lastParticleTime = now;

    var c = getThemeColors();
    particles.push({
      x: mouseX, y: mouseY,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      life: 1,
      decay: 0.03 + Math.random() * 0.02,
      size: 1 + Math.random() * 2,
      color: c.particle
    });
  }

  // ── Canvas for particles ────────────────────────────────────
  var canvas = document.getElementById('grid-canvas');

  function updateParticles() {
    if (!canvas) canvas = document.getElementById('grid-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
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

  // ── Animation loop ──────────────────────────────────────────
  function animate() {
    applyThemeStyles();
    hoverScale = lerp(hoverScale, targetHoverScale, 0.12);

    // Ring follows with lerp
    ringX = lerp(ringX, mouseX, 0.12);
    ringY = lerp(ringY, mouseY, 0.12);
    ring.style.transform = 'translate(calc(-50% + ' + ringX + 'px), calc(-50% + ' + ringY + 'px)) scale(' + hoverScale + ')';

    // Trail follows ring with extra lag
    trailX = lerp(trailX, ringX, 0.08);
    trailY = lerp(trailY, ringY, 0.08);
    trail.style.transform = 'translate(calc(-50% + ' + trailX + 'px), calc(-50% + ' + trailY + 'px)) scale(' + (hoverScale * 0.9) + ')';

    // Dot follows closely
    dotX = lerp(dotX, mouseX, 0.25);
    dotY = lerp(dotY, mouseY, 0.25);
    dot.style.left = dotX + 'px';
    dot.style.top = dotY + 'px';

    spawnTrailParticles();
    updateParticles();
    rafId = requestAnimationFrame(animate);
  }

  // ── Expose to window ────────────────────────────────────────
  window.cursorEngine = {
    morph: function () {
      ringX = mouseX; ringY = mouseY;
      trailX = mouseX; trailY = mouseY;
      document.documentElement.classList.add('data-theme-transitioning');
      setTimeout(function () {
        document.documentElement.classList.remove('data-theme-transitioning');
      }, 400);
    },
    updateParticles: updateParticles,
    reinit: function () {
      applyThemeStyles();
    },
    destroy: function () {
      animating = false;
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      listeners.forEach(function (l) { document.removeEventListener(l[0], l[1], l[2]); });
      listeners = [];
      particles = [];
      if (ring.parentNode) ring.parentNode.removeChild(ring);
      if (trail.parentNode) trail.parentNode.removeChild(trail);
      if (pulse.parentNode) pulse.parentNode.removeChild(pulse);
      document.body.classList.remove('cursor-hover', 'cursor-click');
    }
  };

  window.initCursor = function () {
    applyThemeStyles();
    if (!animating) { animating = true; animate(); }
  };

  // Auto-start if DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { applyThemeStyles(); });
  } else {
    applyThemeStyles();
  }
})();
