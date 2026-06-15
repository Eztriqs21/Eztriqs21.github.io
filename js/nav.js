// js/nav.js
import { KEYS } from './data.js';
import { animateAllCounters } from './helpers.js';

/* ═══════════════ NAV ═══════════════ */
export let PAGE='dashboard';
export let notesChapterId=null,noteType='detailed';
export let aPriority='none',pendingAFiles=[],pendingTFiles=[];

export let calcQuestions=[],calcShowResults=false,calcAnsKey={};

export function go(page){
  PAGE=page;
  document.querySelectorAll('.si,.bni').forEach(el=>el.classList.remove('on'));
  document.querySelectorAll('.si .si-act').forEach(el=>el.remove());
  const si=document.getElementById('sn-'+page),bn=document.getElementById('bn-'+page);
  if(si){si.classList.add('on');const d=document.createElement('div');d.className='si-act';si.insertBefore(d,si.firstChild);}
  if(bn){bn.classList.add('on');}
  else{const more=document.getElementById('bn-more');if(more)more.classList.add('on');}
  closeSidebar();
  try{localStorage.setItem(KEYS.tab,page);}catch(e){}
  detachCalcKeyboard();
  pendingAFiles=[];pendingTFiles=[];
  render();
}

let _renderLock=false;
let _lastPage=null;

export function render(){
  if(_renderLock)return;
  _renderLock=true;
  const el=document.getElementById('content-wrap');
  
  el.style.transition='opacity .18s var(--ease-out), transform .18s var(--ease-out)';
  el.style.opacity='0';
  el.style.transform='translateY(8px)';
  
  setTimeout(()=>{
    el.innerHTML='';
    if(PAGE==='dashboard')window.renderDashboard(el);
    else if(PAGE==='analytics')window.renderAnalytics(el);
    else if(PAGE==='revision')window.renderRevision(el);
    else if(PAGE==='pyq')window.renderPYQ(el);
    else if(PAGE==='scoreanalytics')window.renderScoreAnalytics(el);
    else if(PAGE==='chapters')window.renderChapters(el);
    else if(PAGE==='assignments')window.renderAssignments(el);
    else if(PAGE==='tests')window.renderTests(el);
     else if(PAGE==='calculator')window.renderCalculator(el);
     else if(PAGE==='mocktests')window.renderMockTests(el);
     else if(PAGE==='doubtsolver')window.renderDoubtSolver(el);
     else if(PAGE==='prep')window.renderPrep(el);
    
    el.offsetHeight;
    el.style.opacity='1';
    el.style.transform='translateY(0)';
    el.style.transition='opacity .25s var(--ease-out), transform .25s var(--ease-out)';
    
    _renderLock=false;
    _lastPage=PAGE;
    setTimeout(()=>animateAllCounters(el),50);
  }, 180);
}

/* SIDEBAR */
let _sbOpen=false;
export function toggleSidebar(){
  _sbOpen=!_sbOpen;
  const sb=document.getElementById('sidebar');
  const ov=document.getElementById('mob-overlay');
  const ham=document.getElementById('hamburger');
  if(_sbOpen){
    sb.classList.add('open');
    ov.classList.add('open');
    ov.style.cssText='display:block;position:fixed;inset:0;background:rgba(4,6,10,.55);z-index:195;backdrop-filter:blur(4px);';
    ham.textContent='✕';
    document.body.style.overflow='hidden';
  }else{
    closeSidebar();
  }
}
export function closeSidebar(){
  _sbOpen=false;
  const sb=document.getElementById('sidebar');
  const ov=document.getElementById('mob-overlay');
  const ham=document.getElementById('hamburger');
  sb.classList.remove('open');
  ov.classList.remove('open');
  ov.style.display='none';
  ham.textContent='☰';
  document.body.style.overflow='';
}
(function(){
  const ov=document.getElementById('mob-overlay');
  if(ov)ov.addEventListener('click',function(e){e.preventDefault();closeSidebar();});
  const sb=document.getElementById('sidebar');
  if(sb)sb.addEventListener('click',function(e){e.stopPropagation();});
})();

/* ═══════════════ WINDOW EXPORTS ═══════════════ */
window.PAGE=PAGE;
window.go=go;window.render=render;
window.toggleSidebar=toggleSidebar;window.closeSidebar=closeSidebar;
window.notesChapterId=notesChapterId;window.noteType=noteType;
window.aPriority=aPriority;window.pendingAFiles=pendingAFiles;window.pendingTFiles=pendingTFiles;
window.calcQuestions=calcQuestions;window.calcShowResults=calcShowResults;window.calcAnsKey=calcAnsKey;

/* Re-export setters for nav state that page modules mutate */
window.setNotesChapterId=function(v){notesChapterId=v;window.notesChapterId=v;};
window.setNoteType=function(v){noteType=v;window.noteType=v;};
window.setAPriority=function(v){aPriority=v;window.aPriority=v;};
window.setPendingAFiles=function(v){pendingAFiles=v;window.pendingAFiles=v;};
window.setPendingTFiles=function(v){pendingTFiles=v;window.pendingTFiles=v;};
window.setCalcQuestions=function(v){calcQuestions=v;window.calcQuestions=v;};
window.setCalcShowResults=function(v){calcShowResults=v;window.calcShowResults=v;};
window.setCalcAnsKey=function(v){calcAnsKey=v;window.calcAnsKey=v;};
