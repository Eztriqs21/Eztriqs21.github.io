// js/app.js — Entry point for JEE HQ
import { DB, sv, load, findCh, KEYS } from './data.js';
import { loadSupaConfig } from './supabase-sync.js';
import { initThemes } from './themes.js';
import { initInteractions, animateAllEntrance, initScrollAnimations, cleanupScrollAnimations } from './animations.js';
import { go, getPage, render } from './nav.js';
import { om, cm, toast, pvFile, animateAllCounters } from './helpers.js';
import './ai-service.js';

// Bridge: expose data layer to window for page module IIFEs
window.DB = DB;
window.sv = sv;
window.findCh = findCh;
window.KEYS = KEYS;
window.om = om;
window.cm = cm;
window.toast = toast;
window.pvFile = pvFile;
window.animateAllCounters = animateAllCounters;
window.animateAllEntrance = animateAllEntrance;
window.initScrollAnimations = initScrollAnimations;
window.cleanupScrollAnimations = cleanupScrollAnimations;

function bootApp() {
  try { initThemes(); } catch(e) { console.error('initThemes error:', e); }
  try { initInteractions(); } catch(e) { console.error('initInteractions error:', e); }
  try { load(); } catch(e) { console.error('load error:', e); }
  try { loadSupaConfig(); } catch(e) { console.error('loadSupaConfig error:', e); }

  function onComplete() {
    try { window.gridGold?.start(); } catch(e) { console.error('grid start error:', e); }
    try { go(getPage()); } catch(e) { console.error('go error:', e); }
  }

  if (window.preloaderEngine) {
    window.preloaderEngine.run(onComplete);
  } else {
    onComplete();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootApp);
} else {
  bootApp();
}
