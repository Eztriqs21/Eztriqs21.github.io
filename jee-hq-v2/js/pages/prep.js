// js/pages/prep.js — Prep Chat page renderer (Nexus & Bloom)
(function() {
  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function fmtDate(d) { return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }); }
  function safePct(a, b) { return b > 0 ? Math.round((a / b) * 100) : 0; }
  function getTheme() { return document.documentElement.getAttribute('data-theme') || 'nexus'; }
  function pfx() { return getTheme() === 'nexus' ? 'nx' : 'bl'; }

  const MOCK_CHAT = [
    { from: 'ai', text: 'Welcome! I\'m your JEE prep assistant. Based on your current progress, I\'ve analyzed your performance and created a personalized study plan. Let me show you what I recommend.', time: new Date(Date.now() - 7200000).toISOString() },
    { from: 'user', text: 'What should I focus on this week?', time: new Date(Date.now() - 7100000).toISOString() },
    { from: 'ai', text: 'Looking at your data:\n\n• Physics: You\'re weakest in Rotational Motion (30% mastery). Prioritize this.\n• Chemistry: Chemical Bonding needs revision (70% mastery).\n• Maths: Trigonometric Functions are strong (88%) — maintain with quick reviews.\n\nI recommend spending 2.5h/day on Physics, 1.5h on Chemistry, and 1h on Maths.', time: new Date(Date.now() - 7000000).toISOString() }
  ];

  const STUDY_PLANS = [
    { subject: 'Physics', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>', topic: 'Rotational Motion', hours: 2.5, priority: 'high', reason: 'Weakest area — 30% mastery' },
    { subject: 'Chemistry', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6v11l4 5H5l4-5V3z"/><line x1="9" y1="3" x2="15" y2="3"/></svg>', topic: 'Chemical Bonding', hours: 1.5, priority: 'medium', reason: 'Needs revision — 70% mastery' },
    { subject: 'Maths', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20L20 4"/><path d="M15 4h5v5"/><path d="M4 20l5-5"/></svg>', topic: 'Permutations & Combinations', hours: 1.0, priority: 'medium', reason: 'Advanced problems need practice' }
  ];

  function chatBubble(msg) {
    const p = pfx();
    const isUser = msg.from === 'user';
    return `<div class="${p}-chat-bubble ${isUser ? 'user' : 'ai'}" style="align-self:${isUser ? 'flex-end' : 'flex-start'};max-width:85%">
      <div style="font-size:13px;line-height:1.6;white-space:pre-line">${esc(msg.text)}</div>
      <div style="font-size:10px;color:var(--muted);margin-top:4px;text-align:${isUser ? 'right' : 'left'}">${new Date(msg.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
    </div>`;
  }

  function planCard(plan, index) {
    const p = pfx();
    const priColors = { high: 'var(--danger)', medium: 'var(--accent)', low: 'var(--success)' };
    const priBg = { high: 'rgba(239,68,68,0.1)', medium: 'rgba(245,158,11,0.1)', low: 'rgba(34,197,94,0.1)' };
    return `<div class="${p}-card anim-entrance" style="--delay:${index * 0.08}s;padding:14px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <div style="width:32px;height:32px;border-radius:8px;background:var(--border);display:flex;align-items:center;justify-content:center">${plan.icon}</div>
        <div style="flex:1">
          <div style="font-size:13px;font-weight:600">${esc(plan.topic)}</div>
          <div style="font-size:11px;color:var(--muted)">${esc(plan.subject)}</div>
        </div>
        <div style="font-size:10px;padding:2px 8px;border-radius:12px;background:${priBg[plan.priority]};color:${priColors[plan.priority]};font-weight:600">${plan.priority}</div>
      </div>
      <div style="font-size:11px;color:var(--muted);margin-bottom:8px">${esc(plan.reason)}</div>
      <div style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:var(--accent)">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        ${plan.hours}h recommended
      </div>
    </div>`;
  }

  window.renderPrep = function(el) {
    const p = pfx();
    const totalHours = STUDY_PLANS.reduce((s, plan) => s + plan.hours, 0);

    el.innerHTML = `
    <div class="${p}-page-header anim-entrance">
      <div class="${p}-page-title" data-text="Prep Chat">Prep Chat</div>
      <div class="${p}-page-sub">Personalized study planning</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 300px;gap:16px" class="${p}-prep-layout anim-entrance">
      <div class="${p}-card" style="padding:0;overflow:hidden;display:flex;flex-direction:column;height:calc(100vh - 200px);min-height:400px">
        <div style="padding:14px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px">
          <div style="width:8px;height:8px;border-radius:50%;background:var(--success)"></div>
          <span style="font-size:13px;font-weight:600">AI Study Planner</span>
          <span style="font-size:11px;color:var(--muted);margin-left:auto">Online</span>
        </div>
        <div style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px">
          ${MOCK_CHAT.map(m => chatBubble(m)).join('')}
        </div>
        <div style="padding:12px 16px;border-top:1px solid var(--border);display:flex;gap:10px">
          <input class="${p}-input" type="text" placeholder="Ask about your study plan..." style="flex:1" disabled>
          <button class="${p}-btn" style="opacity:0.5" disabled>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
      <div>
        <div class="${p}-card anim-entrance" style="--delay:0.2s;padding:16px;margin-bottom:12px">
          <div style="font-size:13px;font-weight:600;margin-bottom:10px">Today's Plan</div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span style="font-size:22px;font-weight:700;color:var(--accent)">${totalHours}h</span>
            <span style="font-size:12px;color:var(--muted)">total study</span>
          </div>
          <div class="${p}-progress-wrap" style="height:5px"><div class="${p}-progress-bar" style="height:5px;width:${safePct(totalHours, 8) * 100 / 100}%"></div></div>
          <div style="font-size:11px;color:var(--muted);margin-top:4px">${safePct(totalHours, 8)}% of daily 8h target</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${STUDY_PLANS.map((plan, i) => planCard(plan, i)).join('')}
        </div>
      </div>
    </div>`;
  };
})();
