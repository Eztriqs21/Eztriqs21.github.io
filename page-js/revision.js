// page-js/revision.js — Merged: original data layer + v2 visual style
import { DB, sv, KEYS } from '../js/data.js';
import { safePct, animateValue } from '../js/helpers.js';

function getTheme(){return document.documentElement.getAttribute('data-theme')||'nexus';}
function pfx(){return getTheme()==='nexus'?'nx':'bl';}

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

const SUBJ_META={
  physics:{label:'Physics',color:'var(--phys)',icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>'},
  chemistry:{label:'Chemistry',color:'var(--chem)',icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6v11l4 5H5l4-5V3z"/><line x1="9" y1="3" x2="15" y2="3"/></svg>'},
  maths:{label:'Mathematics',color:'var(--math)',icon:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20L20 4"/><path d="M15 4h5v5"/><path d="M4 20l5-5"/></svg>'}
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
function revSave(st){DB.revision=st;sv('revision');}

function renderRevision(el){
  const p=pfx();
  const st=revLoad();
  let totalAll=0,revisedAll=0;
  const subjStats=Object.keys(REV_SYLLABUS).map(subj=>{
    let total=0,revised=0;
    REV_SYLLABUS[subj].forEach(g=>{g.subs.forEach(s=>{total++;if(st[subj]&&st[subj][s]===2)revised++;});});
    totalAll+=total;revisedAll+=revised;
    return{subj,total,revised,pct:total?Math.round(revised/total*100):0};
  });
  const overallPct=totalAll?Math.round(revisedAll/totalAll*100):0;

  el.innerHTML=`
  <div class="${p}-page-header anim-fade-in-up">
    <div class="${p}-page-title" data-text="Revision Checklist">Revision Checklist</div>
    <div class="${p}-page-sub">Track your JEE syllabus revision progress. Tap a topic to cycle: Not Started → In Progress → Revised.</div>
  </div>
  <div class="${p}-stats-grid anim-fade-in-up" style="--delay:0.1s">
    ${subjStats.map(s=>{
      const info=SUBJ_META[s.subj];
      const ringR=22;const ringC=2*Math.PI*ringR;const ringOff=ringC-(s.pct/100)*ringC;
      return `<div class="${p}-stat-card">
        <div class="${p}-stat-icon" style="color:${info.color}">${info.icon}</div>
        <div style="display:flex;align-items:center;gap:10px;margin:8px 0">
          <svg width="48" height="48" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="${ringR}" fill="none" stroke="var(--border)" stroke-width="4"/>
            <circle cx="24" cy="24" r="${ringR}" fill="none" stroke="${info.color}" stroke-width="4" stroke-linecap="round" stroke-dasharray="${ringC}" stroke-dashoffset="${ringOff}" transform="rotate(-90 24 24)" style="transition:stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)"/>
            <text x="24" y="24" text-anchor="middle" dominant-baseline="middle" fill="var(--text)" font-size="11" font-weight="700">${s.pct}%</text>
          </svg>
          <div>
            <div style="font-size:20px;font-weight:700;color:${info.color}">${s.revised}<span style="font-size:12px;font-weight:400;opacity:0.5">/${s.total}</span></div>
            <div style="font-size:11px;color:var(--muted)">${info.label}</div>
          </div>
        </div>
        <div class="${p}-progress-wrap" style="height:4px;margin-top:6px"><div class="${p}-progress-bar" style="height:4px;width:${s.pct}%;background:${info.color}"></div></div>
      </div>`;
    }).join('')}
    <div class="${p}-stat-card">
      <div class="${p}-stat-icon" style="color:var(--accent)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
      <div style="margin:8px 0">
        <div style="font-size:20px;font-weight:700;color:var(--accent)">${overallPct}%</div>
        <div style="font-size:11px;color:var(--muted)">Overall</div>
      </div>
      <div class="${p}-progress-wrap" style="height:4px;margin-top:6px"><div class="${p}-progress-bar" style="height:4px;width:${overallPct}%;background:var(--accent)"></div></div>
    </div>
  </div>
  ${Object.keys(REV_SYLLABUS).map((subj,si)=>{
    const info=SUBJ_META[subj];
    return `<div class="${p}-section-block anim-fade-in-up" style="--delay:${0.15+si*0.1}s">
      <div class="${p}-section-title">${info.icon} ${info.label} <span style="margin-left:auto;font-size:11px;color:var(--muted);font-weight:400">${subjStats[si].revised}/${subjStats[si].total} revised · ${subjStats[si].pct}%</span></div>
      ${REV_SYLLABUS[subj].map((g,gi)=>`
      <div class="chapter-card anim-fade-in-up" style="--delay:${0.2+si*0.1+gi*0.05}s;padding:16px;margin-bottom:10px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
          <div style="font-size:13px;font-weight:600;color:var(--txt)">${g.topic}</div>
          <div style="font-size:11px;padding:2px 8px;border-radius:12px;background:var(--glass);color:var(--muted)">${g.subs.length} topics</div>
        </div>
        <div class="stagger" style="display:flex;flex-wrap:wrap;gap:8px">
          ${g.subs.map((s,sti)=>{
            const v=(st[subj]&&st[subj][s])||0;
            const color=v===2?'var(--success)':v===1?'var(--accent)':'var(--muted)';
            const bg=v===2?'var(--success-dim)':v===1?'var(--accent-dim)':'var(--glass)';
            const border=v===2?'var(--success)':v===1?'var(--accent)':'var(--border)';
            const label=v===2?'✓ Revised':v===1?'◉ In Progress':'○ Not Started';
            const badge=v===2?`<span style="font-size:9px;padding:1px 6px;border-radius:8px;background:var(--success);color:var(--bg);font-weight:700">DONE</span>`
              :v===1?`<span style="font-size:9px;padding:1px 6px;border-radius:8px;background:var(--accent);color:var(--bg);font-weight:700">WIP</span>`
              :`<span style="font-size:9px;padding:1px 6px;border-radius:8px;background:var(--glass);color:var(--muted);font-weight:500">TODO</span>`;
            return `<button class="btn btn-outline btn-xs anim-fade-in-up" onclick="revToggle('${subj}','${s.replace(/'/g,"\\'")}',${v})" style="--delay:${sti*0.03}s;font-size:11px;padding:6px 12px;border-radius:8px;background:${bg};color:${color};border:1px solid ${border}44;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:6px;white-space:nowrap">
              ${badge} ${s}
            </button>`;
          }).join('')}
        </div>
      </div>`).join('')}
    </div>`;
  }).join('')}`;
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
