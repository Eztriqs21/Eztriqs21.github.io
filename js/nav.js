// js/nav.js
/* ═══════════════ NAV ═══════════════ */
let PAGE='dashboard';
let notesChapterId=null,noteType='detailed';
let aPriority='none',pendingAFiles=[],pendingTFiles=[];

let calcQuestions=[],calcShowResults=false,calcAnsKey={};

function go(page){
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
function render(){
  if(_renderLock)return;
  _renderLock=true;
  const el=document.getElementById('content-wrap');
  el.innerHTML='';
  if(PAGE==='dashboard')renderDashboard(el);
  else if(PAGE==='analytics')renderAnalytics(el);
  else if(PAGE==='revision')renderRevision(el);
  else if(PAGE==='pyq')renderPYQ(el);
  else if(PAGE==='scoreanalytics')renderScoreAnalytics(el);
  else if(PAGE==='chapters')renderChapters(el);
  else if(PAGE==='assignments')renderAssignments(el);
  else if(PAGE==='tests')renderTests(el);
   else if(PAGE==='calculator')renderCalculator(el);
   else if(PAGE==='mocktests')renderMockTests(el);
   else if(PAGE==='doubtsolver')renderDoubtSolver(el);
   else if(PAGE==='prep')renderPrep(el);
   _renderLock=false;
  setTimeout(()=>animateAllCounters(el),50);
}

/* SIDEBAR */
let _sbOpen=false;
function toggleSidebar(){
  _sbOpen=!_sbOpen;
  const sb=document.getElementById('sidebar');
  const ov=document.getElementById('mob-overlay');
  const ham=document.getElementById('hamburger');
  if(_sbOpen){
    sb.classList.add('open');
    ov.classList.add('open');
    ov.style.cssText='display:block;position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:195;';
    ham.textContent='✕';
    document.body.style.overflow='hidden';
  }else{
    closeSidebar();
  }
}
function closeSidebar(){
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
