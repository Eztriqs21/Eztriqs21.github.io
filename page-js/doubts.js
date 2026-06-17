// page-js/doubts.js — Doubt Solver with AI (Quick Ask + Chat)
(function() {
  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function getTheme() { return document.documentElement.getAttribute('data-theme') || 'nexus'; }
  function pfx() { return getTheme() === 'nexus' ? 'nx' : 'bl'; }

  const SUBJS = {
    physics: { label: 'Physics', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>' },
    chemistry: { label: 'Chemistry', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6v11l4 5H5l4-5V3z"/><line x1="9" y1="3" x2="15" y2="3"/></svg>' },
    maths: { label: 'Mathematics', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20L20 4"/><path d="M15 4h5v5"/><path d="M4 20l5-5"/></svg>' }
  };

  let dsTab = 'quick';
  let dsChatSubject = 'physics';
  let dsLoading = false;
  let dsImageData = null;
  let dsImageName = null;

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
    '</div>';
  }

  function quickAskHtml() {
    var p = pfx();
    return '<div style="padding:20px">'
      + '<div id="ds-upload-area">'
      + '<label class="' + p + '-card" style="display:flex;flex-direction:column;align-items:center;padding:32px 20px;cursor:pointer;border:2px dashed var(--border);transition:border-color 0.3s" onclick="document.getElementById(\'ds-finp\').click()">'
      + '<div style="color:var(--accent);margin-bottom:12px"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div>'
      + '<div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:4px">Upload a photo of your doubt</div>'
      + '<div style="font-size:11px;color:var(--muted)">JPG, PNG or WebP · max 5MB</div>'
      + '<input type="file" id="ds-finp" accept="image/*" style="display:none" onchange="window._dsHandleFile(this.files)">'
      + '</label>'
      + '<div style="display:flex;align-items:center;gap:12px;margin:16px 0 10px"><div style="flex:1;height:1px;background:var(--border)"></div><span style="font-size:10px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:1px">or type your question</span><div style="flex:1;height:1px;background:var(--border)"></div></div>'
      + '<textarea id="ds-text-inp" class="' + p + '-input" rows="3" placeholder="Type or paste your doubt here..." style="font-size:13px;resize:vertical;width:100%" oninput="window._dsOnInput()"></textarea>'
      + '<button class="' + p + '-btn ' + p + '-btn-primary" id="ds-solve-btn" disabled onclick="window._dsSolve()" style="width:100%;margin-top:12px;justify-content:center;padding:10px 20px">'
      + '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Solve Doubt'
      + '</button>'
      + '</div>'
      + '<div id="ds-preview-area" style="display:none;text-align:center;padding:20px"></div>'
      + '<div id="ds-answer-area" style="display:none;padding:0 20px 20px"></div>'
      + '</div>';
  }

  function chatHtml() {
    var p = pfx();
    var DB = window.DB;
    var chats = (DB && DB.doubtChats) || {};
    var msgs = (chats[dsChatSubject] || {}).messages || [];

    return '<div style="display:flex;flex-direction:column;height:100%">'
      + '<div style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px" id="ds-chat-msgs">'
      + (msgs.length === 0
        ? '<div class="' + p + '-empty" style="padding:40px;margin:auto"><div class="' + p + '-empty-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div><div class="' + p + '-empty-title">Ask about ' + SUBJS[dsChatSubject].label + '!</div><div class="' + p + '-empty-sub">Type your question below.</div></div>'
        : msgs.map(function(m) { return chatBubble(m, p); }).join(''))
      + '</div>'
      + '<div style="padding:12px 16px;border-top:1px solid var(--border);display:flex;gap:10px;align-items:center">'
      + '<input class="' + p + '-input" type="text" id="ds-chat-input" placeholder="Ask about ' + SUBJS[dsChatSubject].label + '..." style="flex:1;font-size:13px" onkeydown="if(event.key===\'Enter\')window._dsChatSend()">'
      + '<button class="' + p + '-btn ' + p + '-btn-primary" onclick="window._dsChatSend()" id="ds-chat-send" style="padding:10px 16px">'
      + '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>'
      + '</button></div></div>';
  }

  function scrollChat() {
    var el = document.getElementById('ds-chat-msgs');
    if (el) el.scrollTop = el.scrollHeight;
  }

  window.renderDoubts = function(el) {
    var p = pfx();
    var DB = window.DB;
    var chats = (DB && DB.doubtChats) || {};

    el.innerHTML = '<div class="anim-entrance">'
      + '<div class="' + p + '-page-header"><div class="' + p + '-page-title" data-text="Doubt Solver">Doubt Solver</div><div class="' + p + '-page-sub">Quick one-shot answers or chat with AI</div></div>'
      + '<div class="' + p + '-card anim-entrance" style="--delay:0.1s;padding:0;overflow:hidden;display:flex;flex-direction:column;height:calc(100vh - 200px);min-height:400px">'
      + '<div style="display:flex;border-bottom:1px solid var(--border);padding:0 4px">'
      + '<button class="' + p + '-tab-btn" onclick="window._dsTab(\'quick\')" style="flex:1;padding:12px;display:flex;align-items:center;justify-content:center;gap:6px;font-size:12px;font-weight:600;border:none;background:transparent;color:' + (dsTab === 'quick' ? 'var(--accent)' : 'var(--muted)') + ';cursor:pointer;border-bottom:2px solid ' + (dsTab === 'quick' ? 'var(--accent)' : 'transparent') + ';transition:all 0.2s"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> Quick Ask</button>'
      + '<button class="' + p + '-tab-btn" onclick="window._dsTab(\'chat\')" style="flex:1;padding:12px;display:flex;align-items:center;justify-content:center;gap:6px;font-size:12px;font-weight:600;border:none;background:transparent;color:' + (dsTab === 'chat' ? 'var(--accent)' : 'var(--muted)') + ';cursor:pointer;border-bottom:2px solid ' + (dsTab === 'chat' ? 'var(--accent)' : 'transparent') + ';transition:all 0.2s"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> Chat</button>'
      + '<button class="' + p + '-btn-ghost" onclick="window.om(\'m-ds-settings\')" style="flex-shrink:0;padding:10px 14px;margin:4px 8px 4px 0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></button>'
      + '</div>'
      + '<div id="ds-tab-content" style="flex:1;display:flex;flex-direction:column;overflow:hidden">'
      + (dsTab === 'quick' ? quickAskHtml() : chatHtml())
      + '</div></div></div>';

    if (dsTab === 'quick') setTimeout(scrollChat, 50);
  };

  window._dsTab = function(tab) {
    dsTab = tab;
    window.renderDoubts(document.getElementById('content-wrap'));
    if (tab === 'chat') setTimeout(scrollChat, 50);
  };

  window._dsHandleFile = function(files) {
    if (!files || !files.length) return;
    var file = files[0];
    if (file.size > 5 * 1024 * 1024) { if (window.toast) window.toast('File too large (max 5MB)'); return; }
    var reader = new FileReader();
    reader.onload = function(e) {
      dsImageData = e.target.result;
      dsImageName = file.name;
      var previewArea = document.getElementById('ds-preview-area');
      if (previewArea) {
        previewArea.style.display = 'block';
        previewArea.innerHTML = '<img src="' + dsImageData + '" style="max-width:100%;max-height:250px;border-radius:8px;object-fit:contain;margin-bottom:12px;border:1px solid var(--border)"/>'
          + '<div style="display:flex;gap:8px;justify-content:center"><button class="' + pfx() + '-btn-ghost" onclick="window._dsRemoveImg()" style="padding:8px 14px;font-size:12px">✕ Remove</button></div>';
      }
      var btn = document.getElementById('ds-solve-btn');
      if (btn) btn.disabled = false;
    };
    reader.readAsDataURL(file);
  };

  window._dsRemoveImg = function() {
    dsImageData = null;
    dsImageName = null;
    var area = document.getElementById('ds-preview-area');
    if (area) { area.style.display = 'none'; area.innerHTML = ''; }
    window._dsOnInput();
  };

  window._dsOnInput = function() {
    var inp = document.getElementById('ds-text-inp');
    var btn = document.getElementById('ds-solve-btn');
    if (btn) btn.disabled = !inp || (!inp.value.trim() && !dsImageData);
  };

  window._dsSolve = async function() {
    if (dsLoading) return;
    var inp = document.getElementById('ds-text-inp');
    var text = inp ? inp.value.trim() : '';
    if (!text && !dsImageData) return;

    var aiSvc = window.aiService;
    if (!aiSvc || !aiSvc.hasApi(aiSvc.loadSettings())) {
      if (window.toast) window.toast('Configure AI in Doubt Solver Settings first');
      if (window.om) window.om('m-ds-settings');
      return;
    }

    dsLoading = true;
    var btn = document.getElementById('ds-solve-btn');
    if (btn) { btn.disabled = true; btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite"><circle cx="12" cy="12" r="10"/></svg> Solving...'; }

    var answerArea = document.getElementById('ds-answer-area');
    if (answerArea) { answerArea.style.display = 'block'; answerArea.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted)">Thinking...</div>'; }

    var msgs = [];
    var sysPrompt = 'You are a JEE (Joint Entrance Examination) tutor. Answer the student\'s doubt clearly, step by step. Use LaTeX for math formulas where appropriate (wrap in $$). Be concise but thorough. Focus on concepts and problem-solving approach.';
    if (text && dsImageData) {
      msgs.push({ role: 'user', content: [
        { type: 'image_url', image_url: { url: dsImageData } },
        { type: 'text', text: text }
      ]});
    } else if (dsImageData) {
      msgs.push({ role: 'user', content: [
        { type: 'image_url', image_url: { url: dsImageData } },
        { type: 'text', text: 'What is shown in this image? Please solve or explain the doubt shown.' }
      ]});
    } else if (text) {
      msgs.push({ role: 'user', content: text });
    }

    try {
      var settings = aiSvc.loadSettings();
      var response = await aiSvc.callAI([{ role: 'system', content: sysPrompt }, ...msgs], settings, { maxTokens: 2048 });
      if (answerArea) answerArea.innerHTML = '<div style="padding:16px;background:var(--border-card);border-radius:8px;font-size:13px;line-height:1.7">' + renderMd(response) + '</div>';
    } catch (err) {
      if (answerArea) answerArea.innerHTML = '<div style="padding:16px;color:var(--danger);font-size:13px">Error: ' + esc(err.message || 'Failed to get response') + '</div>';
    }

    dsLoading = false;
    if (btn) { btn.disabled = false; btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Solve Doubt'; }
  };

  window._dsChatSend = async function() {
    if (dsLoading) return;
    var inp = document.getElementById('ds-chat-input');
    var text = inp ? inp.value.trim() : '';
    if (!text) return;

    var aiSvc = window.aiService;
    if (!aiSvc || !aiSvc.hasApi(aiSvc.loadSettings())) {
      if (window.toast) window.toast('Configure AI in Doubt Solver Settings first');
      return;
    }

    var DB = window.DB;
    if (!DB.doubtChats) DB.doubtChats = { physics: { messages: [] }, chemistry: { messages: [] }, maths: { messages: [] } };
    if (!DB.doubtChats[dsChatSubject]) DB.doubtChats[dsChatSubject] = { messages: [] };
    var msgs = DB.doubtChats[dsChatSubject].messages;
    msgs.push({ role: 'user', content: text, time: new Date().toISOString() });
    if (window.sv) window.sv('doubtChats');

    inp.value = '';
    scrollChat();

    dsLoading = true;
    var sendBtn = document.getElementById('ds-chat-send');
    if (sendBtn) sendBtn.disabled = true;

    // Append loading bubble
    var chatMsgs = document.getElementById('ds-chat-msgs');
    if (chatMsgs) {
      var loadingDiv = document.createElement('div');
      loadingDiv.id = 'ds-loading-bubble';
      loadingDiv.style.cssText = 'display:flex;gap:8px;align-items:flex-start;max-width:85%';
      loadingDiv.innerHTML = '<div style="width:28px;height:28px;border-radius:50%;background:var(--border-card);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--accent)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></div>'
        + '<div style="padding:10px 14px;border-radius:12px;border-bottom-left-radius:4px;background:var(--border-card);color:var(--muted);font-size:13px">Thinking...</div>';
      chatMsgs.appendChild(loadingDiv);
      scrollChat();
    }

    try {
      var settings = aiSvc.loadSettings();
      var sysPrompt = 'You are a JEE tutor helping with ' + SUBJS[dsChatSubject].label + '. Answer clearly, step by step. Use LaTeX for math ($$formula$$). Be concise but thorough.';
      var chatHistory = msgs.slice(-10).map(function(m) { return { role: m.role, content: m.content }; });
      var response = await aiSvc.callAI([{ role: 'system', content: sysPrompt }, ...chatHistory], settings, { maxTokens: 2048 });

      msgs.push({ role: 'assistant', content: response, time: new Date().toISOString() });
      if (window.sv) window.sv('doubtChats');
    } catch (err) {
      msgs.push({ role: 'assistant', content: 'Sorry, I encountered an error: ' + (err.message || 'Unknown error'), time: new Date().toISOString() });
      if (window.sv) window.sv('doubtChats');
    }

    dsLoading = false;
    if (sendBtn) sendBtn.disabled = false;
    window.renderDoubts(document.getElementById('content-wrap'));
  };
})();
