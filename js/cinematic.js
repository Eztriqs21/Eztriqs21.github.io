(function() {
  var TOTAL_DURATION = 60000;
  var overlay, scanlines, noise, stage, skipBtn, progressBar, progressFill;
  var spotlight, spotlightBorder, pageIndicator;
  var morphFlash;
  var titleEl, subEl, labelEl, themeNameEl;
  var active = false;
  var sceneTimer = null;
  var startTime = 0;
  var _raf = null;

  var SCENES = [
    { t: 0,    dur: 500,   text: '', sub: '', effect: 'none', page: null, theme: null, transition: 'none' },

    { t: 500,  dur: 2000,  text: 'JEE HQ', sub: '', effect: 'glitch', page: null, theme: null, transition: 'none',
      position: 'center', textClass: 'cinematic-title' },

    { t: 2500, dur: 1500,  text: '', sub: 'YOUR COMMAND CENTER', effect: 'typewriter', page: null, theme: null, transition: 'none',
      position: 'center', textClass: 'cinematic-sub' },

    { t: 4000, dur: 1500,  text: '', sub: 'Let us show you around.', effect: 'fade-up', page: null, theme: null, transition: 'none',
      position: 'center', textClass: 'cinematic-sub', subOffset: 60 },

    { t: 5500,  dur: 2500, text: 'DASHBOARD', label: 'YOUR HUB', effect: 'fly-left', page: 'dashboard',
      spotlight: '[data-tutorial-id="stat-cards"]', theme: 'nexus', transition: 'cut' },

    { t: 8000,  dur: 2000, text: 'Know Your Numbers', label: '', effect: 'scale', page: null,
      spotlight: '[data-tutorial-id="stat-cards"]', theme: null, transition: 'none' },

    { t: 10000, dur: 2500, text: 'CHAPTERS', label: 'SYLLABUS', effect: 'fly-right', page: 'chapters',
      spotlight: '[data-tutorial-id="chapter-item"]', theme: null, transition: 'cut' },

    { t: 12500, dur: 2000, text: 'Master Your Syllabus', label: '', effect: 'fade-up', page: null,
      spotlight: '[data-tutorial-id="chapter-item"]', theme: null, transition: 'none' },

    { t: 14500, dur: 2500, text: 'TESTS', label: 'PERFORMANCE', effect: 'fly-left', page: 'tests',
      spotlight: '[data-tutorial-id="test-card"]', theme: null, transition: 'cut' },

    { t: 17000, dur: 2000, text: 'Track Every Score', label: '', effect: 'scale', page: null,
      spotlight: '[data-tutorial-id="test-card"]', theme: null, transition: 'none' },

    { t: 19000, dur: 2000, text: 'SWITCH', label: '', effect: 'glitch-morph', page: null,
      theme: 'bloom', transition: 'morph' },

    { t: 21000, dur: 2500, text: 'ASSIGNMENTS', label: 'DEADLINES', effect: 'fly-right', page: 'assignments',
      spotlight: '[data-tutorial-id="assignment-item"]', theme: null, transition: 'cut' },

    { t: 23500, dur: 2000, text: 'Never Miss a Deadline', label: '', effect: 'fade-up', page: null,
      spotlight: '[data-tutorial-id="assignment-item"]', theme: null, transition: 'none' },

    { t: 25500, dur: 2500, text: 'PYQ RESEARCH', label: 'PRACTICE', effect: 'fly-left', page: 'pyq',
      spotlight: '[data-tutorial-id="pyq-card"]', theme: null, transition: 'cut' },

    { t: 28000, dur: 2000, text: 'Practice with Purpose', label: '', effect: 'scale', page: null,
      spotlight: '[data-tutorial-id="pyq-card"]', theme: null, transition: 'none' },

    { t: 30000, dur: 2500, text: 'STUDY LOG', label: 'TIME TRACKING', effect: 'fly-right', page: 'study-log',
      spotlight: '[data-tutorial-id="live-timer"]', theme: null, transition: 'cut' },

    { t: 32500, dur: 2000, text: 'Every Minute Counts', label: '', effect: 'typewriter', page: null,
      spotlight: '[data-tutorial-id="live-timer"]', theme: null, transition: 'none' },

    { t: 34500, dur: 2000, text: 'SWITCH', label: '', effect: 'glitch-morph', page: null,
      theme: 'nebula', transition: 'morph' },

    { t: 36500, dur: 2500, text: 'ANALYTICS', label: 'INSIGHTS', effect: 'fly-left', page: 'analytics',
      spotlight: '[data-tutorial-id="weekly-chart"]', theme: null, transition: 'cut' },

    { t: 39000, dur: 2000, text: 'Your Patterns, Revealed', label: '', effect: 'scale', page: null,
      spotlight: '[data-tutorial-id="weekly-chart"]', theme: null, transition: 'none' },

    { t: 41000, dur: 2500, text: 'CALCULATOR', label: '75-QUESTION ENGINE', effect: 'fly-right', page: 'calculator',
      spotlight: '[data-tutorial-id="response-sheet"]', theme: null, transition: 'cut' },

    { t: 43500, dur: 2000, text: 'Score. Analyze. Improve.', label: '', effect: 'fade-up', page: null,
      spotlight: '[data-tutorial-id="calc-results"]', theme: null, transition: 'none' },

    { t: 45500, dur: 2500, text: 'MOCK TESTS', label: 'EXAM SIMULATION', effect: 'fly-left', page: 'mock-tests',
      spotlight: '[data-tutorial-id="mock-card"]', theme: null, transition: 'cut' },

    { t: 48000, dur: 2000, text: 'Simulate Exam Day', label: '', effect: 'scale', page: null,
      spotlight: '[data-tutorial-id="mock-card"]', theme: null, transition: 'none' },

    { t: 50000, dur: 3000, text: 'Three Themes.', sub: '', effect: 'typewriter', page: null, theme: null, transition: 'cut',
      position: 'center', handwrite: true },

    { t: 53000, dur: 2500, text: 'One Mission.', sub: '', effect: 'scale', page: null, theme: null, transition: 'cut',
      position: 'center' },

    { t: 55500, dur: 3000, text: 'Good luck.', sub: '', effect: 'fade-in', page: null, theme: null, transition: 'cut',
      position: 'center', textClass: 'cinematic-sub', subSize: true },

    { t: 58500, dur: 1500, text: '', sub: '', effect: 'none', page: 'dashboard', theme: null, transition: 'fade-out' }
  ];

  function buildDOM() {
    if (document.getElementById('cinematic-overlay')) return;

    overlay = document.createElement('div');
    overlay.id = 'cinematic-overlay';
    overlay.className = 'cinematic-overlay';
    overlay.innerHTML =
      '<div class="cinematic-scanlines"></div>' +
      '<div class="cinematic-noise"></div>';
    document.body.appendChild(overlay);

    scanlines = overlay.querySelector('.cinematic-scanlines');
    noise = overlay.querySelector('.cinematic-noise');

    var barTop = document.createElement('div');
    barTop.className = 'cinematic-bar cinematic-bar-top';
    document.body.appendChild(barTop);

    var barBot = document.createElement('div');
    barBot.className = 'cinematic-bar cinematic-bar-bot';
    document.body.appendChild(barBot);

    stage = document.createElement('div');
    stage.className = 'cinematic-stage';
    stage.id = 'cinematic-stage';
    document.body.appendChild(stage);

    titleEl = document.createElement('div');
    titleEl.className = 'cinematic-title';
    titleEl.id = 'cin-title';
    stage.appendChild(titleEl);

    subEl = document.createElement('div');
    subEl.className = 'cinematic-sub';
    subEl.id = 'cin-sub';
    stage.appendChild(subEl);

    labelEl = document.createElement('div');
    labelEl.className = 'cinematic-label';
    labelEl.id = 'cin-label';
    stage.appendChild(labelEl);

    themeNameEl = document.createElement('div');
    themeNameEl.className = 'cinematic-theme-name';
    themeNameEl.id = 'cin-theme-name';
    stage.appendChild(themeNameEl);

    spotlight = document.createElement('div');
    spotlight.className = 'cinematic-spotlight';
    spotlightBorder = document.createElement('div');
    spotlightBorder.className = 'cinematic-spotlight-border';
    spotlight.appendChild(spotlightBorder);
    document.body.appendChild(spotlight);

    skipBtn = document.createElement('button');
    skipBtn.className = 'cinematic-skip';
    skipBtn.id = 'cin-skip';
    skipBtn.innerHTML = 'Skip <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>';
    document.body.appendChild(skipBtn);

    progressBar = document.createElement('div');
    progressBar.className = 'cinematic-progress';
    progressFill = document.createElement('div');
    progressFill.className = 'cinematic-progress-fill';
    progressBar.appendChild(progressFill);
    document.body.appendChild(progressBar);

    morphFlash = document.createElement('div');
    morphFlash.className = 'cinematic-morph-flash';
    document.body.appendChild(morphFlash);

    pageIndicator = document.createElement('div');
    pageIndicator.className = 'cinematic-page-indicator';
    pageIndicator.id = 'cin-page-indicator';
    document.body.appendChild(pageIndicator);

    skipBtn.addEventListener('click', function() { skip(); });
    document.addEventListener('keydown', function(e) {
      if (!active) return;
      if (e.key === 'Escape') skip();
    });
  }

  function clearStage() {
    titleEl.style.opacity = '0';
    titleEl.style.animation = 'none';
    titleEl.textContent = '';
    titleEl.className = 'cinematic-title';

    subEl.style.opacity = '0';
    subEl.style.animation = 'none';
    subEl.textContent = '';
    subEl.className = 'cinematic-sub';

    labelEl.style.opacity = '0';
    labelEl.style.animation = 'none';
    labelEl.textContent = '';

    themeNameEl.style.opacity = '0';
    themeNameEl.style.animation = 'none';
    themeNameEl.textContent = '';
  }

  function applyTextEffect(el, effect, text, opts) {
    opts = opts || {};
    el.textContent = text;
    el.style.animation = 'none';
    void el.offsetWidth;

    var dur = opts.dur || '0.8s';
    var delay = opts.delay || '0s';

    switch (effect) {
      case 'glitch':
        el.style.animation = 'cin-glitch-in ' + dur + ' ease-out ' + delay + ' forwards, cin-rgb-shift 3s ease 1s infinite';
        break;
      case 'fly-left':
        el.style.animation = 'cin-fly-left ' + dur + ' cubic-bezier(0.22, 1, 0.36, 1) ' + delay + ' forwards';
        break;
      case 'fly-right':
        el.style.animation = 'cin-fly-right ' + dur + ' cubic-bezier(0.22, 1, 0.36, 1) ' + delay + ' forwards';
        break;
      case 'fly-top':
        el.style.animation = 'cin-fly-top ' + dur + ' cubic-bezier(0.22, 1, 0.36, 1) ' + delay + ' forwards';
        break;
      case 'scale':
        el.style.animation = 'cin-scale-in ' + dur + ' cubic-bezier(0.22, 1, 0.36, 1) ' + delay + ' forwards';
        break;
      case 'fade-up':
        el.style.animation = 'cin-fade-up ' + dur + ' ease-out ' + delay + ' forwards';
        break;
      case 'fade-in':
        el.style.animation = 'cin-fade-in ' + dur + ' ease ' + delay + ' forwards';
        break;
      case 'typewriter':
        el.style.borderRight = '2px solid #fff';
        el.style.whiteSpace = 'nowrap';
        el.style.overflow = 'hidden';
        el.style.width = '0';
        el.style.animation = 'none';
        var totalChars = text.length;
        var charDur = 60;
        el.style.transition = 'width ' + (totalChars * charDur) + 'ms steps(' + totalChars + ')';
        requestAnimationFrame(function() {
          el.style.width = '100%';
          setTimeout(function() {
            el.style.borderRight = 'none';
          }, totalChars * charDur + 500);
        });
        break;
      case 'glitch-morph':
        el.style.animation = 'cin-glitch-in ' + dur + ' ease-out ' + delay + ' forwards';
        el.style.textShadow = '0 0 40px rgba(255,0,64,0.5), 0 0 80px rgba(0,240,255,0.3)';
        break;
      default:
        el.style.animation = 'cin-fade-in 0.5s ease forwards';
    }
  }

  function showText(scene) {
    clearStage();

    var targetEl;
    if (scene.textClass === 'cinematic-sub') {
      targetEl = subEl;
      if (scene.subSize) {
        subEl.style.fontSize = 'clamp(24px, 4vw, 40px)';
        subEl.style.letterSpacing = '2px';
      }
    } else if (scene.textClass === 'cinematic-label') {
      targetEl = labelEl;
    } else {
      targetEl = titleEl;
    }

    if (scene.text) {
      targetEl.textContent = '';
      applyTextEffect(targetEl, scene.effect, scene.text, { dur: '0.7s' });
    }

    if (scene.sub && targetEl !== subEl) {
      subEl.textContent = scene.sub;
      applyTextEffect(subEl, 'fade-up', scene.sub, { dur: '0.6s', delay: '0.3s' });
    }

    if (scene.label) {
      labelEl.textContent = scene.label;
      applyTextEffect(labelEl, 'fade-in', scene.label, { dur: '0.4s', delay: '0.1s' });
    }

    if (scene.themeName) {
      themeNameEl.textContent = scene.themeName;
      applyTextEffect(themeNameEl, 'scale', scene.themeName, { dur: '1s' });
    }
  }

  function hideText() {
    titleEl.style.animation = 'cin-fade-out 0.3s ease forwards';
    subEl.style.animation = 'cin-fade-out 0.3s ease forwards';
    labelEl.style.animation = 'cin-fade-out 0.3s ease forwards';
  }

  function positionSpotlight(target) {
    if (!target) {
      spotlight.classList.remove('active');
      return;
    }

    var el = document.querySelector(target);
    if (!el) {
      spotlight.classList.remove('active');
      return;
    }

    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });

    setTimeout(function() {
      var rect = el.getBoundingClientRect();
      var pad = 12;
      spotlight.style.top = (rect.top - pad) + 'px';
      spotlight.style.left = (rect.left - pad) + 'px';
      spotlight.style.width = (rect.width + pad * 2) + 'px';
      spotlight.style.height = (rect.height + pad * 2) + 'px';
      spotlight.style.borderRadius = getComputedStyle(el).borderRadius || '8px';
      spotlight.classList.add('active');
    }, 150);
  }

  function hideSpotlight() {
    spotlight.classList.remove('active');
  }

  function switchTheme(theme) {
    var themeMap = { nexus: 0, bloom: 1, nebula: 2 };
    var idx = themeMap[theme];
    if (idx === undefined) return;

    morphFlash.className = 'cinematic-morph-flash ' + theme;
    morphFlash.style.animation = 'cin-morph-flash 0.8s ease forwards';
    setTimeout(function() { morphFlash.style.animation = 'none'; }, 800);

    if (window.themesEngine && window.themesEngine.applyTheme) {
      window.themesEngine.applyTheme(idx);
    }
  }

  function navigateToPage(page) {
    if (!page) return;
    var currentHash = (window.location.hash || '').replace('#/', '').replace('#', '');
    if (currentHash !== page) {
      window.location.hash = '#/' + page;
    }
  }

  function updateProgress(pct) {
    progressFill.style.width = pct + '%';
  }

  function runScene(scene) {
    if (!active) return;

    hideText();
    hideSpotlight();

    if (scene.transition === 'cut') {
      overlay.style.opacity = '1';
      setTimeout(function() { executeScene(scene); }, 50);
    } else if (scene.transition === 'morph') {
      setTimeout(function() { executeScene(scene); }, 100);
    } else {
      executeScene(scene);
    }
  }

  function executeScene(scene) {
    if (scene.page) {
      navigateToPage(scene.page);
      setTimeout(function() { applySceneVisuals(scene); }, 350);
    } else {
      applySceneVisuals(scene);
    }
  }

  function applySceneVisuals(scene) {
    if (scene.theme) {
      switchTheme(scene.theme);
    }

    showText(scene);

    if (scene.spotlight) {
      positionSpotlight(scene.spotlight);
    }

    if (scene.transition === 'fade-out') {
      setTimeout(function() { skip(); }, scene.dur || 1500);
    }
  }

  var _sceneIdx = 0;
  function startTimeline() {
    _sceneIdx = 0;
    startTime = Date.now();

    function tick() {
      if (!active) return;
      var elapsed = Date.now() - startTime;
      var totalDur = SCENES[SCENES.length - 1].t + SCENES[SCENES.length - 1].dur;
      updateProgress(Math.min(100, (elapsed / totalDur) * 100));

      while (_sceneIdx < SCENES.length && elapsed >= SCENES[_sceneIdx].t) {
        runScene(SCENES[_sceneIdx]);
        _sceneIdx++;
      }

      if (elapsed < totalDur) {
        _raf = requestAnimationFrame(tick);
      } else {
        skip();
      }
    }

    _raf = requestAnimationFrame(tick);
  }

  function play() {
    if (active) return;
    buildDOM();
    active = true;
    _sceneIdx = 0;
    startTime = 0;

    overlay.classList.add('active');
    skipBtn.style.display = '';
    clearStage();

    spotlight.style.transition = 'none';
    spotlight.style.boxShadow = 'none';
    void spotlight.offsetWidth;
    spotlight.style.transition = '';

    setTimeout(function() {
      startTime = Date.now();
      startTimeline();
    }, 400);
  }

  function skip() {
    active = false;
    if (_raf) { cancelAnimationFrame(_raf); _raf = null; }
    if (sceneTimer) { clearTimeout(sceneTimer); sceneTimer = null; }

    hideText();
    hideSpotlight();
    clearStage();

    overlay.classList.remove('active');
    spotlight.classList.remove('active');

    pageIndicator.classList.remove('show');

    document.querySelectorAll('.cinematic-bar').forEach(function(b) { b.style.height = '0'; });

    if (window.themesEngine && window.themesEngine.applyTheme) {
      var saved = parseInt(localStorage.getItem('themeIndex') || '0', 10);
      window.themesEngine.applyTheme(saved);
    }

    window.location.hash = '#/dashboard';
  }

  function playIfFirstVisit() {
    if (!localStorage.getItem('cinematicSeen')) {
      setTimeout(function() {
        play();
        localStorage.setItem('cinematicSeen', '1');
      }, 3200);
    }
  }

  function bindButton() {
    var btn = document.getElementById('cinematic-btn');
    if (btn && !btn._bound) {
      btn._bound = true;
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        play();
      });
    }
    document.addEventListener('click', function(e) {
      var b = e.target.closest('#cinematic-btn');
      if (b) {
        e.preventDefault();
        e.stopPropagation();
        play();
      }
    });
  }

  bindButton();
  document.addEventListener('DOMContentLoaded', bindButton);

  window.cinematicEngine = {
    play: play,
    skip: skip,
    playIfFirstVisit: playIfFirstVisit
  };
})();
