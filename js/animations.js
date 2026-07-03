// js/animations.js — Animation Library for JEE HQ (Obsidian Theme)
const _M = window.Motion;
const _reducedMq = window.matchMedia('(prefers-reduced-motion: reduce)');
function noMotion() { return !_M || !_M.animate || _reducedMq.matches; }

/* ═══════════════ A: PAGE & NAVIGATION ═══════════════ */
export function pageExit(el) {
  if (!el) return Promise.resolve();
  if (noMotion()) return Promise.resolve();
  try { return _M.animate(el, { opacity: [1, 0], transform: ['translateY(0px)', 'translateY(8px)'] }, { duration: 0.12, easing: [0.25, 1, 0.5, 1] }) || Promise.resolve(); } catch(e) { return Promise.resolve(); }
}
export function pageEnter(el) {
  if (!el) return Promise.resolve();
  if (noMotion()) { el.style.opacity = '1'; return Promise.resolve(); }
  el.style.opacity = '0';
  try { return _M.animate(el, { opacity: [0, 1], transform: ['translateY(8px)', 'translateY(0px)'] }, { duration: 0.25, easing: [0.34, 1.56, 0.64, 1] }) || Promise.resolve(); } catch(e) { el.style.opacity = '1'; return Promise.resolve(); }
}
export function sidebarExpand(sb) {
  if (!sb || noMotion()) return;
  _M.animate(sb, { width: ['60px', '240px'] }, { duration: 0.3, easing: [0.34, 1.56, 0.64, 1] });
}
export function sidebarCollapse(sb) {
  if (!sb || noMotion()) return;
  _M.animate(sb, { width: ['240px', '60px'] }, { duration: 0.25, easing: [0.25, 1, 0.5, 1] });
}
export function sidebarMobileOpen(sb) {
  if (!sb) return;
  if (noMotion()) { sb.classList.add('open'); return; }
  sb.classList.add('open');
  _M.animate(sb, { transform: ['translateX(-100%)', 'translateX(0%)'] }, { duration: 0.3, easing: [0.34, 1.56, 0.64, 1] });
}
export function bottomNavSwitch(el) {
  if (noMotion()) return;
  try {
    const p = _M.animate(el, { transform: ['scale(1)', 'scale(0.92)'] }, { duration: 0.1, easing: [0.25, 1, 0.5, 1] });
    if (p && p.then) p.then(() => { _M.animate(el, { transform: ['scale(0.92)', 'scale(1)'] }, { duration: 0.2, easing: [0.34, 1.56, 0.64, 1] }); });
  } catch(e) {}
}

/* ═══════════════ B: SECTION & CONTENT ═══════════════ */
export function staggerIn(els, opts = {}) {
  if (noMotion()) { els.forEach(e => e.style.opacity = '1'); return; }
  const { delay = 0, y = 16 } = opts;
  els.forEach((el, i) => {
    el.style.opacity = '0';
    _M.animate(el, { opacity: [0, 1], transform: [`translateY(${y}px)`, 'translateY(0px)'] }, { duration: 0.35, delay: delay + i * 0.06, easing: [0.34, 1.56, 0.64, 1] });
  });
}
export function sectionReveal(el, opts = {}) {
  if (noMotion()) return;
  const { y = 20 } = opts;
  _M.animate(el, { opacity: [0, 1], transform: [`translateY(${y}px)`, 'translateY(0px)'] }, { duration: 0.4, easing: [0.34, 1.56, 0.64, 1] });
}
export function counterSpring(el, target, opts = {}) {
  if (noMotion()) { el.textContent = target; return; }
  const { duration = 1.2 } = opts;
  const start = parseFloat(el.getAttribute('data-count-start') || '0');
  const diff = target - start;
  if (!diff) { el.textContent = target; return; }
  const isInt = Number.isInteger(target);
  const startTime = performance.now();
  function tick(now) {
    const t = Math.min((now - startTime) / (duration * 1000), 1);
    const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const val = start + diff * eased;
    el.textContent = isInt ? Math.round(val) : val.toFixed(1);
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
export function buttonHoverLift(el) {
  if (noMotion()) return;
  _M.animate(el, { transform: ['translateY(0px)', 'translateY(-2px)'] }, { duration: 0.2, easing: [0.34, 1.56, 0.64, 1] });
}
export function buttonHoverReset(el) {
  if (noMotion()) return;
  _M.animate(el, { transform: ['translateY(-2px)', 'translateY(0px)'] }, { duration: 0.3, easing: [0.34, 1.56, 0.64, 1] });
}
export function buttonPress(el) {
  if (noMotion()) return;
  try {
    const p = _M.animate(el, { transform: ['scale(1)', 'scale(0.96)'] }, { duration: 0.08 });
    if (p && p.then) p.then(() => { _M.animate(el, { transform: ['scale(0.96)', 'scale(1)'] }, { duration: 0.15, easing: [0.34, 1.56, 0.64, 1] }); });
  } catch(e) {}
}
export function inputFocusRing(el) {
  if (noMotion()) return;
  _M.animate(el, { boxShadow: ['0 0 0 0px rgba(41,141,255,0)', '0 0 0 3px rgba(41,141,255,0.15)'] }, { duration: 0.2 });
}
export function inputBlurRing(el) {
  if (noMotion()) return;
  _M.animate(el, { boxShadow: ['0 0 0 3px rgba(41,141,255,0.15)', '0 0 0 0px rgba(41,141,255,0)'] }, { duration: 0.15 });
}

/* ═══════════════ SCROLL OBSERVERS ═══════════════ */
var _scrollObservers = [];
var _parallaxAttached = false;
function _disconnectScrollObservers() {
  for (var i = 0; i < _scrollObservers.length; i++) { try { _scrollObservers[i].disconnect(); } catch(e) {} }
  _scrollObservers = [];
}

/* ═══════════════ OBSIDIAN THEME ANIMATIONS ═══════════════ */
var _obsidianAnimClasses = [
  'obsidian-fade-slide-up', 'obsidian-fade-scale', 'obsidian-blur-in',
  'obsidian-zoom-bounce', 'obsidian-fade-slide-left', 'obsidian-morph-in',
  'obsidian-glitch-in', 'obsidian-neon-flicker', 'obsidian-hologram', 'obsidian-chromatic'
];

var _typeAnimIndex = {
  card: 0, 'stat-card': 1, 'hero-stat': 2, 'list-item': 3, 'section-block': 4,
  chip: 2, testcard: 0, mtcard: 0, prepcard: 1, freqcard: 2
};

function initThemeAnimations(scope) {
  if (noMotion()) return;
  var root = scope || document;
  var animClasses = _obsidianAnimClasses;

  var cardSelectors = [
    '.card', '.stat-card', '.hero-stat', '.list-item', '.section-block', '.chip',
    '.test-card', '.mt-card', '.prep-card', '.freq-card'
  ];

  for (var s = 0; s < cardSelectors.length; s++) {
    var els = root.querySelectorAll(cardSelectors[s]);
    for (var e = 0; e < els.length; e++) {
      var el = els[e];
      var alreadyHasAnim = false;
      for (var a = 0; a < animClasses.length; a++) {
        if (el.classList.contains(animClasses[a])) { alreadyHasAnim = true; break; }
      }
      if (alreadyHasAnim) {
        el.setAttribute('data-theme-anim', '1');
        el.classList.remove('anim-entrance', 'anim-up');
        el.classList.add('visible');
        continue;
      }

      var typeKey = '';
      var cl = el.className;
      if (cl.indexOf('stat-card') !== -1) typeKey = 'stat-card';
      else if (cl.indexOf('hero-stat') !== -1) typeKey = 'hero-stat';
      else if (cl.indexOf('list-item') !== -1) typeKey = 'list-item';
      else if (cl.indexOf('section-block') !== -1) typeKey = 'section-block';
      else if (cl.indexOf('chip') !== -1) typeKey = 'chip';
      else if (cl.indexOf('test-card') !== -1) typeKey = 'testcard';
      else if (cl.indexOf('mt-card') !== -1) typeKey = 'mtcard';
      else if (cl.indexOf('prep-card') !== -1) typeKey = 'prepcard';
      else if (cl.indexOf('freq-card') !== -1) typeKey = 'freqcard';
      else typeKey = 'card';

      var idx = _typeAnimIndex[typeKey] !== undefined ? _typeAnimIndex[typeKey] : s % animClasses.length;
      el.classList.add(animClasses[idx]);
      el.setAttribute('data-theme-anim', '1');
      el.classList.remove('anim-entrance', 'anim-up');
      el.classList.add('visible');
    }
  }

  var themeObserver = new IntersectionObserver(function(entries) {
    for (var j = 0; j < entries.length; j++) {
      if (entries[j].isIntersecting) {
        var el = entries[j].target;
        el.classList.add('anim-active');
        themeObserver.unobserve(el);
      }
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -20px 0px' });

  for (var c = 0; c < animClasses.length; c++) {
    var animEls = root.querySelectorAll('.' + animClasses[c]);
    for (var ae = 0; ae < animEls.length; ae++) {
      themeObserver.observe(animEls[ae]);
    }
  }
  _scrollObservers.push(themeObserver);

  var fallbackEls = [];
  for (var fc = 0; fc < animClasses.length; fc++) {
    var fEls = root.querySelectorAll('.' + animClasses[fc]);
    for (var fe = 0; fe < fEls.length; fe++) {
      if (!fEls[fe].classList.contains('anim-active')) {
        fallbackEls.push(fEls[fe]);
      }
    }
  }
  if (fallbackEls.length > 0) {
    setTimeout(function() {
      for (var fi = 0; fi < fallbackEls.length; fi++) {
        if (!fallbackEls[fi].classList.contains('anim-active')) {
          fallbackEls[fi].classList.add('anim-active');
        }
      }
    }, 600);
  }
}

export function initScrollAnimations(scope) {
  _disconnectScrollObservers();
  var root = scope || document;

  _showAllVisible(root);
}

function _showAllVisible(scope) {
  var els = scope.querySelectorAll(
    '.card, .stat-card, .hero-stat, .list-item, .section-block, .chip, ' +
    '.test-card, .mt-card, .prep-card, .freq-card, ' +
    '.anim-entrance, .anim-up'
  );
  for (var i = 0; i < els.length; i++) {
    els[i].style.opacity = '1';
    els[i].style.transform = 'none';
    els[i].classList.add('visible');
  }
}

export function cleanupScrollAnimations() { _disconnectScrollObservers(); }

/* ═══════════════ 3D CARD TILT ═══════════════ */
export function initTilt() {
  if (_reducedMq.matches) return;
  var ticking = false;
  document.addEventListener('mousemove', function(e) {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function() {
      document.querySelectorAll('.card, .stat-card, .hero-stat').forEach(function(card) {
        if (card.hasAttribute('data-no-tilt')) return;
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
          var rotateX = ((y / rect.height) - 0.5) * -6;
          var rotateY = ((x / rect.width) - 0.5) * 6;
          card.style.setProperty('--tilt-x', rotateX + 'deg');
          card.style.setProperty('--tilt-y', rotateY + 'deg');
        } else {
          card.style.setProperty('--tilt-x', '0deg');
          card.style.setProperty('--tilt-y', '0deg');
        }
      });
      ticking = false;
    });
  }, { passive: true });

  document.addEventListener('mouseleave', function() {
    document.querySelectorAll('.card, .stat-card, .hero-stat').forEach(function(card) {
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
    });
  }, { passive: true });
}

/* ═══════════════ LOADING STATES ═══════════════ */
export function skeletonPulse(el) {
  if (noMotion()) return;
  _M.animate(el, { opacity: [0.4, 0.8, 0.4] }, { duration: 1.5, easing: [0.42, 0, 0.58, 1], iterations: Infinity });
}
export function showSkeleton(container, count = 3) {
  container.innerHTML = Array(count).fill(0).map(() => '<div class="skeleton" style="height:60px;margin-bottom:8px"></div>').join('');
}
export function removeSkeleton(container) {
  container.querySelectorAll('.skeleton').forEach(s => {
    if (noMotion()) { s.remove(); return; }
    _M.animate(s, { opacity: [1, 0], height: ['60px', '0px'] }, { duration: 0.2 }).then(() => s.remove()).catch(() => { try { s.remove(); } catch(e) {} });
  });
}

/* ═══════════════ ACCESSIBILITY ═══════════════ */
export function initAccessibility() {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', () => {
    if (mq.matches) { document.querySelectorAll('[style*="transform"]').forEach(el => { el.style.transform = ''; }); }
  });
  document.querySelectorAll('.orb, .noise, .ambient').forEach(el => { el.setAttribute('aria-hidden', 'true'); });
  const style = document.createElement('style');
  style.textContent = '.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}';
  document.head.appendChild(style);
}

/* ═══════════════ INITIALIZATION ═══════════════ */
export function initInteractions() {
  if (noMotion()) return;
  document.addEventListener('pointerenter', e => {
    if (!(e.target instanceof Element)) return;
    const btn = e.target.closest('.btn-primary');
    if (btn) buttonHoverLift(btn);
  }, true);
  document.addEventListener('pointerleave', e => {
    if (!(e.target instanceof Element)) return;
    const btn = e.target.closest('.btn-primary');
    if (btn) buttonHoverReset(btn);
  }, true);
  document.addEventListener('pointerdown', e => {
    if (!(e.target instanceof Element)) return;
    const btn = e.target.closest('.btn');
    if (btn) buttonPress(btn);
  }, true);

  var _magTick = false;
  var _magEl = null, _magX = 0, _magY = 0;
  document.addEventListener('pointermove', function(e) {
    if (!(e.target instanceof Element)) return;
    var el = e.target.closest('[data-interactive]');
    _magEl = el; _magX = e.clientX; _magY = e.clientY;
    if (!_magTick && el) {
      _magTick = true;
      requestAnimationFrame(function() {
        if (_magEl) {
          var rect = _magEl.getBoundingClientRect();
          var cx = rect.left + rect.width / 2;
          var cy = rect.top + rect.height / 2;
          var dx = _magX - cx; var dy = _magY - cy;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 80) { var force = (1 - dist / 80) * 0.3; _magEl.style.transform = 'translate(' + (dx * force) + 'px,' + (dy * force) + 'px)'; }
          else { _magEl.style.transform = ''; }
        }
        _magTick = false;
      });
    } else if (!el) { _magEl = null; }
  }, { passive: true });

  document.addEventListener('pointerdown', e => {
    const target = e.target.closest('.btn, .chip');
    if (!target) return;
    const ripple = document.createElement('span');
    const size = Math.max(target.offsetWidth, target.offsetHeight);
    ripple.style.cssText = 'position:absolute;width:' + size + 'px;height:' + size + 'px;left:' + (e.offsetX - size / 2) + 'px;top:' + (e.offsetY - size / 2) + 'px;border-radius:50%;background:rgba(255,255,255,0.2);transform:scale(0);animation:ripple-expand 0.6s ease-out;pointer-events:none;z-index:1;';
    var prevOverflow = target.style.overflow;
    var prevPosition = target.style.position;
    target.style.position = 'relative';
    target.style.overflow = 'hidden';
    target.appendChild(ripple);
    setTimeout(function() { ripple.remove(); target.style.overflow = prevOverflow; target.style.position = prevPosition; }, 600);
  }, true);

  const logo = document.querySelector('.sidebar-logo');
  const overlay = document.getElementById('easter-egg-overlay');
  if (logo && overlay) {
    let pressTimer = null;
    logo.addEventListener('mousedown', function() { pressTimer = setTimeout(function() { overlay.classList.add('active'); setTimeout(function() { overlay.classList.remove('active'); }, 2500); }, 2000); });
    logo.addEventListener('mouseup', function() { clearTimeout(pressTimer); });
    logo.addEventListener('mouseleave', function() { clearTimeout(pressTimer); });
    overlay.addEventListener('click', function() { overlay.classList.remove('active'); });
  }

  document.addEventListener('focusin', e => { if (e.target.classList.contains('inp')) inputFocusRing(e.target); }, true);
  document.addEventListener('focusout', e => { if (e.target.classList.contains('inp')) inputBlurRing(e.target); }, true);

  initTilt();
  initMouseParticles();
  initAccessibility();
}

/* ═══════════════ MOUSE-FOLLOWING PARTICLES ═══════════════ */
export function initMouseParticles() {
  if (_reducedMq.matches) return;
  var canvas = document.getElementById('mouse-particles');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;
  var particles = [];
  var maxParticles = 15;
  var lastSpawn = 0;
  var spawnInterval = 120;
  var mouseX = -100, mouseY = -100;
  var isMoving = false;
  var moveTimer = null;

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  function getThemeColor() { return [41, 141, 255]; }

  function spawnParticle(x, y) {
    if (particles.length >= maxParticles) particles.shift();
    var col = getThemeColor();
    var angle = Math.random() * Math.PI * 2;
    var speed = 0.3 + Math.random() * 0.5;
    particles.push({ x: x + (Math.random() - 0.5) * 8, y: y + (Math.random() - 0.5) * 8, vx: Math.cos(angle) * speed, vy: -0.4 - Math.random() * 0.6, size: 2 + Math.random() * 2.5, life: 1, decay: 0.008 + Math.random() * 0.012, r: col[0], g: col[1], b: col[2] });
  }

  document.addEventListener('mousemove', function(e) {
    mouseX = e.clientX; mouseY = e.clientY; isMoving = true;
    clearTimeout(moveTimer);
    moveTimer = setTimeout(function() { isMoving = false; }, 100);
  }, { passive: true });

  function tick() {
    if (_reducedMq.matches) { requestAnimationFrame(tick); return; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var now = Date.now();
    if (isMoving && now - lastSpawn > spawnInterval) { spawnParticle(mouseX, mouseY); lastSpawn = now; }
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i]; p.x += p.vx; p.y += p.vy; p.life -= p.decay;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      ctx.globalAlpha = p.life * 0.6;
      ctx.fillStyle = 'rgb(' + p.r + ',' + p.g + ',' + p.b + ')';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

export function shouldAnimate() { return !_reducedMq.matches && !!_M && !!_M.animate; }
export function animateAllEntrance() {}
export function animateAllCounters() {}
