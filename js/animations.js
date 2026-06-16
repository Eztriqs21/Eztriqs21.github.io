// js/animations.js — Motion One Animation Library for JEE HQ
// 30+ animation functions using Motion One (window.Motion)
// Zero CSS keyframe animations — all spring/physics based

const _M = window.Motion;
const _reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function noMotion() { return !_M || !_M.animate || _reduced; }

/* ═══════════════ A: PAGE & NAVIGATION ═══════════════ */

export function pageExit(el) {
  if (noMotion()) return Promise.resolve();
  try {
    return _M.animate(el, {
      opacity: [1, 0],
      transform: ['translateY(0px)', 'translateY(8px)']
    }, { duration: 0.12, easing: [0.25, 1, 0.5, 1] }) || Promise.resolve();
  } catch(e) { return Promise.resolve(); }
}

export function pageEnter(el) {
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
  if (noMotion()) return;
  _M.animate(sb, { width: ['60px', '240px'] }, { duration: 0.3, easing: [0.34, 1.56, 0.64, 1] });
}

export function sidebarCollapse(sb) {
  if (noMotion()) return;
  _M.animate(sb, { width: ['240px', '60px'] }, { duration: 0.25, easing: [0.25, 1, 0.5, 1] });
}

export function sidebarMobileOpen(sb) {
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

export function fabExpand(actions) {
  if (noMotion()) { actions.forEach(a => a.style.display = 'flex'); return; }
  actions.forEach((a, i) => {
    a.style.display = 'flex';
    a.style.opacity = '0';
    _M.animate(a, {
      opacity: [0, 1],
      transform: ['translateY(20px) scale(0.8)', 'translateY(0px) scale(1)']
    }, { duration: 0.25, delay: i * 0.05, easing: [0.34, 1.56, 0.64, 1] });
  });
}

export function fabCollapse(actions) {
  if (noMotion()) { actions.forEach(a => a.style.display = 'none'); return; }
  const count = actions.length;
  actions.forEach((a, i) => {
    _M.animate(a, {
      opacity: [1, 0],
      transform: ['translateY(0px) scale(1)', 'translateY(20px) scale(0.8)']
    }, { duration: 0.15, delay: (count - 1 - i) * 0.03, easing: [0.25, 1, 0.5, 1] }).then(() => {
      a.style.display = 'none';
    });
  });
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
  _M.animate({ val: start }, {
    val: target
  }, {
    duration,
    easing: [0.80, 1.56, 0.40, 1]
  }).onFinished = () => {
    el.textContent = target;
  };
  // Fallback: animate manually
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

export function tiltCard3D(el, x, y) {
  if (noMotion()) return;
  _M.animate(el, {
    transform: `perspective(600px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-3px)`
  }, { duration: 0.15, easing: [0.25, 1, 0.5, 1] });
}

export function tiltCardReset(el) {
  if (noMotion()) return;
  _M.animate(el, {
    transform: 'perspective(600px) rotateY(0deg) rotateX(0deg) translateY(0px)'
  }, { duration: 0.3, easing: [0.34, 1.56, 0.64, 1] });
}

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
  if (noMotion()) {
    scope.querySelectorAll('.anim-up').forEach(e => { e.classList.add('visible'); e.style.opacity = '1'; e.style.transform = 'none'; });
    scope.querySelectorAll('.stat-card, .gc, .test-card, .mt-card').forEach(e => { e.style.opacity = '1'; });
    return;
  }
  const els = scope.querySelectorAll('.anim-up');
  els.forEach((el, i) => {
    _M.animate(el, {
      opacity: [0, 1],
      transform: ['translateY(16px)', 'translateY(0px)']
    }, { duration: 0.4, delay: i * 0.04, easing: [0.34, 1.56, 0.64, 1] }).then(() => {
      el.classList.add('visible');
    }).catch(() => {
      el.classList.add('visible');
    });
  });
  // Also animate section blocks and gc cards
  const cards = scope.querySelectorAll('.stat-card, .gc, .test-card, .mt-card');
  cards.forEach((card, i) => {
    card.style.opacity = '0';
    _M.animate(card, {
      opacity: [0, 1],
      transform: ['translateY(16px)', 'translateY(0px)']
    }, { duration: 0.35, delay: 0.05 + i * 0.04, easing: [0.34, 1.56, 0.64, 1] });
  });
}

export function pageLoadChoreography(scope) {
  if (noMotion()) {
    scope.querySelectorAll('.stat-card, .gc, .test-card, .mt-card, .prep-card, .freq-card').forEach(c => c.style.opacity = '1');
    return;
  }
  const cards = scope.querySelectorAll('.stat-card, .gc, .test-card, .mt-card, .prep-card, .freq-card');
  cards.forEach((card, i) => {
    card.style.opacity = '0';
    _M.animate(card, {
      opacity: [0, 1],
      transform: ['translateY(16px)', 'translateY(0px)']
    }, { duration: 0.35, delay: i * 0.05, easing: [0.34, 1.56, 0.64, 1] });
  });
}

export function chartChoreography(scope) {
  scope.querySelectorAll('.bar-fill').forEach((bar, i) => {
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

export function fabArcExpand(actions) {
  if (noMotion()) { actions.forEach(a => a.style.display = 'flex'); return; }
  const count = actions.length;
  actions.forEach((a, i) => {
    a.style.display = 'flex';
    a.style.opacity = '0';
    const angle = -90 + (i / (count - 1 || 1)) * 45;
    const rad = angle * Math.PI / 180;
    const dist = 60 + i * 8;
    const tx = Math.cos(rad) * dist;
    const ty = Math.sin(rad) * dist - 20;
    _M.animate(a, {
      opacity: [0, 1],
      transform: [`translate(${tx}px, ${ty + 20}px) scale(0.5)`, `translate(${tx}px, ${ty}px) scale(1)`]
    }, { duration: 0.3, delay: i * 0.06, easing: [0.34, 1.56, 0.64, 1] });
  });
}

export function fabArcCollapse(actions) {
  if (noMotion()) { actions.forEach(a => a.style.display = 'none'); return; }
  const count = actions.length;
  actions.forEach((a, i) => {
    _M.animate(a, {
      opacity: [1, 0],
      transform: ['translate(0px, 0px) scale(1)', 'translate(0px, 20px) scale(0.5)']
    }, { duration: 0.15, delay: (count - 1 - i) * 0.04, easing: [0.25, 1, 0.5, 1] }).then(() => {
      a.style.display = 'none';
      a.style.transform = '';
    });
  });
}

export function fabPress(el) {
  if (noMotion()) return;
  try {
    const p = _M.animate(el, { transform: ['scale(1) rotate(0deg)', 'scale(0.9) rotate(45deg)'] }, { duration: 0.15, easing: [0.25, 1, 0.5, 1] });
    if (p && p.then) p.then(() => {
      _M.animate(el, { transform: ['scale(0.9) rotate(45deg)', 'scale(1) rotate(0deg)'] }, { duration: 0.25, easing: [0.34, 1.56, 0.64, 1] });
    });
  } catch(e) {}
}

export function fabResetIcon(el) {
  if (noMotion()) return;
  _M.animate(el, { transform: ['scale(1) rotate(45deg)', 'scale(1) rotate(0deg)'] }, { duration: 0.2, easing: [0.25, 1, 0.5, 1] });
}

/* ═══════════════ STEP 12: SCROLL-LINKED ═══════════════ */

export function initScrollAnimations() {
  if (noMotion()) return;

  // Section reveal on scroll
  const sections = document.querySelectorAll('.section-block, .gc');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        el.style.opacity = '0';
        _M.animate(el, {
          opacity: [0, 1],
          transform: ['translateY(20px)', 'translateY(0px)']
        }, { duration: 0.5, easing: [0.34, 1.56, 0.64, 1] });
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  sections.forEach(s => observer.observe(s));

  // Parallax on page title
  const contentWrap = document.getElementById('content-wrap');
  if (contentWrap) {
    let ticking = false;
    contentWrap.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = contentWrap.scrollTop;
          const pgTitle = contentWrap.querySelector('.pg-title');
          if (pgTitle && scrollY < 200) {
            pgTitle.style.transform = `translateY(${scrollY * -0.15}px)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }
}

/* ═══════════════ STEP 13: LOADING STATES ═══════════════ */

export function skeletonPulse(el) {
  if (noMotion()) return;
  _M.animate(el, {
    opacity: [0.4, 0.8, 0.4]
  }, { duration: 1.5, easing: 'ease-in-out', repeat: Infinity });
}

export function showSkeleton(container, count = 3) {
  container.innerHTML = Array(count).fill(0).map(() =>
    `<div class="skeleton" style="height:60px;margin-bottom:8px"></div>`
  ).join('');
}

export function removeSkeleton(container) {
  container.querySelectorAll('.skeleton').forEach(s => {
    if (noMotion()) { s.remove(); return; }
    _M.animate(s, { opacity: [1, 0], height: ['60px', '0px'] }, { duration: 0.2 }).then(() => s.remove());
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

/* ═══════════════ STEP 15: PERFORMANCE ═══════════════ */

export function initPerformance() {
  // Will-change cleanup: add on hover, remove after animation
  document.addEventListener('pointerenter', e => {
    const card = e.target.closest('.stat-card, .prep-card, .test-card, .mt-card');
    if (card) card.style.willChange = 'transform';
  }, true);
  document.addEventListener('pointerleave', e => {
    const card = e.target.closest('.stat-card, .prep-card, .test-card, .mt-card');
    if (card) {
      setTimeout(() => { card.style.willChange = 'auto'; }, 300);
    }
  }, true);

  // Batch DOM reads
  window.batchRead = function(fn) {
    requestAnimationFrame(() => {
      fn();
    });
  };

  // Throttle scroll handlers
  window.throttledScroll = function(fn, ms = 16) {
    let last = 0;
    return function(...args) {
      const now = Date.now();
      if (now - last >= ms) {
        last = now;
        fn.apply(this, args);
      }
    };
  };
}

/* ═══════════════ CUSTOM CURSOR ═══════════════ */

export function initCustomCursor() {
  const dot = document.getElementById('cursor-dot');
  if (!dot || !window.matchMedia('(pointer:fine)').matches) return;

  let mouseX = 0, mouseY = 0;
  let dotX = 0, dotY = 0;

  document.addEventListener('pointermove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  function updateDot() {
    dotX += (mouseX - dotX) * 0.25;
    dotY += (mouseY - dotY) * 0.25;
    dot.style.left = dotX + 'px';
    dot.style.top = dotY + 'px';
    requestAnimationFrame(updateDot);
  }
  requestAnimationFrame(updateDot);

  // Hover state on interactive elements
  const interactives = 'a, button, .si, .bni, .fab, .fab-action, .theme-dot, .cmt-chip, .cmt-source-opt, .cmt-time-btn, .pyq-tab, .ds-tab, .chip, .mt-month-head, .mt-subj-header, .test-card-head, [onclick]';
  document.addEventListener('pointerenter', e => {
    if (e.target.closest(interactives)) dot.classList.add('hover');
  }, true);
  document.addEventListener('pointerleave', e => {
    if (e.target.closest(interactives)) dot.classList.remove('hover');
  }, true);

  // Click feedback
  document.addEventListener('pointerdown', () => dot.classList.add('click'));
  document.addEventListener('pointerup', () => dot.classList.remove('click'));

  // Hide on scroll, show after scroll stops
  let scrollTimer;
  document.addEventListener('scroll', () => {
    dot.style.opacity = '0';
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => { dot.style.opacity = '1'; }, 150);
  }, { passive: true });
}

/* ═══════════════ INITIALIZATION ═══════════════ */

export function initInteractions() {
  // Custom cursor (works regardless of reduced motion)
  initCustomCursor();

  if (noMotion()) return;

  // Button hover lift
  document.addEventListener('pointerenter', e => {
    const btn = e.target.closest('.btn-primary');
    if (btn) buttonHoverLift(btn);
  }, true);
  document.addEventListener('pointerleave', e => {
    const btn = e.target.closest('.btn-primary');
    if (btn) buttonHoverReset(btn);
  }, true);

  // Button press
  document.addEventListener('pointerdown', e => {
    const btn = e.target.closest('.btn');
    if (btn) buttonPress(btn);
  }, true);

  // FAB press feedback
  document.addEventListener('pointerdown', e => {
    const fab = e.target.closest('.fab');
    if (fab) fabPress(fab);
  }, true);

  // 3D tilt on stat-cards and prep-cards
  document.addEventListener('pointermove', e => {
    const card = e.target.closest('.stat-card, .prep-card');
    if (!card) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    tiltCard3D(card, x, y);
  }, { passive: true });

  document.addEventListener('pointerleave', e => {
    const card = e.target.closest('.stat-card, .prep-card');
    if (card) tiltCardReset(card);
  }, true);

  // Input focus ring
  document.addEventListener('focusin', e => {
    if (e.target.classList.contains('inp')) inputFocusRing(e.target);
  }, true);
  document.addEventListener('focusout', e => {
    if (e.target.classList.contains('inp')) inputBlurRing(e.target);
  }, true);

  // Init scroll, accessibility, performance
  initScrollAnimations();
  initAccessibility();
  initPerformance();
}

/* ═══════════════ PREFERS-REDUCED-MOTION ═══════════════ */

export function shouldAnimate() {
  return !_reduced && !!_M && !!_M.animate;
}
