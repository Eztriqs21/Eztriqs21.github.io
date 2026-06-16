// page-js/score-analytics.js
import { DB } from '../js/data.js';

function renderScoreAnalytics(el){
  const tests=DB.tests||[];
  if(!tests.length){
    el.innerHTML=`
    <div class="pg-hdr anim-up">
      <div class="pg-title" data-text="Score Analytics"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> Score Analytics</div>
      <div class="pg-sub">Track your mock test performance over time.</div>
    </div>
    <div class="gc section-block anim-fade-in-up" style="padding:48px 20px;text-align:center;color:var(--muted)">
      <div style="margin-bottom:16px"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>
      <div style="font-size:14px;font-weight:600;margin-bottom:6px">No mock tests taken yet</div>
      <div style="font-size:12px">Take a mock test to see your score analytics here.</div>
    </div>`;
    return;
  }
  const subjs=['physics','chemistry','maths'];
  const subjLbl={physics:'Physics',chemistry:'Chemistry',maths:'Maths'};
  const subjCol={physics:'var(--phys)',chemistry:'var(--chem)',maths:'var(--math)'};
  const subjIcons={
    physics:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    chemistry:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6v11l4 5H5l4-5V3z"/><line x1="9" y1="3" x2="15" y2="3"/></svg>',
    maths:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20L20 4"/><path d="M15 4h5v5"/><path d="M4 20l5-5"/></svg>'
  };
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

  const svgChart=sorted.length>=2?buildSvgChart(sorted,avg,maxScore):'';

  el.innerHTML=`
  <div class="pg-hdr anim-up">
    <div class="pg-title" data-text="Score Analytics"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> Score Analytics</div>
    <div class="pg-sub">Performance insights from ${tests.length} mock test${tests.length>1?'s':''}</div>
  </div>
  <div class="stats-grid stagger anim-fade-in-up">
    <div class="gc stat-card"><div class="stat-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div><div class="stat-val" style="color:var(--accent)">${avg}</div><div class="stat-label">Average Score</div></div>
    <div class="gc stat-card"><div class="stat-icon" style="color:var(--green)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div><div class="stat-val" style="color:var(--green)">${best}</div><div class="stat-label">Best Score</div></div>
    <div class="gc stat-card"><div class="stat-icon" style="color:var(--red)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></div><div class="stat-val" style="color:var(--red)">${worst}</div><div class="stat-label">Lowest Score</div></div>
    <div class="gc stat-card"><div class="stat-icon" style="color:${trendCol}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="${recentAvg>avg?'18 15 12 9 6 15':'6 9 12 15 18 9'}"/></svg></div><div class="stat-val" style="color:${trendCol}">${trend}</div><div class="stat-label">Recent Trend</div></div>
  </div>
  <div class="section-block anim-up d2">
    <div class="section-title"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg> Score Over Time</div>
    <div class="gc" style="padding:20px;overflow-x:auto">
      ${svgChart||`<div style="display:flex;align-items:flex-end;gap:4px;height:140px;padding-bottom:20px;position:relative">
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
      </div>`}
    </div>
  </div>
  <div class="section-block anim-up d3">
    <div class="section-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> Subject-wise Average</div>
    <div class="stats-grid">
      ${subjs.map(s=>{
        const avgVal=s==='physics'?physAvg:s==='chemistry'?chemAvg:mathAvg;
        const isWeak=s===weakSubj;
        return `<div class="gc stat-card">
          <div class="stat-icon" style="color:${subjCol[s]}">${subjIcons[s]}</div>
          <div class="stat-val" style="color:${subjCol[s]}">${avgVal}</div>
          <div class="stat-label">${subjLbl[s]}${isWeak?' (Weakest)':''}</div>
          ${isWeak?'<div class="stat-sub" style="color:var(--red);font-size:10px;margin-top:4px"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Focus area</div>':''}
        </div>`;
      }).join('')}
    </div>
  </div>
  <div class="section-block anim-up d4">
    <div class="section-title"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> Recent Tests</div>
    <div class="gc" style="padding:0;overflow:hidden">
      <table style="width:100%;font-size:11px;border-collapse:collapse">
        <thead>
          <tr style="color:var(--faint);border-bottom:1px solid var(--border);background:var(--surface2)">
            <td style="padding:8px 12px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;font-size:10px">Date</td>
            <td style="padding:8px 12px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;font-size:10px">Score</td>
            <td style="padding:8px 12px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;font-size:10px;color:var(--phys)">Physics</td>
            <td style="padding:8px 12px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;font-size:10px;color:var(--chem)">Chemistry</td>
            <td style="padding:8px 12px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;font-size:10px;color:var(--math)">Maths</td>
          </tr>
        </thead>
        <tbody>
          ${sorted.slice(-8).reverse().map(t=>{
            const dt=new Date(t.date);
            const pct=t.totalScore>=avg?100:Math.round(t.totalScore/avg*100);
            return `<tr style="border-bottom:1px solid var(--glass);transition:background .15s" onmouseover="this.style.background='var(--surface2)'" onmouseout="this.style.background='transparent'">
              <td style="padding:8px 12px;color:var(--muted)">${dt.toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</td>
              <td style="padding:8px 12px;font-weight:700;color:${t.totalScore>=avg?'var(--green)':'var(--txt)'}">${t.totalScore}</td>
              <td style="padding:8px 12px;color:var(--phys)">${t.physics.correct*4-t.physics.incorrect}</td>
              <td style="padding:8px 12px;color:var(--chem)">${t.chemistry.correct*4-t.chemistry.incorrect}</td>
              <td style="padding:8px 12px;color:var(--math)">${t.maths.correct*4-t.maths.incorrect}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}

function buildSvgChart(sorted,avg,maxScore){
  const w=500,h=160,pad=32;
  const maxVal=Math.max(...sorted.map(t=>t.totalScore),maxScore);
  const minVal=0;
  const range=maxVal-minVal||1;
  const step=(w-pad*2)/(sorted.length-1);
  const pts=sorted.map((t,i)=>{
    const x=pad+i*step;
    const y=h-pad-((t.totalScore-minVal)/range)*(h-pad*2);
    return {x,y,val:t.totalScore,date:new Date(t.date)};
  });
  const pointStr=pts.map(p=>`${p.x},${p.y}`).join(' ');
  const areaStr=pointStr+` ${pts[pts.length-1].x},${h-pad} ${pts[0].x},${h-pad}`;
  const avgY=h-pad-((avg-minVal)/range)*(h-pad*2);
  return `<svg width="100%" viewBox="0 0 ${w} ${h}" style="overflow:visible">
    <defs>
      <linearGradient id="saGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <line x1="${pad}" y1="${avgY}" x2="${w-pad}" y2="${avgY}" stroke="var(--accent)" stroke-width="1" stroke-dasharray="6,4" opacity="0.5"/>
    <text x="${w-pad+4}" y="${avgY+3}" fill="var(--accent)" font-size="9" opacity="0.7">avg ${avg}</text>
    ${pts.map(p=>`<line x1="${p.x}" y1="${h-pad}" x2="${p.x}" y2="${p.y}" stroke="var(--border)" stroke-width="0.5" opacity="0.3"/>`).join('')}
    <polygon points="${areaStr}" fill="url(#saGrad)"/>
    <polyline points="${pointStr}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    ${pts.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="4" fill="var(--bg)" stroke="var(--accent)" stroke-width="2"/>
      <text x="${p.x}" y="${p.y-10}" text-anchor="middle" fill="var(--txt)" font-size="9" font-weight="600">${p.val}</text>`).join('')}
    ${pts.map(p=>`<text x="${p.x}" y="${h-6}" text-anchor="middle" fill="var(--muted)" font-size="8">${(p.date.getMonth()+1)+'/'+p.date.getDate()}</text>`).join('')}
  </svg>`;
}

/* ═══════════════ WINDOW EXPORTS ═══════════════ */
window.renderScoreAnalytics=renderScoreAnalytics;
