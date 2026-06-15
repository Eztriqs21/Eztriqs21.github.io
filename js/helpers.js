// js/helpers.js

/* ═══════════════ ANIMATED COUNTER ═══════════════ */
function animateValue(el,target,dur=500){
  const start=parseFloat(el.getAttribute('data-count-start')||'0');
  const diff=target-start;
  if(!diff||diff===0){el.textContent=target;return;}
  const startTime=performance.now();
  const isInt=Number.isInteger(target);
  function tick(now){
    const t=Math.min((now-startTime)/dur,1);
    const val=start+diff*t;
    el.textContent=isInt?Math.round(val):val.toFixed(1);
    if(t<1)requestAnimationFrame(tick);
    else{el.textContent=target;el.setAttribute('data-count-start',target);}
  }
  requestAnimationFrame(tick);
}
function animateAllCounters(scope){
  scope.querySelectorAll('[data-count]').forEach(el=>{
    const target=parseFloat(el.getAttribute('data-count'));
    if(!isNaN(target))animateValue(el,target);
  });
}

/* ═══════════════ DEBOUNCE UTILITY ═══════════════ */
function debounce(fn,ms){
  let timer;
  return function(...args){
    clearTimeout(timer);
    timer=setTimeout(()=>fn.apply(this,args),ms);
  };
}
const debouncedUpdChList=debounce(updateChapterList,200);
const debouncedUpdAsnList=debounce(updateAssignmentList,200);
const debouncedUpdTstList=debounce(updateTestList,200);

/* ═══════════════ CORE HELPERS & SUPABASE STORAGE ═══════════════ */
function fileExt(name){return (String(name||'').split('.').pop()||'').toLowerCase();}
const PDF_MIMES=['application/pdf','application/x-pdf'];
const IMG_EXTS=['jpg','jpeg','png','gif','webp','bmp','heic','heif'];
function isPdfFile(file){if(!file||!file.name)return false;const ext=fileExt(file.name);const typ=(file.type||'').toLowerCase();return PDF_MIMES.includes(typ)||ext==='pdf';}
function isImageFile(file){const ext=fileExt(file.name);return (file.type&&file.type.startsWith('image/'))||IMG_EXTS.includes(ext);}
function isAllowedUpload(file){return isImageFile(file)||isPdfFile(file);}
function fileIcon(f){return (f&&(isImageFile(f)||(f.type&&f.type.startsWith('image/'))||(f.name&&isImageFile({name:f.name,type:f.type||''}))))?'🖼️':'📄';}
function compressImageToDataUrl(file,maxDim,quality){
  return new Promise((resolve,reject)=>{
    const r=new FileReader();
    r.onload=()=>{
      const img=new Image();
      img.onload=()=>{
        let w=img.width,h=img.height;
        const scale=Math.min(1,maxDim/Math.max(w,h,1));
        w=Math.max(1,Math.round(w*scale));h=Math.max(1,Math.round(h*scale));
        const c=document.createElement('canvas');
        c.width=w;c.height=h;
        c.getContext('2d').drawImage(img,0,0,w,h);
        resolve(c.toDataURL('image/jpeg',quality));
      };
      img.onerror=()=>reject(new Error('decode'));
      img.src=r.result;
    };
    r.onerror=()=>reject(new Error('read'));
    r.readAsDataURL(file);
  });
}
function readFileLocal(file,cb){
  const cn=file.name,ct=file.type||(isPdfFile(file)?'application/pdf':isImageFile(file)?'image/jpeg':''),cs=file.size;
  const finish=data=>{
    if(!usesCloudStorage()){
      const extra=(typeof data==='string'?data.length:JSON.stringify(data).length)*2+256;
      const total=lsBytesUsed()+extra;
      if(total>LS_HARD_LIMIT){toast('⚠️ Storage full. Configure Supabase sync.');return;}
      if(total>LS_SAFE_BUDGET){toast('⚠️ Attachment too large for offline storage');return;}
    }
    cb({id:uid(),name:cn,type:ct,size:cs,data});
  };
  if(isImageFile(file)&&file.size>180000){
    compressImageToDataUrl(file,1600,0.82).then(finish).catch(()=>{
      const r=new FileReader();r.onload=ev=>finish(ev.target.result);r.readAsDataURL(file);
    });
    return;
  }
  if(isPdfFile(file)&&!usesCloudStorage()&&file.size>900000){
    toast('⚠️ PDF too large for offline (~900KB). Use Supabase sync.');return;
  }
  const r=new FileReader();r.onload=ev=>finish(ev.target.result);r.readAsDataURL(file);
}
const DEFAULT_STORAGE_BUCKET='jeehq-assets';
function getStorageBucket(){
  const b=(supaConfig&&supaConfig.bucket)?String(supaConfig.bucket).trim():'';
  return b||DEFAULT_STORAGE_BUCKET;
}
function storageFolderKey(){
  return String(currentSyncKey||'default').replace(/[^a-zA-Z0-9_-]/g,'_').slice(0,64);
}
function storageErrorMessage(error){
  if(!error)return'Upload failed';
  const raw=String(error.message||error.error||error.statusCode||'').trim();
  const msg=raw.toLowerCase();
  const bucket=getStorageBucket();
  if(msg.includes('bucket')&&(msg.includes('not found')||msg.includes('does not exist')||msg.includes('not exist'))){
    return 'Storage bucket "'+bucket+'" not found — create a public bucket with this exact name in Supabase → Storage';
  }
  if(msg.includes('row-level security')||msg.includes('violates')||msg.includes('policy')||(msg.includes('403')&&msg.length<8)){
    return 'Storage RLS blocked upload for bucket "'+bucket+'". In Supabase → Storage → Policies, remove "authenticated only" rules and run the full SQL block in Setup (INSERT must allow anon). Detail: '+raw;
  }
  if(msg.includes('permission')||msg.includes('denied')||msg.includes('403')||msg.includes('401')){
    return 'Storage permission denied for bucket "'+bucket+'". Re-run the Setup SQL policies; bucket name must match exactly. Detail: '+raw;
  }
  if(msg.includes('jwt')||msg.includes('apikey')||msg.includes('invalid key')){
    return 'Invalid Supabase anon key — check Project Settings → API';
  }
  return raw||'Upload failed';
}
function uploadPrereqError(){
  if(!supaClient||!supaConfig)return'⚠️ Supabase not configured — open ☁️ Setup in the sidebar';
  if(!currentSyncKey)return'⚠️ Set a sync key first (🔑 Set Sync Key) — required for cloud file uploads';
  return null;
}
async function uploadToSupabaseStorage(file){
  const prereq=uploadPrereqError();
  if(prereq){toast(prereq);return null;}
  const max=5*1024*1024;
  if(!isAllowedUpload(file)){toast('⚠️ PDF or images only');return null;}
  if(file.size>max){toast('⚠️ Max 5MB per file');return null;}
  const bucket=getStorageBucket();
  const ext=fileExt(file.name)||'bin';
  const path=storageFolderKey()+'/'+uid()+'.'+ext;
  const contentType=file.type||(isPdfFile(file)?'application/pdf':isImageFile(file)?'image/jpeg':'application/octet-stream');
  try{
    const {error}=await supaClient.storage.from(bucket).upload(path,file,{contentType,upsert:false});
    if(error){
      const detail=storageErrorMessage(error);
      toast('⚠️ '+detail);
      console.error('Storage upload error:',{bucket,path,status:error.statusCode,error});
      return null;
    }
    const {data:urlData}=supaClient.storage.from(bucket).getPublicUrl(path);
    if(!urlData||!urlData.publicUrl){
      toast('⚠️ Upload succeeded but public URL missing — ensure bucket "'+bucket+'" is Public');
      return null;
    }
    return {id:uid(),name:file.name,type:contentType,size:file.size,url:urlData.publicUrl};
  }catch(e){
    toast('⚠️ '+storageErrorMessage(e));
    console.error('Storage upload exception:',e);
    return null;
  }
}
async function rdFiles(files,cb){
  const max=5*1024*1024;
  const wantCloud=usesCloudStorage();
  const prereq=wantCloud?uploadPrereqError():null;
  if(prereq){toast(prereq);return;}
  if(wantCloud&&!(await testStorageBucket())){toast('⚠️ Storage bucket not accessible — check Setup');return;}
  const fileArr=[...files];
  for(const file of fileArr){
    if(!isAllowedUpload(file)){toast('⚠️ PDF or images only: '+file.name);continue;}
    if(file.size>max){toast('⚠️ Max 5MB per file: '+file.name);continue;}
    if(wantCloud){
      const obj=await uploadToSupabaseStorage(file);
      if(obj)cb(obj);
    }else{
      readFileLocal(file,cb);
    }
  }
}
function setupDZ(dzId,inpId,cb){
  const dz=document.getElementById(dzId);if(!dz)return;
  const inp=document.getElementById(inpId);
  if(inp)dz.onclick=function(){inp.click();};
  dz.ondragover=function(e){e.preventDefault();dz.classList.add('dragging');};
  dz.ondragleave=function(){dz.classList.remove('dragging');};
  dz.ondrop=function(e){e.preventDefault();dz.classList.remove('dragging');if(e.dataTransfer&&e.dataTransfer.files)cb(e.dataTransfer.files);};
}
function findCh(subj,id){return DB.chapters[subj]?.find(c=>c.id===id);}
function safePct(num,den){if(!den||!num)return 0;return Math.round(Math.min(100,Math.max(0,num/den*100)));}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6);}
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function fmtSz(b){if(!b)return'';return b<1048576?(b/1024).toFixed(1)+' KB':(b/1048576).toFixed(1)+' MB';}
function fmtDate(d){if(!d)return'—';try{const dt=new Date(d);if(isNaN(dt.getTime()))return d;return dt.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});}catch(e){return d||'—';}}
function fmt12(t){if(!t||!t.includes(':'))return t;const[h,m]=t.split(':').map(Number);const ap=h>=12?'PM':'AM';const h12=h%12||12;return`${h12}:${String(m).padStart(2,'0')} ${ap}`;}

/* MODAL */
function om(id){
  const m=document.getElementById(id);
  if(!m)return;
  m.classList.add('open');
  const md=m.querySelector('.md');
  if(md&&!md._swipeInit){
    md._swipeInit=true;
    let sy=0,swiping=false;
    md.addEventListener('touchstart',e=>{if(e.touches.length===1){sy=e.touches[0].clientY;swiping=true;}},{passive:true});
    md.addEventListener('touchmove',e=>{
      if(!swiping||e.touches.length!==1)return;
      const dy=e.touches[0].clientY-sy;
      if(dy>0){md.style.transform='translateY('+dy+'px)';md.style.transition='none';}
    },{passive:true});
    md.addEventListener('touchend',e=>{
      if(!swiping)return;swiping=false;
      const dy=e.changedTouches[0].clientY-sy;
      md.style.transform='';md.style.transition='';
      if(dy>80)m.classList.remove('open');
    },{passive:true});
  }
}
function cm(id){document.getElementById(id)?.classList.remove('open');}
document.addEventListener('pointerdown',e=>{const mo=e.target.closest('.mo');if(mo&&e.target===mo)mo.classList.remove('open');},{passive:true});

/* CONFIRM */
function cfm2(title,sub,cb){
  const div=document.createElement('div');div.className='cfm-overlay';
  div.innerHTML=`<div class="cfm-box"><div class="cfm-title">${esc(title)}</div><div class="cfm-sub">${esc(sub)}</div><div class="cfm-btns"><button class="btn btn-ghost btn-sm" onclick="this.closest('.cfm-overlay').remove()">Cancel</button><button class="btn btn-danger btn-sm" id="cfm-ok">Confirm</button></div></div>`;
  div.querySelector('#cfm-ok').onclick=()=>{cb();div.remove();};
  document.body.appendChild(div);
}

/* TOAST */
let toastT;
function toast(msg){const el=document.getElementById('toast');el.textContent=msg;el.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>el.classList.remove('on'),2800);}
