// page-js/analytics.js — Analytics page renderer (test-only)
(function() {
  function getTheme() { return document.documentElement.getAttribute('data-theme') || 'nexus'; }
  function pfx() { var t = getTheme(); return t === 'nexus' ? 'nx' : t === 'bloom' ? 'bl' : t === 'nebula' ? 'nb' : t === 'aquatic' ? 'aq' : 'fd'; }

  function heroStat(val, label, color, delay) {
    const p = pfx();
    return `<div class="${p}-hero-stat anim-entrance" style="--delay:${delay}">
      <div class="${p}-hero-stat-val" style="color:${color}">${val}</div>
      <div class="${p}-hero-stat-label">${label}</div>
    </div>`;
  }

  function subjectTimeCard(subj, avg, color, icon) {
    const p = pfx();
    return `<div class="${p}-card anim-entrance" style="padding:16px;text-align:center">
      <div class="${p}-stat-icon">${icon}</div>
      <div class="${p}-hero-stat-val" style="font-size:26px;margin-top:4px;color:${color}">${avg}m</div>
      <div class="${p}-stat-sub" style="margin-top:4px">${subj} Avg Time</div>
      <div class="${p}-progress-wrap" style="height:4px;margin-top:8px"><div class="${p}-progress-bar" style="height:4px;width:${Math.min(100, avg)}%;background:${color}"></div></div>
    </div>`;
  }

  window.renderAnalytics = function(el) {
    if (!el) return;
    const p = pfx();
    const tests = (window.DB && window.DB.tests) || [];

    // Test averages
    const testAvg = tests.length ? Math.round(tests.reduce((s, t) => s + Math.max(0, t.totalScore), 0) / tests.length) : 0;
    const physAvg = tests.length ? Math.round(tests.reduce((s, t) => s + Math.max(0, (t.physics?.correct || 0) * 4 - (t.physics?.incorrect || 0)), 0) / tests.length) : 0;
    const chemAvg = tests.length ? Math.round(tests.reduce((s, t) => s + Math.max(0, (t.chemistry?.correct || 0) * 4 - (t.chemistry?.incorrect || 0)), 0) / tests.length) : 0;
    const mathAvg = tests.length ? Math.round(tests.reduce((s, t) => s + Math.max(0, (t.maths?.correct || 0) * 4 - (t.maths?.incorrect || 0)), 0) / tests.length) : 0;

    // Timing averages
    const testsWithTiming = tests.filter(t => t.timing && t.timing.total);
    const avgTimeP = testsWithTiming.length ? Math.round(testsWithTiming.reduce((s, t) => s + (t.timing.physics || 0), 0) / testsWithTiming.length) : 0;
    const avgTimeC = testsWithTiming.length ? Math.round(testsWithTiming.reduce((s, t) => s + (t.timing.chemistry || 0), 0) / testsWithTiming.length) : 0;
    const avgTimeM = testsWithTiming.length ? Math.round(testsWithTiming.reduce((s, t) => s + (t.timing.maths || 0), 0) / testsWithTiming.length) : 0;

    // Best/worst test
    const sorted = [...tests].sort((a, b) => (b.totalScore / b.maxScore) - (a.totalScore / a.maxScore));
    const bestTest = sorted[0];
    const worstTest = sorted[sorted.length - 1];
    const bestPct = bestTest && bestTest.maxScore > 0 ? Math.round(bestTest.totalScore / bestTest.maxScore * 100) : 0;
    const worstPct = worstTest && worstTest.maxScore > 0 ? Math.round(worstTest.totalScore / worstTest.maxScore * 100) : 0;

    el.innerHTML = `
    <div class="${p}-page-header anim-entrance">
      <div class="${p}-page-title" data-text="Analytics">Analytics</div>
      <div class="${p}-page-sub">Performance insights across all tests</div>
    </div>
    <div class="${p}-hero-stats" data-tutorial-id="hero-stats">
      ${heroStat(tests.length, 'Total Tests', 'var(--accent)', '0.1s')}
      ${heroStat(testAvg + '%', 'Avg Score', 'var(--success)', '0.15s')}
      ${heroStat(bestPct + '%', 'Best Score', 'var(--primary)', '0.2s')}
      ${heroStat(tests.length > 0 ? Math.round(tests.reduce((s, t) => s + (t.totalScore || 0), 0)) : 0, 'Total Points', 'var(--secondary)', '0.25s')}
    </div>
    <div class="${p}-section-block anim-entrance" style="--delay:0.35s">
      <div class="${p}-section-title"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> Test Averages</div>
      <div class="${p}-stats-grid">
        <div class="${p}-stat-card anim-entrance" style="--delay:0.4s"><div class="${p}-stat-val" style="color:var(--success)">${testAvg}</div><div class="${p}-stat-label">Avg Total</div><div class="${p}-stat-sub">/300</div></div>
        <div class="${p}-stat-card anim-entrance" style="--delay:0.45s"><div class="${p}-stat-val" style="color:var(--primary)">${physAvg}</div><div class="${p}-stat-label">Avg Physics</div><div class="${p}-stat-sub">/100</div></div>
        <div class="${p}-stat-card anim-entrance" style="--delay:0.5s"><div class="${p}-stat-val" style="color:var(--secondary)">${chemAvg}</div><div class="${p}-stat-label">Avg Chemistry</div><div class="${p}-stat-sub">/100</div></div>
        <div class="${p}-stat-card anim-entrance" style="--delay:0.55s"><div class="${p}-stat-val" style="color:var(--accent)">${mathAvg}</div><div class="${p}-stat-label">Avg Maths</div><div class="${p}-stat-sub">/100</div></div>
      </div>
    </div>
    <div class="${p}-section-block anim-entrance" style="--delay:0.6s">
      <div class="${p}-section-title"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Subject-Wise Time Allocation</div>
      <div class="${p}-grid subj-responsive-grid" style="gap:16px">
        ${subjectTimeCard('Physics', avgTimeP, 'var(--primary)', '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>')}
        ${subjectTimeCard('Chemistry', avgTimeC, 'var(--secondary)', '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6v11l4 5H5l4-5V3z"/><line x1="9" y1="3" x2="15" y2="3"/></svg>')}
        ${subjectTimeCard('Maths', avgTimeM, 'var(--accent)', '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20L20 4"/><path d="M15 4h5v5"/><path d="M4 20l5-5"/></svg>')}
      </div>
    </div>`;
  };
})();
