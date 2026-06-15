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
let _lastPage=null;

function render(){
  if(_renderLock)return;
  _renderLock=true;
  const el=document.getElementById('content-wrap');
  
  // Page transition: fade out current, then render new
  el.style.transition='opacity .18s var(--ease-out), transform .18s var(--ease-out)';
  el.style.opacity='0';
  el.style.transform='translateY(8px)';
  
  setTimeout(()=>{
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
    
    // Force reflow then animate in
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
function toggleSidebar(){
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