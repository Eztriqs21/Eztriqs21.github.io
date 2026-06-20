/* js/afk.js — AFK Shark Cinematic Easter Egg */
/* Activates after 2 min idle on dashboard. Giant shark charges screen,
   screen shatters, shark retreats, theme glitches and switches. */

import { forceRender } from './nav.js';

var IDLE_TIMEOUT = 120000; /* 2 minutes */
var _idleTimer = null;
var _active = false;
var _cinematicRunning = false;
var _canvas = null;
var _ctx = null;
var _raf = null;

var EVENTS = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart', 'mousedown'];

function getTheme() {
  return document.documentElement.getAttribute('data-theme') || 'nexus';
}

function getRandomTheme() {
  var themes = ['nexus', 'bloom', 'nebula', 'forge'];
  var current = getTheme();
  var filtered = themes.filter(function(t) { return t !== current; });
  return filtered[Math.floor(Math.random() * filtered.length)];
}

function onPage() {
  return (window.location.hash || '#/dashboard').replace('#/', '') === 'dashboard';
}

function resetIdle() {
  if (!_active || _cinematicRunning) return;
  if (_idleTimer) clearTimeout(_idleTimer);
  if (onPage()) {
    _idleTimer = setTimeout(runCinematic, IDLE_TIMEOUT);
  }
}

function bindEvents() {
  for (var i = 0; i < EVENTS.length; i++) {
    document.addEventListener(EVENTS[i], resetIdle, { passive: true });
  }
}

function unbindEvents() {
  for (var i = 0; i < EVENTS.length; i++) {
    document.removeEventListener(EVENTS[i], resetIdle);
  }
}

/* ═══════════════ CANVAS SETUP ═══════════════ */

function initCanvas() {
  _canvas = document.createElement('canvas');
  _canvas.id = 'afk-canvas';
  _canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:99999;pointer-events:none;';
  document.body.appendChild(_canvas);
  _ctx = _canvas.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
  if (!_canvas) return;
  _canvas.width = window.innerWidth;
  _canvas.height = window.innerHeight;
}

function destroyCanvas() {
  if (_raf) cancelAnimationFrame(_raf);
  _raf = null;
  window.removeEventListener('resize', resizeCanvas);
  if (_canvas && _canvas.parentNode) _canvas.parentNode.removeChild(_canvas);
  _canvas = null;
  _ctx = null;
}

/* ═══════════════ SHARK DRAWING ═══════════════ */

function drawCinematicShark(cx, cy, sz, alpha, jawOpen, time) {
  if (!_ctx) return;
  var ctx = _ctx;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.globalAlpha = alpha;

  /* Body — large torpedo */
  ctx.beginPath();
  ctx.moveTo(-sz * 0.6, 0);
  ctx.bezierCurveTo(-sz * 0.3, -sz * 0.22, sz * 0.2, -sz * 0.2, sz * 0.55, -sz * 0.04);
  ctx.bezierCurveTo(sz * 0.65, 0, sz * 0.65, 0, sz * 0.55, sz * 0.04);
  ctx.bezierCurveTo(sz * 0.2, sz * 0.2, -sz * 0.3, sz * 0.22, -sz * 0.6, 0);
  ctx.fillStyle = 'rgba(30, 58, 95, ' + alpha + ')';
  ctx.fill();

  /* Belly — lighter stripe */
  ctx.beginPath();
  ctx.moveTo(-sz * 0.4, sz * 0.02);
  ctx.bezierCurveTo(-sz * 0.1, sz * 0.1, sz * 0.2, sz * 0.08, sz * 0.45, sz * 0.02);
  ctx.bezierCurveTo(sz * 0.2, sz * 0.14, -sz * 0.1, sz * 0.14, -sz * 0.4, sz * 0.02);
  ctx.fillStyle = 'rgba(148, 190, 230, ' + (alpha * 0.7) + ')';
  ctx.fill();

  /* Dorsal fin */
  ctx.beginPath();
  ctx.moveTo(sz * 0.08, -sz * 0.18);
  ctx.lineTo(sz * 0.18, -sz * 0.4);
  ctx.lineTo(sz * 0.3, -sz * 0.18);
  ctx.fillStyle = 'rgba(30, 58, 95, ' + (alpha * 0.9) + ')';
  ctx.fill();

  /* Pectoral fins */
  ctx.beginPath();
  ctx.moveTo(sz * 0.05, sz * 0.06);
  ctx.lineTo(-sz * 0.05, sz * 0.22);
  ctx.lineTo(sz * 0.2, sz * 0.08);
  ctx.fillStyle = 'rgba(30, 58, 95, ' + (alpha * 0.7) + ')';
  ctx.fill();

  /* Tail fin */
  var tailSwing = Math.sin(time * 0.08) * sz * 0.06;
  ctx.beginPath();
  ctx.moveTo(-sz * 0.5, 0);
  ctx.lineTo(-sz * 0.78, -sz * 0.22 + tailSwing);
  ctx.lineTo(-sz * 0.62, 0);
  ctx.lineTo(-sz * 0.78, sz * 0.2 + tailSwing);
  ctx.closePath();
  ctx.fillStyle = 'rgba(30, 58, 95, ' + (alpha * 0.85) + ')';
  ctx.fill();

  /* Upper jaw / snout */
  ctx.beginPath();
  ctx.moveTo(sz * 0.55, -sz * 0.04);
  ctx.bezierCurveTo(sz * 0.7, -sz * 0.06, sz * 0.78, -sz * 0.03, sz * 0.8, 0);
  ctx.strokeStyle = 'rgba(30, 58, 95, ' + alpha + ')';
  ctx.lineWidth = sz * 0.02;
  ctx.stroke();

  /* Lower jaw */
  ctx.beginPath();
  ctx.moveTo(sz * 0.55, sz * 0.04 + jawOpen * sz * 0.08);
  ctx.bezierCurveTo(
    sz * 0.7, sz * 0.06 + jawOpen * sz * 0.12,
    sz * 0.78, sz * 0.03 + jawOpen * sz * 0.1,
    sz * 0.8, jawOpen * sz * 0.05
  );
  ctx.strokeStyle = 'rgba(30, 58, 95, ' + alpha + ')';
  ctx.lineWidth = sz * 0.02;
  ctx.stroke();

  /* Teeth — upper row */
  if (jawOpen > 0.1) {
    var teethCount = 6;
    for (var t = 0; t < teethCount; t++) {
      var tx = sz * 0.56 + (sz * 0.22 * t / teethCount);
      ctx.beginPath();
      ctx.moveTo(tx, -sz * 0.01);
      ctx.lineTo(tx + sz * 0.01, sz * 0.01 + jawOpen * sz * 0.04);
      ctx.lineTo(tx + sz * 0.02, -sz * 0.01);
      ctx.fillStyle = 'rgba(224, 242, 254, ' + (alpha * 0.8) + ')';
      ctx.fill();
    }
    /* Teeth — lower row */
    for (var t2 = 0; t2 < teethCount; t2++) {
      var tx2 = sz * 0.56 + (sz * 0.22 * t2 / teethCount);
      ctx.beginPath();
      ctx.moveTo(tx2, sz * 0.05 + jawOpen * sz * 0.08);
      ctx.lineTo(tx2 + sz * 0.01, sz * 0.03 + jawOpen * sz * 0.02);
      ctx.lineTo(tx2 + sz * 0.02, sz * 0.05 + jawOpen * sz * 0.08);
      ctx.fillStyle = 'rgba(224, 242, 254, ' + (alpha * 0.6) + ')';
      ctx.fill();
    }
  }

  /* Eye — glowing */
  ctx.beginPath();
  ctx.arc(sz * 0.42, -sz * 0.06, sz * 0.025, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(224, 242, 254, ' + (alpha * 0.9) + ')';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(sz * 0.42, -sz * 0.06, sz * 0.012, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(10, 22, 40, ' + alpha + ')';
  ctx.fill();
  /* Eye glow */
  ctx.beginPath();
  ctx.arc(sz * 0.42, -sz * 0.06, sz * 0.04, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(59, 130, 246, ' + (alpha * 0.15) + ')';
  ctx.fill();

  /* Gill slits */
  for (var g = 0; g < 3; g++) {
    var gx = sz * 0.28 + g * sz * 0.04;
    ctx.beginPath();
    ctx.moveTo(gx, -sz * 0.02);
    ctx.lineTo(gx, sz * 0.04);
    ctx.strokeStyle = 'rgba(59, 130, 246, ' + (alpha * 0.3) + ')';
    ctx.lineWidth = sz * 0.005;
    ctx.stroke();
  }

  ctx.restore();
}

/* ═══════════════ CINEMATIC SEQUENCE ═══════════════ */

function runCinematic() {
  if (_cinematicRunning || !onPage() || getTheme() !== 'aquatic') {
    resetIdle();
    return;
  }
  _cinematicRunning = true;
  if (_idleTimer) clearTimeout(_idleTimer);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    skipToThemeSwitch();
    return;
  }

  initCanvas();

  var w = _canvas.width;
  var h = _canvas.height;
  var startTime = performance.now();
  var totalDuration = 5500; /* total cinematic ms */
  var time = 0;

  /* Overlay element */
  var overlay = document.createElement('div');
  overlay.className = 'afk-overlay';
  document.body.appendChild(overlay);

  /* Shatter container */
  var shatter = document.createElement('div');
  shatter.className = 'afk-shatter';
  shatter.style.display = 'none';
  document.body.appendChild(shatter);

  function createShards() {
    shatter.innerHTML = '';
    var cols = 4, rows = 3;
    var sw = w / cols, sh = h / rows;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var shard = document.createElement('div');
        shard.className = 'afk-shard';
        shard.style.left = (c * sw) + 'px';
        shard.style.top = (r * sh) + 'px';
        shard.style.width = sw + 'px';
        shard.style.height = sh + 'px';
        shard.style.clipPath = 'polygon(' +
          (Math.random() * 8) + '% ' + (Math.random() * 8) + '%, ' +
          (92 + Math.random() * 8) + '% ' + (Math.random() * 8) + '%, ' +
          (92 + Math.random() * 8) + '% ' + (92 + Math.random() * 8) + '%, ' +
          (Math.random() * 8) + '% ' + (92 + Math.random() * 8) + '%)';
        shard.dataset.tx = ((c - cols / 2 + 0.5) * (60 + Math.random() * 80)) + 'px';
        shard.dataset.ty = ((r - rows / 2 + 0.5) * (60 + Math.random() * 80)) + 'px';
        shard.dataset.rot = (Math.random() * 20 - 10) + 'deg';
        shatter.appendChild(shard);
      }
    }
  }

  function drawFrame() {
    time++;
    var now = performance.now();
    var elapsed = now - startTime;
    var progress = Math.min(elapsed / totalDuration, 1);

    _ctx.clearRect(0, 0, w, h);

    /* Phase 1: Darken + shark approach (0% - 55%) */
    if (progress < 0.55) {
      var approachP = progress / 0.55;
      var darken = Math.min(approachP * 1.2, 1) * 0.85;
      overlay.style.opacity = darken;

      /* Shark: far away (small) → fills screen (huge) */
      var sharkSz = 30 + approachP * approachP * (Math.min(w, h) * 0.9);
      var sharkX = w * 0.5;
      var sharkY = h * 0.5 + Math.sin(time * 0.03) * (20 * (1 - approachP));
      var sharkAlpha = Math.min(approachP * 2, 0.95);
      var jaw = approachP > 0.6 ? Math.min((approachP - 0.6) / 0.3, 1) : 0;

      drawCinematicShark(sharkX, sharkY, sharkSz, sharkAlpha, jaw, time);

      /* Screen shake intensifies as shark approaches */
      if (approachP > 0.7) {
        var shakeIntensity = (approachP - 0.7) / 0.3 * 8;
        document.body.style.transform = 'translate(' +
          (Math.random() * shakeIntensity - shakeIntensity / 2) + 'px,' +
          (Math.random() * shakeIntensity - shakeIntensity / 2) + 'px)';
      }

    /* Phase 2: Impact + flash (55% - 65%) */
    } else if (progress < 0.65) {
      var impactP = (progress - 0.55) / 0.1;

      /* White flash */
      overlay.style.background = 'rgba(224, 242, 254, ' + (1 - impactP) * 0.9 + ')';
      overlay.style.opacity = 1;

      /* Heavy shake */
      var shakeI = (1 - impactP) * 15;
      document.body.style.transform = 'translate(' +
        (Math.random() * shakeI - shakeI / 2) + 'px,' +
        (Math.random() * shakeI - shakeI / 2) + 'px)';

      /* Show shards on first frame of impact */
      if (impactP < 0.1) {
        shatter.style.display = 'block';
        createShards();
        /* Trigger shard scatter */
        requestAnimationFrame(function() {
          var shards = shatter.querySelectorAll('.afk-shard');
          for (var s = 0; s < shards.length; s++) {
            var sh = shards[s];
            sh.style.transform = 'translate(' + sh.dataset.tx + ',' + sh.dataset.ty + ') rotate(' + sh.dataset.rot + ')';
            sh.style.opacity = '0';
          }
        });
      }

    /* Phase 3: Shark retreats (65% - 85%) */
    } else if (progress < 0.85) {
      var retreatP = (progress - 0.65) / 0.2;
      overlay.style.background = 'rgba(5, 5, 8, ' + (0.85 - retreatP * 0.3) + ')';

      /* Shark shrinks away */
      var sharkSz2 = (1 - retreatP) * (Math.min(w, h) * 0.9);
      var sharkAlpha2 = (1 - retreatP) * 0.9;
      var sharkY2 = h * 0.5 + retreatP * h * 0.3;
      drawCinematicShark(w * 0.5, sharkY2, sharkSz2, sharkAlpha2, 0, time);

      /* Shards continue fading */
      document.body.style.transform = '';

    /* Phase 4: Glitch + theme switch (85% - 100%) */
    } else {
      var glitchP = (progress - 0.85) / 0.15;
      overlay.style.opacity = 0.85 - glitchP * 0.85;

      /* Glitch flicker */
      if (Math.random() < 0.3) {
        overlay.style.background = 'rgba(59, 130, 246, 0.15)';
      } else if (Math.random() < 0.5) {
        overlay.style.background = 'rgba(249, 115, 22, 0.1)';
      } else {
        overlay.style.background = 'rgba(5, 5, 8, 0.85)';
      }

      /* Theme switch at 50% of this phase */
      if (glitchP > 0.5 && !afkSwitchDone) {
        afkSwitchDone = true;
        switchTheme();
      }
    }

    if (progress < 1 && _cinematicRunning) {
      _raf = requestAnimationFrame(drawFrame);
    } else {
      finishCinematic(overlay, shatter);
    }
  }

  var afkSwitchDone = false;
  _raf = requestAnimationFrame(drawFrame);
}

function switchTheme() {
  var nextTheme = getRandomTheme();
  var themes = ['nexus', 'bloom', 'nebula', 'forge', 'aquatic'];
  var idx = themes.indexOf(nextTheme);
  if (idx !== -1 && window.themesEngine && window.themesEngine.applyTheme) {
    window.themesEngine.applyTheme(idx);
  }
}

function finishCinematic(overlay, shatter) {
  document.body.style.transform = '';
  _cinematicRunning = false;
  destroyCanvas();
  if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
  if (shatter && shatter.parentNode) shatter.parentNode.removeChild(shatter);
  resetIdle();
}

function skipToThemeSwitch() {
  _cinematicRunning = false;
  switchTheme();
  resetIdle();
}

/* ═══════════════ PUBLIC API ═══════════════ */

export function enable() {
  if (_active) return;
  _active = true;
  bindEvents();
  resetIdle();
}

export function disable() {
  _active = false;
  unbindEvents();
  if (_idleTimer) clearTimeout(_idleTimer);
  _idleTimer = null;
  if (_cinematicRunning) {
    _cinematicRunning = false;
    destroyCanvas();
    document.body.style.transform = '';
    var overlays = document.querySelectorAll('.afk-overlay, .afk-shatter');
    for (var i = 0; i < overlays.length; i++) {
      if (overlays[i].parentNode) overlays[i].parentNode.removeChild(overlays[i]);
    }
  }
}

window.afkEngine = { enable, disable };
