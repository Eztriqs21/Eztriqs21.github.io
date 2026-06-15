// js/app.js — Entry point for JEE HQ
import { render } from './nav.js';
import { load } from './data.js';
import { loadSupaConfig } from './supabase-sync.js';

// Page modules — each registers its render function on window
import '../page-js/dashboard.js';
import '../page-js/chapters.js';
import '../page-js/notes.js';
import '../page-js/assignments.js';
import '../page-js/tests.js';
import '../page-js/calculator.js';
import '../page-js/mock-tests.js';
import '../page-js/analytics.js';
import '../page-js/revision.js';
import '../page-js/pyq-research.js';
import '../page-js/doubt-solver.js';
import '../page-js/score-analytics.js';
import '../page-js/personalized-prep.js';
import '../page-js/study-log.js';

document.addEventListener('DOMContentLoaded', () => {
  load();
  loadSupaConfig();
  render();
});
