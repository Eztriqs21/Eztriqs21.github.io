// js/themes.js — Theme Engine for JEE HQ
// 3 themes: Ink Wash (default), Amber Walnut Morning, Opaline (light)

const THEMES = {
  ink:    { label: 'Ink Wash',     icon: '●', color: '#A0A0A0', desc: 'Dark monochrome' },
  amber:  { label: 'Amber Walnut', icon: '●', color: '#BB6C43', desc: 'Warm earth tones' },
  opaline:{ label: 'Opaline',      icon: '●', color: '#FF634A', desc: 'Clean light mode' }
};

function getSavedTheme() {
  try { return localStorage.getItem('jeehq_theme') || 'ink'; } catch(e) { return 'ink'; }
}

export function applyTheme(name) {
  if (!THEMES[name]) name = 'ink';
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
