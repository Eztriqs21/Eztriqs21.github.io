/* themes.js – 3-theme engine (nexus, bloom, nebula) */
const themes = ['nexus', 'bloom', 'nebula'];
const themeNames = { nexus: 'NEXUS', bloom: 'BLOOM', nebula: 'NEBULA' };
let idx = parseInt(localStorage.getItem('themeIndex') || '0', 10);
if (!themes[idx]) idx = 0;

let _indicatorTimer = null;

function showIndicator(name) {
  const el = document.getElementById('theme-indicator');
  if (!el) return;
  if (_indicatorTimer) clearTimeout(_indicatorTimer);
  el.textContent = name;
  el.classList.remove('show');
  void el.offsetWidth;
  el.classList.add('show');
  _indicatorTimer = setTimeout(() => el.classList.remove('show'), 1800);
}

export function applyTheme(i) {
  const t = themes[i];
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('themeIndex', i);
  idx = i;

  if (window.gridNexus) window.gridNexus.stop();
  if (window.gridBloom) window.gridBloom.stop();
  if (window.gridNebula) window.gridNebula.stop();

  const gridCanvas = document.getElementById('grid-canvas');
  if (gridCanvas) {
    if (t === 'nexus' && window.gridNexus) {
      window.gridNexus.start();
      gridCanvas.classList.add('active');
    } else if (t === 'bloom' && window.gridBloom) {
      window.gridBloom.start();
      gridCanvas.classList.add('active');
    } else if (t === 'nebula' && window.gridNebula) {
      window.gridNebula.start();
      gridCanvas.classList.add('active');
    } else {
      gridCanvas.classList.remove('active');
    }
  }

  if (window.cursorEngine && typeof window.cursorEngine.morph === 'function') {
    window.cursorEngine.morph();
  }
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const ci = themes.indexOf(current);
  const next = themes[(ci + 1) % themes.length];
  const i = themes.indexOf(next);
  if (i === -1) return;

  if (window.cursorEngine && window.cursorEngine.morph) {
    window.cursorEngine.morph();
  }

  if (window.preloaderEngine && typeof window.preloaderEngine.runTransition === 'function') {
    window.preloaderEngine.runTransition(next, function() {
      applyTheme(i);
      showIndicator(themeNames[next]);
    });
  } else {
    applyTheme(i);
    showIndicator(themeNames[next]);
  }
}

export function initThemes() {
  applyTheme(idx);

  const switcher = document.getElementById('theme-switcher');
  if (switcher) {
    switcher.addEventListener('click', toggleTheme);
  }

  const mobileBtn = document.getElementById('mobile-theme-btn');
  if (mobileBtn) {
    mobileBtn.addEventListener('click', toggleTheme);
  }

  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 't' || e.key === 'T') {
      e.preventDefault();
      toggleTheme();
    }
    const shortcuts = { '1': 'dashboard', '2': 'chapters', '3': 'tests', '4': 'analytics', '5': 'calculator' };
    if (shortcuts[e.key]) {
      e.preventDefault();
      window.location.hash = '#/' + shortcuts[e.key];
    }
  });
}

window.themesEngine = { applyTheme, toggleTheme };
