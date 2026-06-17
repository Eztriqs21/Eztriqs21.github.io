// js/pages/calculator.js — Calculator page renderer (Nexus & Bloom)
(function() {
  function getTheme() { return document.documentElement.getAttribute('data-theme') || 'nexus'; }
  function pfx() { return getTheme() === 'nexus' ? 'nx' : 'bl'; }

  const SUBJECTS = [
    { key: 'physics', label: 'Physics', color: 'var(--primary)' },
    { key: 'chemistry', label: 'Chemistry', color: 'var(--secondary)' },
    { key: 'maths', label: 'Maths', color: 'var(--accent)' }
  ];

  function questionRow(num, subj, color) {
    const p = pfx();
    return `<div class="${p}-question-row anim-entrance" style="--delay:${num * 0.02}s">
      <div class="${p}-question-num" style="color:${color}">Q${num}</div>
      <div class="${p}-question-subject">${subj}</div>
      <div class="${p}-question-options">
        ${['A', 'B', 'C', 'D'].map(opt => `<div class="${p}-question-opt">${opt}</div>`).join('')}
      </div>
    </div>`;
  }

  window.renderCalculator = function(el) {
    const p = pfx();
    const questions = [];
    SUBJECTS.forEach((subj, si) => {
      for (let i = 1; i <= 25; i++) {
        questions.push({ num: si * 25 + i, subj: subj.label, color: subj.color });
      }
    });

    el.innerHTML = `
    <div class="${p}-page-header anim-entrance">
      <div class="${p}-page-title" data-text="Calculator">Calculator</div>
      <div class="${p}-page-sub">Full JEE mock evaluation engine</div>
    </div>
    <div class="${p}-section-block anim-entrance" style="--delay:0.1s;padding:20px">
      <div class="${p}-section-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg> Answer Key</div>
      <div class="${p}-answer-key-section">
        <textarea class="${p}-input" rows="3" placeholder="Paste answer key...&#10;e.g. 1:A, 2:C, 3:D, 4:B, 5:A ..."></textarea>
        <div class="${p}-answer-key-actions">
          <button class="${p}-btn ${p}-btn-ghost">Apply Key</button>
          <span class="${p}-answer-key-status">Enter key to enable scoring</span>
        </div>
      </div>
    </div>
    <div class="${p}-section-block anim-entrance" style="--delay:0.2s;padding:20px">
      <div class="${p}-section-title"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> Response Sheet — 75 Questions</div>
      <div class="${p}-question-matrix">
        ${questions.map(q => questionRow(q.num, q.subj, q.color)).join('')}
      </div>
      <div class="${p}-calculator-actions">
        <button class="${p}-btn ${p}-btn-ghost">Reset</button>
        <button class="${p}-btn ${p}-btn-primary">Calculate Score</button>
      </div>
    </div>
    <div class="${p}-section-block anim-entrance" style="--delay:0.3s">
      <div class="${p}-section-title"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="10" y2="10"/><line x1="14" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/><line x1="14" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="16" y2="18"/></svg> Score Breakdown</div>
      <div class="${p}-score-ring-container">
        <div class="${p}-score-ring">
          <svg viewBox="0 0 120 120" class="${p}-score-ring-svg">
            <circle cx="60" cy="60" r="54" fill="none" stroke="var(--border)" stroke-width="8"/>
            <circle cx="60" cy="60" r="54" fill="none" stroke="var(--accent)" stroke-width="8" stroke-dasharray="339.292" stroke-dashoffset="339.292" transform="rotate(-90 60 60)" class="${p}-score-ring-progress"/>
          </svg>
          <div class="${p}-score-ring-value">0</div>
          <div class="${p}-score-ring-label">/ 300</div>
        </div>
      </div>
      <div class="${p}-stats-grid" style="margin-top:16px">
        <div class="${p}-stat-card">
          <div class="${p}-stat-val" style="color:var(--success)">0</div>
          <div class="${p}-stat-label">Correct</div>
        </div>
        <div class="${p}-stat-card">
          <div class="${p}-stat-val" style="color:var(--danger)">0</div>
          <div class="${p}-stat-label">Incorrect</div>
        </div>
        <div class="${p}-stat-card">
          <div class="${p}-stat-val" style="color:var(--muted)">75</div>
          <div class="${p}-stat-label">Unattempted</div>
        </div>
      </div>
    </div>`;
  };
})();