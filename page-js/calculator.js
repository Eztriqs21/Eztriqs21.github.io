// page-js/calculator.js
/* ═══════════════ CALCULATOR ═══════════════ */
let calcQuestions=[],calcShowResults=false,calcAnsKey={};

function initCalcQ(){
  calcQuestions=[];
  ['physics','chemistry','maths'].forEach((subj,si)=>{
    for(let i=1;i<=25;i++)calcQuestions.push({num:si*25+i,subj,subjLabel:['Physics','Chemistry','Maths'][si],selected:null,unattempted:false,mode:'mcq',intVal:'',multiVal:''});
  });
}
let currentFocusQ=1;

function renderCalculator(el){
  if(!calcQuestions.length)initCalcQ();
  const ans=calcQuestions.filter(q=>q.selected&&!q.unattempted).length;
  const skp=calcQuestions.filter(q=>q.unattempted).length;
  const pend=75-ans-skp;
  const activeTab=calcActiveTab||'manual';
  el.innerHTML=`
  <div class="pg-hdr anim-up"><div class="pg-title">Calculator</div><div class="pg-sub">Full JEE mock evaluation engine</div></div>

  <div class="ptabs anim-up d1">
    <button class="ptab ${activeTab==='manual'?'on':''}" onclick="switchCalcTab('manual')">🧮 Manual Calculator</button>
  </div>

  <div class="calc-mode ${activeTab==='manual'?'open':''}" id="calc-mode-manual">
  <div class="gc section-block anim-up d2" style="padding:20px">
    <div class="section-title">🗝️ Answer Key <span style="font-size:10px;font-weight:400;color:var(--faint)">(required)</span></div>
    <p style="font-size:11px;color:var(--muted);margin-bottom:12px;line-height:1.6">Enter official key for exact scoring. Supports MCQ (<code style="background:rgba(255,255,255,.07);padding:1px 6px;border-radius:4px">1:A, 2:C</code>), Integer (<code style="background:rgba(255,255,255,.07);padding:1px 6px;border-radius:4px">1:25, 2:100</code>), and Multi-Correct (<code style="background:rgba(255,255,255,.07);padding:1px 6px;border-radius:4px">1:ABD, 2:CD</code>).</p>
    <textarea class="inp" id="calc-key-txt" rows="3" placeholder="Paste answer key...&#10;e.g. 1:A, 2:C, 3:D, 4:B, 5:A ...&#10;integer: 1:25, 2:100, 3:45 ...&#10;multi-correct: 1:ABD, 2:CD, 3:ABC"></textarea>
    <div style="display:flex;align-items:center;gap:10px;margin-top:8px">
      <button class="btn btn-ghost btn-sm" onclick="applyAnsKey()">Apply Key</button>
      <span id="key-status" style="font-size:11px;color:var(--green)"></span>
    </div>
  </div>

  <div class="gc section-block anim-up d3" style="overflow:hidden;padding:20px">
    <div style="padding:0 0 10px;font-size:11px;color:var(--faint);margin-bottom:6px">
      💡 Keyboard shortcuts: <b>A/B/C/D</b> to select · <b>0-9</b> for Integer type · <b>S</b> to skip · <b>Enter</b> next question · Toggle <b>MCQ</b>/<b>INT</b>/<b>MULTI</b> per question
    </div>
    <div style="padding:0 0 12px;border-bottom:1px solid rgba(255,255,255,.05);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
      <div style="font-size:13px;font-weight:700">📋 Response Sheet — 75 Questions</div>
      <div style="font-size:11px;color:var(--muted)">${ans} answered · ${skp} skipped · ${pend} remaining</div>
    </div>
    <div class="q-matrix-wrap">
      <div class="q-matrix">
        <div class="q-matrix-header"><div>Q#</div><div>Subject</div><div>Type</div><div>Response</div><div>Skip</div></div>
        <div id="q-mat-body" style="max-height:440px;overflow-y:auto;-webkit-overflow-scrolling:touch">${buildQMat()}</div>
      </div>
    </div>
    <div style="padding:14px 0 0;border-top:1px solid rgba(255,255,255,.05);display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap">
      <button class="btn btn-ghost btn-sm" onclick="resetCalc()">🔄 Reset</button>
      <button class="btn btn-primary" onclick="evalCalc()" style="padding:10px 22px">🧮 Calculate Score</button>
    </div>
  </div>

  <div id="calc-results" style="margin-top:16px;display:${calcShowResults?'block':'none'}">${calcShowResults?buildCalcRes():''}</div>
  </div>

  `;

  attachCalcKeyboard();
}
function switchCalcTab(tab){
  calcActiveTab=tab;
  if(PAGE==='calculator')renderCalculator(document.getElementById('content-wrap'));
}
let calcActiveTab='manual';
function buildQMat(){
  const sc={physics:'var(--phys)',chemistry:'var(--chem)',maths:'var(--math)'};
  return calcQuestions.map(q=>`<div class="q-row ${q.num===currentFocusQ?'q-focus':''}" id="qrow-${q.num}" tabindex="-1" onclick="focusQRow(${q.num})">
    <div class="q-num" style="color:${sc[q.subj]}">Q${q.num}</div>
    <div class="q-subj">${q.subjLabel}</div>
    <div class="q-type-toggle" onclick="event.stopPropagation();toggleQType(${q.num})" style="cursor:pointer;font-size:9px;text-align:center;color:var(--indigo);font-weight:600;padding:2px 4px;border-radius:4px;background:rgba(99,102,241,.1)">${q.mode==='int'?'INT':q.mode==='multi'?'MULTI':'MCQ'}</div>
    ${q.mode==='int'?`<div class="q-opt" style="grid-column:span 1"><input type="number" class="q-int-input" min="0" max="9999" value="${q.intVal||''}" onchange="setQIntResp(${q.num},this.value)" onfocus="focusQRow(${q.num})" onkeydown="intKeyHandler(event,${q.num})" placeholder="___" style="width:100%;padding:6px 8px;border-radius:6px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#fff;font-size:14px;text-align:center;font-weight:600;outline:none"/></div>`:
    q.mode==='multi'?`<div class="q-opt" style="display:flex;gap:8px;justify-content:center;grid-column:span 1">${['A','B','C','D'].map(opt=>`<label style="display:flex;align-items:center;gap:2px;font-size:10px;color:var(--muted);cursor:pointer"><input type="checkbox" class="q-multi-cb" value="${opt}" ${q.selected&&q.selected.includes(opt)?'checked':''} onchange="setQMultiResp(${q.num})"/>${opt}</label>`).join('')}</div>`:
    `<div class="q-opt" style="display:flex;gap:8px;justify-content:center;grid-column:span 1">${['A','B','C','D'].map(opt=>`<label style="display:flex;align-items:center;gap:2px;font-size:10px;color:var(--muted);cursor:pointer"><input type="radio" class="q-radio" name="q${q.num}" value="${opt}" ${q.selected===opt&&!q.unattempted?'checked':''} onchange="setQResp(${q.num},'${opt}')"/>${opt}</label>`).join('')}</div>`}
    <div class="q-skip-btn"><button class="${q.unattempted?'on':''}" onclick="event.stopPropagation();toggleQSkip(${q.num})">${q.unattempted?'Skipped':'Skip'}</button></div>
  </div>`).join('');
}
function setQResp(num,opt){
  const q=calcQuestions.find(x=>x.num===num);if(!q)return;
  q.selected=opt;q.unattempted=false;q.intVal='';
  const row=document.getElementById('qrow-'+num);
  if(row){
    row.querySelectorAll('.q-skip-btn button').forEach(b=>{b.className='';b.textContent='Skip';});
    row.querySelectorAll('.q-radio').forEach(r=>{r.checked=r.value===opt;});
    row.classList.remove('q-focus');
  }
  calcShowResults=false;const r=document.getElementById('calc-results');if(r)r.style.display='none';
  const nextQ=calcQuestions.find(x=>x.num===num+1);
  if(nextQ){focusQRow(nextQ.num);}
}
function toggleQSkip(num){
  const q=calcQuestions.find(x=>x.num===num);if(!q)return;
  q.unattempted=!q.unattempted;
    if(q.unattempted){
      q.selected=null;q.intVal='';q.multiVal='';
      const row=document.getElementById('qrow-'+num);
      if(row){row.querySelectorAll('input[type=radio]').forEach(r=>r.checked=false);row.querySelectorAll('.q-multi-cb').forEach(c=>c.checked=false);const inp=row.querySelector('.q-int-input');if(inp)inp.value='';}
    }
  const row=document.getElementById('qrow-'+num);
  if(row){
    row.querySelectorAll('.q-skip-btn button').forEach(b=>{b.className=q.unattempted?'on':'';b.textContent=q.unattempted?'Skipped':'Skip';});
    if(!q.unattempted&&q.selected){if(q.mode==='mcq')row.querySelectorAll('.q-radio').forEach(r=>{r.checked=r.value===q.selected;});}
    row.classList.remove('q-focus');
  }
  calcShowResults=false;const r=document.getElementById('calc-results');if(r)r.style.display='none';
  const nextQ=calcQuestions.find(x=>x.num===num+1);
  if(nextQ){focusQRow(nextQ.num);}
}
function toggleQType(num){
  const q=calcQuestions.find(x=>x.num===num);if(!q)return;
  const modes=['mcq','int','multi'];
  const cur=q.mode;
  const idx=modes.indexOf(cur);
  q.mode=modes[(idx+1)%modes.length];
  q.selected=null;q.intVal='';q.multiVal='';q.unattempted=false;
  calcShowResults=false;const r=document.getElementById('calc-results');if(r)r.style.display='none';
  const body=document.getElementById('q-mat-body');
  if(body)body.innerHTML=buildQMat();
  focusQRow(num);
}
function setQMultiResp(num){
  const q=calcQuestions.find(x=>x.num===num);if(!q)return;
  const cbs=document.querySelectorAll('#qrow-'+num+' .q-multi-cb');
  const selected=[];
  cbs.forEach(cb=>{if(cb.checked)selected.push(cb.value);});
  q.multiVal=selected.join('');
  q.selected=q.multiVal||null;
  q.unattempted=false;
  calcShowResults=false;const r=document.getElementById('calc-results');if(r)r.style.display='none';
  const row=document.getElementById('qrow-'+num);
  if(row)row.classList.remove('q-focus');
  const nextQ=calcQuestions.find(x=>x.num===num+1);
  if(nextQ){focusQRow(nextQ.num);}
}
function setQIntResp(num,val){
  const q=calcQuestions.find(x=>x.num===num);if(!q)return;
  q.intVal=val;q.selected=val||null;q.unattempted=false;
  const row=document.getElementById('qrow-'+num);
  if(row)row.classList.remove('q-focus');
  const nextQ=calcQuestions.find(x=>x.num===num+1);
  if(nextQ&&val){focusQRow(nextQ.num);}
}
function intKeyHandler(e,num){
  if(e.key==='Enter'){e.preventDefault();const nq=calcQuestions.find(x=>x.num===num+1);if(nq)focusQRow(nq.num);}
  if(e.key==='ArrowDown'){e.preventDefault();const nq=calcQuestions.find(x=>x.num===num+1);if(nq)focusQRow(nq.num);}
  if(e.key==='ArrowUp'){e.preventDefault();const pq=calcQuestions.find(x=>x.num===num-1);if(pq)focusQRow(pq.num);}
}
function applyAnsKey(){
  const txt=document.getElementById('calc-key-txt').value.trim();
  if(!txt){toast('⚠️ Paste an answer key first');return;}
  calcAnsKey={};
  const matches=[...txt.matchAll(/(\d{1,2})\s*[:.)\s]\s*([A-Da-d]+|\d{1,4})/g)];
  matches.forEach(m=>{const n=parseInt(m[1]);if(n>=1&&n<=75){const val=m[2];calcAnsKey[n]=/^\d+$/.test(val)?parseInt(val,10):val.toUpperCase();}});
  const cnt=Object.keys(calcAnsKey).length;
  const st=document.getElementById('key-status');if(st)st.textContent=`✅ ${cnt} answers loaded`;
  toast(`✅ Key applied: ${cnt} questions`);
}

/* ═══════════════ KEYBOARD NAVIGATION FOR CALCULATOR ═══════════════ */
function focusQRow(num){
  currentFocusQ=num;
  document.querySelectorAll('.q-row').forEach(r=>r.classList.remove('q-focus'));
  const row=document.getElementById('qrow-'+num);
  if(row){
    row.classList.add('q-focus');
    row.scrollIntoView({behavior:'smooth',block:'nearest'});
    const ae=document.activeElement;
    if(!ae||!row.contains(ae)||ae===row)row.focus({preventScroll:true});
  }
}
function attachCalcKeyboard(){
  if(window._calcKeyHandler)return;
  window._calcKeyHandler=function(e){
    if(PAGE!=='calculator'||calcActiveTab!=='manual')return;
    if(document.getElementById('cmt-player').style.display!=='none')return;
    if(!e.key)return;
    const key=e.key.toUpperCase();
    const isModCtrl=e.ctrlKey||e.metaKey||e.altKey;
    if(isModCtrl)return;
    const tag=e.target.tagName;
    const isTextInput=(tag==='INPUT'&&e.target.type==='text')||tag==='TEXTAREA';
    const isNumInput=(tag==='INPUT'&&e.target.type==='number');
    if(isTextInput||isNumInput)return;
    if(['ARROWDOWN','ARROWUP','ENTER','S'].includes(key)){
      if(isNumInput)return;
      e.preventDefault();
      if(key==='ARROWDOWN'){const nq=calcQuestions.find(x=>x.num===currentFocusQ+1);if(nq)focusQRow(nq.num);}
      else if(key==='ARROWUP'){const pq=calcQuestions.find(x=>x.num===currentFocusQ-1);if(pq)focusQRow(pq.num);}
      else if(key==='ENTER'){const nq=calcQuestions.find(x=>x.num===currentFocusQ+1);if(nq)focusQRow(nq.num);}
      else if(key==='S'){toggleQSkip(currentFocusQ);}
      return;
    }
    if(['A','B','C','D'].includes(key)){
      if(isNumInput)return;
      e.preventDefault();
      const q=calcQuestions.find(x=>x.num===currentFocusQ);
      if(q&&q.mode==='multi'){
        const cb=document.querySelector('#qrow-'+currentFocusQ+' .q-multi-cb[value="'+key+'"]');
        if(cb){cb.checked=!cb.checked;setQMultiResp(currentFocusQ);}
      }else{
        setQResp(currentFocusQ,key);
      }
      return;
    }
    if(/^[0-9]$/.test(e.key)){
      const q=calcQuestions.find(x=>x.num===currentFocusQ);
      if(q&&q.mode==='int'){
        e.preventDefault();
        const inp=document.querySelector('#qrow-'+currentFocusQ+' .q-int-input');
        if(inp){inp.value='';inp.focus();const sel=window.getSelection?window.getSelection():document.selection;if(sel){sel.removeAllRanges();}}
      }
    }
  };
  document.addEventListener('keydown',window._calcKeyHandler);
}
function detachCalcKeyboard(){
  if(window._calcKeyHandler){document.removeEventListener('keydown',window._calcKeyHandler);window._calcKeyHandler=null;}
}

function evalCalc(){
  if(Object.keys(calcAnsKey).length===0){toast('⚠️ Answer key is required. Paste the key above and click Apply Key first.');return;}
  calcShowResults=true;
  const el=document.getElementById('calc-results');if(!el)return;
  el.style.display='block';el.innerHTML=buildCalcRes();
  setTimeout(()=>el.scrollIntoView({behavior:'smooth',block:'start'}),100);
}
function scoreQ(q,k){
  if(q.unattempted||!q.selected||k===undefined||k===null)return 0;
  if(q.mode==='int'){const iv=parseInt(q.selected,10);if(isNaN(iv))return 0;return iv===k?4:-1;}
  if(q.mode==='multi'){
    const ks=String(k).toUpperCase(),ss=q.selected.toUpperCase();
    let hasWrong=false,allCorrect=true;
    for(const o of['A','B','C','D']){
      const inK=ks.includes(o),inS=ss.includes(o);
      if(inS&&!inK)hasWrong=true;
      if(inK&&!inS)allCorrect=false;
    }
    if(hasWrong)return -2;
    if(allCorrect)return 4;
    return 0;
  }
  return q.selected===k?4:-1;
}
function saveCalcToHistory(){
  if(!calcQuestions||!calcQuestions.length){toast('⚠️ No calculator data. Solve a test first!');return;}
  let p={correct:0,incorrect:0,unattempted:0,partial:0}, c={correct:0,incorrect:0,unattempted:0,partial:0}, m={correct:0,incorrect:0,unattempted:0,partial:0};
  let totalScore = 0;
  calcQuestions.forEach(q=>{
    const k=calcAnsKey[q.num];
    if(k===undefined||k===null)return;
    const sc=scoreQ(q,k);
    if(Number.isNaN(sc))return;
    totalScore+=sc;
    const cat=q.subj==='physics'?p:q.subj==='chemistry'?c:m;
    if(sc===0)cat.unattempted++;
    else if(sc>=4)cat.correct++;
    else if(sc>0)cat.partial++;
    else cat.incorrect++;
  });
  document.getElementById('calc-save-name').value='Mock Test '+new Date().toLocaleDateString();
  document.getElementById('calc-save-date').value=new Date().toISOString().split('T')[0];
  document.getElementById('calc-save-scored').value=Math.max(0,totalScore);
  document.getElementById('calc-save-max').value=300;
  om('m-save-calc-test');
  setTimeout(function(){document.getElementById('calc-save-name').focus();},320);
}
function saveCalcTestFromModal(){
  if(!calcQuestions||!calcQuestions.length){toast('⚠️ No calculator data. Solve a test first!');return;}
  const name=document.getElementById('calc-save-name').value.trim();
  if(!name){toast('⚠️ Enter a test name');return;}
  let p={correct:0,incorrect:0,unattempted:0,partial:0}, c={correct:0,incorrect:0,unattempted:0,partial:0}, m={correct:0,incorrect:0,unattempted:0,partial:0};
  let totalScore = 0;
  calcQuestions.forEach(q=>{
    const k=calcAnsKey[q.num];
    if(k===undefined||k===null)return;
    const sc=scoreQ(q,k);
    if(Number.isNaN(sc))return;
    totalScore+=sc;
    const cat=q.subj==='physics'?p:q.subj==='chemistry'?c:m;
    if(sc===0)cat.unattempted++;
    else if(sc>=4)cat.correct++;
    else if(sc>0)cat.partial++;
    else cat.incorrect++;
  });
  DB.tests.unshift({
    id: 't_'+Date.now(), name, date: document.getElementById('calc-save-date').value||new Date().toISOString(),
    physics: p, chemistry: c, maths: m,
    totalScore: Math.max(0, totalScore), maxScore:300,
    papers: [], syllabus: {physics:[],chemistry:[],maths:[]}
  });
  if(!sv('tests')){DB.tests.shift();return;}
  cm('m-save-calc-test');
  toast('✅ Test saved to history!');
}
function saveCalcAsMockTest(){
  const tot=calcQuestions.reduce(function(s,q){
    const sc=scoreQ(q,calcAnsKey[q.num]);
    if(Number.isNaN(sc)||sc===0)return s;
    return s+sc;
  },0);
  document.getElementById('mt-scored').value=Math.max(0,tot);
  document.getElementById('mt-total').value=300;
  document.getElementById('mt-date').value=new Date().toISOString().split('T')[0];
  document.getElementById('mt-subj').value='Full Syllabus';
  document.getElementById('mt-time').value='';
  document.getElementById('mt-syllabus').value='';
  document.getElementById('mt-review').value='';
  om('m-mocktest');
  setTimeout(function(){document.getElementById('mt-scored').focus();},320);
}
function buildCalcRes(){
  const subjs=['physics','chemistry','maths'];
  const labels=['Physics','Chemistry','Maths'];
  const colors=['var(--phys)','var(--chem)','var(--math)'];
  let tot=0,totC=0,totW=0,totS=0,totP=0;
  const qR=[];
  calcQuestions.forEach(q=>{
    const k=calcAnsKey[q.num];
    const unatt=q.unattempted||!q.selected;
    const noKey=k===undefined||k===null;
    const sc=unatt||noKey?0:scoreQ(q,k);
    if(Number.isNaN(sc))return;
    tot+=sc;
    qR.push({num:q.num,subj:q.subj,mode:q.mode,selected:q.selected,key:k,score:sc,skipped:unatt,noKey});
    if(unatt||noKey)totS++;
    else if(sc>=4)totC++;
    else if(sc>0)totP++;
    else totW++;
  });
  const sd=subjs.map((s,si)=>{
    let sc=0,c=0,w=0,sk=0,p=0;
    qR.filter(r=>r.subj===s).forEach(r=>{
      if(r.skipped||r.noKey)sk++;
      else if(r.score>=4)c++;
      else if(r.score>0)p++;
      else w++;
      sc+=r.score;
    });
    return{label:labels[si],color:colors[si],score:sc,correct:c,wrong:w,skip:sk,partial:p};
  });
  const scoreC=tot>=200?'var(--green)':tot>=120?'var(--indigo)':'var(--red)';
  const totMissing=75-qR.length;
  const {pctile,airRange}=getPerc(tot);
  const rPct=Math.max(0,Math.min(100,tot/300*100));
  const sd2=Math.round(rPct/100*264);
  return `<div class="gc anim-up">
    <div class="results-hero">
      <div style="font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);margin-bottom:14px">Score Based on Answer Key</div>
      <div class="score-ring">
        <svg viewBox="0 0 100 100" style="transform:rotate(-90deg)">
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="7"/>
          <circle cx="50" cy="50" r="42" fill="none" stroke="${scoreC}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${sd2} 264" style="transition:stroke-dasharray 1.2s ease"/>
        </svg>
        <div class="score-ring-inner"><div class="score-num" style="color:${scoreC}">${tot}</div><div class="score-sub">/ 300</div></div>
      </div>
      <div style="font-size:13px;font-weight:600;margin-bottom:14px;color:${rPct>=60?'var(--green)':rPct>=40?'var(--indigo)':'var(--red)'}">${rPct.toFixed(1)}% — ${totC}F · ${totP}P · ${totW}W · ${totS}S${totMissing?` · ${totMissing} no-key`:''}</div>
      <div class="results-badges">
        <div class="res-badge" style="background:rgba(99,102,241,.12);border:1px solid rgba(99,102,241,.25)"><div class="res-badge-val" style="color:var(--indigo)">${pctile}%</div><div class="res-badge-lbl">Predicted Percentile</div></div>
        <div class="res-badge" style="background:rgba(59,130,246,.12);border:1px solid rgba(59,130,246,.25)"><div class="res-badge-val" style="color:var(--phys)">${airRange}</div><div class="res-badge-lbl">Est. AIR Range</div></div>
        <div class="res-badge" style="background:rgba(16,185,129,.12);border:1px solid rgba(16,185,129,.25)"><div class="res-badge-val" style="color:var(--green)">${totC}</div><div class="res-badge-lbl">Full (+${totC*4})</div></div>
        <div class="res-badge" style="background:rgba(250,204,21,.12);border:1px solid rgba(250,204,21,.25)"><div class="res-badge-val" style="color:#facc15">${totP}</div><div class="res-badge-lbl">Partial</div></div>
        <div class="res-badge" style="background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.25)"><div class="res-badge-val" style="color:var(--red)">${totW}</div><div class="res-badge-lbl">Wrong</div></div>
      </div>
    </div>
    <div class="subj-breakdown-grid" style="padding:18px 20px">
      ${sd.map(s=>{const p=Math.max(0,Math.round(s.score));return`<div class="sbd-item">
        <div class="sbd-label" style="color:${s.color}">${s.label}</div>
        <div class="sbd-score" style="color:${s.color}">${s.score}</div>
        <div class="sbd-detail">${s.correct}F / ${s.partial}P / ${s.wrong}W / ${s.skip}S</div>
        <div class="pbar-wrap" style="height:4px;margin-top:8px"><div class="pbar" style="height:4px;width:${Math.max(0,p)}%;background:${s.color}"></div></div>
      </div>`;}).join('')}
    </div>
    <div style="padding:0 20px 18px;display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn btn-primary btn-sm" onclick="saveCalcToHistory()">💾 Save to Test History</button>
      <button class="btn btn-ghost btn-sm" onclick="saveCalcAsMockTest()">📝 Save as Mock Test</button>
      <button class="btn btn-ghost btn-sm" onclick="resetCalc()">🔄 Reset Calculator</button>
    </div>
    <div style="padding:0 20px 20px">
      <div style="font-size:11px;font-weight:700;margin-bottom:10px;color:var(--faint);border-top:1px solid rgba(255,255,255,.05);padding-top:14px">📊 Question-wise Breakdown</div>
      <div class="qr-grid">
        ${qR.map(r=>{
          let cls='qr-na',ico='—',scStr='—';
          if(r.skipped){cls='qr-skip';ico='⊘';scStr='Skipped';}
          else if(r.noKey){cls='qr-na';ico='?';scStr='No key';}
          else if(r.score>=4){cls='qr-correct';ico='✓';scStr='+'+r.score;}
          else if(r.score>0){cls='qr-partial';ico='~';scStr='+'+r.score;}
          else {cls='qr-wrong';ico='✗';scStr=String(r.score);}
          const ansStr=String(r.selected||'—');
          const keyStr=r.key;
          return `<div class="qr-item ${cls}">
            <div class="qr-num">Q${r.num}</div>
            <div class="qr-ans" title="You: ${esc(ansStr)}">${esc(ansStr)}</div>
            <div class="qr-key" title="Key: ${esc(keyStr)}">${esc(keyStr)}</div>
            <div class="qr-score">${scStr}</div>
          </div>`;
        }).join('')}
      </div>
    </div>
  </div>`;
}
function getPerc(score){
  const map=[
    {min:285,p:99.99,a:'1–50'},{min:280,p:99.95,a:'50–200'},{min:270,p:99.9,a:'200–600'},
    {min:260,p:99.8,a:'600–1,200'},{min:250,p:99.7,a:'1,200–2,500'},{min:240,p:99.6,a:'2,500–4,000'},
    {min:230,p:99.5,a:'4,000–6,000'},{min:220,p:99.3,a:'6,000–10,000'},{min:210,p:99.0,a:'10,000–15,000'},
    {min:200,p:98.5,a:'15,000–25,000'},{min:190,p:97.5,a:'25,000–40,000'},{min:180,p:96.5,a:'40,000–55,000'},
    {min:170,p:95.0,a:'55,000–75,000'},{min:160,p:93.0,a:'75,000–1,00,000'},{min:140,p:89.0,a:'1,00,000–1,50,000'},
    {min:120,p:83.0,a:'1,50,000–2,20,000'},{min:100,p:74.0,a:'2,20,000–3,20,000'},{min:80,p:62.0,a:'3,20,000–4,80,000'},
    {min:60,p:47.0,a:'4,80,000–6,50,000'},{min:40,p:30.0,a:'6,50,000–8,40,000'},{min:0,p:10.0,a:'8,40,000+'},
  ];
  for(const e of map)if(score>=e.min)return{pctile:e.p,airRange:e.a};
  return{pctile:5.0,airRange:'9,00,000+'};
}
function resetCalc(){
  initCalcQ();calcShowResults=false;calcAnsKey={};
  currentFocusQ=1;
  renderCalculator(document.getElementById('content-wrap'));
}
