// page-js/dashboard.js
import { DB } from '../js/data.js';
import { safePct, fmtDate, esc } from '../js/helpers.js';
import { pageLoadChoreography, chartChoreography, staggerIn, shouldAnimate } from '../js/animations.js';
/* ═══════════════ DASHBOARD ═══════════════ */
function renderDashboard(el){
  const all=[...DB.chapters.physics,...DB.chapters.chemistry,...DB.chapters.maths];
  const done=all.filter(c=>c.completed).length,total=all.length;
  const active=DB.assignments.filter(a=>!a.completed).length;
  const tests=DB.tests;
  const avg=tests.length?Math.round(tests.reduce((s,t)=>s+(t.maxScore>0?(t.totalScore/t.maxScore)*100:0),0)/tests.length):0;
  const logs=DB.studyLogs||[];
  const today=new Date().toISOString().split('T')[0];
  const todayH=logs.filter(l=>l.date===today).reduce((s,l)=>s+l.duration,0);
  const weekH=logs.filter(l=>{const d=new Date(l.date),n=new Date();return(n-d)/86400000<=7;}).reduce((s,l)=>s+l.duration,0);
  const phD=DB.chapters.physics.filter(c=>c.completed).length,chD=DB.chapters.chemistry.filter(c=>c.completed).length,mD=DB.chapters.maths.filter(c=>c.completed).length;
  const recLogs=[...logs].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,5);
  const recTests=[...tests].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,3);
  
  el.innerHTML=`
  <div class="pg-hdr anim-up"><div class="pg-title" data-text="Command Center">Command Center</div><div class="pg-sub">Your JEE preparation intelligence dashboard</div></div>
  <div class="stats-grid">
    <div class="gc stat-card anim-up d1"><div class="stat-icon" style="background:var(--accent-dim)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div><div class="stat-val"><span data-count="${active}">0</span></div><div class="stat-label">Active Tasks</div><div class="stat-sub">Pending assignments</div></div>
    <div class="gc stat-card anim-up d2"><div class="stat-icon" style="background:var(--phys-dim)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></div><div class="stat-val"><span data-count="${done}">0</span><span style="color:var(--muted);font-size:16px">/${total}</span></div><div class="stat-label">Chapters Done</div><div class="stat-sub">${safePct(done,total)}% complete</div></div>
    <div class="gc stat-card anim-up d3"><div class="stat-icon" style="background:var(--green-dim)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></div><div class="stat-val"><span data-count="${avg}">0</span>%</div><div class="stat-label">Avg Test Score</div><div class="stat-sub">Across ${tests.length} tests</div></div>
    <div class="gc stat-card anim-up d4"><div class="stat-icon" style="background:var(--chem-dim)"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div><div class="stat-val"><span data-count="${(+weekH).toFixed(1)}">0</span>h</div><div class="stat-label">This Week</div><div class="stat-sub">Today: <span data-count="${(+todayH).toFixed(1)}">0</span>h</div></div>
  </div>
  <div class="section-block anim-up d2">
    <div class="section-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> Subject Progress</div>
    <div class="subj-progress-grid">
      ${[{n:'Physics',i:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',c:'var(--phys)',d:phD,t:DB.chapters.physics.length},{n:'Chemistry',i:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6v11l4 5H5l4-5V3z"/><line x1="9" y1="3" x2="15" y2="3"/></svg>',c:'var(--chem)',d:chD,t:DB.chapters.chemistry.length},{n:'Mathematics',i:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20L20 4"/><path d="M15 4h5v5"/><path d="M4 20l5-5"/></svg>',c:'var(--math)',d:mD,t:DB.chapters.maths.length}].map(s=>{
        const p=safePct(s.d,s.t);
        return `<div class="gc" style="padding:18px;cursor:pointer" onclick="go('chapters')">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
            <div style="width:36px;height:36px;border-radius:10px;background:${s.c}20;display:flex;align-items:center;justify-content:center;font-size:16px">${s.i}</div>
            <div><div style="font-size:14px;font-weight:600">${s.n}</div><div style="font-size:11px;color:${s.c};font-weight:700;margin-top:1px">${p}%</div></div>
          </div>
          <div class="pbar-wrap" style="height:5px"><div class="pbar" style="height:5px;width:${p}%;background:${s.c}"></div></div>
          <div style="font-size:10px;color:var(--faint);margin-top:6px">${s.d} / ${s.t} chapters</div>
        </div>`;}).join('')}
    </div>
  </div>
  <div class="recent-grid anim-up d3">
    <div>
      <div class="section-title"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Study Sessions <button class="btn btn-primary btn-xs" onclick="openStudyLog()">+ Log</button></div>
      <div class="gc" style="padding:16px 18px">
        ${recLogs.length===0?`<div class="empty" style="padding:28px 0"><div class="empty-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></div><div class="empty-title">No sessions logged</div><div class="empty-sub">Tap "+ Log" to track study time</div></div>`:
        recLogs.map(l=>`<div class="study-log-row">
          <div class="slr-time">${fmtDate(l.date).slice(0,6)}</div>
          <div style="flex:1"><div class="slr-sub">${esc(l.topic)}</div><div style="font-size:10px;color:var(--faint)">${esc(l.subject)}</div></div>
          <div class="slr-dur">${(+l.duration).toFixed(1)}h</div>
          <button class="btn btn-danger btn-xs" onclick="deleteStudyLog('${l.id}')">✕</button>
        </div>`).join('')}
      </div>
    </div>
    <div>
      <div class="section-title"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> Recent Tests</div>
      <div class="gc" style="padding:16px 18px">
        ${recTests.length===0?`<div class="empty" style="padding:28px 0"><div class="empty-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></div><div class="empty-title">No tests yet</div><div class="empty-sub">Go to Test to add</div></div>`:
        recTests.map(t=>{const p=t.maxScore>0?Math.round(t.totalScore/t.maxScore*100):0;const c=p>=70?'var(--green)':p>=50?'var(--accent)':'var(--red)';return`<div class="study-log-row"><div class="slr-time">${fmtDate(t.date).slice(0,6)}</div><div class="slr-sub">${esc(t.name)}</div><div class="slr-dur" style="color:${c}">${t.totalScore}/${t.maxScore}</div></div>`;}).join('')}
      </div>
    </div>
    <div>
      <div class="section-title"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Recent Mock Tests</div>
      <div class="gc" style="padding:16px 18px">
        ${(DB.mockTests||[]).length===0?`<div class="empty" style="padding:28px 0"><div class="empty-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div><div class="empty-title">No mock tests yet</div><div class="empty-sub"><a href="#" onclick="go('mocktests');return false" style="color:var(--accent)">Go to Mock Tests</a> to log</div></div>`:
        [...DB.mockTests].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,4).map(m=>{const p=Math.round(m.marksScored/m.totalMarks*100);const c=p>=70?'var(--green)':p>=40?'var(--accent)':'var(--red)';return`<div class="study-log-row"><div class="slr-time">${fmtDate(m.date).slice(0,6)}</div><div class="slr-sub">${esc(m.subject)}</div><div class="slr-dur" style="color:${c}">${m.marksScored}/${m.totalMarks}</div></div>`;}).join('')}
      </div>
    </div>
  </div>`;
}

/* ═══════════════ WRAPPER WITH CHOREOGRAPHY ═══════════════ */
window.renderDashboard=function(el){
  renderDashboard(el);
  if(shouldAnimate()){
    setTimeout(()=>{
      pageLoadChoreography(el);
      chartChoreography(el);
      staggerIn(el.querySelectorAll('.section-block'),{delay:0.15});
    },60);
  }
};
