// page-js/prep.js — Personalized Prep with AI Chat
(function() {
  function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
  function getTheme() { return document.documentElement.getAttribute('data-theme') || 'nexus'; }
  function pfx() { return getTheme() === 'nexus' ? 'nx' : 'bl'; }

  function renderMd(text) {
    if (!text) return '';
    var s = esc(text);
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');
    s = s.replace(/`([^`]+)`/g, '<code style="background:var(--border-card);padding:1px 4px;border-radius:3px;font-size:12px">$1</code>');
    s = s.replace(/\n/g, '<br>');
    return s;
  }

  function chatBubble(msg, p) {
    var isUser = msg.role === 'user';
    var avatar = isUser
      ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
      : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>';
    var content = isUser ? esc(msg.content) : renderMd(msg.content);
    return '<div style="display:flex;gap:8px;align-items:flex-start;max-width:85%;align-self:' + (isUser ? 'flex-end;flex-direction:row-reverse' : 'flex-start') + '">'
      + '<div style="width:28px;height:28px;border-radius:50%;background:var(--border-card);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--accent)">' + avatar + '</div>'
      + '<div style="padding:10px 14px;border-radius:12px;font-size:13px;line-height:1.6;' + (isUser ? 'background:var(--accent);color:#fff;border-bottom-right-radius:4px' : 'background:var(--border-card);color:var(--text);border-bottom-left-radius:4px') + '">' + content + '</div>'
    + '</div>';
  }

  window.renderPrep = function(el) {
    if (!el) return;
    var p = pfx();
    var DB = window.DB;
    if (!DB) { el.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-muted)">Loading data...</div>'; return; }
    var chat = DB.prepChat || { messages: [], notes: [] };
    var msgs = chat.messages || [];
    var notes = chat.notes || [];

    el.innerHTML = '<div class="anim-entrance">'
      + '<div class="' + p + '-page-header"><div class="' + p + '-page-title" data-text="Prep Chat">Prep Chat</div><div class="' + p + '-page-sub">AI study companion — ask questions, upload notes, prepare smarter</div></div>'
      + '<div class="prep-layout" style="display:grid;gap:16px;height:calc(100vh - 200px);min-height:400px">'
      // Left: Notes panel
      + '<div class="' + p + '-card anim-entrance" style="--delay:0.1s;padding:0;overflow:hidden;display:flex;flex-direction:column">'
      + '<div style="padding:12px 16px;border-bottom:1px solid var(--border);font-size:12px;font-weight:600;color:var(--text);display:flex;align-items:center;justify-content:space-between"><span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> Notes</span>'
      + '<button class="' + p + '-btn-ghost" style="font-size:10px;padding:4px 8px" onclick="document.getElementById(\'prep-file-input\').click()">+ Upload</button></div>'
      + '<div style="flex:1;overflow-y:auto;padding:12px" id="prep-notes">'
      + (notes.length === 0
        ? '<div style="text-align:center;padding:20px;font-size:11px;color:var(--muted)">No notes uploaded yet. Upload PDFs to give the AI context about your study material.</div>'
        : notes.map(function(n, i) { return '<div style="display:flex;align-items:center;gap:8px;padding:8px;border-radius:6px;margin-bottom:4px;background:var(--border-card)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><span style="flex:1;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(n.name) + '</span><button class="' + p + '-btn-ghost" style="font-size:10px;padding:2px 6px;color:var(--danger)" onclick="window._prepDelNote(' + i + ')">✕</button></div>'; }).join(''))
      + '</div>'
      + '<input type="file" id="prep-file-input" accept=".pdf" multiple style="display:none" onchange="window._prepHandleFiles(this.files)">'
      + '</div>'
      // Right: Chat panel
      + '<div class="' + p + '-card anim-entrance" style="--delay:0.15s;padding:0;overflow:hidden;display:flex;flex-direction:column">'
      + '<div style="padding:12px 16px;border-bottom:1px solid var(--border);font-size:12px;font-weight:600;color:var(--text);display:flex;align-items:center;gap:8px"><div style="width:8px;height:8px;border-radius:50%;background:var(--success)"></div> AI Study Planner</div>'
      + '<div style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px" id="prep-chat-msgs">'
      + (msgs.length === 0
        ? '<div class="' + p + '-empty" style="padding:40px;margin:auto"><div class="' + p + '-empty-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></div><div class="' + p + '-empty-title">Start a conversation!</div><div class="' + p + '-empty-sub">Ask about any topic or upload notes for context.</div></div>'
        : msgs.map(function(m) { return chatBubble(m, p); }).join(''))
      + '</div>'
      + '<div style="padding:12px 16px;border-top:1px solid var(--border);display:flex;gap:10px;align-items:center">'
      + '<input class="' + p + '-input" type="text" id="prep-chat-input" placeholder="Ask anything about your notes..." style="flex:1;font-size:13px" onkeydown="if(event.key===\'Enter\')window._prepSend()">'
      + '<button class="' + p + '-btn ' + p + '-btn-primary" onclick="window._prepSend()" style="padding:10px 16px"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>'
      + '</div></div></div></div>';
  };

  window._prepSend = async function() {
    var inp = document.getElementById('prep-chat-input');
    var text = inp ? inp.value.trim() : '';
    if (!text) return;

    var aiSvc = window.aiService;
    if (!aiSvc || !aiSvc.hasApi(aiSvc.loadSettings())) {
      if (window.toast) window.toast('Configure AI settings first (Doubt Solver → Settings)');
      return;
    }

    var DB = window.DB;
    if (!DB.prepChat) DB.prepChat = { messages: [], notes: [] };
    var msgs = DB.prepChat.messages;
    msgs.push({ role: 'user', content: text, time: new Date().toISOString() });
    if (window.sv) window.sv('prepChat');
    inp.value = '';

    var chatEl = document.getElementById('prep-chat-msgs');
    if (chatEl) chatEl.scrollTop = chatEl.scrollHeight;

    // Loading bubble
    if (chatEl) {
      var ld = document.createElement('div');
      ld.id = 'prep-loading';
      ld.style.cssText = 'display:flex;gap:8px;align-items:flex-start;max-width:85%';
      ld.innerHTML = '<div style="width:28px;height:28px;border-radius:50%;background:var(--border-card);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--accent)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></div>'
        + '<div style="padding:10px 14px;border-radius:12px;border-bottom-left-radius:4px;background:var(--border-card);color:var(--muted);font-size:13px">Thinking...</div>';
      chatEl.appendChild(ld);
      chatEl.scrollTop = chatEl.scrollHeight;
    }

    try {
      var settings = aiSvc.loadSettings();
      var sysPrompt = 'You are a JEE study planner and tutor. Help the student with their preparation. Be concise, clear, and encouraging. Use LaTeX for math ($$formula$$). Give actionable advice.';
      var noteContext = (DB.prepChat.notes || []).map(function(n) { return 'Note: ' + n.name + ' — ' + (n.text || '').substring(0, 500); }).join('\n');
      if (noteContext) sysPrompt += '\n\nStudent\'s uploaded notes:\n' + noteContext;
      var chatHistory = msgs.slice(-10).map(function(m) { return { role: m.role, content: m.content }; });
      var response = await aiSvc.callAI([{ role: 'system', content: sysPrompt }, ...chatHistory], settings, { maxTokens: 2048 });
      msgs.push({ role: 'assistant', content: response, time: new Date().toISOString() });
    } catch (err) {
      msgs.push({ role: 'assistant', content: 'Error: ' + (err.message || 'Failed to get response'), time: new Date().toISOString() });
    }

    if (window.sv) window.sv('prepChat');
    if (window._refreshPage) window._refreshPage();
  };

  var _prepIdCounter = 0;
  window._prepHandleFiles = function(files) {
    if (!files || !files.length) return;
    var DB = window.DB;
    if (!DB) return;
    if (!DB.prepChat) DB.prepChat = { messages: [], notes: [] };
    Array.from(files).forEach(function(file) {
      if (file.type !== 'application/pdf') { if (window.toast) window.toast('Only PDF files supported'); return; }
      DB.prepChat.notes.push({ name: file.name, text: '[PDF uploaded — content not extracted: ' + file.name + ']', id: 'pn_' + Date.now() + '_' + (++_prepIdCounter) });
      if (window.sv) window.sv('prepChat');
    });
    if (window._refreshPage) window._refreshPage();
  };

  window._prepDelNote = function(index) {
    var DB = window.DB;
    if (!DB || !DB.prepChat || !DB.prepChat.notes) return;
    DB.prepChat.notes.splice(index, 1);
    if (window.sv) window.sv('prepChat');
    if (window._refreshPage) window._refreshPage();
  };
})();
