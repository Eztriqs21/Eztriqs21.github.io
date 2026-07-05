// page-js/mock-tests.js — Mock Tests page
(function() {
  function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
  function fmtDate(d) { return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }); }
  function safePct(a, b) { return b > 0 ? Math.round((a / b) * 100) : 0; }

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

    return `<div class="card anim-entrance" style="--delay:${i * 0.04}s;padding:0;overflow:hidden">
      <div style="padding:16px 18px">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
          <div style="flex:1;min-width:0">
            <div style="font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(t.name || 'Mock Test')}</div>
            <div style="font-size:11px;color:var(--muted)">${fmtDate(t.date)}${t.syllabus ? ' · ' + esc(t.syllabus) : ''}</div>
          </div>
          <div style="text-align:right;flex-shrink:0">
            <div style="font-size:20px;font-weight:700;color:${color}">${Math.max(0, total)}</div>
            <div style="font-size:10px;color:var(--muted)">/${maxScore}</div>
          </div>
        </div>
        <div style="display:flex;gap:8px;margin-bottom:12px">
          ${subjectBreakdown(t, 'physics')}
          ${subjectBreakdown(t, 'chemistry')}
          ${subjectBreakdown(t, 'maths')}
        </div>
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
    <div style="display:flex;gap:8px;margin-bottom:16px;align-items:center;flex-wrap:wrap">
      <button class="btn btn-primary btn-sm anim-entrance" onclick="window.openAddMockTest()" style="--delay:0s">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        Log Mock Test
      </button>
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
              <div class="empty-sub">Log a mock test result to get started</div>
            </div>`
          : [...tests].sort((a, b) => new Date(b.date) - new Date(a.date)).map((t, i) => mockCard(t, i)).join('')}
      </div>
    </div>`;
  };

  /* ═══════════════ CRUD ═══════════════ */
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
