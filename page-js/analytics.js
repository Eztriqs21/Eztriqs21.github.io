// js/pages/analytics.js — Analytics page renderer (Nexus & Bloom)
(function() {
  function fmtDate(d) { return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }); }
  function getTheme() { return document.documentElement.getAttribute('data-theme') || 'nexus'; }
  function pfx() { var t = getTheme(); return t === 'nexus' ? 'nx' : t === 'bloom' ? 'bl' : t === 'nebula' ? 'nb' : t === 'aquatic' ? 'aq' : 'fd'; }

  function heroStat(val, label, color, delay) {
    const p = pfx();
    return `<div class="${p}-hero-stat anim-entrance" style="--delay:${delay}">
      <div class="${p}-hero-stat-val" style="color:${color}">${val}</div>
      <div class="${p}-hero-stat-label">${label}</div>
    </div>`;
  }

  function barCol(day, val, maxVal, delay) {
    const p = pfx();
    const height = maxVal > 0 ? Math.min(100, (val / maxVal) * 100) : 0;
    return `<div class="${p}-bar-col anim-entrance" style="--delay:${delay}">
      <div class="${p}-bar-val">${val > 0 ? (+val).toFixed(1) + 'h' : '0h'}</div>
      <div class="${p}-bar-track"><div class="${p}-bar-fill" style="height:${height}%"></div></div>
      <div class="${p}-bar-lbl">${day}</div>
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
    const logs = (window.DB && window.DB.studyLogs) || [];
    const tests = (window.DB && window.DB.tests) || [];
    const now = new Date();

    // Weekly data
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const dayMap = {};
    logs.forEach(l => { dayMap[l.date] = (dayMap[l.date] || 0) + (l.duration || 0); });
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const barData = days.map((d, i) => {
      const dt = new Date(weekStart);
      dt.setDate(weekStart.getDate() + i);
      const ds = dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
      return { day: d, val: dayMap[ds] || 0 };
    });
    const maxVal = Math.max(...barData.map(b => b.val), 2);

    // Hero stats
    const weekLogs = logs.filter(l => new Date(l.date) >= weekStart);
    const weekTotal = weekLogs.reduce((s, l) => s + (l.duration || 0), 0);
    const dayMapAll = {};
    logs.forEach(l => { dayMapAll[l.date] = (dayMapAll[l.date] || 0) + (l.duration || 0); });
    var last30 = logs.filter(l => (new Date() - new Date(l.date)) / 86400000 <= 30);
    var last30Days = new Set(last30.map(l => l.date)).size || 1;
    var last30Total = last30.reduce((s, l) => s + (l.duration || 0), 0);
    const avgDay = last30Total / last30Days;
    const bestDay = Object.entries(dayMapAll).sort((a, b) => b[1] - a[1])[0];
    const totalHours = logs.reduce((s, l) => s + (l.duration || 0), 0);

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

    el.innerHTML = `
    <div class="${p}-page-header anim-entrance">
      <div class="${p}-page-title" data-text="Statistics & Study Logs">Statistics & Study Logs</div>
      <div class="${p}-page-sub">Performance insights and study tracking</div>
    </div>
    <div class="${p}-hero-stats" data-tutorial-id="hero-stats">
      ${heroStat((+weekTotal).toFixed(1) + 'h', 'This Week Total', 'var(--accent)', '0.1s')}
      ${heroStat((+avgDay).toFixed(1) + 'h', 'Avg Per Day', 'var(--success)', '0.15s')}
      ${heroStat(bestDay ? ((+bestDay[1]).toFixed(1) + 'h') : '—', 'Best Day' + (bestDay ? ' (' + fmtDate(bestDay[0]) + ')' : ''), 'var(--primary)', '0.2s')}
      ${heroStat(logs.length, 'Total Sessions', 'var(--secondary)', '0.25s')}
      ${heroStat(totalHours.toFixed(1) + 'h', 'Lifetime Hours', 'var(--accent)', '0.3s')}
    </div>
    <div class="${p}-section-block anim-entrance" style="--delay:0.35s">
      <div class="${p}-section-title"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Weekly Study Hours</div>
      <div class="${p}-bar-chart" data-tutorial-id="weekly-chart">
        ${barData.map((b, i) => barCol(b.day, b.val, maxVal, (0.4 + i * 0.03) + 's')).join('')}
      </div>
    </div>
    <div class="${p}-section-block anim-entrance" style="--delay:0.5s">
      <div class="${p}-section-title"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> Test Averages</div>
      <div class="${p}-stats-grid">
        <div class="${p}-stat-card anim-entrance" style="--delay:0.55s"><div class="${p}-stat-val" style="color:var(--success)">${testAvg}</div><div class="${p}-stat-label">Avg Total</div><div class="${p}-stat-sub">/300</div></div>
        <div class="${p}-stat-card anim-entrance" style="--delay:0.6s"><div class="${p}-stat-val" style="color:var(--primary)">${physAvg}</div><div class="${p}-stat-label">Avg Physics</div><div class="${p}-stat-sub">/100</div></div>
        <div class="${p}-stat-card anim-entrance" style="--delay:0.65s"><div class="${p}-stat-val" style="color:var(--secondary)">${chemAvg}</div><div class="${p}-stat-label">Avg Chemistry</div><div class="${p}-stat-sub">/100</div></div>
        <div class="${p}-stat-card anim-entrance" style="--delay:0.7s"><div class="${p}-stat-val" style="color:var(--accent)">${mathAvg}</div><div class="${p}-stat-label">Avg Maths</div><div class="${p}-stat-sub">/100</div></div>
      </div>
    </div>
    <div class="${p}-section-block anim-entrance" style="--delay:0.75s">
      <div class="${p}-section-title"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Subject-Wise Time Allocation</div>
      <div class="${p}-grid subj-responsive-grid" style="gap:16px">
        ${subjectTimeCard('Physics', avgTimeP, 'var(--primary)', '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>')}
        ${subjectTimeCard('Chemistry', avgTimeC, 'var(--secondary)', '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6v11l4 5H5l4-5V3z"/><line x1="9" y1="3" x2="15" y2="3"/></svg>')}
        ${subjectTimeCard('Maths', avgTimeM, 'var(--accent)', '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20L20 4"/><path d="M15 4h5v5"/><path d="M4 20l5-5"/></svg>')}
      </div>
    </div>`;
  };
})();