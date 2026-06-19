// js/animations.js — Motion One Animation Library for JEE HQ
// 30+ animation functions using Motion One (window.Motion)
// Zero CSS keyframe animations — all spring/physics based

const _M = window.Motion;
const _reducedMq = window.matchMedia('(prefers-reduced-motion: reduce)');

function noMotion() { return !_M || !_M.animate || _reducedMq.matches; }

/* ═══════════════ A: PAGE & NAVIGATION ═══════════════ */

export function pageExit(el) {
  if (!el) return Promise.resolve();
  if (noMotion()) return Promise.resolve();
  try {
    return _M.animate(el, {
      opacity: [1, 0],
      transform: ['translateY(0px)', 'translateY(8px)']
    }, { duration: 0.12, easing: [0.25, 1, 0.5, 1] }) || Promise.resolve();
  } catch(e) { return Promise.resolve(); }
}

export function pageEnter(el) {
  if (!el) return Promise.resolve();
  if (noMotion()) { el.style.opacity = '1'; return Promise.resolve(); }
  el.style.opacity = '0';
  try {
    return _M.animate(el, {
      opacity: [0, 1],
      transform: ['translateY(8px)', 'translateY(0px)']
    }, { duration: 0.25, easing: [0.34, 1.56, 0.64, 1] }) || Promise.resolve();
  } catch(e) { el.style.opacity = '1'; return Promise.resolve(); }
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
    if (p && p.then) p.then(() => {
      _M.animate(el, { transform: ['scale(0.92)', 'scale(1)'] }, { duration: 0.2, easing: [0.34, 1.56, 0.64, 1] });
    });
  } catch(e) {}
}

/* ═══════════════ B: SECTION & CONTENT ═══════════════ */

export function staggerIn(els, opts = {}) {
  if (noMotion()) { els.forEach(e => e.style.opacity = '1'); return; }
  const { delay = 0, y = 16 } = opts;
  els.forEach((el, i) => {
    el.style.opacity = '0';
    _M.animate(el, {
      opacity: [0, 1],
      transform: [`translateY(${y}px)`, 'translateY(0px)']
    }, {
      duration: 0.35,
      delay: delay + i * 0.06,
      easing: [0.34, 1.56, 0.64, 1]
    });
  });
}

export function sectionReveal(el, opts = {}) {
  if (noMotion()) return;
  const { y = 20 } = opts;
  _M.animate(el, {
    opacity: [0, 1],
    transform: [`translateY(${y}px)`, 'translateY(0px)']
  }, { duration: 0.4, easing: [0.34, 1.56, 0.64, 1] });
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
    else { el.textContent = target; el.setAttribute('data-count-start', target); }
  }
  requestAnimationFrame(tick);
}

export function progressBarFill(bar, width) {
  if (!bar) return;
  if (noMotion()) { bar.style.width = width; return; }
  bar.style.width = '0%';
  _M.animate(bar, { width: ['0%', width] }, {
    duration: 0.7,
    easing: [0.34, 1.56, 0.64, 1]
  });
}

export function emptyStateFade(el) {
  if (noMotion()) return;
  _M.animate(el, {
    opacity: [0, 1],
    transform: ['translateY(8px)', 'translateY(0px)']
  }, { duration: 0.3, easing: [0.25, 1, 0.5, 1] });
}

export function pageTitleReveal(el) {
  if (noMotion()) return;
  _M.animate(el, {
    opacity: [0, 1],
    transform: ['translateY(-8px)', 'translateY(0px)']
  }, { duration: 0.35, easing: [0.34, 1.56, 0.64, 1] });
}

export function sectionBlockEntrance(els) {
  if (noMotion()) return;
  els.forEach((el, i) => {
    _M.animate(el, {
      opacity: [0, 1],
      transform: ['translateY(12px)', 'translateY(0px)']
    }, { duration: 0.35, delay: i * 0.08, easing: [0.34, 1.56, 0.64, 1] });
  });
}

/* ═══════════════ C: CARDS & INTERACTIVE ═══════════════ */

export function buttonPress(el) {
  if (noMotion()) return;
  try {
    const p = _M.animate(el, { transform: ['scale(1)', 'scale(0.95)'] }, { duration: 0.1, easing: [0.25, 1, 0.5, 1] });
    if (p && p.then) p.then(() => {
      _M.animate(el, { transform: ['scale(0.95)', 'scale(1)'] }, { duration: 0.2, easing: [0.34, 1.56, 0.64, 1] });
    });
  } catch(e) {}
}

export function buttonHoverLift(el) {
  if (noMotion()) return;
  _M.animate(el, { transform: ['translateY(0px)', 'translateY(-1px)'] }, { duration: 0.2, easing: [0.34, 1.56, 0.64, 1] });
}

export function buttonHoverReset(el) {
  if (noMotion()) return;
  _M.animate(el, { transform: ['translateY(-1px)', 'translateY(0px)'] }, { duration: 0.15, easing: [0.25, 1, 0.5, 1] });
}

export function chipSelect(el) {
  if (noMotion()) return;
  try {
    const p = _M.animate(el, { transform: ['scale(1)', 'scale(0.95)'] }, { duration: 0.1 });
    if (p && p.then) p.then(() => {
      _M.animate(el, { transform: ['scale(0.95)', 'scale(1)'] }, { duration: 0.2, easing: [0.34, 1.56, 0.64, 1] });
    });
  } catch(e) {}
}

export function navItemActive(el) {
  if (noMotion()) return;
  try {
    const p = _M.animate(el, { transform: ['scale(1)', 'scale(0.96)'] }, { duration: 0.1 });
    if (p && p.then) p.then(() => {
      _M.animate(el, { transform: ['scale(0.96)', 'scale(1)'] }, { duration: 0.2, easing: [0.34, 1.56, 0.64, 1] });
    });
  } catch(e) {}
}

/* ═══════════════ D: MODAL & OVERLAY ═══════════════ */

export function modalOpenMobile(md) {
  if (noMotion()) return;
  _M.animate(md, {
    opacity: [0, 1],
    transform: ['translateY(100%)', 'translateY(0%)']
  }, { duration: 0.35, easing: [0.34, 1.56, 0.64, 1] });
}

export function modalOpenDesktop(md) {
  if (noMotion()) return;
  _M.animate(md, {
    opacity: [0, 1],
    transform: ['translateY(12px) scale(0.97)', 'translateY(0px) scale(1)']
  }, { duration: 0.35, easing: [0.34, 1.56, 0.64, 1] });
}

export function modalClose(md) {
  if (noMotion()) return Promise.resolve();
  try {
    return _M.animate(md, {
      opacity: [1, 0],
      transform: ['translateY(0px) scale(1)', 'translateY(16px) scale(0.98)']
    }, { duration: 0.2, easing: [0.25, 1, 0.5, 1] }) || Promise.resolve();
  } catch(e) { return Promise.resolve(); }
}

export function backdropBlurIn(el) {
  if (noMotion()) return;
  _M.animate(el, { opacity: [0, 1] }, { duration: 0.25, easing: [0.25, 1, 0.5, 1] });
}

export function confirmDialog(box) {
  if (noMotion()) return;
  _M.animate(box, {
    opacity: [0, 1],
    transform: ['translateY(16px) scale(0.95)', 'translateY(0px) scale(1)']
  }, { duration: 0.3, easing: [0.34, 1.56, 0.64, 1] });
}

/* ═══════════════ E: CHARTS ═══════════════ */

export function svgLineDraw(path) {
  if (noMotion()) return;
  const len = path.getTotalLength?.();
  if (!len) return;
  path.style.strokeDasharray = len;
  path.style.strokeDashoffset = len;
  _M.animate(path, { strokeDashoffset: [len, 0] }, {
    duration: 1.2,
    easing: [0.25, 1, 0.5, 1],
    delay: 0.2
  });
}

export function svgCirclePop(circle, delay = 0) {
  if (noMotion()) return;
  circle.style.opacity = '0';
  circle.style.transformOrigin = 'center';
  _M.animate(circle, {
    opacity: ['0', '1'],
    transform: ['scale(0)', 'scale(1)']
  }, { duration: 0.3, delay: 0.3 + delay * 0.04, easing: [0.34, 1.56, 0.64, 1] });
}

export function barChartGrow(bar, height, delay = 0) {
  if (noMotion()) { bar.style.height = height; return; }
  bar.style.height = '0%';
  _M.animate(bar, { height: ['0%', height] }, {
    duration: 0.6,
    delay,
    easing: [0.34, 1.56, 0.64, 1]
  });
}

export function donutFill(circle, circumference, pct) {
  if (noMotion()) { circle.style.strokeDashoffset = circumference * (1 - pct / 100); return; }
  _M.animate(circle, {
    strokeDashoffset: [circumference, circumference * (1 - pct / 100)]
  }, { duration: 1, easing: [0.25, 1, 0.5, 1], delay: 0.3 });
}

export function numberCountUp(el, target, opts = {}) {
  if (noMotion()) { el.textContent = target; return; }
  const { duration = 1.2, decimals = 0 } = opts;
  const start = 0;
  const startTime = performance.now();
  function tick(now) {
    const t = Math.min((now - startTime) / (duration * 1000), 1);
    const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const val = start + (target - start) * eased;
    el.textContent = decimals > 0 ? val.toFixed(decimals) : Math.round(val);
    if (t < 1) requestAnimationFrame(tick);
    else el.textContent = decimals > 0 ? target.toFixed(decimals) : target;
  }
  requestAnimationFrame(tick);
}

/* ═══════════════ F: MICRO-INTERACTIONS ═══════════════ */

export function inputFocusRing(el) {
  if (noMotion()) return;
  _M.animate(el, { boxShadow: ['0 0 0 0px var(--accent)', '0 0 0 2px var(--accent)'] }, { duration: 0.2 });
}

export function inputBlurRing(el) {
  if (noMotion()) return;
  _M.animate(el, { boxShadow: ['0 0 0 2px var(--accent)', '0 0 0 0px var(--accent)'] }, { duration: 0.15 });
}

export function toastSlideIn(el) {
  if (noMotion()) return;
  _M.animate(el, {
    transform: ['translateX(-50%) translateY(-120%)', 'translateX(-50%) translateY(0%)']
  }, { duration: 0.3, easing: [0.34, 1.56, 0.64, 1] });
}

export function toastSlideOut(el) {
  if (noMotion()) return;
  _M.animate(el, {
    transform: ['translateX(-50%) translateY(0%)', 'translateX(-50%) translateY(-120%)']
  }, { duration: 0.25, easing: [0.25, 1, 0.5, 1] });
}

export function dropzoneHighlight(el) {
  if (noMotion()) return;
  _M.animate(el, { borderColor: ['var(--border)', 'var(--accent)'], scale: [1, 1.02] }, { duration: 0.2 });
}

export function dropzoneReset(el) {
  if (noMotion()) return;
  _M.animate(el, { borderColor: ['var(--accent)', 'var(--border)'], scale: [1.02, 1] }, { duration: 0.2 });
}

export function accordionExpand(el, targetHeight) {
  if (noMotion()) { el.style.maxHeight = targetHeight; return; }
  _M.animate(el, { maxHeight: ['0px', targetHeight] }, { duration: 0.3, easing: [0.34, 1.56, 0.64, 1] });
}

export function accordionCollapse(el) {
  if (noMotion()) { el.style.maxHeight = '0px'; return; }
  const h = el.scrollHeight;
  _M.animate(el, { maxHeight: [h + 'px', '0px'] }, { duration: 0.25, easing: [0.25, 1, 0.5, 1] });
}

export function tooltipAppear(el) {
  if (noMotion()) return;
  _M.animate(el, {
    opacity: [0, 1],
    transform: ['translateY(4px)', 'translateY(0px)']
  }, { duration: 0.15, easing: [0.25, 1, 0.5, 1] });
}

/* ═══════════════ G: SCROLL-LINKED ═══════════════ */

export function heroParallax(el, scrollProgress) {
  if (noMotion()) return;
  const y = scrollProgress * -40;
  el.style.transform = `translateY(${y}px)`;
}

export function progressBarTracking(bar, scrollProgress) {
  if (noMotion()) return;
  bar.style.width = (scrollProgress * 100) + '%';
}

export function sectionFadeInView(el) {
  if (noMotion()) return;
  el.style.opacity = '0';
  _M.animate(el, {
    opacity: [0, 1],
    transform: ['translateY(20px)', 'translateY(0px)']
  }, { duration: 0.5, easing: [0.34, 1.56, 0.64, 1] });
}

/* ═══════════════ COMPOSITE CHOREOGRAPHIES ═══════════════ */

export function animateAllEntrance(scope) {
  if (!scope) return;
  if (noMotion()) {
    scope.querySelectorAll('.anim-entrance, .anim-up').forEach(e => { e.classList.add('visible'); e.style.opacity = '1'; e.style.transform = 'none'; });
    return;
  }
  var all = scope.querySelectorAll('.anim-entrance, .anim-up');
  var toAnim = [];
  for (var i = 0; i < all.length; i++) {
    if (!all[i].classList.contains('visible')) toAnim.push(all[i]);
  }
  if (!toAnim.length) return;
  for (var b = 0; b < toAnim.length; b += 12) {
    (function(start) {
      for (var k = start; k < Math.min(start + 12, toAnim.length); k++) {
        (function(el, idx) {
          try {
            var p = _M.animate(el, {
              opacity: [0, 1],
              transform: ['translateY(16px)', 'translateY(0px)']
            }, { duration: 0.4, delay: idx * 0.04, easing: [0.34, 1.56, 0.64, 1] }) || Promise.resolve();
            p.then(function() {
              el.classList.add('visible');
            }).catch(function() {
              el.style.opacity = '1';
              el.classList.add('visible');
            });
          } catch(e) {
            el.style.opacity = '1';
            el.classList.add('visible');
          }
        })(toAnim[k], k);
      }
    })(b);
  }
}

export function pageLoadChoreography(scope) {
  if (noMotion()) {
    scope.querySelectorAll('.nx-stat-card, .nx-card, .nx-list-item, .test-card, .mt-card, .prep-card, .freq-card').forEach(c => c.style.opacity = '1');
    return;
  }
  var cards = scope.querySelectorAll('.nx-stat-card, .nx-card, .nx-list-item, .test-card, .mt-card, .prep-card, .freq-card');
  var idx = 0;
  for (var i = 0; i < cards.length; i++) {
    var card = cards[i];
    if (card.style.opacity === '1' || card.classList.contains('visible')) continue;
    card.style.opacity = '0';
    (function(c, d) {
      try {
        (_M.animate(c, {
          opacity: [0, 1],
          transform: ['translateY(16px)', 'translateY(0px)']
        }, { duration: 0.35, delay: d * 0.05, easing: [0.34, 1.56, 0.64, 1] }) || Promise.resolve()).catch(function() {
          c.style.opacity = '1';
        });
      } catch(e) {
        c.style.opacity = '1';
      }
    })(card, idx);
    idx++;
  }
}

export function chartChoreography(scope) {
  scope.querySelectorAll('.bar-fill, [class*="-bar-fill"]').forEach((bar, i) => {
    const h = bar.style.height;
    barChartGrow(bar, h, i * 0.06);
  });
  scope.querySelectorAll('svg path[stroke]').forEach(path => {
    svgLineDraw(path);
  });
  scope.querySelectorAll('svg circle').forEach((c, i) => {
    svgCirclePop(c, i);
  });
}

/* ═══════════════ STEP 11: FAB ARC FAN-OUT ═══════════════ */

/* ═══════════════ STEP 12: SCROLL-LINKED ═══════════════ */

export function initScrollAnimations() {
  if (noMotion()) return;

  // Section reveal on scroll with depth stagger
  var sections = document.querySelectorAll('.nx-section-block, .nx-card, .section-block, .gc, .bl-card, .nb-card');
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        var siblings = Array.from(el.parentElement.children);
        var idx = siblings.indexOf(el);
        var delay = Math.min(idx * 0.06, 0.3);
        el.style.opacity = '0';
        el.style.transition = 'none';
        setTimeout(function() {
          _M.animate(el, {
            opacity: [0, 1],
            transform: ['translateY(24px)', 'translateY(0px)']
          }, { duration: 0.55, easing: [0.34, 1.56, 0.64, 1] });
        }, delay * 1000);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });

  sections.forEach(function(s) { observer.observe(s); });

  // Parallax on page title + depth on content sections
  var contentWrap = document.getElementById('content-wrap');
  if (contentWrap) {
    var ticking = false;
    contentWrap.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(function() {
          var scrollY = contentWrap.scrollTop;
          var pgTitle = contentWrap.querySelector('.pg-title');
          if (pgTitle && scrollY < 300) {
            pgTitle.style.transform = 'translateY(' + (scrollY * -0.2) + 'px)';
            pgTitle.style.opacity = Math.max(0, 1 - scrollY / 300);
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }
}

/* ═══════════════ 3D CARD TILT (Nexus) ═══════════════ */

export function initTilt() {
  if (_reducedMq.matches) return;
  var ticking = false;
  document.addEventListener('mousemove', function(e) {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function() {
      var theme = document.documentElement.getAttribute('data-theme');
      if (theme !== 'nexus' && theme !== 'nebula') { ticking = false; return; }

        document.querySelectorAll('.nx-card, .nx-stat-card, .nx-hero-stat, .nb-card, .nb-stat-card, .nb-hero-stat').forEach(function(card) {
          if (card.hasAttribute('data-no-tilt')) return;
          var rect = card.getBoundingClientRect();
          var x = e.clientX - rect.left;
          var y = e.clientY - rect.top;

          if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
            var rotateX = ((y / rect.height) - 0.5) * -6;
            var rotateY = ((x / rect.width) - 0.5) * 6;
            card.style.transform = 'perspective(600px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-2px)';
            card.style.willChange = 'transform';
          } else {
            card.style.transform = '';
            card.style.willChange = '';
          }
        });
      ticking = false;
    });
  }, { passive: true });
}

/* ═══════════════ BLOOM PARALLAX CARDS (already in initInteractions) ═══════════════ */

/* ═══════════════ STEP 13: LOADING STATES ═══════════════ */

export function skeletonPulse(el) {
  if (noMotion()) return;
  _M.animate(el, {
    opacity: [0.4, 0.8, 0.4]
  }, { duration: 1.5, easing: [0.42, 0, 0.58, 1], iterations: Infinity });
}

export function showSkeleton(container, count = 3) {
  container.innerHTML = Array(count).fill(0).map(() =>
    `<div class="skeleton" style="height:60px;margin-bottom:8px"></div>`
  ).join('');
}

export function removeSkeleton(container) {
  container.querySelectorAll('.skeleton').forEach(s => {
    if (noMotion()) { s.remove(); return; }
    _M.animate(s, { opacity: [1, 0], height: ['60px', '0px'] }, { duration: 0.2 }).then(() => s.remove()).catch(() => { try { s.remove(); } catch(e) {} });
  });
}

/* ═══════════════ STEP 14: ACCESSIBILITY ═══════════════ */

export function initAccessibility() {
  // Listen for preference changes
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', () => {
    if (mq.matches) {
      // Disable all running animations
      document.querySelectorAll('[style*="transform"]').forEach(el => {
        el.style.transform = '';
      });
    }
  });

  // Add aria-hidden to decorative elements
  document.querySelectorAll('.orb, .noise, .ambient').forEach(el => {
    el.setAttribute('aria-hidden', 'true');
  });

  // Add sr-only class for screen readers
  const style = document.createElement('style');
  style.textContent = `.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}`;
  document.head.appendChild(style);
}

/* ═══════════════ INITIALIZATION ═══════════════ */

export function initInteractions() {
  if (noMotion()) return;

  // Button hover lift
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

  // Button press
  document.addEventListener('pointerdown', e => {
    if (!(e.target instanceof Element)) return;
    const btn = e.target.closest('.btn');
    if (btn) buttonPress(btn);
  }, true);

  // Magnetic buttons on [data-interactive] — RAF-throttled
  var _magTick = false;
  var _magEl = null, _magX = 0, _magY = 0;
  document.addEventListener('pointermove', function(e) {
    if (!(e.target instanceof Element)) return;
    var el = e.target.closest('[data-interactive]');
    _magEl = el;
    _magX = e.clientX;
    _magY = e.clientY;
    if (!_magTick && el) {
      _magTick = true;
      requestAnimationFrame(function() {
        if (_magEl) {
          var rect = _magEl.getBoundingClientRect();
          var cx = rect.left + rect.width / 2;
          var cy = rect.top + rect.height / 2;
          var dx = _magX - cx;
          var dy = _magY - cy;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 80) {
            var force = (1 - dist / 80) * 0.3;
            _magEl.style.transform = 'translate(' + (dx * force) + 'px,' + (dy * force) + 'px)';
          } else {
            _magEl.style.transform = '';
          }
        }
        _magTick = false;
      });
    } else if (!el) {
      _magEl = null;
    }
  }, { passive: true });

  // Ripple on buttons/chips
  document.addEventListener('pointerdown', e => {
    const target = e.target.closest('.nx-btn, .bl-btn, .nx-chip, .bl-chip');
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



  // Easter egg: long-press logo
  const logo = document.querySelector('.sidebar-logo');
  const overlay = document.getElementById('easter-egg-overlay');
  if (logo && overlay) {
    let pressTimer = null;
    logo.addEventListener('mousedown', function() {
      pressTimer = setTimeout(function() {
        overlay.classList.add('active');
        setTimeout(function() { overlay.classList.remove('active'); }, 2500);
      }, 2000);
    });
    logo.addEventListener('mouseup', function() { clearTimeout(pressTimer); });
    logo.addEventListener('mouseleave', function() { clearTimeout(pressTimer); });
    overlay.addEventListener('click', function() { overlay.classList.remove('active'); });
  }

  // Input focus ring
  document.addEventListener('focusin', e => {
    if (e.target.classList.contains('inp')) inputFocusRing(e.target);
  }, true);
  document.addEventListener('focusout', e => {
    if (e.target.classList.contains('inp')) inputBlurRing(e.target);
  }, true);

  // 3D card tilt (Nexus only)
  initTilt();

  // Mouse-following particles
  initMouseParticles();

  // Init scroll and accessibility
  initScrollAnimations();
  initAccessibility();
}

/* ═══════════════ MOUSE-FOLLOWING PARTICLES ═══════════════ */

export function initMouseParticles() {
  if (_reducedMq.matchMedia) return;

  var canvas = document.getElementById('mouse-particles');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var particles = [];
  var maxParticles = 30;
  var lastSpawn = 0;
  var spawnInterval = 70;
  var mouseX = -100, mouseY = -100;
  var isMoving = false;
  var moveTimer = null;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function getThemeColor() {
    var theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'bloom') return [107, 144, 128];
    if (theme === 'nebula') return [140, 122, 230];
    return [0, 240, 255];
  }

  function spawnParticle(x, y) {
    if (particles.length >= maxParticles) {
      particles.shift();
    }
    var col = getThemeColor();
    var angle = Math.random() * Math.PI * 2;
    var speed = 0.3 + Math.random() * 0.5;
    particles.push({
      x: x + (Math.random() - 0.5) * 8,
      y: y + (Math.random() - 0.5) * 8,
      vx: Math.cos(angle) * speed,
      vy: -0.4 - Math.random() * 0.6,
      size: 2 + Math.random() * 2.5,
      life: 1,
      decay: 0.008 + Math.random() * 0.012,
      r: col[0], g: col[1], b: col[2]
    });
  }

  document.addEventListener('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    isMoving = true;
    clearTimeout(moveTimer);
    moveTimer = setTimeout(function() { isMoving = false; }, 100);
  }, { passive: true });

  function tick() {
    if (_reducedMq.matches) { requestAnimationFrame(tick); return; }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var now = Date.now();
    if (isMoving && now - lastSpawn > spawnInterval) {
      spawnParticle(mouseX, mouseY);
      lastSpawn = now;
    }

    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;

      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.globalAlpha = p.life * 0.6;
      ctx.fillStyle = 'rgb(' + p.r + ',' + p.g + ',' + p.b + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

/* ═══════════════ PREFERS-REDUCED-MOTION ═══════════════ */

export function shouldAnimate() {
  return !_reducedMq.matches && !!_M && !!_M.animate;
}
