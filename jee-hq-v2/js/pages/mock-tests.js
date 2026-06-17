// js/pages/mock-tests.js — Mock Tests page renderer (Nexus & Bloom)
(function() {
  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function fmtDate(d) { return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }); }
  function safePct(a, b) { return b > 0 ? Math.round((a / b) * 100) : 0; }
  function getTheme() { return document.documentElement.getAttribute('data-theme') || 'nexus'; }
  function pfx() { return getTheme() === 'nexus' ? 'nx' : 'bl'; }

  const SUBJECT_ICONS = {
    physics:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    chemistry: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6v11l4 5H5l4-5V3z"/><line x1="9" y1="3" x2="15" y2="3"/></svg>',
    maths:     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20L20 4"/><path d="M15 4h5v5"/><path d="M4 20l5-5"/></svg>'
  };

  const MOCK_DATA = [
    {
      id: 'mt1', name: 'JEE Main Full Mock #1', date: new Date(Date.now() - 1296000000).toISOString(),
      physics: { correct: 20, incorrect: 3, unattempted: 2 },
      chemistry: { correct: 22, incorrect: 2, unattempted: 1 },
      maths: { correct: 16, incorrect: 6, unattempted: 3 },
      totalScore: 228, maxScore: 300,
      timing: { total: 180, physics: 58, chemistry: 48, maths: 74 }
    },
    {
      id: 'mt2', name: 'JEE Main Full Mock #2', date: new Date(Date.now() - 432000000).toISOString(),
      physics: { correct: 23, incorrect: 1, unattempted: 1 },
      chemistry: { correct: 21, incorrect: 3, unattempted: 1 },
      maths: { correct: 19, incorrect: 4, unattempted: 2 },
      totalScore: 256, maxScore: 300,
      timing: { total: 170, physics: 52, chemistry: 42, maths: 76 }
    },
    {
      id: 'mt3', name: 'JEE Advanced Paper 1', date: new Date(Date.now() - 86400000).toISOString(),
      physics: { correct: 8, incorrect: 2, unattempted: 2 },
      chemistry: { correct: 9, incorrect: 1, unattempted: 1 },
      maths: { correct: 6, incorrect: 3, unattempted: 3 },
      totalScore: 98, maxScore: 198,
      timing: { total: 180, physics: 60, chemistry: 50, maths: 70 }
    }
  ];

  function scoreRing(pct, color, size) {
    const r = (size || 54) / 2 - 5;
    const circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;
    return `<svg width="${size || 54}" height="${size || 54}" viewBox="0 0 ${size || 54} ${size || 54}">
      <circle cx="${(size || 54) / 2}" cy="${(size || 54) / 2}" r="${r}" fill="none" stroke="var(--border)" stroke-width="4"/>
      <circle cx="${(size || 54) / 2}" cy="${(size || 54) / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="4"
        stroke-dasharray="${circ}" stroke-dashoffset="${offset}" stroke-linecap="round"
        transform="rotate(-90 ${(size || 54) / 2} ${(size || 54) / 2})"
        style="transition:stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)"/>
      <text x="${(size || 54) / 2}" y="${(size || 54) / 2 + 1}" text-anchor="middle" dominant-baseline="middle"
        fill="var(--text)" font-size="13" font-weight="700">${pct}%</text>
    </svg>`;
  }

  function subjectBreakdown(test, key) {
    const p = pfx();
    const data = test[key];
    const total = data.correct + data.incorrect + data.unattempted;
    const score = data.correct * 4 - data.incorrect;
    const maxS = total * 4;
    const pct = safePct(Math.max(0, score), maxS);
    return `<div style="flex:1;min-width:120px">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
        <span style="opacity:0.7">${SUBJECT_ICONS[key]}</span>
        <span style="font-size:12px;font-weight:600">${key.charAt(0).toUpperCase() + key.slice(1)}</span>
      </div>
      <div style="font-size:20px;font-weight:700">${score}<span style="font-size:12px;font-weight:400;opacity:0.5">/${maxS}</span></div>
      <div class="${p}-progress-wrap" style="height:4px;margin-top:6px"><div class="${p}-progress-bar" style="height:4px;width:${pct}%"></div></div>
      <div style="font-size:10px;color:var(--muted);margin-top:4px">${data.correct}C ${data.incorrect}W ${data.unattempted}S</div>
    </div>`;
  }

  function mockCard(t, index) {
    const p = pfx();
    const pct = safePct(t.totalScore, t.maxScore);
    const color = pct >= 70 ? 'var(--success)' : pct >= 50 ? 'var(--accent)' : 'var(--danger)';
    const tm = t.timing || {};

    return `<div class="${p}-card anim-entrance" style="--delay:${index * 0.08}s;padding:0;overflow:hidden;cursor:pointer" onclick="this.classList.toggle('expanded')">
      <div style="padding:18px">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">
          ${scoreRing(pct, color)}
          <div style="flex:1">
            <div style="font-size:15px;font-weight:600">${esc(t.name)}</div>
            <div style="font-size:12px;color:var(--muted);margin-top:2px">${fmtDate(t.date)}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:22px;font-weight:700;color:${color}">${t.totalScore}<span style="font-size:13px;font-weight:400;opacity:0.5">/${t.maxScore}</span></div>
          </div>
        </div>
        <div style="display:flex;gap:16px;padding-top:14px;border-top:1px solid var(--border)">
          ${['physics', 'chemistry', 'maths'].map(k => subjectBreakdown(t, k)).join('')}
        </div>
      </div>
      <div style="padding:0 18px 18px;display:none" class="${p}-mock-extra">
        <div style="display:flex;gap:20px;padding:12px;background:var(--card);border-radius:10px;font-size:12px">
          <div style="flex:1;text-align:center">
            <div style="font-weight:600;margin-bottom:4px">Total Time</div>
            <div style="font-size:18px;font-weight:700">${tm.total || '—'}m</div>
          </div>
          <div style="flex:1;text-align:center">
            <div style="font-weight:600;margin-bottom:4px">Accuracy</div>
            <div style="font-size:18px;font-weight:700">${safePct(t.physics.correct + t.chemistry.correct + t.maths.correct, t.physics.correct + t.physics.incorrect + t.physics.unattempted + t.chemistry.correct + t.chemistry.incorrect + t.chemistry.unattempted + t.maths.correct + t.maths.incorrect + t.maths.unattempted)}%</div>
          </div>
          <div style="flex:1;text-align:center">
            <div style="font-weight:600;margin-bottom:4px">Attempted</div>
            <div style="font-size:18px;font-weight:700">${t.physics.correct + t.physics.incorrect + t.chemistry.correct + t.chemistry.incorrect + t.maths.correct + t.maths.incorrect}/75</div>
          </div>
        </div>
      </div>
    </div>`;
  }

  function emptyState() {
    const p = pfx();
    return `<div class="${p}-empty" style="padding:48px 0">
      <div class="${p}-empty-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></div>
      <div class="${p}-empty-title">No mock tests yet</div>
      <div class="${p}-empty-sub">Take your first mock test to see detailed analytics</div>
    </div>`;
  }

  window.renderMockTests = function(el) {
    const p = pfx();
    const tests = window.DB.mockTests?.length ? window.DB.mockTests : MOCK_DATA;
    const avgScore = tests.length ? safePct(tests.reduce((s, t) => s + t.totalScore, 0), tests.reduce((s, t) => s + t.maxScore, 0)) : 0;
    const best = tests.length ? Math.max(...tests.map(t => safePct(t.totalScore, t.maxScore))) : 0;

    el.innerHTML = `
    <div class="${p}-page-header anim-entrance">
      <div class="${p}-page-title" data-text="Mock Tests">Mock Tests</div>
      <div class="${p}-page-sub">Full-length practice exams</div>
    </div>
    <div class="${p}-stats-grid anim-entrance" style="--delay:0.1s">
      <div class="${p}-stat-card">
        <div class="${p}-stat-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></div>
        <div class="${p}-stat-val"><span data-count="${tests.length}">0</span></div>
        <div class="${p}-stat-label">Tests Taken</div>
        <div class="${p}-stat-sub">Practice sessions</div>
      </div>
      <div class="${p}-stat-card">
        <div class="${p}-stat-icon" style="color:var(--accent)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
        <div class="${p}-stat-val" style="color:var(--accent)"><span data-count="${avgScore}">0</span>%</div>
        <div class="${p}-stat-label">Avg Score</div>
        <div class="${p}-stat-sub">Across all tests</div>
      </div>
      <div class="${p}-stat-card">
        <div class="${p}-stat-icon" style="color:var(--success)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
        <div class="${p}-stat-val" style="color:var(--success)"><span data-count="${best}">0</span>%</div>
        <div class="${p}-stat-label">Best Score</div>
        <div class="${p}-stat-sub">Personal record</div>
      </div>
    </div>
    <div class="${p}-section-block anim-entrance" style="--delay:0.2s">
      <div class="${p}-section-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> All Mock Tests</div>
      ${tests.length === 0 ? emptyState() : `<div style="display:flex;flex-direction:column;gap:16px">${tests.map((t, i) => mockCard(t, i)).join('')}</div>`}
    </div>`;
  };
})();
