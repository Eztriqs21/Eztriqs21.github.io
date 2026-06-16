// page-js/mock-tests.js
import { DB, sv, KEYS } from '../js/data.js';
import { uid, esc, fmtDate, cm, om, toast } from '../js/helpers.js';
import { go } from '../js/nav.js';

function openAddMockTest(){
  document.getElementById('mt-date').value=new Date().toISOString().split('T')[0];
  document.getElementById('mt-scored').value='';
  document.getElementById('mt-total').value='';
  document.getElementById('mt-time').value='';
  document.getElementById('mt-syllabus').value='';
  document.getElementById('mt-review').value='';
  document.getElementById('mt-subj').value='Physics';
  om('m-mocktest');
  setTimeout(()=>document.getElementById('mt-scored').focus(),320);
}
function saveMockTest(){
  const subj=document.getElementById('mt-subj').value;
  const date=document.getElementById('mt-date').value;
  const scored=parseFloat(document.getElementById('mt-scored').value);
  const total=parseFloat(document.getElementById('mt-total').value);
  const timeTaken=parseInt(document.getElementById('mt-time').value)||0;
  const syllabus=document.getElementById('mt-syllabus').value.trim();
  const review=document.getElementById('mt-review').value.trim();
  if(!date){toast('⚠️ Select a date');return;}
  if(isNaN(scored)||scored<0){toast('⚠️ Enter valid marks scored');return;}
  if(isNaN(total)||total<=0){toast('⚠️ Enter valid total marks');return;}
  if(scored>total){toast('⚠️ Scored marks cannot exceed total');return;}
  if(!DB.mockTests)DB.mockTests=[];
  DB.mockTests.unshift({id:'mt_'+uid(),subject:subj,date,marksScored:scored,totalMarks:total,timeTaken,syllabus:syllabus||undefined,topicsToReview:review,createdAt:new Date().toISOString()});
  sv('mockTests');
  cm('m-mocktest');
  if(PAGE==='mocktests')renderMockTests(document.getElementById('content-wrap'));
  toast('✅ Mock test saved!');
}
function deleteMockTest(id){
  if(!DB.mockTests)return;
  DB.mockTests=DB.mockTests.filter(m=>m.id!==id);
  sv('mockTests');
  if(window.PAGE==='mocktests')renderMockTests(document.getElementById('content-wrap'));
}
function toggleMockTestAnalysis(id){
  const el=document.getElementById('mt-review-'+id);
  if(el)el.classList.toggle('open');
}
function renderMockTests(el){
  const tests=DB.mockTests||[];
  const isEmpty=!tests.length;
  const sorted=[...tests].sort((a,b)=>new Date(b.date)-new Date(a.date));
  const subjOrder=['Physics','Chemistry','Maths','Full Syllabus'];
  const subjMeta={Physics:{icon:'⚡',c:'var(--phys)'},Chemistry:{icon:'⚗️',c:'var(--chem)'},Maths:{icon:'📐',c:'var(--math)'},'Full Syllabus':{icon:'📋',c:'var(--accent)'}};
  const grouped={};
  sorted.forEach(m=>{
    if(!grouped[m.subject])grouped[m.subject]={};
    const ym=m.date.slice(0,7);
    if(!grouped[m.subject][ym])grouped[m.subject][ym]=[];
    grouped[m.subject][ym].push(m);
  });
  function monthLabel(ym){
    const d=new Date(ym+'-01');
    return d.toLocaleDateString('en-US',{month:'long',year:'numeric'});
  }
  el.innerHTML=`
  <div class="pg-hdr anim-up"><div class="pg-title">📝 Mock Tests</div><div class="pg-sub">Log and track your practice test performance</div></div>
  <div class="cmt-hero anim-up d1" onclick="openCmtConfig()">
    <div class="cmt-hero-title">🎯 Create Custom Mock Test</div>
    <div class="cmt-hero-sub">Generate AI-powered tests or pick from past JEE papers. Full-screen exam mode with timer, question navigator, and instant AI analysis.</div>
  </div>
  <div class="gc section-block anim-up d1" style="padding:20px;margin-bottom:16px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
      <div class="section-title">📋 All Mock Tests</div>
      <button class="btn btn-primary btn-sm" onclick="openAddMockTest()">+ New Mock Test</button>
    </div>
    ${isEmpty?`<div class="mt-empty">No mock tests logged yet. Tap "+ New Mock Test" to get started.</div>`:
    subjOrder.filter(s=>grouped[s]).map(subj=>{
      const meta=subjMeta[subj]||{icon:'📋',c:'var(--muted)'};
      const months=Object.keys(grouped[subj]).sort().reverse();
      const totalInSubj=months.reduce((sum,ym)=>sum+grouped[subj][ym].length,0);
      return `<div class="mt-subj-section anim-up">
        <div class="mt-subj-header">
          <div class="mt-subj-icon" style="background:${meta.c}15">${meta.icon}</div>
          <div class="mt-subj-name" style="color:${meta.c}">${esc(subj)}</div>
          <div class="mt-subj-count">${totalInSubj} test${totalInSubj>1?'s':''}</div>
        </div>
        ${months.map(ym=>{
          const items=grouped[subj][ym];
          return `<div class="mt-month" id="mtm-${subj}-${ym}">
            <div class="mt-month-head" onclick="document.getElementById('mtm-${subj}-${ym}').classList.toggle('open')">
              <span class="mt-month-chev">▶</span>
              <span class="mt-month-title">${monthLabel(ym)}</span>
              <span class="mt-month-count">${items.length}</span>
            </div>
            <div class="mt-month-body">
              ${items.map((m,i)=>{
                const pct=Math.round(m.marksScored/m.totalMarks*100);
                const pctClass=pct>=70?'good':pct>=40?'ok':'bad';
                return `<div class="mt-card" style="margin-bottom:8px">
                  <div class="mt-card-head">
                    <div class="mt-card-subj" style="color:${meta.c}">${esc(subj)}</div>
                    <div class="mt-card-date">${fmtDate(m.date)}</div>
                  </div>
                  <div class="mt-card-score">
                    <span class="mt-card-num">${m.marksScored}</span>
                    <span class="mt-card-max">/ ${m.totalMarks}</span>
                    <span class="mt-card-pct ${pctClass}">${pct}%</span>
                  </div>
                  <div class="mt-card-meta">
                    ${m.timeTaken?`<span class="chip chip-med">⏱️ ${m.timeTaken}m</span>`:''}
                    ${m.syllabus?`<span class="chip chip-hi">📚 Syllabus</span>`:''}
                  </div>
                  ${m.syllabus?`<div class="mt-card-syllabus">📚 ${esc(m.syllabus)}</div>`:''}
                  ${m.topicsToReview?`<div class="mt-card-review" id="mt-review-${m.id}">📌 <b>Topics to Review:</b> ${esc(m.topicsToReview)}</div>`:''}
                  <div class="mt-card-actions">
                    ${m.topicsToReview?`<button class="btn btn-ghost btn-xs" onclick="toggleMockTestAnalysis('${m.id}')">📊 Analysis</button>`:''}
                    <button class="btn btn-danger btn-xs" onclick="deleteMockTest('${m.id}')">🗑️ Delete</button>
                  </div>
                </div>`;
              }).join('')}
            </div>
          </div>`;
        }).join('')}
      </div>`;
    }).join('')}
  </div>`;
}

/* ═══════════════ CUSTOM MOCK TEST ═══════════════ */
let cmtConfig={subjects:['physics','chemistry','maths'],chapters:{physics:[],chemistry:[],maths:[]},totalQ:30,mcq:20,intQ:5,multiQ:5,source:'ai',difficulty:'mains',timeMin:180,yearStart:2020,yearEnd:2024};
let cmtQuestions=[];
let cmtState={current:0,answers:{},marked:new Set(),startTime:null,elapsed:0,timerInterval:null,submitted:false};
let cmtAbortController=null;

const CMT_CHAPTERS={
  physics:['Mechanics','Thermodynamics','Electromagnetism','Optics','Modern Physics','Waves & Sound','Gravitation','Rotational Motion','Electrostatics','Current Electricity','Magnetic Effects','EMI & AC','Communication Systems','Semiconductors','Units & Measurements','Motion in Straight Line','Motion in Plane','Work Energy Power','Properties of Matter'],
  chemistry:['Physical Chemistry','Inorganic Chemistry','Organic Chemistry','Chemical Bonding','Atomic Structure','Chemical Thermodynamics','Equilibrium','Redox Reactions','Electrochemistry','Chemical Kinetics','Surface Chemistry','p-Block Elements','d-Block Elements','Coordination Compounds','Haloalkanes & Haloarenes','Alcohols Phenols Ethers','Aldehydes Ketones','Carboxylic Acids','Amines','Polymers','Biomolecules','Environmental Chemistry'],
  maths:['Algebra','Trigonometry','Coordinate Geometry','Calculus','Vectors & 3D','Probability & Statistics','Complex Numbers','Quadratic Equations','Sequences & Series','Binomial Theorem','Matrices & Determinants','Limits Continuity Differentiability','Integral Calculus','Differential Equations','Circle','Conic Sections','Permutation Combination','Probability','Statistics','Mathematical Reasoning']
};
const CMT_YEARS=[];for(let y=2025;y>=2010;y--)CMT_YEARS.push(y);

function openCmtConfig(){
  cmtConfig={subjects:['physics','chemistry','maths'],chapters:{physics:[],chemistry:[],maths:[]},totalQ:30,mcq:20,intQ:5,multiQ:5,source:'ai',difficulty:'mains',timeMin:180,yearStart:2020,yearEnd:2024};
  cmtRenderConfig();
  om('m-cmt-config');
}
function cmtRenderConfig(){
  const el=document.getElementById('cmt-config-body');
  const src=cmtConfig.source;
  const showYears=(src==='pyq'||src==='mix');
  el.innerHTML=`
  <div class="cmt-sec-label">Subjects</div>
  <div class="cmt-chips">${['physics','chemistry','maths'].map(s=>{
    const on=cmtConfig.subjects.includes(s);
    const label=s==='physics'?'⚡ Physics':s==='chemistry'?'⚗️ Chemistry':'📐 Maths';
    return `<div class="cmt-chip ${on?'on':''} ${s}" onclick="cmtToggleSubject('${s}')">${label}</div>`;
  }).join('')}</div>

  <div class="cmt-sec-label" style="margin-top:16px">Chapters <span style="font-size:9px;color:var(--faint);font-weight:400">(leave empty = all chapters)</span></div>
  ${cmtConfig.subjects.map(s=>{
    const chapters=CMT_CHAPTERS[s]||[];
    const label=s==='physics'?'⚡ Physics':s==='chemistry'?'⚗️ Chemistry':'📐 Maths';
    const color=s==='physics'?'var(--phys)':s==='chemistry'?'var(--chem)':'var(--math)';
    return `<div style="margin-bottom:8px"><div style="font-size:11px;font-weight:600;color:${color};margin-bottom:4px">${label}</div>
    <div class="cmt-chapters">${chapters.map(ch=>{
      const on=(cmtConfig.chapters[s]||[]).includes(ch);
      return `<div class="cmt-chip ${on?'on':''}" onclick="cmtToggleChapter('${s}','${ch.replace(/'/g,"\\'")}')">${ch}</div>`;
    }).join('')}</div></div>`;
  }).join('')}

  <div class="cmt-sec-label">Question Distribution</div>
  <div class="cmt-q-row">
    <div class="cmt-q-item"><label>MCQ</label><input type="number" id="cmt-mcq" min="0" max="75" value="${cmtConfig.mcq}" onchange="cmtUpdateCounts('mcq',this.value)"/></div>
    <div class="cmt-q-item"><label>Integer</label><input type="number" id="cmt-int" min="0" max="75" value="${cmtConfig.intQ}" onchange="cmtUpdateCounts('int',this.value)"/></div>
    <div class="cmt-q-item"><label>Multi</label><input type="number" id="cmt-multi" min="0" max="75" value="${cmtConfig.multiQ}" onchange="cmtUpdateCounts('multi',this.value)"/></div>
    <div class="cmt-q-item" style="background:var(--accent-dim)"><label style="color:var(--accent)">Total</label><span id="cmt-total-display" style="font-size:15px;font-weight:700;color:var(--accent);min-width:30px;text-align:center">${cmtConfig.totalQ}</span></div>
  </div>

  <div class="cmt-sec-label">Source</div>
  <div class="cmt-source-opts">
    <div class="cmt-source-opt ${src==='ai'?'on':''}" onclick="cmtSetSource('ai')">
      <div class="cmt-source-opt-title">🤖 AI Generated</div>
      <div class="cmt-source-opt-sub">Fresh questions by AI</div>
    </div>
    <div class="cmt-source-opt ${src==='pyq'?'on':''}" onclick="cmtSetSource('pyq')">
      <div class="cmt-source-opt-title">📄 Real PYQ Only</div>
      <div class="cmt-source-opt-sub">Past JEE papers only</div>
    </div>
    <div class="cmt-source-opt ${src==='mix'?'on':''}" onclick="cmtSetSource('mix')">
      <div class="cmt-source-opt-title">🔀 Mix</div>
      <div class="cmt-source-opt-sub">PYQ + AI generated</div>
    </div>
  </div>

  ${showYears?`
  <div class="cmt-sec-label">Year Range <span style="font-size:9px;color:var(--faint);font-weight:400">(min 3 years)</span></div>
  <div class="cmt-range-wrap">
    <span class="cmt-range-lbl">${cmtConfig.yearStart}</span>
    <input type="range" min="2010" max="2025" value="${cmtConfig.yearStart}" id="cmt-year-start" oninput="cmtUpdateYearRange()"/>
    <span>—</span>
    <input type="range" min="2010" max="2025" value="${cmtConfig.yearEnd}" id="cmt-year-end" oninput="cmtUpdateYearRange()"/>
    <span class="cmt-range-lbl" style="text-align:right">${cmtConfig.yearEnd}</span>
  </div>
  <div id="cmt-year-info" style="font-size:10px;color:var(--faint);margin-top:4px;text-align:center">${cmtConfig.yearEnd-cmtConfig.yearStart+1} years selected (${cmtConfig.yearStart}–${cmtConfig.yearEnd})</div>
  `:''}

  <div class="cmt-sec-label">Difficulty</div>
  <div class="cmt-source-opts">
    <div class="cmt-source-opt ${cmtConfig.difficulty==='mains'?'on':''}" onclick="cmtSetDiff('mains')" style="min-width:auto">
      <div class="cmt-source-opt-title">🎯 JEE Mains</div>
    </div>
    <div class="cmt-source-opt ${cmtConfig.difficulty==='advanced'?'on':''}" onclick="cmtSetDiff('advanced')" style="min-width:auto">
      <div class="cmt-source-opt-title">🚀 JEE Advanced</div>
    </div>
  </div>

  <div class="cmt-sec-label">Time Limit</div>
  <div class="cmt-time-btns">
    ${[60,90,120,150,180,210,240].map(t=>`<div class="cmt-time-btn ${cmtConfig.timeMin===t?'on':''}" onclick="cmtSetTime(${t})">${t>=60?Math.floor(t/60)+'h':''}${t%60?' '+t%60+'m':''}</div>`).join('')}
  </div>
  `;
}
function cmtToggleSubject(s){
  const i=cmtConfig.subjects.indexOf(s);
  if(i>=0){cmtConfig.subjects.splice(i,1);delete cmtConfig.chapters[s];}
  else{cmtConfig.subjects.push(s);cmtConfig.chapters[s]=[];}
  cmtRenderConfig();
}
function cmtToggleChapter(s,ch){
  if(!cmtConfig.chapters[s])cmtConfig.chapters[s]=[];
  const i=cmtConfig.chapters[s].indexOf(ch);
  if(i>=0)cmtConfig.chapters[s].splice(i,1);else cmtConfig.chapters[s].push(ch);
  cmtRenderConfig();
}
function cmtUpdateCounts(type,val){
  const v=Math.max(0,Math.min(75,parseInt(val)||0));
  if(type==='mcq')cmtConfig.mcq=v;
  else if(type==='int')cmtConfig.intQ=v;
  else cmtConfig.multiQ=v;
  cmtConfig.totalQ=cmtConfig.mcq+cmtConfig.intQ+cmtConfig.multiQ;
  const el=document.getElementById('cmt-total-display');if(el)el.textContent=cmtConfig.totalQ;
}
function cmtSetSource(src){cmtConfig.source=src;cmtRenderConfig();}
function cmtSetDiff(d){cmtConfig.difficulty=d;cmtRenderConfig();}
function cmtSetTime(t){cmtConfig.timeMin=t;cmtRenderConfig();}
function cmtUpdateYearRange(){
  let s=parseInt(document.getElementById('cmt-year-start').value);
  let e=parseInt(document.getElementById('cmt-year-end').value);
  if(s>e)[s,e]=[e,s];
  if(e-s<2){if(s+2<=2025)e=s+2;else s=e-2;}
  cmtConfig.yearStart=s;cmtConfig.yearEnd=e;
  const info=document.getElementById('cmt-year-info');
  if(info)info.textContent=`${e-s+1} years selected (${s}–${e})`;
}
function cmtGetBatchPrompt(subject,mode,count,diff,batchNum,totalBatches){
  const subjLabel=subject.charAt(0).toUpperCase()+subject.slice(1);
  const chList=cmtConfig.chapters[subject];
  const chNote=chList&&chList.length?` Focus on these chapters: ${chList.join(', ')}.`:'';
  const diffNote=diff==='advanced'?'JEE Advanced':'JEE Mains';
  const diffDetail=diff==='advanced'?'This is JEE Advanced level — questions should be multi-concept, tricky, require deep insight, and often combine 2-3 topics. Options should be close and misleading.':'This is JEE Mains level — questions should test conceptual clarity and numerical ability. Moderate to hard difficulty, exam-realistic.';
  const yearNote=(cmtConfig.source==='pyq'||cmtConfig.source==='mix')?` Base these on real JEE questions from ${cmtConfig.yearStart}–${cmtConfig.yearEnd}.`:'';
  const modeLabel=mode==='mcq'?'single-correct MCQ (exactly 1 correct out of 4)':mode==='multi'?'multiple-correct MCQ (2 or more correct out of 4)':'integer-type (numerical answer, integer or up to 2 decimals)';
  const answerFormat=mode==='mcq'?'"answer": "B" (single letter)':mode==='multi'?'"answer": ["A","C"] (array of correct letters)':'"answer": "42" (string of the number)';
  const pyqTopics=PYQ_DATA[subject]||[];
  const topTopics=pyqTopics.sort((a,b)=>b.weight-a.weight).slice(0,5);
  const topicWeightNote=topTopics.length?` KEY TOPICS BY JEE WEIGHTAGE: ${topTopics.map(t=>`${t.topic} (${t.weight}% weightage, ~${t.questions} Qs/year)`).join(', ')}. Prioritize these topics.`:'';
  const exampleMCQ=mode==='mcq'?`
EXAMPLE 1 (Conceptual):
{
  "subject": "${subject}",
  "chapter": "Mechanics",
  "mode": "mcq",
  "question": "A uniform rod of length $L$ and mass $M$ is pivoted at one end. The moment of inertia about the pivot and the time period of small oscillations are respectively:",
  "options": ["$\\frac{ML^2}{3}$, $2\\pi\\sqrt{\\frac{2L}{3g}}$", "$\\frac{ML^2}{3}$, $2\\pi\\sqrt{\\frac{2L}{g}}$", "$\\frac{ML^2}{12}$, $2\\pi\\sqrt{\\frac{L}{3g}}$", "$\\frac{ML^2}{12}$, $2\\pi\\sqrt{\\frac{6L}{g}}$"],
  "answer": "A",
  "solution": "For rod pivoted at end: $I = \\frac{ML^2}{3}$. For physical pendulum: $T = 2\\pi\\sqrt{\\frac{I}{Mgd}}$ where $d = L/2$. So $T = 2\\pi\\sqrt{\\frac{ML^2/3}{MgL/2}} = 2\\pi\\sqrt{\\frac{2L}{3g}}$."
}
EXAMPLE 2 (Numerical):
{
  "subject": "${subject}",
  "chapter": "Electrostatics",
  "mode": "mcq",
  "question": "Two point charges $+q$ and $-3q$ are placed at distance $2a$ apart. The electric field intensity is zero at a point:",
  "options": ["At distance $a$ from $+q$ on the line joining them (between charges)", "At distance $a$ from $+q$ on the extension beyond $+q$", "At distance $3a$ from $-3q$ on the extension beyond $-3q$", "Nowhere on the line joining them"],
  "answer": "B",
  "solution": "Between charges: fields add (both point toward $-3q$). Beyond $+q$: fields oppose. At distance $x$ from $+q$: $\\frac{kq}{x^2} = \\frac{k(3q)}{(2a+x)^2}$. Solving: $x = a$. Point is distance $a$ from $+q$ on the side away from $-3q$."
}`:'';
  const exampleINT=mode==='int'?`
EXAMPLE 1:
{
  "subject": "${subject}",
  "chapter": "Modern Physics",
  "mode": "int",
  "question": "The work function of a metal is $2.0 \\text{ eV}$. When light of wavelength $4000 \\text{ \\AA}$ falls on it, the maximum kinetic energy of emitted photoelectrons in eV is (up to 2 decimal places).",
  "options": [],
  "answer": "1.10",
  "solution": "$E = \\frac{hc}{\\lambda} = \\frac{12400}{4000} = 3.10 \\text{ eV}$. $K_{max} = E - \\phi = 3.10 - 2.0 = 1.10 \\text{ eV}$."
}
EXAMPLE 2:
{
  "subject": "${subject}",
  "chapter": "Thermal Physics",
  "mode": "int",
  "question": "An ideal gas undergoes a cyclic process $A \\to B \\to C \\to A$ as shown in the $PV$ diagram. If $P_A = 2 \\text{ atm}$, $V_A = 1 \\text{ L}$, $P_C = 1 \\text{ atm}$, $V_C = 2 \\text{ L}$, and $B$ is at $(3 \\text{ atm}, 3 \\text{ L})$, the net work done in the cycle in Joules is (use $1 \\text{ atm} = 10^5 \\text{ Pa}$).",
  "options": [],
  "answer": "200",
  "solution": "Work = area enclosed by triangle $ABC = \\frac{1}{2}|P_A(V_B-V_C) + P_B(V_C-V_A) + P_C(V_A-V_B)|$. Computing: $\\frac{1}{2}|2(3-2)+3(2-1)+1(1-3)| = \\frac{1}{2}|2+3-2| = 1.5 \\text{ L·atm} = 150 \\text{ J}$. (Answer may vary based on exact diagram.)"
}`:'';
  const exampleMULTI=mode==='multi'?`
EXAMPLE 1:
{
  "subject": "${subject}",
  "chapter": "Electromagnetism",
  "mode": "multi",
  "question": "A charged particle moves in a uniform magnetic field. Which of the following quantities remain constant?",
  "options": ["Speed of the particle", "Kinetic energy of the particle", "Magnitude of momentum of the particle", "Direction of momentum of the particle"],
  "answer": ["B", "C"],
  "solution": "Magnetic force $F = qvB\\sin\\theta$ is always perpendicular to velocity, so it does no work. KE and speed are constant. Momentum direction changes (circular/helical path), so direction of momentum is NOT constant. Magnitude of momentum $|p| = mv$ is constant."
}
EXAMPLE 2:
{
  "subject": "${subject}",
  "chapter": "Optics",
  "mode": "multi",
  "question": "In a Young's double slit experiment, which of the following will increase the fringe width?",
  "options": ["Increasing the distance between slits", "Increasing the distance to screen", "Using light of shorter wavelength", "Using light of longer wavelength"],
  "answer": ["B", "D"],
  "solution": "Fringe width $\\beta = \\frac{\\lambda D}{d}$. Increasing $D$ (screen distance) increases $\\beta$. Increasing $\\lambda$ (longer wavelength) increases $\\beta$. Decreasing $d$ (slit separation) increases $\\beta$. Shorter wavelength DECREASES $\\beta$."
}`:'';
  const avoidList=diff==='advanced'?' Avoid straightforward formula-plugging questions. Every question should require thinking, not just substitution.':' Avoid overly complex multi-step problems. Focus on conceptual clarity and direct application.';
  return `You are a senior JEE examiner setting a ${diffNote} exam paper for ${subjLabel}.${topicWeightNote}${chNote}${yearNote}

${diffDetail}
${avoidList}

QUALITY RULES (non-negotiable):
- Each question must be UNIQUE — no two questions should test the same concept
- Questions must look and feel like REAL JEE exam questions from the last 5 years
- Include numerical values, diagrams described in text, and multi-step reasoning
- Options must be plausible — wrong options should be common mistakes/traps
- Solutions must be complete with formulas and step-by-step working
- ALL math MUST use KaTeX: inline $...$ and display $$...$$
- Use \\times for ×, \\frac{a}{b} for fractions, \\sqrt{x} for roots, \\rightarrow for →
- Mix conceptual, numerical, and application-based questions

${exampleMCQ}${exampleINT}${exampleMULTI}

Return a JSON array with exactly ${count} objects. Each object:
{
  "subject": "${subject}",
  "chapter": "specific chapter name",
  "mode": "${mode}",
  "question": "full question text with $KaTeX$ math",
  "options": ${mode==='int'?'[]':'["option A text","option B text","option C text","option D text"]'},
  "answer": ${answerFormat},
  "solution": "complete solution with $KaTeX$ formulas"
}

Return ONLY the JSON array. No markdown, no code blocks, no explanation.`;
}
function cmtIsMobile(){return navigator.maxTouchPoints>0&&window.innerWidth<768;}
async function cmtGenerate(){
  if(cmtConfig.totalQ<5){toast('⚠️ Need at least 5 questions');return;}
  if(cmtConfig.totalQ>75){toast('⚠️ Maximum 75 questions');return;}
  if(!cmtConfig.subjects.length){toast('⚠️ Select at least one subject');return;}
  if(cmtConfig.source!=='ai'){
    const yrs=cmtConfig.yearEnd-cmtConfig.yearStart+1;
    if(yrs<3){toast('⚠️ Select at least 3 years for PYQ mode');return;}
  }
  const settings=JSON.parse(localStorage.getItem(KEYS.dsSettings)||'{}');
  const hasGroqKey=!!settings.openaiKey;
  const hasOllama=true;
  if(!hasGroqKey&&!hasOllama){toast('⚠️ Set a Groq API key or start Ollama');return;}
  document.getElementById('cmt-gen-btn').disabled=true;
  document.getElementById('cmt-loading').style.display='flex';
  cmtAbortController=new AbortController();
  const isMobile=cmtIsMobile();
  const totalTimeout=setTimeout(()=>{cmtAbortController.abort();},300000);
  let forceOllama=!hasGroqKey;
  if(forceOllama&&!isMobile)toast('ℹ️ No Groq key — using Ollama');
  try{
    const batches=cmtPlanBatches();
    const totalBatches=batches.length;
    document.getElementById('cmt-loading-title').textContent=`Generating ${cmtConfig.totalQ} Questions...`;
    document.getElementById('cmt-loading-sub').textContent='Starting...';
    document.getElementById('cmt-loading-fill').style.width='3%';
    let allQuestions=[];
    let errors=[];
    for(let i=0;i<batches.length;i++){
      if(cmtAbortController.signal.aborted)throw new Error('Cancelled');
      const b=batches[i];
      const pct=Math.round(3+((i)/totalBatches)*94);
      document.getElementById('cmt-loading-sub').innerHTML=`<span style="color:var(--txt)">Batch ${i+1}/${totalBatches}</span> — ${b.subject} ${b.mode.toUpperCase()} (${b.count}Q)`;
      document.getElementById('cmt-loading-fill').style.width=pct+'%';
      const prompt=cmtGetBatchPrompt(b.subject,b.mode,b.count,cmtConfig.difficulty,i+1,totalBatches);
      let parsed=[];
      if(forceOllama){
        try{
          const raw=await cmtCallAI(prompt,'ollama',settings);
          parsed=cmtParseBatchResponse(raw,b);
        }catch(ollamaErr){errors.push(`Batch ${i+1}: ${b.subject} ${b.mode} — ${ollamaErr.message}`);}
      }else{
        try{
          const raw=await cmtCallAI(prompt,'groq',settings);
          parsed=cmtParseBatchResponse(raw,b);
        }catch(groqErr){
          if(cmtIsRateLimitError(groqErr)){
            forceOllama=true;
            toast('⚡ Groq limit hit — switching to Ollama for remaining batches');
            document.getElementById('cmt-loading-sub').innerHTML=`<span style="color:var(--orange)">Rate limited</span> — Switching to Ollama...`;
            await new Promise(r=>setTimeout(r,500));
            try{
              const raw=await cmtCallAI(prompt,'ollama',settings);
              parsed=cmtParseBatchResponse(raw,b);
            }catch(ollamaErr){errors.push(`Batch ${i+1}: ${b.subject} ${b.mode} — ${ollamaErr.message}`);}
          }else if(!isMobile){
            try{
              document.getElementById('cmt-loading-sub').innerHTML=`<span style="color:var(--txt)">Batch ${i+1}/${totalBatches}</span> — Retrying on Ollama...`;
              const raw=await cmtCallAI(prompt,'ollama',settings);
              parsed=cmtParseBatchResponse(raw,b);
            }catch(ollamaErr){errors.push(`Batch ${i+1}: ${b.subject} ${b.mode} — ${groqErr.message}`);}
          }else{
            errors.push(`Batch ${i+1}: ${b.subject} ${b.mode} — ${groqErr.message}`);
          }
        }
      }
      allQuestions=allQuestions.concat(parsed);
      if(errors.length&&i<batches.length-1){
        document.getElementById('cmt-loading-sub').innerHTML=`<span style="color:var(--txt)">Batch ${i+1}/${totalBatches}</span> — ${errors.length} failed, continuing...`;
      }
    }
    clearTimeout(totalTimeout);
    if(!allQuestions.length)throw new Error(forceOllama?'Ollama not responding — make sure it\'s running':'No questions generated. Check your API key and try again.');
    document.getElementById('cmt-loading-sub').innerHTML='<span style="color:var(--txt)">Deduplicating questions...</span>';
    document.getElementById('cmt-loading-fill').style.width='97%';
    let seen=new Set();
    allQuestions=allQuestions.filter(q=>{
      const h=cmtQuestionHash(q);
      if(!h||h.length<20)return true;
      if(seen.has(h))return false;
      seen.add(h);
      return true;
    });
    allQuestions=allQuestions.filter(q=>!cmtIsDuplicate(q));
    const target=cmtConfig.totalQ;
    let retries=0;
    const MAX_RETRIES=3;
    while(allQuestions.length<target&&retries<MAX_RETRIES){
      retries++;
      document.getElementById('cmt-loading-sub').innerHTML=`<span style="color:var(--txt)">Regenerating ${target-allQuestions.length} missing questions (attempt ${retries}/${MAX_RETRIES})...</span>`;
      const need=target-allQuestions.length;
      const regenBatches=[];
      for(let i=0;i<need;i+=5)regenBatches.push({subject:cmtConfig.subjects[i%cmtConfig.subjects.length],mode:'mcq',count:Math.min(5,need-i)});
      for(const b of regenBatches){
        try{
          const prompt=cmtGetBatchPrompt(b.subject,b.mode,b.count,cmtConfig.difficulty,1,1);
          const raw=await cmtCallAI(prompt,forceOllama?'ollama':'groq',settings);
          const parsed=cmtParseBatchResponse(raw,b);
          const newQ=parsed.filter(q=>!cmtIsDuplicate(q)&&!seen.has(cmtQuestionHash(q)));
          newQ.forEach(q=>{seen.add(cmtQuestionHash(q));});
          allQuestions=allQuestions.concat(newQ);
        }catch(e){}
      }
    }
    allQuestions.forEach((q,i)=>{q.num=i+1;});
    cmtQuestions=allQuestions;
    cmtSaveNewHashes(allQuestions);
    document.getElementById('cmt-loading-fill').style.width='100%';
    const errNote=errors.length?` (${errors.length} batch${errors.length>1?'es':''} failed)`:'';
    const retryNote=retries?` (${retries} regeneration round${retries>1?'s':''})`:'';
    document.getElementById('cmt-loading-sub').innerHTML=`<span style="color:var(--green)">✓ ${allQuestions.length} questions ready!</span>${errNote}${retryNote}`;
    setTimeout(()=>{document.getElementById('cmt-loading').style.display='none';document.getElementById('cmt-gen-btn').disabled=false;cmtStartTest();},500);
  }catch(err){
    clearTimeout(totalTimeout);
    document.getElementById('cmt-loading').style.display='none';
    document.getElementById('cmt-gen-btn').disabled=false;
    if(err.name!=='AbortError')toast('❌ '+err.message);
  }
}
function cmtIsRateLimitError(err){
  if(!err||!err.message)return false;
  const m=err.message.toLowerCase();
  return m.includes('429')||m.includes('rate')||m.includes('limit')||m.includes('quota')||m.includes('exceeded')||m.includes('tokens per');
}
const CMT_HASH_KEY='jeehq3_cmt_hashes';
const CMT_HASH_MAX=170;
let cmtGenHashes=[];
function cmtLoadHashes(){
  try{cmtGenHashes=JSON.parse(localStorage.getItem(CMT_HASH_KEY))||[];}catch(e){cmtGenHashes=[];}
}
function cmtSaveHashes(){
  if(cmtGenHashes.length>CMT_HASH_MAX)cmtGenHashes=cmtGenHashes.slice(-CMT_HASH_MAX);
  try{localStorage.setItem(CMT_HASH_KEY,JSON.stringify(cmtGenHashes));}catch(e){}
}
function cmtQuestionHash(q){
  const t=(q.question||'').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,120);
  return t;
}
function cmtIsDuplicate(q){
  const h=cmtQuestionHash(q);
  if(!h||h.length<20)return false;
  return cmtGenHashes.includes(h);
}
function cmtSaveNewHashes(questions){
  questions.forEach(q=>{
    const h=cmtQuestionHash(q);
    if(h&&h.length>=20&&!cmtGenHashes.includes(h))cmtGenHashes.push(h);
  });
  cmtSaveHashes();
}
function cmtPlanBatches(){
  const batches=[];
  const types=[];
  if(cmtConfig.mcq>0)types.push({mode:'mcq',count:cmtConfig.mcq});
  if(cmtConfig.intQ>0)types.push({mode:'int',count:cmtConfig.intQ});
  if(cmtConfig.multiQ>0)types.push({mode:'multi',count:cmtConfig.multiQ});
  if(!types.length)types.push({mode:'mcq',count:cmtConfig.totalQ});
  const totalTypeQ=types.reduce((s,t)=>s+t.count,0);
  cmtConfig.subjects.forEach(subj=>{
    const subjShare=Math.round(cmtConfig.totalQ/cmtConfig.subjects.length);
    const subjBatches=[];
    types.forEach(t=>{
      const typeShare=Math.round(subjShare*t.count/totalTypeQ);
      if(typeShare<=0)return;
      for(let i=0;i<typeShare;i+=5){
        subjBatches.push({subject:subj,mode:t.mode,count:Math.min(5,typeShare-i)});
      }
    });
    let pending=null;
    subjBatches.forEach(b=>{
      if(pending&&pending.mode===b.mode&&pending.count+b.count<=5){
        pending.count+=b.count;
      }else{
        if(pending)batches.push(pending);
        pending={...b};
      }
    });
    if(pending)batches.push(pending);
  });
  let totalGenerated=batches.reduce((s,b)=>s+b.count,0);
  while(totalGenerated<cmtConfig.totalQ){
    const subj=cmtConfig.subjects[batches.length%cmtConfig.subjects.length];
    const need=Math.min(5,cmtConfig.totalQ-totalGenerated);
    batches.push({subject:subj,mode:'mcq',count:need});
    totalGenerated+=need;
  }
  return batches;
}
function cmtParseBatchResponse(raw,batch){
  try{
    let text=raw.trim();
    if(text.startsWith('```'))text=text.replace(/^```json?\n?/,'').replace(/\n?```$/,'');
    let parsed=JSON.parse(text);
    if(!Array.isArray(parsed))throw new Error('not array');
    return parsed.filter(q=>q&&q.question&&q.mode).map(q=>{
      q.subject=batch.subject;
      if(!q.mode)q.mode=batch.mode;
      if(!q.options)q.options=[];
      if(q.answer===undefined||q.answer===null)q.answer='';
      if(!q.solution)q.solution='';
      return q;
    });
  }catch(e){
    try{
      const match=raw.match(/\[[\s\S]*\]/);
      if(match){
        let parsed=JSON.parse(match[0]);
        return parsed.filter(q=>q&&q.question).map(q=>{
          q.subject=batch.subject;if(!q.mode)q.mode=batch.mode;
          if(!q.options)q.options=[];if(!q.solution)q.solution='';
          return q;
        });
      }
    }catch(e2){}
    return [];
  }
}
function cmtCancelGeneration(){
  if(cmtAbortController)cmtAbortController.abort();
  document.getElementById('cmt-loading').style.display='none';
  document.getElementById('cmt-gen-btn').disabled=false;
}
async function cmtCallAI(prompt,provider,settings){
  settings=settings||JSON.parse(localStorage.getItem(KEYS.dsSettings)||'{}');
  const controller=new AbortController();
  const perTimeout=provider==='ollama'?90000:45000;
  const timer=setTimeout(()=>controller.abort(),perTimeout);
  const signal=AbortSignal.any?AbortSignal.any([controller.signal,cmtAbortController.signal]):controller.signal;
  try{
    if(provider==='ollama'){
      const url=(settings.ollamaUrl||'http://localhost:11434').replace(/\/+$/,'');
      const model=settings.ollamaModel||'qwen2.5:3b';
      const res=await fetch(url+'/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model,prompt,stream:false,options:{temperature:0.6,num_predict:4096}}),signal});
      if(!res.ok)throw new Error('Ollama '+res.status);
      const data=await res.json();return data.response;
    }else{
      const key=settings.openaiKey||'';
      const base=(settings.apiBase||'https://api.groq.com/openai/v1').replace(/\/+$/,'');
      const model=settings.openaiModel||'llama-3.3-70b-versatile';
      if(!key)throw new Error('No API key');
      const res=await fetch(base+'/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+key},body:JSON.stringify({model,messages:[{role:'system',content:'You are a JEE exam question setter. Return ONLY valid JSON arrays.'},{role:'user',content:prompt}],temperature:0.6,max_tokens:4096}),signal});
      if(!res.ok){const e=await res.text();throw new Error('API '+res.status+': '+e.slice(0,80));}
      const data=await res.json();return data.choices[0].message.content;
    }
  }finally{clearTimeout(timer);}
}
function cmtSafeHtml(text){
  if(!text)return'';
  const mathBlocks=[];
  let s=String(text);
  s=s.replace(/\$\$[\s\S]+?\$\$/g,m=>{const i=mathBlocks.length;mathBlocks.push(m);return '\x00MATHBLOCK'+i+'\x00';});
  s=s.replace(/\$[^$\n]+?\$/g,m=>{const i=mathBlocks.length;mathBlocks.push(m);return '\x00MATHBLOCK'+i+'\x00';});
  s=s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  s=s.replace(/\x00MATHBLOCK(\d+)\x00/g,(m,i)=>mathBlocks[parseInt(i)]);
  return s;
}
function cmtStartTest(){
  cm('m-cmt-config');
  cmtState={current:0,answers:{},marked:new Set(),startTime:Date.now(),elapsed:0,timerInterval:null,submitted:false};
  document.getElementById('cmt-player').style.display='flex';
  document.body.style.overflow='hidden';
  const title=cmtQuestions.length+' Questions • '+cmtConfig.difficulty.toUpperCase();
  document.getElementById('cmt-player-title').textContent=title;
  cmtRenderNav();
  cmtRenderQuestion();
  cmtStartTimer();
  window._cmtKeyHandler=function(e){
    if(document.getElementById('cmt-player').style.display==='none')return;
    if(!e.key)return;
    e.stopPropagation();
    if(e.key==='ArrowRight'||(e.key==='Enter'&&!e.target.matches('input,textarea'))){e.preventDefault();cmtNextQ();}
    else if(e.key==='ArrowLeft'){e.preventDefault();cmtPrevQ();}
    else if(['a','b','c','d'].includes(e.key.toLowerCase())&&!e.target.matches('input,textarea')){
      e.preventDefault();
      const q=cmtQuestions[cmtState.current];
      const letter=e.key.toUpperCase();
      if(q.mode==='mcq')cmtSelectOption(letter);
      else if(q.mode==='multi')cmtSelectMulti(letter);
    }
  };
  document.addEventListener('keydown',window._cmtKeyHandler);
}
function cmtStartTimer(){
  const totalSec=cmtConfig.timeMin*60;
  cmtState.timerInterval=setInterval(()=>{
    cmtState.elapsed=Math.floor((Date.now()-cmtState.startTime)/1000);
    const remaining=Math.max(0,totalSec-cmtState.elapsed);
    const h=Math.floor(remaining/3600);
    const m=Math.floor((remaining%3600)/60);
    const s=remaining%60;
    const el=document.getElementById('cmt-player-timer');
    el.textContent=String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
    el.className='cmt-player-timer'+(remaining<300?' danger':remaining<600?' warn':'');
    if(remaining<=0){clearInterval(cmtState.timerInterval);cmtSubmitTest();}
  },1000);
}
function cmtRenderNav(){
  const grid=document.getElementById('cmt-nav-grid');
  grid.innerHTML=cmtQuestions.map((q,i)=>{
    let cls='cmt-nav-btn';
    if(i===cmtState.current)cls+=' current';
    if(cmtState.marked.has(i))cls+=' marked';
    else if(cmtState.answers[i]!==undefined&&cmtState.answers[i]!=='')cls+=' answered';
    else cls+=' skipped';
    return `<div class="${cls}" onclick="cmtGoTo(${i})">${i+1}</div>`;
  }).join('');
  const answered=Object.keys(cmtState.answers).filter(k=>cmtState.answers[k]!==''&&cmtState.answers[k]!==undefined).length;
  const marked=cmtState.marked.size;
  document.getElementById('cmt-sidebar-stats').innerHTML=`Answered: ${answered}/${cmtQuestions.length}<br>Marked: ${marked}`;
}
function cmtRenderQuestion(){
  const q=cmtQuestions[cmtState.current];
  const main=document.getElementById('cmt-player-main');
  const subjColors={physics:'var(--phys)',chemistry:'var(--chem)',maths:'var(--math)'};
  const subjLabels={physics:'⚡ Physics',chemistry:'⚗️ Chemistry',maths:'📐 Maths'};
  const modeLabels={mcq:'MCQ',int:'Integer',multi:'Multi-Correct'};
  const currentAns=cmtState.answers[cmtState.current];
  let optsHTML='';
  if(q.mode==='mcq'){
    optsHTML=`<div class="cmt-q-opts">${q.options.map((opt,i)=>{
      const letter=String.fromCharCode(65+i);
      const sel=currentAns===letter;
      return `<div class="cmt-q-opt ${sel?'selected':''}" onclick="cmtSelectOption('${letter}')">
        <div class="cmt-q-opt-radio"></div><div class="cmt-q-opt-label"><b>${letter}.</b> ${cmtSafeHtml(opt)}</div></div>`;
    }).join('')}</div>`;
  }else if(q.mode==='multi'){
    const selected=Array.isArray(currentAns)?currentAns:[];
    optsHTML=`<div class="cmt-q-opts">${q.options.map((opt,i)=>{
      const letter=String.fromCharCode(65+i);
      const sel=selected.includes(letter);
      return `<div class="cmt-q-opt ${sel?'selected':''}" onclick="cmtSelectMulti('${letter}')">
        <div class="cmt-q-opt-check"></div><div class="cmt-q-opt-label"><b>${letter}.</b> ${cmtSafeHtml(opt)}</div></div>`;
    }).join('')}</div>`;
  }else{
    optsHTML=`<div style="margin-top:4px"><input class="cmt-q-int-input" type="text" id="cmt-int-input" placeholder="Enter answer" value="${currentAns||''}" oninput="cmtSetIntAnswer(this.value)"/></div>`;
  }
  main.innerHTML=`
  <div class="cmt-q-display">
    <div class="cmt-q-header">
      <div class="cmt-q-num">Q${q.num}</div>
      <div class="cmt-q-meta">
        <span class="cmt-player-subj" style="background:${subjColors[q.subject]}20;color:${subjColors[q.subject]}">${subjLabels[q.subject]||q.subject}</span>
        <span style="padding:2px 6px;background:var(--glass2);border-radius:4px">${modeLabels[q.mode]||q.mode}</span>
        ${q.chapter?`<span style="padding:2px 6px;background:var(--glass2);border-radius:4px">${esc(q.chapter)}</span>`:''}
      </div>
    </div>
    <div class="cmt-q-text" id="cmt-q-text">${cmtSafeHtml(q.question)}</div>
    ${optsHTML}
  </div>
  <div class="cmt-q-actions">
    <button class="btn btn-ghost btn-sm" onclick="cmtPrevQ()" ${cmtState.current===0?'disabled':''}>◀ Prev</button>
    <button class="btn btn-ghost btn-sm" onclick="cmtNextQ()" ${cmtState.current>=cmtQuestions.length-1?'disabled':''}>Next ▶</button>
    <div style="flex:1"></div>
    <button class="cmt-submit-btn" onclick="cmtConfirmSubmit()" style="font-size:12px;padding:8px 16px">Submit Test</button>
  </div>`;
  document.getElementById('cmt-mark-btn').className='cmt-q-mark-btn'+(cmtState.marked.has(cmtState.current)?' on':'');
  cmtRenderNav();
  cmtRenderMath('cmt-player-main');
}
function cmtRenderMath(id){
  const el=document.getElementById(id);
  if(!el||typeof renderMathInElement==='undefined')return;
  try{
    renderMathInElement(el,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}],throwOnError:false});
  }catch(e){}
}
function cmtGoTo(i){if(i>=0&&i<cmtQuestions.length){cmtState.current=i;cmtRenderQuestion();}}
function cmtNextQ(){if(cmtState.current<cmtQuestions.length-1)cmtGoTo(cmtState.current+1);}
function cmtPrevQ(){if(cmtState.current>0)cmtGoTo(cmtState.current-1);}
function cmtSelectOption(letter){
  cmtState.answers[cmtState.current]=letter;
  cmtRenderQuestion();
}
function cmtSelectMulti(letter){
  let arr=cmtState.answers[cmtState.current];
  if(!Array.isArray(arr))arr=[];
  const i=arr.indexOf(letter);
  if(i>=0)arr.splice(i,1);else arr.push(letter);
  arr.sort();
  cmtState.answers[cmtState.current]=arr;
  cmtRenderQuestion();
}
function cmtSetIntAnswer(val){cmtState.answers[cmtState.current]=val;}
function cmtToggleMark(){
  if(cmtState.marked.has(cmtState.current))cmtState.marked.delete(cmtState.current);
  else cmtState.marked.add(cmtState.current);
  cmtRenderQuestion();
}
function cmtClearAnswer(){delete cmtState.answers[cmtState.current];cmtRenderQuestion();}
function cmtToggleNav(){
  const nav=document.getElementById('cmt-mobile-nav');
  const isOpen=nav.classList.contains('open');
  if(isOpen){nav.classList.remove('open');}
  else{
    const grid=document.getElementById('cmt-mobile-nav-grid');
    grid.innerHTML=cmtQuestions.map((q,i)=>{
      let cls='cmt-nav-btn';
      if(i===cmtState.current)cls+=' current';
      if(cmtState.marked.has(i))cls+=' marked';
      else if(cmtState.answers[i]!==undefined&&cmtState.answers[i]!=='')cls+=' answered';
      else cls+=' skipped';
      return `<div class="${cls}" onclick="cmtGoTo(${i});cmtToggleNav()">${i+1}</div>`;
    }).join('');
    nav.classList.add('open');
  }
}
function cmtConfirmSubmit(){
  const answered=Object.keys(cmtState.answers).filter(k=>cmtState.answers[k]!==''&&cmtState.answers[k]!==undefined).length;
  const skipped=cmtQuestions.length-answered;
  document.getElementById('cmt-confirm-stats').innerHTML=`
    Answered: <b>${answered}</b> / ${cmtQuestions.length}<br>
    Skipped: <b>${skipped}</b><br>
    Marked for review: <b>${cmtState.marked.size}</b><br><br>
    <span style="font-size:11px;color:var(--faint)">Are you sure you want to submit?</span>`;
  om('m-cmt-confirm');
}
function cmtSubmitTest(){
  if(cmtState.timerInterval)clearInterval(cmtState.timerInterval);
  if(window._cmtKeyHandler){document.removeEventListener('keydown',window._cmtKeyHandler);window._cmtKeyHandler=null;}
  cmtState.submitted=true;
  document.getElementById('cmt-player').style.display='none';
  document.body.style.overflow='';
  let correct=0,incorrect=0,skipped=0,totalMarks=0,maxMarks=0;
  const subjStats={physics:{c:0,w:0,s:0,m:0},chemistry:{c:0,w:0,s:0,m:0},maths:{c:0,w:0,s:0,m:0}};
  const qResults=[];
  cmtQuestions.forEach((q,i)=>{
    const ans=cmtState.answers[i];
    let isCorrect=false;
    let marks=0;
    const maxM=q.mode==='mcq'||q.mode==='multi'?4:4;
    maxMarks+=maxM;
    if(ans===undefined||ans===''||(Array.isArray(ans)&&!ans.length)){
      skipped++;marks=0;
      if(subjStats[q.subject])subjStats[q.subject].s++;
      qResults.push({...q,userAns:ans||'none',correct:false,marks:0,status:'skipped'});
    }else{
      if(q.mode==='mcq'){
        isCorrect=ans===q.answer;
      }else if(q.mode==='multi'){
        const expected=Array.isArray(q.answer)?[...q.answer].sort():[];
        const got=Array.isArray(ans)?[...ans].sort():[];
        isCorrect=JSON.stringify(expected)===JSON.stringify(got);
      }else{
        const numAns=parseFloat(ans);const numExp=parseFloat(q.answer);
        isCorrect=!isNaN(numAns)&&!isNaN(numExp)&&Math.abs(numAns-numExp)<0.5;
      }
      if(isCorrect){correct++;marks=4;if(subjStats[q.subject])subjStats[q.subject].c++;}
      else{incorrect++;marks=-1;if(subjStats[q.subject])subjStats[q.subject].w++;}
      totalMarks+=marks;
      if(subjStats[q.subject])subjStats[q.subject].m+=maxM;
      qResults.push({...q,userAns:ans,correct:isCorrect,marks,status:isCorrect?'correct':'wrong'});
    }
  });
  const pct=maxMarks>0?Math.round(totalMarks/maxMarks*100):0;
  cmtShowResults({correct,incorrect,skipped,totalMarks,maxMarks,pct,subjStats,qResults});
}
function cmtShowResults(r){
  const el=document.getElementById('cmt-results-body');
  const timeTaken=Math.round(cmtState.elapsed/60);
  const pctColor=r.pct>=60?'var(--green)':r.pct>=30?'var(--orange)':'var(--red)';
  const circR=52;const circC=2*Math.PI*circR;const offset=circC-(r.pct/100)*circC;
  const subjInfo=[
    {key:'physics',label:'⚡ Physics',color:'var(--phys)'},
    {key:'chemistry',label:'⚗️ Chemistry',color:'var(--chem)'},
    {key:'maths',label:'📐 Maths',color:'var(--math)'}
  ].filter(s=>r.subjStats[s.key]&&(r.subjStats[s.key].c+r.subjStats[s.key].w+r.subjStats[s.key].s>0));
  el.innerHTML=`
  <div class="cmt-results-score">
    <div class="cmt-results-ring">
      <svg width="120" height="120"><circle cx="60" cy="60" r="${circR}" fill="none" stroke="var(--surface2)" stroke-width="8"/><circle cx="60" cy="60" r="${circR}" fill="none" stroke="${pctColor}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${circC}" stroke-dashoffset="${offset}" style="transition:stroke-dashoffset 1s var(--ease-out)"/></svg>
      <div class="cmt-results-ring-val"><div class="cmt-results-ring-num" style="color:${pctColor}">${r.totalMarks}</div><div class="cmt-results-ring-sub">/ ${r.maxMarks}</div></div>
    </div>
    <div class="cmt-results-stats">
      <div class="cmt-results-stat"><div class="cmt-results-stat-val" style="color:var(--green)">${r.correct}</div><div class="cmt-results-stat-lbl">Correct</div></div>
      <div class="cmt-results-stat"><div class="cmt-results-stat-val" style="color:var(--red)">${r.incorrect}</div><div class="cmt-results-stat-lbl">Wrong</div></div>
      <div class="cmt-results-stat"><div class="cmt-results-stat-val" style="color:var(--faint)">${r.skipped}</div><div class="cmt-results-stat-lbl">Skipped</div></div>
      <div class="cmt-results-stat"><div class="cmt-results-stat-val" style="color:var(--accent)">${timeTaken}m</div><div class="cmt-results-stat-lbl">Time</div></div>
    </div>
  </div>
  <div class="cmt-results-subj">${subjInfo.map(s=>{
    const st=r.subjStats[s.key];
    const total=st.c+st.w+st.s;
    const subPct=total?Math.round((st.c/total)*100):0;
    return `<div class="cmt-results-subj-row">
      <div class="cmt-results-subj-name" style="color:${s.color}">${s.label}</div>
      <div class="cmt-results-subj-bar"><div class="cmt-results-subj-fill" style="width:${subPct}%;background:${s.color}"></div></div>
      <div class="cmt-results-subj-pct" style="color:${s.color}">${subPct}%</div>
    </div>`;
  }).join('')}</div>
  <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--faint);margin:14px 0 8px">Question Analysis</div>
  <div class="cmt-results-q-grid">${r.qResults.map((q,i)=>`<div class="cmt-results-q-btn ${q.status}" title="Q${i+1}: ${q.status}" onclick="cmtShowQDetail(${i})">${i+1}</div>`).join('')}</div>
  <div id="cmt-q-detail" style="margin-top:12px;display:none"></div>`;
  window._cmtResults=r;
  om('m-cmt-results');
}
function cmtShowQDetail(idx){
  const r=window._cmtResults;if(!r)return;
  const q=r.qResults[idx];
  const el=document.getElementById('cmt-q-detail');
  const statusColor=q.status==='correct'?'var(--green)':q.status==='wrong'?'var(--red)':'var(--faint)';
  const subjColors={physics:'var(--phys)',chemistry:'var(--chem)',maths:'var(--math)'};
  el.style.display='block';
  el.innerHTML=`
  <div style="background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:14px">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
      <span style="font-weight:700;color:var(--accent)">Q${q.num}</span>
      <span style="font-size:10px;padding:2px 6px;border-radius:4px;background:${subjColors[q.subject]||'var(--glass2)'}20;color:${subjColors[q.subject]||'var(--muted)'}">${q.subject}</span>
      <span style="font-size:10px;padding:2px 6px;border-radius:4px;background:${statusColor}20;color:${statusColor};font-weight:600">${q.status.toUpperCase()}</span>
      <span style="font-size:10px;color:var(--faint)">${q.marks>=0?'+':''}${q.marks} marks</span>
    </div>
    <div style="font-size:13px;color:var(--txt);line-height:1.6;margin-bottom:8px" id="cmt-detail-text">${cmtSafeHtml(q.question)}</div>
    ${q.options&&q.options.length?`<div style="font-size:12px;color:var(--muted);margin-bottom:8px">${q.options.map((o,i)=>{const l=String.fromCharCode(65+i);const isCor=Array.isArray(q.answer)?q.answer.includes(l):q.answer===l;const isUser=Array.isArray(q.userAns)?q.userAns.includes(l):q.userAns===l;return `<div style="padding:3px 0;${isCor?'color:var(--green);font-weight:600':''}${isUser&&!isCor?'color:var(--red);text-decoration:line-through':''}">${l}. ${cmtSafeHtml(o)}${isCor?' ✓':''}${isUser&&!isCor?' ✗':''}</div>`;}).join('')}</div>`:''}
    ${q.mode==='int'?`<div style="font-size:12px;color:var(--muted);margin-bottom:8px">Your answer: <b style="color:${q.status==='correct'?'var(--green)':'var(--red)'}">${esc(String(q.userAns))}</b> | Correct: <b style="color:var(--green)">${esc(String(q.answer))}</b></div>`:''}
    ${q.solution?`<div style="font-size:11px;color:var(--faint);padding-top:8px;border-top:1px solid var(--border);line-height:1.6"><b>Solution:</b> ${cmtSafeHtml(q.solution)}</div>`:''}
  </div>`;
  cmtRenderMath('cmt-detail-text');
}
function cmtSaveToHistory(){
  const r=window._cmtResults;if(!r){toast('No results to save');return;}
  if(!DB.mockTests)DB.mockTests=[];
  DB.mockTests.unshift({
    id:'mt_'+uid(),subject:'Full Syllabus',date:new Date().toISOString().split('T')[0],
    marksScored:r.totalMarks,totalMarks:r.maxMarks,timeTaken:Math.round(cmtState.elapsed/60),
    syllabus:'Custom Test ('+cmtQuestions.length+' questions)',
    topicsToReview:r.qResults.filter(q=>q.status!=='correct').map(q=>`Q${q.num}: ${q.chapter||q.subject}`).join(', ')||undefined,
    createdAt:new Date().toISOString()
  });
  sv('mockTests');
  cm('m-cmt-results');
  go('mocktests');
  toast('✅ Saved to history!');
}

/* ═══════════════ WINDOW EXPORTS ═══════════════ */
window.renderMockTests=renderMockTests;
window.openAddMockTest=openAddMockTest;
window.saveMockTest=saveMockTest;
window.deleteMockTest=deleteMockTest;
window.toggleMockTestAnalysis=toggleMockTestAnalysis;
window.openCmtConfig=openCmtConfig;
window.cmtRenderConfig=cmtRenderConfig;
window.cmtToggleSubject=cmtToggleSubject;
window.cmtToggleChapter=cmtToggleChapter;
window.cmtUpdateCounts=cmtUpdateCounts;
window.cmtSetSource=cmtSetSource;
window.cmtSetDiff=cmtSetDiff;
window.cmtSetTime=cmtSetTime;
window.cmtUpdateYearRange=cmtUpdateYearRange;
window.cmtGetBatchPrompt=cmtGetBatchPrompt;
window.cmtIsMobile=cmtIsMobile;
window.cmtGenerate=cmtGenerate;
window.cmtIsRateLimitError=cmtIsRateLimitError;
window.cmtLoadHashes=cmtLoadHashes;
window.cmtSaveHashes=cmtSaveHashes;
window.cmtQuestionHash=cmtQuestionHash;
window.cmtIsDuplicate=cmtIsDuplicate;
window.cmtSaveNewHashes=cmtSaveNewHashes;
window.cmtPlanBatches=cmtPlanBatches;
window.cmtParseBatchResponse=cmtParseBatchResponse;
window.cmtCancelGeneration=cmtCancelGeneration;
window.cmtCallAI=cmtCallAI;
window.cmtSafeHtml=cmtSafeHtml;
window.cmtStartTest=cmtStartTest;
window.cmtStartTimer=cmtStartTimer;
window.cmtRenderNav=cmtRenderNav;
window.cmtRenderQuestion=cmtRenderQuestion;
window.cmtRenderMath=cmtRenderMath;
window.cmtGoTo=cmtGoTo;
window.cmtNextQ=cmtNextQ;
window.cmtPrevQ=cmtPrevQ;
window.cmtSelectOption=cmtSelectOption;
window.cmtSelectMulti=cmtSelectMulti;
function cmtCleanup(){
  if(cmtState.timerInterval)clearInterval(cmtState.timerInterval);
  if(window._cmtKeyHandler){document.removeEventListener('keydown',window._cmtKeyHandler);window._cmtKeyHandler=null;}
  const player=document.getElementById('cmt-player');
  if(player)player.style.display='none';
  document.body.style.overflow='';
}
window.cmtSetIntAnswer=cmtSetIntAnswer;
window.cmtToggleMark=cmtToggleMark;
window.cmtClearAnswer=cmtClearAnswer;
window.cmtToggleNav=cmtToggleNav;
window.cmtConfirmSubmit=cmtConfirmSubmit;
window.cmtSubmitTest=cmtSubmitTest;
window.cmtShowResults=cmtShowResults;
window.cmtShowQDetail=cmtShowQDetail;
window.cmtSaveToHistory=cmtSaveToHistory;
window.cmtCleanup=cmtCleanup;