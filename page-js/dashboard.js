// js/pages/dashboard.js — Dashboard page renderer (Nexus & Bloom)
(function() {
  const SUBJECTS = {
    physics: { label: 'Physics', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>' },
    chemistry: { label: 'Chemistry', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6v11l4 5H5l4-5V3z"/><line x1="9" y1="3" x2="15" y2="3"/></svg>' },
    maths: { label: 'Mathematics', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20L20 4"/><path d="M15 4h5v5"/><path d="M4 20l5-5"/></svg>' }
  };

  function safePct(a, b) { return b > 0 ? Math.round((a / b) * 100) : 0; }
  function fmtDate(d) { return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }); }
  function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}

  function statCard(icon, value, valueSuffix, label, sub, delay) {
    return `<div class="stat-card anim-entrance" style="--delay:${delay}">
      <div class="stat-icon">${icon}</div>
      <div class="stat-val"><span data-count="${value}">0</span>${valueSuffix || ''}</div>
      <div class="stat-label">${label}</div>
      <div class="stat-sub">${sub}</div>
    </div>`;
  }

  function subjectCard(subj, key) {
    const info = SUBJECTS[key];
    const done = subj.filter(c => c.completed).length;
    const total = subj.length;
    const pct = safePct(done, total);
    return `<div class="card anim-entrance" style="cursor:pointer;padding:18px" onclick="location.hash='#/chapters'">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
        <div class="stat-icon" style="font-size:16px">${info.icon}</div>
        <div><div style="font-size:14px;font-weight:600">${info.label}</div><div class="stat-sub" style="margin-top:1px">${pct}%</div></div>
      </div>
      <div class="progress-wrap" style="height:5px"><div class="progress-bar" style="height:5px;width:${pct}%"></div></div>
      <div class="stat-sub" style="margin-top:6px">${done} / ${total} chapters</div>
    </div>`;
  }



  function testRow(t) {
    const pct = t.maxScore > 0 ? Math.round(t.totalScore / t.maxScore * 100) : 0;
    return `<div class="list-item">
      <div class="list-meta">${fmtDate(t.date)}</div>
      <div style="flex:1"><div class="list-title">${esc(t.name)}</div></div>
      <div class="list-value" style="color:${pct >= 70 ? 'var(--success)' : pct >= 50 ? 'var(--accent)' : 'var(--danger)'}">${t.totalScore}/${t.maxScore}</div>
    </div>`;
  }

  function emptyState(icon, title, sub) {
    return `<div class="empty" style="padding:28px 0">
      <div class="empty-icon">${icon}</div>
      <div class="empty-title">${title}</div>
      <div class="empty-sub">${sub}</div>
    </div>`;
  }

  window.renderDashboard = function(el) {
    if (!el) return;
    const DB = window.DB;
    if (!DB || !DB.chapters) {
      el.innerHTML = '<div class="p-anim-entrance" style="display:flex;flex-direction:column;gap:16px">'
        + '<div class="shimmer" style="height:80px"></div>'
        + '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">'
        + '<div class="shimmer" style="height:120px"></div><div class="shimmer" style="height:120px"></div><div class="shimmer" style="height:120px"></div></div>'
        + '<div class="shimmer" style="height:200px"></div></div>';
      return;
    }
    const all = [...(DB.chapters.physics||[]), ...(DB.chapters.chemistry||[]), ...(DB.chapters.maths||[])];
    const done = all.filter(c => c.completed).length;
    const total = all.length;
    const active = (DB.assignments || []).filter(a => !a.completed).length;
    const tests = DB.tests || [];
    const avg = tests.length ? Math.round(tests.reduce((s, t) => s + (t.maxScore > 0 ? (t.totalScore / t.maxScore) * 100 : 0), 0) / tests.length) : 0;
    const recTests = [...tests].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    el.innerHTML = `
    <div class="stats-grid" data-tutorial-id="stat-cards">
      ${statCard('<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>', active, '', 'Active Tasks', 'Pending assignments', '0.1s')}
      ${statCard('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>', done, '/' + total, 'Chapters Done', safePct(done, total) + '% complete', '0.2s')}
      ${statCard('<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>', avg, '%', 'Avg Test Score', 'Across ' + tests.length + ' tests', '0.3s')}
      ${statCard('<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>', tests.length, '', 'Total Tests', 'All time', '0.4s')}
    </div>
    <div class="section-block anim-entrance" style="--delay:0.2s" data-tutorial-id="subject-progress">
      <div class="section-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> Subject Progress</div>
      <div class="grid subj-responsive-grid" style="gap:16px">
        ${subjectCard(DB.chapters.physics || [], 'physics')}
        ${subjectCard(DB.chapters.chemistry || [], 'chemistry')}
        ${subjectCard(DB.chapters.maths || [], 'maths')}
      </div>
    </div>
    <div class="section-block anim-entrance" style="--delay:0.3s">
      <div class="section-title"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> Recent Tests</div>
      <div class="card" style="padding:16px 18px">
        ${recTests.length === 0
          ? emptyState('<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>', 'No tests yet', 'Add your first test in the Tests page')
          : recTests.map(t => testRow(t)).join('')}
      </div>
    </div>`;
  };
})();
