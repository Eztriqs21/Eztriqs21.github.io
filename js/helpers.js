// js/helpers.js
import { usesCloudStorage, lsBytesUsed, LS_HARD_LIMIT, LS_SAFE_BUDGET, findCh } from './data.js';
import { modalOpenMobile, modalOpenDesktop, modalClose, toastSlideIn, toastSlideOut, shouldAnimate } from './animations.js';

/* ═══════════════ ANIMATED COUNTER ═══════════════ */
export function animateValue(el,target,dur=500){
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
export function animateAllCounters(scope){
  scope.querySelectorAll('[data-count]').forEach(el=>{
    const target=parseFloat(el.getAttribute('data-count'));
    if(!isNaN(target))animateValue(el,target);
  });
}

/* ═══════════════ CHART ANIMATIONS ═══════════════ */
import { barChartGrow, svgLineDraw, svgCirclePop, progressBarFill as animProgressBar } from './animations.js';

export function animateBarCharts(scope){
  if(!shouldAnimate())return;
  scope.querySelectorAll('.bar-fill').forEach((bar,i)=>{
    const h=bar.style.height;
    barChartGrow(bar,h,i*.06);
  });
  scope.querySelectorAll('.pbar').forEach((bar,i)=>{
    const w=bar.style.width;
    animProgressBar(bar,w);
  });
}
export function animateSVGDraw(scope){
  if(!shouldAnimate())return;
  scope.querySelectorAll('svg path[stroke]').forEach(path=>{
    svgLineDraw(path);
  });
  scope.querySelectorAll('svg circle').forEach((c,i)=>{
    svgCirclePop(c,i);
  });
}
export function animateChartBars(scope){
  animateBarCharts(scope);animateSVGDraw(scope);
}

/* ═══════════════ DEBOUNCE UTILITY ═══════════════ */
export function debounce(fn,ms){
  let timer;
  return function(...args){
    clearTimeout(timer);
    timer=setTimeout(()=>fn.apply(this,args),ms);
  };
}
export const debouncedUpdChList=debounce(()=>window.updateChapterList&&window.updateChapterList(),200);
export const debouncedUpdAsnList=debounce(()=>window.updateAssignmentList&&window.updateAssignmentList(),200);
export const debouncedUpdTstList=debounce(()=>window.updateTestList&&window.updateTestList(),200);

/* ═══════════════ CORE HELPERS & SUPABASE STORAGE ═══════════════ */
export function fileExt(name){return (String(name||'').split('.').pop()||'').toLowerCase();}
const PDF_MIMES=['application/pdf','application/x-pdf'];
const IMG_EXTS=['jpg','jpeg','png','gif','webp','bmp','heic','heif'];
export function isPdfFile(file){if(!file||!file.name)return false;const ext=fileExt(file.name);const typ=(file.type||'').toLowerCase();return PDF_MIMES.includes(typ)||ext==='pdf';}
export function isImageFile(file){const ext=fileExt(file.name);return (file.type&&file.type.startsWith('image/'))||IMG_EXTS.includes(ext);}
export function isAllowedUpload(file){return isImageFile(file)||isPdfFile(file);}
export function fileIcon(f){return (f&&(isImageFile(f)||(f.type&&f.type.startsWith('image/'))||(f.name&&isImageFile({name:f.name,type:f.type||''}))))?'🖼️':'📄';}
export function compressImageToDataUrl(file,maxDim,quality){
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
export function readFileLocal(file,cb){
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
export function getStorageBucket(){
  const b=(window.supaConfig&&window.supaConfig.bucket)?String(window.supaConfig.bucket).trim():'';
  return b||DEFAULT_STORAGE_BUCKET;
}
export function storageFolderKey(){
  return String(window.currentSyncKey||'default').replace(/[^a-zA-Z0-9_-]/g,'_').slice(0,64);
}
export function storageErrorMessage(error){
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
export function uploadPrereqError(){
  if(!window.supaClient||!window.supaConfig)return'⚠️ Supabase not configured — open ☁️ Setup in the sidebar';
  if(!window.currentSyncKey)return'⚠️ Set a sync key first (🔑 Set Sync Key) — required for cloud file uploads';
  return null;
}
export async function uploadToSupabaseStorage(file){
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
    const {error}=await window.supaClient.storage.from(bucket).upload(path,file,{contentType,upsert:false});
    if(error){
      const detail=storageErrorMessage(error);
      toast('⚠️ '+detail);
      console.error('Storage upload error:',{bucket,path,status:error.statusCode,error});
      return null;
    }
    const {data:urlData}=window.supaClient.storage.from(bucket).getPublicUrl(path);
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
export async function rdFiles(files,cb){
  const max=5*1024*1024;
  const wantCloud=usesCloudStorage();
  const prereq=wantCloud?uploadPrereqError():null;
  if(prereq){toast(prereq);return;}
  if(wantCloud&&!(await window.testStorageBucket())){toast('⚠️ Storage bucket not accessible — check Setup');return;}
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
export function setupDZ(dzId,inpId,cb){
  const dz=document.getElementById(dzId);if(!dz)return;
  const inp=document.getElementById(inpId);
  if(inp)dz.onclick=function(){inp.click();};
  dz.ondragover=function(e){e.preventDefault();dz.classList.add('dragging');};
  dz.ondragleave=function(){dz.classList.remove('dragging');};
  dz.ondrop=function(e){e.preventDefault();dz.classList.remove('dragging');if(e.dataTransfer&&e.dataTransfer.files)cb(e.dataTransfer.files);};
}
export function safePct(num,den){if(!den||!num)return 0;return Math.round(Math.min(100,Math.max(0,num/den*100)));}
export function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6);}
export function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
export function fmtSz(b){if(!b)return'';return b<1048576?(b/1024).toFixed(1)+' KB':(b/1048576).toFixed(1)+' MB';}
export function fmtDate(d){if(!d)return'—';try{const dt=new Date(d);if(isNaN(dt.getTime()))return d;return dt.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});}catch(e){return d||'—';}}
export function fmt12(t){if(!t||!t.includes(':'))return t;const[h,m]=t.split(':').map(Number);const ap=h>=12?'PM':'AM';const h12=h%12||12;return`${h12}:${String(m).padStart(2,'0')} ${ap}`;}

/* MODAL */
export function om(id){
  const m=document.getElementById(id);
  if(!m)return;
  m.classList.add('open');
  const md=m.querySelector('.md');
  if(md){
    const isMobile=window.innerWidth<600;
    if(shouldAnimate()){
      if(isMobile)modalOpenMobile(md);else modalOpenDesktop(md);
    }
    if(!md._swipeInit){
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
}
export function cm(id){
  const m=document.getElementById(id);
  if(!m)return;
  const md=m.querySelector('.md');
  if(md&&shouldAnimate()){
    modalClose(md).then(()=>m.classList.remove('open'));
  }else{
    m.classList.remove('open');
  }
}
document.addEventListener('pointerdown',e=>{const mo=e.target.closest('.mo');if(mo&&e.target===mo)mo.classList.remove('open');},{passive:true});

/* CONFIRM */
export function cfm2(title,sub,cb){
  const div=document.createElement('div');div.className='cfm-overlay';
  div.innerHTML=`<div class="cfm-box"><div class="cfm-title">${esc(title)}</div><div class="cfm-sub">${esc(sub)}</div><div class="cfm-btns"><button class="btn btn-ghost btn-sm" onclick="this.closest('.cfm-overlay').remove()">Cancel</button><button class="btn btn-danger btn-sm" id="cfm-ok">Confirm</button></div></div>`;
  div.querySelector('#cfm-ok').onclick=()=>{cb();div.remove();};
  document.body.appendChild(div);
}

/* TOAST */
let toastT;
export function toast(msg){
  const el=document.getElementById('toast');
  el.textContent=msg;
  if(shouldAnimate()){
    toastSlideIn(el);
  }else{
    el.classList.add('on');
  }
  clearTimeout(toastT);
  toastT=setTimeout(()=>{
    if(shouldAnimate())toastSlideOut(el);
    else el.classList.remove('on');
  },2800);
}

/* ═══════════════ FILE CACHE ═══════════════ */
const _fileCache={};let _fcacheOrder=[];const _FCACHE_MAX=80;const _FCACHE_MAX_BYTES=20*1024*1024;
let _fcacheBytes=0;
function _fcacheSize(d){return typeof d==='string'?d.length*2:0;}
export function _fcache(data,_name){if(!data)return'';const id=uid();const sz=_fcacheSize(data);_fileCache[id]=data;_fcacheOrder.push({id,sz});_fcacheBytes+=sz;while(_fcacheOrder.length>_FCACHE_MAX||_fcacheBytes>_FCACHE_MAX_BYTES){const old=_fcacheOrder.shift();_fcacheBytes-=old.sz;delete _fileCache[old.id];}return id;}
export function _fget(id){return id&&_fileCache[id]?(_fileCache[id]):null;}

/* ═══════════════ FILE ITEM HTML ═══════════════ */
export function fItemHTML(f){
  const icon=fileIcon(f);
  const fid=_fcache(f.url||f.data||'',f.name);
  return `<div class="file-item" onclick="pvFile(_fget('${fid}'),'${esc(f.name).replace(/'/g,"\\'")}')"><div class="file-ico">${icon}</div><div class="file-name">${esc(f.name)}</div><div class="file-size">${fmtSz(f.size)}</div></div>`;
}
export function fItemHTMLRaw(d,name){
  const data=typeof d==='object'&&d!==null?(d.d||d.data||''):String(d||'');
  const nm=(typeof d==='object'&&d!==null?(d.n||d.name):null)||name||'';
  const urlPath=(data.split('?')[0]||'').toLowerCase();
  const isPdfUrl=data.includes('application/pdf')||nm.toLowerCase().endsWith('.pdf')||urlPath.endsWith('.pdf')||urlPath.endsWith('.pdf/');
  const icon=!isPdfUrl&&(data.startsWith('data:image')||(!data.includes('pdf')&&data.startsWith('data:')))?'🖼️':'📄';
  const fid=_fcache(data,nm);
  return `<div class="file-item" onclick="pvFile(_fget('${fid}'),'${esc(nm).replace(/'/g,"\\'")}')"><div class="file-ico">${icon}</div><div class="file-name">${esc(nm)}</div></div>`;
}

/* ═══════════════ FILE PREVIEW ═══════════════ */
let pv={type:null,data:null,name:null,pdfDoc:null,page:1,pages:0,zoom:1.5,imgZoom:1,imgPanX:0,imgPanY:0,dragging:false,dragX:0,dragY:0};
export async function pvFile(data,name){
  if(!data){toast('⚠️ File data not available');return;}
  pv={type:null,data:data,name:name||'Preview',pdfDoc:null,page:1,pages:0,zoom:1.5,imgZoom:1,imgPanX:0,imgPanY:0,dragging:false,dragX:0,dragY:0};
  document.getElementById('pv-title').textContent=pv.name;
  const body=document.getElementById('pv-body');
  const pdfCtrl=document.getElementById('pv-pdf-controls');
  const imgCtrl=document.getElementById('pv-img-controls');
  const footer=document.getElementById('pv-footer');
  pdfCtrl.style.display='none';imgCtrl.style.display='none';footer.style.display='none';
  body.innerHTML='<div class="pv-empty">⏳ Loading...</div>';
  body.onscroll=null;
  om('m-preview');
  const nm=String(pv.name).toLowerCase();
  const urlPath=(data.split('?')[0]||'').toLowerCase();
  const isPdf=data.startsWith('data:application/pdf')||data.includes('application/pdf')||nm.endsWith('.pdf')||urlPath.endsWith('.pdf')||urlPath.endsWith('.pdf/');
  if(isPdf){
    pv.type='pdf';
    try{
      let binary;
      if(data.startsWith('data:')){
        const resp=await fetch(data);const blob=await resp.blob();
        binary=await blob.arrayBuffer();
      }else if(data.startsWith('http')){
        const resp=await fetch(data);binary=await resp.arrayBuffer();
      }else{binary=data;}
      pv.pdfDoc=await pdfjsLib.getDocument({data:binary}).promise;
      pv.pages=pv.pdfDoc.numPages;
      pv.zoom=1.5;
      pdfCtrl.style.display='flex';
      footer.style.display='flex';
      footer.innerHTML=`<a href="${esc(data.startsWith('data:')?data:data)}" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:underline">Open in new tab ⤴</a>${data.startsWith('data:')?`<a href="${esc(data)}" download="${esc(pv.name)}" style="color:var(--muted);text-decoration:underline">⬇ Download</a>`:''}`;
      await pvRenderPage(1);
    }catch(e){
      console.error('PDF load error:',e);
      body.innerHTML=`<div class="pv-empty" style="flex-direction:column;gap:12px"><div style="font-size:40px">📄</div><div style="font-weight:600;color:#fff">PDF Preview Unavailable</div><div style="font-size:12px;color:var(--muted)">${esc(e.message||'Failed to load PDF')}</div>${data.startsWith('data:')?`<a class="btn btn-primary btn-xs" href="${esc(data)}" download="${esc(pv.name)}">⬇ Download</a>`:''}</div>`;
    }
    return;
  }
  pv.type='image';
  imgCtrl.style.display='flex';
  footer.style.display='flex';
  footer.innerHTML=`<a href="${esc(data)}" download="${esc(pv.name)}" style="color:var(--accent);text-decoration:underline">⬇ Download</a>`;
  body.innerHTML=`<img id="pv-img" src="${esc(data)}" style="max-width:100%;max-height:100%;object-fit:contain;cursor:grab" draggable="false" onload="pvImgFit(this)" onerror="pvFallbackLoad()"/>`;
  const img=document.getElementById('pv-img');
  if(img){
    img.addEventListener('mousedown',e=>{pv.dragging=true;pv.dragX=e.clientX-pv.imgPanX;pv.dragY=e.clientY-pv.imgPanY;img.style.cursor='grabbing';e.preventDefault();});
    img.addEventListener('mousemove',e=>{if(!pv.dragging)return;pv.imgPanX=e.clientX-pv.dragX;pv.imgPanY=e.clientY-pv.dragY;pvImgApplyTransform();});
    img.addEventListener('mouseup',()=>{pv.dragging=false;img.style.cursor='grab';});
    img.addEventListener('mouseleave',()=>{pv.dragging=false;img.style.cursor='grab';});
    img.addEventListener('wheel',e=>{e.preventDefault();pvZoomImg(e.deltaY<0?0.15:-0.15);},{passive:false});
    let lastTouchDist=0;
    img.addEventListener('touchstart',e=>{
      if(e.touches.length===1){pv.dragging=true;pv.dragX=e.touches[0].clientX-pv.imgPanX;pv.dragY=e.touches[0].clientY-pv.imgPanY;}
      if(e.touches.length===2){const dx=e.touches[0].clientX-e.touches[1].clientX,dy=e.touches[0].clientY-e.touches[1].clientY;lastTouchDist=Math.sqrt(dx*dx+dy*dy);}
      e.preventDefault();
    },{passive:false});
    img.addEventListener('touchmove',e=>{
      if(e.touches.length===1&&pv.dragging){pv.imgPanX=e.touches[0].clientX-pv.dragX;pv.imgPanY=e.touches[0].clientY-pv.dragY;pvImgApplyTransform();}
      if(e.touches.length===2){const dx=e.touches[0].clientX-e.touches[1].clientX,dy=e.touches[0].clientY-e.touches[1].clientY;const dist=Math.sqrt(dx*dx+dy*dy);if(lastTouchDist>0){const scale=dist/lastTouchDist;pvZoomImg((scale-1)*0.5);}lastTouchDist=dist;}
      e.preventDefault();
    },{passive:false});
    img.addEventListener('touchend',e=>{pv.dragging=false;lastTouchDist=0;});
  }
}
export async function pvRenderPage(num){
  if(!pv.pdfDoc)return;
  num=Math.max(1,Math.min(pv.pages,num));
  pv.page=num;
  const body=document.getElementById('pv-body');
  const page=await pv.pdfDoc.getPage(num);
  const viewport=page.getViewport({scale:pv.zoom*window.devicePixelRatio});
  const cssViewport=page.getViewport({scale:pv.zoom});
  const canvas=document.createElement('canvas');
  canvas.width=viewport.width;canvas.height=viewport.height;
  canvas.style.width=cssViewport.width+'px';canvas.style.height=cssViewport.height+'px';
  await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;
  body.innerHTML='';
  body.appendChild(canvas);
  document.getElementById('pv-page-info').textContent=pv.page+' / '+pv.pages;
  document.getElementById('pv-zoom-label').textContent=Math.round(pv.zoom*100)+'%';
}
export function pvPage(d){pvRenderPage(pv.page+d);}
export function pvZoom(d){
  pv.zoom=Math.max(0.5,Math.min(5,pv.zoom+d));
  pvRenderPage(pv.page);
}
export function pvImgFit(img){
  if(!img||!img.naturalWidth)return;
  pv.imgZoom=1;pv.imgPanX=0;pv.imgPanY=0;
  pvImgApplyTransform();
  document.getElementById('pv-img-zoom-label').textContent='100%';
}
export function pvZoomImg(d){
  pv.imgZoom=Math.max(0.2,Math.min(5,pv.imgZoom+d));
  pvImgApplyTransform();
  const lbl=document.getElementById('pv-img-zoom-label');
  if(lbl)lbl.textContent=Math.round(pv.imgZoom*100)+'%';
}
export function pvImgReset(){pv.imgZoom=1;pv.imgPanX=0;pv.imgPanY=0;pvImgApplyTransform();const lbl=document.getElementById('pv-img-zoom-label');if(lbl)lbl.textContent='100%';}
export function pvImgApplyTransform(){
  const img=document.getElementById('pv-img');
  if(img)img.style.transform=`translate(${pv.imgPanX}px, ${pv.imgPanY}px) scale(${pv.imgZoom})`;
}
export async function pvFallbackLoad(){
  if(!pv.data)return;
  try{
    let binary;
    if(pv.data.startsWith('data:')){
      const resp=await fetch(pv.data);const blob=await resp.blob();binary=await blob.arrayBuffer();
    }else if(pv.data.startsWith('http')){
      const resp=await fetch(pv.data);binary=await resp.arrayBuffer();
    }else{binary=pv.data;}
    pv.pdfDoc=await pdfjsLib.getDocument({data:binary}).promise;
    pv.type='pdf';pv.pages=pv.pdfDoc.numPages;pv.zoom=1.5;
    document.getElementById('pv-pdf-controls').style.display='flex';
    document.getElementById('pv-footer').style.display='flex';
    document.getElementById('pv-footer').innerHTML=`<a href="${esc(pv.data)}" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:underline">Open in new tab ⤴</a>`;
    document.getElementById('pv-img-controls').style.display='none';
    await pvRenderPage(1);
  }catch(e2){
    document.getElementById('pv-body').innerHTML=`<div class="pv-empty" style="flex-direction:column;gap:12px"><div style="font-size:40px">⚠️</div><div style="font-weight:600;color:#fff">Unable to load file</div><div style="font-size:12px;color:var(--muted)">${esc(e2.message||'Not a valid image or PDF')}</div><a class="btn btn-primary btn-xs" href="${esc(pv.data)}" download="${esc(pv.name)}">⬇ Download</a></div>`;
  }
}
document.addEventListener('keydown',e=>{
  if(!document.getElementById('m-preview')?.classList.contains('open'))return;
  if(e.key==='Escape')cm('m-preview');
  if(pv.type==='pdf'){
    if(e.key==='ArrowLeft'||e.key==='ArrowUp')pvPage(-1);
    if(e.key==='ArrowRight'||e.key==='ArrowDown')pvPage(1);
  }
  if(pv.type==='image'){
    if(e.key==='+'||e.key==='=')pvZoomImg(0.2);
    if(e.key==='-')pvZoomImg(-0.2);
    if(e.key==='0')pvImgReset();
  }
});

/* ═══════════════ WINDOW EXPORTS ═══════════════ */
window.uid=uid;window.esc=esc;window.fmtDate=fmtDate;window.fmtSz=fmtSz;window.fmt12=fmt12;
window.safePct=safePct;window.cm=cm;window.om=om;window.cfm2=cfm2;window.toast=toast;
window.handleFiles=rdFiles;window.rdFiles=rdFiles;window.setupDZ=setupDZ;
window.fileIcon=fileIcon;window.isPdfFile=isPdfFile;window.isImageFile=isImageFile;window.isAllowedUpload=isAllowedUpload;
window.compressImageToDataUrl=compressImageToDataUrl;window.readFileLocal=readFileLocal;
window.uploadToSupabaseStorage=uploadToSupabaseStorage;window.uploadPrereqError=uploadPrereqError;
window.getStorageBucket=getStorageBucket;window.storageFolderKey=storageFolderKey;window.storageErrorMessage=storageErrorMessage;
window.animateValue=animateValue;window.animateAllCounters=animateAllCounters;
window.animateBarCharts=animateBarCharts;window.animateSVGDraw=animateSVGDraw;window.animateChartBars=animateChartBars;
window.debounce=debounce;
window.debouncedUpdChList=debouncedUpdChList;window.debouncedUpdAsnList=debouncedUpdAsnList;window.debouncedUpdTstList=debouncedUpdTstList;
window.fileExt=fileExt;
window._fcache=_fcache;window._fget=_fget;
window.fItemHTML=fItemHTML;window.fItemHTMLRaw=fItemHTMLRaw;
window.pvFile=pvFile;window.pvRenderPage=pvRenderPage;window.pvPage=pvPage;window.pvZoom=pvZoom;
window.pvImgFit=pvImgFit;window.pvZoomImg=pvZoomImg;window.pvImgReset=pvImgReset;
window.pvImgApplyTransform=pvImgApplyTransform;window.pvFallbackLoad=pvFallbackLoad;

/* ═══════════════ FAB ═══════════════ */
let _fabOpen=false;
window.toggleFab=function(){
  _fabOpen=!_fabOpen;
  const btn=document.getElementById('fab-btn');
  const actions=document.getElementById('fab-actions');
  if(!btn||!actions)return;
  if(_fabOpen){
    btn.textContent='✕';
    actions.style.display='flex';
    if(window.Motion&&window.Motion.animate){
      const items=actions.querySelectorAll('.fab-action');
      items.forEach((a,i)=>{
        a.style.opacity='0';
        window.Motion.animate(a,{opacity:[0,1],transform:['translateY(20px) scale(0.8)','translateY(0px) scale(1)']},{duration:.25,delay:i*.05,easing:[.34,1.56,.64,1]});
      });
    }
  }else{
    btn.textContent='+';
    if(window.Motion&&window.Motion.animate){
      const items=[...actions.querySelectorAll('.fab-action')];
      items.forEach((a,i)=>{
        window.Motion.animate(a,{opacity:[1,0],transform:['translateY(0px) scale(1)','translateY(20px) scale(0.8)']},{duration:.15,delay:(items.length-1-i)*.03,easing:[.25,1,.5,1]}).then(()=>{if(!_fabOpen)actions.style.display='none';});
      });
    }else{
      actions.style.display='none';
    }
  }
};
window.closeFab=function(){
  if(_fabOpen){_fabOpen=false;const btn=document.getElementById('fab-btn');const actions=document.getElementById('fab-actions');if(btn)btn.textContent='+';if(actions)actions.style.display='none';}
};
