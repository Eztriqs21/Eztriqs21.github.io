// js/pages/assignments.js — Assignments page renderer (Nexus & Bloom)
(function() {
  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function fmtDate(d) { return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }); }
  function safePct(a, b) { return b > 0 ? Math.round((a / b) * 100) : 0; }
  function getTheme() { return document.documentElement.getAttribute('data-theme') || 'nexus'; }
  function pfx() { return getTheme() === 'nexus' ? 'nx' : 'bl'; }

  const PRIORITY = {
    high:   { label: 'High',   color: 'var(--danger)',   bg: 'rgba(239,68,68,0.1)' },
    medium: { label: 'Medium', color: 'var(--accent)', bg: 'rgba(245,158,11,0.1)' },
    low:    { label: 'Low',    color: 'var(--success)',  bg: 'rgba(34,197,94,0.1)' }
  };

  const MOCK_ASSIGNMENTS = [
    { id: 'a1', title: 'Physics DPP — Rotational Motion', description: 'Solve all 25 problems from the DPP packet. Focus on moment of inertia and torque problems.', priority: 'high', completed: false, createdAt: new Date(Date.now() - 86400000).toISOString(), dueDate: new Date(Date.now() + 86400000 * 2).toISOString() },
    { id: 'a2', title: 'Chemistry Worksheet — Equilibrium', description: 'Complete numerical problems on ionic equilibrium and Le Chatelier\'s principle.', priority: 'medium', completed: false, createdAt: new Date(Date.now() - 172800000).toISOString(), dueDate: new Date(Date.now() + 86400000 * 4).toISOString() },
    { id: 'a3', title: 'Maths DPP — Permutations & Combinations', description: 'Solve advanced level problems including circular arrangements and derangements.', priority: 'high', completed: true, createdAt: new Date(Date.now() - 259200000).toISOString(), dueDate: new Date(Date.now() - 86400000).toISOString() },
    { id: 'a4', title: 'Physics — HC Verma Ch.6 Problems', description: 'Attempt selected problems from Work, Energy & Power chapter.', priority: 'low', completed: true, createdAt: new Date(Date.now() - 345600000).toISOString(), dueDate: new Date(Date.now() - 172800000).toISOString() },
    { id: 'a5', title: 'Chemistry — Organic Reaction Mechanisms', description: 'Practice SN1 and SN2 reaction mechanisms with substrate identification.', priority: 'medium', completed: false, createdAt: new Date(Date.now() - 86400000).toISOString(), dueDate: new Date(Date.now() + 86400000 * 5).toISOString() }
  ];

  function assignmentCard(a, index) {
    const p = pfx();
    const pr = PRIORITY[a.priority] || PRIORITY.medium;
    const daysLeft = Math.ceil((new Date(a.dueDate) - new Date()) / 86400000);
    const dueLabel = a.completed ? 'Completed' : daysLeft < 0 ? 'Overdue' : daysLeft === 0 ? 'Due today' : 'Due in ' + daysLeft + 'd';
    const dueColor = a.completed ? 'var(--success)' : daysLeft < 0 ? 'var(--danger)' : daysLeft <= 1 ? 'var(--accent)' : 'var(--muted)';

    return `<div class="${p}-card anim-entrance" style="--delay:${index * 0.06}s;padding:0;overflow:hidden">
      <div style="display:flex;align-items:stretch">
        <div style="width:4px;background:${pr.color};flex-shrink:0;border-radius:4px 0 0 4px"></div>
        <div style="flex:1;padding:18px">
          <div style="display:flex;align-items:flex-start;gap:12px">
            <div class="${p}-chapter-check ${a.completed ? 'done' : ''}" style="margin-top:2px;cursor:pointer" onclick="event.stopPropagation()">
              ${a.completed ? '<svg width="11" height="11" viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/></svg>' : ''}
            </div>
            <div style="flex:1">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
                <div style="font-size:14px;font-weight:600;${a.completed ? 'text-decoration:line-through;opacity:0.5' : ''}">${esc(a.title)}</div>
                <span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px;background:${pr.bg};color:${pr.color}">${pr.label}</span>
              </div>
              <div style="font-size:12px;color:var(--muted);line-height:1.5;margin-bottom:10px">${esc(a.description)}</div>
              <div style="display:flex;align-items:center;gap:12px;font-size:11px;color:${dueColor}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                ${dueLabel}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }

  function emptyState() {
    const p = pfx();
    return `<div class="${p}-empty" style="padding:48px 0">
      <div class="${p}-empty-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
      <div class="${p}-empty-title">No assignments yet</div>
      <div class="${p}-empty-sub">Create your first assignment to start tracking tasks</div>
    </div>`;
  }

  window.renderAssignments = function(el) {
    const p = pfx();
    const DB = window.DB;
    const all = MOCK_ASSIGNMENTS;
    const pending = all.filter(a => !a.completed);
    const done = all.filter(a => a.completed);
    const overdue = pending.filter(a => new Date(a.dueDate) < new Date());
    const highPri = pending.filter(a => a.priority === 'high');

    el.innerHTML = `
    <div class="${p}-page-header anim-entrance">
      <div class="${p}-page-title" data-text="Assignments">Assignments</div>
      <div class="${p}-page-sub">Task management & tracking</div>
    </div>
    <div class="${p}-stats-grid anim-entrance" style="--delay:0.1s">
      <div class="${p}-stat-card">
        <div class="${p}-stat-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
        <div class="${p}-stat-val"><span data-count="${pending.length}">0</span></div>
        <div class="${p}-stat-label">Pending</div>
        <div class="${p}-stat-sub">Active tasks</div>
      </div>
      <div class="${p}-stat-card">
        <div class="${p}-stat-icon" style="color:var(--danger)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
        <div class="${p}-stat-val" style="color:var(--danger)"><span data-count="${overdue.length}">0</span></div>
        <div class="${p}-stat-label">Overdue</div>
        <div class="${p}-stat-sub">Need attention</div>
      </div>
      <div class="${p}-stat-card">
        <div class="${p}-stat-icon" style="color:var(--success)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
        <div class="${p}-stat-val" style="color:var(--success)"><span data-count="${done.length}">0</span></div>
        <div class="${p}-stat-label">Completed</div>
        <div class="${p}-stat-sub">${all.length > 0 ? safePct(done.length, all.length) : 0}% completion</div>
      </div>
    </div>
    ${all.length === 0 ? emptyState() : `
    <div class="${p}-section-block anim-entrance" style="--delay:0.2s">
      <div class="${p}-section-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Pending (${pending.length})</div>
      <div style="display:flex;flex-direction:column;gap:12px">
        ${pending.map((a, i) => assignmentCard(a, i)).join('')}
      </div>
    </div>
    <div class="${p}-section-block anim-entrance" style="--delay:0.3s">
      <div class="${p}-section-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Completed (${done.length})</div>
      <div style="display:flex;flex-direction:column;gap:12px">
        ${done.length === 0
          ? `<div class="${p}-empty" style="padding:24px"><div class="${p}-empty-sub">No completed assignments yet</div></div>`
          : done.map((a, i) => assignmentCard(a, i)).join('')}
      </div>
    </div>`}`;
  };
})();
