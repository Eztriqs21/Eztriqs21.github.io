// js/supabase-sync.js
import { DB } from './data.js';
import { om, cm, toast, getStorageBucket, storageErrorMessage, uid, fileExt, isAllowedUpload, isPdfFile, isImageFile } from './helpers.js';

const SUPA_KEY='jeehq_supa_config';
const SYNC_KEY_STORAGE='jeehq_sync_key';
export let supaClient=null;
export let supaConfig=null;
export let currentSyncKey=null;

/* Sync timestamps for merge reconciliation */
const SYNC_TS_KEY='jeehq3_sync_ts';
function loadSyncTimestamps(){
  try{return JSON.parse(localStorage.getItem(SYNC_TS_KEY))||{};}catch(e){return{};}
}
function saveSyncTimestamps(ts){try{localStorage.setItem(SYNC_TS_KEY,JSON.stringify(ts));}catch(e){}}
const SYNC_ENTITIES=['chapters','assignments','tests','studyLogs','mockTests','doubtChats','prepChat','revision'];

/* Offline sync queue */
const SYNC_QUEUE_KEY='jeehq3_sync_q';
function loadSyncQueue(){try{return JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY))||[];}catch(e){return[];}}
function saveSyncQueue(q){try{localStorage.setItem(SYNC_QUEUE_KEY,JSON.stringify(q));}catch(e){}}
export function enqueueSync(){const q=loadSyncQueue();q.push({ts:Date.now()});saveSyncQueue(q);}
async function flushSyncQueue(){
  const q=loadSyncQueue();if(!q.length)return;
  saveSyncQueue([]);
  try{await pushToSupabase();}catch(e){console.warn('Sync queue flush failed:',e);saveSyncQueue(q);}
}

export function loadSupaConfig(){
  try{supaConfig=JSON.parse(localStorage.getItem(SUPA_KEY))||null;}catch(e){supaConfig=null;}
  try{currentSyncKey=localStorage.getItem(SYNC_KEY_STORAGE)||null;}catch(e){currentSyncKey=null;}
  updateSupaStatus();
  updateSyncUI();
  if(supaConfig&&supaConfig.url&&supaConfig.key){
    try{
      const { createClient } = window.supabase;
      supaClient = createClient(supaConfig.url, supaConfig.key);
    }catch(e){console.error('Supabase init error:',e);supaClient=null;}
  }
}
function updateSupaStatus(){
  const el=document.getElementById('supa-status');if(!el)return;
  if(!supaConfig||!supaConfig.url){el.textContent='Not configured';el.style.color='var(--faint)';return;}
  el.textContent='☁️ Sync active';el.style.color='var(--green)';
}
function updateSyncUI(){
  const statusEl=document.getElementById('auth-status');
  const outBtn=document.getElementById('auth-out-btn');
  if(!statusEl)return;
  if(currentSyncKey){
    statusEl.textContent='🟢 Key: '+currentSyncKey.slice(0,8)+'...';
    statusEl.style.color='var(--green)';
    if(outBtn)outBtn.style.display='flex';
  }else{
    statusEl.textContent='🔴 No sync key';
    statusEl.style.color='var(--faint)';
    if(outBtn)outBtn.style.display='none';
  }
}
export function openAuthModal(){
  document.getElementById('sync-key-input').value=currentSyncKey||'';
  om('m-auth');
  setTimeout(()=>document.getElementById('sync-key-input').focus(),320);
}
export function saveSyncKey(){
  const key=document.getElementById('sync-key-input').value.trim();
  if(!key){toast('⚠️ Enter a sync key');return;}
  currentSyncKey=key;
  localStorage.setItem(SYNC_KEY_STORAGE,key);
  updateSyncUI();
  cm('m-auth');
  toast('✅ Sync key saved! Use same key on other devices.');
}
export function clearSyncKey(){
  currentSyncKey=null;
  localStorage.removeItem(SYNC_KEY_STORAGE);
  updateSyncUI();
  toast('🗑️ Sync key cleared');
}
export function openSupabaseConfig(){
  loadSupaConfig();
  const urlEl=document.getElementById('supa-url');
  const keyEl=document.getElementById('supa-key');
  const tableEl=document.getElementById('supa-table');
  const bucketEl=document.getElementById('supa-bucket');
  if(!urlEl||!keyEl||!tableEl) return;
  if(supaConfig){
    urlEl.value=supaConfig.url||'';
    keyEl.value=supaConfig.key||'';
    tableEl.value=supaConfig.table||'jeehq_data';
    if(bucketEl)bucketEl.value=supaConfig.bucket||getStorageBucket();
  }else{
    urlEl.value='';keyEl.value='';
    tableEl.value='jeehq_data';
    if(bucketEl)bucketEl.value=getStorageBucket();
  }
  om('m-supa-config');
}
export function saveSupabaseConfig(){
  const urlEl=document.getElementById('supa-url');
  const keyEl=document.getElementById('supa-key');
  const tableEl=document.getElementById('supa-table');
  if(!urlEl||!keyEl||!tableEl) return;
  const url=urlEl.value.trim();
  const key=keyEl.value.trim();
  const table=tableEl.value.trim()||'jeehq_data';
  const bucket=(document.getElementById('supa-bucket')?.value.trim())||getStorageBucket();
  if(!url||!key){localStorage.removeItem(SUPA_KEY);supaConfig=null;supaClient=null;updateSupaStatus();cm('m-supa-config');toast('☁️ Cleared');return;}
  if(!url.startsWith('https://')||!url.includes('.supabase.co')){toast('⚠️ Invalid Supabase URL');return;}
  if(!/^[a-z0-9][a-z0-9._-]{0,62}$/i.test(bucket)){toast('⚠️ Invalid bucket name');return;}
  supaConfig={url,key,table,bucket};
  localStorage.setItem(SUPA_KEY,JSON.stringify(supaConfig));
  try{const { createClient } = window.supabase;supaClient=createClient(url,key);}catch(e){toast('⚠️ Init failed: '+e.message);return;}
  updateSupaStatus();cm('m-supa-config');toast('☁️ Saved! Testing connection...');testSupabaseConnection();
}
export async function testStorageBucket(){
  if(!supaClient||!supaConfig)return false;
  const bucket=getStorageBucket();
  try{
    const {error}=await supaClient.storage.from(bucket).list('',{limit:1});
    if(error){
      toast('⚠️ '+storageErrorMessage(error));
      console.error('Storage bucket test error:',{bucket,error});
      return false;
    }
    return true;
  }catch(e){
    toast('⚠️ '+storageErrorMessage(e));
    console.error('Storage bucket test exception:',e);
    return false;
  }
}
async function testSupabaseConnection(){
  if(!supaClient||!supaConfig)return;
  let dbOk=false;
  try{
    const {error}=await supaClient.from(supaConfig.table).select('id').limit(1);
    if(error&&error.code==='42P01'){toast('⚠️ Table "'+supaConfig.table+'" not found — create it in SQL Editor');return;}
    if(error){toast('⚠️ Database error: '+error.message);console.error('Supabase test error:',error);return;}
    dbOk=true;
  }catch(e){toast('⚠️ Connection failed: '+e.message);console.error('Supabase test error:',e);return;}
  const storageOk=await testStorageBucket();
  if(dbOk&&storageOk){
    toast('☁️ Connected! DB + storage bucket "'+getStorageBucket()+'" ready');
  }else if(dbOk){
    toast('☁️ Database OK — fix storage bucket "'+getStorageBucket()+'" for PDF uploads');
  }
}
export async function pushToSupabase(){
  if(!supaClient||!supaConfig){toast('⚠️ Supabase not configured');return;}
  if(!currentSyncKey){toast('⚠️ Set a sync key first (🔑 Set Sync Key)');return;}
  try{
    const now=new Date().toISOString();
    const ts=loadSyncTimestamps();
    const payload={version:'jeehq_v1',updatedAt:now};
    const entityPayload={};
    SYNC_ENTITIES.forEach(k=>{
      const localVal=DB[k];
      const localTs=ts[k]||'';
      entityPayload[k]={data:localVal,updatedAt:localTs};
      payload[k]=localVal;
    });
    payload._timestamps=ts;
    const payloadStr=JSON.stringify(payload);
    const sizeKB=(payloadStr.length/1024).toFixed(1);
    console.log('Push data size:',sizeKB+'KB');

    toast('☁️ Pushing to Supabase...');

    const { data: existing } = await supaClient.from(supaConfig.table).select('id').eq('sync_key',currentSyncKey).limit(1);
    let result;
    if(existing&&existing.length>0){
      result = await supaClient.from(supaConfig.table).update({data:payload,updated_at:now}).eq('sync_key',currentSyncKey).select();
    }else{
      result = await supaClient.from(supaConfig.table).insert({sync_key:currentSyncKey,data:payload}).select();
    }
    if(result.error){toast('⚠️ Push failed: '+result.error.message);console.error('Push error:',result.error);}
    else{
      const newTs=loadSyncTimestamps();
      SYNC_ENTITIES.forEach(k=>{newTs[k]=now;});
      saveSyncTimestamps(newTs);
      toast('☁️ Synced! ('+sizeKB+'KB)');
    }
  }catch(e){toast('⚠️ Push error: '+e.message);console.error('Push exception:',e);}
}
export async function pullFromSupabase(){
  if(!supaClient||!supaConfig){toast('⚠️ Supabase not configured');return;}
  if(!currentSyncKey){toast('⚠️ Set a sync key first (🔑 Set Sync Key)');return;}
  try{
    toast('🔄 Loading from Supabase...');
    const { data, error } = await supaClient.from(supaConfig.table).select('data').eq('sync_key',currentSyncKey).order('updated_at',{ascending:false}).limit(1);
    if(error){toast('⚠️ Load failed: '+error.message);console.error('Pull error:',error);return;}
    if(!data||data.length===0){toast('⚠️ No cloud data found. Push first!');return;}

    const parsed=data[0].data;
    if(!parsed){toast('⚠️ Empty data');return;}

    const localTs=loadSyncTimestamps();
    const cloudTs=parsed._timestamps||{};
    let mergedCount=0;
    SYNC_ENTITIES.forEach(k=>{
      if(!parsed[k])return;
      if(parsed[k]===DB[k])return;
      const localT=localTs[k]||'';
      const cloudT=cloudTs[k]||'';
      if(cloudT>=localT||!DB[k]){
        DB[k]=JSON.parse(JSON.stringify(parsed[k]));
        mergedCount++;
      }
    });
    saveSyncTimestamps(cloudTs);

    window.resetEphemeralUiState();
    window.persistAllLocal({skipBudgetCheck:true});
    requestAnimationFrame(()=>{
      window.render();
    });
    toast('☁️ Merged! ('+mergedCount+' entities updated)');
  }catch(e){toast('⚠️ Load error: '+e.message);console.error('Pull exception:',e);}
}
function autoSync(){
  if(!supaClient||!supaConfig||!currentSyncKey)return;
  pushToSupabase().catch(function(e){console.warn('autoSync push failed:',e);});
}

/* ═══════════════ WINDOW EXPORTS ═══════════════ */
window.saveSyncKey=saveSyncKey;window.clearSyncKey=clearSyncKey;
window.pushToSupabase=pushToSupabase;window.pullFromSupabase=pullFromSupabase;
window.openSupabaseConfig=openSupabaseConfig;window.saveSupabaseConfig=saveSupabaseConfig;
window.openAuthModal=openAuthModal;window.loadSupaConfig=loadSupaConfig;
window.testStorageBucket=testStorageBucket;window.testSupabaseConnection=testSupabaseConnection;
window.autoSync=autoSync;window.enqueueSync=enqueueSync;

/* Proxy setters so window keeps in sync when module vars change */
Object.defineProperty(window,'supaClient',{get:()=>supaClient,set:v=>{supaClient=v;}});
Object.defineProperty(window,'supaConfig',{get:()=>supaConfig,set:v=>{supaConfig=v;}});
Object.defineProperty(window,'currentSyncKey',{get:()=>currentSyncKey,set:v=>{currentSyncKey=v;}});
