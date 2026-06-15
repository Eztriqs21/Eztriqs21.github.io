// js/app.js — Entry point for JEE HQ
// Imports all modules and initializes the app

import './data.js'
import './helpers.js'
import './nav.js'
import './supabase-sync.js'

// Page modules — each registers its render function
import './page-js/dashboard.js'
import './page-js/chapters.js'
import './page-js/notes.js'
import './page-js/assignments.js'
import './page-js/tests.js'
import './page-js/calculator.js'
import './page-js/mock-tests.js'
import './page-js/analytics.js'
import './page-js/revision.js'
import './page-js/pyq-research.js'
import './page-js/doubt-solver.js'
import './page-js/score-analytics.js'
import './page-js/personalized-prep.js'
import './page-js/study-log.js'

document.addEventListener('DOMContentLoaded', () => {
  render()
})
