// page-js/chapters.js
/* ═══════════════ CHAPTERS ═══════════════ */
import { DB, sv, findCh, mkCh } from '../js/data.js';
import { uid, esc, safePct, cm, om, toast, setupDZ, debouncedUpdChList } from '../js/helpers.js';
let matrixFilter='all';
let chSearch='';
let accState={physics:true,chemistry:true,maths:true};
/* ═══════════════ CHAPTER RENDERING (TARGETED DOM UPDATES) ═══════════════ */
function updateChapterList(){
  const container=document.getElementById('ch-list-container');
  if(container) container.innerHTML=buildChaptersList();
}
function buildChaptersList(){
  const subjects=[{key:'physics',label:'Physics',icon:'⚡',color:'var(--phys)'},{key:'chemistry',label:'Chemistry',icon:'⚗️',color:'var(--chem)'},{key:'maths',label:'Maths',icon:'📐',color:'var(--math)'}];
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
        <div style="padding:8px 20px;border-bottom:1px solid rgba(255,255,255,.03)"><div class="pbar-wrap" style="height:4px"><div class="subj-acc-bar" style="height:4px;width:${pct}%;background:${s.color}"></div></div></div>
        <div>${shown.length===0?`<div class="empty" style="padding:28px"><div class="empty-title">${chSearch.trim()?'No chapters match "'+esc(chSearch.trim())+'"':'No chapters match this filter'}</div>${chSearch.trim()?`<div class="empty-sub" style="margin-bottom:12px">Add a new chapter to ${s.label}?</div><button class="btn btn-primary btn-sm" onclick="chSearch='';document.getElementById('ch-search').value='';openAddCh('${s.key}')">+ Add Chapter</button>`:''}</div>`:
        shown.map(ch=>`<div class="chapter-row" id="chrow-${s.key}-${ch.id}">
          <div class="ch-check ${ch.completed?'done':''}" onclick="event.stopPropagation();toggleChDone('${s.key}','${ch.id}')">
            ${ch.completed?'<svg width="11" height="11" viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/></svg>':''}
          </div>
          <span class="ch-name-txt ${ch.completed?'done':''}">${esc(ch.name)}</span>
          <span class="ch-edit-ico" onclick="event.stopPropagation();openEditCh('${s.key}','${ch.id}')">✏️</span>
          <div class="strength-pills">
            ${['strong','decent','weak','uncovered'].map(str=>`<button class="spill ${str} ${ch.strength===str?'on':''}" onclick="event.stopPropagation();setChStr('${s.key}','${ch.id}','${str}')">${str==='uncovered'?'—':str.charAt(0).toUpperCase()+str.slice(1)}</button>`).join('')}
          </div>
          <button class="ch-notes-btn" onclick="event.stopPropagation();openNotes('${s.key}','${ch.id}')">
            📎 ${((ch.notes?.detailed?.length||0)+(ch.notes?.revision?.length||0))>0?((ch.notes?.detailed?.length||0)+(ch.notes?.revision?.length||0))+' notes':'Notes'}
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
    <div><div class="pg-title">Chapters</div><div class="pg-sub">Syllabus mastery & tracking</div></div>
  </div>
  <div id="ch-filter-bar" style="display:flex;gap:7px;overflow-x:auto;scrollbar-width:none;padding-bottom:6px;margin-bottom:12px" class="anim-up d1">
    ${filters.map(f=>`<button class="btn btn-sm ${matrixFilter===f?'btn-primary':'btn-ghost'}" onclick="setMF('${f}')">${f==='all'?'All Chapters':f.charAt(0).toUpperCase()+f.slice(1)}</button>`).join('')}
  </div>
  <div style="margin-bottom:16px" class="anim-up d1">
    <input class="inp" type="text" id="ch-search" placeholder="🔍 Search chapters..." oninput="chSearch=this.value;debouncedUpdChList()" style="font-size:13px" value="${esc(chSearch)}" autocomplete="off">
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
  ch.strength=str;sv('chapters');toast('✅ Marked as '+str);
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
  toast(type==='mains'?(ch.mainsPyqDone?'✅ Mains PYQ marked done':'⬜ Mains PYQ cleared'):(ch.advPyqDone?'✅ Advanced PYQ marked done':'⬜ Advanced PYQ cleared'));
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
  const name=inp.value.trim();if(!name){toast('⚠️ Enter a topic name');return;}
  const ch=DB.chapters[subj].find(c=>c.id===chId);if(!ch)return;
  if(!ch.subTopics)ch.subTopics=[];
  ch.subTopics.push({id:subj+'_st_'+uid(),name,completed:false});
  sv('chapters');
  updateChapterList();
  toast('✅ Micro-topic added');
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
  if(!name){toast('⚠️ Enter chapter name');return;}
  const id=subj.charAt(0)+'_'+uid();
  DB.chapters[subj].push(mkCh(id,name));
  sv('chapters');cm('m-add-ch');updateChapterList();toast('✅ Chapter added');
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
  if(!name){toast('⚠️ Enter chapter name');return;}
  const ch=DB.chapters[editChData.subj].find(c=>c.id===editChData.id);
  if(ch){ch.name=name;sv('chapters');}
  cm('m-edit-ch');updateChapterList();toast('✅ Chapter updated');
}
function deleteEditCh(){
  if(!editChData)return;
  cfm2('Delete chapter?','This cannot be undone.',()=>{
    DB.chapters[editChData.subj]=DB.chapters[editChData.subj].filter(c=>c.id!==editChData.id);
    sv('chapters');cm('m-edit-ch');updateChapterList();toast('🗑️ Deleted');
  });
}

/* ═══════════════ CHAPTER NOTES ═══════════════ */
function openNotes(subj,id){
  const ch=findCh(subj,id);if(!ch)return;
  notesChapterId={subj,id};noteType='detailed';
  document.getElementById('notes-chapter-name').textContent=ch.name;
  setNoteType('detailed');renderNotesList(ch);
  setupDZ('n-dz','n-finp',handleNoteFiles);
  om('m-notes');
}
function setNoteType(t){
  noteType=t;
  const det=document.getElementById('note-type-det'),rev=document.getElementById('note-type-rev'),lbl=document.getElementById('note-type-lbl');
  if(det){det.className=t==='detailed'?'btn btn-sm':'btn btn-ghost btn-sm';det.style.cssText=t==='detailed'?'background:var(--accent-dim);color:var(--accent);border:1px solid rgba(160,160,160,.3)':'';}
  if(rev){rev.className=t==='revision'?'btn btn-sm':'btn btn-ghost btn-sm';rev.style.cssText=t==='revision'?'background:rgba(59,130,246,.15);color:var(--phys);border:1px solid rgba(59,130,246,.3)':'';}
  if(lbl)lbl.textContent=t==='detailed'?'Detailed':'Revision';
}
function renderNotesList(ch){
  if(!ch)return;
  const det=ch.notes?.detailed||[],rev=ch.notes?.revision||[];
  const dL=document.getElementById('n-det-list'),dE=document.getElementById('n-det-empty');
  const rL=document.getElementById('n-rev-list'),rE=document.getElementById('n-rev-empty');
  if(dL){dL.innerHTML=det.map(f=>fItemHTML(f)).join('');if(dE)dE.style.display=det.length?'none':'block';}
  if(rL){rL.innerHTML=rev.map(f=>fItemHTML(f)).join('');if(rE)rE.style.display=rev.length?'none':'block';}
}
function handleNoteFiles(files){
  if(!notesChapterId)return;
  const ct=noteType;
  rdFiles(files,obj=>{
    const ch=findCh(notesChapterId.subj,notesChapterId.id);if(!ch)return;
    if(!ch.notes)ch.notes={detailed:[],revision:[]};
    if(!ch.notes[ct])ch.notes[ct]=[];
    ch.notes[ct].push(obj);sv('chapters');renderNotesList(ch);
    updateChapterList();toast('✅ '+ct+' note saved');
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
window.openNotes=openNotes;
window.setNoteType=setNoteType;
window.renderNotesList=renderNotesList;
window.handleNoteFiles=handleNoteFiles;
