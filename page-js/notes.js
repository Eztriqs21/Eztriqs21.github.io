// page-js/notes.js
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
  if(det){det.className=t==='detailed'?'btn btn-sm':'btn btn-ghost btn-sm';det.style.cssText=t==='detailed'?'background:var(--indigo-dim);color:var(--indigo);border:1px solid rgba(99,102,241,.3)':'';}
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
