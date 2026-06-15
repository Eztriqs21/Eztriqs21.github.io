// page-js/personalized-prep.js
let prepTab='notebook';
function renderPrep(el){
  if(!el)return;
  el.innerHTML=`
  <div class="pg-hdr anim-up">
    <div class="pg-title">🧠 Personalized Prep</div>
    <div class="pg-sub">Your AI study companion — upload notes, chat with AI, and prepare smarter</div>
  </div>
  <div class="prep-cards anim-up d1">
    <div class="prep-card" onclick="prepTab='notebook';renderPrep(document.getElementById('content-wrap'))">
      <div class="prep-card-ico">💬</div>
      <div class="prep-card-title">JEE Prep Notebook</div>
      <div class="prep-card-desc">AI chat with your uploaded notes</div>
    </div>
    <div class="prep-card" onclick="go('revision')">
      <div class="prep-card-ico">📋</div>
      <div class="prep-card-title">Revision Checklist</div>
      <div class="prep-card-desc">Track completed topics</div>
    </div>
    <div class="prep-card" onclick="go('pyq')">
      <div class="prep-card-ico">🎯</div>
      <div class="prep-card-title">PYQ Research</div>
      <div class="prep-card-desc">Pattern analysis & search</div>
    </div>
    <div class="prep-card" onclick="go('scoreanalytics')">
      <div class="prep-card-ico">📈</div>
      <div class="prep-card-title">Score Analytics</div>
      <div class="prep-card-desc">Performance insights</div>
    </div>
  </div>
  <div class="prep-sec anim-up d2">
    ${prepTab==='notebook'?prepRenderNotebook():''}
  </div>`;
  if(prepTab==='notebook')setTimeout(prepRenderKatex,100);
}
function prepRenderNotebook(){
  const chat=DB.prepChat;
  const notes=chat.notes||[];
  const msgs=chat.messages||[];
  const notesHtml=notes.length?notes.map(n=>`
    <div class="prep-note">
      <span>📄</span>
      <span class="prep-note-name" title="${esc(n.name)}">${esc(n.name)}</span>
      <span style="font-size:10px;color:var(--faint)">(${n.text?n.text.length:0} chars)</span>
      <button class="prep-note-del" onclick="prepDeleteNote('${n.id}')" title="Remove">✕</button>
    </div>
  `).join(''):'<div style="font-size:11px;color:var(--faint);margin-bottom:12px">No notes uploaded yet. Upload PDFs of your class notes, textbooks, or study material to give the AI context.</div>';
  let chatHtml='';
  if(msgs.length===0){
    chatHtml=`<div class="prep-chat-empty"><div><div class="prep-chat-empty-ico">🧠</div><div>Start a conversation!</div><div>Upload notes first, then ask questions about them.</div></div></div>`;
  }else{
    chatHtml=msgs.map(m=>prepRenderMsg(m)).join('');
  }
  return `
  <div class="prep-sec-title">💬 JEE Prep Notebook</div>
  <div class="prep-upload" id="prep-drop" onclick="document.getElementById('prep-file-input').click()" ondragover="event.preventDefault();this.classList.add('dragover')" ondragleave="event.preventDefault();this.classList.remove('dragover')" ondrop="event.preventDefault();this.classList.remove('dragover');if(event.dataTransfer.files.length)prepHandleFiles(event.dataTransfer.files)">
    <div class="prep-upload-ico">📎</div>
    <div class="prep-upload-title">Drop PDFs here or click to upload</div>
    <div class="prep-upload-sub">Supports PDF files — text will be extracted automatically</div>
  </div>
  <input type="file" id="prep-file-input" accept=".pdf" multiple style="display:none" onchange="prepHandleFiles(this.files)">
  <div class="prep-notes" id="prep-notes">${notesHtml}</div>
  <div class="prep-chat" id="prep-chat">
    <div class="prep-chat-msgs" id="prep-chat-msgs">${chatHtml}</div>
    <div class="prep-chat-input">
      <input type="text" id="prep-chat-input" placeholder="Ask anything about your notes..." onkeydown="if(event.key==='Enter')prepSendChat()">
      <button class="prep-chat-send" id="prep-send-btn" onclick="prepSendChat()">Send →</button>
    </div>
  </div>`;
}
function prepRenderMsg(m){
  const isUser=m.role==='user';
  const avatar=isUser?'👤':'🧠';
  const content=isUser?esc(m.content):prepRenderMd(m.content);
  return `<div class="prep-chat-msg ${m.role}">
    <div class="prep-chat-avatar">${avatar}</div>
    <div class="prep-chat-bubble">${content}</div>
  </div>`;
}
function prepRenderMd(text){
  if(!text)return'';
  let s=esc(text);
  s=s.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
  s=s.replace(/\*(.+?)\*/g,'<em>$1</em>');
  s=s.replace(/`([^`]+)`/g,'<code style="background:var(--border);padding:1px 4px;border-radius:3px;font-size:12px">$1</code>');
  s=s.replace(/\n/g,'<br>');
  return s;
}
function prepRenderKatex(){
  const el=document.getElementById('prep-chat-msgs');
  if(el&&window.renderMathInElement){
    try{renderMathInElement(el,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}],throwOnError:false});}catch(e){}
  }
}
function prepScrollBottom(){
  const c=document.getElementById('prep-chat-msgs');
  if(c)setTimeout(()=>{c.scrollTop=c.scrollHeight;prepRenderKatex();},80);
}
function prepDeleteNote(id){
  if(!DB.prepChat||!DB.prepChat.notes)return;
  DB.prepChat.notes=DB.prepChat.notes.filter(n=>n.id!==id);
  sv('prepChat');
  renderPrep(document.getElementById('content-wrap'));
  toast('🗑️ Note removed');
}
async function prepHandleFiles(files){
  if(!files||!files.length)return;
  for(let i=0;i<files.length;i++){
    const f=files[i];
    if(f.type!=='application/pdf'){
      toast('⚠️ Only PDF files supported: '+f.name);
      continue;
    }
    toast('📄 Extracting text from '+f.name+'...');
    try{
      const text=await prepExtractPdfText(f);
      if(!text||text.trim().length<20){
        toast('⚠️ Could not extract text from '+f.name+' (may be image-based). Try a different file.');
        continue;
      }
      if(!DB.prepChat.notes)DB.prepChat.notes=[];
      DB.prepChat.notes.push({id:uid(),name:f.name,text:text.trim(),ts:Date.now()});
      DB.prepChat.updatedAt=Date.now();
      sv('prepChat');
      renderPrep(document.getElementById('content-wrap'));
      toast('✅ Extracted '+text.length+' chars from '+f.name);
    }catch(err){
      console.error('PDF extraction error:',err);
      toast('❌ Failed to extract text from '+f.name);
    }
  }
}
async function prepExtractPdfText(file){
  const arrayBuf=await file.arrayBuffer();
  const pdf=await pdfjsLib.getDocument({data:arrayBuf}).promise;
  let allText='';
  const maxPages=Math.min(pdf.numPages,50);
  for(let i=1;i<=maxPages;i++){
    const page=await pdf.getPage(i);
    const tc=await page.getTextContent();
    const pageText=tc.items.map(item=>item.str).join(' ');
    allText+='\n\n--- Page '+i+' ---\n\n'+pageText;
  }
  if(allText.replace(/[^a-zA-Z0-9\u0900-\u097F]/g,'').length<100&&pdf.numPages<=10){
    allText=await prepOcrPdf(pdf,maxPages);
  }
  return allText;
}
async function prepOcrPdf(pdf,maxPages){
  if(typeof Tesseract==='undefined'){
    await new Promise((resolve,reject)=>{
      const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
      s.onload=resolve;s.onerror=()=>reject(new Error('Failed to load Tesseract'));document.head.appendChild(s);
    });
  }
  let text='';
  for(let i=1;i<=maxPages;i++){
    const page=await pdf.getPage(i);
    const vp=page.getViewport({scale:2});
    const canvas=document.createElement('canvas');
    canvas.width=vp.width;canvas.height=vp.height;
    const ctx=canvas.getContext('2d');
    await page.render({canvasContext:ctx,viewport:vp}).promise;
    try{
      const worker=await Tesseract.createWorker('eng');
      const{data}=await worker.recognize(canvas);
      text+='\n\n--- Page '+i+' (OCR) ---\n\n'+data.text;
      await worker.terminate();
    }catch(e){
      text+='\n\n--- Page '+i+' (OCR failed) ---\n\n';
    }
  }
  return text;
}
async function prepSendChat(){
  const input=document.getElementById('prep-chat-input');
  const btn=document.getElementById('prep-send-btn');
  if(!input||!btn)return;
  const text=input.value.trim();
  if(!text)return;
  input.value='';btn.disabled=true;
  if(!DB.prepChat.messages)DB.prepChat.messages=[];
  DB.prepChat.messages.push({id:uid(),role:'user',content:text,ts:Date.now()});
  sv('prepChat');
  const chatMsgs=document.getElementById('prep-chat-msgs');
  if(chatMsgs){
    chatMsgs.innerHTML+=prepRenderMsg({role:'user',content:text});
    chatMsgs.innerHTML+=`<div class="prep-loading" id="prep-loading"><div class="prep-chat-avatar">🧠</div><div class="prep-dots"><span></span><span></span><span></span></div></div>`;
    prepScrollBottom();
  }
  try{
    const{provider,apiBase,openaiKey,openaiModel,ollamaUrl,ollamaModel}=dsLoadSettings();
    const notes=DB.prepChat.notes||[];
    let notesContext='';
    if(notes.length>0){
      notesContext='\n\n=== STUDENT\'S UPLOADED NOTES ===\n';
      let totalLen=0;
      notes.forEach((n,i)=>{
        const truncated=n.text.length>3000?n.text.slice(0,3000)+'...[truncated]':n.text;
        totalLen+=truncated.length;
        if(totalLen>8000){notesContext+='\n--- Note '+(i+1)+': '+n.name+' ---\n[Content skipped — context limit reached]\n';return;}
        notesContext+='\n--- Note '+(i+1)+': '+n.name+' ---\n'+truncated+'\n';
      });
      notesContext+='\n=== END OF NOTES ===\n';
    }
    const sysPrompt=`You are a JEE study assistant and personal tutor. You help students prepare for JEE Main and Advanced.
Maintain full conversation context across messages.
Use LaTeX for math: inline $...$ and display $$...$$.
Be thorough, detailed, and explain concepts clearly.
When generating quizzes, use MCQ format with 4 options and indicate the correct answer.
When referencing uploaded notes, mention which note you're referring to.${notesContext}`;
    const msgs=DB.prepChat.messages.map(m=>({role:m.role,content:m.content}));
    let reply='';
    if(provider==='ollama'){
      reply=await prepOllamaChat(sysPrompt,msgs,ollamaUrl,ollamaModel);
    }else{
      try{
        reply=await prepGroqChat(sysPrompt,msgs,apiBase,openaiKey,openaiModel);
      }catch(groqErr){
        const m=(groqErr.message||'').toLowerCase();
        if(m.includes('429')||m.includes('rate')||m.includes('limit')||m.includes('quota')||m.includes('tokens per')){
          toast('⚡ Groq limit — switching to Ollama...');
          reply=await prepOllamaChat(sysPrompt,msgs,ollamaUrl,ollamaModel);
        }else throw groqErr;
      }
    }
    DB.prepChat.messages.push({id:uid(),role:'assistant',content:reply,ts:Date.now()});
    DB.prepChat.updatedAt=Date.now();
    sv('prepChat');
    const loadingEl=document.getElementById('prep-loading');
    if(loadingEl)loadingEl.remove();
    if(chatMsgs){
      chatMsgs.innerHTML+=prepRenderMsg({role:'assistant',content:reply});
      prepScrollBottom();
    }
  }catch(err){
    console.error('Prep chat error:',err);
    const loadingEl=document.getElementById('prep-loading');
    if(loadingEl)loadingEl.remove();
    const errMsg='❌ Error: '+err.message;
    DB.prepChat.messages.push({id:uid(),role:'assistant',content:errMsg,ts:Date.now()});
    sv('prepChat');
    if(chatMsgs){
      chatMsgs.innerHTML+=prepRenderMsg({role:'assistant',content:errMsg});
      prepScrollBottom();
    }
  }
  btn.disabled=false;
  input.focus();
}
async function prepOllamaChat(systemPrompt,messages,url,model){
  const ollamaUrl=(url||'http://localhost:11434').replace(/\/+$/,'');
  const ollamaModels=DB.prepChat&&DB.prepChat._settings?DB.prepChat._settings.ollamaModels:null;
  let mdl=model;
  if((!mdl||mdl==='custom')&&ollamaModels&&ollamaModels.length>0)mdl=ollamaModels[0];
  if(!mdl)mdl='qwen2.5:3b';
  const allMsgs=[{role:'system',content:systemPrompt},...messages];
  const ctrl=new AbortController();
  const tid=setTimeout(()=>ctrl.abort(),120000);
  try{
    const res=await fetch(ollamaUrl+'/api/chat',{
      method:'POST',headers:{'Content-Type':'application/json'},signal:ctrl.signal,
      body:JSON.stringify({model:mdl,messages:allMsgs,stream:false})
    });
    clearTimeout(tid);
    if(!res.ok)throw new Error('Ollama error '+res.status);
    const data=await res.json();
    return(data.message&&data.message.content)||'No response from Ollama';
  }catch(e){
    clearTimeout(tid);
    if(e.name==='AbortError')throw new Error('Ollama request timed out (2 min). The model may be loading — try again in a moment.');
    throw e;
  }
}
async function prepGroqChat(systemPrompt,messages,apiBase,apiKey,model){
  const base=(apiBase||'https://api.groq.com/openai/v1').replace(/\/$/,'');
  const key=apiKey||localStorage.getItem(KEYS.openaiKey)||'';
  const mdl=model||'llama-3.1-8b-instant';
  if(!key)throw new Error('No API key. Set it in Doubt Solver settings or paste a Groq key.');
  const allMsgs=[{role:'system',content:systemPrompt},...messages];
  const ctrl=new AbortController();
  const tid=setTimeout(()=>ctrl.abort(),60000);
  try{
    const res=await fetch(base+'/chat/completions',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},
      signal:ctrl.signal,
      body:JSON.stringify({model:mdl,messages:allMsgs,temperature:0.3})
    });
    clearTimeout(tid);
    if(!res.ok){
      const errBody=await res.text().catch(()=>'');
      throw new Error('API error '+res.status+(errBody.includes('rate_limit')?' — Rate limited. Wait a few seconds.'+errBody.slice(0,120):' '+errBody.slice(0,120)));
    }
    const data=await res.json();
    return(data.choices&&data.choices[0]&&data.choices[0].message&&data.choices[0].message.content)||'No response from API';
  }catch(e){
    clearTimeout(tid);
    if(e.name==='AbortError')throw new Error('API request timed out (60s).');
    throw e;
  }
}
function prepClearChat(){
  if(!DB.prepChat)return;
  DB.prepChat.messages=[];
  DB.prepChat.updatedAt=Date.now();
  sv('prepChat');
  renderPrep(document.getElementById('content-wrap'));
  toast('🗑️ Chat cleared');
}
