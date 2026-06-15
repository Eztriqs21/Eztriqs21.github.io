// page-js/pyq-research.js
let pyqTab='pattern',pyqSearchSubj='physics',pyqSearchExam='mains',pyqSearchMax=20;
let pyqSearchResults=[],pyqSearchLoading=false,pyqSearchQ='';
let pyqPlannerDays=30,pyqPlannerPlan=null;
let pyqRealOnly=true,pyqYearFilter=[];

const PYQ_DATA={
  physics:[
    {topic:'Mechanics',weight:18,questions:7,years:{2024:3,2023:2,2022:3,2021:2,2020:2,2019:2,2018:1,2017:2,2016:1}},
    {topic:'Electrostatics',weight:10,questions:4,years:{2024:2,2023:1,2022:1,2021:1,2020:1,2019:1,2018:1,2017:1,2016:1}},
    {topic:'Current Electricity',weight:8,questions:3,years:{2024:1,2023:1,2022:1,2021:1,2020:1,2019:1,2018:1,2017:1,2016:1}},
    {topic:'Magnetism & EMI',weight:12,questions:5,years:{2024:2,2023:2,2022:2,2021:1,2020:2,2019:2,2018:1,2017:1,2016:1}},
    {topic:'Optics',weight:10,questions:4,years:{2024:1,2023:1,2022:2,2021:1,2020:1,2019:1,2018:1,2017:1,2016:1}},
    {topic:'Modern Physics',weight:12,questions:5,years:{2024:2,2023:2,2022:1,2021:2,2020:1,2019:1,2018:2,2017:1,2016:1}},
    {topic:'Thermal Physics',weight:8,questions:3,years:{2024:1,2023:1,2022:1,2021:1,2020:1,2019:1,2018:1,2017:1,2016:1}},
    {topic:'Waves & Sound',weight:5,questions:2,years:{2024:1,2023:1,2022:1,2021:1,2020:1,2019:1,2018:1,2017:1,2016:1}},
    {topic:'SHM & Gravitation',weight:5,questions:2,years:{2024:1,2023:1,2022:1,2021:1,2020:1,2019:1,2018:1,2017:1,2016:1}},
    {topic:'Properties of Matter',weight:4,questions:1,years:{2024:1,2023:1,2022:1,2021:1,2020:1,2019:1,2018:1,2017:1,2016:1}}
  ],
  chemistry:[
    {topic:'Physical Chemistry',weight:33,questions:12,years:{2024:4,2023:5,2022:4,2021:4,2020:5,2019:4,2018:4,2017:4,2016:4}},
    {topic:'Organic Chemistry',weight:35,questions:13,years:{2024:5,2023:5,2022:5,2021:5,2020:4,2019:5,2018:5,2017:5,2016:5}},
    {topic:'Inorganic Chemistry',weight:32,questions:12,years:{2024:4,2023:4,2022:4,2021:4,2020:4,2019:4,2018:4,2017:4,2016:4}}
  ],
  maths:[
    {topic:'Algebra',weight:22,questions:8,years:{2024:3,2023:3,2022:3,2021:3,2020:3,2019:3,2018:2,2017:3,2016:3}},
    {topic:'Calculus',weight:28,questions:10,years:{2024:4,2023:4,2022:4,2021:4,2020:4,2019:3,2018:4,2017:3,2016:3}},
    {topic:'Coordinate Geometry',weight:20,questions:7,years:{2024:3,2023:2,2022:3,2021:3,2020:2,2019:3,2018:2,2017:3,2016:2}},
    {topic:'Trigonometry',weight:10,questions:4,years:{2024:1,2023:2,2022:1,2021:1,2020:2,2019:1,2018:2,2017:1,2016:2}},
    {topic:'Vectors & 3D',weight:10,questions:4,years:{2024:1,2023:1,2022:1,2021:1,2020:1,2019:2,2018:1,2017:1,2016:1}},
    {topic:'Statistics & Probability',weight:10,questions:4,years:{2024:1,2023:1,2022:1,2021:1,2020:1,2019:1,2018:2,2017:1,2016:1}}
  ]
};

const PYQ_YEARS=[2024,2023,2022,2021,2020,2019,2018,2017,2016];

const PYQ_CHAPTER_MAP={
  physics:{
    p1:['units','dimensions','measurements','significant figures','error analysis'],
    p2:['kinematics','straight line','displacement','velocity','acceleration','distance'],
    p3:['projectile motion','circular motion','vectors','relative motion','plane'],
    p4:['newton laws','friction','momentum','force','impulse'],
    p5:['work energy power','kinetic energy','potential energy','collisions','work done'],
    p6:['rotational motion','moment of inertia','torque','centre of mass','rolling','angular momentum'],
    p7:['gravitation','kepler','escape velocity','orbital velocity','gravity','gravitational potential'],
    p8:['elasticity','stress strain','young modulus','hooke law','bulk modulus'],
    p9:['thermal expansion','calorimetry','conduction','convection','radiation','newton cooling','heat'],
    p10:['thermodynamics','first law','second law','carnot engine','entropy','heat engine','adiabatic','isothermal'],
    p11:['kinetic theory','ideal gas','rms speed','degrees of freedom','boltzmann'],
    p12:['oscillations','waves','shm','standing waves','beats','doppler','simple harmonic'],
    p13:['coulomb law','electric field','gauss law','flux','dipole','electric charge'],
    p14:['electric potential','capacitance','capacitor','dielectric','equipotential'],
    p15:['ohm law','resistance','kirchhoff','wheatstone','meter bridge','current electricity','drift velocity'],
    p16:['magnetic field','biot savart','ampere law','solenoid','toroid','galvanometer','moving charge'],
    p17:['electromagnetic induction','faraday','lenz law','motional emf','inductance','eddy current','flux'],
    p18:['alternating current','lcr','resonance','phasor','transformer','impedance','power factor'],
    p19:['electromagnetic waves','displacement current','em spectrum','maxwell'],
    p20:['ray optics','mirror','lens','refraction','total internal reflection','prism','optical instrument','snell'],
    p21:['wave optics','interference','ydse','diffraction','polarization','young double slit'],
    p22:['photoelectric effect','de broglie','dual nature','work function','einstein equation','davisson germer'],
    p23:['atoms','nuclei','bohr model','radioactivity','binding energy','mass defect','x rays','alpha scattering'],
    p24:['semiconductor','p-n junction','transistor','logic gate','diode','rectifier','zener'],
    p25:['communication','modulation','bandwidth','amplitude modulation','signal']
  },
  chemistry:{
    c1:['mole concept','stoichiometry','limiting reagent','atomic mass','molecular mass','avogadro'],
    c2:['atomic structure','bohr model','quantum number','electronic configuration','wave mechanical'],
    c3:['periodic table','periodic law','ionization energy','electron affinity','electronegativity','atomic radius'],
    c4:['chemical bonding','vsepr','hybridization','valence bond','molecular orbital','hydrogen bond','ionic','covalent'],
    c5:['states of matter','gas laws','ideal gas','kinetic molecular','real gas','intermolecular'],
    c6:['thermodynamics','enthalpy','hess law','entropy','gibbs free energy','heat capacity','first law'],
    c7:['equilibrium','le chatelier','ph','buffer','acid base','ionic equilibrium','kp','kc','hydrolysis'],
    c8:['redox','oxidation number','electrochemical cell','balancing redox','disproportionation'],
    c9:['hydrogen','s block','alkali metal','alkaline earth','heavy water','hydride'],
    c10:['p block group 13','boron','aluminium','borax','silicates'],
    c11:['organic basics','iupac','isomerism','inductive effect','resonance','hyperconjugation','reaction intermediate'],
    c12:['hydrocarbons','alkane','alkene','alkyne','aromatic','electrophilic substitution','benzene'],
    c13:['solid state','crystal','unit cell','packing','point defect','schottky','frenkel'],
    c14:['solutions','raoult law','colligative','van hoff','osmotic pressure','boiling point elevation'],
    c15:['electrochemistry','nernst equation','conductance','kohlrausch','galvanic','electrolytic','batteries'],
    c16:['chemical kinetics','rate','order','half life','arrhenius','activation energy','molecularity'],
    c17:['surface chemistry','adsorption','catalysis','colloid','emulsion','tyndall'],
    c18:['p block group 15 16 17 18','nitrogen','oxygen','halogen','noble gas','interhalogen'],
    c19:['d block f block','transition metal','potassium dichromate','permanganate','lanthanide','actinide'],
    c20:['coordination compound','ligand','werner','isomerism','iupac naming','crystal field','chelate'],
    c21:['haloalkane','sn1','sn2','elimination','grignard','nucleophilic substitution'],
    c22:['alcohol','phenol','ether','esterification','acidity','oxidation','williamson'],
    c23:['aldehyde','ketone','carboxylic acid','aldol','cannizzaro','nucleophilic addition','oxidation reduction'],
    c24:['amines','basicity','diazonium','alkylation','acylation','hinsberg'],
    c25:['biomolecules','carbohydrate','protein','nucleic acid','polymer','addition polymer','condensation polymer']
  },
  maths:{
    m1:['sets','relations','functions','domain','range','equivalence relation','one one','onto'],
    m2:['trigonometry','trig functions','compound angle','multiple angle','trig equation','sin cos tan'],
    m3:['complex number','quadratic equation','roots','de moivre','cube root unity','modulus','argument'],
    m4:['linear inequalities','wavy curve','graphical solution','region'],
    m5:['permutation','combination','derangement','factorial','arrangement','selection'],
    m6:['binomial theorem','general term','middle term','binomial coefficient','expansion'],
    m7:['sequence series','ap','gp','hp','am gm hm','sum','sigma','telescoping'],
    m8:['straight line','circle','parabola','ellipse','hyperbola','conic section','tangent','normal','distance'],
    m9:['3d geometry','distance formula','section formula','direction cosine','direction ratio'],
    m10:['limits','derivatives','lhopital','standard limits','differentiation','chain rule'],
    m11:['mathematical reasoning','statistics','mean variance','standard deviation','tautology','statement'],
    m12:['probability','conditional','bayes theorem','random experiment','event','independent'],
    m13:['inverse trigonometric','domain range','principal value','properties','graph'],
    m14:['matrix','determinant','adjoint','inverse','cramer rule','system equations','rank'],
    m15:['continuity','differentiability','implicit differentiation','logarithmic differentiation','second derivative'],
    m16:['applications derivatives','maxima minima','tangent normal','rate of change','increasing decreasing','rolle','mean value'],
    m17:['integrals','integration','substitution','parts','partial fractions','definite integral','area'],
    m18:['area under curve','area between curves','integration application'],
    m19:['differential equation','order degree','separable','homogeneous','linear','bernoulli','integrating factor'],
    m20:['vector algebra','dot product','cross product','scalar triple','addition','collinear'],
    m21:['3d geometry line plane','equation line','shortest distance','equation plane','point plane distance','coplanar'],
    m22:['linear programming','objective function','feasible region','graphical method','corner points'],
    m23:['probability advanced','random variable','binomial distribution','bernoulli','mean variance','distribution']
  }
};

const PYQ_SITES=[
  {name:'SATHEE (IIT Kanpur)',url:'https://sathee.iitk.ac.in/pyqs/jee/chapterwise',icon:'🏛️'},
  {name:'MathonGo',url:'https://www.mathongo.com/iit-jee/jee-main-chapter-wise-questions-with-solutions',icon:'📘'},
  {name:'Cracku',url:'https://cracku.in/jee-chapter-wise-pyq/',icon:'📚'},
  {name:'JEE Archive',url:'https://jee-archive.lovable.app',icon:'🗂️'}
];

function renderPYQ(el){
  el.innerHTML=`
  <div class="pg-hdr anim-up">
    <div class="pg-title">🎯 PYQ Research</div>
    <div class="pg-sub">Analyze patterns, search questions across top PYQ sites, and build your personalized study plan.</div>
  </div>
  <div class="pyq-tabs anim-up d1">
    <button class="pyq-tab ${pyqTab==='pattern'?'on':''}" onclick="pyqSwitchTab('pattern')">📊 Pattern Analyzer</button>
    <button class="pyq-tab ${pyqTab==='search'?'on':''}" onclick="pyqSwitchTab('search')">🔍 PYQ Search</button>
    <button class="pyq-tab ${pyqTab==='planner'?'on':''}" onclick="pyqSwitchTab('planner')">📋 Study Planner</button>
  </div>
  <div id="pyq-tab-content" class="anim-up d2"></div>`;
  pyqRenderTab();
}

function pyqSwitchTab(tab){pyqTab=tab;document.querySelectorAll('.pyq-tab').forEach(t=>t.classList.toggle('on',t.textContent.toLowerCase().includes(tab==='pattern'?'pattern':tab==='search'?'search':'planner')));pyqRenderTab();}

function pyqRenderTab(){
  const c=document.getElementById('pyq-tab-content');if(!c)return;
  if(pyqTab==='pattern')pyqRenderPattern(c);
  else if(pyqTab==='search')pyqRenderSearch(c);
  else pyqRenderPlanner(c);
  setTimeout(()=>pyqRenderMath(c),100);
}

function pyqRenderPattern(el){
  const subjCol={physics:'var(--phys)',chemistry:'var(--chem)',maths:'var(--math)'};
  const subjLbl={physics:'Physics',chemistry:'Chemistry',maths:'Maths'};
  const allYears=PYQ_YEARS;
  const maxCount=Math.max(...Object.values(PYQ_DATA).flatMap(s=>s.flatMap(t=>Object.values(t.years||{}))));
  function heatColor(count){if(!count)return 'var(--glass)';const intensity=count/maxCount;const r=Math.round(59+intensity*190);const g=Math.round(130-intensity*60);const b=Math.round(246-intensity*100);return `rgba(${r},${g},${b},${.15+intensity*.6})`;}
  let html=`<div class="pg-sub" style="margin-bottom:16px;font-size:12px;color:var(--muted)">Topic-wise question distribution across JEE Main papers (2016–2024). Heatmap shows frequency per year.</div>`;
  Object.keys(PYQ_DATA).forEach((subj,si)=>{
    const topics=PYQ_DATA[subj];
    const cols=1+allYears.length+1;
    html+=`<div class="section-block anim-up d${si+1}">
      <div class="section-title" style="color:${subjCol[subj]}">${subjLbl[subj]}</div>
      <div class="gc" style="padding:12px;overflow-x:auto">
        <div class="pyq-heatmap" style="grid-template-columns:140px repeat(${allYears.length},1fr) 60px">
          <div class="pyq-heatmap-label">Topic</div>
          ${allYears.map(y=>`<div class="pyq-heatmap-label">${y}</div>`).join('')}
          <div class="pyq-heatmap-label">Total</div>
          ${topics.slice().sort((a,b)=>b.weight-a.weight).map(topic=>{
              const total=Object.values(topic.years||{}).reduce((a,b)=>a+b,0);
              return `<div class="pyq-heatmap-label" style="text-align:left;font-weight:500;color:var(--txt)">${topic.topic}</div>
              ${allYears.map(y=>`<div class="pyq-heatmap-cell" style="background:${heatColor((topic.years||{})[y]||0)}" title="${topic.topic} ${y}: ${(topic.years||{})[y]||0} Qs">${(topic.years||{})[y]||'-'}</div>`).join('')}
              <div class="pyq-heatmap-cell" style="background:var(--glass2);color:var(--txt)">${total}</div>`;
          }).join('')}
        </div>
      </div>
    </div>`;
  });
  const topTopics=Object.values(PYQ_DATA).flat().sort((a,b)=>b.weight-a.weight).slice(0,5);
  const risingTopics=[];
  Object.values(PYQ_DATA).flat().forEach(t=>{
    const rec=Object.values(t.years||{}).slice(0,3).reduce((a,b)=>a+b,0);
    const old=Object.values(t.years||{}).slice(-3).reduce((a,b)=>a+b,0);
    if(rec>old)risingTopics.push({topic:t.topic,growth:Math.round(((rec-old)/Math.max(old,1))*100)});
  });
  risingTopics.sort((a,b)=>b.growth-a.growth);
  html+=`<div class="section-block anim-up d4">
    <div class="section-title">🔥 Top 5 High-Weightage Topics</div>
    <div class="gc" style="padding:16px 20px">
      ${topTopics.map((t,i)=>`<div style="display:flex;align-items:center;gap:10px;padding:6px 0;${i<topTopics.length-1?'border-bottom:1px solid var(--border)':''}">
        <div style="width:24px;height:24px;border-radius:50%;background:var(--indigo-dim);color:var(--indigo);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700">${i+1}</div>
        <div style="flex:1;font-size:12px;color:var(--txt)">${t.topic}</div>
        <div style="font-size:12px;font-weight:700;color:var(--indigo)">${t.weight}%</div>
        <div style="font-size:10px;color:var(--muted)">~${t.questions} Qs/paper</div>
      </div>`).join('')}
    </div>
  </div>`;
  if(risingTopics.length){
    html+=`<div class="section-block anim-up d5">
      <div class="section-title">📈 Rising Trend (Recent 3 years vs Older 3)</div>
      <div class="gc" style="padding:16px 20px">
        ${risingTopics.slice(0,5).map(t=>`<div style="display:flex;align-items:center;gap:10px;padding:6px 0">
          <div style="flex:1;font-size:12px;color:var(--txt)">${t.topic}</div>
          <div style="font-size:12px;font-weight:700;color:var(--green)">+${t.growth}%</div>
        </div>`).join('')}
      </div>
    </div>`;
  }
  html+=`<div class="section-block anim-up d6">
    <div class="section-title">💡 Strategy Tips</div>
    <div class="gc" style="padding:16px 20px;font-size:12px;color:var(--muted);line-height:1.8">
      <div style="margin-bottom:8px"><b style="color:var(--indigo)">High Priority (60%+ questions):</b></div>
      <div>• Physics: Mechanics + Modern Physics + Magnetism = ~42% of paper</div>
      <div>• Chemistry: Organic > Physical ≈ Inorganic (equal weightage)</div>
      <div>• Maths: Calculus + Algebra = ~50% of paper</div>
      <div style="margin-top:8px"><b style="color:var(--green)">Quick Wins:</b></div>
      <div>• Modern Physics & Semiconductor — scoring with less effort</div>
      <div>• Chemical Bonding & p-Block — high frequency, moderate difficulty</div>
      <div>• Probability & Statistics — guaranteed 1-2 questions, easy prep</div>
    </div>
  </div>`;
  el.innerHTML=html;
}

function pyqEscapeHtml(s){
  if(!s)return'';
  const parts=[];let i=0;
  while(i<s.length){
    if(s[i]==='$'&&s[i+1]==='$'){
      const end=s.indexOf('$$',i+2);
      if(end===-1){parts.push(esc(s.slice(i)));break;}
      parts.push(s.slice(i,end+2));i=end+2;
    }else if(s[i]==='$'){
      const end=s.indexOf('$',i+1);
      if(end===-1){parts.push(esc(s.slice(i)));break;}
      parts.push(s.slice(i,end+1));i=end+1;
    }else{
      let j=i;while(j<s.length&&s[j]!=='$')j++;
      parts.push(esc(s.slice(i,j)));i=j;
    }
  }
  return parts.join('');
}

function pyqRenderSearch(el){
  const subjOpts=[['physics','Physics'],['chemistry','Chemistry'],['maths','Maths']];
  const examOpts=[['mains','JEE Main'],['advanced','JEE Advanced']];
  const settings=dsLoadSettings();
  const hasApi=(settings.provider==='groq'&&settings.openaiKey)||(settings.provider==='ollama');
  const decades=[{label:'2020s',years:[2026,2025,2024,2023,2022,2021,2020]},{label:'2010s',years:[2019,2018,2017,2016,2015,2014,2013,2012,2011,2010]},{label:'2000s',years:[2009,2008,2007,2006,2005,2004,2003,2002]}];
  el.innerHTML=`
  <div class="pg-sub" style="margin-bottom:16px;font-size:12px;color:var(--muted)">AI-powered PYQ research — fetches real JEE Main & Advanced questions from past papers.</div>
  ${!hasApi?'<div style="padding:12px 16px;border-radius:10px;background:rgba(99,102,241,.08);border:1px solid rgba(99,102,241,.15);font-size:12px;margin-bottom:16px;color:var(--txt)"><b style="color:var(--indigo)">⚙️ No AI provider configured.</b> Go to Doubt Solver → Settings and set up Groq (free) or Ollama (local) to use PYQ Search.</div>':''}
  <div class="pyq-filter-row">
    <input class="inp" type="text" id="pyq-s-q" placeholder="e.g. rotational motion, thermodynamics, coordination compounds..." value="${esc(pyqSearchQ)}" style="flex:1;min-width:180px" onkeydown="if(event.key==='Enter')pyqRunSearch()">
    <select id="pyq-s-subj" style="width:110px" onchange="pyqSearchSubj=this.value">${subjOpts.map(([v,l])=>`<option value="${v}" ${v===pyqSearchSubj?'selected':''}>${l}</option>`).join('')}</select>
    <select id="pyq-s-exam" style="width:120px" onchange="pyqSearchExam=this.value">${examOpts.map(([v,l])=>`<option value="${v}" ${v===pyqSearchExam?'selected':''}>${l}</option>`).join('')}</select>
    <div class="pyq-range-wrap" style="width:150px">
      <span style="font-size:11px;color:var(--muted);white-space:nowrap">N: <b id="pyq-s-max-lbl" style="color:var(--txt)">${pyqSearchMax}</b></span>
      <input type="range" min="5" max="30" step="5" value="${pyqSearchMax}" oninput="pyqSearchMax=+this.value;document.getElementById('pyq-s-max-lbl').textContent=this.value">
    </div>
    <button class="btn btn-primary btn-sm" onclick="pyqRunSearch()" ${pyqSearchLoading?'disabled':''}>${pyqSearchLoading?'⏳ Researching...':'🔍 Search'}</button>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:12px">
    <label style="display:flex;align-items:center;gap:5px;font-size:11px;cursor:pointer">
      <input type="checkbox" ${pyqRealOnly?'checked':''} onchange="pyqRealOnly=this.checked" style="accent-color:var(--green)">
      <span style="color:var(--green);font-weight:600">Real PYQ only</span>
    </label>
    <label style="display:flex;align-items:center;gap:5px;font-size:11px;color:var(--muted);cursor:pointer">
      <input type="checkbox" id="pyq-s-mixed" style="accent-color:var(--indigo)"> Mixed
    </label>
    <div style="width:1px;height:16px;background:var(--border);margin:0 2px"></div>
    <span style="font-size:10px;color:var(--faint);font-weight:600">YEARS:</span>
    ${decades.map(d=>`<span style="font-size:9px;color:var(--faint);font-weight:700;letter-spacing:.05em;margin-left:4px">${d.label}</span>
      ${d.years.map(y=>`<button class="pyq-yr-chip ${pyqYearFilter.includes(y)?'on':''}" onclick="pyqToggleYear(${y})">${y}</button>`).join('')}`).join('')}
    ${pyqYearFilter.length?`<button class="btn btn-ghost btn-xs" onclick="pyqYearFilter=[];pyqRenderTab()" style="font-size:9px;padding:2px 8px;color:var(--red)">✕ Clear</button>`:''}
  </div>
  <div id="pyq-s-results">${pyqSearchResults.length?pyqRenderResults():'<div class="pyq-empty"><div class="pyq-empty-icon">📝</div>Enter a topic and click Search to fetch real JEE PYQ questions</div>'}</div>`;
}

function pyqCleanJson(raw){
  let s=raw.replace(/```json\s*/gi,'').replace(/```\s*/g,'').trim();
  const arrStart=s.indexOf('[');
  const arrEnd=s.lastIndexOf(']');
  if(arrStart!==-1&&arrEnd>arrStart)s=s.substring(arrStart,arrEnd+1);
  s=s.replace(/,\s*]/g,']').replace(/,\s*}/g,'}');
  try{return JSON.parse(s);}catch(e){
    try{
      const fixed=s.replace(/"(?:[^"\\]|\\.)*"/g,m=>{
        try{JSON.parse(m);return m;}catch(e2){
          const inner=m.slice(1,-1).replace(/[\x00-\x1f]/g,ch=>ch==='\n'?'\\n':ch==='\r'?'\\r':ch==='\t'?'\\t':'');
          return '"'+inner.replace(/"/g,'\\"')+'"';
        }
      });
      return JSON.parse(fixed);
    }catch(e3){return null;}
  }
}

async function pyqRunSearch(){
  const q=(document.getElementById('pyq-s-q')?.value||'').trim();
  if(!q){toast('⚠️ Enter a search query');return;}
  const settings=dsLoadSettings();
  const hasApi=(settings.provider==='groq'&&settings.openaiKey)||(settings.provider==='ollama');
  if(!hasApi){toast('⚠️ Configure Groq or Ollama in Doubt Solver Settings');dsOpenSettings();return;}
  pyqSearchQ=q;pyqSearchLoading=true;pyqRenderTab();
  const mixed=document.getElementById('pyq-s-mixed')?.checked;
  const examLabel=pyqSearchExam==='mains'?'JEE Main':'JEE Advanced';
  const yearStr=pyqYearFilter.length?' Focus ONLY on questions from these years: '+pyqYearFilter.join(', ')+'.':'';
  const mixedHint=mixed?' Some questions may combine concepts from multiple chapters.':' Each question must be strictly from the given topic.';
  const realHint=pyqRealOnly?' CRITICAL: You MUST ONLY provide ACTUAL real JEE questions that appeared in actual exams. DO NOT create or invent questions. Only output questions you are certain appeared in real JEE papers. If you cannot find enough real questions, output fewer. Include the exact year, session (shift 1/2), and month when known.':' You may also create original JEE-quality questions if real PYQs are insufficient for the topic.';

  const systemMsg=`You are a JEE question researcher. Your ONLY job is to retrieve genuine, actual Previous Year Questions from real JEE Main and JEE Advanced exams (2002-2025).

ABSOLUTE RULES:
1. Output ONLY a valid JSON array. No markdown, no code fences, no explanation text.
2. Use LaTeX for ALL math: $...$ for inline, $$...$$ for display. Use \\frac, \\sqrt, \\int, \\sum etc. with double backslashes in JSON.
3. ONLY output REAL questions from actual JEE exams. NEVER fabricate questions.${pyqRealOnly?' If unsure, skip it.':' If needed, you may create original JEE-quality questions.'}
4. Each question MUST have the actual exam year/source.
5. Escape newlines as \\n inside JSON strings. Escape quotes as \\".

Each object MUST have:
- "q": Full question text with options as (A)...(B)...(C)...(D)... using LaTeX for math
- "a": Correct option letter only (A, B, C, or D)
- "src": Actual exam source, e.g. "JEE Main 2024 Jan 27 Shift 1" or "JEE Advanced 2023 Paper 1"
- "e": 1-2 line explanation of key concept
- NO "d" field (solutions generated on demand)`;

  const userMsg=`Find ${pyqSearchMax} real ${examLabel} PYQ questions on: "${q}" (${pyqSearchSubj}).${yearStr}${mixedHint}${realHint}

Return ONLY a JSON array like:
[{"q":"Question text... (A) $option$ (B) $option$ (C) $option$ (D) $option$","a":"B","src":"JEE Main 2024 Apr 8 Shift 2","e":"Key concept explanation"}]

Output ONLY the JSON array.`;

  try{
    let content;
    const tryGroq=async()=>{
      const base=(settings.apiBase||'https://api.groq.com/openai/v1').replace(/\/+$/,'');
      const resp=await fetch(base+'/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+settings.openaiKey},body:JSON.stringify({model:settings.openaiModel||'llama-3.3-70b-versatile',messages:[{role:'system',content:systemMsg},{role:'user',content:userMsg}],max_tokens:8192,temperature:0.15})});
      if(!resp.ok){const errBody=await resp.text().catch(()=>'');throw new Error('API error '+resp.status+': '+errBody.slice(0,200));}
      const j=await resp.json();
      return j.choices?.[0]?.message?.content||'';
    };
    const tryOllama=async()=>{
      const ollamaUrl=(settings.ollamaUrl||'http://localhost:11434').replace(/\/+$/,'');
      const resp=await fetch(ollamaUrl+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:settings.ollamaModel||'qwen2.5:3b',messages:[{role:'system',content:systemMsg},{role:'user',content:userMsg}],stream:false,options:{num_predict:8192}})});
      if(!resp.ok)throw new Error('Ollama error: '+resp.status);
      const j=await resp.json();
      return j.message?.content||'';
    };
    if(settings.provider==='ollama'){
      content=await tryOllama();
    }else{
      try{
        content=await tryGroq();
      }catch(groqErr){
        const m=(groqErr.message||'').toLowerCase();
        if(m.includes('429')||m.includes('rate')||m.includes('limit')||m.includes('quota')||m.includes('tokens per')){
          toast('⚡ Groq limit hit — retrying with Ollama...');
          content=await tryOllama();
        }else throw groqErr;
      }
    }
    const questions=pyqCleanJson(content);
    if(!questions||!Array.isArray(questions)||!questions.length)throw new Error('AI returned invalid data. Try again.');
    pyqSearchResults=questions.slice(0,pyqSearchMax).map((q,i)=>({
      num:i+1,
      text:q.q||q.question||'Question',
      answer:q.a||q.answer||'',
      source:q.src||q.source||'Unknown',
      explanation:q.e||q.explanation||'',
      _rawQ:q
    }));
  }catch(e){
    pyqSearchResults=[{num:1,text:'Failed to generate questions: '+e.message,answer:'',explanation:'',source:'Error',isError:true}];
  }
  pyqSearchLoading=false;pyqRenderTab();
}

async function pyqFetchSolution(idx){
  const r=pyqSearchResults[idx];
  if(!r)return;
  const settings=dsLoadSettings();
  const hasApi=(settings.provider==='groq'&&settings.openaiKey)||(settings.provider==='ollama');
  if(!hasApi){dsOpenSettings();return;}
  const solEl=document.getElementById('pyq-sol-'+idx);
  if(!solEl)return;
  solEl.innerHTML='<div style="color:var(--indigo);font-size:11px">⏳ Generating detailed solution...</div>';
  solEl.classList.add('show');
  const systemMsg='You are a JEE expert tutor. Provide a detailed, step-by-step solution. Use LaTeX ($...$ and $$...$$) for ALL math. Be thorough but clear. Include: 1) What the question is asking 2) Key concepts/formulas needed 3) Step-by-step derivation/calculation 4) Final answer verification.';
  const userMsg='Provide a detailed step-by-step solution for this JEE question:\n\n'+r.text+'\n\nCorrect Answer: '+r.answer+'\n\nGive a thorough solution suitable for a JEE aspirant.';
  try{
    let content;
    const tryGroq=async()=>{
      const base=(settings.apiBase||'https://api.groq.com/openai/v1').replace(/\/+$/,'');
      const resp=await fetch(base+'/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+settings.openaiKey},body:JSON.stringify({model:settings.openaiModel||'llama-3.3-70b-versatile',messages:[{role:'system',content:systemMsg},{role:'user',content:userMsg}],max_tokens:4096,temperature:0.2})});
      if(!resp.ok)throw new Error('API error '+resp.status);
      const j=await resp.json();
      return j.choices?.[0]?.message?.content||'No solution generated.';
    };
    const tryOllama=async()=>{
      const ollamaUrl=(settings.ollamaUrl||'http://localhost:11434').replace(/\/+$/,'');
      const resp=await fetch(ollamaUrl+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:settings.ollamaModel||'qwen2.5:3b',messages:[{role:'system',content:systemMsg},{role:'user',content:userMsg}],stream:false,options:{num_predict:4096}})});
      if(!resp.ok)throw new Error('Ollama error');
      const j=await resp.json();
      return j.message?.content||'No solution generated.';
    };
    if(settings.provider==='ollama'){
      content=await tryOllama();
    }else{
      try{
        content=await tryGroq();
      }catch(groqErr){
        const m=(groqErr.message||'').toLowerCase();
        if(m.includes('429')||m.includes('rate')||m.includes('limit')||m.includes('quota')||m.includes('tokens per')){
          toast('⚡ Groq limit — using Ollama for solution...');
          content=await tryOllama();
        }else throw groqErr;
      }
    }
    solEl.innerHTML='<div style="font-weight:700;color:var(--indigo);margin-bottom:8px">📝 Detailed Solution</div><div style="white-space:pre-line;line-height:1.7">'+pyqEscapeHtml(content)+'</div>';
    pyqRenderMath(solEl);
  }catch(e){
    solEl.innerHTML='<div style="color:var(--red);font-size:11px">Failed to generate solution: '+esc(e.message)+'</div>';
  }
}

function pyqToggleYear(y){
  const idx=pyqYearFilter.indexOf(y);
  if(idx===-1)pyqYearFilter.push(y);else pyqYearFilter.splice(idx,1);
  pyqRenderTab();
}

function pyqRenderImages(text){
  if(!text)return'';
  text=text.replace(/\[image[:\s]*(https?:\/\/[^\]]+)\]/gi,'<img src="$1" class="pyq-q-img" loading="lazy" onclick="window.open(this.src)" alt="Question image">');
  text=text.replace(/(https?:\/\/[^\s<>"']+\.(?:png|jpg|jpeg|gif|webp|svg))/gi,'<img src="$1" class="pyq-q-img" loading="lazy" onclick="window.open(this.src)" alt="Question image">');
  return text;
}

function pyqRenderMath(el){
  if(window.renderMathInElement){
    try{renderMathInElement(el,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}],throwOnError:false});}catch(e){}
  }
}

function pyqRenderResults(){
  if(!pyqSearchResults.length)return '<div class="pyq-empty"><div class="pyq-empty-icon">📭</div>No results found. Try different keywords or year filter.</div>';
  return pyqSearchResults.map((r,i)=>{
    if(r.isError){
      return `<div class="pyq-q-card" style="border-color:rgba(239,68,68,.3)">
        <div class="pyq-q-num" style="color:var(--red)">❌ Error</div>
        <div class="pyq-q-text" style="color:var(--red)">${esc(r.text)}</div>
      </div>`;
    }
    const uid='pyq-ans-'+i;
    const solUid='pyq-sol-'+i;
    const srcLabel=r.source||'Unknown';
    const isRealPyq=srcLabel.toLowerCase().includes('jee');
    const srcBg=isRealPyq?'rgba(16,185,129,.12)':'rgba(99,102,241,.12)';
    const srcClr=isRealPyq?'var(--green)':'var(--indigo)';
    return `<div class="pyq-q-card">
      <div class="pyq-q-num">Q${r.num||i+1}</div>
      <div class="pyq-q-text pyq-q-text-rendered">${pyqRenderImages(pyqEscapeHtml(r.text))}</div>
      <div class="pyq-q-meta">
        <span class="pyq-q-tag" style="background:${srcBg};color:${srcClr}">${esc(srcLabel)}</span>
      </div>
      <div class="pyq-q-actions">
        <button class="btn btn-ghost btn-xs" onclick="const a=document.getElementById('${uid}');a.classList.toggle('show');this.textContent=a.classList.contains('show')?'🙈 Hide':'👁️ View Answer'">👁️ View Answer</button>
        <button class="btn btn-ghost btn-xs" onclick="const a=document.getElementById('${solUid}');if(!a.dataset.loaded){a.dataset.loaded='1';pyqFetchSolution(${i})}else{a.classList.toggle('show')}">📝 Detailed Solution</button>
        <div class="pyq-q-solution" id="${uid}">
          <div style="margin-bottom:6px"><b style="color:var(--green)">✅ Answer: ${esc(r.answer||'—')}</b></div>
          ${r.explanation?`<div>${pyqEscapeHtml(r.explanation)}</div>`:''}
        </div>
        <div class="pyq-q-solution" id="${solUid}"></div>
      </div>
    </div>`;
  }).join('');
}

function pyqRenderPlanner(el){
  const weakChapters=[];
  ['physics','chemistry','maths'].forEach(subj=>{
    (DB.chapters[subj]||[]).forEach(ch=>{
      if(ch.strength==='weak'||ch.strength==='uncovered')weakChapters.push({subj,name:ch.name,id:ch.id});
    });
  });
  el.innerHTML=`
  <div class="pg-sub" style="margin-bottom:16px;font-size:12px;color:var(--muted)">Select your weak chapters and set exam date to get a personalized PYQ study plan weighted by topic frequency.</div>
  <div class="section-block">
    <div class="gc" style="padding:20px">
      <div style="display:flex;flex-wrap:wrap;gap:16px;margin-bottom:20px">
        <div style="flex:1;min-width:140px;max-width:200px">
          <label style="font-size:11px;color:var(--muted);display:block;margin-bottom:4px">Days until exam</label>
          <input class="inp" type="number" id="pyq-p-days" value="${pyqPlannerDays}" min="1" max="365" style="width:100%">
        </div>
        <div style="flex:1;min-width:140px;max-width:200px">
          <label style="font-size:11px;color:var(--muted);display:block;margin-bottom:4px">Exam type</label>
          <select id="pyq-p-exam" class="inp" style="width:100%;background:var(--surface);color:var(--txt);border:1px solid var(--border)">
            <option value="mains">JEE Main</option>
            <option value="advanced">JEE Advanced</option>
          </select>
        </div>
      </div>
      <div style="margin-bottom:20px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <label style="font-size:11px;color:var(--muted)">Weak chapters (auto-detected from progress)</label>
          ${weakChapters.length?`<button class="btn btn-ghost btn-xs" onclick="document.querySelectorAll('.pyq-p-chk').forEach(c=>c.checked=true)">Select All</button>`:''}
        </div>
        <div id="pyq-p-weak" style="display:flex;flex-wrap:wrap;gap:6px">
          ${weakChapters.length?weakChapters.map(ch=>{
            const col=ch.subj==='physics'?'var(--phys)':ch.subj==='chemistry'?'var(--chem)':'var(--math)';
            return `<label style="display:flex;align-items:center;gap:4px;font-size:11px;padding:4px 8px;border-radius:6px;border:1px solid ${col}33;background:${col}11;color:${col};cursor:pointer">
              <input type="checkbox" class="pyq-p-chk" value="${ch.id}" data-subj="${ch.subj}" style="accent-color:${col}">
              ${ch.name}
            </label>`;
          }).join(''):'<div style="font-size:12px;color:var(--muted)">No weak chapters found. Mark chapters as weak in the Chapters page first.</div>'}
        </div>
      </div>
      <button class="btn btn-primary btn-sm" onclick="pyqGeneratePlan()" ${!weakChapters.length?'disabled':''}>📋 Generate Study Plan</button>
    </div>
  </div>
  <div id="pyq-p-result" style="margin-top:16px">${pyqRenderPlannerResult()}</div>`;
}

function pyqRenderPlannerResult(){
  if(!pyqPlannerPlan)return '';
  const plan=pyqPlannerPlan;
  return `<div class="section-block anim-up d1">
    <div class="section-title">📋 Your ${plan.days}-Day PYQ Study Plan</div>
    <div class="gc" style="padding:16px 20px">
      <div style="display:flex;gap:16px;margin-bottom:16px;flex-wrap:wrap">
        <div style="font-size:12px"><span style="color:var(--muted)">Total Topics:</span> <b style="color:var(--txt)">${plan.totalTopics}</b></div>
        <div style="font-size:12px"><span style="color:var(--muted)">Topics/Day:</span> <b style="color:var(--txt)">${plan.topicsPerDay}</b></div>
        <div style="font-size:12px"><span style="color:var(--muted)">Focus:</span> <b style="color:var(--indigo)">High-frequency topics first</b></div>
      </div>
      ${plan.daysList.map(d=>`<div class="pyq-planner-day">
        <div class="pyq-planner-day-head">
          <div class="pyq-planner-day-title">Day ${d.day} ${d.day<=7?'⚡':d.day<=14?'🔥':'📅'}</div>
          <div style="font-size:11px;color:var(--muted)">${d.topics.length} topics</div>
        </div>
        ${d.topics.map(t=>`<div class="pyq-planner-day-topic">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${t.col};margin-right:6px"></span>
          ${t.name} <span style="font-size:10px;color:var(--muted)">(${t.weight}% weightage)</span>
        </div>`).join('')}
        <div class="pyq-planner-day-info">Recommended: Solve ${Math.max(5,d.topics.length*3)} PYQs from these topics</div>
      </div>`).join('')}
    </div>
  </div>`;
}

function pyqGeneratePlan(){
  const days=parseInt(document.getElementById('pyq-p-days')?.value)||30;
  const exam=document.getElementById('pyq-p-exam')?.value||'mains';
  const checked=[...document.querySelectorAll('.pyq-p-chk:checked')].map(c=>({id:c.value,subj:c.dataset.subj}));
  if(!checked.length){toast('⚠️ Select at least one weak chapter');return;}
  const allTopics=[];
  checked.forEach(ch=>{
    const chData=(DB.chapters[ch.subj]||[]).find(c=>c.id===ch.id);
    const pyqTopics=(PYQ_DATA[ch.subj]||[]).map(t=>({...t,subj:ch.subj}));
    if(chData){
      chData.subTopics?.forEach(st=>{
        const matching=pyqTopics.find(pt=>pt.topic.toLowerCase().includes(st.name.toLowerCase().split(' ')[0])||st.name.toLowerCase().includes(pt.topic.toLowerCase().split(' ')[0]));
        allTopics.push({name:`${chData.name} — ${st.name}`,weight:matching?.weight||5,col:ch.subj==='physics'?'var(--phys)':ch.subj==='chemistry'?'var(--chem)':'var(--math)'});
      });
    }
  });
  if(!allTopics.length){
    checked.forEach(ch=>{
      const pyqTopics=(PYQ_DATA[ch.subj]||[]).map(t=>({...t,subj:ch.subj}));
      pyqTopics.forEach(t=>allTopics.push({name:`${t.topic}`,weight:t.weight,col:ch.subj==='physics'?'var(--phys)':ch.subj==='chemistry'?'var(--chem)':'var(--math)'}));
    });
  }
  allTopics.sort((a,b)=>b.weight-a.weight);
  const topicsPerDay=Math.max(1,Math.ceil(allTopics.length/days));
  const daysList=[];
  for(let i=0;i<Math.min(days,Math.ceil(allTopics.length/topicsPerDay));i++){
    daysList.push({day:i+1,topics:allTopics.slice(i*topicsPerDay,(i+1)*topicsPerDay)});
  }
  pyqPlannerDays=days;
  pyqPlannerPlan={days:daysList.length,totalTopics:allTopics.length,topicsPerDay,daysList};
  pyqRenderTab();
  toast('✅ Study plan generated!');
}