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

document.addEventListener('DOMContentLoaded', () => {
  initThemes();
  initInteractions();
  load();
  loadSupaConfig();

  if (window.preloaderEngine) {
    window.preloaderEngine.run(() => {
      window.gridObsidian?.start();
      go(getPage());
    });
  } else {
    window.gridObsidian?.start();
    go(getPage());
  }
});
