// page-js/tests.js
import { DB, sv, findCh } from '../js/data.js';
import { esc, fmtDate, cm, om, toast, setupDZ, debouncedUpdTstList, rdFiles, cfm2, fItemHTML, fItemHTMLRaw } from '../js/helpers.js';
/* ═══════════════ TESTS ═══════════════ */
let testSearch='';
function updateTestList(){
  const container=document.getElementById('test-list-container');
  if(!container)return;
  const filtered=getFilteredTests();
  container.innerHTML=filtered.length===0?'<div class="gc empty"><div class="empty-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></div><div class="empty-title">'+(DB.tests.length?'No tests match your search':'No tests recorded')+'</div><div class="empty-sub">'+(DB.tests.length?'Try a different search term':'Click &quot;+ Add Test&quot;')+'</div></div>':
  filtered.map(function(t,i){return tstCard(t,i);}).join('');
}
function getFilteredTests(){
  if(!testSearch.trim())return DB.tests;
  const q=testSearch.trim().toLowerCase();
  return DB.tests.filter(function(t){
    if(t.name&&t.name.toLowerCase().includes(q))return true;
    const syl=t.syllabus||{};
    for(const subj of ['physics','chemistry','maths']){
      const ids=syl[subj]||[];
      for(const cid of ids){
        const ch=findCh(subj,cid);
        if(ch&&ch.name.toLowerCase().includes(q))return true;
      }
    }
    return false;
  });
}
function renderTests(el){
  const hasSyl=DB.tests.some(function(t){return t.syllabus&&Object.values(t.syllabus).some(function(a){return a.length;});});
  const filtered=getFilteredTests();
  el.innerHTML=`
  <div class="pg-hdr page-header anim-up" style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px">
    <div><div class="pg-title" data-text="Test">Test</div><div class="pg-sub">Test history and performance analysis</div></div>
    <button class="btn btn-primary" onclick="openAddTest()">+ Add Test</button>
  </div>
  <div class="anim-up d1" style="display:flex;gap:8px;align-items:center;margin-bottom:16px;flex-wrap:wrap">
    <input class="inp" type="text" id="test-search" placeholder="Search tests by name or chapter..." oninput="setTestSearch(this.value);debouncedUpdTstList()" style="flex:1;min-width:160px;font-size:13px" value="${esc(testSearch)}" autocomplete="off">
    ${hasSyl?'<span class="chip chip-med" style="font-size:10px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> Syllabus-wise</span>':''}
  </div>
  <div id="test-list-container" class="stagger">${filtered.length===0?'<div class="gc empty"><div class="empty-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></div><div class="empty-title">'+(DB.tests.length?'No tests match your search':'No tests recorded')+'</div><div class="empty-sub">'+(DB.tests.length?'Try a different search term':'Click &quot;+ Add Test&quot;')+'</div></div>':
  filtered.map(function(t,i){return tstCard(t,i);}).join('')}</div>`;
}
function tstCard(t,i){
  const p=t.maxScore>0?Math.round(t.totalScore/t.maxScore*100):0,c=p>=70?'var(--green)':p>=50?'var(--accent)':'var(--red)';
  const phS=t.physics.correct*4-t.physics.incorrect,chS=t.chemistry.correct*4-t.chemistry.incorrect,mS=t.maths.correct*4-t.maths.incorrect;
  const pps=t.papers||[];
  const tm=t.timing||{};
  return `<div class="gc test-card chapter-card anim-up" id="tc-${t.id}" style="margin-bottom:12px;animation-delay:${i*40}ms">
    <div class="test-card-head" onclick="document.getElementById('tc-${t.id}').classList.toggle('expanded')">
      <div class="tc-num chapter-badge">#${i+1}</div>
      <div class="tc-info"><div class="tc-name">${esc(t.name)}</div><div class="tc-date">${fmtDate(t.date)}</div></div>
      <div class="tc-score-wrap stat-card"><div class="tc-score-big" style="color:${c}">${t.totalScore}</div><div style="font-size:10px;color:var(--faint)">/${t.maxScore}</div></div>
      <div class="tc-chev">▼</div>
    </div>
    <div class="test-card-body">
      ${tm.total?`<div style="font-size:11px;color:var(--muted);margin-bottom:12px;display:flex;gap:12px;flex-wrap:wrap"><span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Total: <b>${tm.total}m</b></span> <span style="color:var(--phys)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> P: ${tm.physics||0}m</span> <span style="color:var(--chem)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6v11l4 5H5l4-5V3z"/><line x1="9" y1="3" x2="15" y2="3"/></svg> C: ${tm.chemistry||0}m</span> <span style="color:var(--math)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20L20 4"/><path d="M15 4h5v5"/><path d="M4 20l5-5"/></svg> M: ${tm.maths||0}m</span></div>`:''}
      <div class="subj-breakdown-grid">
        ${[{l:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> Physics',c:'var(--phys)',s:phS,d:t.physics},{l:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6v11l4 5H5l4-5V3z"/><line x1="9" y1="3" x2="15" y2="3"/></svg> Chemistry',c:'var(--chem)',s:chS,d:t.chemistry},{l:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20L20 4"/><path d="M15 4h5v5"/><path d="M4 20l5-5"/></svg> Maths',c:'var(--math)',s:mS,d:t.maths}].map(sb=>`
        <div class="sbd-item">
          <div class="sbd-label" style="color:${sb.c}">${sb.l}</div>
          <div class="sbd-score" style="color:${sb.c}">${sb.s}</div>
          <div class="sbd-detail">${sb.d.correct}C / ${sb.d.incorrect}W / ${sb.d.unattempted||0}S</div>
          <div class="pbar-wrap progress-bar" style="height:3px;margin-top:6px"><div class="pbar progress-fill" style="height:3px;width:${Math.max(0,sb.s)}%;background:${sb.c}"></div></div>
        </div>`).join('')}
      </div>
      ${pps.length?`<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin-bottom:8px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> Question Papers</div><div class="file-list" style="margin-bottom:12px">${pps.map((d,pi)=>fItemHTMLRaw(d,'Paper '+(pi+1))).join('')}</div>`:''}
      ${t.syllabus&&Object.values(t.syllabus).some(a=>a.length)?`<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin-bottom:8px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> Syllabus Covered</div><div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:12px">${['physics','chemistry','maths'].map(subj=>{
        const col={physics:'var(--phys)',chemistry:'var(--chem)',maths:'var(--math)'}[subj];
        return (t.syllabus[subj]||[]).map(cid=>{const ch=findCh(subj,cid);return ch?`<span style="padding:3px 10px;border-radius:20px;font-size:10px;font-weight:600;background:${col}15;color:${col};border:1px solid ${col}30">${esc(ch.name)}</span>`:'';}).join('');
      }).join('')}</div>`:''}
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-outline btn-sm" onclick="saveTestAsMockTest('${t.id}')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Save as Mock Test</button>
        <button class="btn btn-danger btn-sm" onclick="delTest('${t.id}')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Delete</button>
      </div>
    </div>
  </div>`;
}
let testEntryMode='direct';
function setTestMode(mode){
  testEntryMode=mode;
  const dBtn=document.getElementById('tm-direct'),bBtn=document.getElementById('tm-breakdown');
  const dSec=document.getElementById('test-mode-direct'),bSec=document.getElementById('test-mode-breakdown');
  if(mode==='direct'){
    dBtn.className='btn btn-sm';dBtn.style.cssText='flex:1;text-align:center;background:var(--accent);color:#fff;border-color:transparent';
    bBtn.className='btn btn-ghost btn-sm';bBtn.style.cssText='flex:1;text-align:center';
    dSec.style.display='block';bSec.style.display='none';
  }else{
    bBtn.className='btn btn-sm';bBtn.style.cssText='flex:1;text-align:center;background:var(--accent);color:#fff;border-color:transparent';
    dBtn.className='btn btn-ghost btn-sm';dBtn.style.cssText='flex:1;text-align:center';
    bSec.style.display='block';dSec.style.display='none';
  }
}
function syncBreakdownToDirect(){
  const gn=id=>parseInt(document.getElementById(id).value)||0;
  const p={c:gn('tp-c'),w:gn('tp-w'),s:gn('tp-s')};
  const c={c:gn('tc-c'),w:gn('tc-w'),s:gn('tc-s')};
  const m={c:gn('tm-c'),w:gn('tm-w'),s:gn('tm-s')};
  const total=(p.c+c.c+m.c)*4-(p.w+c.w+m.w);
  const max=(p.c+p.w+p.s+c.c+c.w+c.s+m.c+m.w+m.s)*4;
  document.getElementById('t-calc-total').textContent=Math.max(0,total);
  document.getElementById('t-calc-max').textContent=max>0?max:300;
  document.getElementById('t-direct-marks').value=Math.max(0,total);
  document.getElementById('t-direct-max').value=max>0?max:300;
}
function syncDirectToBreakdown(){
  const marks=parseInt(document.getElementById('t-direct-marks').value)||0;
  const max=parseInt(document.getElementById('t-direct-max').value)||300;
  document.getElementById('t-calc-total').textContent=marks;
  document.getElementById('t-calc-max').textContent=max;
}
function openAddTest(){
  window.pendingTFiles=[];
  ['t-name','tp-c','tp-w','tp-s','tc-c','tc-w','tc-s','tm-c','tm-w','tm-s','t-direct-marks','test-t-p','test-t-c','test-t-m','test-t-tot'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('t-date').value=new Date().toISOString().split('T')[0];
  document.getElementById('t-file-list').innerHTML='';
  setTestMode('direct');
  const sylEl=document.getElementById('t-syl-grid');
  if(sylEl){
    const subjCol={physics:'var(--phys)',chemistry:'var(--chem)',maths:'var(--math)'};
    const subjIcon={physics:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',chemistry:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6v11l4 5H5l4-5V3z"/><line x1="9" y1="3" x2="15" y2="3"/></svg>',maths:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20L20 4"/><path d="M15 4h5v5"/><path d="M4 20l5-5"/></svg>'};
    sylEl.innerHTML=['physics','chemistry','maths'].map(subj=>{
      const col=subjCol[subj],icon=subjIcon[subj];
      return `<div class="syl-col"><div class="syl-col-title" style="color:${col}">${icon} ${subj.charAt(0).toUpperCase()+subj.slice(1)}</div>${DB.chapters[subj].map(ch=>`<label class="syl-check"><input type="checkbox" value="${ch.id}" data-subj="${subj}" class="t-syl-cb"/> ${esc(ch.name)}</label>`).join('')}</div>`;
    }).join('');
  }
  setupDZ('t-dz','t-finp',handleTFiles);
  om('m-test');setTimeout(()=>document.getElementById('t-name').focus(),320);
}
function handleTFiles(files){rdFiles(files,obj=>{window.pendingTFiles.push(obj);refreshTFileList();});}
function refreshTFileList(){const el=document.getElementById('t-file-list');if(!el)return;el.innerHTML=window.pendingTFiles.map((f,i)=>fItemHTML(f)+`<div style="margin:0 12px"><button class="btn btn-danger btn-xs" onclick="window.pendingTFiles.splice(${i},1);refreshTFileList()">✕</button></div>`).join('');}
function saveTest(){
  const name=document.getElementById('t-name').value.trim();if(!name){toast('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Enter test name');return;}
  let p,c,m,total,maxScore;
  const gn=function(id){return parseInt(document.getElementById(id).value)||0;};
  if(testEntryMode==='direct'){
    total=parseInt(document.getElementById('t-direct-marks').value)||0;
    maxScore=parseInt(document.getElementById('t-direct-max').value)||300;
    p={correct:0,incorrect:0,unattempted:0};
    c={correct:0,incorrect:0,unattempted:0};
    m={correct:0,incorrect:0,unattempted:0};
  }else{
    p={correct:gn('tp-c'),incorrect:gn('tp-w'),unattempted:gn('tp-s')};
    c={correct:gn('tc-c'),incorrect:gn('tc-w'),unattempted:gn('tc-s')};
    m={correct:gn('tm-c'),incorrect:gn('tm-w'),unattempted:gn('tm-s')};
    total=Math.max(0,(p.correct+c.correct+m.correct)*4-(p.incorrect+c.incorrect+m.incorrect));
    maxScore=(p.correct+p.incorrect+p.unattempted+c.correct+c.incorrect+c.unattempted+m.correct+m.incorrect+m.unattempted)*4;
    if(maxScore<=0)maxScore=300;
  }
  const timing={total:gn('test-t-tot'),physics:gn('test-t-p'),chemistry:gn('test-t-c'),maths:gn('test-t-m')};

  const syllabus={physics:[],chemistry:[],maths:[]};
  document.querySelectorAll('.t-syl-cb:checked').forEach(cb=>{
    const subj=cb.dataset.subj;
    if(subj&&syllabus[subj])syllabus[subj].push(cb.value);
  });
  DB.tests.unshift({id:'t_'+Date.now(),name,date:document.getElementById('t-date').value||new Date().toISOString(),physics:p,chemistry:c,maths:m,totalScore:Math.max(0,total),maxScore,timing,papers:window.pendingTFiles.map(f=>({d:f.url||f.data,n:f.name})),syllabus});
  if(!sv('tests')){DB.tests.shift();return;}
  cm('m-test');updateTestList();toast('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Test saved!');
}
function delTest(id){cfm2('Delete test?','This cannot be undone.',()=>{DB.tests=DB.tests.filter(x=>x.id!==id);sv('tests');updateTestList();toast('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Deleted');});}
function saveTestAsMockTest(id){
  const t=DB.tests.find(function(x){return x.id===id;});
  if(!t){toast('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Test not found');return;}
  document.getElementById('mt-scored').value=Math.max(0,t.totalScore);
  document.getElementById('mt-total').value=t.maxScore||300;
  document.getElementById('mt-date').value=t.date?t.date.split('T')[0]:new Date().toISOString().split('T')[0];
  document.getElementById('mt-subj').value='Full Syllabus';
  document.getElementById('mt-time').value='';
  document.getElementById('mt-syllabus').value='';
  document.getElementById('mt-review').value='';
  om('m-mocktest');
  setTimeout(function(){document.getElementById('mt-scored').focus();},320);
}
/* ═══════════════ WINDOW EXPORTS ═══════════════ */
window.renderTests=renderTests;
window.updateTestList=updateTestList;
window.getFilteredTests=getFilteredTests;
window.tstCard=tstCard;
window.setTestMode=setTestMode;
window.syncBreakdownToDirect=syncBreakdownToDirect;
window.syncDirectToBreakdown=syncDirectToBreakdown;
window.openAddTest=openAddTest;
window.handleTFiles=handleTFiles;
window.refreshTFileList=refreshTFileList;
window.saveTest=saveTest;
window.delTest=delTest;
window.saveTestAsMockTest=saveTestAsMockTest;
window.setTestSearch=function(v){testSearch=v;};
