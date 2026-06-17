// page-js/personalized-prep.js
import { DB, sv, KEYS } from '../js/data.js';
import { uid, esc, toast } from '../js/helpers.js';
import { loadSettings, callAI } from '../js/ai-service.js';

let prepTab='notebook';
function renderPrep(el){
  if(!el)return;
  el.innerHTML=`
  <div class="pg-hdr anim-up">
    <div class="pg-title" data-text="Personalized Prep"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> Personalized Prep</div>
    <div class="pg-sub">Your AI study companion — upload notes, chat with AI, and prepare smarter</div>
  </div>
  <div class="prep-cards stagger anim-fade-in-up">
    <div class="prep-card" onclick="prepTab='notebook';renderPrep(document.getElementById('content-wrap'))">
      <div class="prep-card-ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
      <div class="prep-card-title">JEE Prep Notebook</div>
      <div class="prep-card-desc">AI chat with your uploaded notes</div>
    </div>
    <div class="prep-card" onclick="go('revision')">
      <div class="prep-card-ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div>
      <div class="prep-card-title">Revision Checklist</div>
      <div class="prep-card-desc">Track completed topics</div>
    </div>
    <div class="prep-card" onclick="go('pyq')">
      <div class="prep-card-ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
      <div class="prep-card-title">PYQ Research</div>
      <div class="prep-card-desc">Pattern analysis & search</div>
    </div>
    <div class="prep-card" onclick="go('scoreanalytics')">
      <div class="prep-card-ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
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
      <span class="prep-note-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></span>
      <span class="prep-note-name" title="${esc(n.name)}">${esc(n.name)}</span>
      <span class="prep-note-meta">(${n.text?n.text.length:0} chars)</span>
      <button class="prep-note-del" onclick="prepDeleteNote('${n.id}')" title="Remove"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
    </div>
  `).join(''):'<div class="prep-empty-hint"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> No notes uploaded yet. Upload PDFs of your class notes, textbooks, or study material to give the AI context.</div>';
  let chatHtml='';
  if(msgs.length===0){
    chatHtml=`<div class="prep-chat-empty"><div class="prep-chat-empty-inner"><div class="prep-chat-empty-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></div><div class="prep-chat-empty-title">Start a conversation!</div><div class="prep-chat-empty-sub">Upload notes first, then ask questions about them.</div></div></div>`;
  }else{
    chatHtml=msgs.map(m=>prepRenderMsg(m)).join('');
  }
  return `
  <div class="section-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> JEE Prep Notebook</div>
  <div class="prep-upload" id="prep-drop" onclick="document.getElementById('prep-file-input').click()" ondragover="event.preventDefault();this.classList.add('dragover')" ondragleave="event.preventDefault();this.classList.remove('dragover')" ondrop="event.preventDefault();this.classList.remove('dragover');if(event.dataTransfer.files.length)prepHandleFiles(event.dataTransfer.files)">
    <div class="prep-upload-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></div>
    <div class="prep-upload-title">Drop PDFs here or click to upload</div>
    <div class="prep-upload-sub">Supports PDF files — text will be extracted automatically</div>
  </div>
  <input type="file" id="prep-file-input" accept=".pdf" multiple style="display:none" onchange="prepHandleFiles(this.files)">
  <div class="prep-notes" id="prep-notes">${notesHtml}</div>
  <div class="prep-chat" id="prep-chat">
    <div class="prep-chat-header">
      <div class="prep-chat-status-dot"></div>
      <span class="prep-chat-header-title">AI Study Planner</span>
      <span class="prep-chat-header-sub">Online</span>
    </div>
    <div class="prep-chat-msgs" id="prep-chat-msgs">${chatHtml}</div>
    <div class="prep-chat-input-wrap">
      <input class="prep-chat-input" type="text" id="prep-chat-input" placeholder="Ask anything about your notes..." onkeydown="if(event.key==='Enter')prepSendChat()">
      <button class="prep-chat-send btn btn-primary" id="prep-send-btn" onclick="prepSendChat()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
    </div>
  </div>`;
}
function prepRenderMsg(m){
  const isUser=m.role==='user';
  const avatar=isUser
    ?'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
    :'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>';
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
    chatMsgs.innerHTML+=`<div class="prep-loading" id="prep-loading"><div class="prep-chat-avatar"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></div><div class="prep-dots"><span></span><span></span><span></span></div></div>`;
    prepScrollBottom();
  }
  try{
    const settings=loadSettings();
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
    const allMsgs=[{role:'system',content:sysPrompt},...msgs];
    const reply=await callAI(allMsgs,settings,{maxTokens:4096,temperature:0.3});
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
function prepClearChat(){
  if(!DB.prepChat)return;
  DB.prepChat.messages=[];
  DB.prepChat.updatedAt=Date.now();
  sv('prepChat');
  renderPrep(document.getElementById('content-wrap'));
  toast('🗑️ Chat cleared');
}

/* ═══════════════ WINDOW EXPORTS ═══════════════ */
window.renderPrep=renderPrep;
window.prepRenderNotebook=prepRenderNotebook;
window.prepRenderMsg=prepRenderMsg;
window.prepRenderMd=prepRenderMd;
window.prepRenderKatex=prepRenderKatex;
window.prepScrollBottom=prepScrollBottom;
window.prepDeleteNote=prepDeleteNote;
window.prepHandleFiles=prepHandleFiles;
window.prepExtractPdfText=prepExtractPdfText;
window.prepOcrPdf=prepOcrPdf;
window.prepSendChat=prepSendChat;
window.prepOllamaChat=prepOllamaChat;
window.prepGroqChat=prepGroqChat;
window.prepClearChat=prepClearChat;
