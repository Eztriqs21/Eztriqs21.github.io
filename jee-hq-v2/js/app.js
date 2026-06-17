(function() {
  const pages = {
    dashboard: { title: 'Dashboard', sub: 'Your JEE preparation intelligence dashboard' },
    chapters: { title: 'Chapters', sub: 'Syllabus mastery & tracking' },
    tests: { title: 'Tests', sub: 'Test history and performance analysis' },
    analytics: { title: 'Analytics', sub: 'Performance insights and study tracking' },
    calculator: { title: 'Calculator', sub: 'Full JEE mock evaluation engine' },
    assignments: { title: 'Assignments', sub: 'Task management & tracking' },
    'mock-tests': { title: 'Mock Tests', sub: 'Full-length practice exams' },
    revision: { title: 'Revision', sub: 'Quick revision & formula sheets' },
    doubts: { title: 'Doubt Solver', sub: 'AI-powered doubt resolution' },
    notes: { title: 'Notes', sub: 'Chapter-wise notes & resources' },
    pyq: { title: 'PYQ Research', sub: 'Previous year question analysis' },
    prep: { title: 'Prep Chat', sub: 'Personalized study planning' },
    'score-analytics': { title: 'Score Analytics', sub: 'Detailed performance breakdown' },
    'study-log': { title: 'Study Log', sub: 'Track your study sessions' }
  };

  const pageRenderers = {
    dashboard: window.renderDashboard,
    chapters: window.renderChapters,
    tests: window.renderTests,
    analytics: window.renderAnalytics,
    calculator: window.renderCalculator,
    assignments: window.renderAssignments,
    'mock-tests': window.renderMockTests,
    revision: window.renderRevision,
    doubts: window.renderDoubts,
    notes: window.renderNotes,
    pyq: window.renderPYQ,
    prep: window.renderPrep,
    'score-analytics': window.renderScoreAnalytics,
    'study-log': window.renderStudyLog
  };

  let currentPage = null;

  function getPage() {
    const hash = window.location.hash.replace('#/', '') || 'dashboard';
    return pages[hash] ? hash : 'dashboard';
  }

  function navigate(page) {
    if (page === currentPage) return;

    const contentWrap = document.getElementById('content-wrap');
    const pageTitle = document.getElementById('page-title');
    const pageSubtitle = document.getElementById('page-subtitle');
    if (!contentWrap) return;

    contentWrap.classList.add('page-exit');

    setTimeout(() => {
      const info = pages[page];
      if (pageTitle) {
        pageTitle.textContent = info.title;
        pageTitle.setAttribute('data-text', info.title);
      }
      if (pageSubtitle) pageSubtitle.textContent = info.sub;

      document.querySelectorAll('.nav-item, .bni').forEach(el => el.classList.remove('active'));
      const navEl = document.querySelector(`.nav-item[href="#/${page}"], .bni[href="#/${page}"]`);
      if (navEl) navEl.classList.add('active');

      contentWrap.innerHTML = '';
      const renderer = pageRenderers[page];
      if (renderer) renderer(contentWrap);

      contentWrap.classList.remove('page-exit');
      contentWrap.classList.add('page-enter');

      setTimeout(() => {
        contentWrap.classList.remove('page-enter');
        animateEntrance(contentWrap);
        animateCounters(contentWrap);
        initScrollAnimations(contentWrap);
      }, 50);

      currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 250);
  }

  function animateEntrance(container) {
    const items = container.querySelectorAll('.anim-entrance');
    items.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      setTimeout(() => {
        el.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 60 + i * 60);
    });
  }

  function animateCounters(container) {
    const counters = container.querySelectorAll('[data-count]');
    counters.forEach(el => {
      const raw = el.getAttribute('data-count');
      const target = parseFloat(raw);
      const isFloat = raw.includes('.');
      const duration = 1200;
      const start = performance.now();

      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        const current = target * eased;
        el.textContent = isFloat ? current.toFixed(1) : Math.round(current);
        if (progress < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
    });
  }

  function initScrollAnimations(container) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    container.querySelectorAll('.anim-entrance').forEach(el => observer.observe(el));
  }

  // ═══════════════ MAGNETIC BUTTONS ═══════════════
  function initMagneticButtons() {
    document.addEventListener('mousemove', (e) => {
      document.querySelectorAll('[data-interactive]').forEach(el => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 80) {
          const force = (1 - dist / 80) * 0.3;
          el.style.transform = `translate(${dx * force}px, ${dy * force}px)`;
        } else {
          el.style.transform = '';
        }
      });
    });
  }

  // ═══════════════ THEME SWITCHER ═══════════════
  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('jeehq-theme', theme); } catch(e) {}

    if (theme === 'nexus') {
      window.gridBloom?.stop();
      window.gridNexus?.start();
    } else {
      window.gridNexus?.stop();
      window.gridBloom?.start();
    }
    window.cursorEngine?.morph();
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'nexus' ? 'bloom' : 'nexus';

    const flash = document.createElement('div');
    flash.style.cssText = `position:fixed;inset:0;z-index:10000;background:${next === 'nexus' ? '#00f0ff' : '#fff'};opacity:0;pointer-events:none;transition:opacity 0.5s;`;
    document.body.appendChild(flash);
    requestAnimationFrame(() => { flash.style.opacity = '0.5'; });
    setTimeout(() => { flash.style.opacity = '0'; }, 100);
    setTimeout(() => flash.remove(), 600);

    setTheme(next);

    // Re-render current page with new theme
    if (currentPage) {
      const contentWrap = document.getElementById('content-wrap');
      if (contentWrap) {
        const renderer = pageRenderers[currentPage];
        if (renderer) {
          contentWrap.innerHTML = '';
          renderer(contentWrap);
          setTimeout(() => {
            animateEntrance(contentWrap);
            animateCounters(contentWrap);
          }, 50);
        }
      }
    }
  }

  // ═══════════════ 3D CARD TILT (Nexus) ═══════════════
  function initTilt() {
    let ticking = false;
    document.addEventListener('mousemove', (e) => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const theme = document.documentElement.getAttribute('data-theme');
        if (theme !== 'nexus') { ticking = false; return; }

        document.querySelectorAll('.nx-card, .nx-stat-card, .nx-hero-stat').forEach(card => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
            const rotateX = ((y / rect.height) - 0.5) * -6;
            const rotateY = ((x / rect.width) - 0.5) * 6;
            card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
            card.style.willChange = 'transform';
          } else {
            card.style.transform = '';
            card.style.willChange = '';
          }
        });
        ticking = false;
      });
    });
  }

  // ═══════════════ BLOOM PARALLAX CARDS ═══════════════
  function initParallax() {
    let ticking = false;
    document.addEventListener('mousemove', (e) => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const theme = document.documentElement.getAttribute('data-theme');
        if (theme !== 'bloom') { ticking = false; return; }

        document.querySelectorAll('.bl-card, .bl-stat-card, .bl-hero-stat').forEach(card => {
          const rect = card.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const offsetX = (e.clientX - centerX) * 0.015;
          const offsetY = (e.clientY - centerY) * 0.015;

          if (Math.abs(e.clientX - centerX) < 300 && Math.abs(e.clientY - centerY) < 300) {
            card.style.transform = `translate(${-offsetX}px, ${-offsetY}px) translateY(-2px)`;
            card.style.willChange = 'transform';
          } else {
            card.style.transform = '';
            card.style.willChange = '';
          }
        });
        ticking = false;
      });
    });
  }

  // ═══════════════ EASTER EGG ═══════════════
  function initEasterEgg() {
    const logo = document.querySelector('.sidebar-logo');
    const overlay = document.getElementById('easter-egg-overlay');
    if (!logo || !overlay) return;

    let pressTimer = null;
    logo.addEventListener('mousedown', () => {
      pressTimer = setTimeout(() => {
        overlay.classList.add('active');
        setTimeout(() => overlay.classList.remove('active'), 2500);
      }, 2000);
    });
    logo.addEventListener('mouseup', () => clearTimeout(pressTimer));
    logo.addEventListener('mouseleave', () => clearTimeout(pressTimer));
    overlay.addEventListener('click', () => overlay.classList.remove('active'));
  }

  // ═══════════════ MOBILE MENU ═══════════════
  function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mob-overlay');

    if (hamburger) {
      hamburger.addEventListener('click', () => {
        sidebar?.classList.toggle('open');
        overlay?.classList.toggle('open');
        if (overlay) {
          if (overlay.classList.contains('open')) {
            overlay.style.cssText = 'display:block;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:99;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);';
          } else {
            overlay.style.display = 'none';
          }
        }
      });
    }

    if (overlay) {
      overlay.addEventListener('click', () => {
        sidebar?.classList.remove('open');
        overlay.classList.remove('open');
        overlay.style.display = 'none';
      });
    }
  }

  // ═══════════════ KEYBOARD SHORTCUTS ═══════════════
  function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const shortcuts = {
        '1': 'dashboard', '2': 'chapters', '3': 'tests',
        '4': 'analytics', '5': 'calculator'
      };

      if (shortcuts[e.key]) {
        e.preventDefault();
        window.location.hash = '#/' + shortcuts[e.key];
      }

      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        toggleTheme();
      }
    });
  }

  // ═══════════════ RIPPLE EFFECT ═══════════════
  function initRipple() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('.nx-btn, .bl-btn, .nx-chip, .bl-chip');
      if (!target) return;

      const ripple = document.createElement('span');
      const rect = target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.cssText = `position:absolute;width:${size}px;height:${size}px;left:${e.clientX - rect.left - size/2}px;top:${e.clientY - rect.top - size/2}px;border-radius:50%;background:rgba(255,255,255,0.2);transform:scale(0);animation:ripple-expand 0.6s ease-out;pointer-events:none;`;
      target.style.position = 'relative';
      target.style.overflow = 'hidden';
      target.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  }

  // ═══════════════ SMOOTH SCROLL ═══════════════
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#/"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('mob-overlay');
        if (sidebar?.classList.contains('open')) {
          sidebar.classList.remove('open');
          if (overlay) { overlay.classList.remove('open'); overlay.style.display = 'none'; }
        }
      });
    });
  }

  // ═══════════════ INIT ═══════════════
  function init() {
    document.querySelectorAll('#theme-switcher, #mobile-theme-btn').forEach(btn => {
      btn.addEventListener('click', toggleTheme);
    });

    window.addEventListener('hashchange', () => navigate(getPage()));

    initMobileMenu();
    initEasterEgg();
    initTilt();
    initParallax();
    initMagneticButtons();
    initKeyboardShortcuts();
    initRipple();
    initSmoothScroll();

    const saved = localStorage.getItem('jeehq-theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);

    window.preloaderEngine?.run(() => {
      const theme = document.documentElement.getAttribute('data-theme');
      if (theme === 'nexus') {
        window.gridNexus?.start();
      } else {
        window.gridBloom?.start();
      }
      navigate(getPage());
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
