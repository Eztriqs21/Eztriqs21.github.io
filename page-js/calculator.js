// page-js/calculator.js — Full JEE Answer-Key Calculator (IIFE)
(function () {
  var calcQuestions = [], calcShowResults = false, calcAnsKey = {};
  var CALC_SUBJS = ['physics', 'chemistry', 'maths'];
  var CALC_LABELS = ['Physics', 'Chemistry', 'Maths'];
  var CALC_COLORS = ['var(--phys)', 'var(--chem)', 'var(--math)'];

  function initCalcQ() {
    calcQuestions = [];
    ['physics', 'chemistry', 'maths'].forEach(function (subj, si) {
      for (var i = 1; i <= 25; i++) {
        calcQuestions.push({ num: si * 25 + i, subj: subj, subjLabel: CALC_LABELS[si], selected: null, unattempted: false, mode: 'mcq', intVal: '', multiVal: '' });
      }
    });
  }
  var currentFocusQ = 1;
  var calcActiveTab = 'manual';

  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML.replace(/'/g, '&#39;'); }
  function getTheme() { return document.documentElement.getAttribute('data-theme') || 'nexus'; }
  function pfx() { return getTheme() === 'nexus' ? 'nx' : 'bl'; }

  function renderCalculator(el) {
    if (!calcQuestions.length) initCalcQ();
    var ans = calcQuestions.filter(function (q) { return q.selected && !q.unattempted; }).length;
    var skp = calcQuestions.filter(function (q) { return q.unattempted; }).length;
    var pend = 75 - ans - skp;
    var p = pfx();

    el.innerHTML =
      '<div class="' + p + '-page-header anim-entrance"><div class="' + p + '-page-title" data-text="Calculator">Calculator</div><div class="' + p + '-page-sub">Full JEE mock evaluation engine</div></div>' +
      '<div class="' + p + '-tabs anim-entrance">' +
        '<button class="' + p + '-tab-btn ' + p + '-tab-btn-on" onclick="switchCalcTab(\'manual\')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="10" y2="10"/><line x1="14" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/><line x1="14" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="16" y2="18"/></svg> Manual Calculator</button>' +
      '</div>' +
      '<div class="' + p + '-card anim-entrance" style="padding:20px">' +
        '<div class="' + p + '-section-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg> Answer Key <span style="font-size:10px;font-weight:400;color:var(--faint)">(required)</span></div>' +
        '<p style="font-size:11px;color:var(--muted);margin-bottom:12px;line-height:1.6">Enter official key for exact scoring. Supports MCQ (<code style="background:var(--surface2);padding:1px 6px;border-radius:4px">1:A, 2:C</code>), Integer (<code style="background:var(--surface2);padding:1px 6px;border-radius:4px">1:25, 2:100</code>), and Multi-Correct (<code style="background:var(--surface2);padding:1px 6px;border-radius:4px">1:ABD, 2:CD</code>).</p>' +
        '<textarea class="' + p + '-input" id="calc-key-txt" rows="3" placeholder="Paste answer key...\ne.g. 1:A, 2:C, 3:D, 4:B, 5:A ...\ninteger: 1:25, 2:100, 3:45 ...\nmulti-correct: 1:ABD, 2:CD, 3:ABC"></textarea>' +
        '<div style="display:flex;align-items:center;gap:10px;margin-top:8px">' +
          '<button class="' + p + '-btn ' + p + '-btn-ghost" onclick="applyAnsKey()">Apply Key</button>' +
          '<span id="key-status" style="font-size:11px;color:var(--green)"></span>' +
        '</div>' +
      '</div>' +
      '<div class="' + p + '-card anim-entrance" style="overflow:hidden;padding:20px">' +
        '<div style="padding:0 0 10px;font-size:11px;color:var(--faint);margin-bottom:6px">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg> Keyboard: <b>A/B/C/D</b> to select · <b>0-9</b> for Integer · <b>S</b> to skip · <b>Enter</b> next · Toggle <b>MCQ</b>/<b>INT</b>/<b>MULTI</b>' +
        '</div>' +
        '<div style="padding:0 0 12px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">' +
          '<div style="font-size:13px;font-weight:700"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> Response Sheet — 75 Questions</div>' +
          '<div style="font-size:11px;color:var(--muted)">' + ans + ' answered · ' + skp + ' skipped · ' + pend + ' remaining</div>' +
        '</div>' +
        '<div class="q-matrix-wrap">' +
          '<div class="q-matrix">' +
            '<div class="q-matrix-header"><div>Q#</div><div>Subject</div><div>Type</div><div>Response</div><div>Skip</div></div>' +
            '<div id="q-mat-body" style="max-height:440px;overflow-y:auto;-webkit-overflow-scrolling:touch">' + buildQMat() + '</div>' +
          '</div>' +
        '</div>' +
        '<div style="padding:14px 0 0;border-top:1px solid var(--border);display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap">' +
          '<button class="' + p + '-btn ' + p + '-btn-ghost" onclick="resetCalc()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg> Reset</button>' +
          '<button class="' + p + '-btn ' + p + '-btn-primary" onclick="evalCalc()" style="padding:10px 22px"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="10" y2="10"/><line x1="14" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/><line x1="14" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="16" y2="18"/></svg> Calculate Score</button>' +
        '</div>' +
      '</div>' +
      '<div id="calc-results" class="anim-entrance" style="margin-top:16px;display:' + (calcShowResults ? 'block' : 'none') + '">' + (calcShowResults ? buildCalcRes() : '') + '</div>';

    attachCalcKeyboard();
  }

  function switchCalcTab(tab) {
    calcActiveTab = tab;
    if (window.PAGE === 'calculator') renderCalculator(document.getElementById('content-wrap'));
  }

  function buildQMat() {
    var sc = { physics: 'var(--phys)', chemistry: 'var(--chem)', maths: 'var(--math)' };
    return calcQuestions.map(function (q) {
      var focusCls = q.num === currentFocusQ ? ' q-focus' : '';
      var respHtml = '';
      if (q.mode === 'int') {
        respHtml = '<div class="q-opt" style="grid-column:span 1"><input type="number" class="q-int-input" min="0" max="9999" value="' + (q.intVal || '') + '" onchange="setQIntResp(' + q.num + ',this.value)" onfocus="focusQRow(' + q.num + ')" onkeydown="intKeyHandler(event,' + q.num + ')" placeholder="___" style="width:100%;padding:6px 8px;border-radius:6px;background:var(--surface2);border:1px solid var(--border);color:var(--txt);font-size:14px;text-align:center;font-weight:600;outline:none"/></div>';
      } else if (q.mode === 'multi') {
        respHtml = '<div class="q-opt" style="display:flex;gap:8px;justify-content:center;grid-column:span 1">' +
          ['A', 'B', 'C', 'D'].map(function (opt) {
            return '<label style="display:flex;align-items:center;gap:2px;font-size:10px;color:var(--muted);cursor:pointer"><input type="checkbox" class="q-multi-cb" value="' + opt + '" ' + (q.selected && q.selected.indexOf(opt) >= 0 ? 'checked' : '') + ' onchange="setQMultiResp(' + q.num + ')"/>' + opt + '</label>';
          }).join('') + '</div>';
      } else {
        respHtml = '<div class="q-opt" style="display:flex;gap:8px;justify-content:center;grid-column:span 1">' +
          ['A', 'B', 'C', 'D'].map(function (opt) {
            return '<label style="display:flex;align-items:center;gap:2px;font-size:10px;color:var(--muted);cursor:pointer"><input type="radio" class="q-radio" name="q' + q.num + '" value="' + opt + '" ' + (q.selected === opt && !q.unattempted ? 'checked' : '') + ' onchange="setQResp(' + q.num + ',\'' + opt + '\')"/>' + opt + '</label>';
          }).join('') + '</div>';
      }
      return '<div class="q-row' + focusCls + '" id="qrow-' + q.num + '" tabindex="-1" onclick="focusQRow(' + q.num + ')">' +
        '<div class="q-num" style="color:' + sc[q.subj] + '">Q' + q.num + '</div>' +
        '<div class="q-subj">' + q.subjLabel + '</div>' +
        '<div class="q-type-toggle" onclick="event.stopPropagation();toggleQType(' + q.num + ')" style="cursor:pointer;font-size:9px;text-align:center;color:var(--accent);font-weight:600;padding:2px 4px;border-radius:4px;background:var(--accent-dim)">' + (q.mode === 'int' ? 'INT' : q.mode === 'multi' ? 'MULTI' : 'MCQ') + '</div>' +
        respHtml +
        '<div class="q-skip-btn"><button class="' + (q.unattempted ? 'on' : '') + '" onclick="event.stopPropagation();toggleQSkip(' + q.num + ')">' + (q.unattempted ? 'Skipped' : 'Skip') + '</button></div>' +
      '</div>';
    }).join('');
  }

  function setQResp(num, opt) {
    var q = calcQuestions.find(function (x) { return x.num === num; });
    if (!q) return;
    q.selected = opt; q.unattempted = false; q.intVal = '';
    var row = document.getElementById('qrow-' + num);
    if (row) {
      row.querySelectorAll('.q-skip-btn button').forEach(function (b) { b.className = ''; b.textContent = 'Skip'; });
      row.querySelectorAll('.q-radio').forEach(function (r) { r.checked = r.value === opt; });
      row.classList.remove('q-focus');
    }
    calcShowResults = false;
    var r = document.getElementById('calc-results'); if (r) r.style.display = 'none';
    var nextQ = calcQuestions.find(function (x) { return x.num === num + 1; });
    if (nextQ) focusQRow(nextQ.num);
  }

  function toggleQSkip(num) {
    var q = calcQuestions.find(function (x) { return x.num === num; });
    if (!q) return;
    q.unattempted = !q.unattempted;
    var row = document.getElementById('qrow-' + num);
    if (row) {
      if (q.unattempted) {
        q.selected = null; q.intVal = ''; q.multiVal = '';
        row.querySelectorAll('input[type=radio]').forEach(function (r) { r.checked = false; });
        row.querySelectorAll('.q-multi-cb').forEach(function (c) { c.checked = false; });
        var inp = row.querySelector('.q-int-input'); if (inp) inp.value = '';
      }
      row.querySelectorAll('.q-skip-btn button').forEach(function (b) { b.className = q.unattempted ? 'on' : ''; b.textContent = q.unattempted ? 'Skipped' : 'Skip'; });
      if (!q.unattempted && q.selected && q.mode === 'mcq') row.querySelectorAll('.q-radio').forEach(function (r) { r.checked = r.value === q.selected; });
      row.classList.remove('q-focus');
    }
    calcShowResults = false;
    var r = document.getElementById('calc-results'); if (r) r.style.display = 'none';
    var nextQ = calcQuestions.find(function (x) { return x.num === num + 1; });
    if (nextQ) focusQRow(nextQ.num);
  }

  function toggleQType(num) {
    var q = calcQuestions.find(function (x) { return x.num === num; });
    if (!q) return;
    var modes = ['mcq', 'int', 'multi'];
    var idx = modes.indexOf(q.mode);
    q.mode = modes[(idx + 1) % modes.length];
    q.selected = null; q.intVal = ''; q.multiVal = ''; q.unattempted = false;
    calcShowResults = false;
    var r = document.getElementById('calc-results'); if (r) r.style.display = 'none';
    var body = document.getElementById('q-mat-body');
    if (body) body.innerHTML = buildQMat();
    focusQRow(num);
  }

  function setQMultiResp(num) {
    var q = calcQuestions.find(function (x) { return x.num === num; });
    if (!q) return;
    var cbs = document.querySelectorAll('#qrow-' + num + ' .q-multi-cb');
    var selected = [];
    cbs.forEach(function (cb) { if (cb.checked) selected.push(cb.value); });
    q.multiVal = selected.join('');
    q.selected = q.multiVal || null;
    q.unattempted = false;
    calcShowResults = false;
    var r = document.getElementById('calc-results'); if (r) r.style.display = 'none';
    var row = document.getElementById('qrow-' + num);
    if (row) row.classList.remove('q-focus');
    var nextQ = calcQuestions.find(function (x) { return x.num === num + 1; });
    if (nextQ) focusQRow(nextQ.num);
  }

  function setQIntResp(num, val) {
    var q = calcQuestions.find(function (x) { return x.num === num; });
    if (!q) return;
    q.intVal = val; q.selected = val || null; q.unattempted = false;
    var row = document.getElementById('qrow-' + num);
    if (row) row.classList.remove('q-focus');
    var nextQ = calcQuestions.find(function (x) { return x.num === num + 1; });
    if (nextQ && val) focusQRow(nextQ.num);
  }

  function intKeyHandler(e, num) {
    if (e.key === 'Enter') { e.preventDefault(); var nq = calcQuestions.find(function (x) { return x.num === num + 1; }); if (nq) focusQRow(nq.num); }
    if (e.key === 'ArrowDown') { e.preventDefault(); var nq2 = calcQuestions.find(function (x) { return x.num === num + 1; }); if (nq2) focusQRow(nq2.num); }
    if (e.key === 'ArrowUp') { e.preventDefault(); var pq = calcQuestions.find(function (x) { return x.num === num - 1; }); if (pq) focusQRow(pq.num); }
  }

  function applyAnsKey() {
    var txt = document.getElementById('calc-key-txt').value.trim();
    if (!txt) { toast('Paste an answer key first'); return; }
    calcAnsKey = {};
    var matches = txt.match(/(\d{1,2})\s*[:.)\s]\s*([A-Da-d]+|\d{1,4})/g);
    if (matches) matches.forEach(function (m) {
      var parts = m.match(/(\d{1,2})\s*[:.)\s]\s*([A-Da-d]+|\d{1,4})/);
      if (parts) {
        var n = parseInt(parts[1]);
        if (n >= 1 && n <= 75) {
          var val = parts[2];
          calcAnsKey[n] = /^\d+$/.test(val) ? parseInt(val, 10) : val.toUpperCase();
        }
      }
    });
    var cnt = Object.keys(calcAnsKey).length;
    var st = document.getElementById('key-status');
    if (st) st.textContent = cnt + ' answers loaded';
    toast('Key applied: ' + cnt + ' questions');
  }

  function focusQRow(num) {
    currentFocusQ = num;
    document.querySelectorAll('.q-row').forEach(function (r) { r.classList.remove('q-focus'); });
    var row = document.getElementById('qrow-' + num);
    if (row) {
      row.classList.add('q-focus');
      row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      var ae = document.activeElement;
      if (!ae || !row.contains(ae) || ae === row) row.focus({ preventScroll: true });
    }
  }

  function attachCalcKeyboard() {
    if (window._calcKeyHandler) return;
    window._calcKeyHandler = function (e) {
      if (window.PAGE !== 'calculator' || calcActiveTab !== 'manual') return;
      if (!e.key) return;
      var key = e.key.toUpperCase();
      var isModCtrl = e.ctrlKey || e.metaKey || e.altKey;
      if (isModCtrl) return;
      var tag = e.target.tagName;
      var isTextInput = (tag === 'INPUT' && e.target.type === 'text') || tag === 'TEXTAREA';
      var isNumInput = (tag === 'INPUT' && e.target.type === 'number');
      if (isTextInput) return;
      if (isNumInput && ['ARROWDOWN', 'ARROWUP', 'ENTER', 'S'].indexOf(key) < 0 && ['A', 'B', 'C', 'D'].indexOf(key) < 0) return;
      if (['ARROWDOWN', 'ARROWUP', 'ENTER', 'S'].indexOf(key) >= 0) {
        if (isNumInput) return;
        e.preventDefault();
        if (key === 'ARROWDOWN') { var nq = calcQuestions.find(function (x) { return x.num === currentFocusQ + 1; }); if (nq) focusQRow(nq.num); }
        else if (key === 'ARROWUP') { var pq = calcQuestions.find(function (x) { return x.num === currentFocusQ - 1; }); if (pq) focusQRow(pq.num); }
        else if (key === 'ENTER') { var nq2 = calcQuestions.find(function (x) { return x.num === currentFocusQ + 1; }); if (nq2) focusQRow(nq2.num); }
        else if (key === 'S') { toggleQSkip(currentFocusQ); }
        return;
      }
      if (['A', 'B', 'C', 'D'].indexOf(key) >= 0) {
        if (isNumInput) return;
        e.preventDefault();
        var q = calcQuestions.find(function (x) { return x.num === currentFocusQ; });
        if (q && q.mode === 'multi') {
          var cb = document.querySelector('#qrow-' + currentFocusQ + ' .q-multi-cb[value="' + key + '"]');
          if (cb) { cb.checked = !cb.checked; setQMultiResp(currentFocusQ); }
        } else {
          setQResp(currentFocusQ, key);
        }
        return;
      }
      if (/^[0-9]$/.test(e.key)) {
        var q2 = calcQuestions.find(function (x) { return x.num === currentFocusQ; });
        if (q2 && q2.mode === 'int') {
          e.preventDefault();
          var inp = document.querySelector('#qrow-' + currentFocusQ + ' .q-int-input');
          if (inp) {
            var cursorPos = inp.selectionStart;
            inp.value = inp.value.slice(0, cursorPos) + e.key + inp.value.slice(inp.selectionEnd);
            inp.focus();
            inp.setSelectionRange(cursorPos + 1, cursorPos + 1);
          }
        }
      }
    };
    document.addEventListener('keydown', window._calcKeyHandler);
  }

  function evalCalc() {
    if (Object.keys(calcAnsKey).length === 0) { toast('Answer key is required. Paste the key above and click Apply Key first.'); return; }
    calcShowResults = true;
    var el = document.getElementById('calc-results');
    if (!el) return;
    el.style.display = 'block';
    el.innerHTML = buildCalcRes();
    setTimeout(function () { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
  }

  function scoreQ(q, k) {
    if (q.unattempted || !q.selected || k === undefined || k === null) return 0;
    if (q.mode === 'int') {
      var iv = Number(q.selected);
      if (isNaN(iv) || !Number.isInteger(iv)) return 0;
      return iv === k ? 4 : 0;
    }
    if (q.mode === 'multi') {
      var ks = String(k).toUpperCase(), ss = q.selected.toUpperCase();
      var correctCount = 0, wrongCount = 0, totalCorrect = 0;
      ['A', 'B', 'C', 'D'].forEach(function (o) {
        var inK = ks.indexOf(o) >= 0, inS = ss.indexOf(o) >= 0;
        if (inK) totalCorrect++;
        if (inS) { if (inK) correctCount++; else wrongCount++; }
      });
      if (wrongCount > 0) return -2;
      if (correctCount === totalCorrect) return 4;
      return 0;
    }
    return q.selected === k ? 4 : -1;
  }

  function saveCalcToHistory() {
    if (!calcQuestions || !calcQuestions.length) { toast('No calculator data. Solve a test first!'); return; }
    var p = { correct: 0, incorrect: 0, unattempted: 0, partial: 0 };
    var c = { correct: 0, incorrect: 0, unattempted: 0, partial: 0 };
    var m = { correct: 0, incorrect: 0, unattempted: 0, partial: 0 };
    var totalScore = 0;
    calcQuestions.forEach(function (q) {
      var k = calcAnsKey[q.num];
      if (k === undefined || k === null) return;
      var sc = scoreQ(q, k);
      if (Number.isNaN(sc)) return;
      totalScore += sc;
      var cat = q.subj === 'physics' ? p : q.subj === 'chemistry' ? c : m;
      if (sc === 0 && q.mode === 'multi' && q.selected) cat.partial++;
      else if (sc === 0) cat.unattempted++;
      else if (sc >= 4) cat.correct++;
      else if (sc > 0) cat.partial++;
      else cat.incorrect++;
    });
    var nameEl = document.getElementById('calc-save-name');
    if (nameEl) nameEl.value = 'Mock Test ' + new Date().toLocaleDateString();
    var dateEl = document.getElementById('calc-save-date');
    if (dateEl) dateEl.value = new Date().toISOString().split('T')[0];
    var scoredEl = document.getElementById('calc-save-scored');
    if (scoredEl) scoredEl.value = Math.max(0, totalScore);
    var maxEl = document.getElementById('calc-save-max');
    if (maxEl) maxEl.value = 300;
    window.om('m-save-calc-test');
    setTimeout(function () { if (nameEl) nameEl.focus(); }, 320);
  }

  function saveCalcTestFromModal() {
    if (!calcQuestions || !calcQuestions.length) { toast('No calculator data. Solve a test first!'); return; }
    var nameEl = document.getElementById('calc-save-name');
    var name = nameEl ? nameEl.value.trim() : '';
    if (!name) { toast('Enter a test name'); return; }
    var DB = window.DB;
    if (!DB) return;
    if (!DB.tests) DB.tests = [];
    var p = { correct: 0, incorrect: 0, unattempted: 0, partial: 0 };
    var c = { correct: 0, incorrect: 0, unattempted: 0, partial: 0 };
    var m = { correct: 0, incorrect: 0, unattempted: 0, partial: 0 };
    var totalScore = 0;
    calcQuestions.forEach(function (q) {
      var k = calcAnsKey[q.num];
      if (k === undefined || k === null) return;
      var sc = scoreQ(q, k);
      if (Number.isNaN(sc)) return;
      totalScore += sc;
      var cat = q.subj === 'physics' ? p : q.subj === 'chemistry' ? c : m;
      if (sc === 0 && q.mode === 'multi' && q.selected) cat.partial++;
      else if (sc === 0) cat.unattempted++;
      else if (sc >= 4) cat.correct++;
      else if (sc > 0) cat.partial++;
      else cat.incorrect++;
    });
    DB.tests.unshift({
      id: 't_' + Date.now(), name: name,
      date: document.getElementById('calc-save-date').value || new Date().toISOString(),
      physics: p, chemistry: c, maths: m,
      totalScore: Math.max(0, totalScore), maxScore: 300,
      papers: [], syllabus: { physics: [], chemistry: [], maths: [] }
    });
    if (!window.sv('tests')) { DB.tests.shift(); return; }
    window.cm('m-save-calc-test');
    toast('Test saved to history!');
  }

  function saveCalcAsMockTest() {
    var tot = calcQuestions.reduce(function (s, q) {
      var sc = scoreQ(q, calcAnsKey[q.num]);
      if (Number.isNaN(sc)) return s;
      return s + sc;
    }, 0);
    document.getElementById('mt-scored').value = Math.max(0, tot);
    document.getElementById('mt-total').value = 300;
    document.getElementById('mt-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('mt-subj').value = 'Full Syllabus';
    document.getElementById('mt-time').value = '';
    document.getElementById('mt-syllabus').value = '';
    document.getElementById('mt-review').value = '';
    window.om('m-mocktest');
    setTimeout(function () { document.getElementById('mt-scored').focus(); }, 320);
  }

  function buildCalcRes() {
    var tot = 0, totC = 0, totW = 0, totS = 0, totP = 0;
    var qR = [];
    calcQuestions.forEach(function (q) {
      var k = calcAnsKey[q.num];
      var unatt = q.unattempted || !q.selected;
      var noKey = k === undefined || k === null;
      var sc = noKey ? 0 : (unatt ? 0 : scoreQ(q, k));
      if (Number.isNaN(sc)) return;
      tot += sc;
      qR.push({ num: q.num, subj: q.subj, mode: q.mode, selected: q.selected, key: k, score: sc, skipped: unatt, noKey: noKey });
      if (unatt) totS++;
      else if (noKey) totS++;
      else if (sc >= 4) totC++;
      else if (sc > 0) totP++;
      else if (sc === 0 && q.mode === 'multi' && q.selected) totP++;
      else totW++;
    });
    var p = pfx();
    var scoreColor = tot >= 200 ? 'var(--green)' : tot >= 120 ? 'var(--accent)' : 'var(--red)';
    var rPct = Math.max(0, Math.min(100, tot / 300 * 100));
    var sd2 = Math.round(rPct / 100 * 264);
    var sd = CALC_SUBJS.map(function (s, si) {
      var sc = 0, c = 0, w = 0, sk = 0, pt = 0;
      qR.filter(function (r) { return r.subj === s; }).forEach(function (r) {
        if (r.skipped) sk++;
        else if (r.noKey) sk++;
        else if (r.score >= 4) c++;
        else if (r.score > 0) pt++;
        else w++;
        sc += r.score;
      });
      return { label: CALC_LABELS[si], color: CALC_COLORS[si], score: sc, correct: c, wrong: w, skip: sk, partial: pt };
    });
    var { pctile, airRange } = getPerc(tot);

    return '<div class="' + p + '-card anim-entrance">' +
      '<div class="results-hero">' +
        '<div style="font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);margin-bottom:14px">Score Based on Answer Key</div>' +
        '<div class="score-ring">' +
          '<svg viewBox="0 0 100 100" style="transform:rotate(-90deg)">' +
            '<circle cx="50" cy="50" r="42" fill="none" stroke="var(--surface2)" stroke-width="7"/>' +
            '<circle cx="50" cy="50" r="42" fill="none" stroke="' + scoreColor + '" stroke-width="7" stroke-linecap="round" stroke-dasharray="' + sd2 + ' 264" style="transition:stroke-dasharray 1.2s ease"/>' +
          '</svg>' +
          '<div class="score-ring-inner"><div class="score-num" style="color:' + scoreColor + '">' + tot + '</div><div class="score-sub">/ 300</div></div>' +
        '</div>' +
        '<div style="font-size:13px;font-weight:600;margin-bottom:14px;color:' + (rPct >= 60 ? 'var(--green)' : rPct >= 40 ? 'var(--accent)' : 'var(--red)') + '">' + rPct.toFixed(1) + '% — ' + totC + 'F · ' + totP + 'P · ' + totW + 'W · ' + totS + 'S</div>' +
        '<div class="results-badges stagger">' +
          '<div class="res-badge ' + p + '-stat-card" style="background:var(--accent-dim);border:1px solid var(--border2)"><div class="res-badge-val ' + p + '-stat-icon" style="color:var(--accent)">' + pctile + '%</div><div class="res-badge-lbl">Predicted Percentile</div></div>' +
          '<div class="res-badge ' + p + '-stat-card" style="background:var(--phys-dim);border:1px solid var(--border2)"><div class="res-badge-val ' + p + '-stat-icon" style="color:var(--phys)">' + airRange + '</div><div class="res-badge-lbl">Est. AIR Range</div></div>' +
          '<div class="res-badge ' + p + '-stat-card" style="background:var(--green-dim);border:1px solid var(--border2)"><div class="res-badge-val ' + p + '-stat-icon" style="color:var(--green)">' + totC + '</div><div class="res-badge-lbl">Full (+' + totC * 4 + ')</div></div>' +
          '<div class="res-badge ' + p + '-stat-card" style="background:var(--yellow-dim);border:1px solid var(--border2)"><div class="res-badge-val ' + p + '-stat-icon" style="color:var(--yellow)">' + totP + '</div><div class="res-badge-lbl">Partial</div></div>' +
          '<div class="res-badge ' + p + '-stat-card" style="background:var(--red-dim);border:1px solid var(--border2)"><div class="res-badge-val ' + p + '-stat-icon" style="color:var(--red)">' + totW + '</div><div class="res-badge-lbl">Wrong</div></div>' +
        '</div>' +
      '</div>' +
      '<div class="subj-breakdown-grid" style="padding:18px 20px">' +
        sd.map(function (s) {
          var pt = Math.max(0, Math.round(s.score));
          return '<div class="sbd-item">' +
            '<div class="sbd-label" style="color:' + s.color + '">' + s.label + '</div>' +
            '<div class="sbd-score" style="color:' + s.color + '">' + s.score + '</div>' +
            '<div class="sbd-detail">' + s.correct + 'F / ' + s.partial + 'P / ' + s.wrong + 'W / ' + s.skip + 'S</div>' +
            '<div class="pbar-wrap" style="height:4px;margin-top:8px"><div class="pbar" style="height:4px;width:' + Math.max(0, pt) + '%;background:' + s.color + '"></div></div>' +
          '</div>';
        }).join('') +
      '</div>' +
      '<div style="padding:0 20px 18px;display:flex;gap:10px;flex-wrap:wrap">' +
        '<button class="' + p + '-btn ' + p + '-btn-primary" onclick="saveCalcToHistory()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Save to Test History</button>' +
        '<button class="' + p + '-btn ' + p + '-btn-ghost" onclick="saveCalcAsMockTest()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Save as Mock Test</button>' +
        '<button class="' + p + '-btn ' + p + '-btn-ghost" onclick="resetCalc()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg> Reset Calculator</button>' +
      '</div>' +
      '<div style="padding:0 20px 20px">' +
        '<div style="font-size:11px;font-weight:700;margin-bottom:10px;color:var(--faint);border-top:1px solid var(--border);padding-top:14px"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> Question-wise Breakdown</div>' +
        '<div class="qr-grid">' +
          qR.map(function (r) {
            var cls = 'qr-na', ico = '—', scStr = '—';
            if (r.skipped) { cls = 'qr-skip'; ico = '⊘'; scStr = 'Skipped'; }
            else if (r.noKey) { cls = 'qr-na'; ico = '?'; scStr = 'No key'; }
            else if (r.score >= 4) { cls = 'qr-correct'; ico = '✓'; scStr = '+' + r.score; }
            else if (r.score > 0) { cls = 'qr-partial'; ico = '~'; scStr = '+' + r.score; }
            else { cls = 'qr-wrong'; ico = '✗'; scStr = String(r.score); }
            var ansStr = String(r.selected || '—');
            var keyStr = r.key;
            return '<div class="qr-item ' + cls + '">' +
              '<div class="qr-num">Q' + r.num + '</div>' +
              '<div class="qr-ans" title="You: ' + esc(ansStr) + '">' + esc(ansStr) + '</div>' +
              '<div class="qr-key" title="Key: ' + esc(keyStr) + '">' + esc(keyStr) + '</div>' +
              '<div class="qr-score">' + scStr + '</div>' +
            '</div>';
          }).join('') +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function getPerc(score) {
    var map = [
      { min: 285, p: 99.99, a: '1–50' }, { min: 280, p: 99.95, a: '50–200' }, { min: 270, p: 99.9, a: '200–600' },
      { min: 260, p: 99.8, a: '600–1,200' }, { min: 250, p: 99.7, a: '1,200–2,500' }, { min: 240, p: 99.6, a: '2,500–4,000' },
      { min: 230, p: 99.5, a: '4,000–6,000' }, { min: 220, p: 99.3, a: '6,000–10,000' }, { min: 210, p: 99.0, a: '10,000–15,000' },
      { min: 200, p: 98.5, a: '15,000–25,000' }, { min: 190, p: 97.5, a: '25,000–40,000' }, { min: 180, p: 96.5, a: '40,000–55,000' },
      { min: 170, p: 95.0, a: '55,000–75,000' }, { min: 160, p: 93.0, a: '75,000–1,00,000' }, { min: 140, p: 89.0, a: '1,00,000–1,50,000' },
      { min: 120, p: 83.0, a: '1,50,000–2,20,000' }, { min: 100, p: 74.0, a: '2,20,000–3,20,000' }, { min: 80, p: 62.0, a: '3,20,000–4,80,000' },
      { min: 60, p: 47.0, a: '4,80,000–6,50,000' }, { min: 40, p: 30.0, a: '6,50,000–8,40,000' }, { min: 0, p: 10.0, a: '8,40,000+' }
    ];
    for (var i = 0; i < map.length; i++) { if (score >= map[i].min) return { pctile: map[i].p, airRange: map[i].a }; }
    return { pctile: 5.0, airRange: '9,00,000+' };
  }

  function resetCalc() {
    initCalcQ(); calcShowResults = false; calcAnsKey = {}; currentFocusQ = 1;
    renderCalculator(document.getElementById('content-wrap'));
  }

  window.renderCalculator = renderCalculator;
  window.switchCalcTab = switchCalcTab;
  window.setQResp = setQResp;
  window.toggleQSkip = toggleQSkip;
  window.toggleQType = toggleQType;
  window.setQMultiResp = setQMultiResp;
  window.setQIntResp = setQIntResp;
  window.intKeyHandler = intKeyHandler;
  window.applyAnsKey = applyAnsKey;
  window.focusQRow = focusQRow;
  window.evalCalc = evalCalc;
  window.saveCalcToHistory = saveCalcToHistory;
  window.saveCalcTestFromModal = saveCalcTestFromModal;
  window.saveCalcAsMockTest = saveCalcAsMockTest;
  window.resetCalc = resetCalc;
})();
