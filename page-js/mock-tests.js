// page-js/mock-tests.js — Mock Tests page with Custom Test feature
(function() {
  function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
  function fmtDate(d) { return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }); }
  function safePct(a, b) { return b > 0 ? Math.round((a / b) * 100) : 0; }

  function fmtTime(sec) { var m = Math.floor(sec / 60); var s = sec % 60; return m + ':' + (s < 10 ? '0' : '') + s; }
  var FORMAT_TEMPLATE = 'What is 2+2?\nA) 3\nB) 4\nC) 5\nD) 6\nAnswer: B';

  const SUBJECT_ICONS = {
    physics: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    chemistry: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6v11l4 5H5l4-5V3z"/><line x1="9" y1="3" x2="15" y2="3"/></svg>',
    maths: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20L20 4"/><path d="M15 4h5v5"/><path d="M4 20l5-5"/></svg>'
  };

  function subjectBreakdown(test, key) {
    const data = test[key] || { correct: 0, incorrect: 0, unattempted: 0 };
    const total = data.correct + data.incorrect + data.unattempted;
    const score = Math.max(0, data.correct * 4 - data.incorrect);
    const maxS = total * 4;
    const pct = safePct(Math.max(0, score), maxS);
    return `<div style="flex:1;min-width:120px">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
        <span style="opacity:0.7">${SUBJECT_ICONS[key]}</span>
        <span style="font-size:12px;font-weight:600">${key.charAt(0).toUpperCase() + key.slice(1)}</span>
      </div>
      <div style="font-size:20px;font-weight:700">${score}<span style="font-size:12px;font-weight:400;opacity:0.5">/${maxS}</span></div>
      <div class="progress-wrap" style="height:4px;margin-top:6px"><div class="progress-bar" style="height:4px;width:${pct}%"></div></div>
      <div style="font-size:10px;color:var(--muted);margin-top:4px">${data.correct}C ${data.incorrect}W ${data.unattempted || 0}S</div>
    </div>`;
  }

  function mockCard(t, i) {
    const total = (((t.physics||{}).correct||0)*4 - ((t.physics||{}).incorrect||0)) + (((t.chemistry||{}).correct||0)*4 - ((t.chemistry||{}).incorrect||0)) + (((t.maths||{}).correct||0)*4 - ((t.maths||{}).incorrect||0));
    const maxScore = t.total || 300;
    const pct = safePct(Math.max(0, total), maxScore);
    const color = pct >= 70 ? 'var(--success)' : pct >= 50 ? 'var(--accent)' : 'var(--danger)';
    const isCustom = t.customTest;
    const badge = isCustom ? `<span style="font-size:9px;padding:2px 6px;border-radius:4px;background:var(--accent-bg);color:var(--accent);font-weight:600;margin-left:6px">CUSTOM</span>` : '';

    return `<div class="card anim-entrance" style="--delay:${i * 0.04}s;padding:0;overflow:hidden">
      <div style="padding:16px 18px">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
          <div style="flex:1;min-width:0">
            <div style="font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(t.name || 'Mock Test')}${badge}</div>
            <div style="font-size:11px;color:var(--muted)">${fmtDate(t.date)}${t.syllabus ? ' · ' + esc(t.syllabus) : ''}</div>
          </div>
          <div style="text-align:right;flex-shrink:0">
            <div style="font-size:20px;font-weight:700;color:${color}">${Math.max(0, total)}</div>
            <div style="font-size:10px;color:var(--muted)">/${maxScore}</div>
          </div>
        </div>
        ${isCustom && t.results ? `<div style="display:flex;gap:12px;font-size:11px;color:var(--muted);margin-bottom:10px">
          <span style="color:var(--success)">${t.results.totalCorrect} correct</span>
          <span style="color:var(--danger)">${t.results.totalWrong} wrong</span>
          <span>${t.results.totalSkipped} skipped</span>
          <span>${fmtTime(t.results.totalTime)} taken</span>
        </div>` : `<div style="display:flex;gap:8px;margin-bottom:12px">
          ${subjectBreakdown(t, 'physics')}
          ${subjectBreakdown(t, 'chemistry')}
          ${subjectBreakdown(t, 'maths')}
        </div>`}
        ${t.time ? `<div style="font-size:11px;color:var(--muted);margin-bottom:8px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${t.time} minutes</div>` : ''}
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-xs btn-danger" onclick="window.delMockTest('${t.id}')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Delete
          </button>
        </div>
      </div>
    </div>`;
  }

  /* ═══════════════ MAIN RENDER ═══════════════ */
  window.renderMockTests = function(el) {
    if (!el) return;
    const DB = window.DB;
    if (!DB) { el.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-muted)">Loading data...</div>'; return; }
    const tests = DB.mockTests || [];
    const avg = tests.length ? Math.round(tests.reduce((s, t) => {
      const total = (((t.physics||{}).correct||0)*4 - ((t.physics||{}).incorrect||0)) + (((t.chemistry||{}).correct||0)*4 - ((t.chemistry||{}).incorrect||0)) + (((t.maths||{}).correct||0)*4 - ((t.maths||{}).incorrect||0));
      const max = t.total || 300;
      return s + safePct(Math.max(0, total), max);
    }, 0) / tests.length) : 0;

    el.innerHTML = `
    <div class="page-header anim-entrance" style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px">
      <div>
        <div class="page-title" data-text="Mock Tests">Mock Tests</div>
        <div class="page-sub">Full-length practice exams</div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-primary" onclick="window.startCustomMockSetup()">+ Create Custom Test</button>
        <button class="btn btn-primary" onclick="window.openAddMockTest()">+ Log Manual</button>
      </div>
    </div>
    <div class="stats-grid anim-entrance" style="--delay:0.1s">
      <div class="stat-card">
        <div class="stat-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></div>
        <div class="stat-val"><span data-count="${tests.length}">0</span></div>
        <div class="stat-label">Total Mocks</div>
        <div class="stat-sub">All time</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="color:var(--accent)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
        <div class="stat-val" style="color:var(--accent)"><span data-count="${avg}">0</span>%</div>
        <div class="stat-label">Average Score</div>
        <div class="stat-sub">Across all mocks</div>
      </div>
    </div>
    <div class="section-block anim-entrance" style="--delay:0.2s">
      <div class="section-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> Mock Test History</div>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${tests.length === 0
          ? `<div class="empty" style="padding:32px">
              <div class="empty-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></div>
              <div class="empty-title">No mock tests yet</div>
              <div class="empty-sub">Create a custom test or log a manual result</div>
            </div>`
          : [...tests].sort((a, b) => new Date(b.date) - new Date(a.date)).map((t, i) => mockCard(t, i)).join('')}
      </div>
    </div>`;
  };

  /* ═══════════════ CUSTOM MOCK SETUP ═══════════════ */
  window.startCustomMockSetup = function() {
    var el = document.getElementById('content-wrap');
    if (!el) return;

    el.innerHTML = `
    <div class="page-header anim-entrance" style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px">
      <div>
        <div class="page-title" data-text="Create Custom Test">Create Custom Test</div>
        <div class="page-sub">Paste your questions and set a timer</div>
      </div>
      <button class="btn btn-ghost" data-cm-back><i class="fas fa-arrow-left"></i> Back</button>
    </div>
    <div class="card anim-entrance" style="--delay:0.1s;padding:20px">
      <div class="cm-form">
        <div class="fg">
          <label>Test Name</label>
          <input class="inp" id="cm-name" type="text" placeholder="e.g. JEE Physics Mock 1" />
        </div>
        <div class="g2">
          <div class="fg">
            <label>Mode</label>
            <div style="display:flex;gap:4px">
              <button class="btn btn-primary" style="flex:1" data-cm-mode="exam" id="cm-mode-exam">Exam</button>
              <button class="btn btn-ghost" style="flex:1" data-cm-mode="practice" id="cm-mode-practice">Practice</button>
            </div>
          </div>
          <div class="fg">
            <label>Time Limit (minutes, 0 = unlimited)</label>
            <input class="inp" id="cm-time" type="number" min="0" value="75" />
          </div>
        </div>
        <div class="fg">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--sp-1)">
            <label style="margin:0">Questions</label>
            <button class="btn btn-xs btn-ghost" id="cm-copy-format" type="button"><i class="fas fa-copy"></i> Copy Format</button>
          </div>
          <textarea class="inp" id="cm-questions" rows="10" style="font-family:var(--font-data);font-size:12px;line-height:1.6;tab-size:2" placeholder="Paste questions in this format:

What is 2+2?
A) 3
B) 4
C) 5
D) 6
Answer: B

Solve x² - 5x + 6 = 0
A) x=1, x=6
B) x=2, x=3
C) x=-2, x=-3
D) x=1, x=5
Answer: B"></textarea>
          <div class="cm-parse-status" id="cm-parse-status"></div>
        </div>
        <button class="btn btn-primary" style="width:100%;padding:12px;font-size:14px" id="cm-start" disabled>Start Test <i class="fas fa-play"></i></button>
      </div>
    </div>`;

    var mode = 'exam';
    var parsed = [];

    el.querySelector('[data-cm-back]').addEventListener('click', function() { window.renderMockTests(el); });

    el.querySelector('#cm-copy-format').addEventListener('click', function() {
      navigator.clipboard.writeText(FORMAT_TEMPLATE).then(function() {
        window.toast && window.toast('Format copied to clipboard!');
      }).catch(function() {
        var ta = document.createElement('textarea');
        ta.value = FORMAT_TEMPLATE;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        window.toast && window.toast('Format copied!');
      });
    });

    el.querySelectorAll('[data-cm-mode]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        mode = btn.getAttribute('data-cm-mode');
        el.querySelectorAll('[data-cm-mode]').forEach(function(b) {
          b.className = 'btn btn-ghost';
          b.style.flex = '1';
        });
        btn.className = 'btn btn-primary';
        btn.style.flex = '1';
      });
    });

    el.querySelector('#cm-questions').addEventListener('input', function() {
      var raw = el.querySelector('#cm-questions').value;
      parsed = parseQuestions(raw);
      var status = el.querySelector('#cm-parse-status');
      var startBtn = el.querySelector('#cm-start');
      if (parsed.length > 0) {
        status.className = 'cm-parse-status cm-parse-ok';
        status.textContent = parsed.length + ' question' + (parsed.length > 1 ? 's' : '') + ' parsed successfully';
        startBtn.disabled = false;
      } else {
        status.className = 'cm-parse-status cm-parse-err';
        status.textContent = raw.trim() ? 'No valid questions found. Check the format.' : '';
        startBtn.disabled = true;
      }
    });

    el.querySelector('#cm-start').addEventListener('click', function() {
      if (parsed.length === 0) return;
      var name = el.querySelector('#cm-name').value.trim() || 'Custom Test';
      var timeLimit = parseInt(el.querySelector('#cm-time').value) || 0;
      startExam({ name: name, mode: mode, timeLimit: timeLimit, questions: parsed });
    });
  };

  /* ═══════════════ TEXTAREA PARSER ═══════════════ */
  function parseQuestions(raw) {
    var blocks = raw.split(/\n\s*\n/);
    var questions = [];
    for (var b = 0; b < blocks.length; b++) {
      var lines = blocks[b].split('\n').map(function(l) { return l.trim(); }).filter(function(l) { return l.length > 0; });
      if (lines.length < 3) continue;
      var qText = [], opts = [], ans = -1;
      for (var l = 0; l < lines.length; l++) {
        var line = lines[l];
        var ansMatch = line.match(/^Answer:\s*([A-Da-d])/i);
        if (ansMatch) {
          ans = ansMatch[1].toUpperCase().charCodeAt(0) - 65;
          continue;
        }
        var optMatch = line.match(/^([A-D])\)\s*(.+)/i);
        if (optMatch) {
          opts.push(optMatch[2].trim());
          continue;
        }
        qText.push(line);
      }
      if (qText.length > 0 && opts.length === 4 && ans >= 0 && ans <= 3) {
        questions.push({ q: qText.join(' '), opts: opts, ans: ans });
      }
    }
    return questions;
  }

  /* ═══════════════ EXAM ENGINE ═══════════════ */
  function startExam(config) {
    var el = document.getElementById('content-wrap');
    if (!el) return;
    var questions = config.questions;
    var mode = config.mode;
    var timeLimit = config.timeLimit; // minutes
    var totalSeconds = timeLimit * 60;
    var timeLeft = totalSeconds;
    var timer = null;
    var currentQ = 0;
    var answers = new Array(questions.length).fill(-1); // -1 = unanswered
    var startTime = Date.now();
    var qTimes = new Array(questions.length).fill(0);
    var qStart = Date.now();
    var paused = false;
    var finished = false;

    renderExam();
    startTimer();

    function renderExam() {
      var q = questions[currentQ];
      var answered = answers[currentQ] >= 0;
      var letters = ['A', 'B', 'C', 'D'];

      var paletteHtml = '';
      for (var i = 0; i < questions.length; i++) {
        var cls = i === currentQ ? 'current' : answers[i] >= 0 ? 'answered' : '';
        paletteHtml += '<div class="cm-palette-cell ' + cls + '" data-cm-goto="' + i + '">' + (i + 1) + '</div>';
      }

      var timeDisplay = timeLimit > 0 ? fmtTime(timeLeft) : fmtTime(Math.floor((Date.now() - startTime) / 1000));
      var timePct = timeLimit > 0 ? (timeLeft / totalSeconds * 100) : 100;
      var timerDanger = timeLimit > 0 && timeLeft <= 300;

      var optsHtml = q.opts.map(function(o, i) {
        var cls = '';
        if (answers[currentQ] === i) cls = 'selected';
        return '<div class="cm-option ' + cls + '" data-cm-opt="' + i + '">' +
          '<div class="cm-opt-letter">' + letters[i] + '</div>' +
          '<div class="cm-opt-text">' + esc(o) + '</div>' +
        '</div>';
      }).join('');

      var feedbackHtml = '';
      if (mode === 'practice' && answered) {
        var isCorrect = answers[currentQ] === q.ans;
        feedbackHtml = '<div class="cm-feedback ' + (isCorrect ? 'cm-fb-correct' : 'cm-fb-wrong') + '">' +
          (isCorrect ? 'Correct!' : 'Wrong! Answer: ' + letters[q.ans]) + '</div>';
      }

      var submitCount = answers.filter(function(a) { return a >= 0; }).length;
      var unattempted = questions.length - submitCount;

      el.innerHTML = `
      <div class="cm-exam">
        <div class="cm-exam-main">
          <div class="cm-topbar">
            <div class="cm-top-left">
              <span class="cm-qnum">Q${currentQ + 1}</span>
              <span class="cm-qof">/ ${questions.length}</span>
            </div>
            <div class="cm-top-right">
              <span class="cm-score-disp">${submitCount} answered</span>
              ${timeLimit > 0 ? '<span class="cm-score-disp" style="color:' + (timerDanger ? 'var(--danger)' : 'inherit') + '">' + timeDisplay + '</span>' : '<span class="cm-score-disp">' + timeDisplay + '</span>'}
            </div>
          </div>
          ${timeLimit > 0 ? '<div class="cm-timer-wrap"><div class="cm-timer-track"><div class="cm-timer-fill ' + (timerDanger ? 'danger' : '') + '" id="cm-timer-bar" style="width:' + timePct + '%"></div></div></div>' : ''}
          <div class="cm-question">${esc(q.q)}</div>
          <div class="cm-options">${optsHtml}</div>
          ${feedbackHtml}
          <div class="cm-exam-footer">
            <button class="cm-submit-btn" data-cm-submit><i class="fas fa-paper-plane"></i> Submit Test (${unattempted} unattempted)</button>
            <div class="cm-nav">
              <button class="cm-nav-btn btn btn-ghost" data-cm-prev ${currentQ === 0 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i> Prev</button>
              ${currentQ < questions.length - 1
                ? '<button class="cm-nav-btn btn btn-primary" data-cm-next>Next <i class="fas fa-chevron-right"></i></button>'
                : '<button class="cm-nav-btn btn btn-primary" data-cm-finish>Finish <i class="fas fa-check"></i></button>'
              }
            </div>
          </div>
        </div>
        <div class="cm-exam-side">
          <div class="cm-palette">
            <div class="cm-palette-title">Questions</div>
            <div class="cm-palette-grid">${paletteHtml}</div>
            <div class="cm-palette-legend">
              <div class="cm-legend-item"><div class="cm-legend-dot" style="background:var(--success)"></div> Answered</div>
              <div class="cm-legend-item"><div class="cm-legend-dot" style="background:var(--border)"></div> Unanswered</div>
              <div class="cm-legend-item"><div class="cm-legend-dot" style="background:var(--accent)"></div> Current</div>
            </div>
          </div>
        </div>
      </div>
      <button class="cm-palette-toggle" id="cm-palette-toggle"><i class="fas fa-th"></i></button>
      <div class="cm-palette-overlay" id="cm-palette-overlay"></div>
      <div class="cm-palette-drawer" id="cm-palette-drawer">
        <div class="cm-palette-drawer-title">Questions <span class="cm-palette-close" id="cm-palette-close">&times;</span></div>
        <div class="cm-drawer-grid" id="cm-drawer-grid"></div>
      </div>`;

      // Render drawer grid
      var drawerGrid = el.querySelector('#cm-drawer-grid');
      if (drawerGrid) {
        var dh = '';
        for (var i = 0; i < questions.length; i++) {
          var cls = i === currentQ ? 'current' : answers[i] >= 0 ? 'answered' : '';
          dh += '<div class="cm-drawer-cell ' + cls + '" data-cm-goto="' + i + '">' + (i + 1) + '</div>';
        }
        drawerGrid.innerHTML = dh;
      }

      bindExamEvents();
    }

    function bindExamEvents() {
      el.querySelectorAll('[data-cm-opt]').forEach(function(opt) {
        opt.addEventListener('click', function() {
          if (finished) return;
          var idx = parseInt(opt.getAttribute('data-cm-opt'));
          if (mode === 'practice' && answers[currentQ] >= 0) return; // already answered in practice
          answers[currentQ] = idx;
          qTimes[currentQ] += Math.floor((Date.now() - qStart) / 1000);
          qStart = Date.now();
          renderExam();
          if (mode === 'practice') {
            // Auto advance after 1.5s in practice mode
            setTimeout(function() {
              if (currentQ < questions.length - 1 && !finished) {
                currentQ++;
                qStart = Date.now();
                renderExam();
              }
            }, 1500);
          }
        });
      });

      var prevBtn = el.querySelector('[data-cm-prev]');
      if (prevBtn) prevBtn.addEventListener('click', function() {
        if (currentQ > 0) { currentQ--; qStart = Date.now(); renderExam(); }
      });

      var nextBtn = el.querySelector('[data-cm-next]');
      if (nextBtn) nextBtn.addEventListener('click', function() {
        if (currentQ < questions.length - 1) { currentQ++; qStart = Date.now(); renderExam(); }
      });

      var finishBtn = el.querySelector('[data-cm-finish]');
      if (finishBtn) finishBtn.addEventListener('click', function() { showConfirm(); });

      var submitBtn = el.querySelector('[data-cm-submit"]');
      if (submitBtn) submitBtn.addEventListener('click', function() { showConfirm(); });

      el.querySelectorAll('[data-cm-goto]').forEach(function(cell) {
        cell.addEventListener('click', function() {
          currentQ = parseInt(cell.getAttribute('data-cm-goto'));
          qStart = Date.now();
          renderExam();
          closeDrawer();
        });
      });

      // Palette toggle
      var toggleBtn = el.querySelector('#cm-palette-toggle');
      var overlay = el.querySelector('#cm-palette-overlay');
      var drawer = el.querySelector('#cm-palette-drawer');
      var closeBtn = el.querySelector('#cm-palette-close');

      if (toggleBtn) toggleBtn.addEventListener('click', function() {
        if (drawer) drawer.classList.add('open');
        if (overlay) overlay.style.display = 'block';
      });
      function closeDrawer() {
        if (drawer) drawer.classList.remove('open');
        if (overlay) overlay.style.display = 'none';
      }
      if (overlay) overlay.addEventListener('click', closeDrawer);
      if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    }

    function showConfirm() {
      var unanswered = answers.filter(function(a) { return a < 0; }).length;
      var overlay = document.createElement('div');
      overlay.className = 'cm-confirm-overlay';
      overlay.innerHTML = `
        <div class="cm-confirm-box">
          <div class="cm-confirm-title">Submit Test?</div>
          <div class="cm-confirm-msg">${unanswered > 0 ? unanswered + ' question' + (unanswered > 1 ? 's' : '') + ' unattempted. ' : ''}Are you sure you want to submit?</div>
          <div class="cm-confirm-actions">
            <button class="btn btn-ghost" data-cm-cancel>Cancel</button>
            <button class="btn btn-primary" data-cm-confirm>Submit</button>
          </div>
        </div>`;
      document.body.appendChild(overlay);
      overlay.querySelector('[data-cm-cancel]').addEventListener('click', function() { overlay.remove(); });
      overlay.querySelector('[data-cm-confirm]').addEventListener('click', function() { overlay.remove(); finishExam(); });
    }

    function startTimer() {
      timer = setInterval(function() {
        if (finished || paused) return;
        if (timeLimit > 0) {
          timeLeft--;
          var bar = document.getElementById('cm-timer-bar');
          if (bar) {
            bar.style.width = (timeLeft / totalSeconds * 100) + '%';
            if (timeLeft <= 300) bar.classList.add('danger');
          }
          // Update time display in topbar
          var timeEls = el.querySelectorAll('.cm-score-disp');
          if (timeEls.length > 1) {
            timeEls[1].textContent = fmtTime(timeLeft);
            if (timeLeft <= 300) timeEls[1].style.color = 'var(--danger)';
          }
          if (timeLeft <= 0) {
            clearInterval(timer);
            showTimeUp();
          }
        }
      }, 1000);
    }

    function showTimeUp() {
      finished = true;
      var overlay = document.createElement('div');
      overlay.className = 'cm-timeup-overlay';
      overlay.innerHTML = `
        <div class="cm-timeup-text">Time's Up!</div>
        <div class="cm-timeup-sub">Submitting your answers...</div>`;
      document.body.appendChild(overlay);
      setTimeout(function() { overlay.remove(); finishExam(); }, 2000);
    }

    function finishExam() {
      finished = true;
      clearInterval(timer);

      // Calculate final times
      var totalTime = Math.floor((Date.now() - startTime) / 1000);
      qTimes[currentQ] += Math.floor((Date.now() - qStart) / 1000);

      // Score: +4 correct, -1 wrong, 0 unattempted (JEE style)
      var totalCorrect = 0, totalWrong = 0, totalSkipped = 0;
      var score = 0;
      var maxScore = questions.length * 4;
      var results = [];

      for (var i = 0; i < questions.length; i++) {
        var q = questions[i];
        var sel = answers[i];
        var isCorrect = sel === q.ans;
        var isSkipped = sel < 0;
        if (isSkipped) { totalSkipped++; }
        else if (isCorrect) { totalCorrect++; score += 4; }
        else { totalWrong++; score -= 1; }
        results.push({ selected: sel, correct: isCorrect, timeSpent: qTimes[i] || 0 });
      }

      showAnalysis({
        name: config.name,
        mode: config.mode,
        questions: questions,
        answers: answers,
        results: results,
        score: Math.max(0, score),
        maxScore: maxScore,
        totalCorrect: totalCorrect,
        totalWrong: totalWrong,
        totalSkipped: totalSkipped,
        totalTime: totalTime,
        timeLimit: timeLimit
      });
    }

    function showAnalysis(data) {
        var pct = safePct(data.score, data.maxScore);
      var avgTime = data.totalCorrect + data.totalWrong > 0 ? Math.round(data.totalTime / (data.totalCorrect + data.totalWrong)) : 0;
      var accuracy = data.totalCorrect + data.totalWrong > 0 ? Math.round(data.totalCorrect / (data.totalCorrect + data.totalWrong) * 100) : 0;
      var letters = ['A', 'B', 'C', 'D'];

      var breakdownHtml = data.questions.map(function(q, i) {
        var r = data.results[i];
        var icon = r.selected < 0 ? '<i class="fas fa-minus" style="opacity:0.3"></i>' :
                   r.correct ? '<i class="fas fa-check"></i>' : '<i class="fas fa-times"></i>';
        var iconCls = r.selected < 0 ? 'skipped' : r.correct ? 'correct' : 'wrong';
        var timeStr = r.timeSpent > 0 ? fmtTime(r.timeSpent) : '--';

        var expandedHtml = '';
        if (r.selected >= 0 || true) {
          var yourAns = r.selected >= 0 ? letters[r.selected] + ') ' + esc(q.opts[r.selected]) : 'Not attempted';
          var correctAns = letters[q.ans] + ') ' + esc(q.opts[q.ans]);
          expandedHtml = `<div class="cm-bd-expanded" style="display:none" data-cm-detail="${i}">
            <div class="cm-bd-question">${esc(q.q)}</div>
            <div class="cm-bd-answers">
              ${r.selected >= 0 ? '<div class="cm-bd-answer ' + (r.correct ? 'right' : 'yours') + '">Your answer: ' + yourAns + '</div>' : '<div class="cm-bd-answer" style="opacity:0.4">Not attempted</div>'}
              ${!r.correct ? '<div class="cm-bd-answer right">Correct: ' + correctAns + '</div>' : ''}
            </div>
          </div>`;
        }

        return `<div class="cm-breakdown-row" data-cm-toggle="${i}">
          <div class="cm-bd-num">Q${i + 1}</div>
          <div class="cm-bd-icon ${iconCls}">${icon}</div>
          <div style="font-size:0.8rem;opacity:0.7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(q.q)}</div>
          <div class="cm-bd-time">${timeStr}</div>
          ${expandedHtml}
        </div>`;
      }).join('');

      el.innerHTML = `
      <div class="cm-analysis">
        <div class="page-header anim-entrance">
          <div>
            <div class="page-title" data-text="Test Complete!">Test Complete!</div>
            <div class="page-sub">${data.name}</div>
          </div>
        </div>
        <div class="card anim-entrance" style="--delay:0.1s;padding:20px">
          <div class="cm-score-grid">
            <div class="cm-score-item">
              <div class="cm-score-big" style="color:var(--success)">${data.totalCorrect}/${data.questions.length}</div>
              <div class="cm-score-lbl">Correct</div>
            </div>
            <div class="cm-score-item">
              <div class="cm-score-big" style="color:var(--danger)">${data.totalWrong}</div>
              <div class="cm-score-lbl">Wrong</div>
            </div>
            <div class="cm-score-item">
              <div class="cm-score-big" style="color:var(--accent)">${data.totalSkipped}</div>
              <div class="cm-score-lbl">Skipped</div>
            </div>
            <div class="cm-score-item">
              <div class="cm-score-big">${data.score}/${data.maxScore}</div>
              <div class="cm-score-lbl">Score (${pct}%)</div>
            </div>
          </div>
          <div class="cm-time-summary">
            Total: ${fmtTime(data.totalTime)} · Accuracy: ${accuracy}% · Avg ${fmtTime(avgTime)}/question
          </div>
        </div>
        <div class="card anim-entrance" style="--delay:0.2s;padding:20px">
          <div class="cm-breakdown">
            <div class="cm-breakdown-title">Question Breakdown</div>
            ${breakdownHtml}
          </div>
        </div>
        <div class="cm-actions anim-entrance" style="--delay:0.3s">
          <button class="btn btn-primary" data-cm-save style="padding:12px;font-size:14px"><i class="fas fa-save"></i> Save to Mock Tests</button>
          <button class="btn btn-ghost" data-cm-hub style="padding:12px;font-size:14px"><i class="fas fa-home"></i> Back to Hub</button>
        </div>
      </div>`;

      // Bind breakdown expand
      el.querySelectorAll('[data-cm-toggle]').forEach(function(row) {
        row.addEventListener('click', function() {
          var idx = row.getAttribute('data-cm-toggle');
          var detail = el.querySelector('[data-cm-detail="' + idx + '"]');
          if (detail) detail.style.display = detail.style.display === 'none' ? 'block' : 'none';
        });
      });

      el.querySelector('[data-cm-save]').addEventListener('click', function() {
        saveCustomResult(data);
        if (window.toast) window.toast('Mock test saved!');
        window.renderMockTests(el);
      });

      el.querySelector('[data-cm-hub]').addEventListener('click', function() {
        window.renderMockTests(el);
      });
    }
  }

  /* ═══════════════ SAVE CUSTOM RESULT ═══════════════ */
  function saveCustomResult(data) {
    var DB = window.DB;
    if (!DB.mockTests) DB.mockTests = [];

    DB.mockTests.unshift({
      id: 'mt_' + Date.now(),
      name: data.name,
      subject: 'Custom',
      date: new Date().toISOString().split('T')[0],
      total: data.maxScore,
      physics: { correct: 0, incorrect: 0, unattempted: 0 },
      chemistry: { correct: 0, incorrect: 0, unattempted: 0 },
      maths: { correct: data.totalCorrect, incorrect: data.totalWrong, unattempted: data.totalSkipped },
      syllabus: 'Custom Test (' + data.mode + ' mode)',
      time: Math.round(data.totalTime / 60),
      review: '',
      customTest: true,
      results: {
        answers: data.results,
        totalCorrect: data.totalCorrect,
        totalWrong: data.totalWrong,
        totalSkipped: data.totalSkipped,
        totalTime: data.totalTime
      }
    });
    if (window.sv) window.sv('mockTests');
  }

  /* ═══════════════ CRUD (existing) ═══════════════ */
  window.openAddMockTest = function() {
    ['mt-name', 'mt-scored', 'mt-total', 'mt-date', 'mt-subj', 'mt-time', 'mt-syllabus', 'mt-review'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.value = '';
    });
    var dateEl = document.getElementById('mt-date');
    if (dateEl) dateEl.value = new Date().toISOString().split('T')[0];
    if (window.om) window.om('m-mocktest');
    setTimeout(function() { var t = document.getElementById('mt-name'); if (t) t.focus(); }, 320);
  };

  window.delMockTest = function(id) {
    var DB = window.DB;
    if (!DB || !DB.mockTests) return;
    if (window.cfm2) {
      window.cfm2('Delete Mock Test', 'Are you sure you want to delete this mock test?', function() {
        DB.mockTests = DB.mockTests.filter(t => t.id !== id);
        if (window.sv) window.sv('mockTests');
        if (window._refreshPage) window._refreshPage();
        if (window.toast) window.toast('Mock test deleted');
      });
    } else {
      DB.mockTests = DB.mockTests.filter(t => t.id !== id);
      if (window.sv) window.sv('mockTests');
      if (window._refreshPage) window._refreshPage();
    }
  };
})();
