// page-js/analytics.js — Analytics page renderer (merged with score analytics)
(function() {
  function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
  function fmtDate(d) { return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }); }
  function safePct(a, b) { return b > 0 ? Math.round((a / b) * 100) : 0; }

  const SUBJECTS = {
    physics:   { label: 'Physics',   icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>', color: 'var(--primary)' },
    chemistry: { label: 'Chemistry', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6v11l4 5H5l4-5V3z"/><line x1="9" y1="3" x2="15" y2="3"/></svg>', color: 'var(--secondary)' },
    maths:     { label: 'Maths',     icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20L20 4"/><path d="M15 4h5v5"/><path d="M4 20l5-5"/></svg>', color: 'var(--accent)' }
  };

  function heroStat(val, label, color, delay) {
    return `<div class="hero-stat anim-entrance" style="--delay:${delay}">
      <div class="hero-stat-val" style="color:${color}">${val}</div>
      <div class="hero-stat-label">${label}</div>
    </div>`;
  }

  function subjectTimeCard(subj, avg, color, icon) {
    return `<div class="card anim-entrance" style="padding:16px;text-align:center">
      <div class="stat-icon">${icon}</div>
      <div class="hero-stat-val" style="font-size:26px;margin-top:4px;color:${color}">${avg}m</div>
      <div class="stat-sub" style="margin-top:4px">${subj} Avg Time</div>
      <div class="progress-wrap" style="height:4px;margin-top:8px"><div class="progress-bar" style="height:4px;width:${Math.min(100, avg)}%;background:${color}"></div></div>
    </div>`;
  }

  /* ═══════════════ TREND LINE CHART ═══════════════ */
  function trendLineChart(data) {
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

  /* ═══════════════ SUBJECT BREAKDOWN BAR ═══════════════ */
  function subjectBar(key, scores, hasSynthetic) {
    const info = SUBJECTS[key];
    const avg = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
    const latest = scores[scores.length - 1] || 0;
    const prev = scores[scores.length - 2] || latest;
    const change = latest - prev;
    const changeIcon = change > 0 ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>'
      : change < 0 ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>'
      : '';
    const estLabel = hasSynthetic ? '<span style="font-size:9px;color:var(--muted);font-weight:400;margin-left:4px">(est.)</span>' : '';
    return `<div style="flex:1;min-width:140px">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
        <span style="opacity:0.7">${info.icon}</span>
        <span style="font-size:12px;font-weight:600">${info.label}${estLabel}</span>
        <span style="margin-left:auto;display:flex;align-items:center;gap:2px;font-size:10px;color:${change > 0 ? 'var(--success)' : change < 0 ? 'var(--danger)' : 'var(--muted)'}">${changeIcon}${Math.abs(change)}%</span>
      </div>
      <div style="font-size:24px;font-weight:700;margin-bottom:4px">${avg}%</div>
      <div class="progress-wrap" style="height:6px"><div class="progress-bar" style="height:6px;width:${avg}%;background:${info.color}"></div></div>
      <div style="font-size:10px;color:var(--muted);margin-top:4px">${scores.length} tests · Latest: ${latest}%</div>
    </div>`;
  }

  /* ═══════════════ SCORE DISTRIBUTION HISTOGRAM ═══════════════ */
  function scoreDistribution(allTests) {
    const buckets = [0, 0, 0, 0, 0];
    const labels = ['0-20%', '20-40%', '40-60%', '60-80%', '80-100%'];
    const colors = ['var(--danger)', '#e67e22', 'var(--accent)', '#2ecc71', 'var(--success)'];
    allTests.forEach(t => {
      const pct = safePct(t.totalScore ?? t.total ?? 0, t.maxScore ?? t.max ?? 300);
      const idx = Math.min(4, Math.floor(pct / 20));
      buckets[idx]++;
    });
    const maxCount = Math.max(...buckets, 1);
    const barW = 60;
    const h = 100;
    const gap = 16;
    const totalW = buckets.length * (barW + gap) - gap;
    const svgW = totalW + 40;
    let bars = '';
    buckets.forEach((count, i) => {
      const barH = maxCount > 0 ? (count / maxCount) * (h - 20) : 0;
      const x = 20 + i * (barW + gap);
      const y = h - barH;
      bars += `<rect x="${x}" y="${y}" width="${barW}" height="${barH}" rx="4" fill="${colors[i]}" opacity="0.8"/>
        <text x="${x + barW/2}" y="${h + 14}" text-anchor="middle" fill="var(--muted)" font-size="8">${labels[i]}</text>
        <text x="${x + barW/2}" y="${y - 4}" text-anchor="middle" fill="var(--text)" font-size="9" font-weight="600">${count}</text>`;
    });
    return `<svg width="100%" viewBox="0 0 ${svgW} ${h + 20}" style="overflow:visible">${bars}</svg>`;
  }

  /* ═══════════════ PER-SUBJECT ACCURACY ═══════════════ */
  function subjectAccuracy(allTests) {
    const keys = ['physics', 'chemistry', 'maths'];
    return keys.map(key => {
      let totalCorrect = 0, totalAttempted = 0;
      allTests.forEach(t => {
        const d = t[key] || {};
        totalCorrect += d.correct || 0;
        totalAttempted += (d.correct || 0) + (d.incorrect || 0);
      });
      const acc = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
      const info = SUBJECTS[key];
      return `<div style="flex:1;min-width:120px;text-align:center">
        <div style="display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:6px">
          <span style="opacity:0.7">${info.icon}</span>
          <span style="font-size:12px;font-weight:600">${info.label}</span>
        </div>
        <div style="font-size:28px;font-weight:700;color:${info.color}">${acc}%</div>
        <div style="font-size:10px;color:var(--muted);margin-top:4px">${totalCorrect}/${totalAttempted} correct</div>
        <div class="progress-wrap" style="height:4px;margin-top:8px"><div class="progress-bar" style="height:4px;width:${acc}%;background:${info.color}"></div></div>
      </div>`;
    }).join('');
  }

  /* ═══════════════ RANK & PERCENTILE TREND ═══════════════ */
  function rankPercentileTrend(allTests) {
    const withRank = allTests.filter(t => t.rank || t.percentile).slice().sort((a, b) => new Date(a.date) - new Date(b.date));
    if (withRank.length < 2) return '<div style="padding:20px;text-align:center;color:var(--muted);font-size:12px">Add rank/percentile to 2+ tests to see trend</div>';
    const w = 400, h = 130, pad = 30;
    const pcts = withRank.map(t => t.percentile || 0);
    const ranks = withRank.map(t => t.rank || 0);
    const maxPct = Math.max(...pcts, 100);
    const step = (w - pad * 2) / (withRank.length - 1);
    const pctPoints = pcts.map((pct, i) => {
      const x = pad + i * step;
      const y = h - pad - (pct / maxPct) * (h - pad * 2);
      return `${x},${y}`;
    }).join(' ');
    return `<svg width="100%" viewBox="0 0 ${w} ${h}" style="overflow:visible">
      ${[0, 25, 50, 75, 100].map(v => {
        const y = h - pad - (v / maxPct) * (h - pad * 2);
        return `<line x1="${pad}" y1="${y}" x2="${w - pad}" y2="${y}" stroke="var(--border)" stroke-width="0.5" stroke-dasharray="4,4"/>
          <text x="${pad - 4}" y="${y + 3}" text-anchor="end" fill="var(--muted)" font-size="8">${v}%ile</text>`;
      }).join('')}
      <polyline points="${pctPoints}" fill="none" stroke="var(--success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      ${pcts.map((pct, i) => {
        const x = pad + i * step;
        const y = h - pad - (pct / maxPct) * (h - pad * 2);
        return `<circle cx="${x}" cy="${y}" r="4" fill="var(--bg)" stroke="var(--success)" stroke-width="2"/>
          <text x="${x}" y="${y - 14}" text-anchor="middle" fill="var(--text)" font-size="9" font-weight="600">${pct}%ile</text>
          ${ranks[i] ? `<text x="${x}" y="${y + 22}" text-anchor="middle" fill="var(--muted)" font-size="7">Rank #${ranks[i]}</text>` : ''}`;
      }).join('')}
      ${withRank.map((t, i) => {
        const x = pad + i * step;
        return `<text x="${x}" y="${h - 4}" text-anchor="middle" fill="var(--muted)" font-size="8">${fmtDate(t.date)}</text>`;
      }).join('')}
    </svg>`;
  }

  /* ═══════════════ CONSISTENCY SCORE ═══════════════ */
  function consistencyScore(allTests) {
    if (allTests.length < 2) return { label: 'N/A', value: '--', color: 'var(--muted)' };
    const pcts = allTests.map(t => safePct(t.totalScore ?? t.total ?? 0, t.maxScore ?? t.max ?? 300));
    const avg = pcts.reduce((a, b) => a + b, 0) / pcts.length;
    const variance = pcts.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / pcts.length;
    const stdDev = Math.round(Math.sqrt(variance));
    const consistency = Math.max(0, 100 - stdDev);
    const color = consistency >= 80 ? 'var(--success)' : consistency >= 60 ? 'var(--accent)' : 'var(--danger)';
    const label = consistency >= 80 ? 'Very Consistent' : consistency >= 60 ? 'Moderately Consistent' : 'Needs Consistency';
    return { label: label, value: consistency + '%', color: color, sub: `σ = ${stdDev}%` };
  }

  /* ═══════════════ IMPROVEMENT TRAJECTORY ═══════════════ */
  function improvementTrajectory(allTests) {
    if (allTests.length < 2) return { first: 0, second: 0, change: 0 };
    const mid = Math.floor(allTests.length / 2);
    const firstHalf = allTests.slice(0, mid);
    const secondHalf = allTests.slice(mid);
    const avgHalf = (arr) => arr.length ? Math.round(arr.reduce((s, t) => s + safePct(t.totalScore ?? t.total ?? 0, t.maxScore ?? t.max ?? 300), 0) / arr.length) : 0;
    const first = avgHalf(firstHalf);
    const second = avgHalf(secondHalf);
    return { first: first, second: second, change: second - first };
  }

  /* ═══════════════ MAIN RENDER ═══════════════ */
  window.renderAnalytics = function(el) {
    if (!el) return;
    const tests = (window.DB && window.DB.tests) || [];

    if (tests.length === 0) {
      el.innerHTML = `
      <div class="empty anim-entrance" style="--delay:0.1s;padding:48px">
        <div class="empty-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
        <div class="empty-title">No test data yet</div>
        <div class="empty-sub">Record some tests to see your analytics</div>
      </div>`;
      return;
    }

    // ── Core Stats ──
    const avgPct = safePct(tests.reduce((s, t) => s + (t.totalScore ?? t.total ?? 0), 0), tests.reduce((s, t) => s + (t.maxScore ?? t.max ?? 300), 0));
    const bestPct = Math.max(...tests.map(t => safePct(t.totalScore ?? t.total ?? 0, t.maxScore ?? t.max ?? 300)));
    const totalPoints = tests.reduce((s, t) => s + (t.totalScore || 0), 0);
    const improvement = tests.length >= 2 ? safePct(tests[tests.length - 1].totalScore ?? tests[tests.length - 1].total ?? 0, tests[tests.length - 1].maxScore ?? tests[tests.length - 1].max ?? 300) - safePct(tests[0].totalScore ?? tests[0].total ?? 0, tests[0].maxScore ?? tests[0].max ?? 300) : 0;

    // ── Per-Subject Scores ──
    const physicsScores = tests.map(t => safePct((t.physics?.correct || 0) * 4 - (t.physics?.incorrect || 0), 100));
    const chemScores = tests.map(t => safePct((t.chemistry?.correct || 0) * 4 - (t.chemistry?.incorrect || 0), 100));
    const mathsScores = tests.map(t => safePct((t.maths?.correct || 0) * 4 - (t.maths?.incorrect || 0), 100));
    const hasSynthetic = tests.some(t => t.physics?._synthetic || t.chemistry?._synthetic || t.maths?._synthetic);

    // ── Timing Averages ──
    const testsWithTiming = tests.filter(t => t.timing && t.timing.total);
    const avgTimeP = testsWithTiming.length ? Math.round(testsWithTiming.reduce((s, t) => s + (t.timing.physics || 0), 0) / testsWithTiming.length) : 0;
    const avgTimeC = testsWithTiming.length ? Math.round(testsWithTiming.reduce((s, t) => s + (t.timing.chemistry || 0), 0) / testsWithTiming.length) : 0;
    const avgTimeM = testsWithTiming.length ? Math.round(testsWithTiming.reduce((s, t) => s + (t.timing.maths || 0), 0) / testsWithTiming.length) : 0;

    // ── Derived Analytics ──
    const consistency = consistencyScore(tests);
    const trajectory = improvementTrajectory(tests);
    const sorted = [...tests].sort((a, b) => (b.totalScore / b.maxScore) - (a.totalScore / a.maxScore));
    const bestTest = sorted[0];
    const worstTest = sorted[sorted.length - 1];

    el.innerHTML = `
    <!-- ═══ HERO STATS ═══ -->
    <div class="hero-stats" data-tutorial-id="hero-stats">
      ${heroStat(tests.length, 'Total Tests', 'var(--accent)', '0.1s')}
      ${heroStat(avgPct + '%', 'Avg Score', 'var(--success)', '0.15s')}
      ${heroStat(bestPct + '%', 'Best Score', 'var(--primary)', '0.2s')}
      ${heroStat(totalPoints, 'Total Points', 'var(--secondary)', '0.25s')}
    </div>

    <!-- ═══ PERFORMANCE TREND ═══ -->
    <div class="section-block anim-entrance" style="--delay:0.3s">
      <div class="section-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> Performance Trend</div>
      <div class="card chart-entrance" style="padding:20px;overflow-x:auto">
        ${trendLineChart(tests)}
      </div>
    </div>

    <!-- ═══ SUBJECT BREAKDOWN ═══ -->
    <div class="section-block anim-entrance" style="--delay:0.4s">
      <div class="section-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> Subject Breakdown</div>
      <div class="card chart-entrance" style="padding:20px">
        <div style="display:flex;gap:24px;flex-wrap:wrap">
          ${subjectBar('physics', physicsScores, hasSynthetic)}
          ${subjectBar('chemistry', chemScores, hasSynthetic)}
          ${subjectBar('maths', mathsScores, hasSynthetic)}
        </div>
      </div>
    </div>

    <!-- ═══ TEST AVERAGES ═══ -->
    <div class="section-block anim-entrance" style="--delay:0.45s">
      <div class="section-title"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> Test Averages</div>
      <div class="stats-grid chart-entrance">
        <div class="stat-card anim-entrance" style="--delay:0.5s"><div class="stat-val" style="color:var(--success)">${avgPct}%</div><div class="stat-label">Avg Total</div><div class="stat-sub">/300</div></div>
        <div class="stat-card anim-entrance" style="--delay:0.52s"><div class="stat-val" style="color:var(--primary)">${physicsScores.length ? Math.round(physicsScores.reduce((a,b)=>a+b,0)/physicsScores.length) : 0}%</div><div class="stat-label">Avg Physics</div><div class="stat-sub">/100</div></div>
        <div class="stat-card anim-entrance" style="--delay:0.54s"><div class="stat-val" style="color:var(--secondary)">${chemScores.length ? Math.round(chemScores.reduce((a,b)=>a+b,0)/chemScores.length) : 0}%</div><div class="stat-label">Avg Chemistry</div><div class="stat-sub">/100</div></div>
        <div class="stat-card anim-entrance" style="--delay:0.56s"><div class="stat-val" style="color:var(--accent)">${mathsScores.length ? Math.round(mathsScores.reduce((a,b)=>a+b,0)/mathsScores.length) : 0}%</div><div class="stat-label">Avg Maths</div><div class="stat-sub">/100</div></div>
      </div>
    </div>

    <!-- ═══ SCORE DISTRIBUTION ═══ -->
    <div class="section-block anim-entrance" style="--delay:0.55s">
      <div class="section-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> Score Distribution</div>
      <div class="card chart-entrance" style="padding:20px;overflow-x:auto">
        ${scoreDistribution(tests)}
      </div>
    </div>

    <!-- ═══ PER-SUBJECT ACCURACY ═══ -->
    <div class="section-block anim-entrance" style="--delay:0.6s">
      <div class="section-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg> Per-Subject Accuracy</div>
      <div class="card chart-entrance" style="padding:20px">
        <div style="display:flex;gap:24px;flex-wrap:wrap">
          ${subjectAccuracy(tests)}
        </div>
      </div>
    </div>

    <!-- ═══ RANK & PERCENTILE TREND ═══ -->
    <div class="section-block anim-entrance" style="--delay:0.65s">
      <div class="section-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg> Rank & Percentile Trend</div>
      <div class="card chart-entrance" style="padding:20px;overflow-x:auto">
        ${rankPercentileTrend(tests)}
      </div>
    </div>

    <!-- ═══ CONSISTENCY & TRAJECTORY ═══ -->
    <div class="section-block anim-entrance" style="--delay:0.7s">
      <div class="section-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> Performance Insights</div>
      <div class="stats-grid">
        <div class="stat-card anim-entrance" style="--delay:0.72s">
          <div class="stat-icon" style="color:${consistency.color}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg></div>
          <div class="stat-val" style="color:${consistency.color}">${consistency.value}</div>
          <div class="stat-label">Consistency</div>
          <div class="stat-sub">${consistency.label}${consistency.sub ? ' · ' + consistency.sub : ''}</div>
        </div>
        <div class="stat-card anim-entrance" style="--delay:0.74s">
          <div class="stat-icon" style="color:${trajectory.change >= 0 ? 'var(--success)' : 'var(--danger)'}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="${trajectory.change >= 0 ? '18 15 12 9 6 15' : '6 9 12 15 18 9'}"/></svg></div>
          <div class="stat-val" style="color:${trajectory.change >= 0 ? 'var(--success)' : 'var(--danger)'}">${trajectory.change >= 0 ? '+' : ''}${trajectory.change}%</div>
          <div class="stat-label">Improvement</div>
          <div class="stat-sub">First half: ${trajectory.first}% → Second half: ${trajectory.second}%</div>
        </div>
        <div class="stat-card anim-entrance" style="--delay:0.76s">
          <div class="stat-icon" style="color:var(--danger)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
          <div class="stat-val">${tests.length >= 2 ? safePct(worstTest.totalScore ?? worstTest.total ?? 0, worstTest.maxScore ?? worstTest.max ?? 300) + '%' : '--'}</div>
          <div class="stat-label">Lowest Score</div>
          <div class="stat-sub">${tests.length >= 2 ? esc(worstTest.name || 'Test') : 'Need more data'}</div>
        </div>
      </div>
    </div>

    <!-- ═══ RECENT 5 TESTS ═══ -->
    <div class="section-block anim-entrance" style="--delay:0.8s">
      <div class="section-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Recent Tests</div>
      <div class="card" style="padding:0;overflow:hidden">
        <table style="width:100%;border-collapse:collapse;font-size:12px">
          <thead>
            <tr style="border-bottom:1px solid var(--border);background:var(--surface2)">
              <th style="padding:10px 14px;text-align:left;font-weight:600;color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:.05em">Date</th>
              <th style="padding:10px 14px;text-align:left;font-weight:600;color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:.05em">Name</th>
              <th style="padding:10px 14px;text-align:right;font-weight:600;color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:.05em">Score</th>
              <th style="padding:10px 14px;text-align:right;font-weight:600;color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:.05em">Rank</th>
              <th style="padding:10px 14px;text-align:right;font-weight:600;color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:.05em">Percentile</th>
            </tr>
          </thead>
          <tbody>
            ${tests.slice(0, 5).map(t => {
              const score = t.totalScore ?? t.total ?? 0;
              const max = t.maxScore ?? t.max ?? 300;
              const pct = safePct(score, max);
              const color = pct >= 70 ? 'var(--success)' : pct >= 50 ? 'var(--accent)' : 'var(--danger)';
              return `<tr style="border-bottom:1px solid var(--border)">
                <td style="padding:10px 14px;color:var(--muted)">${fmtDate(t.date)}</td>
                <td style="padding:10px 14px;font-weight:500">${esc(t.name || 'Test')}</td>
                <td style="padding:10px 14px;text-align:right;font-weight:700;color:${color}">${score}/${max}</td>
                <td style="padding:10px 14px;text-align:right;color:var(--muted)">${t.rank ? '#' + t.rank : '—'}</td>
                <td style="padding:10px 14px;text-align:right;color:var(--muted)">${t.percentile ? t.percentile + '%' : '—'}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- ═══ SUBJECT-WISE TIME ═══ -->
    <div class="section-block anim-entrance" style="--delay:0.85s">
      <div class="section-title"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Subject-Wise Time Allocation</div>
      <div class="grid subj-responsive-grid" style="gap:16px">
        ${subjectTimeCard('Physics', avgTimeP, 'var(--primary)', '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>')}
        ${subjectTimeCard('Chemistry', avgTimeC, 'var(--secondary)', '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6v11l4 5H5l4-5V3z"/><line x1="9" y1="3" x2="15" y2="3"/></svg>')}
        ${subjectTimeCard('Maths', avgTimeM, 'var(--accent)', '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20L20 4"/><path d="M15 4h5v5"/><path d="M4 20l5-5"/></svg>')}
      </div>
    </div>`;
    if (window.initChartEntrance) setTimeout(function() { window.initChartEntrance(); }, 50);
  };
})();
