// page-js/assignments.js — Assignments page (Nexus & Bloom)
(function() {
  function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
  function fmtDate(d) { return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }); }
  function safePct(a, b) { return b > 0 ? Math.round((a / b) * 100) : 0; }
  function getTheme() { return document.documentElement.getAttribute('data-theme') || 'nexus'; }
  function pfx() { return getTheme() === 'nexus' ? 'nx' : 'bl'; }

  const PRIORITY = {
    high:   { label: 'High',   color: 'var(--danger)',  bg: 'var(--red-dim)' },
    medium: { label: 'Medium', color: 'var(--accent)',  bg: 'var(--accent-dim)' },
    low:    { label: 'Low',    color: 'var(--success)', bg: 'rgba(34,197,94,0.1)' }
  };

  let _asnSearch = '';

  function assignmentCard(a, index) {
    const p = pfx();
    const pr = PRIORITY[a.priority] || { label: '', color: 'var(--muted)', bg: 'transparent' };
    const daysLeft = a.dueDate ? Math.ceil((new Date(a.dueDate) - new Date()) / 86400000) : null;
    const dueLabel = a.completed ? 'Completed' : daysLeft === null ? '' : daysLeft < 0 ? 'Overdue by ' + Math.abs(daysLeft) + 'd' : daysLeft === 0 ? 'Due today' : 'Due in ' + daysLeft + 'd';
    const dueColor = a.completed ? 'var(--success)' : daysLeft !== null && daysLeft < 0 ? 'var(--danger)' : daysLeft !== null && daysLeft <= 1 ? 'var(--accent)' : 'var(--muted)';
    const atts = a.attachments || [];

    return `<div class="${p}-card anim-entrance" style="--delay:${index * 0.04}s;padding:0;overflow:hidden">
      <div style="display:flex;align-items:stretch">
        <div style="width:4px;background:${pr.color};flex-shrink:0;border-radius:4px 0 0 4px"></div>
        <div style="flex:1;padding:16px 18px">
          <div style="display:flex;align-items:flex-start;gap:12px">
            <div class="${p}-chapter-check ${a.completed ? 'done' : ''}" style="margin-top:2px;cursor:pointer" onclick="event.stopPropagation();window.toggleAsnDone('${a.id}')">
              ${a.completed ? '<svg width="11" height="11" viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/></svg>' : ''}
            </div>
            <div style="flex:1;min-width:0">
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:4px">
                <div style="font-size:14px;font-weight:600;${a.completed ? 'text-decoration:line-through;opacity:0.5' : ''}">${esc(a.title)}</div>
                ${a.priority && a.priority !== 'none' ? `<span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px;background:${pr.bg};color:${pr.color}">${pr.label}</span>` : ''}
              </div>
              ${a.description ? `<div style="font-size:12px;color:var(--muted);line-height:1.5;margin-bottom:8px">${esc(a.description)}</div>` : ''}
              ${a.syllabus ? `<div style="font-size:11px;color:var(--text-muted);margin-bottom:8px;padding:6px 10px;background:var(--border-card);border-radius:8px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> ${esc(a.syllabus)}</div>` : ''}
              ${atts.length ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px">${atts.map((d, fi) => `<span style="font-size:10px;padding:2px 8px;border-radius:4px;background:var(--border-card);color:var(--text-muted);cursor:pointer" onclick="window.pvFile('${esc(d.data || '')}','${esc(d.name || 'Attachment')}')">${esc(d.name || 'File ' + (fi + 1))}</span>`).join('')}</div>` : ''}
              <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
                ${dueLabel ? `<div style="font-size:11px;color:${dueColor};display:flex;align-items:center;gap:4px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>${dueLabel}</div>` : '<div></div>'}
                <div style="display:flex;gap:6px">
                  <button class="${p}-btn-ghost" style="font-size:10px;padding:4px 10px;color:var(--danger)" onclick="event.stopPropagation();window.delAsn('${a.id}')">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }

  function emptyState() {
    const p = pfx();
    return `<div class="${p}-empty" style="padding:48px 0">
      <div class="${p}-empty-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
      <div class="${p}-empty-title">No assignments yet</div>
      <div class="${p}-empty-sub">Tap the + button to create your first assignment</div>
    </div>`;
  }

  function getFilteredAssignments() {
    var DB = window.DB;
    var all = (DB && DB.assignments) || [];
    if (_asnSearch.trim()) {
      var q = _asnSearch.trim().toLowerCase();
      all = all.filter(function(a) { return (a.title || '').toLowerCase().includes(q) || (a.description || '').toLowerCase().includes(q) || (a.syllabus || '').toLowerCase().includes(q); });
    }
    return all;
  }

  function assignmentsResultsHTML(all) {
    const p = pfx();
    var pending = all.filter(function(a) { return !a.completed; });
    var done = all.filter(function(a) { return a.completed; });
    if (all.length === 0 && !_asnSearch) return emptyState();
    return `<div class="${p}-section-block" style="--delay:0.2s">
      <div class="${p}-section-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Pending (${pending.length})</div>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${pending.length === 0 ? `<div class="${p}-empty" style="padding:20px"><div class="${p}-empty-sub">${_asnSearch ? 'No pending assignments match your search' : 'All caught up!'}</div></div>` : pending.map(function(a, i) { return assignmentCard(a, i); }).join('')}
      </div>
    </div>
    <div class="${p}-section-block" style="--delay:0.3s">
      <div class="${p}-section-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Completed (${done.length})</div>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${done.length === 0 ? `<div class="${p}-empty" style="padding:20px"><div class="${p}-empty-sub">No completed assignments yet</div></div>` : done.map(function(a, i) { return assignmentCard(a, i); }).join('')}
      </div>
    </div>`;
  }

  window.renderAssignments = function(el) {
    if (!el) return;
    const p = pfx();
    const DB = window.DB;
    if (!DB) { el.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-muted)">Loading data...</div>'; return; }
    var all = getFilteredAssignments();
    var totalAll = (DB.assignments || []).length;
    var pending = all.filter(function(a) { return !a.completed; });
    var done = all.filter(function(a) { return a.completed; });
    var overdue = pending.filter(function(a) { return a.dueDate && new Date(a.dueDate) < new Date(); });

    el.innerHTML = `
    <div class="${p}-page-header anim-entrance" style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px">
      <div>
        <div class="${p}-page-title" data-text="Assignments">Assignments</div>
        <div class="${p}-page-sub">Tasks and study materials</div>
      </div>
      <button class="${p}-btn ${p}-btn-primary" onclick="window.openAddAssign()">+ Add Task</button>
    </div>
    <input class="${p}-input anim-entrance" id="asn-search-input" type="text" placeholder="Search assignments..." oninput="window._asnSearchFn(this.value)" style="font-size:13px;margin-bottom:16px" value="${esc(_asnSearch)}" autocomplete="off">
    <div class="${p}-stats-grid anim-entrance" style="--delay:0.1s">
      <div class="${p}-stat-card">
        <div class="${p}-stat-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
        <div class="${p}-stat-val"><span data-count="${pending.length}">0</span></div>
        <div class="${p}-stat-label">Pending</div>
        <div class="${p}-stat-sub">${_asnSearch ? 'Filtered' : 'Active tasks'}</div>
      </div>
      <div class="${p}-stat-card">
        <div class="${p}-stat-icon" style="color:var(--danger)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
        <div class="${p}-stat-val" style="color:var(--danger)"><span data-count="${overdue.length}">0</span></div>
        <div class="${p}-stat-label">Overdue</div>
        <div class="${p}-stat-sub">Need attention</div>
      </div>
      <div class="${p}-stat-card">
        <div class="${p}-stat-icon" style="color:var(--success)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
        <div class="${p}-stat-val" style="color:var(--success)"><span data-count="${done.length}">0</span></div>
        <div class="${p}-stat-label">Completed</div>
        <div class="${p}-stat-sub">${all.length > 0 ? safePct(done.length, all.length) : 0}% done</div>
      </div>
    </div>
    <div id="asn-results">${assignmentsResultsHTML(all)}</div>`;
  };

  function _updateAsnResults() {
    var container = document.getElementById('asn-results');
    if (!container) return;
    var all = getFilteredAssignments();
    container.innerHTML = assignmentsResultsHTML(all);
    container.querySelectorAll('.anim-entrance, .anim-up').forEach(function(e) { e.classList.add('visible'); e.style.opacity = '1'; e.style.transform = 'none'; });
  }

  /* CRUD FUNCTIONS */
  window.openAddAssign = function() {
    window.pendingAFiles = [];
    window.aPriority = 'none';
    if (window.setAP) window.setAP('none');
    ['a-title', 'a-desc', 'a-syl'].forEach(function(id) { var el = document.getElementById(id); if (el) el.value = ''; });
    var fl = document.getElementById('a-file-list'); if (fl) fl.innerHTML = '';
    var sw = document.getElementById('a-syl-wrap'); if (sw) sw.style.display = 'none';
    if (window.setupDZ) window.setupDZ('a-dz', 'a-finp', window.handleAFiles);
    if (window.om) window.om('m-asgn');
    setTimeout(function() { var t = document.getElementById('a-title'); if (t) t.focus(); }, 320);
  };

  window.toggleAsnDone = function(id) {
    var DB = window.DB;
    if (!DB || !DB.assignments) return;
    var a = DB.assignments.find(x => x.id === id);
    if (!a) return;
    a.completed = !a.completed;
    a.completedAt = a.completed ? new Date().toISOString() : null;
    if (window.sv) window.sv('assignments');
    window.renderAssignments(document.getElementById('content-wrap'));
    if (window.animateAllEntrance) window.animateAllEntrance(document.getElementById('content-wrap'));
    if (window.toast) window.toast(a.completed ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Marked complete' : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> Marked incomplete');
  };

  window.delAsn = function(id) {
    var DB = window.DB;
    if (!DB || !DB.assignments) return;
    if (window.cfm2) {
      window.cfm2('Delete Assignment', 'Are you sure you want to delete this assignment?', function() {
        DB.assignments = DB.assignments.filter(a => a.id !== id);
        if (window.sv) window.sv('assignments');
        window.renderAssignments(document.getElementById('content-wrap'));
        if (window.animateAllEntrance) window.animateAllEntrance(document.getElementById('content-wrap'));
        if (window.toast) window.toast('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Assignment deleted');
      });
    } else {
      DB.assignments = DB.assignments.filter(a => a.id !== id);
      if (window.sv) window.sv('assignments');
      window.renderAssignments(document.getElementById('content-wrap'));
      if (window.animateAllEntrance) window.animateAllEntrance(document.getElementById('content-wrap'));
    }
  };

  window._asnSearchFn = function(val) {
    _asnSearch = val || '';
    _updateAsnResults();
  };
})();
