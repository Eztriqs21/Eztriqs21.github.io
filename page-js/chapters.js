// page-js/chapters.js
/* ═══════════════ CHAPTERS ═══════════════ */
import { DB, sv, findCh, mkCh } from '../js/data.js';
import { uid, esc, safePct, cm, om, toast, setupDZ, debouncedUpdChList, cfm2, fItemHTML, rdFiles } from '../js/helpers.js';
let matrixFilter='all';
let chSearch='';
let accState={physics:true,chemistry:true,maths:true};
/* ═══════════════ CHAPTER RENDERING (TARGETED DOM UPDATES) ═══════════════ */
function updateChapterList(){
  const container=document.getElementById('ch-list-container');
  if(container) container.innerHTML=buildChaptersList();
}
function buildChaptersList(){
  const subjects=[{key:'physics',label:'Physics',icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',color:'var(--phys)'},{key:'chemistry',label:'Chemistry',icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6v11l4 5H5l4-5V3z"/><line x1="9" y1="3" x2="15" y2="3"/></svg>',color:'var(--chem)'},{key:'maths',label:'Maths',icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20L20 4"/><path d="M15 4h5v5"/><path d="M4 20l5-5"/></svg>',color:'var(--math)'}];
  return subjects.map((s,si)=>{
    const chs=DB.chapters[s.key];
    const q=chSearch.trim().toLowerCase();
    const shown=(matrixFilter==='all'?chs:chs.filter(c=>c.strength===matrixFilter)).filter(c=>!q||c.name.toLowerCase().includes(q));
    const done=chs.filter(c=>c.completed).length;
    const pct=safePct(done,chs.length);
    const isOpen=accState[s.key];
    return `<div class="gc subj-acc ${isOpen?'open':''} section-block anim-up" style="animation-delay:${si*60}ms;overflow:hidden;margin-bottom:16px">
      <div class="subj-acc-header" onclick="toggleAcc('${s.key}',this)">
        <div style="width:36px;height:36px;border-radius:10px;background:${s.color}20;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">${s.icon}</div>
        <div style="flex:1"><div style="font-size:16px;font-weight:700">${s.label}</div><div style="font-size:11px;color:var(--faint);margin-top:1px">${done}/${chs.length} completed · ${pct}%</div></div>
        <div style="text-align:right;margin-right:10px"><div style="font-size:18px;font-weight:700;color:${s.color}">${pct}%</div></div>
        <div class="subj-acc-chev">▼</div>
      </div>
      <div class="subj-acc-body">
        <div style="padding:8px 20px;border-bottom:1px solid var(--border)"><div class="pbar-wrap" style="height:4px"><div class="subj-acc-bar" style="height:4px;width:${pct}%;background:${s.color}"></div></div></div>
        <div>${shown.length===0?`<div class="empty" style="padding:28px"><div class="empty-title">${chSearch.trim()?'No chapters match "'+esc(chSearch.trim())+'"':'No chapters match this filter'}</div>${chSearch.trim()?`<div class="empty-sub" style="margin-bottom:12px">Add a new chapter to ${s.label}?</div><button class="btn btn-primary btn-sm" onclick="setChSearch('');document.getElementById('ch-search').value='';openAddCh('${s.key}')">+ Add Chapter</button>`:''}</div>`:
        shown.map(ch=>`<div class="chapter-row" id="chrow-${s.key}-${ch.id}">
          <div class="ch-check ${ch.completed?'done':''}" onclick="event.stopPropagation();toggleChDone('${s.key}','${ch.id}')">
            ${ch.completed?'<svg width="11" height="11" viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/></svg>':''}
          </div>
          <span class="ch-name-txt ${ch.completed?'done':''}">${esc(ch.name)}</span>
          <span class="ch-edit-ico" onclick="event.stopPropagation();openEditCh('${s.key}','${ch.id}')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></span>
          <div class="strength-pills">
            ${['strong','decent','weak','uncovered'].map(str=>`<button class="spill ${str} ${ch.strength===str?'on':''}" onclick="event.stopPropagation();setChStr('${s.key}','${ch.id}','${str}')">${str==='uncovered'?'—':str.charAt(0).toUpperCase()+str.slice(1)}</button>`).join('')}
          </div>
          <button class="ch-notes-btn" onclick="event.stopPropagation();openNotes('${s.key}','${ch.id}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg> ${((ch.notes?.detailed?.length||0)+(ch.notes?.revision?.length||0))>0?((ch.notes?.detailed?.length||0)+(ch.notes?.revision?.length||0))+' notes':'Notes'}
          </button>
          <button class="pyq-badge pyq-mains ${ch.mainsPyqDone?'pyq-on':''}" onclick="event.stopPropagation();togglePyq('${s.key}','${ch.id}','mains')" title="Mains PYQ">Mains PYQ</button>
          <button class="pyq-badge pyq-adv ${ch.advPyqDone?'pyq-on':''}" onclick="event.stopPropagation();togglePyq('${s.key}','${ch.id}','adv')" title="Advanced PYQ">Adv PYQ</button>
          <a class="os-btn" href="${oneShotURL(s.key,ch.id,ch.name)}" target="_blank" rel="noopener" onclick="event.stopPropagation()" title="${ONE_SHOT_LINKS[s.key]?.teacher||'PW'} One Shot">▶ 1-Shot</a>
          ${(ch.subTopics&&ch.subTopics.length>0)?`<button class="subtopic-toggle" onclick="event.stopPropagation();toggleSubTopics('${s.key}','${ch.id}')">▼ Topics</button>`:''}
        </div>
        ${(ch.subTopics&&ch.subTopics.length>0)?`<div class="subtopic-panel" id="stp-${s.key}-${ch.id}" style="display:none">
          <div class="subtopic-list">
            ${ch.subTopics.map((st,sti)=>`<div class="subtopic-item">
              <div class="ch-check ${st.completed?'done':''}" onclick="event.stopPropagation();toggleSubTopic('${s.key}','${ch.id}','${st.id}')">
                ${st.completed?'<svg width="11" height="11" viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/></svg>':''}
              </div>
              <span class="subtopic-name ${st.completed?'done':''}">${esc(st.name)}</span>
            </div>`).join('')}
          </div>
          <div class="subtopic-add">
            <input type="text" class="inp subtopic-inp" id="sti-${s.key}-${ch.id}" placeholder="Add micro-topic..." onkeydown="if(event.key==='Enter'){event.stopPropagation();addSubTopic('${s.key}','${ch.id}')}" />
            <button class="btn btn-primary btn-xs" onclick="event.stopPropagation();addSubTopic('${s.key}','${ch.id}')">+ Add</button>
          </div>
        </div>`:''}`).join('')}</div>
        <button class="add-ch-btn" onclick="openAddCh('${s.key}')"><span style="font-size:14px">+</span> Add Chapter</button>
      </div>
    </div>`;}).join('');
}
function renderChapters(el){
  const filters=['all','strong','decent','weak','uncovered'];
  el.innerHTML=`
  <div class="pg-hdr anim-up" style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px">
    <div><div class="pg-title" data-text="Chapters">Chapters</div><div class="pg-sub">Syllabus mastery & tracking</div></div>
  </div>
  <div id="ch-filter-bar" style="display:flex;gap:7px;overflow-x:auto;scrollbar-width:none;padding-bottom:6px;margin-bottom:12px" class="anim-up d1">
    ${filters.map(f=>`<button class="btn btn-sm ${matrixFilter===f?'btn-primary':'btn-ghost'}" onclick="setMF('${f}')">${f==='all'?'All Chapters':f.charAt(0).toUpperCase()+f.slice(1)}</button>`).join('')}
  </div>
  <div style="margin-bottom:16px" class="anim-up d1">
    <input class="inp" type="text" id="ch-search" placeholder="Search chapters..." oninput="setChSearch(this.value);debouncedUpdChList()" style="font-size:13px" value="${esc(chSearch)}" autocomplete="off">
  </div>
  <div id="ch-list-container">${buildChaptersList()}</div>`;
}
function toggleAcc(key,el){
  accState[key]=!accState[key];
  const acc=el?el.closest('.subj-acc'):document.querySelector(`.subj-acc[data-subj="${key}"]`);
  if(acc)acc.classList.toggle('open');
}
function setMF(f){
  matrixFilter=f;
  const bar=document.getElementById('ch-filter-bar');
  if(bar){
    const filters=['all','strong','decent','weak','uncovered'];
    const btns=bar.querySelectorAll('button');
    btns.forEach((btn,i)=>{
      btn.className='btn btn-sm '+(matrixFilter===filters[i]?'btn-primary':'btn-ghost');
    });
  }
  updateChapterList();
}
function toggleChDone(subj,id){
  const ch=DB.chapters[subj].find(c=>c.id===id);if(!ch)return;
  ch.completed=!ch.completed;sv('chapters');
  const row=document.getElementById(`chrow-${subj}-${id}`);
  if(row){
    const check=row.querySelector('.ch-check');
    const name=row.querySelector('.ch-name-txt');
    if(ch.completed){
      check.classList.add('done');check.innerHTML='<svg width="11" height="11" viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
      name.classList.add('done');
    }else{
      check.classList.remove('done');check.textContent='';
      name.classList.remove('done');
    }
  }
  const acc=document.getElementById(`chrow-${subj}-${id}`)?.closest('.subj-acc');
  if(acc){
    const chs=DB.chapters[subj];const dc=chs.filter(c=>c.completed).length;
    const pct=safePct(dc,chs.length);
    const bar=acc.querySelector('.subj-acc-bar');if(bar)bar.style.width=pct+'%';
    const pEl=acc.querySelector('[style*="text-align:right"] div');if(pEl)pEl.textContent=pct+'%';
    const sEl=acc.querySelector('.subj-acc-header > div:nth-child(2) > div:last-child');
    if(sEl)sEl.textContent=dc+'/'+chs.length+' completed · '+pct+'%';
  }
}
function setChStr(subj,id,str){
  const ch=DB.chapters[subj].find(c=>c.id===id);if(!ch)return;
  ch.strength=str;sv('chapters');toast('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Marked as '+str);
  const row=document.getElementById(`chrow-${subj}-${id}`);
  if(row){
    row.querySelectorAll('.spill').forEach(b=>b.classList.remove('on'));
    const target=row.querySelector(`.spill.${str}`);
    if(target)target.classList.add('on');
  }
}

/* ═══════════════ PYQ MASTERY MATRIX ═══════════════ */
function togglePyq(subj,id,type){
  const ch=DB.chapters[subj].find(c=>c.id===id);if(!ch)return;
  if(type==='mains')ch.mainsPyqDone=!ch.mainsPyqDone;
  else if(type==='adv')ch.advPyqDone=!ch.advPyqDone;
  sv('chapters');
  const row=document.getElementById(`chrow-${subj}-${id}`);
  if(row){
    const badge=row.querySelector(`.pyq-${type}`);
    if(badge)badge.classList.toggle('pyq-on');
  }
  toast(type==='mains'?(ch.mainsPyqDone?'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Mains PYQ marked done':'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg> Mains PYQ cleared'):(ch.advPyqDone?'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Advanced PYQ marked done':'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg> Advanced PYQ cleared'));
}

/* ═══════════════ CHAPTER MICRO-TOPIC SPLITTER ═══════════════ */
function toggleSubTopics(subj,id){
  const panel=document.getElementById('stp-'+subj+'-'+id);
  if(!panel)return;
  const isVisible=panel.style.display!=='none';
  panel.style.display=isVisible?'none':'block';
}
function toggleSubTopic(subj,chId,stId){
  const ch=DB.chapters[subj].find(c=>c.id===chId);if(!ch||!ch.subTopics)return;
  const st=ch.subTopics.find(s=>s.id===stId);if(!st)return;
  st.completed=!st.completed;
  sv('chapters');
  updateChapterList();
}
function addSubTopic(subj,chId){
  const inp=document.getElementById('sti-'+subj+'-'+chId);if(!inp)return;
  const name=inp.value.trim();if(!name){toast('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Enter a topic name');return;}
  const ch=DB.chapters[subj].find(c=>c.id===chId);if(!ch)return;
  if(!ch.subTopics)ch.subTopics=[];
  ch.subTopics.push({id:subj+'_st_'+uid(),name,completed:false});
  sv('chapters');
  updateChapterList();
  toast('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Micro-topic added');
}
function openAddCh(subj){
  document.getElementById('addch-subj').value=subj;
  document.getElementById('addch-name').value='';
  document.getElementById('addch-title').textContent='Add Chapter — '+subj.charAt(0).toUpperCase()+subj.slice(1);
  om('m-add-ch');
  setTimeout(()=>document.getElementById('addch-name').focus(),320);
}
function saveAddCh(){
  const subj=document.getElementById('addch-subj').value;
  const name=document.getElementById('addch-name').value.trim();
  if(!name){toast('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Enter chapter name');return;}
  const id=subj.charAt(0)+'_'+uid();
  DB.chapters[subj].push(mkCh(id,name));
  sv('chapters');cm('m-add-ch');updateChapterList();toast('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Chapter added');
}
let editChData=null;
function openEditCh(subj,id){
  const ch=DB.chapters[subj].find(c=>c.id===id);if(!ch)return;
  editChData={subj,id};
  document.getElementById('editch-name').value=ch.name;
  document.getElementById('editch-title').textContent='Edit Chapter';
  om('m-edit-ch');
  setTimeout(()=>document.getElementById('editch-name').focus(),320);
}
function saveEditCh(){
  if(!editChData)return;
  const name=document.getElementById('editch-name').value.trim();
  if(!name){toast('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Enter chapter name');return;}
  const ch=DB.chapters[editChData.subj].find(c=>c.id===editChData.id);
  if(ch){ch.name=name;sv('chapters');}
  cm('m-edit-ch');updateChapterList();toast('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Chapter updated');
}
function deleteEditCh(){
  if(!editChData)return;
  cfm2('Delete chapter?','This cannot be undone.',()=>{
    DB.chapters[editChData.subj]=DB.chapters[editChData.subj].filter(c=>c.id!==editChData.id);
    sv('chapters');cm('m-edit-ch');updateChapterList();toast('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Deleted');
  });
}

/* ═══════════════ WINDOW EXPORTS ═══════════════ */
window.renderChapters=renderChapters;
window.updateChapterList=updateChapterList;
window.buildChaptersList=buildChaptersList;
window.toggleAcc=toggleAcc;
window.setMF=setMF;
window.toggleChDone=toggleChDone;
window.setChStr=setChStr;
window.togglePyq=togglePyq;
window.toggleSubTopics=toggleSubTopics;
window.toggleSubTopic=toggleSubTopic;
window.addSubTopic=addSubTopic;
window.openAddCh=openAddCh;
window.saveAddCh=saveAddCh;
window.openEditCh=openEditCh;
window.saveEditCh=saveEditCh;
window.deleteEditCh=deleteEditCh;
window.setChSearch=function(v){chSearch=v;};
