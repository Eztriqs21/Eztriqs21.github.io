/* themes.js – 3-theme engine (nexus, bloom, nebula) */
const themes = ['nexus', 'bloom', 'nebula'];
let idx = parseInt(localStorage.getItem('themeIndex') || '0', 10);
if (!themes[idx]) idx = 0;

export function applyTheme(i) {
  const t = themes[i];
  const html = document.documentElement;
  html.setAttribute('data-theme', t);
  localStorage.setItem('themeIndex', i);
  idx = i;

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
      if (window.gridNexus) window.gridNexus.stop();
      if (window.gridBloom) window.gridBloom.stop();
      if (window.gridNebula) window.gridNebula.stop();
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

  const flashColors = { nexus: '#00f0ff', bloom: '#fff', nebula: '#8C7AE6' };
  const flash = document.createElement('div');
  flash.className = 'theme-flash';
  flash.style.cssText = `position:fixed;inset:0;z-index:10000;background:${flashColors[next] || '#fff'};opacity:0;pointer-events:none;transition:opacity 0.5s;`;
  document.querySelectorAll('.theme-flash').forEach(f => f.remove());
  document.body.appendChild(flash);
  requestAnimationFrame(() => { flash.style.opacity = '0.5'; });
  setTimeout(() => { flash.style.opacity = '0'; }, 100);
  setTimeout(() => flash.remove(), 600);

  const i = themes.indexOf(next);
  if (i !== -1) applyTheme(i);

  if (window.cursorEngine && window.cursorEngine.morph) {
    window.cursorEngine.morph();
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
