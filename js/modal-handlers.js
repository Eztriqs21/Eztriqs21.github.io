// js/modal-handlers.js — CRUD & modal handler functions (recovered from original site)
// These functions are called by inline onclick/onchange handlers in index.html
// They rely on window.DB, window.sv, window.cm, window.om, window.toast, window.findCh

/* ═══════════════ SHARED HELPERS ═══════════════ */

function _refreshPage() {
  var el = document.getElementById('content-wrap');
  if (!el) return;
  var page = window.PAGE;

  // Clear pending render timers from nav.js to prevent race conditions
  if (typeof window._clearRenderTimers === 'function') window._clearRenderTimers();

  // Clean up calculator keyboard handler when leaving calculator page
  if (page !== 'calculator' && typeof window._detachCalcKeyboard === 'function') window._detachCalcKeyboard();

  // Reset animation state on the container
  el.classList.remove('page-exit', 'page-enter');
  el.style.opacity = '1';

  var renderers = {
    assignments: window.renderAssignments,
    tests: window.renderTests,
    chapters: window.renderChapters,
    'mock-tests': window.renderMockTests,
    analytics: window.renderAnalytics,
    calculator: window.renderCalculator
  };
  if (page === 'dashboard' && window.renderDashboard) window.renderDashboard(el);
  else if (renderers[page]) renderers[page](el);

  // Ensure container is visible before animating children
  el.style.opacity = '1';

  if (window.initScrollAnimations) window.initScrollAnimations(el);
  if (window.animateAllCounters) window.animateAllCounters(el);
}

/* ═══════════════ ASSIGNMENTS ═══════════════ */
window.pendingAFiles = [];
var aPriority = 'none';

function setAP(pri) {
  aPriority = pri;
  ['none', 'high', 'medium', 'low'].forEach(function (p2) {
    var id = { none: 'ap-none', high: 'ap-hi', medium: 'ap-med', low: 'ap-lo' }[p2];
    var btn = document.getElementById(id);
    if (!btn) return;
    btn.className = p2 === pri ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm';
  });
}

function handleAFiles(files) {
  rdFiles(files, function (obj) { if (!obj) return; window.pendingAFiles.push(obj); refreshAFileList(); });
}

function refreshAFileList() {
  var el = document.getElementById('a-file-list');
  if (!el) return;
  el.innerHTML = window.pendingAFiles.map(function (f, i) {
    var isPdf = (f.type || '').includes('pdf') || (f.name || '').toLowerCase().endsWith('.pdf');
    var icon = isPdf ? '<div class="pdf-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>PDF</div>' : '<img src="' + (f.data || f.url || '') + '" alt=""/>';
    var fid = window._fcache(f.data || f.url || '', f.name);
    return '<div class="upload-preview-item"><div class="upload-preview-thumb" onclick="pvFile(_fget(\'' + fid + '\'),\'' + (f.name || '').replace(/'/g, "\\'") + '\')">' + icon + '</div><div class="upload-preview-info"><div class="upload-preview-name">' + (f.name || 'File') + '</div><div class="upload-preview-size">' + window.fmtSz(f.size) + '</div></div><button class="upload-preview-remove" onclick="event.stopPropagation();window.pendingAFiles.splice(' + i + ',1);window.refreshAFileList()">&#10005;</button></div>';
  }).join('');
}

function saveAssignment() {
  var titleEl = document.getElementById('a-title');
  if (!titleEl) return;
  var t = titleEl.value.trim();
  if (!t) { toast('Enter a title'); return; }
  var DB = window.DB;
  if (!DB) return;
  if (!DB.assignments) DB.assignments = [];
  var dueEl = document.getElementById('a-due');
  var dueVal = dueEl ? dueEl.value : '';
  DB.assignments.unshift({
    id: 'a_' + Date.now(), title: t,
    description: (document.getElementById('a-desc') || {}).value || '',
    priority: aPriority || 'none',
    completed: false,
    dueDate: dueVal ? new Date(dueVal).toISOString() : null,
    attachments: (window.pendingAFiles || []).map(function (f) { return { data: f.url || f.data, name: f.name, type: f.type || '', size: f.size || 0 }; }),
    answerKey: (window.pendingAAnswerKey || []).map(function (f) { return { data: f.url || f.data, name: f.name, type: f.type || '', size: f.size || 0 }; }),
    syllabus: ((document.getElementById('a-syl') || {}).value || '').trim() || undefined,
    createdAt: new Date().toISOString()
  });
  window.sv('assignments');
  window.pendingAFiles = [];
  window.pendingAAnswerKey = [];
  window.cm('m-asgn');
  toast('Task added!');
  _refreshPage();
}

/* ═══════════════ TESTS ═══════════════ */
window.pendingTFiles = [];
var testEntryMode = 'direct';

function setTestMode(mode) {
  testEntryMode = mode;
  var dBtn = document.getElementById('tm-direct'), bBtn = document.getElementById('tm-breakdown');
  var dSec = document.getElementById('test-mode-direct'), bSec = document.getElementById('test-mode-breakdown');
  if (mode === 'direct') {
    if (dBtn) { dBtn.className = 'btn btn-primary btn-sm'; dBtn.style.cssText = 'flex:1;text-align:center'; }
    if (bBtn) { bBtn.className = 'btn btn-ghost btn-sm'; bBtn.style.cssText = 'flex:1;text-align:center'; }
    if (dSec) dSec.style.display = 'block'; if (bSec) bSec.style.display = 'none';
  } else {
    if (bBtn) { bBtn.className = 'btn btn-primary btn-sm'; bBtn.style.cssText = 'flex:1;text-align:center'; }
    if (dBtn) { dBtn.className = 'btn btn-ghost btn-sm'; dBtn.style.cssText = 'flex:1;text-align:center'; }
    if (bSec) bSec.style.display = 'block'; if (dSec) dSec.style.display = 'none';
  }
}

function syncBreakdownToDirect() {
  var gn = function (id) { var el = document.getElementById(id); return el ? (parseInt(el.value) || 0) : 0; };
  var total = (gn('tp-c') + gn('tc-c') + gn('tm-c')) * 4 - (gn('tp-w') + gn('tc-w') + gn('tm-w'));
  var totalQ = gn('tp-c') + gn('tp-w') + gn('tp-s') + gn('tc-c') + gn('tc-w') + gn('tc-s') + gn('tm-c') + gn('tm-w') + gn('tm-s');
  var max = totalQ * 4;
  var ct = document.getElementById('t-calc-total'); if (ct) ct.textContent = Math.max(0, total);
  var calcMaxEl = document.getElementById('t-calc-max'); if (calcMaxEl) calcMaxEl.textContent = max > 0 ? max : 300;
  var dm = document.getElementById('t-direct-marks'); if (dm) dm.value = Math.max(0, total);
  var dx = document.getElementById('t-direct-max'); if (dx) dx.value = max > 0 ? max : 300;
}

function syncDirectToBreakdown() {
  var dm = document.getElementById('t-direct-marks');
  var dx = document.getElementById('t-direct-max');
  var marks = dm ? (parseInt(dm.value) || 0) : 0;
  var max = dx ? (parseInt(dx.value) || 0) : 300;
  var ct = document.getElementById('t-calc-total'); if (ct) ct.textContent = marks;
  var calcMaxEl = document.getElementById('t-calc-max'); if (calcMaxEl) calcMaxEl.textContent = max;
}

function handleTFiles(files) {
  rdFiles(files, function (obj) { if (!obj) return; window.pendingTFiles.push(obj); refreshTFileList(); });
}

function refreshTFileList() {
  var el = document.getElementById('t-file-list');
  if (!el) return;
  el.innerHTML = window.pendingTFiles.map(function (f, i) {
    var isPdf = (f.type || '').includes('pdf') || (f.name || '').toLowerCase().endsWith('.pdf');
    var icon = isPdf ? '<div class="pdf-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>PDF</div>' : '<img src="' + (f.data || f.url || '') + '" alt=""/>';
    var fid = window._fcache(f.data || f.url || '', f.name);
    return '<div class="upload-preview-item"><div class="upload-preview-thumb" onclick="pvFile(_fget(\'' + fid + '\'),\'' + (f.name || '').replace(/'/g, "\\'") + '\')">' + icon + '</div><div class="upload-preview-info"><div class="upload-preview-name">' + (f.name || 'File') + '</div><div class="upload-preview-size">' + window.fmtSz(f.size) + '</div></div><button class="upload-preview-remove" onclick="event.stopPropagation();window.pendingTFiles.splice(' + i + ',1);window.refreshTFileList()">&#10005;</button></div>';
  }).join('');
}

function saveTest() {
  var DB = window.DB;
  var nameEl = document.getElementById('t-name');
  if (!nameEl) return;
  var name = nameEl.value.trim();
  if (!name) { toast('Enter test name'); return; }
  var p, c, m, total, maxScore;
  var gn = function (id) { var el = document.getElementById(id); return el ? (parseInt(el.value) || 0) : 0; };

  if (testEntryMode === 'direct') {
    total = parseInt((document.getElementById('t-direct-marks') || {}).value) || 0;
    maxScore = parseInt((document.getElementById('t-direct-max') || {}).value) || 300;
    var qsPerSubject = Math.round(maxScore / 4 / 3) || 25;
    var estCorrect = Math.round(total / 4);
    var estWrong = Math.max(0, Math.round((maxScore - total) / 4));
    var estUnattempted = Math.max(0, qsPerSubject * 3 - estCorrect - estWrong);
    p = { correct: Math.round(estCorrect / 3), incorrect: Math.round(estWrong / 3), unattempted: Math.max(0, Math.round(estUnattempted / 3)) };
    c = { correct: Math.round(estCorrect / 3), incorrect: Math.round(estWrong / 3), unattempted: Math.max(0, Math.round(estUnattempted / 3)) };
    m = { correct: estCorrect - Math.round(estCorrect / 3) * 2, incorrect: estWrong - Math.round(estWrong / 3) * 2, unattempted: Math.max(0, estUnattempted - Math.round(estUnattempted / 3) * 2) };
    p._synthetic = true; c._synthetic = true; m._synthetic = true;
  } else {
    p = { correct: gn('tp-c'), incorrect: gn('tp-w'), unattempted: gn('tp-s') };
    c = { correct: gn('tc-c'), incorrect: gn('tc-w'), unattempted: gn('tc-s') };
    m = { correct: gn('tm-c'), incorrect: gn('tm-w'), unattempted: gn('tm-s') };
    total = Math.max(0, (p.correct + c.correct + m.correct) * 4 - (p.incorrect + c.incorrect + m.incorrect));
    maxScore = (p.correct + p.incorrect + p.unattempted + c.correct + c.incorrect + c.unattempted + m.correct + m.incorrect + m.unattempted) * 4;
    if (maxScore <= 0) maxScore = 300;
  }
  var timing = { total: gn('test-t-tot'), physics: gn('test-t-p'), chemistry: gn('test-t-c'), maths: gn('test-t-m') };
  var syllabus = { physics: [], chemistry: [], maths: [] };
  document.querySelectorAll('.t-syl-cb:checked').forEach(function (cb) {
    var subj = cb.dataset.subj;
    if (subj && syllabus[subj]) syllabus[subj].push(cb.value);
  });
  if (!DB.tests) DB.tests = [];
  var rankVal = parseInt((document.getElementById('t-rank') || {}).value) || null;
  var pctileVal = parseFloat((document.getElementById('t-percentile') || {}).value) || null;
  DB.tests.unshift({
    id: 't_' + Date.now(), name: name,
    date: (document.getElementById('t-date') || {}).value || new Date().toISOString().split('T')[0],
    physics: p, chemistry: c, maths: m,
    totalScore: Math.max(0, total), maxScore: maxScore,
    timing: timing,
    rank: rankVal,
    percentile: pctileVal,
    papers: (window.pendingTFiles || []).map(function (f) { return { data: f.url || f.data, name: f.name, type: f.type || '', size: f.size || 0 }; }),
    answerKey: (window.pendingTAnswerKey || []).map(function (f) { return { data: f.url || f.data, name: f.name, type: f.type || '', size: f.size || 0 }; }),
    syllabus: syllabus
  });
  window.sv('tests');
  window.pendingTFiles = [];
  window.pendingTAnswerKey = [];
  window.cm('m-test');
  toast('Test saved!');
  _refreshPage();
}

/* ═══════════════ CHAPTERS ═══════════════ */
function saveAddCh() {
  var DB = window.DB;
  var subjEl = document.getElementById('addch-subj');
  var nameEl = document.getElementById('addch-name');
  if (!subjEl || !nameEl) return;
  var subj = subjEl.value;
  var name = nameEl.value.trim();
  if (!name) { toast('Enter chapter name'); return; }
  var newCh = { id: 'ch_' + Date.now(), name: name, completed: false, strength: 'uncovered' };
  if (!DB.chapters) DB.chapters = {};
  if (!DB.chapters[subj]) DB.chapters[subj] = [];
  DB.chapters[subj].push(newCh);
  window.sv('chapters');
  window.cm('m-add-ch');
  toast('Chapter added!');
  _refreshPage();
}

function saveEditCh() {
  var DB = window.DB;
  var subjEl = document.getElementById('editch-subj');
  var idEl = document.getElementById('editch-id');
  var nameEl = document.getElementById('editch-name');
  if (!subjEl || !idEl || !nameEl) return;
  var subj = subjEl.value;
  var id = idEl.value;
  var name = nameEl.value.trim();
  if (!name) { toast('Enter chapter name'); return; }
  var ch = DB.chapters[subj] && DB.chapters[subj].find(function (c) { return c.id === id; });
  if (!ch) { toast('Chapter not found'); return; }
  ch.name = name;
  window.sv('chapters');
  window.cm('m-edit-ch');
  toast('Updated!');
  _refreshPage();
}

function deleteEditCh() {
  var DB = window.DB;
  var subjEl = document.getElementById('editch-subj');
  var idEl = document.getElementById('editch-id');
  if (!subjEl || !idEl) return;
  var subj = subjEl.value;
  var id = idEl.value;
  cfm2('Delete chapter?', 'This cannot be undone.', function () {
    if (DB.chapters[subj]) DB.chapters[subj] = DB.chapters[subj].filter(function (c) { return c.id !== id; });
    window.sv('chapters');
    window.cm('m-edit-ch');
    toast('Deleted');
    _refreshPage();
  });
}

/* ═══════════════ MOCK TEST ═══════════════ */
function saveMockTest() {
  var DB = window.DB;
  var nameEl = document.getElementById('mt-name');
  var name = nameEl ? nameEl.value.trim() : '';
  if (!name) { toast('Enter test name'); return; }
  var subjEl = document.getElementById('mt-subj');
  var subj = subjEl ? subjEl.value : 'Full Syllabus';
  var scoredEl = document.getElementById('mt-scored');
  var scored = parseInt(scoredEl ? scoredEl.value : '0') || 0;
  var totalEl = document.getElementById('mt-total');
  var total = parseInt(totalEl ? totalEl.value : '0') || 300;
  var correct = Math.round(scored / 4);
  var incorrect = Math.max(0, Math.round((total - scored) / 4));
  var unattempted = Math.max(0, 75 - correct - incorrect);
  if (!DB.mockTests) DB.mockTests = [];
  DB.mockTests.unshift({
    id: 'mt_' + Date.now(), name: name, subject: subj,
    date: (document.getElementById('mt-date') || {}).value || new Date().toISOString().split('T')[0],
    total: total,
    physics: { correct: Math.round(correct * 0.33), incorrect: Math.round(incorrect * 0.33), unattempted: Math.round(unattempted * 0.33), _synthetic: true },
    chemistry: { correct: Math.round(correct * 0.33), incorrect: Math.round(incorrect * 0.33), unattempted: Math.round(unattempted * 0.33), _synthetic: true },
    maths: { correct: correct - Math.round(correct * 0.33) * 2, incorrect: incorrect - Math.round(incorrect * 0.33) * 2, unattempted: unattempted - Math.round(unattempted * 0.33) * 2, _synthetic: true },
    syllabus: (document.getElementById('mt-syllabus') || {}).value || '',
    time: (document.getElementById('mt-time') || {}).value || '',
    review: (document.getElementById('mt-review') || {}).value || ''
  });
  window.sv('mockTests');
  ['mt-name', 'mt-scored', 'mt-total', 'mt-time', 'mt-syllabus', 'mt-review'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.value = '';
  });
  var sd = document.getElementById('mt-date');
  if (sd) sd.value = new Date().toISOString().split('T')[0];
  var sj = document.getElementById('mt-subj');
  if (sj) sj.value = 'Full Syllabus';
  window.cm('m-mocktest');
  toast('Mock test saved!');
  _refreshPage();
}

/* ═══════════════ CHAPTER SUBJECT PICKER ═══════════════ */
function pickChSubj(btn) {
  var pills = btn.parentElement.querySelectorAll('.subj-pill');
  pills.forEach(function (p) { p.classList.remove('active'); });
  btn.classList.add('active');
  var subjEl = document.getElementById('addch-subj');
  if (subjEl) subjEl.value = btn.dataset.subj;
}

/* ═══════════════ GLOBAL EXPORTS ═══════════════ */
window.setAP = setAP;
window.handleAFiles = handleAFiles;
window.refreshAFileList = refreshAFileList;
window.saveAssignment = saveAssignment;
window.setTestMode = setTestMode;
window.syncBreakdownToDirect = syncBreakdownToDirect;
window.syncDirectToBreakdown = syncDirectToBreakdown;
window.handleTFiles = handleTFiles;
window.refreshTFileList = refreshTFileList;
window.saveTest = saveTest;

window.saveAddCh = saveAddCh;
window.saveEditCh = saveEditCh;
window.deleteEditCh = deleteEditCh;
window.saveMockTest = saveMockTest;
window.pickChSubj = pickChSubj;

window._refreshPage = _refreshPage;
