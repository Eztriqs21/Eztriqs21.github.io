// page-js/study-log.js — Study Log page with live timer (Nexus & Bloom)
(function() {
  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML.replace(/'/g, '&#39;'); }
  function fmtDate(d) { return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }); }
  function getTheme() { return document.documentElement.getAttribute('data-theme') || 'nexus'; }
  function pfx() { return getTheme() === 'nexus' ? 'nx' : 'bl'; }

  const SUBJECT_ICONS = {
    Physics:   '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    Chemistry: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6v11l4 5H5l4-5V3z"/><line x1="9" y1="3" x2="15" y2="3"/></svg>',
    Maths:     '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20L20 4"/><path d="M15 4h5v5"/><path d="M4 20l5-5"/></svg>'
  };

  // Session state
  var _session = null; // { status: 'running'|'paused', subject, topic, startTime, pausedAt, totalPausedMs }
  var _timerInterval = null;

  function loadSession() {
    try {
      var raw = localStorage.getItem('studySession');
      if (raw) _session = JSON.parse(raw);
    } catch(e) {}
  }
  function saveSession() {
    if (_session) localStorage.setItem('studySession', JSON.stringify(_session));
    else localStorage.removeItem('studySession');
  }

  function startTimer() {
    if (_timerInterval) return;
    _timerInterval = setInterval(function() {
      var el = document.getElementById('sl-live-timer');
      if (el && _session) {
        var elapsed = getElapsed();
        el.textContent = formatTime(elapsed);
      }
    }, 1000);
  }
  function stopTimer() {
    if (_timerInterval) { clearInterval(_timerInterval); _timerInterval = null; }
  }

  function getElapsed() {
    if (!_session) return 0;
    var now = Date.now();
    var base = _session.status === 'paused' ? _session.pausedAt : now;
    return Math.floor((base - _session.startTime - (_session.totalPausedMs || 0)) / 1000);
  }

  function formatTime(sec) {
    var h = Math.floor(sec / 3600);
    var m = Math.floor((sec % 3600) / 60);
    var s = sec % 60;
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  function sessionBanner() {
    if (!_session) return '';
    var p = pfx();
    var elapsed = getElapsed();
    var isRunning = _session.status === 'running';
    return '<div class="' + p + '-card anim-entrance" style="padding:16px;margin-bottom:16px;border:1px solid var(--accent);background:var(--accent-dim)">'
      + '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">'
      + '<div style="width:10px;height:10px;border-radius:50%;background:' + (isRunning ? 'var(--success)' : 'var(--accent)') + ';animation:pulse 1.5s infinite"></div>'
      + '<div style="flex:1;min-width:0">'
      + '<div style="font-size:13px;font-weight:600">' + esc(_session.topic || 'Study Session') + '</div>'
      + '<div style="font-size:11px;color:var(--muted)">' + esc(_session.subject) + ' · ' + (isRunning ? 'Running' : 'Paused') + '</div>'
      + '</div>'
      + '<div id="sl-live-timer" style="font-family:var(--font-data);font-size:28px;font-weight:700;color:var(--accent);letter-spacing:2px">' + formatTime(elapsed) + '</div>'
      + '<div style="display:flex;gap:8px">'
      + (isRunning
        ? '<button class="' + p + '-btn ' + p + '-btn-ghost" onclick="window._pauseSession()" style="font-size:11px;padding:6px 12px">Pause</button>'
        : '<button class="' + p + '-btn ' + p + '-btn-primary" onclick="window._resumeSession()" style="font-size:11px;padding:6px 12px">Resume</button>')
      + '<button class="' + p + '-btn ' + p + '-btn-ghost" style="font-size:11px;padding:6px 12px;color:var(--danger)" onclick="window._stopSession()">Stop</button>'
      + '</div>'
      + '</div></div>';
  }

  function weeklyChart(logs) {
    const p = pfx();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const hours = logs.filter(l => l.date === key).reduce((s, l) => s + l.duration, 0);
      days.push({ date: d, day: d.toLocaleDateString('en-IN', { weekday: 'short' }), hours });
    }
    const maxH = Math.max(...days.map(d => d.hours), 1);
    const barW = 32, h = 120, w = days.length * (barW + 10) + 20;
    return '<svg width="100%" viewBox="0 0 ' + w + ' ' + h + '" style="overflow:visible">'
      + days.map(function(d, i) {
        const barH = (d.hours / maxH) * (h - 30);
        const x = 10 + i * (barW + 10), y = h - 20 - barH;
        return '<rect x="' + x + '" y="' + y + '" width="' + barW + '" height="' + barH + '" rx="4" fill="var(--accent)" opacity="' + (d.hours > 0 ? 0.8 : 0.2) + '"/>'
          + (d.hours > 0 ? '<text x="' + (x + barW / 2) + '" y="' + (y - 6) + '" text-anchor="middle" fill="var(--text)" font-size="9" font-weight="600">' + d.hours.toFixed(1) + '</text>' : '')
          + '<text x="' + (x + barW / 2) + '" y="' + (h - 4) + '" text-anchor="middle" fill="var(--muted)" font-size="8">' + d.day + '</text>';
      }).join('')
      + '</svg>';
  }

  function logRow(log, index) {
    const p = pfx();
    return '<div class="' + p + '-list-item anim-entrance" style="--delay:' + (index * 0.04) + 's">'
      + '<div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0">'
      + '<div style="width:28px;height:28px;border-radius:6px;background:var(--border-card);display:flex;align-items:center;justify-content:center;flex-shrink:0">'
      + (SUBJECT_ICONS[log.subject] || '')
      + '</div>'
      + '<div style="min-width:0">'
      + '<div class="' + p + '-list-title">' + esc(log.topic) + '</div>'
      + '<div class="' + p + '-list-meta">' + esc(log.subject) + ' · ' + fmtDate(log.date) + '</div>'
      + '</div>'
      + '</div>'
      + '<div style="display:flex;align-items:center;gap:8px;flex-shrink:0">'
      + '<div style="text-align:right">'
      + '<div class="' + p + '-list-value">' + log.duration + 'h</div>'
      + '</div>'
      + '<button class="' + p + '-btn-ghost" style="font-size:10px;padding:4px 8px;color:var(--danger)" onclick="event.stopPropagation();window.deleteStudyLog(\'' + log.id + '\')">'
      + '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>'
      + '</button>'
      + '</div>'
      + '</div>';
  }

  window.renderStudyLog = function(el) {
    if (!el) return;
    const p = pfx();
    const DB = window.DB;
    if (!DB) { el.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-muted)">Loading data...</div>'; return; }
    loadSession();
    if (_session && _session.status === 'running') startTimer();
    const logs = DB.studyLogs || [];
    const totalHours = logs.reduce((s, l) => s + l.duration, 0);
    const today = new Date().toISOString().split('T')[0];
    const todayH = logs.filter(l => l.date === today).reduce((s, l) => s + l.duration, 0);
    const weekH = logs.filter(l => { const d = new Date(l.date); return (new Date() - d) / 86400000 <= 7; }).reduce((s, l) => s + l.duration, 0);
    const uniqueDays = new Set(logs.map(l => l.date)).size || 1;
    const avgPerDay = totalHours / uniqueDays;
    const subjectHours = { physics: 0, chemistry: 0, maths: 0 };
    logs.forEach(l => { var k = (l.subject || '').toLowerCase(); if (subjectHours[k] !== undefined) subjectHours[k] += l.duration; });
    const topSubject = Object.entries(subjectHours).sort((a, b) => b[1] - a[1])[0];

    el.innerHTML = ''
      + '<div class="' + p + '-page-header anim-entrance" style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px">'
      + '<div>'
      + '<div class="' + p + '-page-title" data-text="Study Log">Study Log</div>'
      + '<div class="' + p + '-page-sub">Track your study sessions</div>'
      + '</div>'
      + '<div style="display:flex;gap:8px">'
      + (_session
        ? ''
        : '<button class="' + p + '-btn ' + p + '-btn-primary" onclick="window._startSessionModal()">Start Session</button>')
      + '<button class="' + p + '-btn ' + p + '-btn-ghost" onclick="window.openStudyLog()">+ Manual Entry</button>'
      + '</div>'
      + '</div>'
      + sessionBanner()
      + '<div class="' + p + '-stats-grid anim-entrance" style="--delay:0.1s">'
      + '<div class="' + p + '-stat-card">'
      + '<div class="' + p + '-stat-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>'
      + '<div class="' + p + '-stat-val"><span data-count="' + (+totalHours).toFixed(1) + '" data-float="true">0</span>h</div>'
      + '<div class="' + p + '-stat-label">Total Hours</div>'
      + '<div class="' + p + '-stat-sub">' + logs.length + ' sessions</div>'
      + '</div>'
      + '<div class="' + p + '-stat-card">'
      + '<div class="' + p + '-stat-icon" style="color:var(--accent)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>'
      + '<div class="' + p + '-stat-val" style="color:var(--accent)"><span data-count="' + (+todayH).toFixed(1) + '" data-float="true">0</span>h</div>'
      + '<div class="' + p + '-stat-label">Today</div>'
      + '<div class="' + p + '-stat-sub">' + logs.filter(l => l.date === today).length + ' sessions</div>'
      + '</div>'
      + '<div class="' + p + '-stat-card">'
      + '<div class="' + p + '-stat-icon" style="color:var(--success)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>'
      + '<div class="' + p + '-stat-val" style="color:var(--success)"><span data-count="' + (+weekH).toFixed(1) + '" data-float="true">0</span>h</div>'
      + '<div class="' + p + '-stat-label">This Week</div>'
      + '<div class="' + p + '-stat-sub">' + (topSubject && topSubject[1] > 0 ? topSubject[0].charAt(0).toUpperCase() + topSubject[0].slice(1) : 'No data') + '</div>'
      + '</div>'
      + '</div>'
      + '<div class="' + p + '-section-block anim-entrance" style="--delay:0.2s">'
      + '<div class="' + p + '-section-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Weekly Overview</div>'
      + '<div class="' + p + '-card" style="padding:16px;overflow-x:auto">'
      + weeklyChart(logs)
      + '</div></div>'
      + '<div class="' + p + '-section-block anim-entrance" style="--delay:0.3s">'
      + '<div class="' + p + '-section-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Session Log</div>'
      + '<div class="' + p + '-card" style="padding:12px 16px">'
      + (logs.length === 0
        ? '<div class="' + p + '-empty" style="padding:32px"><div class="' + p + '-empty-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div><div class="' + p + '-empty-title">No sessions logged</div><div class="' + p + '-empty-sub">Tap Start Session to begin tracking</div></div>'
        : [...logs].sort((a, b) => new Date(b.date) - new Date(a.date)).map((l, i) => logRow(l, i)).join(''))
      + '</div></div>';
  };

  /* Session Timer CRUD */
  window._startSessionModal = function() {
    if (window.om) window.om('m-study-session');
    setTimeout(function() { var t = document.getElementById('ss-topic'); if (t) t.focus(); }, 320);
  };

  window._startSession = function() {
    var subjEl = document.getElementById('ss-subj');
    var subj = subjEl ? subjEl.value : 'Physics';
    var topicEl = document.getElementById('ss-topic');
    var topic = topicEl ? topicEl.value.trim() : '';
    if (!topic) { if (window.toast) window.toast('Enter a topic'); return; }
    _session = { status: 'running', subject: subj, topic: topic, startTime: Date.now(), pausedAt: 0, totalPausedMs: 0 };
    saveSession();
    if (window.cm) window.cm('m-study-session');
    startTimer();
    window.renderStudyLog(document.getElementById('content-wrap'));
    if (window.toast) window.toast('Session started!');
  };

  window._pauseSession = function() {
    if (!_session || _session.status !== 'running') return;
    _session.status = 'paused';
    _session.pausedAt = Date.now();
    saveSession();
    stopTimer();
    window.renderStudyLog(document.getElementById('content-wrap'));
  };

  window._resumeSession = function() {
    if (!_session || _session.status !== 'paused') return;
    _session.totalPausedMs += Date.now() - _session.pausedAt;
    _session.status = 'running';
    _session.pausedAt = 0;
    saveSession();
    startTimer();
    window.renderStudyLog(document.getElementById('content-wrap'));
  };

  window._stopSession = function() {
    if (!_session) return;
    var elapsed = getElapsed();
    var dur = Math.round((elapsed / 3600) * 10) / 10;
    if (dur < 0.05) { if (window.toast) window.toast('Session too short to save'); _session = null; saveSession(); stopTimer(); window.renderStudyLog(document.getElementById('content-wrap')); return; }
    var DB = window.DB;
    if (!DB) return;
    if (!DB.studyLogs) DB.studyLogs = [];
    DB.studyLogs.unshift({
      id: 'sl_' + Date.now(),
      subject: _session.subject,
      topic: _session.topic,
      duration: dur,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    });
    if (window.sv) window.sv('studyLogs');
    _session = null;
    saveSession();
    stopTimer();
    window.renderStudyLog(document.getElementById('content-wrap'));
    if (window.toast) window.toast('Session saved! ' + dur + 'h logged');
  };

  /* Manual Entry CRUD */
  window.openStudyLog = function() {
    var dt = document.getElementById('sl-date');
    if (dt) dt.value = new Date().toISOString().split('T')[0];
    if (window.om) window.om('m-study-log');
    setTimeout(function() { var t = document.getElementById('sl-topic'); if (t) t.focus(); }, 320);
  };

  window.deleteStudyLog = function(id) {
    var DB = window.DB;
    if (!DB || !DB.studyLogs) return;
    if (window.cfm2) {
      window.cfm2('Delete Session', 'Delete this study session?', function() {
        DB.studyLogs = DB.studyLogs.filter(l => l.id !== id);
        if (window.sv) window.sv('studyLogs');
        window.renderStudyLog(document.getElementById('content-wrap'));
        if (window.toast) window.toast('Session deleted');
      });
    } else {
      DB.studyLogs = DB.studyLogs.filter(l => l.id !== id);
      if (window.sv) window.sv('studyLogs');
      window.renderStudyLog(document.getElementById('content-wrap'));
    }
  };

  loadSession();
})();
