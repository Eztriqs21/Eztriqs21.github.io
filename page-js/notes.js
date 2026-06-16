// page-js/notes.js
import { findCh, sv } from '../js/data.js';
import { om, setupDZ, toast } from '../js/helpers.js';
/* ═══════════════ CHAPTER NOTES ═══════════════ */
function openNotes(subj,id){
  const ch=findCh(subj,id);if(!ch)return;
  window.notesChapterId={subj,id};window.noteType='detailed';
  document.getElementById('notes-chapter-name').textContent=ch.name;
  setNoteType('detailed');renderNotesList(ch);
  setupDZ('n-dz','n-finp',handleNoteFiles);
  om('m-notes');
}
function setNoteType(t){
  window.noteType=t;
  const det=document.getElementById('note-type-det'),rev=document.getElementById('note-type-rev'),lbl=document.getElementById('note-type-lbl');
  if(det){det.className=t==='detailed'?'btn btn-primary btn-sm':'btn btn-outline btn-sm';det.style.cssText=t==='detailed'?'':'opacity:0.6';}
  if(rev){rev.className=t==='revision'?'btn btn-primary btn-sm':'btn btn-outline btn-sm';rev.style.cssText=t==='revision'?'':'opacity:0.6';}
  if(lbl)lbl.textContent=t==='detailed'?'Detailed':'Revision';
}
function renderNotesList(ch){
  if(!ch)return;
  const det=ch.notes?.detailed||[],rev=ch.notes?.revision||[];
  const dL=document.getElementById('n-det-list'),dE=document.getElementById('n-det-empty');
  const rL=document.getElementById('n-rev-list'),rE=document.getElementById('n-rev-empty');
  if(dL){dL.innerHTML='<div class="stagger anim-fade-in-up">'+det.map(f=>window.fItemHTML(f)).join('')+'</div>';if(dE)dE.style.display=det.length?'none':'block';}
  if(rL){rL.innerHTML='<div class="stagger anim-fade-in-up">'+rev.map(f=>window.fItemHTML(f)).join('')+'</div>';if(rE)rE.style.display=rev.length?'none':'block';}
}
function handleNoteFiles(files){
  if(!window.notesChapterId)return;
  const ct=window.noteType;
  window.rdFiles(files,obj=>{
    const ch=findCh(window.notesChapterId.subj,window.notesChapterId.id);if(!ch)return;
    if(!ch.notes)ch.notes={detailed:[],revision:[]};
    if(!ch.notes[ct])ch.notes[ct]=[];
    ch.notes[ct].push(obj);sv('chapters');renderNotesList(ch);
    window.updateChapterList();toast('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> '+ct+' note saved');
  });
}
/* ═══════════════ WINDOW EXPORTS ═══════════════ */
window.openNotes=openNotes;
window.setNoteType=setNoteType;
window.renderNotesList=renderNotesList;
window.handleNoteFiles=handleNoteFiles;
