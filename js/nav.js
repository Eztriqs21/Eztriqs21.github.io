// js/nav.js — Hash-based SPA navigation
import { callPageRenderer, PAGE_TITLES } from './page-registry.js';
import { animateAllCounters } from './helpers.js';
import { pageExit, pageEnter, shouldAnimate, animateAllEntrance } from './animations.js';

export let PAGE = 'dashboard';

let _renderLock = false;
let _lastPage = null;
let _pendingPage = null;

export function getPage() {
  return window.location.hash.replace('#/', '') || 'dashboard';
}

export function go(page) {
  if (_renderLock) { _pendingPage = page; return; }
  PAGE = page;
  window.PAGE = page;

  document.querySelectorAll('.nav-item, .bni').forEach(el => el.classList.remove('active'));
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

  // Safety: reset lock after 5s if something goes wrong
  const safetyTimer = setTimeout(() => { _renderLock = false; }, 5000);

  if (shouldAnimate()) {
    pageExit(el).then(() => {
      clearTimeout(safetyTimer);
      _renderSwap(el);
    }).catch(() => {
      clearTimeout(safetyTimer);
      _renderSwap(el);
    });
  } else {
    clearTimeout(safetyTimer);
    _renderSwap(el);
  }
}

function _renderSwap(el) {
  if (!el) return;
  el.innerHTML = '';
  _renderLock = false;
  try {
    if (!callPageRenderer(PAGE, el)) {
      el.innerHTML = '<div style="padding:40px;text-align:center;color:var(--muted)">Page not found</div>';
    }
  } catch (err) {
    console.error('Render error for page:', PAGE, err);
    el.innerHTML = '<div style="padding:40px;text-align:center;color:var(--muted)"><div style="font-size:18px;font-weight:700;margin-bottom:8px">Something went wrong</div><div style="font-size:13px">' + (err.message || '').replace(/</g, '&lt;') + '</div></div>';
  }

  if (shouldAnimate()) {
    pageEnter(el).then(() => {
      animateAllEntrance(el);
      _renderLock = false;
      _lastPage = PAGE;
      setTimeout(() => animateAllCounters(el), 50);
      if (_pendingPage && _pendingPage !== PAGE) { var pp = _pendingPage; _pendingPage = null; go(pp); }
    }).catch(() => {
      el.style.opacity = '1';
      animateAllEntrance(el);
      _renderLock = false;
      _lastPage = PAGE;
      setTimeout(() => animateAllCounters(el), 50);
      if (_pendingPage && _pendingPage !== PAGE) { var pp = _pendingPage; _pendingPage = null; go(pp); }
    });
    // Safety: ensure content visible even if pageEnter hangs
    setTimeout(() => {
      el.style.opacity = '1';
      animateAllEntrance(el);
    }, 2000);
  } else {
    el.offsetHeight;
    el.style.opacity = '1';
    animateAllEntrance(el);
    _renderLock = false;
    _lastPage = PAGE;
    setTimeout(() => animateAllCounters(el), 50);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
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

/* WINDOW EXPORTS */
window.PAGE = PAGE;
window.go = go;
window.render = render;
window.toggleSidebar = toggleSidebar;
window.closeSidebar = closeSidebar;
