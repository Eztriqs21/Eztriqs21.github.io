// page-js/pyq.js — PYQ Research page with custom questions (Nexus & Bloom)
(function() {
  function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
  function fmtDate(d) { return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }); }
  function safePct(a, b) { return b > 0 ? Math.round((a / b) * 100) : 0; }
  function getTheme() { return document.documentElement.getAttribute('data-theme') || 'nexus'; }
  function pfx() { return getTheme() === 'nexus' ? 'nx' : 'bl'; }

  const SUBJECT_ICONS = {
    physics:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    chemistry: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6v11l4 5H5l4-5V3z"/><line x1="9" y1="3" x2="15" y2="3"/></svg>',
    maths:     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20L20 4"/><path d="M15 4h5v5"/><path d="M4 20l5-5"/></svg>'
  };

  const PYQ_DATA = [
    { id: 'q1', year: 2024, subject: 'physics', topic: 'Rotational Motion', difficulty: 'medium', question: 'A solid disc of mass M and radius R rolls without slipping on a horizontal surface with velocity v. What is the ratio of translational KE to total KE?', options: ['1:2', '1:3', '2:3', '3:4'], answer: 0, builtIn: true },
    { id: 'q2', year: 2024, subject: 'chemistry', topic: 'Chemical Bonding', difficulty: 'easy', question: 'Which of the following molecules has the highest bond order?', options: ['N\u2082', 'O\u2082', 'F\u2082', 'C\u2082'], answer: 0, builtIn: true },
    { id: 'q3', year: 2024, subject: 'maths', topic: 'Permutations & Combinations', difficulty: 'hard', question: 'In how many ways can 8 different books be distributed among 3 students if each student gets at least 2 books?', options: ['5796', '4620', '3840', '2940'], answer: 0, builtIn: true },
    { id: 'q4', year: 2023, subject: 'physics', topic: 'Electrostatics', difficulty: 'medium', question: 'Two point charges +q and -q are placed at distance d apart. The electric field at the midpoint is:', options: ['0', 'kq/d\u00B2', '2kq/d\u00B2', '4kq/d\u00B2'], answer: 2, builtIn: true },
    { id: 'q5', year: 2023, subject: 'chemistry', topic: 'Thermodynamics', difficulty: 'easy', question: 'For an ideal gas, which process has \u0394U = 0?', options: ['Isothermal', 'Adiabatic', 'Isochoric', 'Isobaric'], answer: 0, builtIn: true },
    { id: 'q6', year: 2023, subject: 'maths', topic: 'Matrices & Determinants', difficulty: 'hard', question: 'If A is a 3\u00D73 matrix with |A| = 5, find |3A|:', options: ['15', '45', '135', '243'], answer: 2, builtIn: true },
    { id: 'q7', year: 2022, subject: 'physics', topic: 'Modern Physics', difficulty: 'medium', question: 'The de Broglie wavelength of an electron accelerated through 100V is approximately:', options: ['1.227 \u00C5', '0.1227 \u00C5', '12.27 \u00C5', '0.01227 \u00C5'], answer: 0, builtIn: true },
    { id: 'q8', year: 2022, subject: 'chemistry', topic: 'Organic Chemistry', difficulty: 'hard', question: 'Which reaction proceeds through a carbocation intermediate?', options: ['SN2', 'SN1', 'E2', 'Addition'], answer: 1, builtIn: true }
  ];

  const YEARS = [2024, 2023, 2022, 2021, 2020, 2019, 2018];
  const DIFFICULTY = { easy: { label: 'Easy', color: 'var(--success)', bg: 'rgba(34,197,94,0.1)' }, medium: { label: 'Medium', color: 'var(--accent)', bg: 'rgba(245,158,11,0.1)' }, hard: { label: 'Hard', color: 'var(--danger)', bg: 'rgba(239,68,68,0.1)' } };

  let activeYear = 'all';
  let activeSubject = 'all';
  let _pyqAnswers = {};

  function getAllQuestions() {
    var DB = window.DB;
    var userQs = (DB && DB.pyqs) || [];
    return PYQ_DATA.concat(userQs);
  }

  function questionCard(q, index) {
    const p = pfx();
    const diff = DIFFICULTY[q.difficulty] || DIFFICULTY.medium;
    const answered = _pyqAnswers[q.id];
    return '<div class="' + p + '-card anim-entrance" style="--delay:' + (index * 0.05) + 's;padding:16px" data-tutorial-id="pyq-card">'
      + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">'
      + '<span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:12px;background:' + diff.bg + ';color:' + diff.color + '">' + diff.label + '</span>'
      + '<span style="font-size:11px;padding:2px 8px;border-radius:12px;background:var(--border);color:var(--muted)">' + q.year + '</span>'
      + '<span style="display:flex;align-items:center;gap:4px;font-size:11px;color:var(--muted);margin-left:auto">' + SUBJECT_ICONS[q.subject] + ' ' + q.subject.charAt(0).toUpperCase() + q.subject.slice(1) + '</span>'
      + (q.builtIn ? '' : '<button class="' + p + '-btn-ghost" style="font-size:9px;padding:2px 6px;color:var(--danger);margin-left:4px" onclick="event.stopPropagation();window._deletePyq(\'' + q.id + '\')"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>')
      + '</div>'
      + '<div style="font-size:12px;color:var(--muted);margin-bottom:6px">' + esc(q.topic) + '</div>'
      + '<div style="font-size:13px;line-height:1.6;margin-bottom:12px">' + esc(q.question) + '</div>'
      + '<div style="display:flex;flex-direction:column;gap:6px">'
      + q.options.map(function(opt, oi) {
        var isSelected = answered === oi;
        var isCorrect = oi === q.answer;
        var borderColor = isSelected ? (isCorrect ? 'var(--success)' : 'var(--danger)') : isCorrect && answered !== undefined ? 'var(--success)' : 'var(--border)';
        var bg = isSelected ? (isCorrect ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)') : 'transparent';
        return '<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:8px;border:1px solid ' + borderColor + ';background:' + bg + ';font-size:12px;cursor:pointer;transition:all 0.2s" onclick="window._answerPyq(\'' + q.id + '\',' + oi + ')">'
          + '<div style="width:20px;height:20px;border-radius:50%;border:2px solid ' + borderColor + ';display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:10px;font-weight:600">' + String.fromCharCode(65 + oi) + '</div>'
          + '<span>' + esc(opt) + '</span>'
          + (isSelected ? (isCorrect ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2" style="margin-left:auto"><polyline points="20 6 9 17 4 12"/></svg>' : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="2" style="margin-left:auto"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>') : '')
          + '</div>';
      }).join('')
      + '</div></div>';
  }

  window.renderPYQ = function(el) {
    if (!el) return;
    var DB = window.DB;
    _pyqAnswers = (DB && DB.pyqAnswers) || {};
    const p = pfx();
    const allQ = getAllQuestions();
    const filtered = allQ.filter(function(q) { return (activeYear === 'all' || q.year === activeYear) && (activeSubject === 'all' || q.subject === activeSubject); });
    const subjectCounts = { physics: allQ.filter(function(q) { return q.subject === 'physics'; }).length, chemistry: allQ.filter(function(q) { return q.subject === 'chemistry'; }).length, maths: allQ.filter(function(q) { return q.subject === 'maths'; }).length };

    el.innerHTML = ''
      + '<div class="' + p + '-page-header anim-entrance" style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px">'
      + '<div>'
      + '<div class="' + p + '-page-title" data-text="PYQ Research">PYQ Research</div>'
      + '<div class="' + p + '-page-sub">Previous year question analysis</div>'
      + '</div>'
      + '<button class="' + p + '-btn ' + p + '-btn-primary" data-tutorial-id="add-pyq" onclick="window._openAddPyq()">+ Add PYQ</button>'
      + '</div>'
      + '<div class="' + p + '-stats-grid anim-entrance" style="--delay:0.1s">'
      + '<div class="' + p + '-stat-card">'
      + '<div class="' + p + '-stat-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>'
      + '<div class="' + p + '-stat-val"><span data-count="' + allQ.length + '">0</span></div>'
      + '<div class="' + p + '-stat-label">Questions</div>'
      + '<div class="' + p + '-stat-sub">In database</div>'
      + '</div>'
      + '<div class="' + p + '-stat-card">'
      + '<div class="' + p + '-stat-icon" style="color:var(--success)">' + SUBJECT_ICONS.physics + '</div>'
      + '<div class="' + p + '-stat-val" style="color:var(--success)"><span data-count="' + subjectCounts.physics + '">0</span></div>'
      + '<div class="' + p + '-stat-label">Physics</div>'
      + '<div class="' + p + '-stat-sub">Questions</div>'
      + '</div>'
      + '<div class="' + p + '-stat-card">'
      + '<div class="' + p + '-stat-icon" style="color:var(--accent)">' + SUBJECT_ICONS.chemistry + '</div>'
      + '<div class="' + p + '-stat-val" style="color:var(--accent)"><span data-count="' + subjectCounts.chemistry + '">0</span></div>'
      + '<div class="' + p + '-stat-label">Chemistry</div>'
      + '<div class="' + p + '-stat-sub">Questions</div>'
      + '</div>'
      + '<div class="' + p + '-stat-card">'
      + '<div class="' + p + '-stat-icon" style="color:var(--math)">' + SUBJECT_ICONS.maths + '</div>'
      + '<div class="' + p + '-stat-val" style="color:var(--math)"><span data-count="' + subjectCounts.maths + '">0</span></div>'
      + '<div class="' + p + '-stat-label">Maths</div>'
      + '<div class="' + p + '-stat-sub">Questions</div>'
      + '</div>'
      + '</div>'
      + '<div class="' + p + '-filter-bar anim-entrance" style="--delay:0.15s" data-tutorial-id="pyq-filters">'
      + '<button class="' + p + '-chip ' + (activeYear === 'all' ? 'active' : '') + '" onclick="window._pyqYear(\'all\')">All Years</button>'
      + YEARS.map(function(y) { return '<button class="' + p + '-chip ' + (activeYear === y ? 'active' : '') + '" onclick="window._pyqYear(' + y + ')">' + y + '</button>'; }).join('')
      + '</div>'
      + '<div class="' + p + '-filter-bar anim-entrance" style="--delay:0.2s">'
      + '<button class="' + p + '-chip ' + (activeSubject === 'all' ? 'active' : '') + '" onclick="window._pyqSubj(\'all\')">All Subjects</button>'
      + '<button class="' + p + '-chip ' + (activeSubject === 'physics' ? 'active' : '') + '" onclick="window._pyqSubj(\'physics\')">Physics</button>'
      + '<button class="' + p + '-chip ' + (activeSubject === 'chemistry' ? 'active' : '') + '" onclick="window._pyqSubj(\'chemistry\')">Chemistry</button>'
      + '<button class="' + p + '-chip ' + (activeSubject === 'maths' ? 'active' : '') + '" onclick="window._pyqSubj(\'maths\')">Maths</button>'
      + '</div>'
      + '<div class="' + p + '-section-block anim-entrance" style="--delay:0.25s">'
      + '<div class="' + p + '-section-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> Questions (' + filtered.length + ')</div>'
      + (filtered.length === 0
        ? '<div class="' + p + '-empty" style="padding:28px"><div class="' + p + '-empty-title">No questions match filters</div><div class="' + p + '-empty-sub">Try adjusting year or subject</div></div>'
        : '<div class="' + p + '-grid" style="grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px">' + filtered.map(function(q, i) { return questionCard(q, i); }).join('') + '</div>')
      + '</div>';

    window._pyqYear = function(y) { activeYear = y; if (window._refreshPage) window._refreshPage(); };
    window._pyqSubj = function(s) { activeSubject = s; if (window._refreshPage) window._refreshPage(); };
  };

  window._answerPyq = function(qid, idx) {
    _pyqAnswers[qid] = idx;
    var DB = window.DB;
    if (DB) { if (!DB.pyqAnswers) DB.pyqAnswers = {}; DB.pyqAnswers[qid] = idx; if (window.sv) window.sv('pyqAnswers'); }
    var allQ = getAllQuestions();
    var q = allQ.find(function(x) { return x.id === qid; });
    if (!q) return;
    var cards = document.querySelectorAll('.' + pfx() + '-card');
    cards.forEach(function(card) {
      var btns = card.querySelectorAll('[onclick*="_answerPyq"]');
      btns.forEach(function(btn) {
        var m = btn.getAttribute('onclick').match(/_answerPyq\('([^']+)',(\d+)\)/);
        if (m && m[1] === qid) {
          var oi = parseInt(m[2]);
          var isCorrect = oi === idx && idx === q.answer;
          var isWrong = oi === idx && idx !== q.answer;
          var isActualCorrect = oi === q.answer;
          btn.style.borderColor = isCorrect ? 'var(--success)' : isWrong ? 'var(--danger)' : isActualCorrect && idx !== undefined ? 'var(--success)' : 'var(--border)';
          btn.style.background = isCorrect ? 'rgba(34,197,94,0.1)' : isWrong ? 'rgba(239,68,68,0.1)' : 'transparent';
        }
      });
    });
  };

  window._openAddPyq = function() {
    ['pyq-subject', 'pyq-year', 'pyq-topic', 'pyq-difficulty', 'pyq-question', 'pyq-a', 'pyq-b', 'pyq-c', 'pyq-d', 'pyq-answer'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.value = el.tagName === 'SELECT' ? el.options[0].value : '';
    });
    var yr = document.getElementById('pyq-year');
    if (yr) yr.value = new Date().getFullYear();
    if (window.om) window.om('m-pyq-add');
    setTimeout(function() { var t = document.getElementById('pyq-topic'); if (t) t.focus(); }, 320);
  };

  window._savePyq = function() {
    var DB = window.DB;
    var subjEl = document.getElementById('pyq-subject');
    var yearEl = document.getElementById('pyq-year');
    var topicEl = document.getElementById('pyq-topic');
    var diffEl = document.getElementById('pyq-difficulty');
    var questionEl = document.getElementById('pyq-question');
    var aEl = document.getElementById('pyq-a');
    var bEl = document.getElementById('pyq-b');
    var cEl = document.getElementById('pyq-c');
    var dEl = document.getElementById('pyq-d');
    var answerEl = document.getElementById('pyq-answer');
    var subj = subjEl ? subjEl.value : 'physics';
    var year = yearEl ? parseInt(yearEl.value) || new Date().getFullYear() : new Date().getFullYear();
    var topic = topicEl ? topicEl.value.trim() : '';
    var diff = diffEl ? diffEl.value : 'medium';
    var question = questionEl ? questionEl.value.trim() : '';
    var a = aEl ? aEl.value.trim() : '';
    var b = bEl ? bEl.value.trim() : '';
    var c = cEl ? cEl.value.trim() : '';
    var d = dEl ? dEl.value.trim() : '';
    var answer = answerEl ? parseInt(answerEl.value) || 0 : 0;
    if (!topic || !question || !a || !b || !c || !d) {
      var fields = { 'pyq-topic': topic, 'pyq-question': question, 'pyq-a': a, 'pyq-b': b, 'pyq-c': c, 'pyq-d': d };
      Object.keys(fields).forEach(function(id) {
        var el = document.getElementById(id);
        if (el && !fields[id]) { el.style.borderColor = 'var(--danger)'; setTimeout(function() { el.style.borderColor = ''; }, 2000); }
      });
      if (window.toast) window.toast('Fill all fields'); return;
    }
    if (!DB) return;
    if (!DB.pyqs) DB.pyqs = [];
    DB.pyqs.unshift({
      id: 'pyq_' + Date.now(),
      year: year, subject: subj, topic: topic, difficulty: diff,
      question: question, options: [a, b, c, d], answer: answer,
      builtIn: false, createdAt: new Date().toISOString()
    });
    if (window.sv) window.sv('pyqs');
    if (window.cm) window.cm('m-pyq-add');
    if (window.toast) window.toast('PYQ added!');
    if (window._refreshPage) window._refreshPage();
  };

  window._deletePyq = function(id) {
    var DB = window.DB;
    if (!DB || !DB.pyqs) return;
    if (window.cfm2) {
      window.cfm2('Delete PYQ', 'Delete this question?', function() {
        DB.pyqs = DB.pyqs.filter(function(q) { return q.id !== id; });
        if (window.sv) window.sv('pyqs');
        if (window._refreshPage) window._refreshPage();
        if (window.toast) window.toast('Deleted');
      });
    } else {
      DB.pyqs = DB.pyqs.filter(function(q) { return q.id !== id; });
      if (window.sv) window.sv('pyqs');
      if (window._refreshPage) window._refreshPage();
    }
  };
})();
