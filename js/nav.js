// js/nav.js — Hash-based SPA navigation (matches jee-hq-v2 exactly)
import { callPageRenderer, PAGE_TITLES } from './page-registry.js';
import { animateAllCounters } from './helpers.js';
import { shouldAnimate, initScrollAnimations, cleanupScrollAnimations } from './animations.js';

export let PAGE = 'dashboard';

let _renderLock = false;
let _lastPage = null;
let _pendingPage = null;
let _pageSwapTimer = null;
let _pageEnterTimer = null;

export function getPage() {
  return window.location.hash.replace('#/', '') || 'dashboard';
}

export function go(page) {
  if (_renderLock) { _pendingPage = page; return; }
  if (page === _lastPage && page === PAGE && !window._forceRerender) return;
  window._forceRerender = false;
  PAGE = page;
  window.PAGE = page;

  document.querySelectorAll('.nav-item.active, .bni.active').forEach(el => el.classList.remove('active'));
  const navEl = document.querySelector(`.nav-item[href="#/${page}"], .bni[href="#/${page}"]`);
  if (navEl) navEl.classList.add('active');

  const info = PAGE_TITLES[page] || PAGE_TITLES.dashboard;
  const pageTitle = document.getElementById('page-title');
  const pageSubtitle = document.getElementById('page-subtitle');
  if (pageTitle) {
    pageTitle.textContent = info.title;
    pageTitle.setAttribute('data-text', info.title);
  }
  if (pageSubtitle) pageSubtitle.textContent = info.sub;

  closeSidebar();
  render();
}

export function render() {
  if (_renderLock) return;
  _renderLock = true;
  const el = document.getElementById('content-wrap');
  if (!el) { _renderLock = false; return; }

  if (_pageSwapTimer) { clearTimeout(_pageSwapTimer); _pageSwapTimer = null; }
  if (_pageEnterTimer) { clearTimeout(_pageEnterTimer); _pageEnterTimer = null; }

  if (shouldAnimate() && _lastPage) {
    el.classList.add('page-exit');
    _pageSwapTimer = setTimeout(function() {
      _renderSwap(el);
    }, 160);
  } else {
    _renderSwap(el);
  }
}

function _renderSwap(el) {
  if (!el) { _renderLock = false; return; }

  el.classList.remove('page-exit');
  el.innerHTML = '';
  try {
    if (!callPageRenderer(PAGE, el)) {
      el.innerHTML = '<div style="padding:40px;text-align:center;color:var(--muted)">Page not found</div>';
    }
  } catch (err) {
    console.error('Render error for page:', PAGE, err);
    el.innerHTML = '<div style="padding:40px;text-align:center;color:var(--muted)"><div style="font-size:18px;font-weight:700;margin-bottom:8px">Something went wrong</div><div style="font-size:13px">' + (err.message || '').replace(/</g, '&lt;') + '</div></div>';
  }

  if (shouldAnimate()) {
    el.classList.add('page-enter');
    _pageEnterTimer = setTimeout(function() {
      el.classList.remove('page-enter');
      initScrollAnimations(el);
      _finishRender(el);
    }, 220);
  } else {
    el.style.opacity = '1';
    initScrollAnimations(el);
    _finishRender(el);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function _finishRender(el) {
  _renderLock = false;
  _lastPage = PAGE;
  setTimeout(function() { if (el) animateAllCounters(el); }, 50);
  if (_pendingPage && _pendingPage !== PAGE) {
    var pp = _pendingPage;
    _pendingPage = null;
    go(pp);
  }
}

/* SIDEBAR */
let _sbOpen = false;

export function toggleSidebar() {
  _sbOpen = !_sbOpen;
  const sb = document.getElementById('sidebar');
  const ov = document.getElementById('mob-overlay');
  const hamburger = document.getElementById('hamburger');
  if (hamburger) hamburger.setAttribute('aria-expanded', _sbOpen);
  if (_sbOpen) {
    if (sb) sb.classList.add('open');
    if (ov) { ov.classList.add('open'); ov.style.cssText = 'display:block;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:99;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);'; }
    document.body.style.overflow = 'hidden';
  } else {
    closeSidebar();
  }
}

export function closeSidebar() {
  _sbOpen = false;
  const sb = document.getElementById('sidebar');
  const ov = document.getElementById('mob-overlay');
  if (sb) sb.classList.remove('open');
  if (ov) { ov.classList.remove('open'); ov.style.display = 'none'; }
  document.body.style.overflow = '';
}

(function () {
  const ov = document.getElementById('mob-overlay');
  if (ov) ov.addEventListener('click', function (e) { e.preventDefault(); closeSidebar(); });
  const hamburger = document.getElementById('hamburger');
  if (hamburger) hamburger.addEventListener('click', toggleSidebar);
})();

/* HASH CHANGE */
window.addEventListener('hashchange', () => go(getPage()));

/* CLEAR RENDER TIMERS — called by _refreshPage() in modal-handlers.js */
function clearRenderTimers() {
  if (_pageSwapTimer) { clearTimeout(_pageSwapTimer); _pageSwapTimer = null; }
  if (_pageEnterTimer) { clearTimeout(_pageEnterTimer); _pageEnterTimer = null; }
  _renderLock = false;
}
window._clearRenderTimers = clearRenderTimers;

/* WINDOW EXPORTS */
window.PAGE = PAGE;
window.go = go;
window.render = render;
window.toggleSidebar = toggleSidebar;
window.closeSidebar = closeSidebar;
