import { DB, sv } from '../js/data.js';
import { uid, esc, cm, om, toast } from '../js/helpers.js';

// page-js/doubt-solver.js
let dsState={step:0,imageData:null,imageFile:null,extractedText:'',textInput:'',answer:null,loading:false};
let dsTab='quick'; // 'quick' or 'chat'
let dsChatSubject='physics'; // current chat subject
const DS_SUBJS={physics:{label:'⚡ Physics',color:'var(--phys)'},chemistry:{label:'⚗️ Chemistry',color:'var(--chem)'},maths:{label:'📐 Maths',color:'var(--math)'}};
function renderDoubtSolver(el){
  dsMigrateHistory();
  el.innerHTML=`<div class="ds-wrap anim-up">
    <div class="pg-hdr ds-header">
      <div class="pg-title">📸 Doubt Solver</div>
      <div class="pg-sub">Quick one-shot answers or start a conversation with AI.</div>
    </div>
    <div class="ds-tabs">
      <button class="ds-tab ${dsTab==='quick'?'on':''}" onclick="dsSwitchTab('quick')">⚡ Quick Ask</button>
      <button class="ds-tab ${dsTab==='chat'?'on':''}" onclick="dsSwitchTab('chat')">💬 Chat</button>
      <button class="btn btn-ghost btn-xs" onclick="dsOpenSettings()" style="margin-left:auto">⚙️</button>
    </div>
    <div id="ds-tab-content">${dsTab==='quick'?dsRenderQuickAsk():dsRenderChat()}</div>
  </div>`;
  if(dsTab==='quick')setupDZ('ds-dz','ds-finp',dsHandleFile);
}
function dsSwitchTab(tab){
  dsTab=tab;
  const el=document.getElementById('ds-tab-content');
  if(!el)return;
  document.querySelectorAll('.ds-tab').forEach(b=>b.classList.toggle('on',b.textContent.includes(tab==='quick'?'Quick':'Chat')));
  el.innerHTML=tab==='quick'?dsRenderQuickAsk():dsRenderChat();
  if(tab==='quick')setupDZ('ds-dz','ds-finp',dsHandleFile);
  if(tab==='chat')dsScrollChatBottom();
}
function dsRenderQuickAsk(){
  return `<div class="gc section-block" style="padding:20px">
    <div id="ds-upload-area">
      <label class="dz ds-dz" id="ds-dz">
        <div class="dz-icon">📷</div>
        <div class="dz-title">Upload a photo of your doubt</div>
        <div class="dz-sub">JPG, PNG or WebP · max 5MB</div>
        <input type="file" id="ds-finp" accept="image/jpeg,image/png,image/webp" onchange="dsHandleFile(this.files)"/>
      </label>
      <div style="display:flex;align-items:center;gap:12px;margin:14px 0 6px">
        <div style="flex:1;height:1px;background:var(--border)"></div>
        <span style="font-size:10px;color:var(--faint);font-weight:600;text-transform:uppercase;letter-spacing:.05em">or type your question</span>
        <div style="flex:1;height:1px;background:var(--border)"></div>
      </div>
      <textarea id="ds-text-inp" class="inp" rows="3" placeholder="Type or paste your doubt here..." style="font-size:13px;resize:vertical" oninput="dsOnTextInput(this.value)"></textarea>
      <button class="btn btn-primary" id="ds-text-submit" disabled onclick="dsSolve()" style="width:100%;margin-top:10px;justify-content:center;padding:12px 22px">🔍 Solve Doubt</button>
    </div>
    <div id="ds-preview-area" style="display:none">
      <div class="ds-preview">
        <img id="ds-preview-img" src="" alt="Uploaded doubt"/>
        <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">
          <button class="btn btn-ghost btn-sm" onclick="dsRemoveImage()">✕ Remove</button>
          <button class="btn btn-primary" id="ds-solve-btn" disabled onclick="dsSolve()" style="padding:10px 22px">🔍 Solve Doubt</button>
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
  const chats=DB.doubtChats||{physics:{messages:[]},chemistry:{messages:[]},maths:{messages:[]}};
  const subjBtns=Object.entries(DS_SUBJS).map(([k,v])=>`<button class="ds-chat-subj ${dsChatSubject===k?'on':''}" style="${dsChatSubject===k?'border-color:'+v.color+';color:'+v.color+';background:'+v.color+'12':''}" onclick="dsSwitchSubject('${k}')">${v.label}</button>`).join('');
  const msgs=(chats[dsChatSubject]?.messages||[]);
  const msgHtml=msgs.length?msgs.map(m=>dsRenderChatMsg(m)):`<div class="ds-empty" style="padding:60px 20px"><div style="font-size:40px;margin-bottom:12px">💬</div>Start a conversation about ${DS_SUBJS[dsChatSubject].label.replace(/^[^\s]+\s/,'')}!<br><span style="font-size:11px;color:var(--faint)">Upload an image or type your question.</span></div>`;
  return `<div class="gc section-block" style="padding:0;overflow:hidden;display:flex;flex-direction:column;height:min(70dvh,600px)">
    <div class="ds-chat-subj-bar">${subjBtns}</div>
    <div class="ds-chat-msgs" id="ds-chat-msgs">${msgHtml}</div>
    <div class="ds-chat-input-area">
      <div id="ds-chat-preview" style="display:none;padding:8px 14px;border-bottom:1px solid var(--border)">
        <div style="display:flex;align-items:center;gap:8px"><img id="ds-chat-preview-img" style="max-height:60px;border-radius:6px;object-fit:cover"/><span style="font-size:11px;color:var(--muted)">Image attached</span><button class="btn btn-ghost btn-xs" onclick="dsChatRemoveImage()">✕</button></div>
      </div>
      <div style="display:flex;gap:8px;padding:12px 14px;align-items:flex-end">
        <label class="btn btn-ghost btn-xs" style="flex-shrink:0;cursor:pointer;padding:8px 10px">📷<input type="file" accept="image/jpeg,image/png,image/webp" style="display:none" onchange="dsChatHandleFile(this.files)"/></label>
        <textarea id="ds-chat-inp" class="inp" rows="1" placeholder="Ask anything..." style="flex:1;resize:none;font-size:13px;max-height:120px;min-height:38px;padding:8px 12px" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();dsSendChat();}"></textarea>
        <button class="btn btn-primary btn-xs" id="ds-chat-send" onclick="dsSendChat()" style="flex-shrink:0;padding:8px 14px">Send</button>
      </div>
      ${msgs.length>2?`<div style="padding:4px 14px 8px;text-align:center"><button class="btn btn-ghost btn-xs" onclick="dsClearChat('${dsChatSubject}')">🗑️ Clear chat</button></div>`:''}
    </div>
  </div>`;
}
function dsRenderChatMsg(m){
  const isUser=m.role==='user';
  const bubbleClass=isUser?'ds-chat-bubble-user':'ds-chat-bubble-ai';
  let content=esc(m.content||'');
  if(!isUser&&window.renderMathInElement){
    content=content.replace(/\n/g,'<br>');
  }
  let imgHtml='';
  if(m.image){
    imgHtml=`<img src="${esc(m.image)}" style="max-width:200px;max-height:150px;border-radius:8px;object-fit:cover;margin-bottom:8px;cursor:pointer" onclick="pvFile('${esc(m.image).replace(/'/g,"\\'")}','Image')"/>`;
  }
  return `<div class="ds-chat-msg ${isUser?'ds-chat-msg-user':'ds-chat-msg-ai'}">
    ${imgHtml}
    <div class="ds-chat-bubble ${bubbleClass}">${isUser?content:content}</div>
    <div class="ds-chat-ts">${new Date(m.ts).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>
  </div>`;
}
function dsScrollChatBottom(){
  setTimeout(()=>{
    const el=document.getElementById('ds-chat-msgs');
    if(el)el.scrollTop=el.scrollHeight;
  },50);
}
/* Quick Ask helpers */
function dsHandleFile(files){
  if(!files||!files.length)return;
  const f=files[0];
  if(!f.type.match(/^image\/(jpeg|png|webp)$/)){toast('⚠️ JPG, PNG or WebP only');return;}
  if(f.size>5*1024*1024){toast('⚠️ Max 5MB');return;}
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
  if(!hasImage&&!hasText){toast('⚠️ Upload an image or type a question');return;}
  const settings=dsLoadSettings();
  dsState.loading=true;
  document.getElementById('ds-text-submit').disabled=true;
  dsClearResults();
  const btn=document.getElementById('ds-solve-btn');
  const modeLabel=hasImage?(settings.useVision?'🧠 Analyzing with Vision AI...':'🔍 Scanning & Solving...'):'🤖 Solving...';
  if(btn){btn.disabled=true;btn.innerHTML='<span class="spinner" style="display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,.2);border-top-color:#fff;border-radius:50%;animation:spin .6s linear infinite;vertical-align:middle;margin-right:6px"></span> '+modeLabel;}
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
    if(ea&&text){ea.style.display='block';ea.innerHTML=`<div class="ds-extracted"><details open><summary>📝 Extracted Text (${text.length} chars)</summary><pre>${esc(text)}</pre></details></div>`;}
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
function dsHasApi(settings){
  return !!(settings.openaiKey||(settings.provider==='ollama'&&settings.ollamaUrl));
}
function dsHasApiKey(settings){
  return !!(settings.openaiKey);
}
function dsFormatError(e){
  const msg=e.message||String(e);
  const isCors=msg.includes('Failed to fetch')||msg.includes('NetworkError')||msg.includes('CORS');
  let fix='';
  if(isCors){
    fix='<br><br>💡 <b>Serve this file via HTTP.</b> Browsers block API calls from <code>file://</code>.<br>Run: <code>python -m http.server 8080 --bind 127.0.0.1</code>';
  }
  return (isCors?'🌐 CORS blocked. ':'')+'Error: '+msg.slice(0,300)+fix;
}
async function dsAskAI(text,parsed,settings,imageData){
  const systemMsg='You are a JEE expert tutor. Provide clear, step-by-step solutions. Use LaTeX notation ($$...$$ for display math, $...$ for inline math) for ALL mathematical expressions. If the user sends multiple messages, maintain context from previous questions.';
  let userMsg;
  if(imageData&&settings.useVision){
    userMsg=[{type:'text',text:'Solve this JEE question step-by-step. Use LaTeX for ALL math expressions.'},{type:'image_url',image_url:{url:imageData}}];
  }else{
    userMsg='Solve the following '+parsed.subject+' question step-by-step with clear reasoning.\n\nQuestion: '+parsed.question+'\n\nProvide:\n1. The correct answer\n2. A step-by-step solution\n3. Key concepts tested\n\nUse LaTeX ($$...$$ and $...$) for all math.';
  }
  if(settings.provider==='ollama'){
    return dsAskOllama(userMsg,systemMsg,settings);
  }
  const base=(settings.apiBase||'https://api.groq.com/openai/v1').replace(/\/+$/,'');
  const apiUrl=base+'/chat/completions';
  const headers={'Content-Type':'application/json','Authorization':'Bearer '+settings.openaiKey};
  const body=JSON.stringify({model:settings.openaiModel||'llama-3.3-70b-versatile',messages:[{role:'system',content:systemMsg},{role:'user',content:userMsg}],max_tokens:2048});
  const resp=await fetch(apiUrl,{method:'POST',headers,body});
  if(!resp.ok){const e=await resp.text();throw new Error('API error ('+resp.status+'): '+e.slice(0,200));}
  const j=await resp.json();
  const content=j.choices?.[0]?.message?.content||'No answer generated.';
  const provider=base.includes('groq')?'Groq':base.includes('openrouter')?'OpenRouter':base;
  return{answer:content,subject:parsed.subject,question:parsed.question,sources:[{title:'AI solution',snippet:'Powered by '+provider+' — '+settings.openaiModel,url:''}]};
}
async function dsAskOllama(userMsg,systemMsg,settings){
  const ollamaUrl=(settings.ollamaUrl||'http://localhost:11434').replace(/\/+$/,'');
  const model=settings.ollamaModel||'qwen2.5:3b';
  let prompt=typeof userMsg==='string'?userMsg:(userMsg.find(m=>m.type==='text')?.text||'Solve this question.');
  const messages=[{role:'system',content:systemMsg},{role:'user',content:prompt}];
  const resp=await fetch(ollamaUrl+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model,messages,stream:false})});
  if(!resp.ok){const e=await resp.text();throw new Error('Ollama error ('+resp.status+'): '+e.slice(0,200));}
  const j=await resp.json();
  const content=j.message?.content||'No answer generated.';
  return{answer:content,subject:'General',question:typeof userMsg==='string'?userMsg.slice(0,200):'Image question',sources:[{title:'AI solution',snippet:'Powered by Ollama — '+model,url:''}]};
}
function dsLocalSearch(text,parsed){
  return{question:parsed.question,subject:parsed.subject,sources:[{title:'Setup Required','snippet':'Go to ⚙️ Settings and configure Groq (free) or Ollama (local). Then try again.',url:''}],answer:'',noApi:true};
}
function dsRenderAnswer(answer,parsed){
  const aa=document.getElementById('ds-answer-area');
  if(!aa)return;
  aa.style.display='block';
  const subjColor=parsed.subject==='Physics'?'var(--phys)':parsed.subject==='Chemistry'?'var(--chem)':'var(--accent)';
  let html=`<div class="ds-answer gc" style="padding:18px 20px;margin-top:12px">
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px">
      <span class="ds-subj-tag" style="background:${subjColor}15;color:${subjColor};border:1px solid ${subjColor}30">${parsed.subject}</span>
      <span style="font-size:10px;color:var(--faint)">${new Date().toLocaleTimeString()}</span>
    </div>
    <div class="ds-q-text">${esc(parsed.question)}</div>`;
  if(answer.answer){
    html+=`<div style="background:rgba(16,185,129,.06);border:1px solid rgba(16,185,129,.15);border-radius:8px;padding:14px;margin:12px 0;font-size:12px;color:var(--txt);line-height:1.7;white-space:pre-wrap">${esc(answer.answer)}</div>`;
  }
  if(answer.sources&&answer.sources.length){
    html+=`<div style="margin-top:14px"><div style="font-size:10px;font-weight:700;color:var(--faint);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">${answer.answer?'Sources':'Top Matches'}</div>`;
    answer.sources.forEach(function(s,i){
      html+=`<div class="ds-source"><div class="ds-src-num">${i+1}</div><div class="ds-src-info"><div class="ds-src-title">${esc(s.title||'Result '+(i+1))}</div><div class="ds-src-snippet">${esc(s.snippet||'')}</div>${s.url?`<a class="ds-src-link" href="${esc(s.url)}" target="_blank" rel="noopener">Open ⤴</a>`:''}</div></div>`;
    });
    html+=`</div>`;
  }
  if(answer.noApi){
    html+=`<div style="margin-top:14px;padding:16px;border-radius:10px;background:rgba(160,160,160,.08);border:1px solid rgba(160,160,160,.15);font-size:12px;line-height:1.6">
      <div style="font-weight:700;color:var(--accent);margin-bottom:6px">⚙️ No Provider Configured</div>
      <p style="color:var(--muted);margin:0 0 8px">Click ⚙️ Settings to set up Groq (free) or Ollama (local).</p>
    </div>`;
  }
  html+=`<div class="ds-feedback"><span>Was this helpful?</span>
    <button id="ds-fb-up" onclick="dsFeedback('up')">👍</button>
    <button id="ds-fb-down" onclick="dsFeedback('down')">👎</button>
  </div></div>`;
  aa.innerHTML=html;
  if(window.renderMathInElement){try{renderMathInElement(aa,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}],throwOnError:false});}catch(e){}}
}
function dsShowError(msg){
  const ea=document.getElementById('ds-error-area');if(!ea)return;
  ea.style.display='block';ea.innerHTML=`<div class="ds-error">${esc(msg)}</div>`;
}
function dsSolveDone(){
  dsState.loading=false;
  const hasText=!!dsState.textInput.trim();
  const ts=document.getElementById('ds-text-submit');if(ts)ts.disabled=!hasText;
  const sb=document.getElementById('ds-solve-btn');if(sb){sb.disabled=!dsState.imageData;sb.innerHTML='🔍 Solve Doubt';}
  dsSetStep(-1);
}
function dsFeedback(type){
  const up=document.getElementById('ds-fb-up'),down=document.getElementById('ds-fb-down');
  if(up&&down){up.classList.toggle('ds-fb-on',type==='up');down.classList.toggle('ds-fb-on',type==='down');}
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
  if(!f.type.match(/^image\/(jpeg|png|webp)$/)){toast('⚠️ JPG, PNG or WebP only');return;}
  if(f.size>5*1024*1024){toast('⚠️ Max 5MB');return;}
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
  const settings=dsLoadSettings();
  if(!dsHasApi(settings)){toast('⚠️ Configure Groq or Ollama in Settings');dsOpenSettings();return;}
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
  const ctrl=new AbortController();
  const tid=setTimeout(()=>ctrl.abort(),settings.provider==='ollama'?120000:60000);
  try{
    const history=chat.messages.filter(m=>!m.id.startsWith('msg_loading')).map(m=>({role:m.role,content:m.content}));
    const systemMsg='You are a JEE expert tutor. Provide clear, step-by-step solutions. Use LaTeX notation ($$...$$ for display math, $...$ for inline math) for ALL mathematical expressions. Maintain context from previous messages in this conversation.';
    const messages=[{role:'system',content:systemMsg},...history];
    let answer;
    const tryGroq=async()=>{
      const base=(settings.apiBase||'https://api.groq.com/openai/v1').replace(/\/+$/,'');
      const resp=await fetch(base+'/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+settings.openaiKey},signal:ctrl.signal,body:JSON.stringify({model:settings.openaiModel||'llama-3.3-70b-versatile',messages,max_tokens:2048})});
      if(!resp.ok)throw new Error('API error '+resp.status);
      const j=await resp.json();
      return j.choices?.[0]?.message?.content||'No answer generated.';
    };
    const tryOllama=async()=>{
      const ollamaUrl=(settings.ollamaUrl||'http://localhost:11434').replace(/\/+$/,'');
      const resp=await fetch(ollamaUrl+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},signal:ctrl.signal,body:JSON.stringify({model:settings.ollamaModel||'qwen2.5:3b',messages,stream:false})});
      if(!resp.ok)throw new Error('Ollama error '+resp.status);
      const j=await resp.json();
      return j.message?.content||'No answer generated.';
    };
    if(settings.provider==='ollama'){
      answer=await tryOllama();
    }else{
      try{
        answer=await tryGroq();
      }catch(groqErr){
        clearTimeout(tid);
        const m=(groqErr.message||'').toLowerCase();
        if(m.includes('429')||m.includes('rate')||m.includes('limit')||m.includes('quota')||m.includes('tokens per')){
          toast('⚡ Groq limit — switching to Ollama...');
          answer=await tryOllama();
        }else throw groqErr;
      }
    }
    const aiMsg={id:'msg_'+uid(),role:'assistant',content:answer,ts:Date.now()};
    chat.messages.push(aiMsg);
    chat.updatedAt=Date.now();
    if(!chat.createdAt)chat.createdAt=Date.now();
    sv('doubtChats');
    const loadingEl=document.getElementById(loadingId);
    if(loadingEl)loadingEl.closest('.ds-chat-msg')?.remove();
    if(msgsEl){msgsEl.innerHTML+=dsRenderChatMsg(aiMsg);dsScrollChatBottom();}
    if(window.renderMathInElement){try{renderMathInElement(msgsEl,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}],throwOnError:false});}catch(e){}}
  }catch(e){
    clearTimeout(tid);
    console.error('Chat error:',e);
    const loadingEl=document.getElementById(loadingId);
    if(loadingEl)loadingEl.closest('.ds-chat-msg')?.remove();
    const errMsg={id:'msg_'+uid(),role:'assistant',content:'⚠️ Error: '+(e.name==='AbortError'?'Request timed out':(e.message||'Failed to get response')).slice(0,200),ts:Date.now()};
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
    toast('🗑️ Chat cleared');
  });
}

/* ═══════════════ MIGRATION ═══════════════ */
function dsMigrateHistory(){
  if(!DB.doubtChats)DB.doubtChats={physics:{messages:[],createdAt:null,updatedAt:null},chemistry:{messages:[],createdAt:null,updatedAt:null},maths:{messages:[],createdAt:null,updatedAt:null}};
}

/* ═══════════════ SETTINGS ═══════════════ */
function dsLoadSettings(){
  const defaults={provider:'groq',apiBase:'https://api.groq.com/openai/v1',openaiKey:'',openaiModel:'llama-3.3-70b-versatile',ollamaUrl:'http://localhost:11434',ollamaModel:'qwen2.5:3b',ollamaModels:[],useVision:false};
  try{
    const raw=localStorage.getItem(KEYS.dsSettings);
    if(raw){
      const saved=JSON.parse(raw);
      const merged=Object.assign({},defaults,saved);
      if(!saved.provider&&saved.apiBase&&saved.apiBase.includes('11434')){merged.provider='ollama';merged.ollamaUrl=saved.apiBase;}
      return merged;
    }
  }catch(e){}
  return defaults;
}
function dsOpenSettings(){
  const s=dsLoadSettings();
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
      const s=dsLoadSettings();s.ollamaModels=models;dsSaveSettings(s);
    }
  }catch(e){
    if(sel&&!sel.options.length)sel.innerHTML=`<option value="${esc(current||'qwen2.5:3b')}">${esc(current||'qwen2.5:3b')}</option>`;
  }
}
function saveDSSettings(){
  const prov=document.querySelector('.ds-prov-btn.on')?.dataset?.prov||'groq';
  const s={provider:prov,apiBase:'https://api.groq.com/openai/v1',openaiKey:document.getElementById('ds-openai-key')?.value?.trim()||'',openaiModel:document.getElementById('ds-openai-model-ds')?.value?.trim()||'llama-3.3-70b-versatile',ollamaUrl:document.getElementById('ds-ollama-url')?.value?.trim()||'http://localhost:11434',ollamaModel:document.getElementById('ds-ollama-model')?.value||'qwen2.5:3b',useVision:document.getElementById('ds-use-vision')?.checked||false};
  dsSaveSettings(s);cm('m-ds-settings');toast('✅ Settings saved');
}
function dsSaveSettings(settings){
  try{localStorage.setItem(KEYS.dsSettings,JSON.stringify(settings));}catch(e){}
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
window.dsHasApiKey=dsHasApiKey;
window.dsFormatError=dsFormatError;
window.dsAskAI=dsAskAI;
window.dsAskOllama=dsAskOllama;
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
window.dsSaveSettings=dsSaveSettings;
