/* themes.js – 4-theme engine (dark, amber, nexus, bloom) + dropdown switcher */
export function initThemes() {}
const html = document.documentElement;
const themeBtn = document.getElementById('theme-toggle');
const themes = ['dark', 'amber', 'nexus', 'bloom'];
let idx = parseInt(localStorage.getItem('themeIndex') || '0', 10);
if (!themes[idx]) idx = 0;

function applyTheme(i) {
  const t = themes[i];
  html.setAttribute('data-theme', t);
  localStorage.setItem('themeIndex', i);
  idx = i;

  // Update dropdown active state
  document.querySelectorAll('.theme-dropdown-item').forEach(el => {
    el.classList.toggle('active', el.dataset.theme === t);
  });

  // Update dropdown button icon
  const btn = document.getElementById('theme-dropdown-btn');
  if (btn) {
    const icons = { dark: 'fa-moon', amber: 'fa-sun', nexus: 'fa-microchip', bloom: 'fa-leaf' };
    btn.innerHTML = `<i class="fas ${icons[t] || 'fa-palette'}"></i>`;
  }

  // Switch grid background
  const gridCanvas = document.getElementById('grid-canvas');
  if (gridCanvas) {
    if (t === 'nexus' && window.NexusGrid) {
      window.NexusGrid.start();
      gridCanvas.classList.add('active');
    } else if (t === 'bloom' && window.BloomGrid) {
      window.BloomGrid.start();
      gridCanvas.classList.add('active');
    } else {
      if (window.NexusGrid) window.NexusGrid.stop();
      if (window.BloomGrid) window.BloomGrid.stop();
      gridCanvas.classList.remove('active');
    }
  }

  // Re-render current page if render function exists
  const page = html.getAttribute('data-page') || 'dashboard';
  const renderMap = {
    dashboard: 'renderDashboard',
    chapters: 'renderChapters',
    notes: 'renderNotes',
    assignments: 'renderAssignments',
    tests: 'renderTests',
    calculator: 'renderCalculator',
    analytics: 'renderAnalytics',
    studylog: 'renderStudyLog',
    pyq: 'renderPYQ',
    mocktests: 'renderMockTests',
    revision: 'renderRevision',
    doubtsolver: 'renderDoubtSolver',
    scoreanalytics: 'renderScoreAnalytics',
    prep: 'renderPrep'
  };
  const fnName = renderMap[page];
  const mainEl = document.getElementById('main-content');
  if (fnName && typeof window[fnName] === 'function' && mainEl) {
    window[fnName](mainEl);
  }
}

// Apply saved theme on load
applyTheme(idx);

// Old button toggle (if it still exists) — cycles through themes
if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    applyTheme((idx + 1) % themes.length);
  });
}

// Dropdown switcher
const dropdownBtn = document.getElementById('theme-dropdown-btn');
const dropdownMenu = document.getElementById('theme-dropdown-menu');
if (dropdownBtn && dropdownMenu) {
  dropdownBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle('open');
  });
  document.addEventListener('click', () => {
    dropdownMenu.classList.remove('open');
  });
  dropdownMenu.querySelectorAll('.theme-dropdown-item').forEach(item => {
    item.addEventListener('click', () => {
      const t = item.dataset.theme;
      const i = themes.indexOf(t);
      if (i !== -1) applyTheme(i);
      dropdownMenu.classList.remove('open');
    });
  });
}
