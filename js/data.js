// js/data.js
import { toast } from './helpers.js';
/* ═══════════════ DATA & PERSISTENCE ═══════════════ */
export const KEYS={ch:'jeehq3_ch',asn:'jeehq3_asn',tst:'jeehq3_tst',tab:'jeehq3_tab',mt:'jeehq3_mt',dsSettings:'jeehq3_ds_settings',prepChat:'jeehq3_prep',calc:'jeehq3_calc',cm:'jeehq3_cm'};
export const ONE_SHOT_LINKS={
  physics:{teacher:'Saleem Sir',pw:'https://youtube.com/@PW-JEEWallah'},
  chemistry:{teacher:'Amit Sir',pw:'https://youtube.com/@PW-JEEWallah'},
  maths:{teacher:'Sachin Sir',pw:'https://youtube.com/@PW-JEEWallah'}
};
export function oneShotURL(subj,id,name){
  const subjCfg=ONE_SHOT_LINKS[subj];
  if(!subjCfg)return null;
  return subjCfg[id]||'https://youtube.com/results?search_query='+encodeURIComponent('JEE '+name+' One Shot '+subjCfg.teacher);
}
export const DB={chapters:null,assignments:null,tests:null,mockTests:null,prepChat:null,calculator:null,customTests:null};
export function load(){
  try{DB.chapters=JSON.parse(localStorage.getItem(KEYS.ch))||null;}catch(e){DB.chapters=null;}
  if(!DB.chapters)DB.chapters=defaultChapters();
  try{DB.assignments=JSON.parse(localStorage.getItem(KEYS.asn))||null;}catch(e){DB.assignments=null;}
  if(!DB.assignments)DB.assignments=defaultAssignments();
  try{DB.tests=JSON.parse(localStorage.getItem(KEYS.tst))||null;}catch(e){DB.tests=null;}
  if(!DB.tests)DB.tests=defaultTests();
  try{DB.mockTests=JSON.parse(localStorage.getItem(KEYS.mt))||[];}catch(e){DB.mockTests=[];}
  try{DB.prepChat=JSON.parse(localStorage.getItem(KEYS.prepChat))||null;}catch(e){DB.prepChat=null;}
  if(!DB.prepChat)DB.prepChat={messages:[],notes:[],createdAt:null,updatedAt:null};
  try{DB.calculator=JSON.parse(localStorage.getItem(KEYS.calc))||null;}catch(e){DB.calculator=null;}
  try{DB.customTests=JSON.parse(localStorage.getItem(KEYS.cm))||[];}catch(e){DB.customTests=[];}
}
export const LS_SAFE_BUDGET=4*1024*1024;
export function usesCloudStorage(){return !!(window.supaClient&&window.supaConfig&&window.currentSyncKey);}
export function lsBytesUsed(){
  let n=0;
  for(let i=0;i<localStorage.length;i++)n+=(localStorage.getItem(localStorage.key(i))||'').length*2;
  return n;
}
export const LS_HARD_LIMIT=5*1024*1024;
export function sv(key,opts){
  opts=opts||{};
  const m={chapters:KEYS.ch,assignments:KEYS.asn,tests:KEYS.tst,mockTests:KEYS.mt,prepChat:KEYS.prepChat,calculator:KEYS.calc,customTests:KEYS.cm};
  const lsKey=m[key];
  if(!lsKey)return false;
  let serialized;
  try{serialized=JSON.stringify(DB[key]);}catch(e){console.error('Serialization failed for key:',key,e);toast('⚠️ Failed to save data — possible corruption');return false;}
  if(!opts.skipBudgetCheck&&!usesCloudStorage()){
    const prev=(localStorage.getItem(lsKey)||'').length*2;
    const projected=lsBytesUsed()-prev+serialized.length*2;
    if(projected>LS_HARD_LIMIT){
      toast('⚠️ Storage completely full. Export data, clear attachments, or enable cloud sync.');
      return false;
    }
    if(projected>LS_SAFE_BUDGET){
      toast('⚠️ Storage nearly full — set up Supabase sync or remove large attachments');
      return false;
    }
  }
  try{localStorage.setItem(lsKey,serialized);}
  catch(e){
    const quota=e&&(e.name==='QuotaExceededError'||e.code===22);
    if(quota){
      toast('⚠️ Storage full — try Export as backup, clear old attachments, or enable cloud sync');
      console.warn('QuotaExceededError for key:',lsKey,'size:',serialized.length);
    }else{
      toast('⚠️ Could not save data');
    }
    return false;
  }
  if(!opts.skipAutoSync){
    if(window.supaClient&&window.supaConfig&&window.currentSyncKey)window.autoSync();
    else window.enqueueSync();
  }
  return true;
}
export function persistAllLocal(opts){
  ['chapters','assignments','tests','mockTests','prepChat','calculator','customTests'].forEach(k=>sv(k,Object.assign({skipAutoSync:true},opts||{})));
}
export function resetEphemeralUiState(){
  window.pendingAFiles=[];window.pendingTFiles=[];
}

/* ═══════════════ DEFAULT DATA (WITH FULL SUBTOPICS) ═══════════════ */
export function mkCh(id,name,subTopics){return{id,name,completed:false,strength:'uncovered',mainsPyqDone:false,advPyqDone:false,notes:{detailed:[],revision:[]},subTopics:subTopics||[]};}
export function st(prefix, names){return names.map((n,i)=>({id:prefix+'s'+(i+1),name:n,completed:false}));}
export function defaultChapters(){return{
  physics:[
    mkCh('p1','Physical World, Units & Measurements',st('p1',['Units','Dimensions','Error Analysis','Significant Figures','Measuring Instruments'])),
    mkCh('p2','Motion in a Straight Line',st('p2',['Distance & Displacement','Average Velocity','Kinematic Equations','Graphs','Relative Motion in 1D'])),
    mkCh('p3','Motion in a Plane',st('p3',['Vectors','Projectile Motion','Relative Motion in 2D','Uniform Circular Motion'])),
    mkCh('p4','Laws of Motion',st('p4',['Newton\'s Laws','Momentum Conservation','Friction','Dynamics of Circular Motion'])),
    mkCh('p5','Work, Energy & Power',st('p5',['Work Done','Kinetic & Potential Energy','Work-Energy Theorem','Power','Collisions'])),
    mkCh('p6','System of Particles & Rotational Motion',st('p6',['Centre of Mass','Moment of Inertia','Torque & Angular Momentum','Rolling Motion','Rotational KE'])),
    mkCh('p7','Gravitation',st('p7',['Kepler\'s Laws','Law of Gravitation','Acceleration Due to Gravity','Gravitational Potential','Escape & Orbital Velocity'])),
    mkCh('p8','Mechanical Properties of Solids',st('p8',['Elasticity','Stress-Strain Curve','Hooke\'s Law','Young\'s, Bulk & Shear Moduli'])),
    mkCh('p9','Thermal Properties of Matter',st('p9',['Thermal Expansion','Calorimetry','Conduction, Convection, Radiation','Newton\'s Law of Cooling'])),
    mkCh('p10','Thermodynamics',st('p10',['Zeroth Law','First Law & Processes','Second Law','Carnot Engine & Refrigerators'])),
    mkCh('p11','Kinetic Theory',st('p11',['Ideal Gas Equation','Postulates of KTG','RMS & Average Speeds','Equipartition of Energy'])),
    mkCh('p12','Oscillations & Waves',st('p12',['SHM Kinematics','Energy in SHM','Wave Equation','Standing Waves','Beats & Doppler Effect'])),
    mkCh('p13','Electric Charges & Fields',st('p13',['Coulomb\'s Law','Electric Field & Lines','Electric Flux & Gauss\'s Law','Electric Dipole'])),
    mkCh('p14','Electrostatic Potential & Capacitance',st('p14',['Electric Potential','Equipotential Surfaces','Potential Energy','Capacitance','Dielectrics'])),
    mkCh('p15','Current Electricity',st('p15',['Ohm\'s Law & Drift Velocity','Resistors in Series/Parallel','Kirchhoff\'s Laws','Cells & EMF','Measuring Instruments'])),
    mkCh('p16','Moving Charges & Magnetism',st('p16',['Magnetic Force','Biot-Savart Law','Ampere\'s Law','Solenoids & Toroids','Moving Coil Galvanometer'])),
    mkCh('p17','Electromagnetic Induction',st('p17',['Magnetic Flux','Faraday\'s & Lenz\'s Law','Motional EMF','Self & Mutual Inductance','Eddy Currents'])),
    mkCh('p18','Alternating Current',st('p18',['AC Voltage & Current','Phasors','LCR Series Circuit','Power in AC','Transformers & Resonance'])),
    mkCh('p19','Electromagnetic Waves',st('p19',['Displacement Current','EM Spectrum','Properties of EM Waves'])),
    mkCh('p20','Ray Optics & Optical Instruments',st('p20',['Reflection & Mirrors','Refraction & TIR','Lenses & Lens Maker\'s','Prisms','Optical Instruments'])),
    mkCh('p21','Wave Optics',st('p21',['Huygens Principle','Interference & YDSE','Diffraction','Polarization'])),
    mkCh('p22','Dual Nature of Radiation & Matter',st('p22',['Photoelectric Effect','Einstein\'s Equation','Matter Waves (De Broglie)','Davisson-Germer'])),
    mkCh('p23','Atoms & Nuclei',st('p23',['Alpha Particle Scattering','Bohr Model & Energy Levels','X-Rays','Binding Energy & Mass Defect','Radioactivity'])),
    mkCh('p24','Semiconductor Electronics',st('p24',['Energy Bands','P-N Junction Diode','Rectifiers','Transistors & Logic Gates'])),
    mkCh('p25','Communication Systems',st('p25',['Bandwidth','Modulation','Amplitude Modulation']))
  ],
  chemistry:[
    mkCh('c1','Some Basic Concepts of Chemistry',st('c1',['Mole Concept','Atomic & Molecular Masses','Stoichiometry & Limiting Reagent','Concentration Terms'])),
    mkCh('c2','Structure of Atom',st('c2',['Subatomic Particles','Bohr\'s Model','Quantum Mechanical Model','Quantum Numbers','Electronic Configuration'])),
    mkCh('c3','Classification of Elements',st('c3',['Modern Periodic Law','Blocks (S, P, D, F)','Atomic/Ionic Radii','Ionization & Electron Gain Enthalpy','Electronegativity'])),
    mkCh('c4','Chemical Bonding & Molecular Structure',st('c4',['Ionic & Covalent Bonds','VSEPR Theory','Valence Bond Theory & Hybridization','Molecular Orbital Theory','Hydrogen Bonding'])),
    mkCh('c5','States of Matter',st('c5',['Intermolecular Forces','Gas Laws','Ideal Gas Equation','Kinetic Molecular Theory','Real Gases'])),
    mkCh('c6','Thermodynamics',st('c6',['First Law of Thermodynamics','Enthalpy & Heat Capacity','Hess\'s Law','Entropy & Second Law','Gibbs Free Energy'])),
    mkCh('c7','Equilibrium',st('c7',['Dynamic Equilibrium','Equilibrium Constant (Kp, Kc)','Le Chatelier\'s Principle','Acids, Bases & Salts','pH & Buffers'])),
    mkCh('c8','Redox Reactions',st('c8',['Oxidation & Reduction','Oxidation Number','Balancing Redox Reactions','Electrochemical Cells Basics'])),
    mkCh('c9','Hydrogen & s-Block Elements',st('c9',['Isotopes of Hydrogen','Hydrides, Water & Heavy Water','Alkali Metals','Alkaline Earth Metals'])),
    mkCh('c10','p-Block Elements (I)',st('c10',['Group 13 Elements','Group 14 Elements','Important Compounds (Borax, Silicates)'])),
    mkCh('c11','Organic Chemistry — Basics',st('c11',['IUPAC Nomenclature','Isomerism','Inductive & Electromeric Effects','Resonance & Hyperconjugation'])),
    mkCh('c12','Hydrocarbons',st('c12',['Alkanes','Alkenes','Alkynes','Aromatic Hydrocarbons','Electrophilic Substitution'])),
    mkCh('c13','The Solid State',st('c13',['Crystalline & Amorphous','Unit Cells & Packing','Voids & Point Defects','Electrical & Magnetic Properties'])),
    mkCh('c14','Solutions',st('c14',['Types of Solutions','Raoult\'s Law','Ideal & Non-Ideal Solutions','Colligative Properties','Van\'t Hoff Factor'])),
    mkCh('c15','Electrochemistry',st('c15',['Electrolytic & Galvanic Cells','Nernst Equation','Conductance & Kohlrausch\'s Law','Batteries & Corrosion'])),
    mkCh('c16','Chemical Kinetics',st('c16',['Rate of Reaction','Order & Molecularity','Integrated Rate Equations','Half-Life','Arrhenius Equation'])),
    mkCh('c17','Surface Chemistry',st('c17',['Adsorption','Catalysis','Colloids & Emulsions'])),
    mkCh('c18','p-Block Elements (II)',st('c18',['Group 15 Elements','Group 16 Elements','Group 17 Elements','Group 18 Elements'])),
    mkCh('c19','d- and f-Block Elements',st('c19',['Transition Elements Properties','Potassium Dichromate & Permanganate','Lanthanides & Actinides'])),
    mkCh('c20','Coordination Compounds',st('c20',['Ligands & Coordination Number','Werner\'s Theory & IUPAC','Isomerism','Valence Bond Theory','Crystal Field Theory'])),
    mkCh('c21','Haloalkanes & Haloarenes',st('c21',['Classification & Prep','SN1 & SN2 Mechanisms','Elimination Reactions','Aryl Halides'])),
    mkCh('c22','Alcohols, Phenols & Ethers',st('c22',['Preparation of Alcohols/Phenols','Properties & Acidity','Esterification & Oxidation','Ethers Prep & Cleavage'])),
    mkCh('c23','Aldehydes, Ketones & Carboxylic Acids',st('c23',['Preparation','Nucleophilic Addition','Oxidation & Reduction','Aldol & Cannizzaro','Carboxylic Acids'])),
    mkCh('c24','Amines',st('c24',['Preparation of Amines','Basic Character','Alkylation & Acylation','Diazonium Salts'])),
    mkCh('c25','Biomolecules & Polymers',st('c25',['Carbohydrates','Proteins & Amino Acids','Nucleic Acids','Classification of Polymers','Addition & Condensation'])),
  ],
  maths:[
    mkCh('m1','Sets, Relations & Functions',st('m1',['Sets & Operations','Types of Relations','Equivalence Relations','Functions (One-One, Onto)','Composite & Inverse'])),
    mkCh('m2','Trigonometric Functions',st('m2',['Trig Functions & Graphs','Compound Angles','Multiple & Submultiple Angles','Trig Equations','Properties of Triangles'])),
    mkCh('m3','Complex Numbers & Quadratic Equations',st('m3',['Algebra of Complex Numbers','Polar Form & De Moivre','Cube Roots of Unity','Quadratic Equations (Roots, Nature)'])),
    mkCh('m4','Linear Inequalities',st('m4',['Linear Inequalities','Graphical Solutions','Wavy Curve Method'])),
    mkCh('m5','Permutations & Combinations',st('m5',['Fundamental Principle','Permutations (Linear & Circular)','Combinations','Derangements'])),
    mkCh('m6','Binomial Theorem',st('m6',['Expansion for Positive Integral Index','General & Middle Terms','Properties of Binomial Coefficients','Binomial for any Index'])),
    mkCh('m7','Sequences & Series',st('m7',['Arithmetic Progression (AP)','Geometric Progression (GP)','Harmonic Progression (HP)','AM-GM-HM Inequality','Special Series'])),
    mkCh('m8','Straight Lines & Conic Sections',st('m8',['Forms of Line & Distance','Circles (Standard, Tangents)','Parabola','Ellipse','Hyperbola'])),
    mkCh('m9','3D Geometry Basics',st('m9',['Distance & Section Formula in 3D','Direction Cosines & Ratios'])),
    mkCh('m10','Limits & Derivatives',st('m10',['Algebra of Limits','Standard Limits & L\'Hopital\'s Rule','Derivatives of Polynomials','Derivatives of Trig Functions'])),
    mkCh('m11','Mathematical Reasoning & Statistics',st('m11',['Statements & Connectives','Tautology & Fallacy','Mean & Variance','Standard Deviation'])),
    mkCh('m12','Probability (Basics)',st('m12',['Random Experiments & Events','Axiomatic Probability','Conditional Probability','Bayes\' Theorem'])),
    mkCh('m13','Inverse Trigonometric Functions',st('m13',['Domain & Range of ITF','Principal Value Branches','Properties of ITF','Graphs'])),
    mkCh('m14','Matrices & Determinants',st('m14',['Types & Operations','Determinant Properties','Adjoint & Inverse','System of Linear Equations (Cramer)'])),
    mkCh('m15','Continuity & Differentiability',st('m15',['Continuity at Point/Interval','Differentiability','Chain Rule & Implicit','Logarithmic Differentiation','Second Order Derivative'])),
    mkCh('m16','Applications of Derivatives',st('m16',['Rate of Change','Increasing & Decreasing Functions','Tangents & Normals','Maxima & Minima','Rolle\'s & Mean Value Theorems'])),
    mkCh('m17','Integrals',st('m17',['Standard Integrals','Integration by Substitution','Integration by Parts','Partial Fractions','Definite Integrals Properties'])),
    mkCh('m18','Applications of Integrals',st('m18',['Area under Simple Curves','Area between Two Curves'])),
    mkCh('m19','Differential Equations',st('m19',['Order & Degree','Variable Separable Form','Homogeneous Diff Equations','Linear Diff Equations'])),
    mkCh('m20','Vector Algebra',st('m20',['Addition & Scalar Multiplication','Dot (Scalar) Product','Cross (Vector) Product','Scalar Triple Product'])),
    mkCh('m21','Three Dimensional Geometry',st('m21',['Equation of Line in 3D','Shortest Distance between Lines','Equation of Plane','Distance of a Point from Plane'])),
    mkCh('m22','Linear Programming',st('m22',['Objective Function & Constraints','Graphical Method of Solution','Feasible & Optimal Regions'])),
    mkCh('m23','Probability (Advanced)',st('m23',['Random Variables & Distributions','Mean & Variance','Bernoulli Trials','Binomial Distribution'])),
  ]
 };}
export function defaultAssignments(){return[
  {id:'a1',title:'Physics DPP — Rotational Motion',description:'Solve all 25 problems.',priority:'high',completed:false,attachments:[],createdAt:new Date(Date.now()-86400000).toISOString()},
];}
export function defaultTests(){return[
  {id:'t1',name:'Full Mock Test #1',date:new Date(Date.now()-604800000).toISOString(),physics:{correct:18,incorrect:5,unattempted:2},chemistry:{correct:20,incorrect:3,unattempted:2},maths:{correct:15,incorrect:7,unattempted:3},totalScore:197,maxScore:300,papers:[],timing:{total:175,physics:55,chemistry:45,maths:75},syllabus:{physics:['p1','p2','p3'],chemistry:['c1','c2'],maths:['m1','m2']}}
];}
export function findCh(subj,id){return DB.chapters[subj]?.find(c=>c.id===id);}

window.KEYS=KEYS;window.DB=DB;window.sv=sv;
window.usesCloudStorage=usesCloudStorage;window.lsBytesUsed=lsBytesUsed;
window.LS_HARD_LIMIT=LS_HARD_LIMIT;window.LS_SAFE_BUDGET=LS_SAFE_BUDGET;
window.ONE_SHOT_LINKS=ONE_SHOT_LINKS;window.oneShotURL=oneShotURL;
window.defaultChapters=defaultChapters;window.defaultAssignments=defaultAssignments;
window.defaultTests=defaultTests;window.mkCh=mkCh;window.findCh=findCh;
window.persistAllLocal=persistAllLocal;window.resetEphemeralUiState=resetEphemeralUiState;
