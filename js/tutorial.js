(function() {
  var AUTO_ADVANCE_MS = 6000;
  var QUICK_STEPS = [
    { page: null, target: '[data-tutorial-id="sidebar"]', title: 'Navigation', desc: 'Your sidebar is the command center. Jump between any page with one click. On mobile, tap the hamburger menu to open it.', placement: 'right' },
    { page: null, target: '[data-tutorial-id="theme-switcher"]', title: 'Themes', desc: 'Toggle between three themes — Nexus, Bloom, and Nebula. Each has its own look and feel. Press T anytime to switch.', placement: 'right' },
    { page: 'dashboard', target: '[data-tutorial-id="stat-cards"]', title: 'Stats at a Glance', desc: 'Your dashboard shows active tasks, chapter progress, test scores, and study hours — all updated in real time as you add data.', placement: 'below' },
    { page: 'chapters', target: '[data-tutorial-id="add-chapter"]', title: 'Manage Syllabus', desc: 'Add chapters to build your syllabus. Toggle completion with the checkbox, set strength levels, and search to find any chapter instantly.', placement: 'below' },
    { page: 'tests', target: '[data-tutorial-id="add-test"]', title: 'Track Tests', desc: 'Log test results with direct marks or detailed per-subject breakdowns. Attach question papers and search through your history.', placement: 'below' },
    { page: 'calculator', target: '[data-tutorial-id="answer-key"]', title: 'JEE Calculator', desc: 'Paste your answer key, mark responses for all 75 questions, and get instant scoring with percentile and subject-wise analysis.', placement: 'below' },
    { page: 'assignments', target: '[data-tutorial-id="add-assignment"]', title: 'Assignments', desc: 'Create tasks with priorities, due dates, and file attachments. Track pending, overdue, and completed work.', placement: 'below' },
    { page: 'pyq', target: '[data-tutorial-id="pyq-card"]', title: 'Practice Questions', desc: 'Filter previous year questions by year and subject. Click any answer for instant feedback — green for correct, red for wrong.', placement: 'above' },
    { page: 'study-log', target: '[data-tutorial-id="start-session"]', title: 'Study Timer', desc: 'Start a timed study session or log manually. Track hours across subjects with a live timer you can pause and resume.', placement: 'below' },
    { page: null, target: null, title: 'You\'re All Set', desc: 'That\'s JEE HQ. Your data saves locally and syncs to the cloud. Press T to switch themes. Press ? to see this tour again. Good luck!', closing: true }
  ];
  var FULL_STEPS = [
    { page: null, target: '[data-tutorial-id="sidebar"]', title: 'Navigation', desc: 'Your sidebar is the command center. Jump between any page with one click. The active page is highlighted with an accent border.', placement: 'right' },
    { page: null, target: '[data-tutorial-id="theme-switcher"]', title: 'Themes', desc: 'Toggle between three themes — Nexus (cyber), Bloom (botanical), and Nebula (cosmic). Each has unique colors, typography, and animations. Press T to switch anytime.', placement: 'right' },
    { page: 'dashboard', target: '[data-tutorial-id="stat-cards"]', title: 'Dashboard Stats', desc: 'Four key metrics at a glance: active tasks, chapter completion, average test score, and weekly study hours. Numbers animate as they load.', placement: 'below' },
    { page: 'dashboard', target: '[data-tutorial-id="subject-progress"]', title: 'Subject Progress', desc: 'Track completion across Physics, Chemistry, and Maths with progress bars. Click any subject card to jump straight to its chapters.', placement: 'above' },
    { page: 'chapters', target: '[data-tutorial-id="add-chapter"]', title: 'Add Chapters', desc: 'Build your syllabus by adding chapters. Select the subject, type the name, and save. Chapters appear grouped by subject below.', placement: 'below' },
    { page: 'chapters', target: '[data-tutorial-id="chapter-item"]', title: 'Chapter Controls', desc: 'Click the checkbox to toggle completion. Click the chapter name to edit or delete. Use the strength badge to mark weak, medium, or strong topics.', placement: 'above' },
    { page: 'chapters', target: '[data-tutorial-id="chapter-search"]', title: 'Search Chapters', desc: 'Filter chapters instantly by typing any part of the name. Works across all subjects at once.', placement: 'below' },
    { page: 'tests', target: '[data-tutorial-id="add-test"]', title: 'Log a Test', desc: 'Record test results in two modes: direct marks for quick entry, or detailed breakdown with per-subject correct/wrong/skipped counts.', placement: 'below' },
    { page: 'tests', target: '[data-tutorial-id="test-card"]', title: 'Test History', desc: 'Every test is saved with scores, subject breakdowns, and attached papers. Scores are color-coded: green for 70%+, amber for 50%+, red below.', placement: 'above' },
    { page: 'tests', target: '[data-tutorial-id="test-search"]', title: 'Search Tests', desc: 'Find any test by name. The search updates results instantly as you type.', placement: 'below' },
    { page: 'analytics', target: '[data-tutorial-id="hero-stats"]', title: 'Study Insights', desc: 'See your weekly hours, daily average over 30 days, best study day, total sessions, and lifetime hours. All calculated automatically.', placement: 'below' },
    { page: 'analytics', target: '[data-tutorial-id="weekly-chart"]', title: 'Weekly Chart', desc: 'Visualize your study patterns with a 7-day bar chart. Quickly spot which days you\'re most and least productive.', placement: 'above' },
    { page: 'calculator', target: '[data-tutorial-id="answer-key"]', title: 'Answer Key', desc: 'Paste your answer key in formats like 1:A, 2:BCD, 3:25. Supports MCQ, integer, and multi-correct questions. Click Apply Key to load.', placement: 'below' },
    { page: 'calculator', target: '[data-tutorial-id="response-sheet"]', title: 'Response Sheet', desc: 'Mark your responses for all 75 questions. Use keyboard shortcuts: A/B/C/D for MCQ, 0-9 for integer, S to skip. Arrow keys navigate between questions.', placement: 'above' },
    { page: 'calculator', target: '[data-tutorial-id="calc-results"]', title: 'Score Analysis', desc: 'Get instant scoring with a visual ring chart, percentile estimate, AIR range, and full per-subject breakdown with progress bars.', placement: 'above' },
    { page: 'assignments', target: '[data-tutorial-id="add-assignment"]', title: 'Add Tasks', desc: 'Create assignments with title, description, priority (High/Medium/Low), syllabus link, due date, and drag-and-drop file attachments.', placement: 'below' },
    { page: 'assignments', target: '[data-tutorial-id="assignment-item"]', title: 'Track Tasks', desc: 'Mark tasks complete with the checkbox. Priority colors show on the left edge. Due dates show status: today, upcoming, or overdue in red.', placement: 'above' },
    { page: 'mock-tests', target: '[data-tutorial-id="add-mock"]', title: 'Log Mock Tests', desc: 'Record full-length practice exams with subject selection, marks, time taken, syllabus covered, and review notes.', placement: 'below' },
    { page: 'mock-tests', target: '[data-tutorial-id="mock-card"]', title: 'Mock History', desc: 'Compare mock test scores over time with subject-wise breakdowns, progress bars, and time tracking.', placement: 'above' },
    { page: 'pyq', target: '[data-tutorial-id="add-pyq"]', title: 'Add PYQs', desc: 'Build your personal question bank with previous year questions. Set subject, year, topic, difficulty, and four answer options.', placement: 'below' },
    { page: 'pyq', target: '[data-tutorial-id="pyq-filters"]', title: 'Filter Questions', desc: 'Narrow down by year and subject using chip filters. Combine filters to focus on specific topics.', placement: 'below' },
    { page: 'pyq', target: '[data-tutorial-id="pyq-card"]', title: 'Practice Mode', desc: 'Click any answer option for instant feedback. Correct answers glow green, wrong ones flash red. Your answers save automatically.', placement: 'above' },
    { page: 'study-log', target: '[data-tutorial-id="start-session"]', title: 'Start a Session', desc: 'Begin a timed study session by selecting subject and topic. The timer runs live — pause when you take breaks, stop when done.', placement: 'below' },
    { page: 'study-log', target: '[data-tutorial-id="live-timer"]', title: 'Live Timer', desc: 'Your session timer shows hours:minutes:seconds in real time. Pause, resume, or stop. Sessions under 3 minutes can be discarded.', placement: 'above' },
    { page: null, target: null, title: 'You\'re All Set', desc: 'That\'s JEE HQ. Your data saves locally and syncs to the cloud. Press T to switch themes. Press ? to see this tour again. Good luck with your prep!', closing: true }
  ];

  var steps = [];
  var current = 0;
  var active = false;
  var autoTimer = null;
  var autoStart = 0;
  var _paused = false;

  var overlay, spotlight, spotlightGlow, callout, calloutArrow, progressFill, skipBtn, timerEl, closingScreen;
  var tourSelectOverlay;

  function buildDOM() {
    if (document.getElementById('tutorial-overlay')) return;

    overlay = document.createElement('div');
    overlay.id = 'tutorial-overlay';
    overlay.className = 'tutorial-overlay';
    overlay.innerHTML = '<div class="tutorial-progress"><div class="tutorial-progress-fill" id="tutorial-progress-fill"></div></div>';
    document.body.appendChild(overlay);

    progressFill = document.getElementById('tutorial-progress-fill');

    spotlight = document.createElement('div');
    spotlight.className = 'tutorial-spotlight';
    spotlightGlow = document.createElement('div');
    spotlightGlow.className = 'tutorial-spotlight-glow';
    spotlight.appendChild(spotlightGlow);
    document.body.appendChild(spotlight);

    callout = document.createElement('div');
    callout.className = 'tutorial-callout';
    callout.innerHTML = '<div class="tutorial-callout-arrow" id="tutorial-arrow"></div>' +
      '<div class="tutorial-callout-header"><span class="tutorial-callout-step" id="tutorial-step-label"></span></div>' +
      '<div class="tutorial-callout-title" id="tutorial-title"></div>' +
      '<div class="tutorial-callout-desc" id="tutorial-desc"></div>' +
      '<div class="tutorial-callout-nav">' +
        '<button class="tutorial-btn tutorial-btn-prev" id="tutorial-prev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 19l-7-7 7-7"/></svg>Back</button>' +
        '<div class="tutorial-callout-nav-center" id="tutorial-dots"></div>' +
        '<button class="tutorial-btn tutorial-btn-next" id="tutorial-next">Next<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5l7 7-7 7"/></svg></button>' +
      '</div>' +
      '<div class="tutorial-timer" id="tutorial-timer"></div>';
    document.body.appendChild(callout);

    calloutArrow = document.getElementById('tutorial-arrow');
    timerEl = document.getElementById('tutorial-timer');

    skipBtn = document.createElement('button');
    skipBtn.className = 'tutorial-skip';
    skipBtn.id = 'tutorial-skip';
    skipBtn.innerHTML = 'Skip <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>';
    document.body.appendChild(skipBtn);

    closingScreen = document.createElement('div');
    closingScreen.className = 'tutorial-closing';
    closingScreen.id = 'tutorial-closing';
    closingScreen.innerHTML = '<div class="tutorial-closing-content">' +
      '<div class="tutorial-closing-icon">🎯</div>' +
      '<h2 id="closing-title"></h2>' +
      '<p id="closing-desc"></p>' +
      '<button class="tutorial-btn tutorial-btn-next" id="tutorial-finish">Got It, Let\'s Go!<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>' +
      '</div>';
    document.body.appendChild(closingScreen);

    bindEvents();
  }

  function buildTourSelect() {
    tourSelectOverlay = document.createElement('div');
    tourSelectOverlay.className = 'tour-select-overlay';
    tourSelectOverlay.id = 'tour-select';
    tourSelectOverlay.innerHTML =
      '<div class="tour-select-modal">' +
        '<h2>Choose Your Tour</h2>' +
        '<p class="tour-subtitle">Let us show you around JEE HQ</p>' +
        '<div class="tour-options">' +
          '<div class="tour-option" data-tour="quick">' +
            '<div class="tour-option-icon">⚡</div>' +
            '<div class="tour-option-title">Quick Tour</div>' +
            '<div class="tour-option-meta">10 steps · ~2 min</div>' +
          '</div>' +
          '<div class="tour-option" data-tour="full">' +
            '<div class="tour-option-icon">🎯</div>' +
            '<div class="tour-option-title">Full Tour</div>' +
            '<div class="tour-option-meta">24 steps · ~5 min</div>' +
          '</div>' +
        '</div>' +
        '<button class="tour-dismiss" id="tour-dismiss">Maybe Later</button>' +
      '</div>';
    document.body.appendChild(tourSelectOverlay);
  }

  function bindEvents() {
    document.getElementById('tutorial-next').addEventListener('click', function() { next(); });
    document.getElementById('tutorial-prev').addEventListener('click', function() { prev(); });
    document.getElementById('tutorial-skip').addEventListener('click', function() { skip(); });
    document.getElementById('tutorial-finish').addEventListener('click', function() { skip(); });

    tourSelectOverlay.querySelector('[data-tour="quick"]').addEventListener('click', function() { startTour('quick'); });
    tourSelectOverlay.querySelector('[data-tour="full"]').addEventListener('click', function() { startTour('full'); });
    document.getElementById('tour-dismiss').addEventListener('click', function() { hideTourSelect(); });

    callout.addEventListener('mouseenter', function() { if (active) _paused = true; });
    callout.addEventListener('mouseleave', function() { if (active) { _paused = false; resetAutoTimer(); } });

    if ('ontouchstart' in window) {
      var touchStartX = 0;
      callout.addEventListener('touchstart', function(e) { touchStartX = e.touches[0].clientX; }, { passive: true });
      callout.addEventListener('touchend', function(e) {
        var dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 50) {
          if (dx < 0) next(); else prev();
        }
      }, { passive: true });
    }
  }

  function bindGlobalEvents() {
    document.addEventListener('click', function(e) {
      var btn = e.target.closest('#tutorial-btn');
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        showTourSelect();
        return;
      }
      if (tourSelectOverlay && tourSelectOverlay.classList.contains('visible')) {
        var option = e.target.closest('[data-tour]');
        if (option) { startTour(option.getAttribute('data-tour')); return; }
        var dismiss = e.target.closest('#tour-dismiss');
        if (dismiss) { hideTourSelect(); return; }
      }
    });

    document.addEventListener('keydown', function(e) {
      if (tourSelectOverlay && tourSelectOverlay.classList.contains('visible')) {
        if (e.key === 'Escape') hideTourSelect();
        return;
      }
      if (!active) {
        if (e.key === '?') { e.preventDefault(); showTourSelect(); }
        return;
      }
      if (e.key === 'Escape') { skip(); }
      else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); next(); }
      else if (e.key === 'ArrowRight') { next(); }
      else if (e.key === 'ArrowLeft') { prev(); }
    });
  }

  function showTourSelect() {
    tourSelectOverlay.style.display = 'flex';
    requestAnimationFrame(function() { tourSelectOverlay.classList.add('visible'); });
  }

  function hideTourSelect() {
    tourSelectOverlay.classList.remove('visible');
    setTimeout(function() { tourSelectOverlay.style.display = 'none'; }, 350);
  }

  function startTour(mode) {
    steps = mode === 'quick' ? QUICK_STEPS : FULL_STEPS;
    hideTourSelect();
    setTimeout(function() { init(); }, 350);
  }

  function init() {
    buildDOM();
    current = 0;
    active = true;
    _paused = false;
    overlay.classList.add('active');
    skipBtn.style.display = '';
    closingScreen.classList.remove('visible');
    buildDots();
    showStep(0);
  }

  function buildDots() {
    var dotsContainer = document.getElementById('tutorial-dots');
    var visibleCount = Math.min(steps.length, 7);
    dotsContainer.innerHTML = '';
    for (var i = 0; i < visibleCount; i++) {
      var dot = document.createElement('div');
      dot.className = 'tutorial-callout-dot';
      dotsContainer.appendChild(dot);
    }
    updateDots();
  }

  function updateDots() {
    var dots = callout.querySelectorAll('.tutorial-callout-dot');
    var total = steps.length;
    var visibleCount = dots.length;
    if (total <= visibleCount) {
      dots.forEach(function(d, i) { d.classList.toggle('active', i === current); });
    } else {
      var start = Math.max(0, Math.min(current - Math.floor(visibleCount / 2), total - visibleCount));
      dots.forEach(function(d, i) {
        var stepIdx = start + i;
        d.classList.toggle('active', stepIdx === current);
        d.style.display = stepIdx < total ? '' : 'none';
      });
    }
  }

  function showStep(idx) {
    if (idx < 0 || idx >= steps.length) return;
    current = idx;
    var step = steps[current];

    if (step.closing) {
      showClosing(step);
      return;
    }

    closingScreen.classList.remove('visible');
    closingScreen.style.display = 'none';

    if (step.page) {
      var currentHash = (window.location.hash || '').replace('#/', '').replace('#', '');
      if (currentHash !== step.page) {
        window.location.hash = '#/' + step.page;
        setTimeout(function() { highlightStep(step); }, 400);
      } else {
        highlightStep(step);
      }
    } else {
      highlightStep(step);
    }

    document.getElementById('tutorial-step-label').textContent = (current + 1) + ' of ' + steps.length;
    document.getElementById('tutorial-title').textContent = step.title;
    document.getElementById('tutorial-desc').textContent = step.desc;

    var prevBtn = document.getElementById('tutorial-prev');
    prevBtn.style.visibility = current > 0 ? 'visible' : 'hidden';

    var nextBtn = document.getElementById('tutorial-next');
    if (current === steps.length - 1) {
      nextBtn.innerHTML = 'Done<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
      nextBtn.classList.add('finish');
    } else {
      nextBtn.innerHTML = 'Next<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5l7 7-7 7"/></svg>';
      nextBtn.classList.remove('finish');
    }

    progressFill.style.width = ((current + 1) / steps.length * 100) + '%';
    updateDots();
    resetAutoTimer();
  }

  function highlightStep(step) {
    var el = document.querySelector(step.target);
    if (!el) {
      spotlight.classList.remove('active');
      callout.classList.remove('visible');
      positionCalloutFallback(step);
      return;
    }

    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });

    setTimeout(function() {
      var rect = el.getBoundingClientRect();
      var pad = 8;
      spotlight.style.top = (rect.top - pad) + 'px';
      spotlight.style.left = (rect.left - pad) + 'px';
      spotlight.style.width = (rect.width + pad * 2) + 'px';
      spotlight.style.height = (rect.height + pad * 2) + 'px';
      spotlight.style.borderRadius = getComputedStyle(el).borderRadius || '8px';
      spotlight.classList.add('active');

      el.classList.add('tutorial-highlight-pulse');
      setTimeout(function() { el.classList.remove('tutorial-highlight-pulse'); }, 1500);

      positionCallout(rect, step.placement || 'below');
    }, 100);
  }

  function positionCallout(spotRect, placement) {
    var cW = Math.min(380, window.innerWidth * 0.88);
    var cH = callout.offsetHeight || 180;
    var gap = 16;
    var top, left, arrowLeft;

    callout.classList.remove('above', 'below');

    if (window.innerWidth <= 768) {
      callout.classList.add('below');
      callout.style.top = '';
      callout.style.left = '';
      callout.style.bottom = '0';
      callout.style.right = '0';
      callout.style.width = '100%';
      calloutArrow.style.display = 'none';
      callout.classList.add('visible');
      resetAutoTimer();
      return;
    }

    calloutArrow.style.display = '';

    if (placement === 'right') {
      top = spotRect.top + spotRect.height / 2 - cH / 2;
      left = spotRect.right + gap;
      if (left + cW > window.innerWidth - 20) {
        left = spotRect.left - cW - gap;
        if (left < 20) { placement = 'below'; }
      }
      if (top < 20) top = 20;
      if (top + cH > window.innerHeight - 20) top = window.innerHeight - cH - 20;
    }

    if (placement === 'below' || placement === 'above') {
      left = spotRect.left + spotRect.width / 2 - cW / 2;
      if (left < 20) left = 20;
      if (left + cW > window.innerWidth - 20) left = window.innerWidth - cW - 20;

      if (placement === 'below') {
        top = spotRect.bottom + gap;
        if (top + cH > window.innerHeight - 20) {
          top = spotRect.top - cH - gap;
          placement = 'above';
        }
      } else {
        top = spotRect.top - cH - gap;
        if (top < 20) {
          top = spotRect.bottom + gap;
          placement = 'below';
        }
      }
    }

    callout.classList.add(placement);
    callout.style.top = top + 'px';
    callout.style.left = left + 'px';
    callout.style.width = cW + 'px';
    callout.style.bottom = '';
    callout.style.right = '';

    arrowLeft = spotRect.left + spotRect.width / 2 - left;
    arrowLeft = Math.max(16, Math.min(cW - 16, arrowLeft));
    calloutArrow.style.left = arrowLeft + 'px';
    calloutArrow.style.marginLeft = '-7px';

    requestAnimationFrame(function() { callout.classList.add('visible'); });
    resetAutoTimer();
  }

  function positionCalloutFallback(step) {
    callout.classList.remove('above');
    callout.classList.add('below');
    if (window.innerWidth <= 768) {
      callout.style.top = '';
      callout.style.left = '';
      callout.style.bottom = '0';
      callout.style.right = '0';
      callout.style.width = '100%';
    } else {
      var cW = Math.min(380, window.innerWidth * 0.88);
      callout.style.top = '50%';
      callout.style.left = '50%';
      callout.style.transform = 'translate(-50%, -50%)';
      callout.style.width = cW + 'px';
      callout.style.bottom = '';
      callout.style.right = '';
    }
    calloutArrow.style.display = 'none';
    requestAnimationFrame(function() { callout.classList.add('visible'); });
    resetAutoTimer();
  }

  function showClosing(step) {
    spotlight.classList.remove('active');
    callout.classList.remove('visible');
    closingScreen.style.display = 'flex';
    document.getElementById('closing-title').textContent = step.title;
    document.getElementById('closing-desc').textContent = step.desc;
    requestAnimationFrame(function() { closingScreen.classList.add('visible'); });
    progressFill.style.width = '100%';
    clearAutoTimer();
  }

  function next() {
    if (!active) return;
    if (current < steps.length - 1) {
      showStep(current + 1);
    } else {
      skip();
    }
  }

  function prev() {
    if (!active || current <= 0) return;
    showStep(current - 1);
  }

  function skip() {
    active = false;
    _paused = false;
    clearAutoTimer();
    overlay.classList.remove('active');
    spotlight.classList.remove('active');
    callout.classList.remove('visible');
    closingScreen.classList.remove('visible');
    closingScreen.style.display = 'none';
    setTimeout(function() {
      closingScreen.style.display = 'none';
      callout.style.transform = '';
      callout.style.top = '';
      callout.style.left = '';
      callout.style.width = '';
      callout.style.bottom = '';
      callout.style.right = '';
    }, 400);
  }

  function resetAutoTimer() {
    clearAutoTimer();
    if (_paused) return;
    autoStart = Date.now();
    timerEl.style.width = '100%';
    var tick = function() {
      if (!active || _paused) return;
      var elapsed = Date.now() - autoStart;
      var pct = Math.max(0, 100 - (elapsed / AUTO_ADVANCE_MS * 100));
      timerEl.style.width = pct + '%';
      if (elapsed >= AUTO_ADVANCE_MS) {
        next();
        return;
      }
      autoTimer = requestAnimationFrame(tick);
    };
    autoTimer = requestAnimationFrame(tick);
  }

  function clearAutoTimer() {
    if (autoTimer) { cancelAnimationFrame(autoTimer); autoTimer = null; }
    timerEl.style.width = '0%';
  }

  window.tutorialEngine = {
    show: showTourSelect,
    start: function(mode) { startTour(mode || 'quick'); },
    skip: skip
  };

  buildTourSelect();
  bindGlobalEvents();
})();
