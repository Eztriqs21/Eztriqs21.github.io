(function() {
  var overlay, vignette, stage, skipBtn, progressBar, progressFill;
  var spotlight, spotlightBorder, morphFlash;
  var titleEl, subEl, labelEl, themeNameEl;
  var picker, pickerVisible = false;
  var active = false;
  var startTime = 0;
  var _raf = null;
  var _sceneIdx = 0;
  var chosenStyle = localStorage.getItem('cinematicStyle') || '';

  var SCENES = [
    { t: 0,    dur: 600,   effect: 'none' },

    { t: 600,  dur: 2200,  text: 'JEE HQ', effect: 'title', position: 'center' },

    { t: 2800, dur: 1600,  sub: 'YOUR COMMAND CENTER', effect: 'sub', position: 'center' },

    { t: 4400, dur: 1600,  sub: 'Let us show you around.', effect: 'sub', position: 'center' },

    { t: 6000,  dur: 2500, text: 'DASHBOARD', label: 'YOUR HUB', effect: 'title',
      page: 'dashboard', spotlight: '[data-tutorial-id="stat-cards"]', theme: 'nexus', transition: 'cut' },

    { t: 8500,  dur: 2000, text: 'Know Your Numbers', effect: 'subtitle',
      spotlight: '[data-tutorial-id="stat-cards"]' },

    { t: 10500, dur: 2500, text: 'CHAPTERS', label: 'SYLLABUS', effect: 'title',
      page: 'chapters', spotlight: '[data-tutorial-id="chapter-item"]', transition: 'cut' },

    { t: 13000, dur: 2000, text: 'Master Your Syllabus', effect: 'subtitle',
      spotlight: '[data-tutorial-id="chapter-item"]' },

    { t: 15000, dur: 2500, text: 'TESTS', label: 'PERFORMANCE', effect: 'title',
      page: 'tests', spotlight: '[data-tutorial-id="test-card"]', transition: 'cut' },

    { t: 17500, dur: 2000, text: 'Track Every Score', effect: 'subtitle',
      spotlight: '[data-tutorial-id="test-card"]' },

    { t: 19500, dur: 2000, text: 'SWITCH', effect: 'morph',
      theme: 'bloom', transition: 'morph' },

    { t: 21500, dur: 2500, text: 'ASSIGNMENTS', label: 'DEADLINES', effect: 'title',
      page: 'assignments', spotlight: '[data-tutorial-id="assignment-item"]', transition: 'cut' },

    { t: 24000, dur: 2000, text: 'Never Miss a Deadline', effect: 'subtitle',
      spotlight: '[data-tutorial-id="assignment-item"]' },

    { t: 26000, dur: 2500, text: 'PYQ RESEARCH', label: 'PRACTICE', effect: 'title',
      page: 'pyq', spotlight: '[data-tutorial-id="pyq-card"]', transition: 'cut' },

    { t: 28500, dur: 2000, text: 'Practice with Purpose', effect: 'subtitle',
      spotlight: '[data-tutorial-id="pyq-card"]' },

    { t: 30500, dur: 2000, text: 'SWITCH', effect: 'morph',
      theme: 'nebula', transition: 'morph' },

    { t: 37000, dur: 2500, text: 'ANALYTICS', label: 'INSIGHTS', effect: 'title',
      page: 'analytics', spotlight: '[data-tutorial-id="weekly-chart"]', transition: 'cut' },

    { t: 39500, dur: 2000, text: 'Your Patterns, Revealed', effect: 'subtitle',
      spotlight: '[data-tutorial-id="weekly-chart"]' },

    { t: 41500, dur: 2500, text: 'CALCULATOR', label: '75-QUESTION ENGINE', effect: 'title',
      page: 'calculator', spotlight: '[data-tutorial-id="response-sheet"]', transition: 'cut' },

    { t: 44000, dur: 2000, text: 'Score. Analyze. Improve.', effect: 'subtitle',
      spotlight: '[data-tutorial-id="calc-results"]' },

    { t: 46000, dur: 2500, text: 'MOCK TESTS', label: 'EXAM SIMULATION', effect: 'title',
      page: 'mock-tests', spotlight: '[data-tutorial-id="mock-card"]', transition: 'cut' },

    { t: 48500, dur: 2000, text: 'Simulate Exam Day', effect: 'subtitle',
      spotlight: '[data-tutorial-id="mock-card"]' },

    { t: 50500, dur: 3000, text: 'Three Themes.', effect: 'title', position: 'center' },

    { t: 53500, dur: 2500, text: 'One Mission.', effect: 'title', position: 'center' },

    { t: 56000, dur: 3000, sub: 'Good luck.', effect: 'sub-big', position: 'center' },

    { t: 59000, dur: 1000, effect: 'none', page: 'dashboard', transition: 'fade-out' }
  ];

  function buildDOM() {
    if (document.getElementById('cinematic-overlay')) return;

    overlay = document.createElement('div');
    overlay.id = 'cinematic-overlay';
    overlay.className = 'cinematic-overlay';
    overlay.innerHTML = '<div class="cinematic-vignette"></div>';
    document.body.appendChild(overlay);
    vignette = overlay.querySelector('.cinematic-vignette');

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
    skipBtn.innerHTML = 'Skip <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>';
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

    skipBtn.addEventListener('click', function(e) { e.stopPropagation(); skip(); });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && active) skip();
      if (e.key === 'Escape' && pickerVisible) hidePicker();
    });

    buildPicker();
  }

  function buildPicker() {
    if (document.getElementById('cinematic-picker')) return;
    picker = document.createElement('div');
    picker.className = 'cinematic-picker';
    picker.id = 'cinematic-picker';
    picker.innerHTML =
      '<div class="cinematic-picker-inner">' +
        '<div class="cinematic-picker-heading">Choose Your Experience</div>' +
        '<div class="cinematic-picker-title">How should we show you around?</div>' +
        '<div class="cinematic-picker-options">' +
          '<button class="cinematic-picker-btn elegant" data-style="elegant">' +
            '<div class="cinematic-picker-btn-style">Elegant</div>' +
            '<div class="cinematic-picker-btn-sub">Smooth &amp; Refined</div>' +
          '</button>' +
          '<button class="cinematic-picker-btn bold" data-style="bold">' +
            '<div class="cinematic-picker-btn-style">Bold</div>' +
            '<div class="cinematic-picker-btn-sub">Dramatic &amp; Impactful</div>' +
          '</button>' +
        '</div>' +
        '<button class="cinematic-picker-skip">Skip tour</button>' +
      '</div>';
    document.body.appendChild(picker);

    picker.querySelectorAll('.cinematic-picker-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        chosenStyle = btn.getAttribute('data-style');
        localStorage.setItem('cinematicStyle', chosenStyle);
        hidePicker();
        startTour();
      });
    });

    picker.querySelector('.cinematic-picker-skip').addEventListener('click', function() {
      hidePicker();
      skip();
    });
  }

  function showPicker(onDone) {
    pickerVisible = true;
    picker.classList.add('visible');
  }
  function hidePicker() {
    pickerVisible = false;
    picker.classList.remove('visible');
  }

  function clearStage() {
    [titleEl, subEl, labelEl, themeNameEl].forEach(function(el) {
      el.style.animation = 'none';
      el.style.opacity = '0';
      el.textContent = '';
      void el.offsetWidth;
      el.style.animation = '';
    });
    titleEl.className = 'cinematic-title';
    subEl.className = 'cinematic-sub';
    labelEl.className = 'cinematic-label';
    themeNameEl.className = 'cinematic-theme-name';
  }

  function applyEffect(el, scene) {
    var s = chosenStyle || 'elegant';
    var dur, delay;

    el.style.animation = 'none';
    el.style.opacity = '0';
    void el.offsetWidth;

    switch (scene.effect) {
      case 'title':
        if (s === 'bold') {
          dur = '1.4s';
          el.style.animation = 'cin-bold-in ' + dur + ' cubic-bezier(0.16,1,0.3,1) forwards';
        } else {
          dur = '1.2s';
          el.style.animation = 'cin-elegant-in ' + dur + ' cubic-bezier(0.22,1,0.36,1) forwards';
        }
        break;

      case 'subtitle':
        delay = '0.15s';
        if (s === 'bold') {
          dur = '0.9s';
          el.style.animation = 'cin-bold-reveal ' + dur + ' cubic-bezier(0.7,0,0.3,1) ' + delay + ' forwards';
        } else {
          dur = '1s';
          el.style.animation = 'cin-elegant-up ' + dur + ' cubic-bezier(0.22,1,0.36,1) ' + delay + ' forwards';
        }
        break;

      case 'sub':
        dur = '1s';
        delay = '0.2s';
        if (s === 'bold') {
          el.style.animation = 'cin-bold-reveal ' + dur + ' cubic-bezier(0.7,0,0.3,1) ' + delay + ' forwards';
        } else {
          el.style.animation = 'cin-elegant-up ' + dur + ' cubic-bezier(0.22,1,0.36,1) ' + delay + ' forwards';
        }
        break;

      case 'sub-big':
        dur = '1.2s';
        el.style.fontSize = 'clamp(24px, 4vw, 42px)';
        el.style.letterSpacing = '3px';
        if (s === 'bold') {
          el.style.animation = 'cin-bold-glow ' + dur + ' cubic-bezier(0.22,1,0.36,1) forwards';
        } else {
          el.style.animation = 'cin-elegant-in ' + dur + ' cubic-bezier(0.22,1,0.36,1) forwards';
        }
        break;

      case 'morph':
        dur = '1s';
        if (s === 'bold') {
          el.style.animation = 'cin-bold-impact ' + dur + ' ease forwards';
        } else {
          el.style.animation = 'cin-elegant-scale ' + dur + ' cubic-bezier(0.22,1,0.36,1) forwards';
        }
        break;

      default:
        dur = '0.6s';
        el.style.animation = 'cin-fade-in ' + dur + ' ease forwards';
    }
  }

  function showSceneText(scene) {
    clearStage();

    if (scene.text) {
      titleEl.textContent = scene.text;
      applyEffect(titleEl, scene);
    }

    if (scene.sub) {
      subEl.textContent = scene.sub;
      var fakeScene = { effect: scene.effect === 'sub-big' ? 'sub-big' : 'sub' };
      applyEffect(subEl, fakeScene);
    }

    if (scene.label) {
      labelEl.textContent = scene.label;
      var lblScene = { effect: 'subtitle' };
      applyEffect(labelEl, lblScene);
    }
  }

  function hideText() {
    [titleEl, subEl, labelEl, themeNameEl].forEach(function(el) {
      if (el.style.opacity !== '0') {
        el.style.animation = 'cin-fade-out 0.35s ease forwards';
      }
    });
  }

  function positionSpotlight(target) {
    if (!target) { spotlight.classList.remove('active'); return; }
    var el = document.querySelector(target);
    if (!el) { spotlight.classList.remove('active'); return; }

    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });

    setTimeout(function() {
      var rect = el.getBoundingClientRect();
      var pad = 14;
      spotlight.style.top = (rect.top - pad) + 'px';
      spotlight.style.left = (rect.left - pad) + 'px';
      spotlight.style.width = (rect.width + pad * 2) + 'px';
      spotlight.style.height = (rect.height + pad * 2) + 'px';
      spotlight.style.borderRadius = getComputedStyle(el).borderRadius || '8px';
      spotlight.classList.add('active');
    }, 180);
  }

  function hideSpotlight() {
    spotlight.classList.remove('active');
  }

  function switchTheme(theme) {
    var themeMap = { nexus: 0, bloom: 1, nebula: 2 };
    var idx = themeMap[theme];
    if (idx === undefined) return;

    morphFlash.className = 'cinematic-morph-flash ' + theme;
    morphFlash.style.animation = 'cin-morph-flash 0.9s ease forwards';
    setTimeout(function() { morphFlash.style.animation = 'none'; }, 900);

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
      setTimeout(function() { executeScene(scene); }, 80);
    } else if (scene.transition === 'morph') {
      setTimeout(function() { executeScene(scene); }, 120);
    } else {
      executeScene(scene);
    }
  }

  function executeScene(scene) {
    if (scene.page) {
      navigateToPage(scene.page);
      setTimeout(function() { applyVisuals(scene); }, 400);
    } else {
      applyVisuals(scene);
    }
  }

  function applyVisuals(scene) {
    if (scene.theme) switchTheme(scene.theme);
    showSceneText(scene);
    if (scene.spotlight) positionSpotlight(scene.spotlight);
    if (scene.transition === 'fade-out') {
      setTimeout(function() { skip(); }, scene.dur || 1000);
    }
  }

  function startTimeline() {
    _sceneIdx = 0;
    startTime = Date.now();
    var totalDur = SCENES[SCENES.length - 1].t + SCENES[SCENES.length - 1].dur;

    function tick() {
      if (!active) return;
      var elapsed = Date.now() - startTime;
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

  function startTour() {
    active = true;
    _sceneIdx = 0;
    overlay.classList.add('active');
    clearStage();

    spotlight.style.transition = 'none';
    spotlight.style.boxShadow = 'none';
    void spotlight.offsetWidth;
    spotlight.style.transition = '';

    setTimeout(function() {
      startTime = Date.now();
      startTimeline();
    }, 500);
  }

  function play() {
    if (active) return;
    buildDOM();

    if (!chosenStyle) {
      showPicker();
    } else {
      startTour();
    }
  }

  function playAuto() {
    if (active) return;
    buildDOM();

    if (!chosenStyle) {
      showPicker();
    } else {
      startTour();
    }
  }

  function skip() {
    active = false;
    if (_raf) { cancelAnimationFrame(_raf); _raf = null; }

    hideText();
    hideSpotlight();
    clearStage();

    overlay.classList.remove('active');
    spotlight.classList.remove('active');

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
        playAuto();
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
  }

  document.addEventListener('click', function(e) {
    var b = e.target.closest('#cinematic-btn');
    if (b) {
      e.preventDefault();
      e.stopPropagation();
      play();
    }
  });

  bindButton();
  document.addEventListener('DOMContentLoaded', bindButton);

  window.cinematicEngine = {
    play: play,
    skip: skip,
    playIfFirstVisit: playIfFirstVisit
  };
})();
