// page-js/score-analytics.js
import { DB } from '../js/data.js';

function renderScoreAnalytics(el){
  const tests=DB.tests||[];
  if(!tests.length){
    el.innerHTML=`
    <div class="pg-hdr anim-up"><div class="pg-title" data-text="Score Analytics"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> Score Analytics</div><div class="pg-sub">Track your mock test performance over time.</div></div>
    <div class="gc section-block anim-up d1" style="padding:40px;text-align:center;color:var(--muted)">
      <div style="font-size:40px;margin-bottom:12px"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>
      <div style="font-size:14px;font-weight:600">No mock tests taken yet</div>
      <div style="font-size:12px;margin-top:6px">Take a mock test to see your score analytics here.</div>
    </div>`;
    return;
  }
  const subjs=['physics','chemistry','maths'];
  const subjLbl={physics:'Physics',chemistry:'Chemistry',maths:'Maths'};
  const subjCol={physics:'var(--phys)',chemistry:'var(--chem)',maths:'var(--math)'};
  const sorted=[...tests].sort((a,b)=>new Date(a.date)-new Date(b.date));
  const scores=sorted.map(t=>t.totalScore);
  const avg=Math.round(scores.reduce((a,b)=>a+b,0)/scores.length);
  const best=Math.max(...scores);
  const worst=Math.min(...scores);
  const recent=sorted.slice(-5);
  const recentAvg=Math.round(recent.reduce((a,b)=>a+b.totalScore,0)/recent.length);
  const trend=recentAvg>avg?'↑ Improving':recentAvg<avg-5?'↓ Needs work':'→ Steady';
  const trendCol=recentAvg>avg?'var(--green)':recentAvg<avg-5?'var(--red)':'var(--accent)';
  const maxScore=Math.max(...scores,300);
  const physAvg=tests.length?Math.round(tests.reduce((s,t)=>s+(t.physics.correct*4-t.physics.incorrect),0)/tests.length):0;
  const chemAvg=tests.length?Math.round(tests.reduce((s,t)=>s+(t.chemistry.correct*4-t.chemistry.incorrect),0)/tests.length):0;
  const mathAvg=tests.length?Math.round(tests.reduce((s,t)=>s+(t.maths.correct*4-t.maths.incorrect),0)/tests.length):0;
  const weakSubj=physAvg<=chemAvg&&physAvg<=mathAvg?'physics':chemAvg<=mathAvg?'chemistry':'maths';
  el.innerHTML=`
  <div class="pg-hdr anim-up"><div class="pg-title" data-text="Score Analytics"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> Score Analytics</div><div class="pg-sub">Performance insights from ${tests.length} mock test${tests.length>1?'s':''}</div></div>
  <div class="stats-grid anim-up d1">
    <div class="gc stat-card"><div class="stat-val" style="color:var(--accent)">${avg}</div><div class="stat-label">Average Score</div></div>
    <div class="gc stat-card"><div class="stat-val" style="color:var(--green)">${best}</div><div class="stat-label">Best Score</div></div>
    <div class="gc stat-card"><div class="stat-val" style="color:var(--red)">${worst}</div><div class="stat-label">Lowest Score</div></div>
    <div class="gc stat-card"><div class="stat-val" style="color:${trendCol}">${trend}</div><div class="stat-label">Recent Trend</div></div>
  </div>
  <div class="section-block anim-up d2">
    <div class="section-title"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg> Score Over Time</div>
    <div class="gc" style="padding:16px 20px">
      <div style="display:flex;align-items:flex-end;gap:4px;height:140px;padding-bottom:20px;position:relative">
        ${sorted.map((t,i)=>{
          const h=Math.round(t.totalScore/maxScore*110);
          const col=t.totalScore>=avg?'var(--green)':t.totalScore>=avg-30?'var(--accent)':'var(--red)';
          const dt=new Date(t.date);
          const label=(dt.getMonth()+1)+'/'+dt.getDate();
          return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px" title="${t.totalScore} marks">
            <div style="font-size:9px;color:var(--muted)">${t.totalScore}</div>
            <div style="width:100%;max-width:40px;height:${h}px;background:${col};border-radius:4px 4px 0 0;transition:height .3s;opacity:0.85"></div>
            <div style="font-size:8px;color:var(--faint);writing-mode:vertical-lr;transform:rotate(180deg);height:20px;overflow:hidden">${label}</div>
          </div>`;
        }).join('')}
        <div style="position:absolute;left:0;right:0;bottom:0;height:1px;background:var(--border)"></div>
      </div>
    </div>
  </div>
  <div class="section-block anim-up d3">
    <div class="section-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> Subject-wise Average</div>
    <div class="stats-grid">
      ${subjs.map(s=>`<div class="gc stat-card"><div class="stat-val" style="color:${subjCol[s]}">${s===weakSubj?'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> ':''}${s==='physics'?physAvg:s==='chemistry'?chemAvg:mathAvg}</div><div class="stat-label">${subjLbl[s]}${s===weakSubj?' (Weakest)':''}</div></div>`).join('')}
    </div>
  </div>
  <div class="section-block anim-up d4">
    <div class="section-title"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> Recent Tests</div>
    <div class="gc" style="padding:12px 16px">
      <table style="width:100%;font-size:11px;border-collapse:collapse">
        <tr style="color:var(--faint);border-bottom:1px solid var(--border)">
          <td style="padding:6px 8px">Date</td><td style="padding:6px 8px">Score</td><td style="padding:6px 8px">Physics</td><td style="padding:6px 8px">Chemistry</td><td style="padding:6px 8px">Maths</td>
        </tr>
        ${sorted.slice(-8).reverse().map(t=>{
          const dt=new Date(t.date);
          return `<tr style="border-bottom:1px solid var(--glass)">
            <td style="padding:6px 8px;color:var(--muted)">${dt.toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</td>
            <td style="padding:6px 8px;font-weight:600;color:${t.totalScore>=avg?'var(--green)':'var(--txt)'}">${t.totalScore}</td>
            <td style="padding:6px 8px;color:var(--phys)">${t.physics.correct*4-t.physics.incorrect}</td>
            <td style="padding:6px 8px;color:var(--chem)">${t.chemistry.correct*4-t.chemistry.incorrect}</td>
            <td style="padding:6px 8px;color:var(--math)">${t.maths.correct*4-t.maths.incorrect}</td>
          </tr>`;
        }).join('')}
      </table>
    </div>
    </div>`;
}

/* ═══════════════ WINDOW EXPORTS ═══════════════ */
window.renderScoreAnalytics=renderScoreAnalytics;
