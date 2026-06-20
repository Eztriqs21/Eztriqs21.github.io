/* js/afk.js — AFK Shark Cinematic Easter Egg */
/* Activates after 2 min idle on dashboard. Giant 3D shark charges screen,
   screen shatters, shark retreats, theme glitches and switches. */

import { forceRender } from './nav.js';

var IDLE_TIMEOUT = 120000;
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

/* ═══════════════ CANVAS ═══════════════ */

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

/* ═══════════════ 3D SHARK ═══════════════ */

function drawShark3D(cx, cy, sz, alpha, jawOpen, tiltX, tiltY, time) {
  if (!_ctx || sz < 1) return;
  var ctx = _ctx;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.globalAlpha = alpha;

  /* Perspective skew based on tilt */
  var skewX = tiltX * 0.15;
  var skewY = tiltY * 0.08;
  ctx.transform(1, skewY, skewX, 1, 0, 0);

  var s = sz;

  /* ── UNDERWATER GLOW AURA ── */
  var glowGrad = ctx.createRadialGradient(0, 0, s * 0.1, 0, 0, s * 0.9);
  glowGrad.addColorStop(0, 'rgba(59, 130, 246, ' + (alpha * 0.08) + ')');
  glowGrad.addColorStop(0.5, 'rgba(59, 130, 246, ' + (alpha * 0.03) + ')');
  glowGrad.addColorStop(1, 'rgba(59, 130, 246, 0)');
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.9, s * 0.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = glowGrad;
  ctx.fill();

  /* ── BODY SHADOW (depth illusion) ── */
  ctx.beginPath();
  ctx.moveTo(-s * 0.58, s * 0.06);
  ctx.bezierCurveTo(-s * 0.28, s * 0.28, s * 0.22, s * 0.26, s * 0.56, s * 0.08);
  ctx.bezierCurveTo(s * 0.22, s * 0.32, -s * 0.28, s * 0.34, -s * 0.58, s * 0.06);
  ctx.fillStyle = 'rgba(5, 10, 20, ' + (alpha * 0.25) + ')';
  ctx.fill();

  /* ── MAIN BODY — 3D gradient ── */
  var bodyGrad = ctx.createLinearGradient(0, -s * 0.22, 0, s * 0.22);
  bodyGrad.addColorStop(0, 'rgba(20, 45, 80, ' + alpha + ')');
  bodyGrad.addColorStop(0.35, 'rgba(30, 60, 100, ' + alpha + ')');
  bodyGrad.addColorStop(0.6, 'rgba(45, 85, 135, ' + (alpha * 0.95) + ')');
  bodyGrad.addColorStop(0.85, 'rgba(120, 170, 220, ' + (alpha * 0.7) + ')');
  bodyGrad.addColorStop(1, 'rgba(180, 210, 240, ' + (alpha * 0.5) + ')');
  ctx.beginPath();
  ctx.moveTo(-s * 0.6, 0);
  ctx.bezierCurveTo(-s * 0.35, -s * 0.24, s * 0.15, -s * 0.22, s * 0.52, -s * 0.04);
  ctx.bezierCurveTo(s * 0.62, -s * 0.01, s * 0.62, s * 0.01, s * 0.52, s * 0.04);
  ctx.bezierCurveTo(s * 0.15, s * 0.22, -s * 0.35, s * 0.24, -s * 0.6, 0);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  /* ── BODY HIGHLIGHT — specular sheen ── */
  ctx.beginPath();
  ctx.moveTo(-s * 0.45, -s * 0.04);
  ctx.bezierCurveTo(-s * 0.2, -s * 0.14, s * 0.1, -s * 0.13, s * 0.4, -s * 0.04);
  ctx.bezierCurveTo(s * 0.1, -s * 0.1, -s * 0.2, -s * 0.1, -s * 0.45, -s * 0.04);
  ctx.fillStyle = 'rgba(160, 200, 240, ' + (alpha * 0.18) + ')';
  ctx.fill();

  /* ── BELLY — counter-shaded ── */
  var bellyGrad = ctx.createLinearGradient(0, s * 0.02, 0, s * 0.18);
  bellyGrad.addColorStop(0, 'rgba(140, 185, 230, ' + (alpha * 0.65) + ')');
  bellyGrad.addColorStop(1, 'rgba(200, 225, 245, ' + (alpha * 0.35) + ')');
  ctx.beginPath();
  ctx.moveTo(-s * 0.42, s * 0.02);
  ctx.bezierCurveTo(-s * 0.1, s * 0.11, s * 0.18, s * 0.09, s * 0.44, s * 0.02);
  ctx.bezierCurveTo(s * 0.18, s * 0.16, -s * 0.1, s * 0.16, -s * 0.42, s * 0.02);
  ctx.fillStyle = bellyGrad;
  ctx.fill();

  /* ── DORSAL FIN — 3D with gradient ── */
  var dorsalGrad = ctx.createLinearGradient(0, -s * 0.18, 0, -s * 0.42);
  dorsalGrad.addColorStop(0, 'rgba(25, 50, 85, ' + (alpha * 0.95) + ')');
  dorsalGrad.addColorStop(0.5, 'rgba(35, 65, 105, ' + (alpha * 0.9) + ')');
  dorsalGrad.addColorStop(1, 'rgba(50, 80, 120, ' + (alpha * 0.7) + ')');
  ctx.beginPath();
  ctx.moveTo(s * 0.06, -s * 0.18);
  ctx.bezierCurveTo(s * 0.1, -s * 0.3, s * 0.16, -s * 0.38, s * 0.2, -s * 0.4);
  ctx.lineTo(s * 0.32, -s * 0.18);
  ctx.closePath();
  ctx.fillStyle = dorsalGrad;
  ctx.fill();
  /* Dorsal fin edge highlight */
  ctx.beginPath();
  ctx.moveTo(s * 0.1, -s * 0.28);
  ctx.bezierCurveTo(s * 0.14, -s * 0.36, s * 0.17, -s * 0.39, s * 0.2, -s * 0.4);
  ctx.strokeStyle = 'rgba(120, 170, 220, ' + (alpha * 0.3) + ')';
  ctx.lineWidth = s * 0.005;
  ctx.stroke();

  /* ── PECTORAL FINS — angled for depth ── */
  ctx.save();
  ctx.translate(s * 0.04, s * 0.06);
  ctx.rotate(-0.3);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-s * 0.02, s * 0.1, -s * 0.08, s * 0.18, -s * 0.04, s * 0.22);
  ctx.bezierCurveTo(s * 0.02, s * 0.14, s * 0.06, s * 0.06, s * 0.15, s * 0.02);
  ctx.closePath();
  ctx.fillStyle = 'rgba(30, 58, 95, ' + (alpha * 0.65) + ')';
  ctx.fill();
  ctx.restore();

  /* ── CAUDAL (TAIL) FIN — with oscillation ── */
  var tailSwing = Math.sin(time * 0.08) * s * 0.07;
  var tailGrad = ctx.createLinearGradient(-s * 0.5, 0, -s * 0.8, 0);
  tailGrad.addColorStop(0, 'rgba(25, 50, 85, ' + (alpha * 0.9) + ')');
  tailGrad.addColorStop(1, 'rgba(40, 70, 110, ' + (alpha * 0.6) + ')');

  /* Upper lobe */
  ctx.beginPath();
  ctx.moveTo(-s * 0.5, 0);
  ctx.bezierCurveTo(-s * 0.6, -s * 0.08, -s * 0.72, -s * 0.18, -s * 0.78, -s * 0.24 + tailSwing);
  ctx.bezierCurveTo(-s * 0.7, -s * 0.14, -s * 0.62, -s * 0.04, -s * 0.58, 0);
  ctx.closePath();
  ctx.fillStyle = tailGrad;
  ctx.fill();

  /* Lower lobe */
  ctx.beginPath();
  ctx.moveTo(-s * 0.5, 0);
  ctx.bezierCurveTo(-s * 0.6, s * 0.06, -s * 0.68, s * 0.14, -s * 0.74, s * 0.18 + tailSwing * 0.7);
  ctx.bezierCurveTo(-s * 0.66, s * 0.1, -s * 0.6, s * 0.03, -s * 0.56, 0);
  ctx.closePath();
  ctx.fillStyle = tailGrad;
  ctx.fill();

  /* ── HEAD / SNOUT — detailed 3D ── */
  /* Upper head contour */
  ctx.beginPath();
  ctx.moveTo(s * 0.52, -s * 0.04);
  ctx.bezierCurveTo(s * 0.62, -s * 0.06, s * 0.72, -s * 0.04, s * 0.78, -s * 0.01);
  ctx.bezierCurveTo(s * 0.8, 0, s * 0.8, 0, s * 0.78, s * 0.01);
  ctx.strokeStyle = 'rgba(20, 45, 80, ' + alpha + ')';
  ctx.lineWidth = s * 0.015;
  ctx.lineCap = 'round';
  ctx.stroke();

  /* Lower jaw — opens with jawOpen */
  var jawDrop = jawOpen * s * 0.12;
  ctx.beginPath();
  ctx.moveTo(s * 0.52, s * 0.04);
  ctx.bezierCurveTo(
    s * 0.62, s * 0.06 + jawDrop * 0.3,
    s * 0.72, s * 0.04 + jawDrop * 0.7,
    s * 0.78, s * 0.01 + jawDrop
  );
  ctx.strokeStyle = 'rgba(20, 45, 80, ' + alpha + ')';
  ctx.lineWidth = s * 0.015;
  ctx.stroke();

  /* Mouth interior */
  if (jawOpen > 0.05) {
    ctx.beginPath();
    ctx.moveTo(s * 0.54, -s * 0.01);
    ctx.bezierCurveTo(s * 0.64, -s * 0.01, s * 0.72, 0, s * 0.76, s * 0.01);
    ctx.bezierCurveTo(s * 0.72, s * 0.04 + jawDrop * 0.5, s * 0.64, s * 0.03 + jawDrop * 0.2, s * 0.54, s * 0.02);
    ctx.closePath();
    var mouthGrad = ctx.createLinearGradient(s * 0.54, 0, s * 0.76, 0);
    mouthGrad.addColorStop(0, 'rgba(10, 15, 30, ' + (alpha * 0.9) + ')');
    mouthGrad.addColorStop(0.5, 'rgba(60, 20, 30, ' + (alpha * 0.6) + ')');
    mouthGrad.addColorStop(1, 'rgba(120, 40, 50, ' + (alpha * 0.3) + ')');
    ctx.fillStyle = mouthGrad;
    ctx.fill();
  }

  /* ── TEETH — sharp triangular rows ── */
  if (jawOpen > 0.1) {
    var upperTeeth = 8;
    var lowerTeeth = 7;
    /* Upper teeth */
    for (var ut = 0; ut < upperTeeth; ut++) {
      var utx = s * 0.55 + (s * 0.2 * ut / upperTeeth);
      var uty = -s * 0.005;
      var utLen = s * 0.025 * (1 - Math.abs(ut / upperTeeth - 0.5) * 0.6);
      ctx.beginPath();
      ctx.moveTo(utx, uty);
      ctx.lineTo(utx + s * 0.008, uty + utLen);
      ctx.lineTo(utx + s * 0.016, uty);
      ctx.closePath();
      ctx.fillStyle = 'rgba(230, 240, 250, ' + (alpha * 0.85) + ')';
      ctx.fill();
      ctx.strokeStyle = 'rgba(180, 200, 220, ' + (alpha * 0.3) + ')';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
    /* Lower teeth */
    for (var lt = 0; lt < lowerTeeth; lt++) {
      var ltx = s * 0.56 + (s * 0.18 * lt / lowerTeeth);
      var lty = s * 0.04 + jawDrop;
      var ltLen = s * 0.02 * (1 - Math.abs(lt / lowerTeeth - 0.5) * 0.5);
      ctx.beginPath();
      ctx.moveTo(ltx, lty);
      ctx.lineTo(ltx + s * 0.007, lty - ltLen);
      ctx.lineTo(ltx + s * 0.014, lty);
      ctx.closePath();
      ctx.fillStyle = 'rgba(220, 230, 245, ' + (alpha * 0.7) + ')';
      ctx.fill();
    }
  }

  /* ── EYE — 3D with iris, pupil, and highlight ── */
  var eyeX = s * 0.4;
  var eyeY = -s * 0.07;
  var eyeR = s * 0.028;

  /* Eye socket shadow */
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, eyeR * 1.5, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(15, 30, 55, ' + (alpha * 0.4) + ')';
  ctx.fill();

  /* Sclera */
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, eyeR, 0, Math.PI * 2);
  var eyeGrad = ctx.createRadialGradient(eyeX - eyeR * 0.2, eyeY - eyeR * 0.2, 0, eyeX, eyeY, eyeR);
  eyeGrad.addColorStop(0, 'rgba(200, 220, 240, ' + (alpha * 0.95) + ')');
  eyeGrad.addColorStop(1, 'rgba(140, 170, 200, ' + (alpha * 0.8) + ')');
  ctx.fillStyle = eyeGrad;
  ctx.fill();

  /* Iris */
  var irisR = eyeR * 0.65;
  ctx.beginPath();
  ctx.arc(eyeX + eyeR * 0.1, eyeY, irisR, 0, Math.PI * 2);
  var irisGrad = ctx.createRadialGradient(eyeX + eyeR * 0.1, eyeY, 0, eyeX + eyeR * 0.1, eyeY, irisR);
  irisGrad.addColorStop(0, 'rgba(30, 80, 160, ' + (alpha * 0.95) + ')');
  irisGrad.addColorStop(0.6, 'rgba(20, 60, 130, ' + (alpha * 0.9) + ')');
  irisGrad.addColorStop(1, 'rgba(10, 30, 70, ' + (alpha * 0.85) + ')');
  ctx.fillStyle = irisGrad;
  ctx.fill();

  /* Pupil — vertical slit (predator) */
  ctx.beginPath();
  ctx.ellipse(eyeX + eyeR * 0.1, eyeY, eyeR * 0.12, irisR * 0.7, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(5, 10, 20, ' + alpha + ')';
  ctx.fill();

  /* Eye highlight */
  ctx.beginPath();
  ctx.arc(eyeX - eyeR * 0.15, eyeY - eyeR * 0.25, eyeR * 0.2, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(224, 242, 254, ' + (alpha * 0.7) + ')';
  ctx.fill();

  /* Eye glow aura */
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, eyeR * 2.5, 0, Math.PI * 2);
  var eyeGlow = ctx.createRadialGradient(eyeX, eyeY, eyeR * 0.5, eyeX, eyeY, eyeR * 2.5);
  eyeGlow.addColorStop(0, 'rgba(59, 130, 246, ' + (alpha * 0.2) + ')');
  eyeGlow.addColorStop(1, 'rgba(59, 130, 246, 0)');
  ctx.fillStyle = eyeGlow;
  ctx.fill();

  /* ── GILL SLITS ── */
  for (var g = 0; g < 4; g++) {
    var gx = s * 0.26 + g * s * 0.035;
    var gCurve = g * 1.5;
    ctx.beginPath();
    ctx.moveTo(gx, -s * 0.025 + gCurve * 0.003);
    ctx.quadraticCurveTo(gx + s * 0.005, 0, gx, s * 0.045 - gCurve * 0.005);
    ctx.strokeStyle = 'rgba(59, 130, 246, ' + (alpha * 0.25) + ')';
    ctx.lineWidth = s * 0.004;
    ctx.stroke();
  }

  /* ── LATERAL LINE — sensory organ ── */
  ctx.beginPath();
  ctx.moveTo(-s * 0.35, -s * 0.02);
  ctx.bezierCurveTo(-s * 0.1, -s * 0.04, s * 0.15, -s * 0.035, s * 0.38, -s * 0.02);
  ctx.strokeStyle = 'rgba(59, 130, 246, ' + (alpha * 0.12) + ')';
  ctx.lineWidth = s * 0.003;
  ctx.setLineDash([s * 0.02, s * 0.015]);
  ctx.stroke();
  ctx.setLineDash([]);

  /* ── PECTORAL FIN RIDGE ── */
  ctx.beginPath();
  ctx.moveTo(s * 0.08, s * 0.07);
  ctx.bezierCurveTo(s * 0.02, s * 0.12, -s * 0.04, s * 0.16, -s * 0.06, s * 0.18);
  ctx.strokeStyle = 'rgba(96, 165, 250, ' + (alpha * 0.2) + ')';
  ctx.lineWidth = s * 0.003;
  ctx.stroke();

  ctx.restore();
}

/* ═══════════════ PARTICLES ═══════════════ */

function drawBubbles(ctx, bubbles, time) {
  for (var i = 0; i < bubbles.length; i++) {
    var b = bubbles[i];
    var y = b.y - time * b.speed * 0.5;
    var wobble = Math.sin(time * 0.02 + b.phase) * b.amp;
    var by = ((y % (b.maxY + 50)) + b.maxY + 50) % (b.maxY + 50);
    ctx.beginPath();
    ctx.arc(b.x + wobble, by, b.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(200, 230, 255, ' + (b.alpha * 0.4) + ')';
    ctx.fill();
    /* Bubble highlight */
    ctx.beginPath();
    ctx.arc(b.x + wobble - b.r * 0.25, by - b.r * 0.25, b.r * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(224, 242, 254, ' + (b.alpha * 0.3) + ')';
    ctx.fill();
  }
}

function createBubbles(w, h, count) {
  var arr = [];
  for (var i = 0; i < count; i++) {
    arr.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 1 + Math.random() * 3,
      speed: 0.3 + Math.random() * 0.8,
      alpha: 0.2 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
      amp: 5 + Math.random() * 15,
      maxY: h
    });
  }
  return arr;
}

/* ═══════════════ WATER DISTORTION ═══════════════ */

function drawWaterDistortion(ctx, cx, cy, radius, intensity, time) {
  ctx.save();
  ctx.globalAlpha = intensity;
  for (var r = 0; r < 4; r++) {
    var ringR = radius * (0.4 + r * 0.25);
    var wobble = Math.sin(time * 0.04 + r * 1.2) * 3;
    ctx.beginPath();
    ctx.ellipse(cx + wobble, cy, ringR, ringR * 0.3, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(59, 130, 246, ' + (0.15 - r * 0.03) + ')';
    ctx.lineWidth = 1.5 - r * 0.3;
    ctx.stroke();
  }
  ctx.restore();
}

/* ═══════════════ UNDERWATER LIGHT RAYS ═══════════════ */

function drawLightRays(ctx, w, h, alpha, time) {
  ctx.save();
  ctx.globalAlpha = alpha;
  var rayCount = 5;
  for (var i = 0; i < rayCount; i++) {
    var rx = w * (0.15 + i * 0.18) + Math.sin(time * 0.005 + i) * 30;
    var rayW = 40 + Math.sin(time * 0.008 + i * 2) * 15;
    var grad = ctx.createLinearGradient(rx, 0, rx + rayW * 0.5, h * 0.7);
    grad.addColorStop(0, 'rgba(59, 130, 246, 0.04)');
    grad.addColorStop(0.3, 'rgba(59, 130, 246, 0.015)');
    grad.addColorStop(1, 'rgba(59, 130, 246, 0)');
    ctx.beginPath();
    ctx.moveTo(rx - rayW / 2, 0);
    ctx.lineTo(rx + rayW / 2, 0);
    ctx.lineTo(rx + rayW * 0.8, h * 0.7);
    ctx.lineTo(rx - rayW * 0.3, h * 0.7);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
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
  var totalDuration = 6500;
  var time = 0;
  var bubbles = createBubbles(w, h, 30);

  /* Overlay */
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
    var cols = 5, rows = 4;
    var sw = w / cols, sh = h / rows;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var shard = document.createElement('div');
        shard.className = 'afk-shard';
        shard.style.left = (c * sw) + 'px';
        shard.style.top = (r * sh) + 'px';
        shard.style.width = (sw + 2) + 'px';
        shard.style.height = (sh + 2) + 'px';
        /* Irregular polygon */
        var pts = [];
        var corners = 5 + Math.floor(Math.random() * 3);
        for (var p = 0; p < corners; p++) {
          var angle = (p / corners) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
          var dist = 0.35 + Math.random() * 0.2;
          pts.push((50 + Math.cos(angle) * dist * 50) + '% ' + (50 + Math.sin(angle) * dist * 50) + '%');
        }
        shard.style.clipPath = 'polygon(' + pts.join(', ') + ')';
        var dx = (c - cols / 2 + 0.5) * (80 + Math.random() * 120);
        var dy = (r - rows / 2 + 0.5) * (80 + Math.random() * 120);
        shard.dataset.tx = dx + 'px';
        shard.dataset.ty = dy + 'px';
        shard.dataset.rot = (Math.random() * 30 - 15) + 'deg';
        shatter.appendChild(shard);
      }
    }
  }

  var afkSwitchDone = false;

  function drawFrame() {
    time++;
    var now = performance.now();
    var elapsed = now - startTime;
    var progress = Math.min(elapsed / totalDuration, 1);

    _ctx.clearRect(0, 0, w, h);

    /* ── PHASE 1: Deep ocean + shark appears far away (0% - 15%) ── */
    if (progress < 0.15) {
      var p1 = progress / 0.15;
      overlay.style.opacity = p1 * 0.3;

      /* Ambient light rays */
      drawLightRays(_ctx, w, h, 0.6 + p1 * 0.4, time);

      /* Bubbles rise */
      drawBubbles(_ctx, bubbles, time);

      /* Shark appears as tiny silhouette in distance */
      var sharkAlpha = p1 * 0.3;
      var sharkSz = 20 + p1 * 40;
      drawShark3D(w * 0.5, h * 0.48, sharkSz, sharkAlpha, 0, 0, 0, time);

    /* ── PHASE 2: Shark charges — Z-axis approach (15% - 55%) ── */
    } else if (progress < 0.55) {
      var p2 = (progress - 0.15) / 0.4;
      /* Eased approach — accelerates */
      var easeP = p2 * p2 * (3 - 2 * p2);
      overlay.style.opacity = 0.3 + easeP * 0.55;

      /* Light rays intensify */
      drawLightRays(_ctx, w, h, 1 - easeP * 0.5, time);

      /* Bubbles scatter away from center as shark approaches */
      drawBubbles(_ctx, bubbles, time);

      /* Water distortion rings around shark */
      if (p2 > 0.2) {
        drawWaterDistortion(_ctx, w * 0.5, h * 0.48, 50 + easeP * 200, easeP * 0.3, time);
      }

      /* Shark — dramatic Z-axis approach */
      var sharkSz = 60 + easeP * easeP * (Math.min(w, h) * 1.2);
      var sharkX = w * 0.5;
      /* Slight S-curve approach path */
      var sharkY = h * 0.48 + Math.sin(time * 0.025) * (25 * (1 - easeP));
      var sharkAlpha = 0.3 + easeP * 0.65;

      /* Perspective tilt — shark "leans" as it approaches */
      var tiltX = Math.sin(time * 0.02) * 0.3 * easeP;
      var tiltY = Math.cos(time * 0.015) * 0.15 * easeP;

      /* Jaw opens progressively in last 40% */
      var jaw = p2 > 0.6 ? Math.min((p2 - 0.6) / 0.35, 1) : 0;

      drawShark3D(sharkX, sharkY, sharkSz, sharkAlpha, jaw, tiltX, tiltY, time);

      /* Screen shake builds */
      if (p2 > 0.65) {
        var shakeIntensity = Math.pow((p2 - 0.65) / 0.35, 2) * 12;
        document.body.style.transform = 'translate(' +
          (Math.random() * shakeIntensity - shakeIntensity / 2) + 'px,' +
          (Math.random() * shakeIntensity - shakeIntensity / 2) + 'px)';
      }

    /* ── PHASE 3: IMPACT — flash + shatter (55% - 65%) ── */
    } else if (progress < 0.65) {
      var p3 = (progress - 0.55) / 0.1;

      /* Giant shark fills entire screen at impact */
      var impactSz = Math.min(w, h) * 1.3;
      var impactAlpha = (1 - p3 * 0.8);
      drawShark3D(w * 0.5, h * 0.48, impactSz, impactAlpha, 1, 0, 0, time);

      /* White flash */
      overlay.style.background = 'rgba(224, 242, 254, ' + (1 - p3) * 0.95 + ')';
      overlay.style.opacity = 1;

      /* Violent shake */
      var shakeI = (1 - p3) * 20;
      document.body.style.transform = 'translate(' +
        (Math.random() * shakeI - shakeI / 2) + 'px,' +
        (Math.random() * shakeI - shakeI / 2) + 'px)';

      /* Spawn shards */
      if (p3 < 0.08) {
        shatter.style.display = 'block';
        createShards();
        requestAnimationFrame(function() {
          var shards = shatter.querySelectorAll('.afk-shard');
          for (var s = 0; s < shards.length; s++) {
            var sh = shards[s];
            sh.style.transform = 'translate(' + sh.dataset.tx + ',' + sh.dataset.ty + ') rotate(' + sh.dataset.rot + ')';
            sh.style.opacity = '0';
          }
        });
      }

    /* ── PHASE 4: Shark retreats + debris (65% - 82%) ── */
    } else if (progress < 0.82) {
      var p4 = (progress - 0.65) / 0.17;
      overlay.style.background = 'rgba(5, 12, 25, ' + (0.85 - p4 * 0.3) + ')';

      drawLightRays(_ctx, w, h, 0.3 * (1 - p4), time);
      drawBubbles(_ctx, bubbles, time);

      /* Shark shrinks into distance */
      var retreatSz = (1 - p4) * (Math.min(w, h) * 1.1);
      var retreatAlpha = (1 - p4) * 0.85;
      var retreatY = h * 0.48 + p4 * h * 0.25;
      var retreatTilt = Math.sin(time * 0.03) * 0.2;
      drawShark3D(w * 0.5, retreatY, retreatSz, retreatAlpha, 0, retreatTilt, 0, time);

      document.body.style.transform = '';

    /* ── PHASE 5: Glitch + theme switch (82% - 100%) ── */
    } else {
      var p5 = (progress - 0.82) / 0.18;
      overlay.style.opacity = 0.55 - p5 * 0.55;

      /* RGB glitch flicker */
      if (Math.random() < 0.25) {
        overlay.style.background = 'rgba(59, 130, 246, 0.18)';
      } else if (Math.random() < 0.4) {
        overlay.style.background = 'rgba(249, 115, 22, 0.12)';
      } else if (Math.random() < 0.55) {
        overlay.style.background = 'rgba(52, 211, 153, 0.08)';
      } else {
        overlay.style.background = 'rgba(5, 12, 25, 0.7)';
      }

      /* Scanline glitch */
      if (Math.random() < 0.15) {
        _ctx.fillStyle = 'rgba(59, 130, 246, 0.03)';
        for (var sl = 0; sl < 8; sl++) {
          var slY = Math.random() * h;
          _ctx.fillRect(0, slY, w, 1 + Math.random() * 3);
        }
      }

      if (p5 > 0.45 && !afkSwitchDone) {
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
