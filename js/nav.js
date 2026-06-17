// js/nav.js — Navigation with Motion One page transitions
import { KEYS } from './data.js';
import { animateAllCounters } from './helpers.js';
import { pageExit, pageEnter, shouldAnimate, animateAllEntrance } from './animations.js';
import { callPageRenderer } from './page-registry.js';

/* ═══════════════ NAV ═══════════════ */
export let PAGE='dashboard';
export let notesChapterId=null,noteType='detailed';
export let aPriority='none',pendingAFiles=[],pendingTFiles=[];

export let calcQuestions=[],calcShowResults=false,calcAnsKey={};

export function go(page){
  if(PAGE==='mocktests'&&page!=='mocktests'&&window.cmtCleanup)window.cmtCleanup();
  PAGE=page;
  window.PAGE=page;
  document.documentElement.setAttribute('data-page',page);
  document.querySelectorAll('.si,.bni').forEach(el=>el.classList.remove('on'));
  document.querySelectorAll('.si .si-act').forEach(el=>el.remove());
  const si=document.getElementById('sn-'+page),bn=document.getElementById('bn-'+page);
  if(si){si.classList.add('on');const d=document.createElement('div');d.className='si-act';si.insertBefore(d,si.firstChild);}
  if(bn){bn.classList.add('on');}
  else{const more=document.getElementById('bn-more');if(more)more.classList.add('on');}
  closeSidebar();
  try{localStorage.setItem(KEYS.tab,page);}catch(e){}
  window.detachCalcKeyboard?.();
  pendingAFiles=[];pendingTFiles=[];
  render();
}

let _renderLock=false;
let _lastPage=null;

export function render(){
  if(_renderLock)return;
  _renderLock=true;
  const el=document.getElementById('content-wrap');

  if(shouldAnimate()){
    pageExit(el).then(()=>{
      _renderSwap(el);
    }).catch(()=>{
      _renderSwap(el);
    });
  }else{
    _renderSwap(el);
  }
}

function _renderSwap(el){
  el.innerHTML='';
  try{
    if(!callPageRenderer(PAGE, el)){
      el.innerHTML='<div style="padding:40px;text-align:center;color:var(--muted)">Page not found</div>';
    }
  }catch(err){
    console.error('Render error for page:',PAGE,err);
    el.innerHTML='<div style="padding:40px;text-align:center;color:var(--muted)"><div style="font-size:18px;font-weight:700;margin-bottom:8px">Something went wrong</div><div style="font-size:13px">'+(err.message||'').replace(/</g,'&lt;')+'</div></div>';
  }

  if(shouldAnimate()){
    pageEnter(el).then(()=>{
      animateAllEntrance(el);
      _renderLock=false;_lastPage=PAGE;setTimeout(()=>animateAllCounters(el),50);
    }).catch(()=>{
      animateAllEntrance(el);
      _renderLock=false;_lastPage=PAGE;setTimeout(()=>animateAllCounters(el),50);
    });
  }else{
    el.offsetHeight;
    animateAllEntrance(el);
    _renderLock=false;_lastPage=PAGE;setTimeout(()=>animateAllCounters(el),50);
  }
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
    ov.style.cssText='display:block;position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:195;backdrop-filter:blur(4px);';
    ham.innerHTML='&#10005;';
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
  if(sb)sb.classList.remove('open');
  if(ov){ov.classList.remove('open');ov.style.display='none';}
  if(ham)ham.innerHTML='&#9776;';
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
window.go=go;window.render=render;window._renderSwap=_renderSwap;
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
