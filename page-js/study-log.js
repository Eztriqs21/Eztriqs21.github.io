// page-js/study-log.js
import { DB, sv } from '../js/data.js';
import { cm, om, toast } from '../js/helpers.js';
function openStudyLog(){document.getElementById('sl-date').value=new Date().toISOString().split('T')[0];om('m-study-log');setTimeout(()=>document.getElementById('sl-topic').focus(),320);}
function saveStudyLog(){
  const topic=document.getElementById('sl-topic').value.trim();if(!topic){toast('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Enter a topic');return;}
  let dur=parseFloat(document.getElementById('sl-dur').value);if(!dur||dur<=0){toast('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Enter duration');return;}
  if(!DB.studyLogs)DB.studyLogs=[];
  dur=Math.round(dur*10)/10;
  DB.studyLogs.unshift({id:'sl_'+Date.now(),subject:document.getElementById('sl-subj').value,topic,duration:dur,date:document.getElementById('sl-date').value||new Date().toISOString().split('T')[0],createdAt:new Date().toISOString()});
  sv('studyLogs');cm('m-study-log');if(window.PAGE==='dashboard')window.renderDashboard(document.getElementById('content-wrap'));toast('<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Session logged!');
}
function deleteStudyLog(id){DB.studyLogs=DB.studyLogs.filter(l=>l.id!==id);sv('studyLogs');if(window.PAGE==='dashboard')window.renderDashboard(document.getElementById('content-wrap'));else if(window.PAGE==='analytics')window.renderAnalytics(document.getElementById('content-wrap'));}

/* ═══════════════ WINDOW EXPORTS ═══════════════ */
window.openStudyLog = openStudyLog;
window.saveStudyLog = saveStudyLog;
window.deleteStudyLog = deleteStudyLog;
