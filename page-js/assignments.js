// page-js/assignments.js — Assignments page (Nexus & Bloom)
(function() {
  function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
  function fmtDate(d) { return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }); }
  function safePct(a, b) { return b > 0 ? Math.round((a / b) * 100) : 0; }

  const PRIORITY = {
    high:   { label: 'High',   color: 'var(--danger)',  bg: 'var(--red-dim)' },
    medium: { label: 'Medium', color: 'var(--accent)',  bg: 'var(--accent-dim)' },
    low:    { label: 'Low',    color: 'var(--success)', bg: 'rgba(34,197,94,0.1)' }
  };

  let _asnSearch = '';

  function assignmentCard(a, index) {
    const pr = PRIORITY[a.priority] || { label: '', color: 'var(--muted)', bg: 'transparent' };
    const daysLeft = a.dueDate ? Math.ceil((new Date(a.dueDate) - new Date()) / 86400000) : null;
    const dueLabel = a.completed ? 'Completed' : daysLeft === null ? '' : daysLeft < 0 ? 'Overdue by ' + Math.abs(daysLeft) + 'd' : daysLeft === 0 ? 'Due today' : 'Due in ' + daysLeft + 'd';
    const dueColor = a.completed ? 'var(--success)' : daysLeft !== null && daysLeft < 0 ? 'var(--danger)' : daysLeft !== null && daysLeft <= 1 ? 'var(--accent)' : 'var(--muted)';
    const atts = a.attachments || [];
    const answerKey = a.answerKey || [];

    return `<div class="card anim-entrance" style="--delay:${index * 0.04}s;padding:0;overflow:hidden" data-tutorial-id="assignment-item">
      <div style="display:flex;align-items:stretch">
        <div style="width:4px;background:${pr.color};flex-shrink:0;border-radius:4px 0 0 4px"></div>
        <div style="flex:1;padding:16px 18px">
          <div style="display:flex;align-items:flex-start;gap:12px">
            <div class="chapter-check ${a.completed ? 'done' : ''}" style="margin-top:2px;cursor:pointer" onclick="event.stopPropagation();window.toggleAsnDone('${a.id}')">
              ${a.completed ? '<svg width="11" height="11" viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/></svg>' : ''}
            </div>
            <div style="flex:1;min-width:0">
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:4px">
                <div style="font-size:14px;font-weight:600;${a.completed ? 'text-decoration:line-through;opacity:0.5' : ''}">${esc(a.title)}</div>
                ${a.priority && a.priority !== 'none' ? `<span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px;background:${pr.bg};color:${pr.color}">${pr.label}</span>` : ''}
              </div>
              ${a.description ? `<div style="font-size:12px;color:var(--muted);line-height:1.5;margin-bottom:8px">${esc(a.description)}</div>` : ''}
              ${a.syllabus ? `<div style="font-size:11px;color:var(--text-muted);margin-bottom:8px;padding:6px 10px;background:var(--border-card);border-radius:8px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> ${esc(a.syllabus)}</div>` : ''}
              ${atts.length ? '<div class="att-grid">' + atts.map((d, fi) => { var fid = window._fcache(d.data || d.url || '', d.name); var isPdf = (d.type || '').includes('pdf') || (d.name || '').toLowerCase().endsWith('.pdf'); return '<div class="att-chip" onclick="pvFile(_fget(\'' + fid + '\'),\'' + (d.name || 'File').replace(/'/g, "\\'") + '\')"><span class="att-icon">' + (isPdf ? '&#128196;' : '&#128444;') + '</span><span class="att-name">' + esc(d.name || 'File ' + (fi + 1)) + '</span></div>'; }).join('') + '</div>' : ''}
              ${answerKey.length ? '<div style="font-size:10px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin:8px 0 4px">Answer Key</div><div class="att-grid">' + answerKey.map((d, fi) => { var fid = window._fcache(d.data || d.url || '', d.name); var isPdf = (d.type || '').includes('pdf') || (d.name || '').toLowerCase().endsWith('.pdf'); return '<div class="att-chip" onclick="pvFile(_fget(\'' + fid + '\'),\'' + (d.name || 'Answer Key').replace(/'/g, "\\'") + '\')"><span class="att-icon">' + (isPdf ? '&#9989;' : '&#128444;') + '</span><span class="att-name">' + esc(d.name || 'Answer Key ' + (fi + 1)) + '</span></div>'; }).join('') + '</div>' : ''}
              <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
                ${dueLabel ? `<div style="font-size:11px;color:${dueColor};display:flex;align-items:center;gap:4px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>${dueLabel}</div>` : '<div></div>'}
                <div style="display:flex;gap:6px">
                  <button class="btn-ghost" style="font-size:10px;padding:4px 10px;color:var(--primary)" onclick="event.stopPropagation();window.editAsn('${a.id}')">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit
                  </button>
                  <button class="btn-ghost" style="font-size:10px;padding:4px 10px;color:var(--danger)" onclick="event.stopPropagation();window.delAsn('${a.id}')">
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
    return `<div class="empty" style="padding:48px 0">
      <div class="empty-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
      <div class="empty-title">No assignments yet</div>
      <div class="empty-sub">Tap the + button to create your first assignment</div>
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
    var pending = all.filter(function(a) { return !a.completed; });
    var done = all.filter(function(a) { return a.completed; });
    if (all.length === 0 && !_asnSearch) return emptyState();
    return `<div class="section-block" style="--delay:0.2s">
      <div class="section-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Pending (${pending.length})</div>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${pending.length === 0 ? `<div class="empty" style="padding:20px"><div class="empty-sub">${_asnSearch ? 'No pending assignments match your search' : 'All caught up!'}</div></div>` : pending.map(function(a, i) { return assignmentCard(a, i); }).join('')}
      </div>
    </div>
    <div class="section-block" style="--delay:0.3s">
      <div class="section-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Completed (${done.length})</div>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${done.length === 0 ? `<div class="empty" style="padding:20px"><div class="empty-sub">No completed assignments yet</div></div>` : done.map(function(a, i) { return assignmentCard(a, i); }).join('')}
      </div>
    </div>`;
  }

  window.renderAssignments = function(el) {
    if (!el) return;
    const DB = window.DB;
    if (!DB) { el.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-muted)">Loading data...</div>'; return; }
    var all = getFilteredAssignments();
    var totalAll = (DB.assignments || []).length;
    var pending = all.filter(function(a) { return !a.completed; });
    var done = all.filter(function(a) { return a.completed; });
    var overdue = pending.filter(function(a) { return a.dueDate && new Date(a.dueDate) < new Date(); });

    el.innerHTML = `
    <div style="display:flex;gap:8px;margin-bottom:16px;align-items:center;flex-wrap:wrap">
      <div class="search-wrap anim-entrance" style="flex:1;min-width:200px">
        <input class="search-input" id="asn-search-input" type="text" placeholder="Search assignments..." oninput="window._asnSearchFn(this.value)" value="${esc(_asnSearch)}" autocomplete="off"/>
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <button class="search-clear" onclick="this.previousElementSibling.previousElementSibling.value='';window._asnSearchFn('')">&#10005;</button>
      </div>
      <button class="btn btn-primary btn-sm anim-entrance" onclick="window.openAddAssign()" style="--delay:0.05s">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Task
      </button>
    </div>
    <div class="stats-grid anim-entrance" style="--delay:0.1s">
      <div class="stat-card">
        <div class="stat-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
        <div class="stat-val"><span data-count="${pending.length}">0</span></div>
        <div class="stat-label">Pending</div>
        <div class="stat-sub">${_asnSearch ? 'Filtered' : 'Active tasks'}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="color:var(--danger)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
        <div class="stat-val" style="color:var(--danger)"><span data-count="${overdue.length}">0</span></div>
        <div class="stat-label">Overdue</div>
        <div class="stat-sub">Need attention</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="color:var(--success)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
        <div class="stat-val" style="color:var(--success)"><span data-count="${done.length}">0</span></div>
        <div class="stat-label">Completed</div>
        <div class="stat-sub">${all.length > 0 ? safePct(done.length, all.length) : 0}% done</div>
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
    window.pendingAAnswerKey = [];
    window.aPriority = 'none';
    if (window.setAP) window.setAP('none');
    ['a-title', 'a-desc', 'a-syl', 'a-due'].forEach(function(id) { var el = document.getElementById(id); if (el) el.value = ''; });
    var fl = document.getElementById('a-file-list'); if (fl) fl.innerHTML = '';
    var akFl = document.getElementById('a-ak-file-list'); if (akFl) akFl.innerHTML = '';
    if (window.setupDZ) window.setupDZ('a-dz', 'a-finp', window.handleAFiles);
    if (window.setupDZ) window.setupDZ('a-ak-dz', 'a-ak-finp', window.handleAAnswerKey);
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
    if (window._refreshPage) window._refreshPage();
    if (window.toast) window.toast(a.completed ? 'Marked complete' : 'Marked incomplete');
  };

  window.delAsn = function(id) {
    var DB = window.DB;
    if (!DB || !DB.assignments) return;
    if (window.cfm2) {
      window.cfm2('Delete Assignment', 'Are you sure you want to delete this assignment?', function() {
        DB.assignments = DB.assignments.filter(a => a.id !== id);
        if (window.sv) window.sv('assignments');
        if (window._refreshPage) window._refreshPage();
        if (window.toast) window.toast('Assignment deleted');
      });
    } else {
      DB.assignments = DB.assignments.filter(a => a.id !== id);
      if (window.sv) window.sv('assignments');
      if (window._refreshPage) window._refreshPage();
    }
  };

  window.editAsn = function(id) {
    var DB = window.DB;
    if (!DB || !DB.assignments) return;
    var a = DB.assignments.find(x => x.id === id);
    if (!a) return;
    window._editingAsnId = id;
    window.pendingAFiles = [];
    window.pendingAAnswerKey = [];
    var titleEl = document.getElementById('a-title');
    if (titleEl) titleEl.value = a.title || '';
    var descEl = document.getElementById('a-desc');
    if (descEl) descEl.value = a.description || '';
    var sylEl = document.getElementById('a-syl');
    if (sylEl) sylEl.value = a.syllabus || '';
    var dueEl = document.getElementById('a-due');
    if (dueEl) dueEl.value = a.dueDate ? new Date(a.dueDate).toISOString().split('T')[0] : '';
    if (window.setAP) window.setAP(a.priority || 'none');
    var fl = document.getElementById('a-file-list'); if (fl) fl.innerHTML = '';
    var akFl = document.getElementById('a-ak-file-list'); if (akFl) akFl.innerHTML = '';
    if (a.attachments && a.attachments.length) {
      window.pendingAFiles = a.attachments.slice();
      if (fl) {
        fl.innerHTML = a.attachments.map(function(d,i){var fid=window._fcache(d.data||d.url||'',d.name);var isPdf=(d.type||'').includes('pdf')||(d.name||'').toLowerCase().endsWith('.pdf');return '<div class="upload-preview-item"><div class="upload-preview-thumb" onclick="pvFile(_fget(\''+fid+'\'),\''+(d.name||'').replace(/'/g,"\\'")+'\')">'+(isPdf?'<div class="pdf-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>PDF</div>':'<img src="'+(d.data||'')+'" alt=""/>')+'</div><div class="upload-preview-info"><div class="upload-preview-name">'+esc(d.name||'File')+'</div><div class="upload-preview-size">'+window.fmtSz(d.size)+'</div></div><button class="upload-preview-remove" onclick="event.stopPropagation();window.pendingAFiles.splice('+i+',1);window.refreshAFileList()">&#10005;</button></div>';
      }).join('');
      }
    }
    if (a.answerKey && a.answerKey.length) {
      window.pendingAAnswerKey = a.answerKey.slice();
      if (akFl) {
        akFl.innerHTML = a.answerKey.map(function(d,i){var fid=window._fcache(d.data||d.url||'',d.name);var isPdf=(d.type||'').includes('pdf')||(d.name||'').toLowerCase().endsWith('.pdf');return '<div class="upload-preview-item"><div class="upload-preview-thumb" onclick="pvFile(_fget(\''+fid+'\'),\''+(d.name||'').replace(/'/g,"\\'")+'\')">'+(isPdf?'<div class="pdf-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>PDF</div>':'<img src="'+(d.data||'')+'" alt=""/>')+'</div><div class="upload-preview-info"><div class="upload-preview-name">'+esc(d.name||'File')+'</div><div class="upload-preview-size">'+window.fmtSz(d.size)+'</div></div><button class="upload-preview-remove" onclick="this.closest(\'.upload-preview-item\').remove()">&#10005;</button></div>';
      }).join('');
      }
    }
    var mdTitle = document.querySelector('#m-asgn .md-title');
    if (mdTitle) mdTitle.textContent = 'Edit Assignment';
    var saveBtn = document.querySelector('#m-asgn .md-foot .btn-primary');
    if (saveBtn) saveBtn.textContent = 'Save Changes';
    if (window.setupDZ) window.setupDZ('a-dz','a-finp',window.handleAFiles);
    if (window.setupDZ) window.setupDZ('a-ak-dz','a-ak-finp',window.handleAAnswerKey);
    if (window.om) window.om('m-asgn');
  };

  window.handleAAnswerKey = function(files) {
    if (!files || !files.length) return;
    window.pendingAAnswerKey = window.pendingAAnswerKey || [];
    var list = document.getElementById('a-ak-file-list');
    window.rdFiles(files, function(obj) {
      if (!obj) return;
      window.pendingAAnswerKey.push(obj);
      if (list) {
        var fid = window._fcache(obj.data || '', obj.name);
        var isPdf = (obj.type || '').includes('pdf') || (obj.name || '').toLowerCase().endsWith('.pdf');
        var div = document.createElement('div');
        div.className = 'upload-preview-item';
        div.innerHTML = '<div class="upload-preview-thumb" onclick="pvFile(_fget(\'' + fid + '\'),\'' + (obj.name || '').replace(/'/g, "\\'") + '\')">' + (isPdf ? '<div class="pdf-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>PDF</div>' : '<img src="' + (obj.data || '') + '" alt=""/>') + '</div><div class="upload-preview-info"><div class="upload-preview-name">' + esc(obj.name || 'File') + '</div><div class="upload-preview-size">' + window.fmtSz(obj.size) + '</div></div><button class="upload-preview-remove" onclick="this.closest(\'.upload-preview-item\').remove()">&#10005;</button>';
        list.appendChild(div);
      }
    });
  };

  window._asnSearchFn = function(val) {
    _asnSearch = val || '';
    _updateAsnResults();
  };
})();
