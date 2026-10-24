const CACHE="tirador-pro-field-4.0.0-alpha.31-r26-2";
const ASSETS=['./','./index.html','./manifest.webmanifest','./FIELD_TEST_PLAN.json','./FIELD_TEST_BUILD_MANIFEST.json','./web/tirador-pro-v4-cockpit.js','./web/tirador-pro-v4-write-bridge.js','./web/tirador-pro-field-test.js','./web/tirador-pro-ios-fix.js','./web/tirador-pro-campo-mejoras.js','./web/tirador-pro-r7-entreno.js','./web/tirador-pro-r8-pulido.js','./web/tirador-pro-r9-bloqueo.js','./web/tirador-pro-r10-operativa.js','./web/tirador-pro-r11-ocr.js','./web/tirador-pro-r13-estable.js','./web/tirador-pro-r14-timer-avisos.js','./web/tirador-pro-r15-municion.js','./web/tirador-pro-r16-checklist.js','./web/tirador-pro-r17-inicio.js','./web/tirador-pro-r18-foto-calendario.js','./web/tirador-pro-r19-fotos-docs.js','./web/tirador-pro-r20-identificacion.js','./web/tirador-pro-r21-escaner.js','./web/tirador-pro-r22-guias.js','./web/tirador-pro-r23-foto-escaner.js','./web/tirador-pro-r25-revista.js'];
// Solo se guarda en caché una respuesta correcta (200) y propia: así la página de contraseña
// de Netlify o un error nunca sustituyen a la app guardada para usar sin cobertura.
const good=r=>r&&r.ok&&r.status===200&&r.type==='basic'&&!r.redirected;
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('tirador-pro-field-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  // Lector OCR (Tesseract) desde la web de Tirador Deportivo: se guarda para usarlo sin cobertura
  if(u.href.indexOf('https://potox42.github.io/app-armas/ocr/')===0){
    e.respondWith(caches.open('tirador-pro-ocr-v1').then(c=>c.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{if(r&&r.ok)c.put(e.request,r.clone());return r}))));
    return;
  }
  if(u.origin!==location.origin)return;
  if(e.request.mode==='navigate'){
    e.respondWith(fetch(e.request).then(r=>{
      if(good(r)){const copy=r.clone();caches.open(CACHE).then(c=>c.put('./index.html',copy));return r}
      return caches.match('./index.html').then(hit=>hit||r);
    }).catch(()=>caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{
    if(good(r)){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}
    return r;
  }).catch(()=>caches.match('./index.html'))));
});
