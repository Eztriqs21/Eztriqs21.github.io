// js/data.js — Mock data for UI-only variant
(function() {
  // Mock chapters data
  const chapters = {
    physics: [
      { id: 'p1', name: 'Physical World, Units & Measurements', completed: true, strength: 'strong', mainsPyqDone: true, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'p2', name: 'Motion in a Straight Line', completed: true, strength: 'strong', mainsPyqDone: true, advPyqDone: true, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'p3', name: 'Motion in a Plane', completed: true, strength: 'decent', mainsPyqDone: true, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'p4', name: 'Laws of Motion', completed: true, strength: 'strong', mainsPyqDone: true, advPyqDone: true, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'p5', name: 'Work, Energy & Power', completed: true, strength: 'decent', mainsPyqDone: true, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'p6', name: 'System of Particles & Rotational Motion', completed: false, strength: 'weak', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'p7', name: 'Gravitation', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'p8', name: 'Mechanical Properties of Solids', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'p9', name: 'Thermal Properties of Matter', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'p10', name: 'Thermodynamics', completed: false, strength: 'weak', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'p11', name: 'Kinetic Theory', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'p12', name: 'Oscillations & Waves', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'p13', name: 'Electric Charges & Fields', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'p14', name: 'Electrostatic Potential & Capacitance', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'p15', name: 'Current Electricity', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'p16', name: 'Moving Charges & Magnetism', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'p17', name: 'Electromagnetic Induction', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'p18', name: 'Alternating Current', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'p19', name: 'Electromagnetic Waves', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'p20', name: 'Ray Optics & Optical Instruments', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'p21', name: 'Wave Optics', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'p22', name: 'Dual Nature of Radiation & Matter', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'p23', name: 'Atoms & Nuclei', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'p24', name: 'Semiconductor Electronics', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'p25', name: 'Communication Systems', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] }
    ],
    chemistry: [
      { id: 'c1', name: 'Some Basic Concepts of Chemistry', completed: true, strength: 'strong', mainsPyqDone: true, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'c2', name: 'Structure of Atom', completed: true, strength: 'strong', mainsPyqDone: true, advPyqDone: true, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'c3', name: 'Classification of Elements', completed: true, strength: 'decent', mainsPyqDone: true, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'c4', name: 'Chemical Bonding & Molecular Structure', completed: true, strength: 'strong', mainsPyqDone: true, advPyqDone: true, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'c5', name: 'States of Matter', completed: true, strength: 'decent', mainsPyqDone: true, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'c6', name: 'Thermodynamics', completed: false, strength: 'weak', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'c7', name: 'Equilibrium', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'c8', name: 'Redox Reactions', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'c9', name: 'Hydrogen & s-Block Elements', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'c10', name: 'p-Block Elements (I)', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'c11', name: 'Organic Chemistry — Basics', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'c12', name: 'Hydrocarbons', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'c13', name: 'The Solid State', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'c14', name: 'Solutions', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'c15', name: 'Electrochemistry', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'c16', name: 'Chemical Kinetics', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'c17', name: 'Surface Chemistry', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'c18', name: 'p-Block Elements (II)', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'c19', name: 'd- and f-Block Elements', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'c20', name: 'Coordination Compounds', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'c21', name: 'Haloalkanes & Haloarenes', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'c22', name: 'Alcohols, Phenols & Ethers', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'c23', name: 'Aldehydes, Ketones & Carboxylic Acids', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'c24', name: 'Amines', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'c25', name: 'Biomolecules & Polymers', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] }
    ],
    maths: [
      { id: 'm1', name: 'Sets, Relations & Functions', completed: true, strength: 'strong', mainsPyqDone: true, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'm2', name: 'Trigonometric Functions', completed: true, strength: 'strong', mainsPyqDone: true, advPyqDone: true, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'm3', name: 'Complex Numbers & Quadratic Equations', completed: true, strength: 'decent', mainsPyqDone: true, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'm4', name: 'Linear Inequalities', completed: true, strength: 'strong', mainsPyqDone: true, advPyqDone: true, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'm5', name: 'Permutations & Combinations', completed: true, strength: 'decent', mainsPyqDone: true, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'm6', name: 'Binomial Theorem', completed: false, strength: 'weak', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'm7', name: 'Sequences & Series', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'm8', name: 'Straight Lines & Conic Sections', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'm9', name: '3D Geometry Basics', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'm10', name: 'Limits & Derivatives', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'm11', name: 'Mathematical Reasoning & Statistics', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'm12', name: 'Probability (Basics)', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'm13', name: 'Inverse Trigonometric Functions', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'm14', name: 'Matrices & Determinants', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'm15', name: 'Continuity & Differentiability', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'm16', name: 'Applications of Derivatives', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'm17', name: 'Integrals', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'm18', name: 'Applications of Integrals', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'm19', name: 'Differential Equations', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'm20', name: 'Vector Algebra', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'm21', name: 'Three Dimensional Geometry', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'm22', name: 'Linear Programming', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] },
      { id: 'm23', name: 'Probability (Advanced)', completed: false, strength: 'uncovered', mainsPyqDone: false, advPyqDone: false, notes: { detailed: [], revision: [] }, subTopics: [] }
    ]
  };

  // Mock assignments
  const assignments = [
    { id: 'a1', title: 'Physics DPP — Rotational Motion', description: 'Solve all 25 problems.', priority: 'high', completed: false, attachments: [], createdAt: new Date(Date.now() - 86400000).toISOString() }
  ];

  // Mock tests
  const tests = [
    {
      id: 't1',
      name: 'Full Mock Test #1',
      date: new Date(Date.now() - 604800000).toISOString(),
      physics: { correct: 18, incorrect: 5, unattempted: 2 },
      chemistry: { correct: 20, incorrect: 3, unattempted: 2 },
      maths: { correct: 15, incorrect: 7, unattempted: 3 },
      totalScore: 212,
      maxScore: 300,
      papers: [],
      timing: { total: 175, physics: 55, chemistry: 45, maths: 75 },
      syllabus: { physics: ['p1', 'p2', 'p3'], chemistry: ['c1', 'c2'], maths: ['m1', 'm2'] }
    },
    {
      id: 't2',
      name: 'Full Mock Test #2',
      date: new Date(Date.now() - 518400000).toISOString(),
      physics: { correct: 20, incorrect: 4, unattempted: 1 },
      chemistry: { correct: 22, incorrect: 2, unattempted: 1 },
      maths: { correct: 18, incorrect: 5, unattempted: 2 },
      totalScore: 244,
      maxScore: 300,
      papers: [],
      timing: { total: 170, physics: 50, chemistry: 40, maths: 80 },
      syllabus: { physics: ['p4', 'p5'], chemistry: ['c3', 'c4'], maths: ['m3', 'm4'] }
    }
  ];

  // Mock study logs
  const studyLogs = [
    { id: 'sl1', subject: 'Physics', topic: 'Rotational Motion', duration: 2.5, date: new Date(Date.now() - 86400000).toISOString().split('T')[0], createdAt: new Date().toISOString() },
    { id: 'sl2', subject: 'Chemistry', topic: 'Chemical Bonding', duration: 1.8, date: new Date(Date.now() - 172800000).toISOString().split('T')[0], createdAt: new Date().toISOString() },
    { id: 'sl3', subject: 'Maths', topic: 'Trigonometry', duration: 2.0, date: new Date(Date.now() - 259200000).toISOString().split('T')[0], createdAt: new Date().toISOString() },
    { id: 'sl4', subject: 'Physics', topic: 'Laws of Motion', duration: 1.5, date: new Date(Date.now() - 345600000).toISOString().split('T')[0], createdAt: new Date().toISOString() },
    { id: 'sl5', subject: 'Chemistry', topic: 'Atomic Structure', duration: 2.2, date: new Date(Date.now() - 432000000).toISOString().split('T')[0], createdAt: new Date().toISOString() }
  ];

  // Mock data object
  window.DB = {
    chapters: chapters,
    assignments: assignments,
    tests: tests,
    studyLogs: studyLogs,
    mockTests: []
  };

  // Helper functions
  window.sv = function(key) {
    // Mock save function - does nothing in UI-only variant
    console.log('Mock save:', key);
  };

  window.findCh = function(subj, id) {
    return window.DB.chapters[subj]?.find(c => c.id === id);
  };
})();