// page-js/tests.js — Tests page (Nexus & Bloom)
(function() {
  function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
  function fmtDate(d) { return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }); }

  let _testSearch = '';

  function tstCard(t, i) {
    const pct = t.maxScore > 0 ? Math.round(t.totalScore / t.maxScore * 100) : 0;
    const color = pct >= 70 ? 'var(--success)' : pct >= 50 ? 'var(--accent)' : 'var(--danger)';
    const phS = Math.max(0, (t.physics || {}).correct * 4 - (t.physics || {}).incorrect);
    const chS = Math.max(0, (t.chemistry || {}).correct * 4 - (t.chemistry || {}).incorrect);
    const mS = Math.max(0, (t.maths || {}).correct * 4 - (t.maths || {}).incorrect);
    const papers = t.papers || [];
    const answerKey = t.answerKey || [];

    return `<div class="card anim-entrance" style="--delay:${i * 0.04}s;padding:0;overflow:hidden" data-tutorial-id="test-card">
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
        ${(t.rank || t.percentile) ? '<div style="display:flex;gap:8px;margin-bottom:10px">' + (t.rank ? '<span style="font-size:10px;padding:3px 8px;border-radius:6px;background:var(--border-card);color:var(--text);font-weight:600">Rank #'+t.rank+'</span>' : '') + (t.percentile ? '<span style="font-size:10px;padding:3px 8px;border-radius:6px;background:var(--border-card);color:var(--success);font-weight:600">'+t.percentile+'%ile</span>' : '') + '</div>' : ''}
        ${papers.length ? '<div class="att-grid">' + papers.map((d, fi) => { var fid = window._fcache(d.data || d.url || '', d.name); var isPdf = (d.type || '').includes('pdf') || (d.name || '').toLowerCase().endsWith('.pdf'); return '<div class="att-chip" onclick="pvFile(_fget(\'' + fid + '\'),\'' + (d.name || 'Paper').replace(/'/g, "\\'") + '\')"><span class="att-icon">' + (isPdf ? '&#128196;' : '&#128444;') + '</span><span class="att-name">' + esc(d.name || 'File ' + (fi + 1)) + '</span></div>'; }).join('') + '</div>' : ''}
        ${answerKey.length ? '<div style="font-size:10px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin:8px 0 4px">Answer Key</div><div class="att-grid">' + answerKey.map((d, fi) => { var fid = window._fcache(d.data || d.url || '', d.name); var isPdf = (d.type || '').includes('pdf') || (d.name || '').toLowerCase().endsWith('.pdf'); return '<div class="att-chip" onclick="pvFile(_fget(\'' + fid + '\'),\'' + (d.name || 'Answer Key').replace(/'/g, "\\'") + '\')"><span class="att-icon">' + (isPdf ? '&#9989;' : '&#128444;') + '</span><span class="att-name">' + esc(d.name || 'Answer Key ' + (fi + 1)) + '</span></div>'; }).join('') + '</div>' : ''}
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn-ghost" style="font-size:10px;padding:4px 10px;color:var(--danger)" onclick="window.delTest('${t.id}')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Delete
          </button>
        </div>
      </div>
    </div>`;
  }

  function testResultsHTML(tests) {
    return `<div class="section-block">
      <div class="section-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> Test History (${tests.length})</div>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${tests.length === 0
          ? `<div class="empty" style="padding:32px">
              <div class="empty-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></div>
              <div class="empty-title">No tests recorded</div>
              <div class="empty-sub">Click 'Add Test' above to record your first result</div>
            </div>`
          : [...tests].sort((a, b) => new Date(b.date) - new Date(a.date)).map((t, i) => tstCard(t, i)).join('')}
      </div>
    </div>`;
  }

  function getFilteredTests() {
    var DB = window.DB;
    var tests = (DB && DB.tests) || [];
    if (_testSearch.trim()) {
      var q = _testSearch.trim().toLowerCase();
      tests = tests.filter(function(t) {
        if ((t.name || '').toLowerCase().includes(q)) return true;
        var syl = t.syllabus;
        if (syl && typeof syl === 'object') {
          if ((syl.physics || []).some(function(c) { return c.toLowerCase().includes(q); })) return true;
          if ((syl.chemistry || []).some(function(c) { return c.toLowerCase().includes(q); })) return true;
          if ((syl.maths || []).some(function(c) { return c.toLowerCase().includes(q); })) return true;
        }
        return false;
      });
    }
    return tests;
  }

  window.renderTests = function(el) {
    if (!el) return;
    const DB = window.DB;
    if (!DB) { el.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-muted)">Loading data...</div>'; return; }
    var tests = getFilteredTests();
    var allTests = DB.tests || [];
    const avg = allTests.length ? Math.round(allTests.reduce((s, t) => s + (t.maxScore > 0 ? (t.totalScore / t.maxScore) * 100 : 0), 0) / allTests.length) : 0;

    el.innerHTML = `
    <div style="display:flex;gap:8px;margin-bottom:16px;align-items:center;flex-wrap:wrap">
      <input class="input anim-entrance" id="test-search-input" type="text" placeholder="Search by name or syllabus chapter..." oninput="window._testSearchFn(this.value)" style="font-size:13px;flex:1;min-width:200px" value="${esc(_testSearch)}" autocomplete="off" data-tutorial-id="test-search">
      <button class="btn btn-primary btn-sm anim-entrance" onclick="window.openAddTest()" style="--delay:0.05s">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Test
      </button>
    </div>
    <div class="stats-grid anim-entrance" style="--delay:0.1s">
      <div class="stat-card">
        <div class="stat-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></div>
        <div class="stat-val"><span data-count="${allTests.length}">0</span></div>
        <div class="stat-label">Total Tests</div>
        <div class="stat-sub">${_testSearch ? 'Filtered' : 'All time'}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="color:var(--accent)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
        <div class="stat-val" style="color:var(--accent)"><span data-count="${avg}">0</span>%</div>
        <div class="stat-label">Average Score</div>
        <div class="stat-sub">Across all tests</div>
      </div>
    </div>
    <div id="test-results">${testResultsHTML(tests)}</div>`;
  };

  function _updateTestResults() {
    var container = document.getElementById('test-results');
    if (!container) return;
    var tests = getFilteredTests();
    container.innerHTML = testResultsHTML(tests);
    container.querySelectorAll('.anim-entrance, .anim-up').forEach(function(e) { e.classList.add('visible'); e.style.opacity = '1'; e.style.transform = 'none'; });
  }

  /* CRUD */
  window.openAddTest = function() {
    window.pendingTFiles = [];
    window.pendingTAnswerKey = [];
    var fl = document.getElementById('t-file-list'); if (fl) fl.innerHTML = '';
    var akFl = document.getElementById('t-ak-file-list'); if (akFl) akFl.innerHTML = '';
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
          html += '<label class="syl-cb"><input type="checkbox" class="t-syl-cb" data-subj="' + subj + '" value="' + esc(ch.name) + '"/> ' + esc(ch.name) + '</label>';
        });
      });
      grid.innerHTML = html || '<div style="font-size:11px;color:var(--muted)">No chapters added yet</div>';
    }
    if (window.setupDZ) window.setupDZ('t-dz', 't-finp', window.handleTFiles);
    if (window.setupDZ) window.setupDZ('t-ak-dz', 't-ak-finp', window.handleTAnswerKey);
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
        if (window._refreshPage) window._refreshPage();
        if (window.toast) window.toast('Test deleted');
      });
    } else {
      DB.tests = DB.tests.filter(t => t.id !== id);
      if (window.sv) window.sv('tests');
      if (window._refreshPage) window._refreshPage();
    }
  };

  window.handleTAnswerKey = function(files) {
    if (!files || !files.length) return;
    window.pendingTAnswerKey = window.pendingTAnswerKey || [];
    var list = document.getElementById('t-ak-file-list');
    window.rdFiles(files, function(obj) {
      if (!obj) return;
      window.pendingTAnswerKey.push(obj);
      if (list) {
        var fid = window._fcache(obj.data || '', obj.name);
        var isPdf = (obj.type || '').includes('pdf') || (obj.name || '').toLowerCase().endsWith('.pdf');
        var div = document.createElement('div');
        div.className = 'upload-preview-item';
        div.innerHTML = '<div class="upload-preview-thumb" onclick="pvFile(_fget(\'' + fid + '\'),\'' + (obj.name || '').replace(/'/g, "\\'") + '\')">' + (isPdf ? '<div class="pdf-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>PDF</div>' : '<img src="' + (obj.data || '') + '" alt=""/>') + '</div><div class="upload-preview-info"><div class="upload-preview-name">' + esc(obj.name || 'File') + '</div><div class="upload-preview-size">' + window.fmtSz(obj.size) + '</div></div><button class="upload-preview-remove" onclick="this.closest(\'.upload-preview-item\').remove()">&#10005;</button>';
        list.appendChild(div);
      }
    });
  };

  window._testSearchFn = function(val) {
    _testSearch = val || '';
    _updateTestResults();
  };
})();
