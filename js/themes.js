/* themes.js – 4-theme engine (nexus, bloom, nebula, forge) */
const themes = ['nexus', 'bloom', 'nebula', 'forge', 'aquatic'];
const themeNames = { nexus: 'NEXUS', bloom: 'BLOOM', nebula: 'NEBULA', forge: 'FORGE', aquatic: 'AQUATIC' };
let idx = parseInt(localStorage.getItem('themeIndex') || '0', 10);
if (!themes[idx]) idx = 0;

let _indicatorTimer = null;

const THEME_BG_IMAGES = {
  nexus: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=80',
  bloom: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80',
  nebula: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=80',
  forge: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1920&q=80',
  aquatic: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1920&q=80'
};

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

function loadThemeBackground(theme) {
  var overlay = document.getElementById('bg-image-overlay');
  if (!overlay) return;
  overlay.classList.remove('loaded');
  overlay.style.backgroundImage = 'url(' + THEME_BG_IMAGES[theme] + ')';
  var img = new Image();
  img.onload = function() {
    overlay.classList.add('loaded');
  };
  img.onerror = function() {
    overlay.classList.remove('loaded');
  };
  img.src = THEME_BG_IMAGES[theme];
}

export function applyTheme(i) {
  const t = themes[i];
  const prev = document.documentElement.getAttribute('data-theme');
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('themeIndex', i);
  idx = i;

  document.documentElement.removeAttribute('data-theme-transitioning');
  document.body.classList.remove('cursor-hover', 'cursor-click');

  loadThemeBackground(t);

  if (window.gridNexus) window.gridNexus.stop();
  if (window.gridBloom) window.gridBloom.stop();
  if (window.gridNebula) window.gridNebula.stop();
  if (window.gridForge) window.gridForge.stop();
  if (window.gridAquatic) window.gridAquatic.stop();

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
    } else if (t === 'forge' && window.gridForge) {
      window.gridForge.start();
      gridCanvas.classList.add('active');
    } else if (t === 'aquatic' && window.gridAquatic) {
      window.gridAquatic.start();
      gridCanvas.classList.add('active');
    }
  }

  var mouseCanvas = document.getElementById('mouse-particles');
  if (mouseCanvas) {
    var mCtx = mouseCanvas.getContext('2d');
    if (mCtx) mCtx.clearRect(0, 0, mouseCanvas.width, mouseCanvas.height);
  }

  requestAnimationFrame(function() {
    if (prev !== t && contentWrap) {
      window._forceRerender = true;
      var currentPage = document.querySelector('.nav-item.active');
      if (currentPage) currentPage.click();
    }
  });
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

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    applyTheme(i);
    showIndicator(themeNames[next]);
    return;
  }

  var washColors = {
    nexus: 'rgba(0,240,255,0.3)',
    bloom: 'rgba(107,144,128,0.3)',
    nebula: 'rgba(140,122,230,0.3)',
    forge: 'rgba(205,127,50,0.3)',
    aquatic: 'rgba(59,130,246,0.3)'
  };

  var wash = document.createElement('div');
  wash.className = 'theme-wash';
  wash.style.background = 'radial-gradient(circle, ' + (washColors[next] || washColors.nexus) + ', transparent 70%)';
  document.body.appendChild(wash);

  requestAnimationFrame(function() {
    wash.classList.add('active');
  });

  setTimeout(function() {
    applyTheme(i);
    showIndicator(themeNames[next]);
  }, 280);

  setTimeout(function() {
    if (wash.parentNode) wash.parentNode.removeChild(wash);
  }, 750);
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
