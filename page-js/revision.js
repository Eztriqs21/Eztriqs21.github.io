// page-js/revision.js
import { KEYS } from '../js/data.js';
const REV_SYLLABUS={
  physics:[
    {topic:'Mechanics',subs:['Units & Measurements','Kinematics','Laws of Motion','Work Energy & Power','Rotational Motion','Gravitation','Properties of Solids & Liquids','Thermodynamics','Kinetic Theory of Gases']},
    {topic:'Electrostatics',subs:['Electric Charges & Fields','Electrostatic Potential & Capacitance']},
    {topic:'Current Electricity',subs:['Current Electricity']},
    {topic:'Magnetism',subs:['Moving Charges & Magnetism','Magnetism & Matter']},
    {topic:'EMI & AC',subs:['Electromagnetic Induction','Alternating Current']},
    {topic:'Optics',subs:['Ray Optics & Optical Instruments','Wave Optics']},
    {topic:'Modern Physics',subs:['Dual Nature of Radiation & Matter','Atoms & Nuclei','Semiconductor Electronics']},
    {topic:'Waves & Sound',subs:['Waves','Sound Waves']}
  ],
  chemistry:[
    {topic:'Physical Chemistry',subs:['Some Basic Concepts of Chemistry','Structure of Atom','Classification of Elements','Chemical Bonding','States of Matter','Thermodynamics','Equilibrium','Redox Reactions','Electrochemistry','Chemical Kinetics','Surface Chemistry']},
    {topic:'Inorganic Chemistry',subs:['Hydrogen','s-Block Elements','p-Block Elements (Group 13-14)','p-Block Elements (Group 15-18)','d & f Block Elements','Coordination Compounds','Environmental Chemistry']},
    {topic:'Organic Chemistry',subs:['Organic Chemistry Basic Principles','Hydrocarbons','Haloalkanes & Haloarenes','Alcohols Phenols & Ethers','Aldehydes Ketones & Carboxylic Acids','Amines','Biomolecules','Polymers','Chemistry in Everyday Life']}
  ],
  maths:[
    {topic:'Algebra',subs:['Sets Relations & Functions','Complex Numbers & Quadratic Equations','Linear Inequalities','Permutations & Combinations','Binomial Theorem','Sequences & Series','Matrices & Determinants']},
    {topic:'Trigonometry',subs:['Trigonometric Functions','Trigonometric Equations','Inverse Trigonometric Functions']},
    {topic:'Coordinate Geometry',subs:['Straight Lines','Conic Sections','3D Geometry']},
    {topic:'Calculus',subs:['Limits & Derivatives','Application of Derivatives','Integrals','Application of Integrals','Differential Equations']},
    {topic:'Vectors & 3D',subs:['Vectors','Three Dimensional Geometry']},
    {topic:'Statistics & Probability',subs:['Statistics','Probability']}
  ]
};
function revLoad(){
  try{const r=localStorage.getItem(KEYS.rev);if(r)return JSON.parse(r);}catch(e){}
  const st={};
  Object.keys(REV_SYLLABUS).forEach(subj=>{
    st[subj]={};
    REV_SYLLABUS[subj].forEach(g=>{g.subs.forEach(s=>{st[subj][s]=0;});});
  });
  return st;
}
function revSave(st){try{localStorage.setItem(KEYS.rev,JSON.stringify(st));}catch(e){}}
function renderRevision(el){
  const st=revLoad();
  const subjCol={physics:'var(--phys)',chemistry:'var(--chem)',maths:'var(--math)'};
  const subjLbl={physics:'Physics',chemistry:'Chemistry',maths:'Maths'};
  let totalAll=0,revisedAll=0;
  const subjStats=Object.keys(REV_SYLLABUS).map(subj=>{
    let total=0,revised=0;
    REV_SYLLABUS[subj].forEach(g=>{g.subs.forEach(s=>{total++;if(st[subj]&&st[subj][s]===2)revised++;});});
    totalAll+=total;revisedAll+=revised;
    return{subj,total,revised,pct:total?Math.round(revised/total*100):0};
  });
  const overallPct=totalAll?Math.round(revisedAll/totalAll*100):0;
  el.innerHTML=`
  <div class="pg-hdr anim-up"><div class="pg-title" data-text="Revision Checklist"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> Revision Checklist</div><div class="pg-sub">Track your JEE syllabus revision progress. Tap a topic to cycle: Not Started → In Progress → Revised.</div></div>
  <div class="stats-grid anim-up d1">
    ${subjStats.map(s=>`<div class="gc stat-card"><div class="stat-val" style="color:${subjCol[s.subj]}">${s.revised}/${s.total}</div><div class="stat-label">${subjLbl[s.subj]}</div><div style="height:4px;background:var(--glass);border-radius:4px;margin-top:8px;overflow:hidden"><div style="height:100%;width:${s.pct}%;background:${subjCol[s.subj]};border-radius:4px;transition:width .3s"></div></div></div>`).join('')}
    <div class="gc stat-card"><div class="stat-val" style="color:var(--accent)">${overallPct}%</div><div class="stat-label">Overall</div><div style="height:4px;background:var(--glass);border-radius:4px;margin-top:8px;overflow:hidden"><div style="height:100%;width:${overallPct}%;background:var(--accent);border-radius:4px;transition:width .3s"></div></div></div>
  </div>
  ${Object.keys(REV_SYLLABUS).map(subj=>`
  <div class="section-block anim-up d2">
    <div class="section-title" style="color:${subjCol[subj]}">${subjLbl[subj]}</div>
    ${REV_SYLLABUS[subj].map(g=>`
    <div class="gc" style="padding:14px 18px;margin-bottom:8px">
      <div style="font-size:13px;font-weight:600;color:var(--txt);margin-bottom:8px">${g.topic}</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        ${g.subs.map(s=>{
          const v=(st[subj]&&st[subj][s])||0;
          const col=v===2?'var(--green)':v===1?'var(--orange)':'var(--faint)';
          const bg=v===2?'var(--green-dim)':v===1?'var(--orange-dim)':'var(--glass)';
          const label=v===2?'✓ Revised':v===1?'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg> In Progress':'○ Not Started';
          return `<button class="btn btn-ghost btn-xs" onclick="revToggle('${subj}','${s.replace(/'/g,"\\'")}',${v})" style="font-size:11px;padding:4px 10px;border-radius:6px;background:${bg};color:${col};border:1px solid ${col}33;cursor:pointer;transition:all .2s">${label} ${s}</button>`;
        }).join('')}
      </div>
    </div>`).join('')}
  </div>`).join('')}`;
}
function revToggle(subj,topic,currentVal){
  const st=revLoad();
  const nextVal=(currentVal+1)%3;
  if(!st[subj])st[subj]={};
  st[subj][topic]=nextVal;
  revSave(st);
  renderRevision(document.getElementById('content-wrap'));
}

/* ═══════════════ WINDOW EXPORTS ═══════════════ */
window.renderRevision=renderRevision;
window.revLoad=revLoad;
window.revSave=revSave;
window.revToggle=revToggle;
