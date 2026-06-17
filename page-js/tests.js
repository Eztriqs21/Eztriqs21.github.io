// js/pages/tests.js — Tests page renderer (Nexus & Bloom)
(function() {
  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function fmtDate(d) { return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }); }
  function getTheme() { return document.documentElement.getAttribute('data-theme') || 'nexus'; }
  function pfx() { return getTheme() === 'nexus' ? 'nx' : 'bl'; }

  function testCard(t, index) {
    const p = pfx();
    const pct = t.maxScore > 0 ? Math.round(t.totalScore / t.maxScore * 100) : 0;
    const phS = t.physics.correct * 4 - t.physics.incorrect;
    const chS = t.chemistry.correct * 4 - t.chemistry.incorrect;
    const mS = t.maths.correct * 4 - t.maths.incorrect;
    const tm = t.timing || {};

    return `<div class="${p}-test-card anim-entrance" style="--delay:${index * 0.05}s" onclick="this.classList.toggle('expanded')">
      <div class="${p}-test-card-header">
        <div class="${p}-test-card-num">#${index + 1}</div>
        <div style="flex:1">
          <div class="${p}-test-card-name">${esc(t.name)}</div>
          <div class="${p}-test-card-date">${fmtDate(t.date)}</div>
        </div>
        <div class="${p}-test-card-score">
          <div class="${p}-test-card-score-big">${t.totalScore}</div>
          <div class="${p}-test-card-score-max">/${t.maxScore}</div>
        </div>
        <div class="${p}-test-card-chevron">▼</div>
      </div>
      <div class="${p}-test-card-body">
        ${tm.total ? `<div class="${p}-test-card-timing">
          <span>Total: ${tm.total}m</span>
          <span>P: ${tm.physics || 0}m</span>
          <span>C: ${tm.chemistry || 0}m</span>
          <span>M: ${tm.maths || 0}m</span>
        </div>` : ''}
        <div class="${p}-test-card-breakdown">
          ${[
            { label: 'Physics', score: phS, data: t.physics, color: 'physics' },
            { label: 'Chemistry', score: chS, data: t.chemistry, color: 'chemistry' },
            { label: 'Maths', score: mS, data: t.maths, color: 'maths' }
          ].map(sb => `<div class="${p}-test-card-subject">
            <div class="${p}-test-card-subject-label">${sb.label}</div>
            <div class="${p}-test-card-subject-score">${sb.score}</div>
            <div class="${p}-test-card-subject-detail">${sb.data.correct}C / ${sb.data.incorrect}W / ${sb.data.unattempted || 0}S</div>
            <div class="${p}-progress-wrap" style="height:3px;margin-top:6px"><div class="${p}-progress-bar ${sb.color}" style="height:3px;width:${Math.max(0, sb.score)}%"></div></div>
          </div>`).join('')}
        </div>
      </div>
    </div>`;
  }

  window.renderTests = function(el) {
    const p = pfx();
    const tests = window.DB.tests;

    el.innerHTML = `
    <div class="${p}-page-header anim-entrance">
      <div class="${p}-page-title" data-text="Tests">Tests</div>
      <div class="${p}-page-sub">Test history and performance analysis</div>
    </div>
    <div class="${p}-search-wrap anim-entrance" style="--delay:0.1s">
      <input class="${p}-input" type="text" placeholder="Search tests by name or chapter...">
    </div>
    <div class="${p}-test-list">
      ${tests.length === 0
        ? `<div class="${p}-empty" style="padding:40px 0">
            <div class="${p}-empty-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></div>
            <div class="${p}-empty-title">No tests recorded</div>
            <div class="${p}-empty-sub">Add your first test to see performance data</div>
          </div>`
        : tests.map((t, i) => testCard(t, i)).join('')}
    </div>`;
  };
})();