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
      const theme = document.documentElement.getAttribute('data-theme');
      if (theme === 'nexus') {
        window.gridNexus?.start();
      } else if (theme === 'nebula') {
        window.gridNebula?.start();
      } else if (theme === 'forge') {
        window.gridForge?.start();
      } else {
        window.gridBloom?.start();
      }
      go(getPage());
    });
  } else {
    const theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'nexus') {
      window.gridNexus?.start();
    } else if (theme === 'nebula') {
      window.gridNebula?.start();
    } else if (theme === 'forge') {
      window.gridForge?.start();
    } else {
      window.gridBloom?.start();
    }
    go(getPage());
  }
});
