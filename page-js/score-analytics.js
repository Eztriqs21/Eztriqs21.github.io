// js/pages/score-analytics.js — Score Analytics page renderer (Nexus & Bloom)
(function() {
  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML.replace(/'/g, '&#39;'); }
  function fmtDate(d) { return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }); }
  function safePct(a, b) { return b > 0 ? Math.round((a / b) * 100) : 0; }
  function getTheme() { return document.documentElement.getAttribute('data-theme') || 'nexus'; }
  function pfx() { return getTheme() === 'nexus' ? 'nx' : 'bl'; }

  const SUBJECTS = {
    physics:   { label: 'Physics',   icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>', color: 'var(--primary)' },
    chemistry: { label: 'Chemistry', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6v11l4 5H5l4-5V3z"/><line x1="9" y1="3" x2="15" y2="3"/></svg>', color: 'var(--secondary)' },
    maths:     { label: 'Maths',     icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20L20 4"/><path d="M15 4h5v5"/><path d="M4 20l5-5"/></svg>', color: 'var(--accent)' }
  };

  function trendLineChart(data) {
    const p = pfx();
    const w = 400, h = 140, pad = 24;
    if (data.length < 2) return '<div style="padding:20px;text-align:center;color:var(--muted);font-size:12px">Need more data points</div>';

    const pcts = data.map(d => safePct(d.totalScore ?? d.total ?? 0, d.maxScore ?? d.max ?? 300));
    const maxPct = Math.max(...pcts, 100);
    const minPct = 0;
    const range = maxPct - minPct || 1;
    const step = (w - pad * 2) / (data.length - 1);

    const points = pcts.map((pct, i) => {
      const x = pad + i * step;
      const y = h - pad - ((pct - minPct) / range) * (h - pad * 2);
      return `${x},${y}`;
    }).join(' ');

    const areaPoints = points + ` ${pad + (data.length - 1) * step},${h - pad} ${pad},${h - pad}`;

    return `<svg width="100%" viewBox="0 0 ${w} ${h}" style="overflow:visible">
      <defs>
        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/>
        </linearGradient>
      </defs>
      ${[0, 25, 50, 75, 100].map(v => {
        const y = h - pad - ((v - minPct) / range) * (h - pad * 2);
        return `<line x1="${pad}" y1="${y}" x2="${w - pad}" y2="${y}" stroke="var(--border)" stroke-width="0.5" stroke-dasharray="4,4"/>
          <text x="${pad - 4}" y="${y + 3}" text-anchor="end" fill="var(--muted)" font-size="8">${v}%</text>`;
      }).join('')}
      <polygon points="${areaPoints}" fill="url(#trendGrad)"/>
      <polyline points="${points}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      ${pcts.map((pct, i) => {
        const x = pad + i * step;
        const y = h - pad - ((pct - minPct) / range) * (h - pad * 2);
        return `<circle cx="${x}" cy="${y}" r="4" fill="var(--bg)" stroke="var(--accent)" stroke-width="2"/>
          <text x="${x}" y="${y - 10}" text-anchor="middle" fill="var(--text)" font-size="9" font-weight="600">${pct}%</text>`;
      }).join('')}
      ${data.map((d, i) => {
        const x = pad + i * step;
        return `<text x="${x}" y="${h - 4}" text-anchor="middle" fill="var(--muted)" font-size="8">${fmtDate(d.date)}</text>`;
      }).join('')}
    </svg>`;
  }

  function subjectBar(key, scores) {
    const p = pfx();
    const info = SUBJECTS[key];
    const avg = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
    const latest = scores[scores.length - 1] || 0;
    const prev = scores[scores.length - 2] || latest;
    const change = latest - prev;
    const changeIcon = change > 0 ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>'
      : change < 0 ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>'
      : '';

    return `<div style="flex:1;min-width:140px">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
        <span style="opacity:0.7">${info.icon}</span>
        <span style="font-size:12px;font-weight:600">${info.label}</span>
        <span style="margin-left:auto;display:flex;align-items:center;gap:2px;font-size:10px;color:${change > 0 ? 'var(--success)' : change < 0 ? 'var(--danger)' : 'var(--muted)'}">${changeIcon}${Math.abs(change)}%</span>
      </div>
      <div style="font-size:24px;font-weight:700;margin-bottom:4px">${avg}%</div>
      <div class="${p}-progress-wrap" style="height:6px"><div class="${p}-progress-bar" style="height:6px;width:${avg}%;background:${info.color}"></div></div>
      <div style="font-size:10px;color:var(--muted);margin-top:4px">${scores.length} tests · Latest: ${latest}%</div>
    </div>`;
  }

  window.renderScoreAnalytics = function(el) {
    if (!el) return;
    const p = pfx();
    const DB = window.DB;
    const allTests = (DB && DB.tests && DB.tests.length > 0) ? DB.tests : [];
    if (allTests.length === 0) {
      el.innerHTML = `
      <div class="${p}-page-header anim-entrance">
        <div class="${p}-page-title" data-text="Score Analytics">Score Analytics</div>
        <div class="${p}-page-sub">Detailed performance breakdown</div>
      </div>
      <div class="${p}-empty anim-entrance" style="--delay:0.1s;padding:48px">
        <div class="${p}-empty-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
        <div class="${p}-empty-title">No test data yet</div>
        <div class="${p}-empty-sub">Record some tests to see your score analytics</div>
      </div>`;
      return;
    }
    const avgPct = allTests.length ? safePct(allTests.reduce((s, t) => s + (t.totalScore ?? t.total ?? 0), 0), allTests.reduce((s, t) => s + (t.maxScore ?? t.max ?? 300), 0)) : 0;
    const bestPct = allTests.length ? Math.max(...allTests.map(t => safePct(t.totalScore ?? t.total ?? 0, t.maxScore ?? t.max ?? 300))) : 0;
    const improvement = allTests.length >= 2 ? safePct(allTests[allTests.length - 1].totalScore ?? allTests[allTests.length - 1].total ?? 0, allTests[allTests.length - 1].maxScore ?? allTests[allTests.length - 1].max ?? 300) - safePct(allTests[0].totalScore ?? allTests[0].total ?? 0, allTests[0].maxScore ?? allTests[0].max ?? 300) : 0;

    const physicsScores = allTests.map(t => safePct((t.physics?.correct || 0) * 4 - (t.physics?.incorrect || 0), 100));
    const chemScores = allTests.map(t => safePct((t.chemistry?.correct || 0) * 4 - (t.chemistry?.incorrect || 0), 100));
    const mathsScores = allTests.map(t => safePct((t.maths?.correct || 0) * 4 - (t.maths?.incorrect || 0), 100));

    el.innerHTML = `
    <div class="${p}-page-header anim-entrance">
      <div class="${p}-page-title" data-text="Score Analytics">Score Analytics</div>
      <div class="${p}-page-sub">Detailed performance breakdown</div>
    </div>
    <div class="${p}-stats-grid anim-entrance" style="--delay:0.1s">
      <div class="${p}-stat-card">
        <div class="${p}-stat-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
        <div class="${p}-stat-val"><span data-count="${avgPct}">0</span>%</div>
        <div class="${p}-stat-label">Avg Score</div>
        <div class="${p}-stat-sub">Across ${allTests.length} tests</div>
      </div>
      <div class="${p}-stat-card">
        <div class="${p}-stat-icon" style="color:var(--success)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
        <div class="${p}-stat-val" style="color:var(--success)"><span data-count="${bestPct}">0</span>%</div>
        <div class="${p}-stat-label">Best Score</div>
        <div class="${p}-stat-sub">Personal record</div>
      </div>
      <div class="${p}-stat-card">
        <div class="${p}-stat-icon" style="color:${improvement >= 0 ? 'var(--success)' : 'var(--danger)'}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="${improvement >= 0 ? '18 15 12 9 6 15' : '6 9 12 15 18 9'}"/></svg></div>
        <div class="${p}-stat-val" style="color:${improvement >= 0 ? 'var(--success)' : 'var(--danger)'}"><span data-count="${Math.abs(improvement)}">0</span>%</div>
        <div class="${p}-stat-label">Improvement</div>
        <div class="${p}-stat-sub">${improvement >= 0 ? 'Upward trend' : 'Needs attention'}</div>
      </div>
    </div>
    <div class="${p}-section-block anim-entrance" style="--delay:0.2s">
      <div class="${p}-section-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> Performance Trend</div>
      <div class="${p}-card" style="padding:20px;overflow-x:auto">
        ${trendLineChart(allTests)}
      </div>
    </div>
    <div class="${p}-section-block anim-entrance" style="--delay:0.3s">
      <div class="${p}-section-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> Subject Breakdown</div>
      <div class="${p}-card" style="padding:20px">
        <div style="display:flex;gap:24px;flex-wrap:wrap">
          ${subjectBar('physics', physicsScores)}
          ${subjectBar('chemistry', chemScores)}
          ${subjectBar('maths', mathsScores)}
        </div>
      </div>
    </div>`;
  };
})();
