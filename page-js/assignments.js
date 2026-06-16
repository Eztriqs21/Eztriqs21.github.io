// page-js/assignments.js
import { DB, sv } from '../js/data.js';
import { esc, cm, om, toast, setupDZ, debouncedUpdAsnList, rdFiles, cfm2, fItemHTML, fItemHTMLRaw } from '../js/helpers.js';
/* ═══════════════ ASSIGNMENTS ═══════════════ */
let asnSearch='';
function updateAssignmentList(){
  const container=document.getElementById('asn-list-container');
  if(!container)return;
  let asns=[...DB.assignments];
  if(asnSearch.trim()){
    const q=asnSearch.trim().toLowerCase();
    asns=asns.filter(function(a){
      if(a.title&&a.title.toLowerCase().includes(q))return true;
      if(a.description&&a.description.toLowerCase().includes(q))return true;
      if(a.syllabus&&a.syllabus.toLowerCase().includes(q))return true;
      return false;
    });
  }
  container.innerHTML=asns.length===0?`<div class="gc empty"><div class="empty-icon">📋</div><div class="empty-title">${DB.assignments.length?'No assignments match your search':'No assignments'}</div><div class="empty-sub">${DB.assignments.length?'Try a different search term':'Click &quot;+ Add Task&quot; to get started'}</div></div>`:
  asns.map((a,i)=>asnCard(a,i)).join('');
}
function renderAssignments(el){
  let asns=[...DB.assignments];
  if(asnSearch.trim()){
    const q=asnSearch.trim().toLowerCase();
    asns=asns.filter(function(a){
      if(a.title&&a.title.toLowerCase().includes(q))return true;
      if(a.description&&a.description.toLowerCase().includes(q))return true;
      if(a.syllabus&&a.syllabus.toLowerCase().includes(q))return true;
      return false;
    });
  }
  const pend=asns.filter(a=>!a.completed).length;
  el.innerHTML=`
  <div class="pg-hdr anim-up" style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px">
    <div><div class="pg-title">Assignments</div><div class="pg-sub">Tasks and study materials</div></div>
    <button class="btn btn-primary" onclick="openAddAssign()">+ Add Task</button>
  </div>
  <input class="inp anim-up d1" type="text" id="asn-search" placeholder="🔍 Search assignments by title, description, syllabus..." oninput="asnSearch=this.value;debouncedUpdAsnList()" style="font-size:13px;margin-bottom:12px" value="${esc(asnSearch)}" autocomplete="off">
  <div id="asn-stats" style="display:flex;gap:10px;margin-bottom:20px" class="anim-up d2">
    <div class="gc" style="padding:14px 18px;flex:1;text-align:center"><div style="font-family:'Playfair Display',serif;font-size:22px">${asns.length}</div><div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;margin-top:3px">${DB.assignments.length===asns.length?'Total':'Filtered'}</div></div>
    <div class="gc" style="padding:14px 18px;flex:1;text-align:center"><div style="font-family:'Playfair Display',serif;font-size:22px;color:var(--accent)">${pend}</div><div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;margin-top:3px">Pending</div></div>
    <div class="gc" style="padding:14px 18px;flex:1;text-align:center"><div style="font-family:'Playfair Display',serif;font-size:22px;color:var(--green)">${asns.length-pend}</div><div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.07em;margin-top:3px">Done</div></div>
  </div>
  <div id="asn-list-container">${asns.length===0?`<div class="gc empty"><div class="empty-icon">📋</div><div class="empty-title">${DB.assignments.length?'No assignments match your search':'No assignments'}</div><div class="empty-sub">${DB.assignments.length?'Try a different search term':'Click &quot;+ Add Task&quot; to get started'}</div></div>`:
  asns.map((a,i)=>asnCard(a,i)).join('')}</div>`;
}
function asnCard(a,i){
  const pc={high:'chip-hi',medium:'chip-med',low:'chip-lo'};
  const pLbl=a.priority==='none'?'':a.priority;
  const atts=a.attachments||[];
  return `<div class="gc anim-up" id="asn-card-${a.id}" style="margin-bottom:12px;animation-delay:${i*40}ms">
    <div style="display:flex;align-items:flex-start;gap:12px;padding:16px 18px">
      <div class="ch-check ${a.completed?'done':''}" onclick="toggleAsnDone('${a.id}')" style="margin-top:2px">
        ${a.completed?'<svg width="11" height="11" viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/></svg>':''}
      </div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:5px">
          <div class="asn-title-txt" style="font-size:14px;font-weight:600;color:${a.completed?'var(--faint)':'#fff'};${a.completed?'text-decoration:line-through':''}">${esc(a.title)}</div>
          ${a.priority&&a.priority!=='none'?`<span class="chip ${pc[a.priority]}">${a.priority}</span>`:''}
        </div>
        ${a.description?`<div style="font-size:12px;color:var(--muted);margin-bottom:8px;line-height:1.5">${esc(a.description)}</div>`:''}
        ${a.syllabus?`<div style="font-size:11px;color:var(--faint);margin-bottom:8px;padding:6px 10px;background:rgba(255,255,255,.03);border-radius:8px">📚 ${esc(a.syllabus)}</div>`:''}
        ${atts.length?`<div class="file-list" style="margin-bottom:10px">${atts.map((d,fi)=>fItemHTMLRaw(d,'Attachment '+(fi+1))).join('')}</div>`:''}
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <label class="btn btn-ghost btn-xs" style="cursor:pointer">📎 Attach<input type="file" multiple accept=".pdf,image/*" onchange="attachToAsn('${a.id}',this.files)"/></label>
          <button class="btn btn-danger btn-xs" onclick="delAsn('${a.id}')">🗑️ Delete</button>
        </div>
      </div>
    </div>
  </div>`;
}
function openAddAssign(){window.pendingAFiles=[];window.aPriority='none';setAP('none');['a-title','a-desc','a-syl'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});document.getElementById('a-file-list').innerHTML='';document.getElementById('a-syl-wrap').style.display='none';setupDZ('a-dz','a-finp',handleAFiles);om('m-asgn');setTimeout(function(){document.getElementById('a-title').focus();},320);}
function setAP(p){
  window.aPriority=p;
  ['none','high','medium','low'].forEach(pri=>{
    const id={none:'ap-none',high:'ap-hi',medium:'ap-med',low:'ap-lo'}[pri];
    const btn=document.getElementById(id);if(!btn)return;
    btn.style.cssText=pri===p?'background:var(--accent-dim);color:var(--accent);border:1px solid rgba(160,160,160,.3)':'';
  });
}
function handleAFiles(files){rdFiles(files,obj=>{window.pendingAFiles.push(obj);refreshAFileList();});}
function refreshAFileList(){const el=document.getElementById('a-file-list');if(!el)return;el.innerHTML=window.pendingAFiles.map((f,i)=>fItemHTML(f)+`<div style="margin:0 12px"><button class="btn btn-danger btn-xs" onclick="window.pendingAFiles.splice(${i},1);refreshAFileList()">✕</button></div>`).join('');}
function saveAssignment(){
  const t=document.getElementById('a-title').value.trim();if(!t){toast('⚠️ Enter a title');return;}
  DB.assignments.unshift({id:'a_'+Date.now(),title:t,description:document.getElementById('a-desc').value.trim(),priority:window.aPriority||'none',completed:false,attachments:window.pendingAFiles.map(f=>({d:f.url||f.data,n:f.name})),syllabus:document.getElementById('a-syl').value.trim()||undefined,createdAt:new Date().toISOString()});
  if(!sv('assignments')){DB.assignments.shift();return;}
  cm('m-asgn');updateAssignmentList();toast('✅ Task added!');
}
function toggleAsnDone(id){
  const a=DB.assignments.find(x=>x.id===id);if(!a)return;
  a.completed=!a.completed;sv('assignments');
  const card=document.getElementById(`asn-card-${a.id}`);
  if(card){
    card.querySelectorAll('.ch-check,.ch-name-txt,.asn-title-txt').forEach(el=>{
      if(el.classList.contains('ch-check')){el.classList.toggle('done');el.innerHTML=a.completed?'<svg width="11" height="11" viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/></svg>':'';}
      else el.classList.toggle('done');
    });
    const titleEl=card.querySelector('.asn-title-txt');
    if(titleEl)titleEl.style.textDecoration=a.completed?'line-through':'none';
  }
}
function delAsn(id){cfm2('Delete task?','This cannot be undone.',()=>{DB.assignments=DB.assignments.filter(x=>x.id!==id);sv('assignments');updateAssignmentList();toast('🗑️ Deleted');});}
function attachToAsn(id,files){rdFiles(files,obj=>{const a=DB.assignments.find(x=>x.id===id);if(!a)return;if(!a.attachments)a.attachments=[];a.attachments.push({d:obj.url||obj.data,n:obj.name});if(!sv('assignments')){a.attachments.pop();return;}updateAssignmentList();toast('📎 Attached!');});}
/* ═══════════════ WINDOW EXPORTS ═══════════════ */
window.renderAssignments=renderAssignments;
window.updateAssignmentList=updateAssignmentList;
window.asnCard=asnCard;
window.openAddAssign=openAddAssign;
window.setAP=setAP;
window.handleAFiles=handleAFiles;
window.refreshAFileList=refreshAFileList;
window.saveAssignment=saveAssignment;
window.toggleAsnDone=toggleAsnDone;
window.delAsn=delAsn;
window.attachToAsn=attachToAsn;
