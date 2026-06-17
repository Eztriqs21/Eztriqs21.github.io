// js/pages/doubts.js — Doubts page renderer (Nexus & Bloom)
(function() {
  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function fmtDate(d) { return new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }); }
  function safePct(a, b) { return b > 0 ? Math.round((a / b) * 100) : 0; }
  function getTheme() { return document.documentElement.getAttribute('data-theme') || 'nexus'; }
  function pfx() { return getTheme() === 'nexus' ? 'nx' : 'bl'; }

  const TABS = [
    { key: 'physics',   label: 'Physics',   icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>' },
    { key: 'chemistry', label: 'Chemistry', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6v11l4 5H5l4-5V3z"/><line x1="9" y1="3" x2="15" y2="3"/></svg>' },
    { key: 'maths',     label: 'Maths',     icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20L20 4"/><path d="M15 4h5v5"/><path d="M4 20l5-5"/></svg>' }
  ];

  const MOCK_MESSAGES = {
    physics: [
      { from: 'user', text: 'I\'m confused about the direction of friction in relative motion problems.', time: new Date(Date.now() - 3600000).toISOString() },
      { from: 'ai', text: 'Great question! In relative motion, friction acts to oppose the relative motion between surfaces. If block A is on block B, and B accelerates right, friction on A acts right (to reduce relative sliding). The key is: friction opposes the relative velocity, not the absolute motion.', time: new Date(Date.now() - 3500000).toISOString() }
    ],
    chemistry: [
      { from: 'user', text: 'What is the difference between SN1 and SN2 mechanisms?', time: new Date(Date.now() - 7200000).toISOString() },
      { from: 'ai', text: 'SN1 is a two-step mechanism with carbocation intermediate — rate depends only on substrate. SN2 is a single-step concerted mechanism with backside attack — rate depends on both substrate and nucleophile. SN1 gives racemization, SN2 gives inversion of configuration.', time: new Date(Date.now() - 7100000).toISOString() }
    ],
    maths: [
      { from: 'user', text: 'How do you solve permutation problems where objects must stay together?', time: new Date(Date.now() - 5400000).toISOString() },
      { from: 'ai', text: 'When objects must stay together, treat them as a single unit first. If n objects are to be arranged and k must be together, arrange (n-k+1) units in (n-k+1)! ways, then arrange the k objects within their unit in k! ways. Total = (n-k+1)! × k!', time: new Date(Date.now() - 5300000).toISOString() }
    ]
  };

  function messageBubble(msg) {
    const p = pfx();
    const isUser = msg.from === 'user';
    return `<div class="${p}-chat-bubble ${isUser ? 'user' : 'ai'}" style="align-self:${isUser ? 'flex-end' : 'flex-start'};max-width:80%">
      <div style="font-size:13px;line-height:1.6">${esc(msg.text)}</div>
      <div style="font-size:10px;color:var(--muted);margin-top:4px;text-align:${isUser ? 'right' : 'left'}">${new Date(msg.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
    </div>`;
  }

  let activeTab = 'physics';

  window.renderDoubts = function(el) {
    const p = pfx();
    const msgs = MOCK_MESSAGES[activeTab] || [];
    const tabCounts = {
      physics: MOCK_MESSAGES.physics.length,
      chemistry: MOCK_MESSAGES.chemistry.length,
      maths: MOCK_MESSAGES.maths.length
    };

    el.innerHTML = `
    <div class="${p}-page-header anim-entrance">
      <div class="${p}-page-title" data-text="Doubt Solver">Doubt Solver</div>
      <div class="${p}-page-sub">AI-powered doubt resolution</div>
    </div>
    <div class="${p}-card anim-entrance" style="--delay:0.1s;padding:0;overflow:hidden;display:flex;flex-direction:column;height:calc(100vh - 200px);min-height:400px">
      <div style="display:flex;border-bottom:1px solid var(--border);padding:0 4px">
        ${TABS.map(t => `<button class="${p}-tab-btn ${activeTab === t.key ? 'active' : ''}" onclick="window._doubtTab('${t.key}')" style="flex:1;padding:12px;display:flex;align-items:center;justify-content:center;gap:6px;font-size:12px;font-weight:600;border:none;background:transparent;color:${activeTab === t.key ? 'var(--accent)' : 'var(--muted)'};cursor:pointer;border-bottom:2px solid ${activeTab === t.key ? 'var(--accent)' : 'transparent'};transition:all 0.2s">
          ${t.icon} ${t.label} <span style="font-size:10px;padding:1px 6px;border-radius:10px;background:var(--border)">${tabCounts[t.key]}</span>
        </button>`).join('')}
      </div>
      <div style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px" class="${p}-chat-messages">
        ${msgs.length === 0
          ? `<div class="${p}-empty" style="padding:40px;margin:auto">
              <div class="${p}-empty-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
              <div class="${p}-empty-title">No doubts yet</div>
              <div class="${p}-empty-sub">Ask your first question below</div>
            </div>`
          : msgs.map(m => messageBubble(m)).join('')}
      </div>
      <div style="padding:12px 16px;border-top:1px solid var(--border);display:flex;gap:10px;align-items:center">
        <input class="${p}-input" type="text" placeholder="Type your doubt..." style="flex:1" disabled>
        <button class="${p}-btn" style="padding:10px 16px;opacity:0.5" disabled>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>`;

    window._doubtTab = function(key) {
      activeTab = key;
      el.innerHTML = '';
      window.renderDoubts(el);
    };
  };
})();
