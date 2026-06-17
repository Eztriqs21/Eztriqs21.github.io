/* themes.js – 4-theme engine (dark, amber, nexus, bloom) + dropdown switcher */
const themes = ['dark', 'amber', 'nexus', 'bloom'];
let idx = parseInt(localStorage.getItem('themeIndex') || '0', 10);
if (!themes[idx]) idx = 0;

export function applyTheme(i) {
  const t = themes[i];
  const html = document.documentElement;
  html.setAttribute('data-theme', t);
  localStorage.setItem('themeIndex', i);
  idx = i;

  document.querySelectorAll('.theme-dropdown-item').forEach(el => {
    el.classList.toggle('active', el.dataset.theme === t);
  });

  const btn = document.getElementById('theme-dropdown-btn');
  if (btn) {
    const icons = { dark: 'fa-moon', amber: 'fa-sun', nexus: 'fa-microchip', bloom: 'fa-leaf' };
    btn.innerHTML = `<i class="fas ${icons[t] || 'fa-palette'}"></i>`;
  }

  const gridCanvas = document.getElementById('grid-canvas');
  if (gridCanvas) {
    if (t === 'nexus' && window.gridNexus) {
      window.gridNexus.start();
      gridCanvas.classList.add('active');
    } else if (t === 'bloom' && window.gridBloom) {
      window.gridBloom.start();
      gridCanvas.classList.add('active');
    } else {
      if (window.gridNexus) window.gridNexus.stop();
      if (window.gridBloom) window.gridBloom.stop();
      gridCanvas.classList.remove('active');
    }
  }
}

export function initThemes() {
  const themeBtn = document.getElementById('theme-toggle');
  applyTheme(idx);

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      applyTheme((idx + 1) % themes.length);
    });
  }

  const dropdownBtn = document.getElementById('theme-dropdown-btn');
  const dropdownMenu = document.getElementById('theme-dropdown-menu');
  if (dropdownBtn && dropdownMenu) {
    dropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (!dropdownMenu.contains(e.target)) {
        dropdownMenu.classList.remove('open');
      }
    });
    dropdownMenu.querySelectorAll('.theme-dropdown-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const t = item.dataset.theme;
        const i = themes.indexOf(t);
        if (i !== -1) applyTheme(i);
        dropdownMenu.classList.remove('open');
      });
    });
  }
}

window.themesEngine = { applyTheme };
