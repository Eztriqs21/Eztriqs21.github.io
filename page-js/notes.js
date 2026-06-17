// js/pages/notes.js — Notes page renderer (Nexus & Bloom)
(function() {
  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function fmtDate(d) { return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }); }
  function safePct(a, b) { return b > 0 ? Math.round((a / b) * 100) : 0; }
  function getTheme() { return document.documentElement.getAttribute('data-theme') || 'nexus'; }
  function pfx() { return getTheme() === 'nexus' ? 'nx' : 'bl'; }

  const SUBJECTS = {
    physics:   { label: 'Physics',   icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>' },
    chemistry: { label: 'Chemistry', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6v11l4 5H5l4-5V3z"/><line x1="9" y1="3" x2="15" y2="3"/></svg>' },
    maths:     { label: 'Mathematics', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20L20 4"/><path d="M15 4h5v5"/><path d="M4 20l5-5"/></svg>' }
  };

  const NOTES_DATA = {
    physics: [
      { chapter: 'Laws of Motion', notes: [{ name: 'Newton\'s Laws Summary', type: 'detailed', date: new Date(Date.now() - 86400000).toISOString() }, { name: 'Friction Types', type: 'revision', date: new Date(Date.now() - 172800000).toISOString() }] },
      { chapter: 'Work, Energy & Power', notes: [{ name: 'Work-Energy Theorem', type: 'detailed', date: new Date(Date.now() - 259200000).toISOString() }] },
      { chapter: 'Rotational Motion', notes: [{ name: 'Moment of Inertia Table', type: 'revision', date: new Date(Date.now() - 345600000).toISOString() }] }
    ],
    chemistry: [
      { chapter: 'Atomic Structure', notes: [{ name: 'Quantum Numbers', type: 'detailed', date: new Date(Date.now() - 129600000).toISOString() }, { name: 'Electronic Config', type: 'revision', date: new Date(Date.now() - 259200000).toISOString() }] },
      { chapter: 'Chemical Bonding', notes: [{ name: 'VSEPR Theory', type: 'detailed', date: new Date(Date.now() - 432000000).toISOString() }] }
    ],
    maths: [
      { chapter: 'Trigonometric Functions', notes: [{ name: 'Formula Sheet', type: 'revision', date: new Date(Date.now() - 86400000).toISOString() }, { name: 'Identities Derivation', type: 'detailed', date: new Date(Date.now() - 172800000).toISOString() }] },
      { chapter: 'Quadratic Equations', notes: [{ name: 'Roots & Discriminant', type: 'revision', date: new Date(Date.now() - 345600000).toISOString() }] }
    ]
  };

  function noteItem(note, index) {
    const p = pfx();
    const icon = note.type === 'detailed'
      ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'
      : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>';
    return `<div class="${p}-list-item" style="--delay:${index * 0.04}s">
      <div style="display:flex;align-items:center;gap:8px;flex:1">
        <span style="opacity:0.5">${icon}</span>
        <span class="${p}-list-title">${esc(note.name)}</span>
        <span style="font-size:10px;padding:1px 6px;border-radius:8px;background:var(--border);color:var(--muted)">${note.type}</span>
      </div>
      <div class="${p}-list-meta">${fmtDate(note.date)}</div>
    </div>`;
  }

  function subjectAccordion(key, chapters, index) {
    const p = pfx();
    const info = SUBJECTS[key];
    const totalNotes = chapters.reduce((s, c) => s + (c.notes?.length || 0), 0);
    const lastUpdated = chapters.reduce((latest, c) => {
      const dates = (c.notes || []).map(n => new Date(n.date).getTime());
      const max = Math.max(...dates, 0);
      return max > latest ? max : latest;
    }, 0);

    return `<div class="${p}-accordion anim-entrance" style="--delay:${0.15 + index * 0.1}s" onclick="this.classList.toggle('open')">
      <div class="${p}-accordion-header">
        <div class="${p}-accordion-icon">${info.icon}</div>
        <div style="flex:1">
          <div class="${p}-accordion-title">${info.label}</div>
          <div class="${p}-accordion-meta">${totalNotes} notes · Last updated ${lastUpdated ? fmtDate(lastUpdated) : 'never'}</div>
        </div>
        <div class="${p}-accordion-chevron">▼</div>
      </div>
      <div class="${p}-accordion-body">
        ${chapters.map((ch, ci) => `<div style="padding:8px 0">
          <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;font-size:13px;font-weight:600">
            <span>${esc(ch.chapter)}</span>
            <span style="font-size:11px;color:var(--muted)">${(ch.notes||[]).length} note${(ch.notes||[]).length !== 1 ? 's' : ''}</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:2px">
            ${(ch.notes||[]).map((n, ni) => noteItem(n, ni)).join('')}
          </div>
        </div>`).join('')}
      </div>
    </div>`;
  }

  window.renderNotes = function(el) {
    const p = pfx();
    const keys = ['physics', 'chemistry', 'maths'];
    const totalNotes = keys.reduce((s, k) => s + (NOTES_DATA[k]||[]).reduce((s2, c) => s2 + (c.notes?.length || 0), 0), 0);
    const totalChapters = keys.reduce((s, k) => s + (NOTES_DATA[k]||[]).length, 0);

    el.innerHTML = `
    <div class="${p}-page-header anim-entrance">
      <div class="${p}-page-title" data-text="Notes">Notes</div>
      <div class="${p}-page-sub">Chapter-wise notes & resources</div>
    </div>
    <div class="${p}-stats-grid anim-entrance" style="--delay:0.1s">
      <div class="${p}-stat-card">
        <div class="${p}-stat-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
        <div class="${p}-stat-val"><span data-count="${totalNotes}">0</span></div>
        <div class="${p}-stat-label">Total Notes</div>
        <div class="${p}-stat-sub">Detailed & revision</div>
      </div>
      <div class="${p}-stat-card">
        <div class="${p}-stat-icon" style="color:var(--accent)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></div>
        <div class="${p}-stat-val" style="color:var(--accent)"><span data-count="${totalChapters}">0</span></div>
        <div class="${p}-stat-label">Chapters</div>
        <div class="${p}-stat-sub">With notes</div>
      </div>
    </div>
    <div class="${p}-accordion-list">
      ${keys.map((k, i) => subjectAccordion(k, NOTES_DATA[k] || [], i)).join('')}
    </div>`;
  };
})();
