// js/pages/pyq.js — PYQ Research page renderer (Nexus & Bloom)
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

  const PYQ_DATA = [
    { id: 'q1', year: 2024, subject: 'physics', topic: 'Rotational Motion', difficulty: 'medium', question: 'A solid disc of mass M and radius R rolls without slipping on a horizontal surface with velocity v. What is the ratio of translational KE to total KE?', options: ['1:2', '1:3', '2:3', '3:4'], answer: 0 },
    { id: 'q2', year: 2024, subject: 'chemistry', topic: 'Chemical Bonding', difficulty: 'easy', question: 'Which of the following molecules has the highest bond order?', options: ['N₂', 'O₂', 'F₂', 'C₂'], answer: 0 },
    { id: 'q3', year: 2024, subject: 'maths', topic: 'Permutations & Combinations', difficulty: 'hard', question: 'In how many ways can 8 different books be distributed among 3 students if each student gets at least 2 books?', options: ['5796', '4620', '3840', '2940'], answer: 0 },
    { id: 'q4', year: 2023, subject: 'physics', topic: 'Electrostatics', difficulty: 'medium', question: 'Two point charges +q and -q are placed at distance d apart. The electric field at the midpoint is:', options: ['0', 'kq/d²', '2kq/d²', '4kq/d²'], answer: 2 },
    { id: 'q5', year: 2023, subject: 'chemistry', topic: 'Thermodynamics', difficulty: 'easy', question: 'For an ideal gas, which process has ΔU = 0?', options: ['Isothermal', 'Adiabatic', 'Isochoric', 'Isobaric'], answer: 0 },
    { id: 'q6', year: 2023, subject: 'maths', topic: 'Matrices & Determinants', difficulty: 'hard', question: 'If A is a 3×3 matrix with |A| = 5, find |3A|:', options: ['15', '45', '135', '243'], answer: 2 },
    { id: 'q7', year: 2022, subject: 'physics', topic: 'Modern Physics', difficulty: 'medium', question: 'The de Broglie wavelength of an electron accelerated through 100V is approximately:', options: ['1.227 Å', '0.1227 Å', '12.27 Å', '0.01227 Å'], answer: 0 },
    { id: 'q8', year: 2022, subject: 'chemistry', topic: 'Organic Chemistry', difficulty: 'hard', question: 'Which reaction proceeds through a carbocation intermediate?', options: ['SN2', 'SN1', 'E2', 'Addition'], answer: 1 }
  ];

  const YEARS = [2024, 2023, 2022, 2021, 2020];
  const DIFFICULTY = { easy: { label: 'Easy', color: 'var(--success)', bg: 'rgba(34,197,94,0.1)' }, medium: { label: 'Medium', color: 'var(--accent)', bg: 'rgba(245,158,11,0.1)' }, hard: { label: 'Hard', color: 'var(--danger)', bg: 'rgba(239,68,68,0.1)' } };

  let activeYear = 'all';
  let activeSubject = 'all';

  function questionCard(q, index) {
    const p = pfx();
    const diff = DIFFICULTY[q.difficulty] || DIFFICULTY.medium;
    return `<div class="${p}-card anim-entrance" style="--delay:${index * 0.05}s;padding:16px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:12px;background:${diff.bg};color:${diff.color}">${diff.label}</span>
        <span style="font-size:11px;padding:2px 8px;border-radius:12px;background:var(--border);color:var(--muted)">${q.year}</span>
        <span style="display:flex;align-items:center;gap:4px;font-size:11px;color:var(--muted);margin-left:auto">${SUBJECT_ICONS[q.subject]} ${q.subject.charAt(0).toUpperCase() + q.subject.slice(1)}</span>
      </div>
      <div style="font-size:12px;color:var(--muted);margin-bottom:6px">${esc(q.topic)}</div>
      <div style="font-size:13px;line-height:1.6;margin-bottom:12px">${esc(q.question)}</div>
      <div style="display:flex;flex-direction:column;gap:6px">
        ${q.options.map((opt, oi) => `<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:8px;border:1px solid var(--border);font-size:12px;cursor:pointer;transition:all 0.2s" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'">
          <div style="width:20px;height:20px;border-radius:50%;border:2px solid ${oi === q.answer ? 'var(--success)' : 'var(--border)'};display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:10px;font-weight:600">${String.fromCharCode(65 + oi)}</div>
          <span>${esc(opt)}</span>
        </div>`).join('')}
      </div>
    </div>`;
  }

  window.renderPYQ = function(el) {
    const p = pfx();
    const filtered = PYQ_DATA.filter(q => (activeYear === 'all' || q.year === activeYear) && (activeSubject === 'all' || q.subject === activeSubject));
    const subjectCounts = { physics: PYQ_DATA.filter(q => q.subject === 'physics').length, chemistry: PYQ_DATA.filter(q => q.subject === 'chemistry').length, maths: PYQ_DATA.filter(q => q.subject === 'maths').length };

    el.innerHTML = `
    <div class="${p}-page-header anim-entrance">
      <div class="${p}-page-title" data-text="PYQ Research">PYQ Research</div>
      <div class="${p}-page-sub">Previous year question analysis</div>
    </div>
    <div class="${p}-stats-grid anim-entrance" style="--delay:0.1s">
      <div class="${p}-stat-card">
        <div class="${p}-stat-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
        <div class="${p}-stat-val"><span data-count="${PYQ_DATA.length}">0</span></div>
        <div class="${p}-stat-label">Questions</div>
        <div class="${p}-stat-sub">In database</div>
      </div>
      <div class="${p}-stat-card">
        <div class="${p}-stat-icon" style="color:var(--success)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
        <div class="${p}-stat-val" style="color:var(--success)"><span data-count="${subjectCounts.physics}">0</span></div>
        <div class="${p}-stat-label">Physics</div>
        <div class="${p}-stat-sub">Questions</div>
      </div>
      <div class="${p}-stat-card">
        <div class="${p}-stat-icon" style="color:var(--accent)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6v11l4 5H5l4-5V3z"/><line x1="9" y1="3" x2="15" y2="3"/></svg></div>
        <div class="${p}-stat-val" style="color:var(--accent)"><span data-count="${subjectCounts.chemistry}">0</span></div>
        <div class="${p}-stat-label">Chemistry</div>
        <div class="${p}-stat-sub">Questions</div>
      </div>
    </div>
    <div class="${p}-filter-bar anim-entrance" style="--delay:0.15s">
      <button class="${p}-chip ${activeYear === 'all' ? 'active' : ''}" onclick="window._pyqYear('all')">All Years</button>
      ${YEARS.map(y => `<button class="${p}-chip ${activeYear === y ? 'active' : ''}" onclick="window._pyqYear(${y})">${y}</button>`).join('')}
    </div>
    <div class="${p}-filter-bar anim-entrance" style="--delay:0.2s">
      <button class="${p}-chip ${activeSubject === 'all' ? 'active' : ''}" onclick="window._pyqSubj('all')">All Subjects</button>
      <button class="${p}-chip ${activeSubject === 'physics' ? 'active' : ''}" onclick="window._pyqSubj('physics')">Physics</button>
      <button class="${p}-chip ${activeSubject === 'chemistry' ? 'active' : ''}" onclick="window._pyqSubj('chemistry')">Chemistry</button>
      <button class="${p}-chip ${activeSubject === 'maths' ? 'active' : ''}" onclick="window._pyqSubj('maths')">Maths</button>
    </div>
    <div class="${p}-section-block anim-entrance" style="--delay:0.25s">
      <div class="${p}-section-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> Questions (${filtered.length})</div>
      ${filtered.length === 0
        ? `<div class="${p}-empty" style="padding:28px"><div class="${p}-empty-title">No questions match filters</div><div class="${p}-empty-sub">Try adjusting year or subject</div></div>`
        : `<div class="${p}-grid" style="grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px">${filtered.map((q, i) => questionCard(q, i)).join('')}</div>`}
    </div>`;

    window._pyqYear = function(y) { activeYear = y; el.innerHTML = ''; window.renderPYQ(el); };
    window._pyqSubj = function(s) { activeSubject = s; el.innerHTML = ''; window.renderPYQ(el); };
  };
})();
