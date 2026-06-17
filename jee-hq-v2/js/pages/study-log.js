// js/pages/study-log.js — Study Log page renderer (Nexus & Bloom)
(function() {
  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function fmtDate(d) { return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }); }
  function safePct(a, b) { return b > 0 ? Math.round((a / b) * 100) : 0; }
  function getTheme() { return document.documentElement.getAttribute('data-theme') || 'nexus'; }
  function pfx() { return getTheme() === 'nexus' ? 'nx' : 'bl'; }

  const SUBJECT_ICONS = {
    Physics:   '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    Chemistry: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6v11l4 5H5l4-5V3z"/><line x1="9" y1="3" x2="15" y2="3"/></svg>',
    Maths:     '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20L20 4"/><path d="M15 4h5v5"/><path d="M4 20l5-5"/></svg>'
  };

  const MOCK_LOGS = [
    { id: 'sl1', subject: 'Physics', topic: 'Rotational Motion', duration: 2.5, date: new Date(Date.now() - 86400000).toISOString().split('T')[0] },
    { id: 'sl2', subject: 'Chemistry', topic: 'Chemical Bonding', duration: 1.8, date: new Date(Date.now() - 172800000).toISOString().split('T')[0] },
    { id: 'sl3', subject: 'Maths', topic: 'Trigonometry', duration: 2.0, date: new Date(Date.now() - 259200000).toISOString().split('T')[0] },
    { id: 'sl4', subject: 'Physics', topic: 'Laws of Motion', duration: 1.5, date: new Date(Date.now() - 345600000).toISOString().split('T')[0] },
    { id: 'sl5', subject: 'Chemistry', topic: 'Atomic Structure', duration: 2.2, date: new Date(Date.now() - 432000000).toISOString().split('T')[0] },
    { id: 'sl6', subject: 'Physics', topic: 'Work, Energy & Power', duration: 1.0, date: new Date(Date.now() - 432000000).toISOString().split('T')[0] },
    { id: 'sl7', subject: 'Maths', topic: 'Quadratic Equations', duration: 1.5, date: new Date(Date.now() - 518400000).toISOString().split('T')[0] }
  ];

  function weeklyChart(logs) {
    const p = pfx();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const hours = logs.filter(l => l.date === key).reduce((s, l) => s + l.duration, 0);
      days.push({ date: d, day: d.toLocaleDateString('en-IN', { weekday: 'short' }), hours });
    }
    const maxH = Math.max(...days.map(d => d.hours), 1);
    const barW = 32;
    const h = 120;
    const w = days.length * (barW + 10) + 20;

    return `<svg width="100%" viewBox="0 0 ${w} ${h}" style="overflow:visible">
      ${days.map((d, i) => {
        const barH = (d.hours / maxH) * (h - 30);
        const x = 10 + i * (barW + 10);
        const y = h - 20 - barH;
        return `<rect x="${x}" y="${y}" width="${barW}" height="${barH}" rx="4" fill="var(--accent)" opacity="${d.hours > 0 ? 0.8 : 0.2}"/>
          ${d.hours > 0 ? `<text x="${x + barW / 2}" y="${y - 6}" text-anchor="middle" fill="var(--text)" font-size="9" font-weight="600">${d.hours.toFixed(1)}</text>` : ''}
          <text x="${x + barW / 2}" y="${h - 4}" text-anchor="middle" fill="var(--muted)" font-size="8">${d.day}</text>`;
      }).join('')}
    </svg>`;
  }

  function logRow(log, index) {
    const p = pfx();
    return `<div class="${p}-list-item anim-entrance" style="--delay:${index * 0.04}s">
      <div style="display:flex;align-items:center;gap:8px;flex:1">
        <div style="width:28px;height:28px;border-radius:6px;background:var(--border);display:flex;align-items:center;justify-content:center;flex-shrink:0">
          ${SUBJECT_ICONS[log.subject] || ''}
        </div>
        <div>
          <div class="${p}-list-title">${esc(log.topic)}</div>
          <div class="${p}-list-meta">${esc(log.subject)}</div>
        </div>
      </div>
      <div style="text-align:right">
        <div class="${p}-list-value">${log.duration}h</div>
        <div class="${p}-list-meta">${fmtDate(log.date)}</div>
      </div>
    </div>`;
  }

  window.renderStudyLog = function(el) {
    const p = pfx();
    const logs = window.DB.studyLogs?.length > 0 ? window.DB.studyLogs : MOCK_LOGS;
    const totalHours = logs.reduce((s, l) => s + l.duration, 0);
    const today = new Date().toISOString().split('T')[0];
    const todayH = logs.filter(l => l.date === today).reduce((s, l) => s + l.duration, 0);
    const weekH = logs.filter(l => {
      const d = new Date(l.date);
      const n = new Date();
      return (n - d) / 86400000 <= 7;
    }).reduce((s, l) => s + l.duration, 0);
    const avgPerDay = logs.length > 0 ? totalHours / new Set(logs.map(l => l.date)).size : 0;
    const subjectHours = { Physics: 0, Chemistry: 0, Maths: 0 };
    logs.forEach(l => { if (subjectHours[l.subject] !== undefined) subjectHours[l.subject] += l.duration; });
    const topSubject = Object.entries(subjectHours).sort((a, b) => b[1] - a[1])[0];

    el.innerHTML = `
    <div class="${p}-page-header anim-entrance">
      <div class="${p}-page-title" data-text="Study Log">Study Log</div>
      <div class="${p}-page-sub">Track your study sessions</div>
    </div>
    <div class="${p}-stats-grid anim-entrance" style="--delay:0.1s">
      <div class="${p}-stat-card">
        <div class="${p}-stat-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
        <div class="${p}-stat-val"><span data-count="${(+totalHours).toFixed(1)}" data-float="true">0</span>h</div>
        <div class="${p}-stat-label">Total Hours</div>
        <div class="${p}-stat-sub">${logs.length} sessions logged</div>
      </div>
      <div class="${p}-stat-card">
        <div class="${p}-stat-icon" style="color:var(--accent)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
        <div class="${p}-stat-val" style="color:var(--accent)"><span data-count="${(+todayH).toFixed(1)}" data-float="true">0</span>h</div>
        <div class="${p}-stat-label">Today</div>
        <div class="${p}-stat-sub">${logs.filter(l => l.date === today).length} sessions</div>
      </div>
      <div class="${p}-stat-card">
        <div class="${p}-stat-icon" style="color:var(--success)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
        <div class="${p}-stat-val" style="color:var(--success)"><span data-count="${(+weekH).toFixed(1)}" data-float="true">0</span>h</div>
        <div class="${p}-stat-label">This Week</div>
        <div class="${p}-stat-sub">${topSubject[1] > 0 ? topSubject[0] : 'No data'}</div>
      </div>
    </div>
    <div class="${p}-section-block anim-entrance" style="--delay:0.2s">
      <div class="${p}-section-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Weekly Overview</div>
      <div class="${p}-card" style="padding:16px;overflow-x:auto">
        ${weeklyChart(logs)}
      </div>
    </div>
    <div class="${p}-section-block anim-entrance" style="--delay:0.3s">
      <div class="${p}-section-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Session Log</div>
      <div class="${p}-card" style="padding:12px 16px">
        ${logs.length === 0
          ? `<div class="${p}-empty" style="padding:32px">
              <div class="${p}-empty-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>
              <div class="${p}-empty-title">No sessions logged</div>
              <div class="${p}-empty-sub">Start tracking your study time</div>
            </div>`
          : logs.sort((a, b) => new Date(b.date) - new Date(a.date)).map((l, i) => logRow(l, i)).join('')}
      </div>
    </div>`;
  };
})();
