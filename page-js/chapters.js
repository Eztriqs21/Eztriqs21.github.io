// js/pages/chapters.js — Chapters page renderer (Nexus & Bloom)
(function() {
  const SUBJECTS = [
    { key: 'physics', label: 'Physics', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>' },
    { key: 'chemistry', label: 'Chemistry', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6v11l4 5H5l4-5V3z"/><line x1="9" y1="3" x2="15" y2="3"/></svg>' },
    { key: 'maths', label: 'Maths', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20L20 4"/><path d="M15 4h5v5"/><path d="M4 20l5-5"/></svg>' }
  ];
  const FILTERS = ['all', 'strong', 'decent', 'weak', 'uncovered'];
  const STRENGTHS = ['strong', 'decent', 'weak', 'uncovered'];

  function safePct(a, b) { return b > 0 ? Math.round((a / b) * 100) : 0; }
  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function getTheme() { return document.documentElement.getAttribute('data-theme') || 'nexus'; }
  function pfx() { return getTheme() === 'nexus' ? 'nx' : 'bl'; }

  let currentFilter = 'all';
  let searchQuery = '';

  function chapterRow(ch, subjKey) {
    const p = pfx();
    const noteCount = (ch.notes?.detailed?.length || 0) + (ch.notes?.revision?.length || 0);
    return `<div class="${p}-chapter-row anim-entrance">
      <div class="${p}-chapter-check ${ch.completed ? 'done' : ''}">
        ${ch.completed ? '<svg width="11" height="11" viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/></svg>' : ''}
      </div>
      <span class="${p}-chapter-name ${ch.completed ? 'done' : ''}">${esc(ch.name)}</span>
      <div class="${p}-strength-dots">
        ${STRENGTHS.map(s => `<div class="${p}-strength-dot ${s} ${ch.strength === s ? 'on' : ''}"></div>`).join('')}
      </div>
      <div class="${p}-chapter-meta">
        ${noteCount > 0 ? `<span class="${p}-chapter-badge">${noteCount} notes</span>` : ''}
        ${ch.mainsPyqDone ? `<span class="${p}-chapter-badge mains">Mains PYQ</span>` : ''}
        ${ch.advPyqDone ? `<span class="${p}-chapter-badge adv">Adv PYQ</span>` : ''}
      </div>
    </div>`;
  }

  function subjectAccordion(subj, index) {
    const p = pfx();
    const chs = (window.DB && window.DB.chapters && window.DB.chapters[subj.key]) || [];
    const q = searchQuery.trim().toLowerCase();
    const filtered = (currentFilter === 'all' ? chs : chs.filter(c => c.strength === currentFilter))
      .filter(c => !q || c.name.toLowerCase().includes(q));
    const done = chs.filter(c => c.completed).length;
    const pct = safePct(done, chs.length);

    return `<div class="${p}-accordion anim-entrance" style="--delay:${index * 0.1}s" onclick="this.classList.toggle('open')">
      <div class="${p}-accordion-header">
        <div class="${p}-accordion-icon">${subj.icon}</div>
        <div style="flex:1">
          <div class="${p}-accordion-title">${subj.label}</div>
          <div class="${p}-accordion-meta">${done}/${chs.length} completed · ${pct}%</div>
        </div>
        <div class="${p}-accordion-pct">${pct}%</div>
        <div class="${p}-accordion-chevron">▼</div>
      </div>
      <div class="${p}-accordion-body">
        <div class="${p}-accordion-progress">
          <div class="${p}-progress-wrap" style="height:4px"><div class="${p}-progress-bar" style="height:4px;width:${pct}%"></div></div>
        </div>
        <div class="${p}-accordion-chapters">
          ${filtered.length === 0
            ? `<div class="${p}-empty" style="padding:28px"><div class="${p}-empty-title">${searchQuery.trim() ? 'No chapters match "' + esc(searchQuery.trim()) + '"' : 'No chapters match this filter'}</div></div>`
            : filtered.map(ch => chapterRow(ch, subj.key)).join('')}
        </div>
      </div>
    </div>`;
  }

  window.renderChapters = function(el) {
    const p = pfx();

    el.innerHTML = `
    <div class="${p}-page-header anim-entrance">
      <div class="${p}-page-title" data-text="Chapters">Chapters</div>
      <div class="${p}-page-sub">Syllabus mastery & tracking</div>
    </div>
    <div class="${p}-filter-bar anim-entrance" style="--delay:0.1s">
      ${FILTERS.map(f => `<button class="${p}-chip ${currentFilter === f ? 'active' : ''}" onclick="document.querySelectorAll('.${p}-chip').forEach(c=>c.classList.remove('active'));this.classList.add('active');window._chFilter('${f}')">${f === 'all' ? 'All Chapters' : f.charAt(0).toUpperCase() + f.slice(1)}</button>`).join('')}
    </div>
    <div class="${p}-search-wrap anim-entrance" style="--delay:0.15s">
      <input class="${p}-input" type="text" placeholder="Search chapters..." value="${esc(searchQuery)}" oninput="window._chSearch(this.value)">
    </div>
    <div class="${p}-accordion-list">
      ${SUBJECTS.map((s, i) => subjectAccordion(s, i)).join('')}
    </div>`;

    // Expose filter/search to global scope for inline handlers
    window._chFilter = function(f) {
      currentFilter = f;
      el.innerHTML = ''; // force re-render
      window.renderChapters(el);
    };
    window._chSearch = function(q) {
      searchQuery = q;
      el.innerHTML = '';
      window.renderChapters(el);
    };
  };
})();