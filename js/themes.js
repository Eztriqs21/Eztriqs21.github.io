// js/themes.js — Theme Engine for JEE HQ
// 2 themes: Dark (charcoal), Amber (orange)

const THEMES = {
  dark:   { label: 'Dark',   icon: '●', color: '#888888', desc: 'Charcoal black' },
  amber:  { label: 'Amber',  icon: '●', color: '#C07040', desc: 'Warm orange tones' }
};

function getSavedTheme() {
  try { return localStorage.getItem('jeehq_theme') || 'dark'; } catch(e) { return 'dark'; }
}

export function applyTheme(name) {
  if (!THEMES[name]) name = 'dark';
  document.documentElement.setAttribute('data-theme', name);
  try { localStorage.setItem('jeehq_theme', name); } catch(e) {}
  document.querySelectorAll('.theme-dot').forEach(dot => {
    dot.classList.toggle('active', dot.dataset.theme === name);
  });
}

export function initThemes() {
  applyTheme(getSavedTheme());
  document.querySelectorAll('.theme-dot').forEach(dot => {
    dot.addEventListener('pointerdown', e => {
      e.preventDefault();
      applyTheme(dot.dataset.theme);
    });
  });
}

export { THEMES };
