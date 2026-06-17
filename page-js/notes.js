// page-js/notes.js — Notes page (Nexus & Bloom)
(function() {
  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML.replace(/'/g, '&#39;'); }
  function getTheme() { return document.documentElement.getAttribute('data-theme') || 'nexus'; }
  function pfx() { return getTheme() === 'nexus' ? 'nx' : 'bl'; }

  const SUBJECTS = {
    physics: { label: 'Physics', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>' },
    chemistry: { label: 'Chemistry', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6v11l4 5H5l4-5V3z"/><line x1="9" y1="3" x2="15" y2="3"/></svg>' },
    maths: { label: 'Mathematics', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20L20 4"/><path d="M15 4h5v5"/><path d="M4 20l5-5"/></svg>' }
  };

  function _anim() {
    var el = document.getElementById('content-wrap');
    if (el && typeof window.animateAllEntrance === 'function') window.animateAllEntrance(el);
    if (el && typeof window.animateAllCounters === 'function') window.animateAllCounters(el);
  }

  function refreshNoteFileList() {
    var subj = window._openNotesSubj;
    var chId = window._openNotesChId;
    if (!subj || !chId) return;
    var DB = window.DB;
    if (!DB) return;
    var p = pfx();
    var key = subj + '_' + chId;
    var noteData = (DB.notes || {})[key] || { type: 'detailed', files: [] };
    var pending = window._pendingNoteFiles || [];
    var allFiles = (noteData.files || []).concat(pending);
    var listEl = document.getElementById('n-file-list');
    if (!listEl) return;
    if (allFiles.length === 0) {
      listEl.innerHTML = '<div style="font-size:12px;color:var(--muted);text-align:center;padding:16px">No files attached</div>';
      return;
    }
    var savedCount = (noteData.files || []).length;
    listEl.innerHTML = allFiles.map(function(f, i) {
      var isPdf = (f.name || '').toLowerCase().endsWith('.pdf');
      var icon = isPdf ? '📄' : '🖼️';
      var isPending = i >= savedCount;
      return '<div class="' + p + '-list-item" style="padding:8px 12px;margin-bottom:4px;cursor:pointer" onclick="window.pvFile(\'' + (f.data || f.url || '') + '\',\'' + esc(f.name || 'File') + '\')">'
        + '<div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0">'
        + '<div style="font-size:14px">' + icon + '</div>'
        + '<div style="flex:1;min-width:0;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(f.name || 'File ' + (i + 1)) + '</div>'
        + (isPending ? '<span style="font-size:9px;padding:1px 6px;border-radius:8px;background:var(--accent-dim);color:var(--accent)">new</span>' : '')
        + '</div>'
        + '<button class="' + p + '-btn-ghost" style="font-size:10px;padding:2px 6px;color:var(--danger);flex-shrink:0" onclick="event.stopPropagation();window._removeNoteFile(' + i + ')">✕</button>'
        + '</div>';
    }).join('');
  }
  window.refreshNoteFileList = refreshNoteFileList;

  window._removeNoteFile = function(index) {
    var subj = window._openNotesSubj;
    var chId = window._openNotesChId;
    if (!subj || !chId) return;
    var DB = window.DB;
    if (!DB) return;
    var key = subj + '_' + chId;
    var noteData = (DB.notes || {})[key] || { type: 'detailed', files: [] };
    var pending = window._pendingNoteFiles || [];
    var savedCount = (noteData.files || []).length;
    if (index < savedCount) {
      noteData.files.splice(index, 1);
      DB.notes[key] = noteData;
      if (window.sv) window.sv('notes');
    } else {
      pending.splice(index - savedCount, 1);
      window._pendingNoteFiles = pending;
    }
    refreshNoteFileList();
  };

  function openNotes(subj, chId) {
    var DB = window.DB;
    if (!DB || !DB.chapters || !DB.chapters[subj]) return;
    var ch = DB.chapters[subj].find(function(c) { return c.id === chId; });
    if (!ch) return;
    window._pendingNoteFiles = [];
    var notes = DB.notes || {};
    var noteData = notes[subj + '_' + chId] || { type: 'detailed', files: [] };
    window._currentNoteType = noteData.type || 'detailed';
    var el = document.getElementById('m-notes');
    if (!el) return;
    var p = pfx();
    var body = el.querySelector('.md-body');
    if (!body) return;
    body.innerHTML = ''
      + '<div style="margin-bottom:12px">'
      + '<div style="font-size:14px;font-weight:600;margin-bottom:4px">' + esc(ch.name) + '</div>'
      + '<div style="font-size:11px;color:var(--muted)">' + SUBJECTS[subj].label + '</div>'
      + '</div>'
      + '<div style="display:flex;gap:8px;margin-bottom:16px">'
      + '<button class="' + p + '-btn ' + (noteData.type === 'detailed' ? p + '-btn-primary' : p + '-btn-ghost') + '" onclick="window.setNoteType(\'detailed\')" id="note-type-det" style="flex:1">Detailed Notes</button>'
      + '<button class="' + p + '-btn ' + (noteData.type === 'revision' ? p + '-btn-primary' : p + '-btn-ghost') + '" onclick="window.setNoteType(\'revision\')" id="note-type-rev" style="flex:1">Revision Sheet</button>'
      + '</div>'
      + '<div class="' + p + '-card" id="n-dz" style="padding:16px;border:2px dashed var(--border);text-align:center;cursor:pointer;margin-bottom:12px">'
      + '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5" style="margin-bottom:8px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>'
      + '<div style="font-size:12px;font-weight:600;color:var(--text)">Drop files here or click to upload</div>'
      + '<div style="font-size:10px;color:var(--muted)">PDF, images, documents · max 5MB</div>'
      + '<input type="file" id="n-finp" multiple accept=".pdf,image/*" style="display:none"/>'
      + '</div>'
      + '<div id="n-file-list" style="margin-bottom:12px"></div>';

    var fi = document.getElementById('n-finp');
    var dz = document.getElementById('n-dz');
    if (fi) {
      fi.onchange = function() { if (window.handleNoteFiles) window.handleNoteFiles(this.files); };
      if (dz) dz.onclick = function(e) { if (e.target === fi) return; fi.click(); };
    }
    if (dz && fi && window.setupDZ) window.setupDZ('n-dz', 'n-finp', window.handleNoteFiles);

    refreshNoteFileList();
    window.om('m-notes');
    window._openNotesSubj = subj;
    window._openNotesChId = chId;
  }

  window._saveNoteFiles = function() {
    var subj = window._openNotesSubj;
    var chId = window._openNotesChId;
    if (!subj || !chId) return;
    var DB = window.DB;
    if (!DB) return;
    if (!DB.notes) DB.notes = {};
    var key = subj + '_' + chId;
    var noteData = DB.notes[key] || { type: window._currentNoteType || 'detailed', files: [] };
    noteData.type = window._currentNoteType || noteData.type || 'detailed';
    var pending = window._pendingNoteFiles || [];
    if (pending.length > 0) {
      noteData.files = (noteData.files || []).concat(pending);
      DB.notes[key] = noteData;
      if (window.sv) window.sv('notes');
    } else {
      DB.notes[key] = noteData;
      if (window.sv) window.sv('notes');
    }
    window._pendingNoteFiles = [];
  };

  window.renderNotes = function(el) {
    const p = pfx();
    const DB = window.DB;
    if (!DB) { el.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-muted)">Loading data...</div>'; return; }
    const notes = DB.notes || {};
    const allSubjects = ['physics', 'chemistry', 'maths'];

    el.innerHTML = `
    <div class="${p}-page-header anim-entrance">
      <div class="${p}-page-title" data-text="Notes">Notes</div>
      <div class="${p}-page-sub">Chapter-wise notes & resources</div>
    </div>
    ${allSubjects.map(subjKey => {
      const info = SUBJECTS[subjKey];
      const chapters = (DB.chapters || {})[subjKey] || [];
      if (chapters.length === 0) return '';
      return `<div class="${p}-section-block anim-entrance">
        <div class="${p}-section-title">${info.icon} ${info.label}</div>
        <div style="display:flex;flex-direction:column;gap:4px">
          ${chapters.map((ch, i) => {
            const noteKey = subjKey + '_' + ch.id;
            const noteData = notes[noteKey] || {};
            const hasFiles = (noteData.files || []).length > 0;
            const noteType = noteData.type || 'detailed';
            return `<div class="${p}-list-item anim-entrance" style="--delay:${i * 0.02}s;cursor:pointer" onclick="window._openNotes('${subjKey}','${ch.id}')">
              <div style="width:28px;height:28px;border-radius:6px;background:var(--border-card);display:flex;align-items:center;justify-content:center;flex-shrink:0">
                ${hasFiles ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'}
              </div>
              <div style="flex:1;min-width:0">
                <div class="${p}-list-title">${esc(ch.name)}</div>
                <div style="font-size:10px;color:var(--muted);margin-top:2px">${hasFiles ? (noteData.files || []).length + ' file(s) · ' + noteType : 'No notes yet'}</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>`;
          }).join('')}
        </div>
      </div>`;
    }).join('')}`;
  };

  window._openNotes = function(subj, chId) { openNotes(subj, chId); };
})();
