// page-js/analytics.js
import { DB } from '../js/data.js';
import { esc, fmtDate, findCh } from '../js/helpers.js';
import { pageLoadChoreography, chartChoreography, staggerIn, shouldAnimate } from '../js/animations.js';
/* ═══════════════ ANALYTICS ═══════════════ */
function renderAnalytics(el){
  const logs=DB.studyLogs||[];
  const tests=DB.tests||[];
  const now=new Date();
  const weekStart=new Date(now);weekStart.setDate(now.getDate()-now.getDay());
  const weekLogs=logs.filter(l=>new Date(l.date)>=weekStart);
  const weekTotal=weekLogs.reduce((s,l)=>s+(l.duration||0),0);
  const dayMap={};logs.forEach(l=>{dayMap[l.date]=(dayMap[l.date]||0)+(l.duration||0);});
  const bestDay=Object.entries(dayMap).sort((a,b)=>b[1]-a[1])[0];
  const avgDay=logs.length?(Object.values(dayMap).reduce((a,b)=>a+b,0)/Object.keys(dayMap).length):0;
  const days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const barData=days.map((d,i)=>{const dt=new Date(weekStart);dt.setDate(weekStart.getDate()+i);const ds=dt.toISOString().split('T')[0];return{day:d,val:dayMap[ds]||0};});
  
  const testAvg=tests.length?Math.round(tests.reduce((s,t)=>s+t.totalScore,0)/tests.length):0;
  const physAvg=tests.length?Math.round(tests.reduce((s,t)=>s+(t.physics.correct*4-t.physics.incorrect),0)/tests.length):0;
  const chemAvg=tests.length?Math.round(tests.reduce((s,t)=>s+(t.chemistry.correct*4-t.chemistry.incorrect),0)/tests.length):0;
  const mathAvg=tests.length?Math.round(tests.reduce((s,t)=>s+(t.maths.correct*4-t.maths.incorrect),0)/tests.length):0;
  
  // Timing averages
  const testsWithTiming = tests.filter(t=>t.timing&&t.timing.total);
  const avgTimeP = testsWithTiming.length?Math.round(testsWithTiming.reduce((s,t)=>s+(t.timing.physics||0),0)/testsWithTiming.length):0;
  const avgTimeC = testsWithTiming.length?Math.round(testsWithTiming.reduce((s,t)=>s+(t.timing.chemistry||0),0)/testsWithTiming.length):0;
  const avgTimeM = testsWithTiming.length?Math.round(testsWithTiming.reduce((s,t)=>s+(t.timing.maths||0),0)/testsWithTiming.length):0;

  const chFreq={};
  tests.forEach(t=>{
    const syl=t.syllabus||{};
    ['physics','chemistry','maths'].forEach(subj=>{
      (syl[subj]||[]).forEach(cid=>{
        const ch=findCh(subj,cid);
        if(ch){const k=subj+'|'+ch.name;chFreq[k]=(chFreq[k]||0)+1;}
      });
    });
  });
  const freqArr=Object.entries(chFreq).map(([k,c])=>{const[subj,name]=k.split('|');return{subj,name,count:c};}).sort((a,b)=>b.count-a.count);
  const subjCol={physics:'var(--phys)',chemistry:'var(--chem)',maths:'var(--math)'};
  
  el.innerHTML=`
  <div class="pg-hdr anim-up"><div class="pg-title">Statistics & Study Logs</div><div class="pg-sub">Performance insights and study tracking</div></div>
  <div class="analytics-hero anim-up d1">
    <div class="gc analytics-card"><div class="analytics-val" style="color:var(--accent)">${(+weekTotal).toFixed(1)}h</div><div class="analytics-lbl">This Week Total</div></div>
    <div class="gc analytics-card"><div class="analytics-val" style="color:var(--green)">${(+avgDay).toFixed(1)}h</div><div class="analytics-lbl">Avg Per Day</div></div>
    <div class="gc analytics-card"><div class="analytics-val" style="color:var(--phys)">${bestDay?((+bestDay[1]).toFixed(1)+'h'):'—'}</div><div class="analytics-lbl">Best Day ${bestDay?'('+fmtDate(bestDay[0]).slice(0,6)+')':''}</div></div>
    <div class="gc analytics-card"><div class="analytics-val" style="color:var(--chem)">${logs.length}</div><div class="analytics-lbl">Total Sessions</div></div>
    <div class="gc analytics-card"><div class="analytics-val" style="color:var(--math)">${logs.reduce((s,l)=>s+(l.duration||0),0).toFixed(1)}h</div><div class="analytics-lbl">Lifetime Hours</div></div>
  </div>
  <div class="section-block anim-up d2">
    <div class="section-title">📝 Log Today's Study</div>
    <div class="gc" style="padding:18px 20px">
      <div class="g2" style="margin-bottom:12px">
        <div class="fg"><label>Date</label><input class="inp" id="an-date" type="date" value="${new Date().toISOString().split('T')[0]}"/></div>
        <div class="fg"><label>Subject</label>
          <select class="inp" id="an-subj">
            <option value="Physics">⚡ Physics</option>
            <option value="Chemistry">⚗️ Chemistry</option>
            <option value="Maths">📐 Maths</option>
            <option value="General">📖 General</option>
          </select>
        </div>
      </div>
      <div class="g2" style="margin-bottom:12px">
        <div class="fg"><label>Start Time</label><input class="inp" id="an-st" type="time" value="09:00"/></div>
        <div class="fg"><label>End Time</label><input class="inp" id="an-en" type="time" value="11:00"/></div>
      </div>
      <div class="fg" style="margin-bottom:12px"><label>Note (optional)</label><input class="inp" id="an-note" type="text" placeholder="e.g. Chemistry — Atomic Structure"/></div>
      <button class="btn btn-primary" onclick="saveAnalyticsLog()">+ Log</button>
    </div>
  </div>
  <div class="section-block anim-up d3">
    <div class="section-title">📊 Weekly Study Hours</div>
    <div class="gc bar-chart">
      ${barData.map(b=>`<div class="bar-col">
        <div class="bar-val">${b.val>0?(+b.val).toFixed(1)+'h':'0h'}</div>
        <div class="bar-track"><div class="bar-fill" style="height:${Math.min(100,b.val*10)}%;background:var(--accent)"></div></div>
        <div class="bar-lbl">${b.day}</div>
      </div>`).join('')}
    </div>
  </div>
  <div class="section-block anim-up d4">
    <div class="section-title">📊 Monthly Performance Composite — ${['January','February','March','April','May','June','July','August','September','October','November','December'][now.getMonth()]} ${now.getFullYear()}</div>
    <div class="gc" style="padding:18px 20px">
      ${(()=>{
        const monthStart=new Date(now.getFullYear(),now.getMonth(),1);
        const monthEnd=new Date(now.getFullYear(),now.getMonth()+1,1);
        const mTests=tests.filter(t=>{const d=new Date(t.date);return d>=monthStart&&d<monthEnd&&t.maxScore>0;});
        const mMocks=(DB.mockTests||[]).filter(m=>{const d=new Date(m.date);return d>=monthStart&&d<monthEnd&&m.totalMarks>0;});
        const mLogs=logs.filter(l=>{const d=new Date(l.date);return d>=monthStart&&d<monthEnd;});
        const testScore=mTests.length?mTests.reduce((s,t)=>s+Math.round(t.totalScore/t.maxScore*100),0)/mTests.length:0;
        const mockScore=mMocks.length?mMocks.reduce((s,m)=>s+Math.round(m.marksScored/m.totalMarks*100),0)/mMocks.length:0;
        const totalHours=mLogs.reduce((s,l)=>s+(l.duration||0),0);
        const studyScore=Math.min(100,Math.round(totalHours/(now.getDate()*2)*100));
        const comps=[
          {label:'Test Score',val:testScore,color:'var(--accent)',icon:'📝'},
          {label:'Mock Score',val:mockScore,color:'var(--green)',icon:'📋'},
          {label:'Study Hours',val:studyScore,color:'var(--phys)',icon:'📖'}
        ];
        return `
        <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:16px">
          ${comps.map(c=>`<div style="flex:1;min-width:100px;padding:14px 16px;background:var(--glass);border:1px solid var(--border);border-radius:12px;text-align:center">
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin-bottom:8px">${c.icon} ${c.label}</div>
            <div style="font-size:28px;font-weight:700;font-family:'Playfair Display',serif;color:${c.color}">${c.val.toFixed(1)}%</div>
            <div class="pbar-wrap" style="height:5px;margin-top:8px"><div class="pbar" style="height:5px;width:${c.val}%;background:${c.color}"></div></div>
          </div>`).join('')}
        </div>
        <div style="font-size:12px;color:var(--faint);text-align:center;padding:8px;background:var(--glass);border-radius:10px;border:1px solid var(--border)">
          <b>Composite Index:</b> <span style="color:var(--accent);font-size:18px;font-weight:700">${((testScore*0.4+mockScore*0.3+studyScore*0.3)).toFixed(1)}%</span>
          <span style="font-size:10px;color:var(--muted)">  (40% Test + 30% Mock + 30% Study)</span>
          <div style="margin-top:6px;font-size:10px;color:var(--faint)">
            ${mTests.length} tests · ${mMocks.length} mocks · ${totalHours.toFixed(1)}h studied this month
          </div>
        </div>`;})()}
    </div>
  </div>
  <div class="section-block anim-up d4">
    <div class="section-title">📈 Daily Performance — This Month</div>
    <div class="gc" style="padding:16px;overflow-x:auto">
      ${(()=>{
        const monthStart=new Date(now.getFullYear(),now.getMonth(),1);
        const monthEnd=new Date(now.getFullYear(),now.getMonth()+1,1);
        const daysInMonth=new Date(now.getFullYear(),now.getMonth()+1,0).getDate();
        const dayData=[];
        for(let d=1;d<=now.getDate();d++){
          const dateStr=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
          const dayTests=tests.filter(t=>t.date&&t.date.startsWith(dateStr)&&t.maxScore>0);
          const dayMocks=(DB.mockTests||[]).filter(m=>m.date===dateStr&&m.totalMarks>0);
          const dayLogs=logs.filter(l=>l.date===dateStr);
          const tAvg=dayTests.length?Math.round(dayTests.reduce((s,t)=>s+t.totalScore/t.maxScore,0)/dayTests.length*100):0;
          const mAvg=dayMocks.length?Math.round(dayMocks.reduce((s,m)=>s+m.marksScored/m.totalMarks,0)/dayMocks.length*100):0;
          const h=dayLogs.reduce((s,l)=>s+(l.duration||0),0);
          dayData.push({day:d,testScore:tAvg,mockScore:mAvg,hours:h});
        }
        const maxHours=Math.max(...dayData.map(d=>d.hours),2);
        const barW=Math.max(8,Math.min(24,600/dayData.length));
        return `<div style="display:flex;gap:3px;align-items:flex-end;min-height:120px;padding:8px 0">
          ${dayData.map(d=>{
            const testH=Math.round((d.testScore/100)*40);
            const mockH=Math.round((d.mockScore/100)*40);
            const studyH=Math.min(40,Math.round((d.hours/maxHours)*40));
            const totalH=Math.max(testH,mockH,studyH);
            return `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;flex:1;min-width:${barW}px">
              <div style="display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:80px;width:100%">
                ${testH>0?`<div style="width:${Math.min(100,barW*0.7)}px;height:${testH}px;background:var(--accent);border-radius:2px 2px 0 0;opacity:.7;min-height:2px" title="Test: ${d.testScore}%"></div>`:''}
                ${mockH>0?`<div style="width:${Math.min(100,barW*0.7)}px;height:${mockH}px;background:var(--green);border-radius:2px 2px 0 0;opacity:.7;min-height:2px" title="Mock: ${d.mockScore}%"></div>`:''}
                ${studyH>0?`<div style="width:${Math.min(100,barW*0.7)}px;height:${studyH}px;background:var(--phys);border-radius:2px 2px 0 0;opacity:.5;min-height:2px" title="Study: ${d.hours.toFixed(1)}h"></div>`:''}
              </div>
              <div style="font-size:7px;color:var(--faint);white-space:nowrap">${d.day}</div>
            </div>`;
          }).join('')}
        </div>
        <div style="display:flex;gap:16px;justify-content:center;font-size:10px;color:var(--muted);margin-top:8px">
          <span><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:var(--accent);margin-right:4px"></span>Test</span>
          <span><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:var(--green);margin-right:4px"></span>Mock</span>
          <span><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:var(--phys);margin-right:4px"></span>Study</span>
        </div>`;})()}
    </div>
  </div>
  ${(()=>{
    const valid=tests.filter(t=>t.date&&t.totalScore!=null).sort((a,b)=>new Date(a.date)-new Date(b.date));
    if(valid.length<2)return '';
    const scores=valid.map(t=>t.totalScore);
    const max=Math.max(...scores,300);
    const min=Math.min(...scores,0);
    const range=max-min||1;
    const w=600,h=200,px=50,py=5,rw=w-px*2,rh=h-py*2;
    const xScale=(i)=>px+i/(valid.length-1)*rw;
    const yScale=(v)=>h-py-(v-min)/range*rh;
    const pts=valid.map((t,i)=>`${xScale(i).toFixed(1)},${yScale(t.totalScore).toFixed(1)}`);
    const area=`M${pts[0]}L${pts.slice(1).join('L')}L${xScale(valid.length-1).toFixed(1)},${h-py}L${xScale(0).toFixed(1)},${h-py}Z`;
    const gId='pfg'+Date.now();const yTicks=[min,Math.round(min+range*0.25),Math.round(min+range*0.5),Math.round(min+range*0.75),max];
    return `<div class="section-block anim-up d3"><div class="section-title">📈 Overall Performance (${valid.length} Tests)</div><div class="gc" style="padding:16px"><svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;display:block">
      ${yTicks.map(v=>`<text x="${px-8}" y="${yScale(v)+3}" text-anchor="end" fill="var(--faint)" font-size="9">${v}</text><line x1="${px}" y1="${yScale(v)}" x2="${w-px}" y2="${yScale(v)}" stroke="rgba(255,255,255,.05)" stroke-width="1"/>`).join('')}
      <path d="${pts.join('L')}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      <path d="${area}" fill="url(#${gId})" opacity=".2"/>
      <defs><linearGradient id="${gId}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(--accent)" stop-opacity=".5"/><stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>
      ${pts.map((p,i)=>`<circle cx="${p.split(',')[0]}" cy="${p.split(',')[1]}" r="3" fill="var(--accent)" stroke="#100C10" stroke-width="1.5"/>`).join('')}
      ${valid.filter((_,i)=>i%Math.max(1,Math.floor(valid.length/6))===0||i===valid.length-1).map((t,i)=>`<text x="${xScale(i*Math.max(1,Math.floor(valid.length/6)))}" y="${h-5}" text-anchor="middle" fill="var(--faint)" font-size="8">${fmtDate(t.date).slice(0,5)}</text>`).join('')}
    </svg></div></div>`;
  })()}
  <div class="section-block anim-up d3">
    <div class="section-title">📈 Test Averages ${tests.length?`(${tests.length} Tests)`:'(0 Tests)'}</div>
    <div class="stats-grid">
      <div class="gc stat-card"><div class="stat-val" style="color:var(--green)">${testAvg}</div><div class="stat-label">Avg Total</div><div class="stat-sub">/300</div></div>
      <div class="gc stat-card"><div class="stat-val" style="color:var(--phys)">${physAvg}</div><div class="stat-label">Avg Physics</div><div class="stat-sub">/100</div></div>
      <div class="gc stat-card"><div class="stat-val" style="color:var(--chem)">${chemAvg}</div><div class="stat-label">Avg Chemistry</div><div class="stat-sub">/100</div></div>
      <div class="gc stat-card"><div class="stat-val" style="color:var(--math)">${mathAvg}</div><div class="stat-label">Avg Maths</div><div class="stat-sub">/100</div></div>
    </div>
  </div>
  <div class="section-block anim-up d4">
    <div class="section-title">⏱️ Subject-Wise Time Allocation (Averages)</div>
    <div class="subj-breakdown-grid" style="margin:0">
      <div class="gc" style="padding:16px;text-align:center">
        <div style="font-size:10px;color:var(--muted);font-weight:700;text-transform:uppercase">⚡ Physics Avg Time</div>
        <div style="font-family:'Playfair Display',serif;font-size:26px;font-weight:700;color:var(--phys);margin-top:4px">${avgTimeP}m</div>
        <div class="pbar-wrap" style="height:4px;margin-top:8px"><div class="pbar" style="height:4px;width:${Math.min(100,avgTimeP)}%;background:var(--phys)"></div></div>
      </div>
      <div class="gc" style="padding:16px;text-align:center">
        <div style="font-size:10px;color:var(--muted);font-weight:700;text-transform:uppercase">⚗️ Chemistry Avg Time</div>
        <div style="font-family:'Playfair Display',serif;font-size:26px;font-weight:700;color:var(--chem);margin-top:4px">${avgTimeC}m</div>
        <div class="pbar-wrap" style="height:4px;margin-top:8px"><div class="pbar" style="height:4px;width:${Math.min(100,avgTimeC)}%;background:var(--chem)"></div></div>
      </div>
      <div class="gc" style="padding:16px;text-align:center">
        <div style="font-size:10px;color:var(--muted);font-weight:700;text-transform:uppercase">📐 Maths Avg Time</div>
        <div style="font-family:'Playfair Display',serif;font-size:26px;font-weight:700;color:var(--math);margin-top:4px">${avgTimeM}m</div>
        <div class="pbar-wrap" style="height:4px;margin-top:8px"><div class="pbar" style="height:4px;width:${Math.min(100,avgTimeM)}%;background:var(--math)"></div></div>
      </div>
    </div>
  </div>
  <div class="section-block anim-up d4">
    <div class="section-title">📚 Chapter Frequency in Tests</div>
    <div class="freq-grid">
      ${freqArr.length===0?`<div class="gc empty" style="padding:40px 20px"><div class="empty-icon">📚</div><div class="empty-title">No chapter data yet</div><div class="empty-sub">Add tests with syllabus to see chapter frequency</div></div>`:
      freqArr.map(f=>`<div class="gc freq-card">
        <div class="freq-bar" style="background:${subjCol[f.subj]}"></div>
        <div class="freq-name">${esc(f.name)}</div>
        <div class="freq-sub" style="color:${subjCol[f.subj]}">${f.subj.charAt(0).toUpperCase()+f.subj.slice(1)} · Appeared in ${f.count} test${f.count>1?'s':''}</div>
        <div class="freq-count" style="color:${subjCol[f.subj]}">${f.count}</div>
      </div>`).join('')}
    </div>
  </div>`;
}
function saveAnalyticsLog(){
  const date=document.getElementById('an-date').value;
  const st=document.getElementById('an-st').value;
  const en=document.getElementById('an-en').value;
  const subj=document.getElementById('an-subj').value;
  const note=document.getElementById('an-note').value.trim();
  if(!date||!st||!en){toast('⚠️ Fill date and time');return;}
  const [sh,sm]=st.split(':').map(Number);const [eh,em]=en.split(':').map(Number);
  let dur=(eh*60+em)-(sh*60+sm);if(dur<=0)dur+=1440;
  dur=dur/60;
  if(dur>16){toast('⚠️ Session too long (max 16h)');return;}
  if(dur<0.1){toast('⚠️ Session too short');return;}
  if(!DB.studyLogs)DB.studyLogs=[];
  dur=Math.round(dur*10)/10;
  DB.studyLogs.unshift({id:'sl_'+Date.now(),subject:subj,topic:note||'Study Session',duration:dur,date,createdAt:new Date().toISOString()});
  sv('studyLogs');renderAnalytics(document.getElementById('content-wrap'));toast('✅ Session logged!');
}

/* ═══════════════ WRAPPER WITH CHOREOGRAPHY ═══════════════ */
window.renderAnalytics=function(el){
  renderAnalytics(el);
  if(shouldAnimate()){
    setTimeout(()=>{
      pageLoadChoreography(el);
      chartChoreography(el);
      staggerIn(el.querySelectorAll('.section-block'),{delay:0.2});
    },60);
  }
};
window.saveAnalyticsLog=saveAnalyticsLog;
