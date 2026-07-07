export const PAGE_RENDERERS = {
  dashboard: 'renderDashboard',
  chapters: 'renderChapters',
  tests: 'renderTests',
  analytics: 'renderAnalytics',
  calculator: 'renderCalculator',
  assignments: 'renderAssignments',
  'mock-tests': 'renderMockTests',
  school: 'renderSchool'
};

export const PAGE_TITLES = {
  dashboard: { title: 'Dashboard', sub: 'Your JEE preparation intelligence dashboard' },
  chapters: { title: 'Chapters', sub: 'Syllabus mastery & tracking' },
  tests: { title: 'Tests', sub: 'Test history and performance analysis' },
  analytics: { title: 'Analytics', sub: 'Performance insights and detailed breakdown' },
  calculator: { title: 'Calculator', sub: 'Full JEE mock evaluation engine' },
  assignments: { title: 'Assignments', sub: 'Task management & tracking' },
  'mock-tests': { title: 'Mock Tests', sub: 'Full-length practice exams' },
  school: { title: 'School', sub: 'Visual folder graph for test materials' }
};

export function callPageRenderer(page, el) {
  const fnName = PAGE_RENDERERS[page];
  if (fnName && typeof window[fnName] === 'function') {
    window[fnName](el);
    return true;
  }
  return false;
}
