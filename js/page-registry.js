export const PAGE_RENDERERS = {
  dashboard: 'renderDashboard',
  chapters: 'renderChapters',
  tests: 'renderTests',
  analytics: 'renderAnalytics',
  calculator: 'renderCalculator',
  assignments: 'renderAssignments',
  'mock-tests': 'renderMockTests',
  revision: 'renderRevision',
  doubts: 'renderDoubts',
  notes: 'renderNotes',
  pyq: 'renderPYQ',
  'score-analytics': 'renderScoreAnalytics',
  'study-log': 'renderStudyLog'
};

export const PAGE_TITLES = {
  dashboard: { title: 'Dashboard', sub: 'Your JEE preparation intelligence dashboard' },
  chapters: { title: 'Chapters', sub: 'Syllabus mastery & tracking' },
  tests: { title: 'Tests', sub: 'Test history and performance analysis' },
  analytics: { title: 'Analytics', sub: 'Performance insights and study tracking' },
  calculator: { title: 'Calculator', sub: 'Full JEE mock evaluation engine' },
  assignments: { title: 'Assignments', sub: 'Task management & tracking' },
  'mock-tests': { title: 'Mock Tests', sub: 'Full-length practice exams' },
  revision: { title: 'Revision', sub: 'Quick revision & formula sheets' },
  doubts: { title: 'Doubt Solver', sub: 'AI-powered doubt resolution' },
  notes: { title: 'Notes', sub: 'Chapter-wise notes & resources' },
  pyq: { title: 'PYQ Research', sub: 'Previous year question analysis' },
  'score-analytics': { title: 'Score Analytics', sub: 'Detailed performance breakdown' },
  'study-log': { title: 'Study Log', sub: 'Track your study sessions' }
};

export function callPageRenderer(page, el) {
  const fnName = PAGE_RENDERERS[page];
  if (fnName && typeof window[fnName] === 'function') {
    window[fnName](el);
    return true;
  }
  return false;
}
