export const PAGE_RENDERERS = {
  dashboard: 'renderDashboard',
  analytics: 'renderAnalytics',
  revision: 'renderRevision',
  scoreanalytics: 'renderScoreAnalytics',
  chapters: 'renderChapters',
  notes: 'renderNotes',
  assignments: 'renderAssignments',
  tests: 'renderTests',
  calculator: 'renderCalculator',
  mocktests: 'renderMockTests',
  doubtsolver: 'renderDoubtSolver',
  pyq: 'renderPYQ',
  prep: 'renderPrep',
  studylog: 'openStudyLog'
};

export function callPageRenderer(page, el) {
  const fnName = PAGE_RENDERERS[page];
  if (fnName && typeof window[fnName] === 'function') {
    window[fnName](el);
    return true;
  }
  return false;
}
