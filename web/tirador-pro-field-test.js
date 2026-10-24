(function(){
  'use strict';
  if(window.__TIRADOR_PRO_FIELD_TEST__!==true)return;
  const VERSION=String(window.__TIRADOR_PRO_VERSION__||'field-test');
  const FORMAT='TiradorProFieldTest';
  const RUN_FORMAT='tirador-pro-field-test-results';
  const RUN_KEY='tpfield_test_run_v2';
  const PLAN=window.__TIRADOR_PRO_FIELD_PLAN__&&Array.isArray(window.__TIRADOR_PRO_FIELD_PLAN__.cases)?window.__TIRADOR_PRO_FIELD_PLAN__:{format:'tirador-pro-field-test-plan',version:1,appVersion:VERSION,cases:[]};
  const STORAGE_KEYS=[
    'tpfield34_trainingHistory',
    'tpfield37_weaponsV38',
    'tpfield37_weaponExt',
    'tpfield37_ammoInventory',
    'tpfield37_competitions',
    'tpfield37_fieldChecklist',
    'tpfield37_fieldSelectedWeapons',
    'tpfield37_prefs'
  ];
  const FORBIDDEN_PREFIXES=['tpfield36_'];
  const FORBIDDEN_KEYS=new Set(['tpfield37_additionalDocs','tpfield37_activityRecords','tpfield37_federation','tpfield37_legalRules','tpfield37_backupMeta']);

  function toast(msg){try{window.showToast?.(msg)}catch{} }
  function parseStored(key){try{const raw=localStorage.getItem(key);return raw==null?null:JSON.parse(raw)}catch{return null}}
  function esc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function sanitizeWeapons(value){
    if(!Array.isArray(value))return value;
    return value.map(w=>{
      if(!w||typeof w!=='object')return w;
      const c={...w};
      delete c.guide; delete c.guideNumber; delete c.documentNumber; delete c.serial; delete c.serialNumber;
      return c;
    });
  }
  function sanitizeValue(key,value){
    if(key==='tpfield37_weaponsV38')return sanitizeWeapons(value);
    if(key==='tpfield37_weaponExt'&&value&&typeof value==='object'){
      const out={};
      for(const [id,v] of Object.entries(value))out[id]=v&&typeof v==='object'?Object.fromEntries(Object.entries(v).filter(([k])=>!['guide','guideNumber','documentNumber','serial','serialNumber'].includes(k))):v;
      return out;
    }
    return value;
  }
  function snapshot(){
    const storage={};
    for(const key of STORAGE_KEYS){const value=parseStored(key);if(value!==null)storage[key]=sanitizeValue(key,value)}
    return {format:FORMAT,version:1,appVersion:VERSION,exportedAt:new Date().toISOString(),testOnly:true,containsSensitiveDocuments:false,storage};
  }
  function download(name,text){
    if(typeof window.downloadText==='function')return window.downloadText(name,text,'application/json');
    const blob=new Blob([text],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  }
  function exportData(){
    const data=snapshot();
    download(`Tirador-Pro-Campo-${new Date().toISOString().slice(0,10)}.tpfield.json`,JSON.stringify(data,null,2));
    toast('Datos de prueba de campo exportados.');
  }
  async function confirmAction(message,title){
    if(typeof window.tp38Confirm==='function')return !!(await window.tp38Confirm(message,title));
    return false;
  }
  async function importText(text){
    const data=JSON.parse(text);
    if(data?.format!==FORMAT||data?.version!==1||!data.storage||typeof data.storage!=='object')throw new Error('Archivo de prueba de campo no compatible.');
    for(const key of Object.keys(data.storage)){
      if(!STORAGE_KEYS.includes(key)||FORBIDDEN_KEYS.has(key)||FORBIDDEN_PREFIXES.some(p=>key.startsWith(p)))throw new Error(`Clave no permitida en prueba de campo: ${key}`);
    }
    if(!(await confirmAction('Se reemplazarán los datos locales de esta prueba de campo. No afecta a la app nativa. ¿Continuar?','Importar prueba de campo')))return false;
    for(const key of STORAGE_KEYS)localStorage.removeItem(key);
    for(const [key,value] of Object.entries(data.storage))localStorage.setItem(key,JSON.stringify(sanitizeValue(key,value)));
    location.reload();
    return true;
  }
  function chooseImport(){
    const input=document.createElement('input');input.type='file';input.accept='.json,.tpfield.json,application/json';input.style.display='none';
    input.addEventListener('change',async()=>{const file=input.files?.[0];input.remove();if(!file)return;try{await importText(await file.text())}catch(e){console.error(e);toast(e?.message||'No se pudo importar la prueba de campo.')}});
    document.body.appendChild(input);input.click();
  }
  async function clearData(){
    if(!(await confirmAction('Se borrarán únicamente los datos locales de la prueba HTML de campo. ¿Continuar?','Reiniciar prueba de campo')))return;
    for(const key of STORAGE_KEYS)localStorage.removeItem(key);
    location.reload();
  }
  async function requestPersistentStorage(){
    try{
      if(!navigator.storage?.persist)return {supported:false,persisted:false};
      const already=await navigator.storage.persisted?.();
      const persisted=already||await navigator.storage.persist();
      document.documentElement.dataset.fieldStoragePersisted=persisted?'true':'false';
      return {supported:true,persisted};
    }catch{return {supported:true,persisted:false}}
  }
  function blockSensitiveScreens(){
    const nav=document.getElementById('n-cartera');if(nav)nav.style.display='none';
    const original=window.go;
    if(typeof original==='function')window.go=function(id){if(['cartera','documentScanner','federacion'].includes(id)){toast('Documentación sensible desactivada en la prueba HTML de campo.');return}return original.apply(this,arguments)};
    window.exportEncryptedBackup=()=>toast('Backup v2 pertenece a la app nativa. En HTML usa “Exportar prueba de campo”.');
    window.importBackupFile=()=>toast('La restauración .tpbackup está desactivada en la prueba HTML de campo.');
  }

  function newRun(){
    return {
      format:RUN_FORMAT,
      version:2,
      appVersion:VERSION,
      tester:'',
      device:{platform:(navigator.userAgentData?.platform||navigator.platform||'').slice(0,80),model:'',browser:detectBrowser(),osVersion:''},
      startedAt:new Date().toISOString(),
      completedAt:null,
      results:PLAN.cases.map(c=>({id:c.id,status:'pending',notes:''}))
    };
  }
  function detectBrowser(){
    const ua=navigator.userAgent||'';
    if(/Edg\//.test(ua))return 'Edge';
    if(/CriOS|Chrome\//.test(ua))return 'Chrome';
    if(/FxiOS|Firefox\//.test(ua))return 'Firefox';
    if(/Safari\//.test(ua))return 'Safari';
    return '';
  }
  function loadRun(){
    try{
      const parsed=JSON.parse(localStorage.getItem(RUN_KEY)||'null');
      if(parsed?.format===RUN_FORMAT&&parsed?.version===2&&parsed?.appVersion===VERSION&&Array.isArray(parsed.results)){
        const map=new Map(parsed.results.map(r=>[r.id,r]));
        parsed.results=PLAN.cases.map(c=>map.get(c.id)||{id:c.id,status:'pending',notes:''});
        return parsed;
      }
    }catch{}
    return newRun();
  }
  function saveRun(run){try{localStorage.setItem(RUN_KEY,JSON.stringify(run));updateFieldButton(run);return true}catch(e){console.error(e);toast('No se pudo guardar el checklist en este navegador.');return false}}
  function resultFor(run,id){return run.results.find(r=>r.id===id)}
  function summary(run){
    const total=PLAN.cases.length;
    const critical=PLAN.cases.filter(c=>c.critical).length;
    const counts={pass:0,fail:0,blocked:0,skip:0,pending:0};
    for(const r of run.results){if(counts[r.status]===undefined)counts.pending++;else counts[r.status]++}
    const done=total-counts.pending;
    const criticalPass=PLAN.cases.filter(c=>c.critical&&resultFor(run,c.id)?.status==='pass').length;
    return {total,critical,done,criticalPass,...counts};
  }
  async function sha256Hex(bytes){
    if(!window.crypto?.subtle)throw new Error('SHA-256 no disponible en este navegador.');
    const digest=await window.crypto.subtle.digest('SHA-256',bytes);
    return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');
  }
  async function evidenceBinding(){
    try{
      if(location.protocol==='file:')throw new Error('HTML único abierto como archivo local.');
      const response=await fetch('./FIELD_TEST_BUILD_MANIFEST.json',{cache:'no-store'});
      if(!response.ok)throw new Error(`Manifest HTTP ${response.status}`);
      const bytes=await response.arrayBuffer();
      const manifest=JSON.parse(new TextDecoder().decode(bytes));
      if(manifest?.format!=='tirador-pro-field-test-build-manifest'||manifest?.appVersion!==VERSION)throw new Error('Manifest no corresponde a esta build.');
      return {eligible:true,fieldTestManifestSha256:await sha256Hex(bytes),reason:'Build formal PWA verificada'};
    }catch(e){
      return {eligible:false,fieldTestManifestSha256:null,reason:e?.message||'Manifest de build no disponible'};
    }
  }
  async function exportResults(){
    const run=loadRun();
    const binding=await evidenceBinding();
    const now=new Date().toISOString();
    const exported={
      format:RUN_FORMAT,
      version:2,
      appVersion:VERSION,
      fieldTestManifestSha256:binding.fieldTestManifestSha256,
      evidenceEligibleForRc:binding.eligible,
      evidenceNote:binding.reason,
      tester:String(run.tester||'').slice(0,80),
      device:{platform:String(run.device?.platform||'').slice(0,80),model:String(run.device?.model||'').slice(0,120),browser:String(run.device?.browser||'').slice(0,80),osVersion:String(run.device?.osVersion||'').slice(0,80)},
      startedAt:run.startedAt||now,
      completedAt:now,
      results:PLAN.cases.map(c=>{
        const r=resultFor(run,c.id)||{status:'pending',notes:''};
        return {id:c.id,status:r.status==='pending'?'blocked':r.status,notes:r.status==='pending'?(r.notes||'Pendiente de ejecución en campo'):String(r.notes||'').slice(0,1200)};
      })
    };
    run.completedAt=now;saveRun(run);
    download(`Tirador-Pro-Campo-Resultados-${VERSION}-${now.slice(0,10)}.json`,JSON.stringify(exported,null,2));
    toast(binding.eligible?'Resultados ligados a esta build y exportados.':'Resultados exportados como evidencia NO apta para RC: usa la PWA formal por HTTPS.');
    renderChecklistStatus();
    return exported;
  }
  async function resetRun(){
    if(!(await confirmAction('Se reiniciarán únicamente las marcas PASS/FAIL/BLOCKED y notas del checklist de campo. Los datos de armas/entrenamientos no se borrarán. ¿Continuar?','Reiniciar checklist')))return;
    const fresh=newRun();localStorage.setItem(RUN_KEY,JSON.stringify(fresh));renderChecklistPanel(fresh);updateFieldButton(fresh);toast('Checklist de campo reiniciado.');
  }
  function statusLabel(status){return ({pass:'PASS',fail:'FAIL',blocked:'BLOQ',skip:'OMITIR',pending:'PEND'})[status]||'PEND'}
  function statusSymbol(status){return ({pass:'✓',fail:'✕',blocked:'!',skip:'→',pending:'·'})[status]||'·'}
  function statusButton(id,status,current,allowed=true){
    const active=current===status?' data-active="true"':'';
    return `<button type="button" class="tpFieldStatusBtn" data-case="${esc(id)}" data-status="${status}"${active}${allowed?'':' disabled'}>${statusSymbol(status)} ${statusLabel(status)}</button>`;
  }
  function renderChecklistPanel(run){
    const body=document.getElementById('tpFieldChecklistBody');if(!body)return;
    const s=summary(run);
    body.innerHTML=`
      <div class="tpFieldSummary"><b>${s.done}/${s.total} revisados</b><span>Críticos PASS ${s.criticalPass}/${s.critical}</span><span>✓ ${s.pass} · ✕ ${s.fail} · ! ${s.blocked} · → ${s.skip}</span></div>
      <div class="tpFieldMeta">
        <label>Tester / iniciales<input id="tpFieldTester" maxlength="80" value="${esc(run.tester||'')}" placeholder="Ej. RG"></label>
        <label>Dispositivo<input id="tpFieldDevice" maxlength="120" value="${esc(run.device?.model||'')}" placeholder="Ej. iPhone 16 Plus"></label>
        <label>SO<input id="tpFieldOs" maxlength="80" value="${esc(run.device?.osVersion||'')}" placeholder="Ej. iOS 26"></label>
      </div>
      <div class="tpFieldCaseList">${PLAN.cases.map(c=>{const r=resultFor(run,c.id)||{status:'pending',notes:''};return `<article class="tpFieldCase" data-case-card="${esc(c.id)}"><div class="tpFieldCaseHead"><div><b>${esc(c.id)} · ${esc(c.title)}</b><small>${c.critical?'CRÍTICO':'NO CRÍTICO'}</small></div><strong data-case-state="${esc(c.id)}">${statusSymbol(r.status)} ${statusLabel(r.status)}</strong></div><p>${esc(c.expected)}</p><div class="tpFieldStatusRow">${statusButton(c.id,'pass',r.status)}${statusButton(c.id,'fail',r.status)}${statusButton(c.id,'blocked',r.status)}${statusButton(c.id,'skip',r.status,!c.critical)}</div><textarea data-case-notes="${esc(c.id)}" maxlength="1200" placeholder="Notas, incidencia, condiciones reales…">${esc(r.notes||'')}</textarea></article>`}).join('')}</div>`;
    for(const input of body.querySelectorAll('#tpFieldTester,#tpFieldDevice,#tpFieldOs'))input.addEventListener('input',()=>{const current=loadRun();current.tester=document.getElementById('tpFieldTester')?.value||'';current.device=current.device||{};current.device.model=document.getElementById('tpFieldDevice')?.value||'';current.device.osVersion=document.getElementById('tpFieldOs')?.value||'';saveRun(current)});
    for(const btn of body.querySelectorAll('.tpFieldStatusBtn'))btn.addEventListener('click',()=>{if(btn.disabled)return;const current=loadRun();const r=resultFor(current,btn.dataset.case);if(!r)return;r.status=btn.dataset.status;saveRun(current);renderChecklistPanel(current)});
    for(const note of body.querySelectorAll('[data-case-notes]'))note.addEventListener('input',()=>{const current=loadRun();const r=resultFor(current,note.dataset.caseNotes);if(!r)return;r.notes=note.value;saveRun(current)});
    renderChecklistStatus();
  }
  async function renderChecklistStatus(){
    const el=document.getElementById('tpFieldEvidenceStatus');if(!el)return;
    el.textContent='Comprobando evidencia de build…';el.dataset.state='checking';
    const b=await evidenceBinding();
    if(!document.getElementById('tpFieldEvidenceStatus'))return;
    el.textContent=b.eligible?`EVIDENCIA RC VÁLIDA · ${b.fieldTestManifestSha256.slice(0,12)}…`:`NO APTA PARA RC · ${b.reason}`;
    el.dataset.state=b.eligible?'ok':'warn';
  }
  function ensureChecklistUi(){
    if(document.getElementById('tpFieldChecklistOverlay'))return;
    const style=document.createElement('style');style.id='tpFieldChecklistStyles';style.textContent=`
      #tpFieldChecklistButton{position:fixed;left:10px;bottom:82px;z-index:9997;border:0;border-radius:999px;background:#27291f;color:#fff;padding:9px 12px;font:800 11px/1 system-ui;box-shadow:0 4px 18px #0007}
      #tpFieldChecklistOverlay{display:none;position:fixed;inset:0;z-index:10050;background:#0c0d0aee;color:#f7f7f2;font-family:system-ui,-apple-system,sans-serif}
      #tpFieldChecklistOverlay[data-open="true"]{display:flex;flex-direction:column}
      .tpFieldPanelHead{display:flex;gap:10px;align-items:center;padding:12px 14px;border-bottom:1px solid #ffffff18;background:#161812}.tpFieldPanelHead>div{flex:1}.tpFieldPanelHead b{display:block;font-size:16px}.tpFieldPanelHead small{display:block;color:#b7bca7;margin-top:2px}.tpFieldPanelHead button{border:0;background:#ffffff12;color:#fff;border-radius:10px;padding:9px 11px;font-weight:800}
      #tpFieldEvidenceStatus{margin:10px 12px 0;padding:8px 10px;border-radius:10px;background:#ffffff0d;font:800 11.5px/1.3 system-ui;letter-spacing:.3px}#tpFieldEvidenceStatus[data-state="ok"]{background:#183927;color:#baf2cf}#tpFieldEvidenceStatus[data-state="warn"]{background:#4a3216;color:#ffd795}
      #tpFieldChecklistBody{overflow:auto;padding:10px 12px 120px}.tpFieldSummary{display:grid;grid-template-columns:1fr auto;gap:6px 12px;padding:12px;border-radius:14px;background:#1d1f17;margin-bottom:10px}.tpFieldSummary span{color:#bdc2af;font-size:12px}.tpFieldMeta{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:10px}.tpFieldMeta label{font-size:11.5px;color:#b7bca7}.tpFieldMeta input{display:block;width:100%;box-sizing:border-box;margin-top:4px;border:1px solid #ffffff1c;background:#161812;color:#fff;border-radius:10px;padding:9px}
      .tpFieldCase{background:#1d1f17;border:1px solid #ffffff12;border-radius:14px;padding:11px;margin:8px 0}.tpFieldCaseHead{display:flex;gap:8px;justify-content:space-between}.tpFieldCaseHead b{font-size:13px}.tpFieldCaseHead small{display:block;color:#f5c85f;font-size:11px;margin-top:3px}.tpFieldCaseHead strong{font-size:11px;color:#d4d4bd}.tpFieldCase p{font-size:12px;color:#d4d4bb;line-height:1.45}.tpFieldStatusRow{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.tpFieldStatusBtn{border:1px solid #ffffff16;background:#161812;color:#e0e0cf;border-radius:9px;padding:8px 4px;font-size:11.5px;font-weight:900}.tpFieldStatusBtn[data-active="true"]{background:#5e644c;color:white;border-color:#7a8547}.tpFieldStatusBtn:disabled{opacity:.25}.tpFieldCase textarea{width:100%;box-sizing:border-box;min-height:58px;margin-top:8px;border:1px solid #ffffff16;background:#13140f;color:#f3f3ed;border-radius:10px;padding:8px;font:12px/1.4 system-ui;resize:vertical}
      .tpFieldPanelActions{position:absolute;left:0;right:0;bottom:0;display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:10px 12px calc(10px + env(safe-area-inset-bottom));background:#161812f2;border-top:1px solid #ffffff18}.tpFieldPanelActions button{border:0;border-radius:11px;padding:12px;font-weight:900}.tpFieldPanelActions .primary{background:#f6c344;color:#1b1c15}.tpFieldPanelActions .secondary{background:#393d2e;color:#fff}
      @media(max-width:640px){.tpFieldMeta{grid-template-columns:1fr}.tpFieldStatusRow{grid-template-columns:repeat(2,1fr)}}
    `;document.head.appendChild(style);
    const btn=document.createElement('button');btn.id='tpFieldChecklistButton';btn.type='button';btn.textContent='PRUEBAS 0/'+PLAN.cases.length;btn.addEventListener('click',openChecklist);btn.style.display='none';document.body.appendChild(btn);
    const overlay=document.createElement('div');overlay.id='tpFieldChecklistOverlay';overlay.innerHTML=`<div class="tpFieldPanelHead"><div><b>Checklist · Prueba real de campo</b><small>${esc(VERSION)} · resultado ligado a build cuando se usa la PWA formal</small></div><button type="button" id="tpFieldCloseChecklist">CERRAR</button></div><div id="tpFieldEvidenceStatus">Comprobando evidencia de build…</div><div id="tpFieldChecklistBody"></div><div class="tpFieldPanelActions"><button type="button" class="secondary" id="tpFieldResetChecklist">REINICIAR CHECKLIST</button><button type="button" class="primary" id="tpFieldExportResults">EXPORTAR RESULTADOS</button></div>`;
    document.body.appendChild(overlay);
    document.getElementById('tpFieldCloseChecklist').addEventListener('click',closeChecklist);
    document.getElementById('tpFieldResetChecklist').addEventListener('click',resetRun);
    document.getElementById('tpFieldExportResults').addEventListener('click',exportResults);
    updateFieldButton(loadRun());
  }
  function openChecklist(){ensureChecklistUi();const overlay=document.getElementById('tpFieldChecklistOverlay');if(overlay)overlay.dataset.open='true';renderChecklistPanel(loadRun())}
  function closeChecklist(){const overlay=document.getElementById('tpFieldChecklistOverlay');if(overlay)overlay.dataset.open='false'}
  function updateFieldButton(run){const btn=document.getElementById('tpFieldChecklistButton');if(!btn)return;const s=summary(run||loadRun());btn.textContent=`PRUEBAS ${s.done}/${s.total}`}

  function addBadge(){
    if(document.getElementById('tpFieldBadge'))return;
    const el=document.createElement('div');el.id='tpFieldBadge';el.textContent='PRUEBA DE CAMPO · R7';
    el.style.cssText='position:fixed;right:10px;bottom:82px;z-index:9997;padding:7px 10px;border-radius:999px;background:#f6c344;color:#151711;font:900 11.5px/1 system-ui;letter-spacing:.8px;box-shadow:0 3px 12px #0005;pointer-events:none';
    document.body.appendChild(el);
  }
  function addFieldProfileControls(){
    const root=document.getElementById('perfil');if(!root||root.querySelector('#tpFieldControls'))return;
    root.querySelectorAll('[onclick*="exportEncryptedBackup"],[onclick*="backupImportInput"],[onclick*="exportBetaDiagnostics"]').forEach(el=>el.remove());
    const box=document.createElement('div');box.id='tpFieldControls';
    box.innerHTML=`<div class="sectionHead"><b>Prueba de campo HTML</b><span>VERSIÓN R9</span></div><div class="controlCard"><div class="muted">Datos guardados únicamente en este navegador. No introduzcas licencias, documentos, OCR ni información sensible. Esta build no sustituye a la app cifrada.</div></div><button class="btn primary" onclick="TiradorProFieldTest.openChecklist()">ABRIR CHECKLIST DE CAMPO</button><button class="btn primary" onclick="TiradorProFieldTest.exportResults()">EXPORTAR RESULTADOS DE PRUEBA</button><button class="btn secondary" onclick="TiradorProFieldTest.exportData()">EXPORTAR DATOS DE PRUEBA</button><button class="btn secondary" onclick="TiradorProFieldTest.importData()">IMPORTAR DATOS DE PRUEBA</button><button class="btn ghost" onclick="TiradorProFieldTest.clearData()">REINICIAR DATOS DE CAMPO</button>`;
    root.appendChild(box);
  }
  function wrapProfile(){
    const original=window.renderProfile37;
    if(typeof original==='function'){
      window.renderProfile37=function(){const r=original.apply(this,arguments);addFieldProfileControls();return r};
      try{window.renderProfile37()}catch{}
    }else addFieldProfileControls();
  }
  function registerOffline(){
    if(!('serviceWorker'in navigator))return;
    if(location.protocol!=='https:'&&location.hostname!=='localhost'&&location.hostname!=='127.0.0.1')return;
    navigator.serviceWorker.register('./field-test-sw.js',{scope:'./'}).catch(e=>console.warn('[Tirador Pro field-test SW]',e));
  }
  ensureChecklistUi();wrapProfile();registerOffline();
  window.addEventListener('pointerdown',()=>{if(sessionStorage.getItem('tpFieldPersistAsked'))return;sessionStorage.setItem('tpFieldPersistAsked','1');requestPersistentStorage()},{once:true,passive:true});
  window.TiradorProFieldTest={format:FORMAT,version:1,appVersion:VERSION,snapshot,exportData,importData:chooseImport,clearData,requestPersistentStorage,openChecklist,closeChecklist,exportResults,evidenceBinding,resetRun,loadRun};
})();
