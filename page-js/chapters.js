// page-js/chapters.js — Chapters page (Nexus & Bloom)
(function() {
  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML.replace(/'/g, '&#39;'); }
  function getTheme() { return document.documentElement.getAttribute('data-theme') || 'nexus'; }
  function pfx() { return getTheme() === 'nexus' ? 'nx' : 'bl'; }

  const SUBJECTS = {
    physics: { label: 'Physics', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>' },
    chemistry: { label: 'Chemistry', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6v11l4 5H5l4-5V3z"/><line x1="9" y1="3" x2="15" y2="3"/></svg>' },
    maths: { label: 'Mathematics', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20L20 4"/><path d="M15 4h5v5"/><path d="M4 20l5-5"/></svg>' }
  };

  const STRENGTH = ['none', 'weak', 'medium', 'strong'];
  const STRENGTH_COLORS = { none: 'var(--muted)', weak: 'var(--danger)', medium: 'var(--accent)', strong: 'var(--success)' };
  const STRENGTH_BG = { none: 'var(--border-card)', weak: 'var(--red-dim)', medium: 'var(--accent-dim)', strong: 'rgba(34,197,94,0.1)' };

  let _chFilter = 'all';
  let _chSearch = '';

  function chapterRow(ch, subj, index) {
    const p = pfx();
    const str = ch.strength || 'none';
    const strColor = STRENGTH_COLORS[str];
    const strBg = STRENGTH_BG[str];

    return `<div class="${p}-list-item anim-entrance" style="--delay:${index * 0.02}s;cursor:pointer" onclick="window.openEditCh('${subj}','${ch.id}')">
      <div class="${p}-chapter-check ${ch.completed ? 'done' : ''}" onclick="event.stopPropagation();window.toggleChDone('${subj}','${ch.id}')">
        ${ch.completed ? '<svg width="11" height="11" viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/></svg>' : ''}
      </div>
      <div style="flex:1;min-width:0">
        <div class="${p}-list-title" style="${ch.completed ? 'text-decoration:line-through;opacity:0.5' : ''}">${esc(ch.name)}</div>
        <div style="display:flex;align-items:center;gap:6px;margin-top:4px">
          <span style="font-size:10px;padding:2px 8px;border-radius:20px;background:${strBg};color:${strColor};font-weight:600;cursor:pointer" onclick="event.stopPropagation();window.setMF('${subj}','${ch.id}')">${str === 'none' ? 'Set strength' : str.charAt(0).toUpperCase() + str.slice(1)}</span>
          ${ch.pyq ? '<span style="font-size:10px;padding:2px 8px;border-radius:20px;background:var(--accent-dim);color:var(--accent);font-weight:600">PYQ</span>' : ''}
        </div>
      </div>
    </div>`;
  }

  function subjectSection(subjKey) {
    const p = pfx();
    const DB = window.DB;
    const info = SUBJECTS[subjKey];
    const chapters = (DB.chapters || {})[subjKey] || [];
    let filtered = chapters;
    if (_chSearch.trim()) {
      const q = _chSearch.trim().toLowerCase();
      filtered = filtered.filter(c => (c.name || '').toLowerCase().includes(q));
    }
    const done = filtered.filter(c => c.completed).length;
    const total = filtered.length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;

    return `<div class="${p}-section-block anim-entrance">
      <div class="${p}-section-title" style="cursor:pointer;display:flex;align-items:center;gap:8px" onclick="this.parentElement.classList.toggle('open')">
        ${info.icon} ${info.label}
        <span style="font-size:11px;color:var(--muted);margin-left:auto">${done}/${total} (${pct}%)</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="transition:transform 0.2s"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      <div class="${p}-progress-wrap" style="height:4px;margin-bottom:12px"><div class="${p}-progress-bar" style="height:4px;width:${pct}%"></div></div>
      <div style="display:flex;flex-direction:column;gap:4px">
        ${filtered.length === 0 ? `<div class="${p}-empty" style="padding:16px"><div class="${p}-empty-sub">${_chSearch ? 'No chapters match your search' : 'No chapters yet'}</div></div>` : filtered.map((c, i) => chapterRow(c, subjKey, i)).join('')}
      </div>
    </div>`;
  }

  function chaptersResultsHTML() {
    return ['physics', 'chemistry', 'maths'].map(function(s) { return subjectSection(s); }).join('');
  }

  window.renderChapters = function(el) {
    const p = pfx();
    const DB = window.DB;
    if (!DB) { el.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-muted)">Loading data...</div>'; return; }
    const allCh = [...(DB.chapters?.physics || []), ...(DB.chapters?.chemistry || []), ...(DB.chapters?.maths || [])];
    const done = allCh.filter(c => c.completed).length;
    const total = allCh.length;

    el.innerHTML = `
    <div class="${p}-page-header anim-entrance" style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px">
      <div>
        <div class="${p}-page-title" data-text="Chapters">Chapters</div>
        <div class="${p}-page-sub">Syllabus mastery & tracking</div>
      </div>
      <button class="${p}-btn ${p}-btn-primary" onclick="window.openAddCh()">+ Add Chapter</button>
    </div>
    <input class="${p}-input anim-entrance" id="ch-search-input" type="text" placeholder="Search chapters..." oninput="window._chSearchFn(this.value)" style="font-size:13px;margin-bottom:16px" value="${esc(_chSearch)}" autocomplete="off">
    <div class="${p}-stats-grid anim-entrance" style="--delay:0.1s">
      <div class="${p}-stat-card">
        <div class="${p}-stat-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></div>
        <div class="${p}-stat-val"><span data-count="${done}">0</span>/<span data-count="${total}">0</span></div>
        <div class="${p}-stat-label">Completed</div>
        <div class="${p}-stat-sub">${total > 0 ? Math.round((done / total) * 100) : 0}% of syllabus</div>
      </div>
    </div>
    <div id="ch-results">${chaptersResultsHTML()}</div>`;
  };

  function _updateChResults() {
    var container = document.getElementById('ch-results');
    if (!container) return;
    container.innerHTML = chaptersResultsHTML();
  }

  /* CRUD */
  window.openAddCh = function() {
    var subjEl = document.getElementById('addch-subj');
    var nameEl = document.getElementById('addch-name');
    if (subjEl) subjEl.value = 'physics';
    if (nameEl) nameEl.value = '';
    if (window.om) window.om('m-add-ch');
    setTimeout(function() { if (nameEl) nameEl.focus(); }, 320);
  };

  window.openEditCh = function(subj, id) {
    var DB = window.DB;
    if (!DB || !DB.chapters || !DB.chapters[subj]) return;
    var ch = DB.chapters[subj].find(c => c.id === id);
    if (!ch) return;
    var subjEl = document.getElementById('editch-subj');
    var idEl = document.getElementById('editch-id');
    var nameEl = document.getElementById('editch-name');
    if (subjEl) subjEl.value = subj;
    if (idEl) idEl.value = id;
    if (nameEl) nameEl.value = ch.name;
    if (window.om) window.om('m-edit-ch');
    setTimeout(function() { if (nameEl) nameEl.focus(); }, 320);
  };

  window.toggleChDone = function(subj, id) {
    var DB = window.DB;
    if (!DB || !DB.chapters || !DB.chapters[subj]) return;
    var ch = DB.chapters[subj].find(c => c.id === id);
    if (!ch) return;
    ch.completed = !ch.completed;
    ch.completedAt = ch.completed ? new Date().toISOString() : null;
    if (window.sv) window.sv('chapters');
    window.renderChapters(document.getElementById('content-wrap'));
    if (window.animateAllEntrance) window.animateAllEntrance(document.getElementById('content-wrap'));
  };

  window.setMF = function(subj, id) {
    var DB = window.DB;
    if (!DB || !DB.chapters || !DB.chapters[subj]) return;
    var ch = DB.chapters[subj].find(c => c.id === id);
    if (!ch) return;
    var idx = STRENGTH.indexOf(ch.strength || 'none');
    ch.strength = STRENGTH[(idx + 1) % STRENGTH.length];
    if (window.sv) window.sv('chapters');
    window.renderChapters(document.getElementById('content-wrap'));
    if (window.animateAllEntrance) window.animateAllEntrance(document.getElementById('content-wrap'));
  };

  window.togglePyq = function(subj, id) {
    var DB = window.DB;
    if (!DB || !DB.chapters || !DB.chapters[subj]) return;
    var ch = DB.chapters[subj].find(c => c.id === id);
    if (!ch) return;
    ch.pyq = !ch.pyq;
    if (window.sv) window.sv('chapters');
    window.renderChapters(document.getElementById('content-wrap'));
    if (window.animateAllEntrance) window.animateAllEntrance(document.getElementById('content-wrap'));
  };

  window._chSearchFn = function(val) {
    _chSearch = val || '';
    _updateChResults();
    var input = document.getElementById('ch-search-input');
    if (input && document.activeElement !== input) input.focus();
  };
})();
