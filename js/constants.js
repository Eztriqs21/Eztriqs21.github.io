export const SUBJECTS = {
  physics: {
    label: 'Physics',
    icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    color: 'var(--primary)'
  },
  chemistry: {
    label: 'Chemistry',
    icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6v11l4 5H5l4-5V3z"/><line x1="9" y1="3" x2="15" y2="3"/></svg>',
    color: 'var(--secondary)'
  },
  maths: {
    label: 'Maths',
    icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20L20 4"/><path d="M15 4h5v5"/><path d="M4 20l5-5"/></svg>',
    color: 'var(--accent)'
  }
};

export const JEE_SCORING = {
  mcq: { correct: 4, wrong: -1, unattempted: 0 },
  integer: { correct: 4, wrong: 0, unattempted: 0 },
  multiCorrect: { correct: 4, partial: [3, 2, 1], wrong: -2, unattempted: 0 }
};

export const COLORS = {
  physics: '#6366f1',
  chemistry: '#22c55e',
  maths: '#f59e0b'
};

export const SECTION_WEIGHTS = {
  physics: { easy: 2, medium: 3, hard: 5 },
  chemistry: { easy: 2, medium: 3, hard: 5 },
  maths: { easy: 2, medium: 3, hard: 5 }
};

window.constants = { SUBJECTS, JEE_SCORING, COLORS, SECTION_WEIGHTS };
