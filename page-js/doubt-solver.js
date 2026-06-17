import { DB, sv, KEYS } from '../js/data.js';
import { uid, esc, cm, om, toast, setupDZ, cfm2 } from '../js/helpers.js';
import { loadSettings, saveSettings, hasApi, hasApiKey, callAI } from '../js/ai-service.js';

let dsState={step:0,imageData:null,imageFile:null,extractedText:'',textInput:'',answer:null,loading:false};
let dsTab='quick';
let dsChatSubject='physics';
const DS_SUBJS={physics:{label:'Physics',icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',color:'var(--primary)'},chemistry:{label:'Chemistry',icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6v11l4 5H5l4-5V3z"/><line x1="9" y1="3" x2="15" y2="3"/></svg>',color:'var(--secondary)'},maths:{label:'Maths',icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20L20 4"/><path d="M15 4h5v5"/><path d="M4 20l5-5"/></svg>',color:'var(--accent)'}};

function getTheme(){return document.documentElement.getAttribute('data-theme')||'nexus';}
function pfx(){return getTheme()==='nexus'?'nx':'bl';}

function renderDoubtSolver(el){
  dsMigrateHistory();
  const p=pfx();
  el.innerHTML=`<div class="anim-entrance">
    <div class="${p}-page-header">
      <div class="${p}-page-title" data-text="Doubt Solver">Doubt Solver</div>
      <div class="${p}-page-sub">Quick one-shot answers or start a conversation with AI.</div>
    </div>
    <div class="${p}-card anim-entrance" style="--delay:0.1s;padding:0;overflow:hidden;display:flex;flex-direction:column">
      <div style="display:flex;border-bottom:1px solid var(--border);padding:0 4px">
        <button class="${p}-tab-btn ${dsTab==='quick'?'active':''}" onclick="dsSwitchTab('quick')" style="flex:1;padding:12px;display:flex;align-items:center;justify-content:center;gap:6px;font-size:12px;font-weight:600;border:none;background:transparent;color:${dsTab==='quick'?'var(--accent)':'var(--muted)'};cursor:pointer;border-bottom:2px solid ${dsTab==='quick'?'var(--accent)':'transparent'};transition:all 0.2s">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> Quick Ask
        </button>
        <button class="${p}-tab-btn ${dsTab==='chat'?'active':''}" onclick="dsSwitchTab('chat')" style="flex:1;padding:12px;display:flex;align-items:center;justify-content:center;gap:6px;font-size:12px;font-weight:600;border:none;background:transparent;color:${dsTab==='chat'?'var(--accent)':'var(--muted)'};cursor:pointer;border-bottom:2px solid ${dsTab==='chat'?'var(--accent)':'transparent'};transition:all 0.2s">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> Chat
        </button>
        <button class="${p}-btn-ghost" onclick="dsOpenSettings()" style="flex-shrink:0;padding:10px 14px;margin:4px 8px 4px 0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        </button>
      </div>
      <div id="ds-tab-content">${dsTab==='quick'?dsRenderQuickAsk():dsRenderChat()}</div>
    </div>
  </div>`;
  if(dsTab==='quick')setupDZ('ds-dz','ds-finp',dsHandleFile);
}

function dsSwitchTab(tab){
  dsTab=tab;
  const el=document.getElementById('ds-tab-content');
  if(!el)return;
  document.querySelectorAll('[class*="tab-btn"]').forEach(b=>{
    const text=b.textContent.trim().toLowerCase();
    b.classList.toggle('active',text.includes(tab==='quick'?'quick':'chat'));
    if(tab==='quick'&&text.includes('quick')){b.style.color='var(--accent)';b.style.borderBottomColor='var(--accent)';}
    else if(tab==='chat'&&text.includes('chat')){b.style.color='var(--accent)';b.style.borderBottomColor='var(--accent)';}
    else if(text.includes(tab==='quick'?'chat':'quick')){b.style.color='var(--muted)';b.style.borderBottomColor='transparent';}
  });
  el.innerHTML=tab==='quick'?dsRenderQuickAsk():dsRenderChat();
  if(tab==='quick')setupDZ('ds-dz','ds-finp',dsHandleFile);
  if(tab==='chat')dsScrollChatBottom();
}

function dsRenderQuickAsk(){
  const p=pfx();
  return `<div style="padding:20px">
    <div id="ds-upload-area">
      <label class="${p}-card ds-dz" id="ds-dz" style="display:flex;flex-direction:column;align-items:center;padding:32px 20px;cursor:pointer;border:2px dashed var(--border);transition:border-color 0.3s">
        <div style="color:var(--accent);margin-bottom:12px"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div>
        <div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:4px">Upload a photo of your doubt</div>
        <div style="font-size:11px;color:var(--muted)">JPG, PNG or WebP · max 5MB</div>
        <input type="file" id="ds-finp" accept="image/jpeg,image/png,image/webp" onchange="dsHandleFile(this.files)" style="display:none"/>
      </label>
      <div style="display:flex;align-items:center;gap:12px;margin:16px 0 10px">
        <div style="flex:1;height:1px;background:var(--border)"></div>
        <span style="font-size:10px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:1px;font-family:var(--font-data)">or type your question</span>
        <div style="flex:1;height:1px;background:var(--border)"></div>
      </div>
      <textarea id="ds-text-inp" class="${p}-input" rows="3" placeholder="Type or paste your doubt here..." style="font-size:13px;resize:vertical" oninput="dsOnTextInput(this.value)"></textarea>
      <button class="${p}-btn ${p}-btn-primary" id="ds-text-submit" disabled onclick="dsSolve()" style="width:100%;margin-top:12px;justify-content:center;padding:10px 20px">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Solve Doubt
      </button>
    </div>
    <div id="ds-preview-area" style="display:none">
      <div style="text-align:center">
        <img id="ds-preview-img" src="" alt="Uploaded doubt" style="max-width:100%;max-height:300px;border-radius:var(--radius);object-fit:contain;margin-bottom:12px;border:1px solid var(--border)"/>
        <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">
          <button class="${p}-btn-ghost" onclick="dsRemoveImage()" style="padding:8px 14px">✕ Remove</button>
          <button class="${p}-btn ${p}-btn-primary" id="ds-solve-btn" disabled onclick="dsSolve()" style="padding:10px 22px">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Solve Doubt
          </button>
        </div>
      </div>
    </div>
    <div id="ds-progress-area" style="display:none"></div>
    <div id="ds-extracted-area" style="display:none"></div>
    <div id="ds-error-area" style="display:none"></div>
    <div id="ds-answer-area" style="display:none"></div>
  </div>`;
}

function dsRenderChat(){
  const p=pfx();
  const chats=DB.doubtChats||{physics:{messages:[]},chemistry:{messages:[]},maths:{messages:[]}};
  const msgs=(chats[dsChatSubject]?.messages||[]);
  const msgHtml=msgs.length?msgs.map(m=>dsRenderChatMsg(m)):`<div class="${p}-empty" style="padding:60px 20px;text-align:center">
    <div class="${p}-empty-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
    <div class="${p}-empty-title">Start a conversation about ${DS_SUBJS[dsChatSubject].label}!</div>
    <div class="${p}-empty-sub">Upload an image or type your question.</div>
  </div>`;
  return `<div style="display:flex;flex-direction:column;height:min(70dvh,600px)">
    <div style="display:flex;border-bottom:1px solid var(--border);padding:0 4px;flex-wrap:wrap">
      ${Object.entries(DS_SUBJS).map(([k,v])=>`<button class="${p}-chip ${dsChatSubject===k?'active':''}" onclick="dsSwitchSubject('${k}')" style="flex:1;min-width:80px;justify-content:center;padding:10px 12px;font-size:11px;font-weight:600;border-radius:0;border:none;border-bottom:2px solid ${dsChatSubject===k?v.color:'transparent'};color:${dsChatSubject===k?v.color:'var(--muted)'};background:transparent;cursor:pointer;transition:all 0.2s">
        ${v.icon} ${v.label}
      </button>`).join('')}
    </div>
    <div style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px" id="ds-chat-msgs" class="${p}-chat-messages">${msgHtml}</div>
    <div style="border-top:1px solid var(--border);padding:12px 16px">
      <div id="ds-chat-preview" style="display:none;padding:8px 0;border-bottom:1px solid var(--border);margin-bottom:8px">
        <div style="display:flex;align-items:center;gap:8px">
          <img id="ds-chat-preview-img" style="max-height:60px;border-radius:var(--radius);object-fit:cover;border:1px solid var(--border)"/>
          <span style="font-size:11px;color:var(--muted)">Image attached</span>
          <button class="${p}-btn-ghost" onclick="dsChatRemoveImage()" style="padding:4px 8px;font-size:10px">✕</button>
        </div>
      </div>
      <div style="display:flex;gap:8px;align-items:flex-end">
        <label class="${p}-btn-ghost" style="flex-shrink:0;cursor:pointer;padding:8px 10px">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
          <input type="file" accept="image/jpeg,image/png,image/webp" style="display:none" onchange="dsChatHandleFile(this.files)"/>
        </label>
        <textarea id="ds-chat-inp" class="${p}-input" rows="1" placeholder="Ask anything..." style="flex:1;resize:none;font-size:13px;max-height:120px;min-height:38px;padding:8px 12px" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();dsSendChat();}"></textarea>
        <button class="${p}-btn ${p}-btn-primary" id="ds-chat-send" onclick="dsSendChat()" style="flex-shrink:0;padding:8px 16px">Send</button>
      </div>
      ${msgs.length>2?`<div style="padding:8px 0 0;text-align:center"><button class="${p}-btn-ghost" onclick="dsClearChat('${dsChatSubject}')" style="font-size:10px;padding:4px 10px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Clear chat</button></div>`:''}
    </div>
  </div>`;
}

function dsRenderChatMsg(m){
  const p=pfx();
  const isUser=m.role==='user';
  let content=esc(m.content||'');
  if(!isUser&&window.renderMathInElement){content=content.replace(/\n/g,'<br>');}
  let imgHtml='';
  if(m.image){imgHtml=`<img src="${esc(m.image)}" style="max-width:200px;max-height:150px;border-radius:var(--radius);object-fit:cover;margin-bottom:8px;cursor:pointer;border:1px solid var(--border)" onclick="pvFile('${esc(m.image).replace(/'/g,"\\'")}','Image')"/>`;}
  return `<div style="display:flex;gap:10px;max-width:85%;align-self:${isUser?'flex-end':'flex-start'};flex-direction:${isUser?'row-reverse':'row'}" id="${m.id||''}">
    <div style="width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;background:${isUser?'rgba(34,197,94,0.15);color:var(--success)':'rgba(0,240,255,0.08);color:var(--primary)'}">
      ${isUser?'U':'AI'}
    </div>
    <div>
      ${imgHtml}
      <div style="padding:10px 14px;border-radius:12px;font-size:13px;line-height:1.6;word-break:break-word;background:${isUser?'var(--primary);color:var(--bg)':'var(--bg-card)'};border:1px solid ${isUser?'var(--primary)':'var(--border)'};border-bottom-${isUser?'right':'left'}-radius:4px">
        ${content}
      </div>
      <div style="font-size:10px;color:var(--muted);margin-top:4px;text-align:${isUser?'right':'left'};padding:0 4px">
        ${new Date(m.ts).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
      </div>
    </div>
  </div>`;
}

function dsScrollChatBottom(){
  setTimeout(()=>{
    const el=document.getElementById('ds-chat-msgs');
    if(el)el.scrollTop=el.scrollHeight;
  },50);
}

function dsHandleFile(files){
  if(!files||!files.length)return;
  const f=files[0];
  if(!f.type.match(/^image\/(jpeg|png|webp)$/)){toast('JPG, PNG or WebP only');return;}
  if(f.size>5*1024*1024){toast('Max 5MB');return;}
  dsState.imageFile=f;dsState.textInput='';
  const ta=document.getElementById('ds-text-inp');if(ta)ta.value='';
  const r=new FileReader();
  r.onload=function(e){
    dsState.imageData=e.target.result;
    document.getElementById('ds-preview-img').src=dsState.imageData;
    document.getElementById('ds-upload-area').style.display='none';
    document.getElementById('ds-preview-area').style.display='block';
    document.getElementById('ds-solve-btn').disabled=false;
    document.getElementById('ds-text-submit').disabled=true;
    dsClearResults();
  };
  r.readAsDataURL(f);
}

function dsOnTextInput(val){
  dsState.textInput=val;
  const btn=document.getElementById('ds-solve-btn');if(btn)btn.disabled=!val.trim()&&!dsState.imageData;
  const tbtn=document.getElementById('ds-text-submit');if(tbtn)tbtn.disabled=!val.trim();
}

function dsRemoveImage(){
  dsState.imageData=null;dsState.imageFile=null;dsState.extractedText='';dsState.answer=null;
  document.getElementById('ds-finp').value='';
  document.getElementById('ds-upload-area').style.display='block';
  document.getElementById('ds-preview-area').style.display='none';
  const btn=document.getElementById('ds-solve-btn');if(btn)btn.disabled=!dsState.textInput.trim();
  const tbtn=document.getElementById('ds-text-submit');if(tbtn)tbtn.disabled=!dsState.textInput.trim();
  dsClearResults();
}

function dsClearResults(){
  ['ds-progress-area','ds-extracted-area','ds-error-area','ds-answer-area'].forEach(function(id){
    const el=document.getElementById(id);if(el){el.style.display='none';el.innerHTML='';}
  });
}

function dsSetStep(n){
  dsState.step=n;
  ['ds-ps-1','ds-ps-2','ds-ps-3','ds-ps-4','ds-ps-5'].forEach(function(id,idx){
    const el=document.getElementById(id);if(!el)return;
    el.classList.remove('ds-ps-on','ds-ps-done');
    if(idx<n)el.classList.add('ds-ps-done');else if(idx===n)el.classList.add('ds-ps-on');
  });
}

function dsSolve(){
  if(dsState.loading)return;
  const hasImage=!!dsState.imageData;
  const hasText=!!dsState.textInput.trim();
  if(!hasImage&&!hasText){toast('Upload an image or type a question');return;}
  const settings=dsLoadSettings();
  dsState.loading=true;
  document.getElementById('ds-text-submit').disabled=true;
  dsClearResults();
  const btn=document.getElementById('ds-solve-btn');
  const modeLabel=hasImage?(settings.useVision?'Analyzing with Vision AI...':'Scanning & Solving...'):'Solving...';
  if(btn){btn.disabled=true;btn.innerHTML='<span class="spinner" style="display:inline-block;width:14px;height:14px;border:2px solid var(--border);border-top-color:var(--primary);border-radius:50%;animation:spin .6s linear infinite;vertical-align:middle;margin-right:6px"></span> '+modeLabel;}
  const pa=document.getElementById('ds-progress-area');
  if(pa){
    pa.style.display='block';
    if(hasImage){
      pa.innerHTML=`<div class="ds-progress"><div class="ds-progress-steps"><div class="ds-ps ds-ps-on" id="ds-ps-1"><span class="ds-ps-num">1</span> Scanning Image</div><div class="ds-ps" id="ds-ps-2"><span class="ds-ps-num">2</span> Reading Text</div><div class="ds-ps" id="ds-ps-3"><span class="ds-ps-num">3</span> Understanding</div><div class="ds-ps" id="ds-ps-4"><span class="ds-ps-num">4</span> Solving</div><div class="ds-ps" id="ds-ps-5"><span class="ds-ps-num">5</span> Results</div></div></div>`;
    }else{
      pa.innerHTML=`<div class="ds-progress"><div class="ds-progress-steps"><div class="ds-ps ds-ps-on" id="ds-ps-1"><span class="ds-ps-num">1</span> Understanding</div><div class="ds-ps" id="ds-ps-2"><span class="ds-ps-num">2</span> Solving</div><div class="ds-ps" id="ds-ps-3"><span class="ds-ps-num">3</span> Results</div></div></div>`;
    }
  }
  dsSetStep(1);
  if(hasImage&&settings.useVision){
    setTimeout(function(){dsSolveVision(settings);},300);
  }else if(hasImage){
    setTimeout(function(){dsRunOCR();},300);
  }else{
    setTimeout(function(){dsSearchAnswer(dsState.textInput.trim());},300);
  }
}

async function dsSolveVision(settings){
  dsSetStep(2);dsSetStep(3);dsSetStep(4);
  try{
    const answer=await dsAskAI('',{question:'',subject:'General',lines:[]},settings,dsState.imageData);
    dsState.answer=answer;
    const parsed=dsParseQuestion(answer.answer||'');
    dsRenderAnswer(answer,parsed);
  }catch(e){
    console.error('Vision AI error:',e);
    dsShowError(dsFormatError(e));
  }
  dsSolveDone();
}

async function dsRunOCR(){
  dsSetStep(2);
  try{
    if(typeof Tesseract==='undefined'){
      const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';document.head.appendChild(s);
      await new Promise(function(res,rej){s.onload=res;s.onerror=rej;});
      await new Promise(function(r){setTimeout(r,1000);});
    }
    const img=document.getElementById('ds-preview-img');
    const canvas=document.createElement('canvas');const c=canvas.getContext('2d');
    const maxDim=1800;let w=img.naturalWidth,h=img.naturalHeight;
    if(w>maxDim||h>maxDim){const r=Math.min(maxDim/w,maxDim/h);w=Math.round(w*r);h=Math.round(h*r);}
    canvas.width=w;canvas.height=h;c.drawImage(img,0,0,w,h);
    const imageData=c.getImageData(0,0,w,h);const d=imageData.data;
    let min=255,max=0;
    for(let i=0;i<d.length;i+=4){const gray=Math.round(0.299*d[i]+0.587*d[i+1]+0.114*d[i+2]);d[i]=d[i+1]=d[i+2]=gray;if(gray<min)min=gray;if(gray>max)max=gray;}
    const range=max-min;
    if(range>0&&range<200){const scale=255/range;for(let i=0;i<d.length;i+=4){d[i]=Math.min(255,Math.max(0,Math.round((d[i]-min)*scale)));d[i+1]=d[i+2]=d[i];}}
    const srcData=new Uint8ClampedArray(d);const sharpen=[0,-1,0,-1,5,-1,0,-1,0];
    for(let y=1;y<h-1;y++){for(let x=1;x<w-1;x++){const idx=(y*w+x)*4;let val=0;for(let ky=-1;ky<=1;ky++){for(let kx=-1;kx<=1;kx++){val+=srcData[((y+ky)*w+(x+kx))*4]*sharpen[(ky+1)*3+(kx+1)];}d[idx]=Math.min(255,Math.max(0,val));d[idx+1]=d[idx+2]=d[idx];}}}
    const binData=new Uint8ClampedArray(d);const radius=Math.round(Math.min(w,h)*0.04);
    for(let y=0;y<h;y++){for(let x=0;x<w;x++){const idx=(y*w+x)*4;let sum=0,count=0;for(let dy=-radius;dy<=radius;dy++){for(let dx=-radius;dx<=radius;dx++){const ny=y+dy,nx=x+dx;if(ny>=0&&ny<h&&nx>=0&&nx<w){sum+=binData[(ny*w+nx)*4];count++;}}}d[idx]=d[idx]<(sum/count)-8?0:255;d[idx+1]=d[idx+2]=d[idx];}}
    c.putImageData(imageData,0,0);
    dsSetStep(3);
    const {data}=await Tesseract.recognize(canvas.toDataURL('image/png'),'eng',{logger:function(){},preserve_interword_spaces:'1'});
    const text=(data.text||'').trim();dsState.extractedText=text;
    const ea=document.getElementById('ds-extracted-area');
    if(ea&&text){ea.style.display='block';ea.innerHTML=`<div style="margin-top:12px;padding:12px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius)"><details open><summary style="font-size:12px;font-weight:600;color:var(--text);cursor:pointer"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Extracted Text (${text.length} chars)</summary><pre style="margin-top:8px;padding:10px;background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--radius);font-size:12px;overflow-x:auto;color:var(--text);font-family:var(--font-data)">${esc(text)}</pre></details></div>`;}
    if(!text||text.length<3){dsShowError('Could not read the question clearly. Please upload a sharper image.');dsSolveDone();return;}
    dsSetStep(4);setTimeout(function(){dsSearchAnswer(text);},300);
  }catch(e){console.error('OCR error:',e);dsShowError('OCR failed: '+((e.message||e)+'').slice(0,200));dsSolveDone();}
}

async function dsSearchAnswer(text){
  const settings=dsLoadSettings();const parsed=dsParseQuestion(text);
  const has5Steps=!!document.getElementById('ds-ps-5');
  if(has5Steps)dsSetStep(4);else dsSetStep(2);
  try{
    let answer=null;
    if(dsHasApi(settings)){
      answer=await dsAskAI(text,parsed,settings,null);
    }else{
      answer=dsLocalSearch(text,parsed);
    }
    dsState.answer=answer;
    if(has5Steps)dsSetStep(5);else dsSetStep(3);
    dsRenderAnswer(answer,parsed);
  }catch(e){
    console.error('Search error:',e);
    dsShowError(dsFormatError(e));
  }
  dsSolveDone();
}

function dsParseQuestion(text){
  const lines=text.split('\n').map(l=>l.trim()).filter(l=>l.length>2);
  let subject='General';
  const subjScore={physics:0,chemistry:0,maths:0};
  const phyK=['force','energy','velocity','acceleration','mass','circuit','current','voltage','resistance','lenz','faraday','newton','kinetic','potential','wave','frequency','amplitude','momentum','torque','gravity','field','charge','magnetic','electric','thermo','heat','ray','optics','lens','mirror','friction','spring','oscillation','shm','capacitor','diode','transistor','nuclear','atom','photoelectric','wavelength','diffraction','interference','mole','gas','pressure','volume','temperature','density'];
  const chemK=['mole','bond','hybrid','orbital','enthalpy','entropy','equilibrium','redox','electrochem','cell','reaction','organic','functional','alkane','alkene','alkyne','benzene','alcohol','acid','ester','amine','polymer','biomolecule','carbohydrate','protein','catalyst','activation','rate','order','concentration','titration','ph','buffer','salt','solubility','crystal','lattice','metal','coordination','isomer'];
  const mathK=['differentiate','integrate','derivative','integral','limit','function','matrix','determinant','vector','probability','permutation','combination','binomial','sequence','series','parabola','ellipse','hyperbola','circle','tangent','normal','maximum','minimum','theorem','equation','polynomial','logarithm','trigono','sin','cos','tan','angle','triangle','geometry','calculus','differential','area','volume'];
  const words=text.toLowerCase().split(/\W+/);
  words.forEach(function(w){if(phyK.includes(w))subjScore.physics++;if(chemK.includes(w))subjScore.chemistry++;if(mathK.includes(w))subjScore.maths++;});
  const max=Math.max(subjScore.physics,subjScore.chemistry,subjScore.maths);
  if(max>0){if(subjScore.physics===max)subject='Physics';else if(subjScore.chemistry===max)subject='Chemistry';else subject='Maths';}
  const cleanLines=lines.filter(l=>!/^\d+\s*$|^https?:\/\/|page\s*\d+|jee (main|advanced|mains)/i.test(l)&&l.length>10);
  const question=cleanLines.slice(0,5).join(' ')||text.slice(0,300);
  return{question:question.slice(0,500),subject,lines:cleanLines};
}

const dsHasApi = hasApi;

function dsFormatError(e){
  const msg=e.message||String(e);
  const isCors=msg.includes('Failed to fetch')||msg.includes('NetworkError')||msg.includes('CORS');
  let fix='';
  if(isCors){
    fix='<br><br><b>Serve this file via HTTP.</b> Browsers block API calls from <code>file://</code>.<br>Run: <code>python -m http.server 8080 --bind 127.0.0.1</code>';
  }
  return (isCors?'CORS blocked. ':'')+'Error: '+msg.slice(0,300)+fix;
}

async function dsAskAI(text,parsed,settings,imageData){
  const systemMsg='You are a JEE expert tutor. Provide clear, step-by-step solutions. Use LaTeX notation ($$...$$ for display math, $...$ for inline math) for ALL mathematical expressions. If the user sends multiple messages, maintain context from previous questions.';
  let userMsg;
  if(imageData&&settings.useVision){
    userMsg=[{role:'user',content:[{type:'text',text:'Solve this JEE question step-by-step. Use LaTeX for ALL math expressions.'},{type:'image_url',image_url:{url:imageData}}]}];
  }else{
    userMsg='Solve the following '+parsed.subject+' question step-by-step with clear reasoning.\n\nQuestion: '+parsed.question+'\n\nProvide:\n1. The correct answer\n2. A step-by-step solution\n3. Key concepts tested\n\nUse LaTeX ($$...$$ and $...$) for all math.';
  }
  const messages=[{role:'system',content:systemMsg},{role:'user',content:userMsg}];
  const content=await callAI(messages,settings,{maxTokens:2048});
  const base=(settings.apiBase||'https://api.groq.com/openai/v1').replace(/\/+$/,'');
  const provider=settings.provider==='ollama'?'Ollama':base.includes('groq')?'Groq':base.includes('openrouter')?'OpenRouter':base;
  return{answer:content,subject:parsed.subject,question:parsed.question,sources:[{title:'AI solution',snippet:'Powered by '+provider+' — '+settings.openaiModel,url:''}]};
}

function dsLocalSearch(text,parsed){
  return{question:parsed.question,subject:parsed.subject,sources:[{title:'Setup Required',snippet:'Go to Settings and configure Groq (free) or Ollama (local). Then try again.',url:''}],answer:'',noApi:true};
}

function dsRenderAnswer(answer,parsed){
  const p=pfx();
  const aa=document.getElementById('ds-answer-area');
  if(!aa)return;
  aa.style.display='block';
  const subjColor=parsed.subject==='Physics'?'var(--primary)':parsed.subject==='Chemistry'?'var(--secondary)':'var(--accent)';
  let html=`<div class="${p}-card" style="padding:18px 20px;margin-top:12px">
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px">
      <span style="font-size:10px;padding:3px 10px;border-radius:var(--radius);background:${subjColor}15;color:${subjColor};border:1px solid ${subjColor}30;font-family:var(--font-data);text-transform:uppercase;letter-spacing:0.5px">${parsed.subject}</span>
      <span style="font-size:10px;color:var(--muted);font-family:var(--font-data)">${new Date().toLocaleTimeString()}</span>
    </div>
    <div style="font-size:12px;color:var(--muted);margin-bottom:12px;line-height:1.5">${esc(parsed.question)}</div>`;
  if(answer.answer){
    html+=`<div style="background:rgba(34,197,94,0.06);border:1px solid rgba(34,197,94,0.2);border-radius:var(--radius);padding:14px;margin:12px 0;font-size:12px;color:var(--text);line-height:1.7;white-space:pre-wrap">${esc(answer.answer)}</div>`;
  }
  if(answer.sources&&answer.sources.length){
    html+=`<div style="margin-top:14px"><div style="font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;font-family:var(--font-data)">${answer.answer?'Sources':'Top Matches'}</div>`;
    answer.sources.forEach(function(s,i){
      html+=`<div style="display:flex;gap:10px;padding:10px 0;${i<answer.sources.length-1?'border-bottom:1px solid var(--border)':''}">
        <div style="width:22px;height:22px;border-radius:50%;background:var(--bg-card);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;color:var(--primary);flex-shrink:0;font-family:var(--font-data)">${i+1}</div>
        <div style="flex:1">
          <div style="font-size:12px;font-weight:600;color:var(--text)">${esc(s.title||'Result '+(i+1))}</div>
          <div style="font-size:11px;color:var(--muted);margin-top:2px">${esc(s.snippet||'')}</div>
          ${s.url?`<a href="${esc(s.url)}" target="_blank" rel="noopener" style="font-size:11px;color:var(--primary);margin-top:4px;display:inline-block">Open ⤴</a>`:''}
        </div>
      </div>`;
    });
    html+=`</div>`;
  }
  if(answer.noApi){
    html+=`<div style="margin-top:14px;padding:16px;border-radius:var(--radius);background:rgba(0,240,255,0.03);border:1px solid var(--border);font-size:12px;line-height:1.6">
      <div style="font-weight:700;color:var(--primary);margin-bottom:6px">⚙️ No Provider Configured</div>
      <p style="color:var(--muted);margin:0 0 8px">Click ⚙️ Settings to set up Groq (free) or Ollama (local).</p>
    </div>`;
  }
  html+=`<div style="margin-top:14px;display:flex;align-items:center;gap:8px">
    <span style="font-size:11px;color:var(--muted)">Was this helpful?</span>
    <button id="ds-fb-up" onclick="dsFeedback('up')" style="padding:6px 10px;border-radius:var(--radius);border:1px solid var(--border);background:transparent;color:var(--muted);cursor:pointer;font-size:11px;transition:all 0.2s">👍</button>
    <button id="ds-fb-down" onclick="dsFeedback('down')" style="padding:6px 10px;border-radius:var(--radius);border:1px solid var(--border);background:transparent;color:var(--muted);cursor:pointer;font-size:11px;transition:all 0.2s">👎</button>
  </div></div>`;
  aa.innerHTML=html;
  if(window.renderMathInElement){try{renderMathInElement(aa,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}],throwOnError:false});}catch(e){}}
}

function dsShowError(msg){
  const ea=document.getElementById('ds-error-area');if(!ea)return;
  ea.style.display='block';ea.innerHTML=`<div style="padding:12px 16px;border-radius:var(--radius);background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.2);font-size:12px;color:var(--danger);margin-top:12px">${esc(msg)}</div>`;
}

function dsSolveDone(){
  dsState.loading=false;
  const hasText=!!dsState.textInput.trim();
  const ts=document.getElementById('ds-text-submit');if(ts)ts.disabled=!hasText;
  const sb=document.getElementById('ds-solve-btn');if(sb){sb.disabled=!dsState.imageData;sb.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Solve Doubt';}
  dsSetStep(-1);
}

function dsFeedback(type){
  const up=document.getElementById('ds-fb-up'),down=document.getElementById('ds-fb-down');
  if(up&&down){
    up.style.borderColor=type==='up'?'var(--success)':'var(--border)';
    up.style.color=type==='up'?'var(--success)':'var(--muted)';
    up.style.background=type==='up'?'rgba(34,197,94,0.1)':'transparent';
    down.style.borderColor=type==='down'?'var(--danger)':'var(--border)';
    down.style.color=type==='down'?'var(--danger)':'var(--muted)';
    down.style.background=type==='down'?'rgba(239,68,68,0.1)':'transparent';
  }
  toast('Thanks for your feedback!');
}

/* ═══════════════ CHAT FUNCTIONS ═══════════════ */
function dsSwitchSubject(subj){
  dsChatSubject=subj;
  const el=document.getElementById('ds-tab-content');
  if(el){el.innerHTML=dsRenderChat();dsScrollChatBottom();}
}

function dsChatHandleFile(files){
  if(!files||!files.length)return;
  const f=files[0];
  if(!f.type.match(/^image\/(jpeg|png|webp)$/)){toast('JPG, PNG or WebP only');return;}
  if(f.size>5*1024*1024){toast('Max 5MB');return;}
  const r=new FileReader();
  r.onload=function(e){
    dsState.imageData=e.target.result;
    const preview=document.getElementById('ds-chat-preview');
    const img=document.getElementById('ds-chat-preview-img');
    if(preview&&img){img.src=dsState.imageData;preview.style.display='block';}
  };
  r.readAsDataURL(f);
}

function dsChatRemoveImage(){
  dsState.imageData=null;
  const preview=document.getElementById('ds-chat-preview');if(preview)preview.style.display='none';
}

async function dsSendChat(){
  const ta=document.getElementById('ds-chat-inp');
  const sendBtn=document.getElementById('ds-chat-send');
  const text=(ta?.value||'').trim();
  if(!text&&!dsState.imageData)return;
  const settings=loadSettings();
  if(!hasApi(settings)){toast('Configure Groq or Ollama in Settings');dsOpenSettings();return;}
  if(sendBtn)sendBtn.disabled=true;
  if(ta)ta.disabled=true;
  if(!DB.doubtChats)DB.doubtChats={physics:{messages:[]},chemistry:{messages:[]},maths:{messages:[]}};
  if(!DB.doubtChats[dsChatSubject])DB.doubtChats[dsChatSubject]={messages:[],createdAt:null,updatedAt:null};
  const chat=DB.doubtChats[dsChatSubject];
  const userMsg={id:'msg_'+uid(),role:'user',content:text,image:dsState.imageData||null,ts:Date.now()};
  chat.messages.push(userMsg);
  if(ta)ta.value='';
  dsState.imageData=null;
  const preview=document.getElementById('ds-chat-preview');if(preview)preview.style.display='none';
  const msgsEl=document.getElementById('ds-chat-msgs');
  if(msgsEl){msgsEl.innerHTML+=dsRenderChatMsg(userMsg);dsScrollChatBottom();}
  const loadingId='msg_loading_'+uid();
  const loadingMsg={id:loadingId,role:'assistant',content:'Thinking...',ts:Date.now()};
  if(msgsEl){msgsEl.innerHTML+=dsRenderChatMsg(loadingMsg);dsScrollChatBottom();}
  try{
    const history=chat.messages.filter(m=>!m.id.startsWith('msg_loading')).map(m=>({role:m.role,content:m.content}));
    const systemMsg='You are a JEE expert tutor. Provide clear, step-by-step solutions. Use LaTeX notation ($$...$$ for display math, $...$ for inline math) for ALL mathematical expressions. Maintain context from previous messages in this conversation.';
    const messages=[{role:'system',content:systemMsg},...history];
    const answer=await callAI(messages,settings,{maxTokens:2048});
    const aiMsg={id:'msg_'+uid(),role:'assistant',content:answer,ts:Date.now()};
    chat.messages.push(aiMsg);
    chat.updatedAt=Date.now();
    if(!chat.createdAt)chat.createdAt=Date.now();
    sv('doubtChats');
    const loadingEl=document.getElementById(loadingId);
    if(loadingEl)loadingEl.closest('[style*="display:flex"]')?.remove();
    if(msgsEl){msgsEl.innerHTML+=dsRenderChatMsg(aiMsg);dsScrollChatBottom();}
    if(window.renderMathInElement){try{renderMathInElement(msgsEl,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}],throwOnError:false});}catch(e){}}
  }catch(e){
    console.error('Chat error:',e);
    const loadingEl=document.getElementById(loadingId);
    if(loadingEl)loadingEl.closest('[style*="display:flex"]')?.remove();
    const errMsg={id:'msg_'+uid(),role:'assistant',content:'Error: '+(e.name==='AbortError'?'Request timed out':(e.message||'Failed to get response')).slice(0,200),ts:Date.now()};
    chat.messages.push(errMsg);sv('doubtChats');
    if(msgsEl){msgsEl.innerHTML+=dsRenderChatMsg(errMsg);dsScrollChatBottom();}
  }
  if(sendBtn)sendBtn.disabled=false;
  if(ta)ta.disabled=false;
  if(ta)ta.focus();
}

function dsClearChat(subj){
  cfm2('Clear chat?','This will delete all messages in this subject chat.',()=>{
    DB.doubtChats[subj]={messages:[],createdAt:null,updatedAt:null};
    sv('doubtChats');
    if(dsChatSubject===subj){
      const el=document.getElementById('ds-tab-content');
      if(el){el.innerHTML=dsRenderChat();dsScrollChatBottom();}
    }
    toast('Chat cleared');
  });
}

/* ═══════════════ MIGRATION ═══════════════ */
function dsMigrateHistory(){
  if(!DB.doubtChats)DB.doubtChats={physics:{messages:[],createdAt:null,updatedAt:null},chemistry:{messages:[],createdAt:null,updatedAt:null},maths:{messages:[],createdAt:null,updatedAt:null}};
}

/* ═══════════════ SETTINGS ═══════════════ */
const dsLoadSettings = loadSettings;

function dsOpenSettings(){
  const p=pfx();
  const s=loadSettings();
  const el=function(id){return document.getElementById(id);};
  dsSetProvider(s.provider||'groq');
  if(el('ds-openai-key'))el('ds-openai-key').value=s.openaiKey||'';
  if(el('ds-openai-model-ds'))el('ds-openai-model-ds').value=s.openaiModel||'llama-3.3-70b-versatile';
  if(el('ds-ollama-url'))el('ds-ollama-url').value=s.ollamaUrl||'http://localhost:11434';
  if(el('ds-use-vision'))el('ds-use-vision').checked=s.useVision||false;
  const sel=el('ds-ollama-model');
  if(sel){
    const cached=s.ollamaModels||[];
    const current=s.ollamaModel||'qwen2.5:3b';
    if(cached.length){
      sel.innerHTML=cached.map(m=>`<option value="${esc(m)}" ${m===current?'selected':''}>${esc(m)}</option>`).join('');
    }else{
      sel.innerHTML=`<option value="${esc(current)}">${esc(current)}</option>`;
    }
  }
  if(s.provider==='ollama')dsFetchOllamaModels();
  om('m-ds-settings');
}

function dsSetProvider(prov){
  document.querySelectorAll('.ds-prov-btn').forEach(b=>b.classList.toggle('on',b.dataset.prov===prov));
  const g=document.getElementById('ds-groq-section');
  const o=document.getElementById('ds-ollama-section');
  if(g)g.style.display=prov==='groq'?'block':'none';
  if(o)o.style.display=prov==='ollama'?'block':'none';
}

async function dsFetchOllamaModels(){
  const url=(document.getElementById('ds-ollama-url')?.value||'http://localhost:11434').replace(/\/+$/,'');
  const sel=document.getElementById('ds-ollama-model');
  const current=sel?.value||'';
  try{
    const controller=new AbortController();
    const timeout=setTimeout(function(){controller.abort();},5000);
    const resp=await fetch(url+'/api/tags',{signal:controller.signal});
    clearTimeout(timeout);
    if(!resp.ok)throw new Error('Server not reachable');
    const j=await resp.json();
    const models=(j.models||[]).map(m=>m.name);
    if(sel&&models.length){
      sel.innerHTML=models.map(m=>`<option value="${esc(m)}" ${m===current?'selected':''}>${esc(m)}</option>`).join('');
      const s=loadSettings();s.ollamaModels=models;saveSettings(s);
    }
  }catch(e){
    if(sel&&!sel.options.length)sel.innerHTML=`<option value="${esc(current||'qwen2.5:3b')}">${esc(current||'qwen2.5:3b')}</option>`;
  }
}

function saveDSSettings(){
  const prov=document.querySelector('.ds-prov-btn.on')?.dataset?.prov||'groq';
  const s={provider:prov,apiBase:'https://api.groq.com/openai/v1',openaiKey:document.getElementById('ds-openai-key')?.value?.trim()||'',openaiModel:document.getElementById('ds-openai-model-ds')?.value?.trim()||'llama-3.3-70b-versatile',ollamaUrl:document.getElementById('ds-ollama-url')?.value?.trim()||'http://localhost:11434',ollamaModel:document.getElementById('ds-ollama-model')?.value||'qwen2.5:3b',useVision:document.getElementById('ds-use-vision')?.checked||false};
  saveSettings(s);cm('m-ds-settings');toast('Settings saved');
}

/* ═══════════════ WINDOW EXPORTS ═══════════════ */
window.renderDoubtSolver=renderDoubtSolver;
window.dsSwitchTab=dsSwitchTab;
window.dsRenderQuickAsk=dsRenderQuickAsk;
window.dsRenderChat=dsRenderChat;
window.dsRenderChatMsg=dsRenderChatMsg;
window.dsScrollChatBottom=dsScrollChatBottom;
window.dsHandleFile=dsHandleFile;
window.dsOnTextInput=dsOnTextInput;
window.dsRemoveImage=dsRemoveImage;
window.dsClearResults=dsClearResults;
window.dsSetStep=dsSetStep;
window.dsSolve=dsSolve;
window.dsSolveVision=dsSolveVision;
window.dsRunOCR=dsRunOCR;
window.dsSearchAnswer=dsSearchAnswer;
window.dsParseQuestion=dsParseQuestion;
window.dsHasApi=dsHasApi;
window.dsFormatError=dsFormatError;
window.dsAskAI=dsAskAI;
window.dsLocalSearch=dsLocalSearch;
window.dsRenderAnswer=dsRenderAnswer;
window.dsShowError=dsShowError;
window.dsSolveDone=dsSolveDone;
window.dsFeedback=dsFeedback;
window.dsSwitchSubject=dsSwitchSubject;
window.dsChatHandleFile=dsChatHandleFile;
window.dsChatRemoveImage=dsChatRemoveImage;
window.dsSendChat=dsSendChat;
window.dsClearChat=dsClearChat;
window.dsMigrateHistory=dsMigrateHistory;
window.dsLoadSettings=dsLoadSettings;
window.dsOpenSettings=dsOpenSettings;
window.dsSetProvider=dsSetProvider;
window.dsFetchOllamaModels=dsFetchOllamaModels;
window.saveDSSettings=saveDSSettings;
