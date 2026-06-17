// page-js/revision.js — Revision page (Nexus & Bloom)
(function() {
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML.replace(/'/g, '&#39;'); }
  function escAttr(s) { return String(s).replace(/&/g,'&amp;').replace(/'/g,'&#39;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function getTheme() { return document.documentElement.getAttribute('data-theme') || 'nexus'; }
  function pfx() { return getTheme() === 'nexus' ? 'nx' : 'bl'; }

  var REV_SYLLABUS = {
    physics: [
      { topic: 'Mechanics', subs: ['Units & Measurements', 'Kinematics', 'Laws of Motion', 'Work Energy & Power', 'Rotational Motion', 'Gravitation', 'Properties of Solids & Liquids', 'Thermodynamics', 'Kinetic Theory of Gases'] },
      { topic: 'Electrostatics', subs: ['Electric Charges & Fields', 'Electrostatic Potential & Capacitance'] },
      { topic: 'Current Electricity', subs: ['Current Electricity'] },
      { topic: 'Magnetism', subs: ['Moving Charges & Magnetism', 'Magnetism & Matter'] },
      { topic: 'EMI & AC', subs: ['Electromagnetic Induction', 'Alternating Current'] },
      { topic: 'Optics', subs: ['Ray Optics & Optical Instruments', 'Wave Optics'] },
      { topic: 'Modern Physics', subs: ['Dual Nature of Radiation & Matter', 'Atoms & Nuclei', 'Semiconductor Electronics'] },
      { topic: 'Waves & Sound', subs: ['Waves', 'Sound Waves'] }
    ],
    chemistry: [
      { topic: 'Physical Chemistry', subs: ['Some Basic Concepts', 'Structure of Atom', 'Classification of Elements', 'Chemical Bonding', 'States of Matter', 'Thermodynamics', 'Equilibrium', 'Redox Reactions', 'Electrochemistry', 'Chemical Kinetics', 'Surface Chemistry'] },
      { topic: 'Inorganic Chemistry', subs: ['Hydrogen', 's-Block Elements', 'p-Block (13-14)', 'p-Block (15-18)', 'd & f Block', 'Coordination Compounds', 'Environmental Chemistry'] },
      { topic: 'Organic Chemistry', subs: ['Organic Basic Principles', 'Hydrocarbons', 'Haloalkanes & Haloarenes', 'Alcohols Phenols & Ethers', 'Aldehydes Ketones & Carboxylic Acids', 'Amines', 'Biomolecules', 'Polymers', 'Chemistry in Everyday Life'] }
    ],
    maths: [
      { topic: 'Algebra', subs: ['Sets Relations & Functions', 'Complex Numbers', 'Linear Inequalities', 'Permutations & Combinations', 'Binomial Theorem', 'Sequences & Series', 'Matrices & Determinants'] },
      { topic: 'Trigonometry', subs: ['Trigonometric Functions', 'Trigonometric Equations', 'Inverse Trigonometric Functions'] },
      { topic: 'Coordinate Geometry', subs: ['Straight Lines', 'Conic Sections', '3D Geometry'] },
      { topic: 'Calculus', subs: ['Limits & Derivatives', 'Application of Derivatives', 'Integrals', 'Application of Integrals', 'Differential Equations'] },
      { topic: 'Vectors & 3D', subs: ['Vectors', 'Three Dimensional Geometry'] },
      { topic: 'Statistics & Probability', subs: ['Statistics', 'Probability'] }
    ]
  };

  var SUBJ_META = {
    physics: { label: 'Physics', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>' },
    chemistry: { label: 'Chemistry', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6v11l4 5H5l4-5V3z"/><line x1="9" y1="3" x2="15" y2="3"/></svg>' },
    maths: { label: 'Mathematics', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20L20 4"/><path d="M15 4h5v5"/><path d="M4 20l5-5"/></svg>' }
  };

  function revLoad() {
    var DB = window.DB;
    var existing = (DB && DB.revision && typeof DB.revision === 'object' && Object.keys(DB.revision).length > 0) ? DB.revision : {};
    var st = {};
    Object.keys(REV_SYLLABUS).forEach(function(subj) {
      st[subj] = {};
      REV_SYLLABUS[subj].forEach(function(g) { g.subs.forEach(function(s) { st[subj][s] = (existing[subj] || {})[s] || 0; }); });
    });
    return st;
  }

  function revSave(st) {
    var DB = window.DB;
    if (DB) DB.revision = st;
    if (window.sv) window.sv('revision');
  }

  window.renderRevision = function(el) {
    var p = pfx();
    var rev = revLoad();

    el.innerHTML =
    '<div class="' + p + '-page-header anim-entrance">' +
      '<div class="' + p + '-page-title" data-text="Revision">Revision</div>' +
      '<div class="' + p + '-page-sub">Quick revision & formula sheets — tap to toggle status</div>' +
    '</div>' +
    ['physics', 'chemistry', 'maths'].map(function(subjKey) {
      var info = SUBJ_META[subjKey];
      var groups = REV_SYLLABUS[subjKey];
      var allSubs = groups.reduce(function(acc, g) { return acc.concat(g.subs); }, []);
      var done = allSubs.filter(function(s) { return (rev[subjKey] || {})[s] === 1; }).length;
      var total = allSubs.length;
      var pct = total > 0 ? Math.round((done / total) * 100) : 0;

      return '<div class="' + p + '-section-block anim-entrance">' +
        '<div class="' + p + '-section-title">' + info.icon + ' ' + info.label + ' <span style="font-size:11px;color:var(--muted);margin-left:auto">' + done + '/' + total + ' (' + pct + '%)</span></div>' +
        '<div class="' + p + '-progress-wrap" style="height:4px;margin-bottom:12px"><div class="' + p + '-progress-bar" style="height:4px;width:' + pct + '%"></div></div>' +
        groups.map(function(g) {
          var gDone = g.subs.filter(function(s) { return (rev[subjKey] || {})[s] === 1; }).length;
          return '<div style="margin-bottom:12px">' +
            '<div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:6px">' + esc(g.topic) + ' <span style="font-size:10px;color:var(--muted)">(' + gDone + '/' + g.subs.length + ')</span></div>' +
            '<div style="display:flex;flex-wrap:wrap;gap:6px">' +
              g.subs.map(function(s) {
                var isDone = (rev[subjKey] || {})[s] === 1;
                var attrSubj = escAttr(subjKey);
                var attrTopic = escAttr(s);
                return '<button class="' + p + '-btn" style="font-size:11px;padding:4px 10px;' + (isDone ? 'background:rgba(34,197,94,0.15);color:var(--success);border:1px solid rgba(34,197,94,0.3)' : 'background:var(--border-card);color:var(--muted);border:1px solid var(--border)') + '" onclick="window._revToggle(\'' + attrSubj + '\',\'' + attrTopic + '\')">' +
                  (isDone ? '<svg width="10" height="10" viewBox="0 0 12 12" style="vertical-align:-1px"><polyline points="2,6 5,9 10,3" stroke="currentColor" stroke-width="2" fill="none"/></svg> ' : '') + esc(s) +
                '</button>';
              }).join('') +
            '</div>' +
          '</div>';
        }).join('') +
      '</div>';
    }).join('');
  };

  window._revToggle = function(subj, topic) {
    var rev = revLoad();
    if (!rev[subj]) rev[subj] = {};
    rev[subj][topic] = rev[subj][topic] === 1 ? 0 : 1;
    revSave(rev);
    window.renderRevision(document.getElementById('content-wrap'));
  };
})();
