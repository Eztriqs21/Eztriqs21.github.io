/* themes.js – Gold theme engine */
import { forceRender } from './nav.js';

const THEME_BG_IMAGE = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&q=80';

function loadThemeBackground() {
  var overlay = document.getElementById('bg-image-overlay');
  if (!overlay) return;
  overlay.classList.remove('loaded');
  overlay.style.backgroundImage = 'url(' + THEME_BG_IMAGE + ')';
  var img = new Image();
  img.onload = function() { overlay.classList.add('loaded'); };
  img.onerror = function() { overlay.classList.remove('loaded'); };
  img.src = THEME_BG_IMAGE;

  var preloaderBg = document.querySelector('.preloader-bg');
  if (preloaderBg) {
    preloaderBg.style.backgroundImage = 'url(' + THEME_BG_IMAGE + ')';
  }
}

export function setTheme(theme) {
  localStorage.setItem('themeIndex', theme);
}

export function getTheme() {
  return parseInt(localStorage.getItem('themeIndex') || '0', 10);
}

export function cycleTheme() {
  var current = getTheme();
  var next = (current + 1) % themes.length;
  setTheme(next);
  applyTheme();
}

export const pfx = (function() {
  var styles = window.getComputedStyle(document.documentElement, '');
  return (Array.prototype.slice.call(styles).join('').match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o']))[1];
})();

export function getThemeCSS(varName) {
  return getComputedStyle(document.documentElement).getPropertyValue(varName);
}

function applyObserver() {
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.attributeName === 'data-theme') {
        var newTheme = document.documentElement.getAttribute('data-theme');
        if (newTheme === 'gold') {
          document.documentElement.classList.add('theme-gold');
          document.documentElement.classList.remove('theme-dark');
        } else {
          document.documentElement.classList.add('theme-dark');
          document.documentElement.classList.remove('theme-gold');
        }
      }
    });
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
}

export function applyTheme() {
  document.documentElement.setAttribute('data-theme', 'gold');
  localStorage.setItem('themeIndex', 0);

  document.documentElement.removeAttribute('data-theme-transitioning');
  document.body.classList.remove('cursor-hover', 'cursor-click');

  loadThemeBackground();

  if (window.gridGold) window.gridGold.stop();

  var gridCanvas = document.getElementById('grid-canvas');
  if (gridCanvas) {
    var ctx = gridCanvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
    gridCanvas.classList.remove('active');
  }

  if (window.cursorEngine && typeof window.cursorEngine.morph === 'function') {
    window.cursorEngine.morph();
  }

  if (typeof window.cleanupScrollAnimations === 'function') {
    window.cleanupScrollAnimations();
  }

  var staleEls = document.querySelectorAll('[data-theme-anim]');
  for (var si = 0; si < staleEls.length; si++) {
    staleEls[si].removeAttribute('data-theme-anim');
  }

  var contentWrap = document.getElementById('content-wrap');
  if (contentWrap) {
    var pgTitle = contentWrap.querySelector('.pg-title');
    if (pgTitle) {
      pgTitle.style.transform = '';
      pgTitle.style.opacity = '';
    }
    var allAnimEls = contentWrap.querySelectorAll('[class*="-anim-"]');
    for (var ai = 0; ai < allAnimEls.length; ai++) {
      var classes = allAnimEls[ai].className.split(' ');
      for (var ci = classes.length - 1; ci >= 0; ci--) {
        if (classes[ci].indexOf('-anim-') !== -1 && classes[ci].indexOf('-anim-active') === -1) {
          allAnimEls[ai].classList.remove(classes[ci]);
        }
        if (classes[ci].indexOf('-anim-active') !== -1) {
          allAnimEls[ai].classList.remove(classes[ci]);
        }
      }
    }
  }

  if (gridCanvas && window.gridGold) {
    window.gridGold.start();
    gridCanvas.classList.add('active');
  }

  var mouseCanvas = document.getElementById('mouse-particles');
  if (mouseCanvas) {
    var mCtx = mouseCanvas.getContext('2d');
    if (mCtx) mCtx.clearRect(0, 0, mouseCanvas.width, mouseCanvas.height);
  }

  applyObserver();

  requestAnimationFrame(function() {
    forceRender();
  });
}

export function initThemes() {
  applyTheme();
}

window._themeInit = applyTheme;

window.themesEngine = { applyTheme };
