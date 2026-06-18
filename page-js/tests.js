// page-js/tests.js — Tests page (Nexus & Bloom)
(function() {
  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML.replace(/'/g, '&#39;'); }
  function fmtDate(d) { return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }); }
  function getTheme() { return document.documentElement.getAttribute('data-theme') || 'nexus'; }
  function pfx() { return getTheme() === 'nexus' ? 'nx' : 'bl'; }

  let _testSearch = '';

  function _anim() {
    var el = document.getElementById('content-wrap');
    if (el && typeof window.animateAllEntrance === 'function') window.animateAllEntrance(el);
    if (el && typeof window.animateAllCounters === 'function') window.animateAllCounters(el);
  }

  function tstCard(t, i) {
    const p = pfx();
    const pct = t.maxScore > 0 ? Math.round(t.totalScore / t.maxScore * 100) : 0;
    const color = pct >= 70 ? 'var(--success)' : pct >= 50 ? 'var(--accent)' : 'var(--danger)';
    const phS = Math.max(0, (t.physics || {}).correct * 4 - (t.physics || {}).incorrect);
    const chS = Math.max(0, (t.chemistry || {}).correct * 4 - (t.chemistry || {}).incorrect);
    const mS = Math.max(0, (t.maths || {}).correct * 4 - (t.maths || {}).incorrect);
    const papers = t.papers || [];

    return `<div class="${p}-card anim-entrance" style="--delay:${i * 0.04}s;padding:0;overflow:hidden">
      <div style="padding:16px 18px">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
          <div style="width:32px;height:32px;border-radius:8px;background:var(--border-card);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:var(--text-muted);flex-shrink:0">#${i + 1}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(t.name)}</div>
            <div style="font-size:11px;color:var(--muted)">${fmtDate(t.date)}</div>
          </div>
          <div style="text-align:right;flex-shrink:0">
            <div style="font-size:20px;font-weight:700;color:${color}">${t.totalScore}</div>
            <div style="font-size:10px;color:var(--muted)">/${t.maxScore}</div>
          </div>
        </div>
        <div style="display:flex;gap:12px;margin-bottom:12px">
          <div style="flex:1;text-align:center;padding:8px;border-radius:8px;background:var(--border-card)">
            <div style="font-size:14px;font-weight:700;color:var(--phys)">${phS}</div>
            <div style="font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.05em">Physics</div>
          </div>
          <div style="flex:1;text-align:center;padding:8px;border-radius:8px;background:var(--border-card)">
            <div style="font-size:14px;font-weight:700;color:var(--chem)">${chS}</div>
            <div style="font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.05em">Chemistry</div>
          </div>
          <div style="flex:1;text-align:center;padding:8px;border-radius:8px;background:var(--border-card)">
            <div style="font-size:14px;font-weight:700;color:var(--math)">${mS}</div>
            <div style="font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.05em">Maths</div>
          </div>
        </div>
        ${papers.length ? '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px">' + papers.map((d, fi) => '<span style="font-size:10px;padding:2px 8px;border-radius:4px;background:var(--border-card);color:var(--text-muted);cursor:pointer" onclick="window.pvFile(\'' + esc(d.data || '') + '\',\'' + esc(d.name || 'Paper') + '\')">' + esc(d.name || 'File ' + (fi + 1)) + '</span>').join('') + '</div>' : ''}
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="${p}-btn-ghost" style="font-size:10px;padding:4px 10px;color:var(--danger)" onclick="window.delTest('${t.id}')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Delete
          </button>
        </div>
      </div>
    </div>`;
  }

  window.renderTests = function(el) {
    const p = pfx();
    const DB = window.DB;
    if (!DB) { el.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-muted)">Loading data...</div>'; return; }
    let tests = DB.tests || [];
    if (_testSearch.trim()) {
      const q = _testSearch.trim().toLowerCase();
      tests = tests.filter(t => (t.name || '').toLowerCase().includes(q));
    }
    const avg = tests.length ? Math.round(tests.reduce((s, t) => s + (t.maxScore > 0 ? (t.totalScore / t.maxScore) * 100 : 0), 0) / tests.length) : 0;

    el.innerHTML = `
    <div class="${p}-page-header anim-entrance" style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px">
      <div>
        <div class="${p}-page-title" data-text="Tests">Tests</div>
        <div class="${p}-page-sub">Test history and performance analysis</div>
      </div>
      <button class="${p}-btn ${p}-btn-primary" onclick="window.openAddTest()">+ Add Test</button>
    </div>
    <input class="${p}-input anim-entrance" type="text" placeholder="Search tests by name..." oninput="window._testSearchFn(this.value)" style="font-size:13px;margin-bottom:16px" value="${esc(_testSearch)}" autocomplete="off">
    <div class="${p}-stats-grid anim-entrance" style="--delay:0.1s">
      <div class="${p}-stat-card">
        <div class="${p}-stat-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></div>
        <div class="${p}-stat-val"><span data-count="${(DB.tests || []).length}">0</span></div>
        <div class="${p}-stat-label">Total Tests</div>
        <div class="${p}-stat-sub">${_testSearch ? 'Filtered' : 'All time'}</div>
      </div>
      <div class="${p}-stat-card">
        <div class="${p}-stat-icon" style="color:var(--accent)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
        <div class="${p}-stat-val" style="color:var(--accent)"><span data-count="${avg}">0</span>%</div>
        <div class="${p}-stat-label">Average Score</div>
        <div class="${p}-stat-sub">Across all tests</div>
      </div>
    </div>
    <div class="${p}-section-block anim-entrance" style="--delay:0.2s">
      <div class="${p}-section-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> Test History (${tests.length})</div>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${tests.length === 0
          ? `<div class="${p}-empty" style="padding:32px">
              <div class="${p}-empty-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></div>
              <div class="${p}-empty-title">No tests recorded</div>
              <div class="${p}-empty-sub">Tap + to add your first test result</div>
            </div>`
          : [...tests].sort((a, b) => new Date(b.date) - new Date(a.date)).map((t, i) => tstCard(t, i)).join('')}
      </div>
    </div>`;
  };

  /* CRUD */
  window.openAddTest = function() {
    window.pendingTFiles = [];
    var fl = document.getElementById('t-file-list'); if (fl) fl.innerHTML = '';
    ['t-name', 't-direct-marks', 't-direct-max', 'tp-c', 'tp-w', 'tp-s', 'tc-c', 'tc-w', 'tc-s', 'tm-c', 'tm-w', 'tm-s', 'test-t-p', 'test-t-c', 'test-t-m', 'test-t-tot'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.value = '';
    });
    var dateEl = document.getElementById('t-date');
    if (dateEl) dateEl.value = new Date().toISOString().split('T')[0];
    var grid = document.getElementById('t-syl-grid');
    if (grid) {
      var DB = window.DB;
      if (!DB) return;
      var html = '';
      ['physics', 'chemistry', 'maths'].forEach(function(subj) {
        var chapters = (DB.chapters || {})[subj] || [];
        chapters.forEach(function(ch) {
          html += '<label style="display:flex;align-items:center;gap:4px;font-size:11px;padding:3px 6px;border-radius:4px;border:1px solid var(--border);cursor:pointer"><input type="checkbox" class="t-syl-cb" data-subj="' + subj + '" value="' + esc(ch.name) + '"/> ' + esc(ch.name) + '</label>';
        });
      });
      grid.innerHTML = html || '<div style="font-size:11px;color:var(--muted)">No chapters added yet</div>';
    }
    if (window.om) window.om('m-test');
    setTimeout(function() { var t = document.getElementById('t-name'); if (t) t.focus(); }, 320);
  };

  window.delTest = function(id) {
    var DB = window.DB;
    if (!DB || !DB.tests) return;
    if (window.cfm2) {
      window.cfm2('Delete Test', 'Are you sure you want to delete this test?', function() {
        DB.tests = DB.tests.filter(t => t.id !== id);
        if (window.sv) window.sv('tests');
        window.renderTests(document.getElementById('content-wrap'));
        _anim();
        if (window.toast) window.toast('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Test deleted');
      });
    } else {
      DB.tests = DB.tests.filter(t => t.id !== id);
      if (window.sv) window.sv('tests');
      window.renderTests(document.getElementById('content-wrap'));
      _anim();
    }
  };

  window._testSearchFn = function(val) {
    _testSearch = val || '';
    window.renderTests(document.getElementById('content-wrap'));
    _anim();
  };
})();
