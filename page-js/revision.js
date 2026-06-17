// js/pages/revision.js — Revision page renderer (Nexus & Bloom)
(function() {
  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function fmtDate(d) { return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }); }
  function safePct(a, b) { return b > 0 ? Math.round((a / b) * 100) : 0; }
  function getTheme() { return document.documentElement.getAttribute('data-theme') || 'nexus'; }
  function pfx() { return getTheme() === 'nexus' ? 'nx' : 'bl'; }

  const SUBJECTS = {
    physics:   { label: 'Physics',   icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>' },
    chemistry: { label: 'Chemistry', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6v11l4 5H5l4-5V3z"/><line x1="9" y1="3" x2="15" y2="3"/></svg>' },
    maths:     { label: 'Mathematics', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20L20 4"/><path d="M15 4h5v5"/><path d="M4 20l5-5"/></svg>' }
  };

  const REVISION_DATA = {
    physics: [
      { name: 'Laws of Motion', formulaCount: 12, lastRevised: new Date(Date.now() - 172800000).toISOString(), mastery: 78 },
      { name: 'Work, Energy & Power', formulaCount: 8, lastRevised: new Date(Date.now() - 345600000).toISOString(), mastery: 65 },
      { name: 'Rotational Motion', formulaCount: 15, lastRevised: null, mastery: 30 },
      { name: 'Gravitation', formulaCount: 6, lastRevised: null, mastery: 20 }
    ],
    chemistry: [
      { name: 'Atomic Structure', formulaCount: 10, lastRevised: new Date(Date.now() - 259200000).toISOString(), mastery: 82 },
      { name: 'Chemical Bonding', formulaCount: 14, lastRevised: new Date(Date.now() - 86400000).toISOString(), mastery: 70 },
      { name: 'Thermodynamics', formulaCount: 9, lastRevised: null, mastery: 45 }
    ],
    maths: [
      { name: 'Trigonometric Functions', formulaCount: 20, lastRevised: new Date(Date.now() - 86400000).toISOString(), mastery: 88 },
      { name: 'Quadratic Equations', formulaCount: 7, lastRevised: new Date(Date.now() - 432000000).toISOString(), mastery: 72 },
      { name: 'Permutations & Combinations', formulaCount: 5, lastRevised: null, mastery: 55 }
    ]
  };

  function revisionCard(item, index) {
    const p = pfx();
    const color = item.mastery >= 70 ? 'var(--success)' : item.mastery >= 40 ? 'var(--accent)' : 'var(--danger)';
    const revised = item.lastRevised ? fmtDate(item.lastRevised) : 'Never';
    return `<div class="${p}-card anim-entrance" style="--delay:${index * 0.06}s;padding:16px;cursor:pointer">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <div style="font-size:13px;font-weight:600">${esc(item.name)}</div>
        <div style="font-size:11px;padding:2px 8px;border-radius:12px;background:${color}22;color:${color};font-weight:600">${item.mastery}%</div>
      </div>
      <div class="${p}-progress-wrap" style="height:5px;margin-bottom:10px"><div class="${p}-progress-bar" style="height:5px;width:${item.mastery}%;background:${color}"></div></div>
      <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted)">
        <span>${item.formulaCount} formulas</span>
        <span>Last: ${revised}</span>
      </div>
    </div>`;
  }

  function subjectSection(key, data, index) {
    const p = pfx();
    const info = SUBJECTS[key];
    const totalFormulas = data.reduce((s, d) => s + d.formulaCount, 0);
    const avgMastery = Math.round(data.reduce((s, d) => s + d.mastery, 0) / data.length);

    return `<div class="${p}-section-block anim-entrance" style="--delay:${0.15 + index * 0.1}s">
      <div class="${p}-section-title">${info.icon} ${info.label} <span style="margin-left:auto;font-size:11px;color:var(--muted);font-weight:400">${totalFormulas} formulas · ${avgMastery}% mastery</span></div>
      <div class="${p}-grid" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px">
        ${data.map((item, i) => revisionCard(item, i)).join('')}
      </div>
    </div>`;
  }

  window.renderRevision = function(el) {
    const p = pfx();
    const keys = ['physics', 'chemistry', 'maths'];
    const totalFormulas = keys.reduce((s, k) => s + REVISION_DATA[k].reduce((s2, d) => s2 + d.formulaCount, 0), 0);
    const allTopics = keys.reduce((s, k) => s + REVISION_DATA[k].length, 0);
    const revised = keys.reduce((s, k) => s + REVISION_DATA[k].filter(d => d.lastRevised).length, 0);

    el.innerHTML = `
    <div class="${p}-page-header anim-entrance">
      <div class="${p}-page-title" data-text="Revision">Revision</div>
      <div class="${p}-page-sub">Quick revision & formula sheets</div>
    </div>
    <div class="${p}-stats-grid anim-entrance" style="--delay:0.1s">
      <div class="${p}-stat-card">
        <div class="${p}-stat-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></div>
        <div class="${p}-stat-val"><span data-count="${totalFormulas}">0</span></div>
        <div class="${p}-stat-label">Total Formulas</div>
        <div class="${p}-stat-sub">Across all subjects</div>
      </div>
      <div class="${p}-stat-card">
        <div class="${p}-stat-icon" style="color:var(--accent)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg></div>
        <div class="${p}-stat-val" style="color:var(--accent)"><span data-count="${allTopics}">0</span></div>
        <div class="${p}-stat-label">Topics</div>
        <div class="${p}-stat-sub">Organized by chapter</div>
      </div>
      <div class="${p}-stat-card">
        <div class="${p}-stat-icon" style="color:var(--success)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
        <div class="${p}-stat-val" style="color:var(--success)"><span data-count="${revised}">0</span>/${allTopics}</div>
        <div class="${p}-stat-label">Revised</div>
        <div class="${p}-stat-sub">${allTopics > 0 ? safePct(revised, allTopics) : 0}% complete</div>
      </div>
    </div>
    ${keys.map((k, i) => subjectSection(k, REVISION_DATA[k], i)).join('')}`;
  };
})();
