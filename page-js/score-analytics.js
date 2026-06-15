// page-js/score-analytics.js
import { DB } from '../js/data.js';

function renderScoreAnalytics(el){
  const tests=DB.tests||[];
  if(!tests.length){
    el.innerHTML=`
    <div class="pg-hdr anim-up"><div class="pg-title">📊 Score Analytics</div><div class="pg-sub">Track your mock test performance over time.</div></div>
    <div class="gc section-block anim-up d1" style="padding:40px;text-align:center;color:var(--muted)">
      <div style="font-size:40px;margin-bottom:12px">📝</div>
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
  const trendCol=recentAvg>avg?'var(--green)':recentAvg<avg-5?'#f87171':'var(--indigo)';
  const maxScore=Math.max(...scores,300);
  const physAvg=tests.length?Math.round(tests.reduce((s,t)=>s+(t.physics.correct*4-t.physics.incorrect),0)/tests.length):0;
  const chemAvg=tests.length?Math.round(tests.reduce((s,t)=>s+(t.chemistry.correct*4-t.chemistry.incorrect),0)/tests.length):0;
  const mathAvg=tests.length?Math.round(tests.reduce((s,t)=>s+(t.maths.correct*4-t.maths.incorrect),0)/tests.length):0;
  const weakSubj=physAvg<=chemAvg&&physAvg<=mathAvg?'physics':chemAvg<=mathAvg?'chemistry':'maths';
  el.innerHTML=`
  <div class="pg-hdr anim-up"><div class="pg-title">📊 Score Analytics</div><div class="pg-sub">Performance insights from ${tests.length} mock test${tests.length>1?'s':''}</div></div>
  <div class="stats-grid anim-up d1">
    <div class="gc stat-card"><div class="stat-val" style="color:var(--indigo)">${avg}</div><div class="stat-label">Average Score</div></div>
    <div class="gc stat-card"><div class="stat-val" style="color:var(--green)">${best}</div><div class="stat-label">Best Score</div></div>
    <div class="gc stat-card"><div class="stat-val" style="color:#f87171">${worst}</div><div class="stat-label">Lowest Score</div></div>
    <div class="gc stat-card"><div class="stat-val" style="color:${trendCol}">${trend}</div><div class="stat-label">Recent Trend</div></div>
  </div>
  <div class="section-block anim-up d2">
    <div class="section-title">📈 Score Over Time</div>
    <div class="gc" style="padding:16px 20px">
      <div style="display:flex;align-items:flex-end;gap:4px;height:140px;padding-bottom:20px;position:relative">
        ${sorted.map((t,i)=>{
          const h=Math.round(t.totalScore/maxScore*110);
          const col=t.totalScore>=avg?'var(--green)':t.totalScore>=avg-30?'var(--indigo)':'#f87171';
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
    <div class="section-title">📚 Subject-wise Average</div>
    <div class="stats-grid">
      ${subjs.map(s=>`<div class="gc stat-card"><div class="stat-val" style="color:${subjCol[s]}">${s===weakSubj?'⚠️ ':''}${s==='physics'?physAvg:s==='chemistry'?chemAvg:mathAvg}</div><div class="stat-label">${subjLbl[s]}${s===weakSubj?' (Weakest)':''}</div></div>`).join('')}
    </div>
  </div>
  <div class="section-block anim-up d4">
    <div class="section-title">📋 Recent Tests</div>
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
