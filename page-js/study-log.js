// page-js/study-log.js
function openStudyLog(){document.getElementById('sl-date').value=new Date().toISOString().split('T')[0];om('m-study-log');setTimeout(()=>document.getElementById('sl-topic').focus(),320);}
function saveStudyLog(){
  const topic=document.getElementById('sl-topic').value.trim();if(!topic){toast('⚠️ Enter a topic');return;}
  let dur=parseFloat(document.getElementById('sl-dur').value);if(!dur||dur<=0){toast('⚠️ Enter duration');return;}
  if(!DB.studyLogs)DB.studyLogs=[];
  dur=Math.round(dur*10)/10;
  DB.studyLogs.unshift({id:'sl_'+Date.now(),subject:document.getElementById('sl-subj').value,topic,duration:dur,date:document.getElementById('sl-date').value||new Date().toISOString().split('T')[0],createdAt:new Date().toISOString()});
  sv('studyLogs');cm('m-study-log');if(PAGE==='dashboard')renderDashboard(document.getElementById('content-wrap'));toast('✅ Session logged!');
}
function deleteStudyLog(id){DB.studyLogs=DB.studyLogs.filter(l=>l.id!==id);sv('studyLogs');if(PAGE==='dashboard')renderDashboard(document.getElementById('content-wrap'));else if(PAGE==='analytics')renderAnalytics(document.getElementById('content-wrap'));}
