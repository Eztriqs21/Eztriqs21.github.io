/* themes.js – Single Obsidian theme engine */
import { forceRender } from './nav.js';

const THEME_BG_IMAGE = 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&q=80';

function loadThemeBackground() {
  var overlay = document.getElementById('bg-image-overlay');
  if (!overlay) return;
  overlay.classList.remove('loaded');
  overlay.style.backgroundImage = 'url(' + THEME_BG_IMAGE + ')';
  var img = new Image();
  img.onload = function() { overlay.classList.add('loaded'); };
  img.onerror = function() { overlay.classList.remove('loaded'); };
  img.src = THEME_BG_IMAGE;
}

export function applyTheme() {
  document.documentElement.setAttribute('data-theme', 'obsidian');
  localStorage.setItem('themeIndex', 0);

  document.documentElement.removeAttribute('data-theme-transitioning');
  document.body.classList.remove('cursor-hover', 'cursor-click');

  loadThemeBackground();

  if (window.gridObsidian) window.gridObsidian.stop();

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

  if (gridCanvas && window.gridObsidian) {
    window.gridObsidian.start();
    gridCanvas.classList.add('active');
  }

  var mouseCanvas = document.getElementById('mouse-particles');
  if (mouseCanvas) {
    var mCtx = mouseCanvas.getContext('2d');
    if (mCtx) mCtx.clearRect(0, 0, mouseCanvas.width, mouseCanvas.height);
  }

  requestAnimationFrame(function() {
    forceRender();
  });
}

export function initThemes() {
  applyTheme();
}

window.themesEngine = { applyTheme };
