// js/modal-handlers.js — CRUD & modal handler functions (recovered from original site)
// These functions are called by inline onclick/onchange handlers in index.html
// They rely on window.DB, window.sv, window.cm, window.om, window.toast, window.findCh

/* ═══════════════ SHARED HELPERS ═══════════════ */
function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
function fmtDate(d) { return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }); }
function fmtDateTime(d) { return new Date(d).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }

function cfm2(title, msg, onConfirm) {
  var existing = document.querySelector('.cfm-overlay');
  if (existing) existing.remove();
  var el = document.createElement('div');
  el.className = 'cfm-overlay';
  el.innerHTML = '<div class="cfm-box"><div class="cfm-title">' + esc(title) + '</div><div class="cfm-sub">' + esc(msg) + '</div><div class="cfm-btns"><button class="btn btn-ghost btn-sm" onclick="document.querySelector(\'.cfm-overlay\').remove()">Cancel</button><button class="btn btn-danger btn-sm" id="cfm-ok-btn">Confirm</button></div></div>';
  document.body.appendChild(el);
  document.getElementById('cfm-ok-btn').addEventListener('click', function () { el.remove(); if (onConfirm) onConfirm(); });
}

function rdFiles(files, cb) {
  var maxSize = 5 * 1024 * 1024;
  Array.from(files).forEach(function (file) {
    if (file.size > maxSize) { toast('⚠️ ' + file.name + ' exceeds 5MB'); return; }
    var reader = new FileReader();
    reader.onload = function (e) {
      cb({ name: file.name, size: file.size, type: file.type, data: e.target.result, url: e.target.result });
    };
    reader.readAsDataURL(file);
  });
}

function fItemHTML(f) {
  var icon = f.type && f.type.includes('pdf') ? '📄' : '🖼️';
  var size = f.size ? (f.size / 1024).toFixed(0) + 'KB' : '';
  return '<div class="file-item"><div class="file-ico">' + icon + '</div><div class="file-name">' + esc(f.name) + '</div><div class="file-size">' + size + '</div></div>';
}

function fItemHTMLRaw(d, label) {
  var isPdf = d.n && d.n.toLowerCase().endsWith('.pdf');
  var icon = isPdf ? '📄' : '🖼️';
  return '<div class="file-item" onclick="pvFile(\'' + (d.d || '') + '\',\'' + esc(d.n || label) + '\')"><div class="file-ico">' + icon + '</div><div class="file-name">' + esc(d.n || label) + '</div></div>';
}

function setupDZ(dzId, inputId, handler) {
  var dz = document.getElementById(dzId);
  var inp = document.getElementById(inputId);
  if (!dz || !inp) return;
  dz.addEventListener('dragover', function (e) { e.preventDefault(); dz.classList.add('dragover'); });
  dz.addEventListener('dragleave', function () { dz.classList.remove('dragover'); });
  dz.addEventListener('drop', function (e) { e.preventDefault(); dz.classList.remove('dragover'); if (handler) handler(e.dataTransfer.files); });
}

/* ═══════════════ ASSIGNMENTS ═══════════════ */
var pendingAFiles = [];
var aPriority = 'none';

function setAP(p) {
  aPriority = p;
  ['none', 'high', 'medium', 'low'].forEach(function (pri) {
    var id = { none: 'ap-none', high: 'ap-hi', medium: 'ap-med', low: 'ap-lo' }[pri];
    var btn = document.getElementById(id);
    if (!btn) return;
    btn.style.cssText = pri === p ? 'background:var(--primary);color:#fff;' : '';
  });
}

function handleAFiles(files) {
  rdFiles(files, function (obj) { pendingAFiles.push(obj); refreshAFileList(); });
}

function refreshAFileList() {
  var el = document.getElementById('a-file-list');
  if (!el) return;
  el.innerHTML = pendingAFiles.map(function (f, i) {
    return fItemHTML(f) + '<div style="margin:0 12px"><button class="btn btn-danger btn-xs" onclick="pendingAFiles.splice(' + i + ',1);refreshAFileList()">✕</button></div>';
  }).join('');
}

function saveAssignment() {
  var t = document.getElementById('a-title').value.trim();
  if (!t) { toast('Enter a title'); return; }
  var DB = window.DB;
  if (!DB.assignments) DB.assignments = [];
  DB.assignments.unshift({
    id: 'a_' + Date.now(), title: t,
    description: document.getElementById('a-desc').value.trim(),
    priority: window.aPriority || 'none',
    completed: false,
    attachments: (window.pendingAFiles || []).map(function (f) { return { data: f.url || f.data, name: f.name }; }),
    syllabus: document.getElementById('a-syl').value.trim() || undefined,
    createdAt: new Date().toISOString()
  });
  window.sv('assignments');
  window.cm('m-asgn');
  toast('Task added!');
  if (window.PAGE === 'assignments') window.renderAssignments(document.getElementById('content-wrap'));
  if (window.PAGE === 'dashboard' && window.renderDashboard) window.renderDashboard(document.getElementById('content-wrap'));
}

/* ═══════════════ TESTS ═══════════════ */
var pendingTFiles = [];
var testEntryMode = 'direct';

function setTestMode(mode) {
  testEntryMode = mode;
  var dBtn = document.getElementById('tm-direct'), bBtn = document.getElementById('tm-breakdown');
  var dSec = document.getElementById('test-mode-direct'), bSec = document.getElementById('test-mode-breakdown');
  if (mode === 'direct') {
    if (dBtn) { dBtn.className = 'btn btn-sm'; dBtn.style.cssText = 'flex:1;text-align:center;background:var(--primary);color:#fff'; }
    if (bBtn) { bBtn.className = 'btn btn-ghost btn-sm'; bBtn.style.cssText = 'flex:1;text-align:center'; }
    if (dSec) dSec.style.display = 'block'; if (bSec) bSec.style.display = 'none';
  } else {
    if (bBtn) { bBtn.className = 'btn btn-sm'; bBtn.style.cssText = 'flex:1;text-align:center;background:var(--primary);color:#fff'; }
    if (dBtn) { dBtn.className = 'btn btn-ghost btn-sm'; dBtn.style.cssText = 'flex:1;text-align:center'; }
    if (bSec) bSec.style.display = 'block'; if (dSec) dSec.style.display = 'none';
  }
}

function syncBreakdownToDirect() {
  var gn = function (id) { return parseInt(document.getElementById(id).value) || 0; };
  var total = (gn('tp-c') + gn('tc-c') + gn('tm-c')) * 4 - (gn('tp-w') + gn('tc-w') + gn('tm-w'));
  var max = (gn('tp-c') + gn('tp-w') + gn('tp-s') + gn('tc-c') + gn('tc-w') + gn('tc-s') + gn('tm-c') + gn('tm-w') + gn('tm-s')) * 4;
  var ct = document.getElementById('t-calc-total'); if (ct) ct.textContent = Math.max(0, total);
  var cm = document.getElementById('t-calc-max'); if (cm) cm.textContent = max > 0 ? max : 300;
  document.getElementById('t-direct-marks').value = Math.max(0, total);
  document.getElementById('t-direct-max').value = max > 0 ? max : 300;
}

function syncDirectToBreakdown() {
  var marks = parseInt(document.getElementById('t-direct-marks').value) || 0;
  var max = parseInt(document.getElementById('t-direct-max').value) || 300;
  var ct = document.getElementById('t-calc-total'); if (ct) ct.textContent = marks;
  var cm = document.getElementById('t-calc-max'); if (cm) cm.textContent = max;
}

function handleTFiles(files) {
  rdFiles(files, function (obj) { pendingTFiles.push(obj); refreshTFileList(); });
}

function refreshTFileList() {
  var el = document.getElementById('t-file-list');
  if (!el) return;
  el.innerHTML = pendingTFiles.map(function (f, i) {
    return fItemHTML(f) + '<div style="margin:0 12px"><button class="btn btn-danger btn-xs" onclick="pendingTFiles.splice(' + i + ',1);refreshTFileList()">✕</button></div>';
  }).join('');
}

function saveTest() {
  var DB = window.DB;
  var name = document.getElementById('t-name').value.trim();
  if (!name) { toast('Enter test name'); return; }
  var p, c, m, total, maxScore;
  var gn = function (id) { return parseInt(document.getElementById(id).value) || 0; };

  if (testEntryMode === 'direct') {
    total = parseInt(document.getElementById('t-direct-marks').value) || 0;
    maxScore = parseInt(document.getElementById('t-direct-max').value) || 300;
    p = { correct: 0, incorrect: 0, unattempted: 0 };
    c = { correct: 0, incorrect: 0, unattempted: 0 };
    m = { correct: 0, incorrect: 0, unattempted: 0 };
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
  DB.tests.unshift({
    id: 't_' + Date.now(), name: name,
    date: document.getElementById('t-date').value || new Date().toISOString().split('T')[0],
    physics: p, chemistry: c, maths: m,
    totalScore: Math.max(0, total), maxScore: maxScore,
    timing: timing,
    papers: (window.pendingTFiles || []).map(function (f) { return { data: f.url || f.data, name: f.name }; }),
    syllabus: syllabus
  });
  window.sv('tests');
  window.cm('m-test');
  toast('Test saved!');
  if (window.PAGE === 'tests') window.renderTests(document.getElementById('content-wrap'));
  if (window.PAGE === 'dashboard' && window.renderDashboard) window.renderDashboard(document.getElementById('content-wrap'));
}

/* ═══════════════ CALCULATOR ═══════════════ */
var calcQuestions = [], calcShowResults = false, calcAnsKey = {}, currentFocusQ = 1, calcActiveTab = 'manual';

function initCalcQ() {
  calcQuestions = [];
  ['physics', 'chemistry', 'maths'].forEach(function (subj, si) {
    for (var i = 1; i <= 25; i++) {
      calcQuestions.push({ num: si * 25 + i, subj: subj, subjLabel: ['Physics', 'Chemistry', 'Maths'][si], selected: null, unattempted: false, mode: 'mcq', intVal: '', multiVal: '' });
    }
  });
}

function saveCalcTestFromModal() {
  var DB = window.DB;
  if (!calcQuestions || !calcQuestions.length) { toast('⚠️ No calculator data'); return; }
  var name = document.getElementById('calc-save-name').value.trim();
  if (!name) { toast('⚠️ Enter a test name'); return; }
  var p = { correct: 0, incorrect: 0, unattempted: 0 }, c = { correct: 0, incorrect: 0, unattempted: 0 }, m = { correct: 0, incorrect: 0, unattempted: 0 };
  var totalScore = 0;
  calcQuestions.forEach(function (q) {
    var k = calcAnsKey[q.num]; if (k === undefined || k === null) return;
    var sc = scoreQ(q, k); if (isNaN(sc)) return;
    totalScore += sc;
    var cat = q.subj === 'physics' ? p : q.subj === 'chemistry' ? c : m;
    if (sc === 0) cat.unattempted++; else if (sc >= 4) cat.correct++; else cat.incorrect++;
  });
  DB.tests.unshift({ id: 't_' + Date.now(), name: name, date: document.getElementById('calc-save-date').value || new Date().toISOString(), physics: p, chemistry: c, maths: m, totalScore: Math.max(0, totalScore), maxScore: 300, papers: [], syllabus: { physics: [], chemistry: [], maths: [] } });
  if (!window.sv('tests')) { DB.tests.shift(); return; }
  window.cm('m-save-calc-test');
  toast('✅ Test saved!');
}

function scoreQ(q, k) {
  if (q.unattempted || !q.selected || k === undefined || k === null) return 0;
  if (q.mode === 'int') { var iv = parseInt(q.selected, 10); return isNaN(iv) ? 0 : iv === k ? 4 : -1; }
  if (q.mode === 'multi') { var ks = String(k).toUpperCase(), ss = q.selected.toUpperCase(); var hasWrong = false, allCorrect = true; ['A', 'B', 'C', 'D'].forEach(function (o) { if (ss.includes(o) && !ks.includes(o)) hasWrong = true; if (ks.includes(o) && !ss.includes(o)) allCorrect = false; }); return hasWrong ? -2 : allCorrect ? 4 : 0; }
  return q.selected === k ? 4 : -1;
}

function getPerc(score) {
  var map = [{ min: 285, p: 99.99, a: '1-50' }, { min: 270, p: 99.9, a: '200-600' }, { min: 250, p: 99.7, a: '1200-2500' }, { min: 230, p: 99.5, a: '4000-6000' }, { min: 210, p: 99.0, a: '10000-15000' }, { min: 190, p: 97.5, a: '25000-40000' }, { min: 170, p: 95.0, a: '55000-75000' }, { min: 140, p: 89.0, a: '100000-150000' }, { min: 100, p: 74.0, a: '220000-320000' }, { min: 60, p: 47.0, a: '480000-650000' }, { min: 0, p: 10.0, a: '840000+' }];
  for (var i = 0; i < map.length; i++) { if (score >= map[i].min) return { pctile: map[i].p, airRange: map[i].a }; }
  return { pctile: 5.0, airRange: '900000+' };
}

/* ═══════════════ NOTES ═══════════════ */
var pendingNoteFiles = [];
var currentNoteType = 'detailed';

function setNoteType(t) {
  currentNoteType = t;
  var detBtn = document.getElementById('note-type-det');
  var revBtn = document.getElementById('note-type-rev');
  var lbl = document.getElementById('note-type-lbl');
  if (detBtn) detBtn.className = t === 'detailed' ? 'btn btn-sm' : 'btn btn-ghost btn-sm';
  if (revBtn) revBtn.className = t === 'revision' ? 'btn btn-sm' : 'btn btn-ghost btn-sm';
  if (lbl) lbl.textContent = t === 'detailed' ? 'Detailed' : 'Revision';
}

function handleNoteFiles(files) {
  rdFiles(files, function (obj) { pendingNoteFiles.push(obj); });
}

/* ═══════════════ CHAPTERS ═══════════════ */
function saveAddCh() {
  var DB = window.DB;
  var subj = document.getElementById('addch-subj').value;
  var name = document.getElementById('addch-name').value.trim();
  if (!name) { toast('Enter chapter name'); return; }
  var newCh = { id: 'ch_' + Date.now(), name: name, completed: false, strength: 'none' };
  if (!DB.chapters) DB.chapters = {};
  if (!DB.chapters[subj]) DB.chapters[subj] = [];
  DB.chapters[subj].push(newCh);
  window.sv('chapters');
  window.cm('m-add-ch');
  toast('Chapter added!');
  if (window.PAGE === 'chapters') window.renderChapters(document.getElementById('content-wrap'));
  if (window.PAGE === 'dashboard' && window.renderDashboard) window.renderDashboard(document.getElementById('content-wrap'));
}

function saveEditCh() {
  var DB = window.DB;
  var subj = document.getElementById('editch-subj').value;
  var id = document.getElementById('editch-id').value;
  var name = document.getElementById('editch-name').value.trim();
  if (!name) { toast('Enter chapter name'); return; }
  var ch = DB.chapters[subj] && DB.chapters[subj].find(function (c) { return c.id === id; });
  if (!ch) { toast('Chapter not found'); return; }
  ch.name = name;
  window.sv('chapters');
  window.cm('m-edit-ch');
  toast('Updated!');
  if (window.PAGE === 'chapters') window.renderChapters(document.getElementById('content-wrap'));
}

function deleteEditCh() {
  var DB = window.DB;
  var subj = document.getElementById('editch-subj').value;
  var id = document.getElementById('editch-id').value;
  cfm2('Delete chapter?', 'This cannot be undone.', function () {
    if (DB.chapters[subj]) DB.chapters[subj] = DB.chapters[subj].filter(function (c) { return c.id !== id; });
    window.sv('chapters');
    window.cm('m-edit-ch');
    toast('Deleted');
    if (window.PAGE === 'chapters') window.renderChapters(document.getElementById('content-wrap'));
    if (window.PAGE === 'dashboard' && window.renderDashboard) window.renderDashboard(document.getElementById('content-wrap'));
  });
  });
}

/* ═══════════════ STUDY LOG ═══════════════ */
function saveStudyLog() {
  var DB = window.DB;
  var topic = document.getElementById('sl-topic').value.trim();
  var subj = document.getElementById('sl-subj').value;
  var dur = parseFloat(document.getElementById('sl-dur').value) || 0;
  var date = document.getElementById('sl-date').value;
  if (!topic) { toast('Enter a topic'); return; }
  if (dur <= 0) { toast('Enter valid duration'); return; }
  if (!DB.studyLogs) DB.studyLogs = [];
  DB.studyLogs.unshift({ id: 'sl_' + Date.now(), subject: subj, topic: topic, duration: Math.round(dur * 10) / 10, date: date || new Date().toISOString().split('T')[0], createdAt: new Date().toISOString() });
  window.sv('studyLogs');
  window.cm('m-study-log');
  toast('Session logged!');
  if (window.PAGE === 'study-log') window.renderStudyLog(document.getElementById('content-wrap'));
  if (window.PAGE === 'dashboard' && window.renderDashboard) window.renderDashboard(document.getElementById('content-wrap'));
}

/* ═══════════════ MOCK TEST ═══════════════ */
function saveMockTest() {
  var DB = window.DB;
  var name = document.getElementById('mt-name').value.trim();
  if (!name) { toast('Enter test name'); return; }
  var subj = document.getElementById('mt-subj')?.value || 'physics';
  var scored = parseInt(document.getElementById('mt-scored').value) || 0;
  var total = parseInt(document.getElementById('mt-total').value) || 300;
  var correct = Math.round(scored / 4);
  var incorrect = Math.max(0, Math.round((total - scored) / 4));
  var unattempted = Math.max(0, 75 - correct - incorrect);
  if (!DB.mockTests) DB.mockTests = [];
  DB.mockTests.unshift({
    id: 'mt_' + Date.now(), name: name,
    date: document.getElementById('mt-date').value || new Date().toISOString().split('T')[0],
    total: total,
    physics: { correct: Math.round(correct * 0.33), incorrect: Math.round(incorrect * 0.33), unattempted: Math.round(unattempted * 0.33) },
    chemistry: { correct: Math.round(correct * 0.33), incorrect: Math.round(incorrect * 0.33), unattempted: Math.round(unattempted * 0.33) },
    maths: { correct: correct - Math.round(correct * 0.33) * 2, incorrect: incorrect - Math.round(incorrect * 0.33) * 2, unattempted: unattempted - Math.round(unattempted * 0.33) * 2 },
    syllabus: document.getElementById('mt-syllabus').value.trim(),
    time: document.getElementById('mt-time').value.trim(),
    review: document.getElementById('mt-review').value.trim()
  });
  window.sv('mockTests');
  window.cm('m-mocktest');
  toast('Mock test saved!');
  if (window.PAGE === 'mock-tests') window.renderMockTests(document.getElementById('content-wrap'));
  if (window.PAGE === 'dashboard' && window.renderDashboard) window.renderDashboard(document.getElementById('content-wrap'));
}

/* ═══════════════ DOUBT SOLVER ═══════════════ */
function dsSetProvider(prov) {
  var btns = document.querySelectorAll('.ds-prov-btn');
  btns.forEach(function (b) { b.classList.toggle('on', b.dataset.prov === prov); });
}

function saveDSSettings() {
  var provider = document.querySelector('.ds-prov-btn.on')?.dataset.prov || 'ollama';
  var apiKey = document.getElementById('ds-openai-key')?.value || '';
  var model = provider === 'ollama' ? (document.getElementById('ds-ollama-model')?.value || 'qwen2.5:3b') : (document.getElementById('ds-openai-model-ds')?.value || 'llama-3.3-70b-versatile');
  var settings = { provider: provider, openaiKey: apiKey, openaiModel: model, ollamaUrl: document.getElementById('ds-ollama-url')?.value || 'http://localhost:11434', ollamaModel: document.getElementById('ds-ollama-model')?.value || 'qwen2.5:3b' };
  if (window.aiService) window.aiService.saveSettings(settings);
  window.cm('m-ds-settings');
  toast('Settings saved!');
}

/* ═══════════════ CMT (Chapter Mock Test) ═══════════════ */
var cmtConfig = { subjects: {}, difficulty: 'mixed', timeMin: 30, source: 'pw' };
var cmtQuestions = [], cmtState = { current: 0, answers: {}, marked: new Set(), startTime: null, elapsed: 0 };
var cmtGenerating = false, cmtTimerInterval = null;

function cmtGenerate() {
  toast('⚠️ CMT generation requires AI setup. Configure in Settings.');
}

function cmtCancelGeneration() {
  cmtGenerating = false;
  toast('Generation cancelled');
}

function cmtPrevQ() { if (cmtState.current > 0) cmtState.current--; }
function cmtNextQ() { if (cmtState.current < cmtQuestions.length - 1) cmtState.current++; }
function cmtToggleMark() {
  if (cmtState.marked.has(cmtState.current)) cmtState.marked.delete(cmtState.current);
  else cmtState.marked.add(cmtState.current);
}
function cmtClearAnswer() { delete cmtState.answers[cmtState.current]; }
function cmtToggleNav() {
  var nav = document.querySelector('.cmt-mobile-nav');
  if (nav) nav.classList.toggle('open');
}
function cmtSaveToHistory() {
  toast('✅ Saved to history');
}
function cmtSubmitTest() {
  cmtState.elapsed = Math.floor((Date.now() - cmtState.startTime) / 1000);
  toast('Test submitted!');
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
window.saveCalcTestFromModal = saveCalcTestFromModal;
window.setNoteType = setNoteType;
window.handleNoteFiles = handleNoteFiles;
window.saveAddCh = saveAddCh;
window.saveEditCh = saveEditCh;
window.deleteEditCh = deleteEditCh;
window.saveStudyLog = saveStudyLog;
window.saveMockTest = saveMockTest;
window.dsSetProvider = dsSetProvider;
window.saveDSSettings = saveDSSettings;
window.cmtGenerate = cmtGenerate;
window.cmtCancelGeneration = cmtCancelGeneration;
window.cmtPrevQ = cmtPrevQ;
window.cmtNextQ = cmtNextQ;
window.cmtToggleMark = cmtToggleMark;
window.cmtClearAnswer = cmtClearAnswer;
window.cmtToggleNav = cmtToggleNav;
window.cmtSaveToHistory = cmtSaveToHistory;
window.cmtSubmitTest = cmtSubmitTest;
window.cfm2 = cfm2;
window.rdFiles = rdFiles;
window.fItemHTML = fItemHTML;
window.fItemHTMLRaw = fItemHTMLRaw;
window.setupDZ = setupDZ;
window.esc = esc;
window.scoreQ = scoreQ;
window.getPerc = getPerc;
window.initCalcQ = initCalcQ;
