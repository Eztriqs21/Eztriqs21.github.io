// js/themes.js — Theme Engine for JEE HQ
const THEMES = {
  cyber: { label: 'Cyber Void', icon: '◆', desc: 'Electric indigo on deep space' },
  linear: { label: 'Linear Dark', icon: '◇', desc: 'Sleek cyan on cool gray' },
  obsidian: { label: 'Obsidian Gold', icon: '◈', desc: 'Warm gold on charcoal' }
};

function getSavedTheme() {
  try { return localStorage.getItem('jeehq_theme') || 'cyber'; } catch(e) { return 'cyber'; }
}

export function applyTheme(name) {
  if (!THEMES[name]) name = 'cyber';
  document.documentElement.setAttribute('data-theme', name);
  try { localStorage.setItem('jeehq_theme', name); } catch(e) {}
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === name);
  });
}

export function initThemes() {
  applyTheme(getSavedTheme());
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('pointerdown', e => {
      e.preventDefault();
      applyTheme(btn.dataset.theme);
    });
  });
}

export { THEMES };
