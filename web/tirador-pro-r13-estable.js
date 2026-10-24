/* Tirador Pro · R13 · estabilización (sin funciones nuevas)
   1. Fotos de documentos fuera de localStorage: van a IndexedDB (mucho más espacio).
      En localStorage solo queda una referencia "tpimg:<id>". Con PIN, las fotos se guardan cifradas.
   2. Copias de seguridad protegidas con contraseña por defecto (AES-256-GCM); sin cifrar solo tras aviso.
   3. Importación segura: valida, guarda el estado anterior (se puede deshacer) y espera a que todo se guarde.
   4. Corrige la llamada en bucle de la copia cuando el navegador no permite compartir archivos.
   Se carga el último. */
(function () {
  'use strict';
  var V = window.TPVault || { enabled: false };
  var FT = window.TiradorProFieldTest || {};
  var enc = new TextEncoder(), dec = new TextDecoder();
  var VAULT_KEYS = ['tpfield_vault', 'tpfield_vault_meta'];
  var RX_IMG = /data:image\/[a-z0-9.+\-]+;base64,[A-Za-z0-9+\/=]+/g;
  var RX_REF = /tpimg:[a-z0-9]{8,32}/g;
  function toast(m) { try { window.showToast && window.showToast(m); } catch (e) {} }
  function isData(k) { return typeof k === 'string' && k.indexOf('tpfield') === 0 && VAULT_KEYS.indexOf(k) === -1; }
  function b64(buf) { var s = '', a = new Uint8Array(buf); for (var i = 0; i < a.length; i += 8192) s += String.fromCharCode.apply(null, a.subarray(i, i + 8192)); return btoa(s); }
  function unb64(s) { var b = atob(s), a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; }
  function fnv(str, seed) { var h = seed >>> 0; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return ('0000000' + h.toString(16)).slice(-8); }
  function imgId(dataUrl) { return fnv(dataUrl, 2166136261) + fnv(dataUrl, 0x811c9dc5 ^ 0x5bd1e995) + (dataUrl.length % 4096).toString(16); }

  /* ---------- 1. almacén de fotos en IndexedDB ---------- */
  var dbP = null;
  function db() {
    if (!dbP) dbP = new Promise(function (res, rej) {
      var r = indexedDB.open('tirador-pro', 1);
      r.onupgradeneeded = function () { var d = r.result; if (!d.objectStoreNames.contains('img')) d.createObjectStore('img', { keyPath: 'id' }); if (!d.objectStoreNames.contains('kv')) d.createObjectStore('kv', { keyPath: 'id' }); };
      r.onsuccess = function () { res(r.result); }; r.onerror = function () { rej(r.error); };
    });
    return dbP;
  }
  function tx(store, mode, fn) {
    return db().then(function (d) {
      return new Promise(function (res, rej) {
        var t = d.transaction(store, mode), s = t.objectStore(store), out;
        out = fn(s);
        t.oncomplete = function () { res(out && out.result !== undefined ? out.result : out); };
        t.onerror = function () { rej(t.error); }; t.onabort = function () { rej(t.error || new Error('abort')); };
      });
    });
  }
  function needKey() { return !!(V.enabled && !V.off); }
  function waitKey(ms) {
    return new Promise(function (res, rej) {
      var t0 = Date.now();
      (function poll() { if (!needKey() || V._key) return res(V._key || null); if (Date.now() - t0 > (ms || 15000)) return rej(new Error('Clave no disponible')); setTimeout(poll, 100); })();
    });
  }
  async function sealWith(key, str) {
    if (!key) return { enc: false, data: str };
    var iv = crypto.getRandomValues(new Uint8Array(12));
    var ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, enc.encode(str));
    return { enc: true, iv: b64(iv), data: ct };
  }
  async function openWith(key, rec) {
    if (!rec) return null;
    if (!rec.enc) return rec.data;
    if (!key) throw new Error('Foto cifrada y sin clave');
    var pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(rec.iv) }, key, rec.data);
    return dec.decode(pt);
  }
  var cache = new Map(), queue = Promise.resolve(), pendingN = 0;
  var TPImg = window.TPImg = {
    cache: cache,
    put: function (id, dataUrl) {
      cache.set(id, dataUrl); pendingN++;
      queue = queue.then(async function () {
        var key = needKey() ? await waitKey() : null;
        var rec = await sealWith(key, dataUrl); rec.id = id; rec.t = Date.now();
        await tx('img', 'readwrite', function (s) { return s.put(rec); });
      }).catch(function (e) { console.error('[Fotos] no se pudo guardar', e); try { window.dispatchEvent(new Event('tp-quota')); } catch (x) {} })
        .then(function () { pendingN--; });
      return queue;
    },
    get: async function (id) {
      if (cache.has(id)) return cache.get(id);
      var rec = await tx('img', 'readonly', function (s) { return s.get(id); });
      if (!rec) return null;
      var key = rec.enc ? await waitKey() : null;
      var v = await openWith(key, rec); if (v) cache.set(id, v); return v;
    },
    drain: function () { return queue; },
    pending: function () { return pendingN; },
    all: function () { return tx('img', 'readonly', function (s) { return s.getAll(); }); },
    rekey: async function (oldKey, newKey) {
      await queue;
      var recs = await TPImg.all();
      for (var i = 0; i < recs.length; i++) {
        var v = await openWith(oldKey, recs[i]);
        var n = await sealWith(newKey, v); n.id = recs[i].id; n.t = recs[i].t || Date.now();
        await tx('img', 'readwrite', function (s) { return s.put(n); });
      }
      var kvs = await tx('kv', 'readonly', function (s) { return s.getAll(); });
      for (var j = 0; j < kvs.length; j++) {
        var v2 = await openWith(oldKey, kvs[j]);
        var n2 = await sealWith(newKey, v2); n2.id = kvs[j].id; n2.t = kvs[j].t;
        await tx('kv', 'readwrite', function (s) { return s.put(n2); });
      }
    },
    wipe: async function () { try { await tx('img', 'readwrite', function (s) { return s.clear(); }); await tx('kv', 'readwrite', function (s) { return s.clear(); }); } catch (e) {} cache.clear(); },
    kvSet: async function (id, str) { var key = needKey() ? await waitKey() : null; var rec = await sealWith(key, str); rec.id = id; rec.t = Date.now(); await tx('kv', 'readwrite', function (s) { return s.put(rec); }); },
    kvGet: async function (id) { var rec = await tx('kv', 'readonly', function (s) { return s.get(id); }); if (!rec) return null; var key = rec.enc ? await waitKey() : null; return openWith(key, rec); },
    kvDel: function (id) { return tx('kv', 'readwrite', function (s) { return s.delete(id); }); },
    extract: function (str) {
      if (typeof str !== 'string' || str.indexOf('data:image') === -1) return str;
      return str.replace(RX_IMG, function (m) { var id = imgId(m); if (!cache.has(id) || true) TPImg.put(id, m); return 'tpimg:' + id; });
    },
    resolve: async function (str) {
      if (typeof str !== 'string' || str.indexOf('tpimg:') === -1) return str;
      var ids = Array.from(new Set(str.match(RX_REF) || [])), map = {};
      for (var i = 0; i < ids.length; i++) { var v = await TPImg.get(ids[i].slice(6)); map[ids[i]] = v || ''; }
      return str.replace(RX_REF, function (m) { return map[m] || ''; });
    }
  };
  // Las escrituras de la app pasan por aquí: las fotos se van a IndexedDB
  var P = Storage.prototype, sI = P.setItem;
  P.setItem = function (k, v) {
    if (this === window.localStorage && isData(k) && typeof v === 'string' && v.indexOf('data:image') !== -1) v = TPImg.extract(v);
    return sI.call(this, k, v);
  };
  window.addEventListener('pagehide', function () { /* las escrituras pendientes siguen en la cola */ });

  function dataKeys() {
    if (V.enabled && !V.locked && V.store) return Object.keys(V.store).filter(isData);
    var out = [];
    for (var i = 0; i < localStorage.length; i++) { var k = Storage.prototype.key.call(localStorage, i); if (isData(k)) out.push(k); }
    return out;
  }
  // Fotos de la licencia y documentos: sustituir la referencia por la imagen para mostrarla
  async function hydrate() {
    try {
      var changed = false;
      if (typeof licenseDoc !== 'undefined' && licenseDoc) {
        for (var f of ['frontImage', 'backImage']) {
          var v = licenseDoc[f];
          if (typeof v === 'string' && v.indexOf('tpimg:') === 0) { licenseDoc[f] = (await TPImg.get(v.slice(6))) || null; changed = true; }
        }
      }
      if (typeof additionalDocs !== 'undefined' && Array.isArray(additionalDocs)) {
        for (var i = 0; i < additionalDocs.length; i++) {
          var im = additionalDocs[i].image;
          if (typeof im === 'string' && im.indexOf('tpimg:') === 0) { additionalDocs[i].image = (await TPImg.get(im.slice(6))) || null; changed = true; }
        }
      }
      if (changed) { try { renderWallet(); } catch (e) {} }
    } catch (e) { console.warn('[Fotos] no se pudieron cargar', e); }
  }
  // Paso de las versiones anteriores: sacar las fotos que hubiera dentro de localStorage
  async function migrateAndClean() {
    if (V.enabled && V.locked) return;
    if (needKey()) { try { await waitKey(); } catch (e) { return; } }
    var moved = 0;
    dataKeys().forEach(function (k) {
      var v = localStorage.getItem(k);
      if (v && v.indexOf('data:image') !== -1) { localStorage.setItem(k, v); moved++; }
    });
    await TPImg.drain();
    if (moved && V.enabled && V._flush) await V._flush();
    // borrar fotos que ya no usa nadie
    try {
      var refs = new Set();
      dataKeys().forEach(function (k) { var v = localStorage.getItem(k) || ''; (v.match(RX_REF) || []).forEach(function (r) { refs.add(r.slice(6)); }); });
      var pre = await TPImg.kvGet('preimport'); ((pre || '').match(RX_REF) || []).forEach(function (r) { refs.add(r.slice(6)); });
      var recs = await TPImg.all();
      for (var i = 0; i < recs.length; i++) if (!refs.has(recs[i].id) && Date.now() - (recs[i].t || 0) > 60000) await tx('img', 'readwrite', function (s) { return s.delete(recs[i].id); });
    } catch (e) {}
    await hydrate();
  }

  /* ---------- 2. copias protegidas ---------- */
  var ITER = 310000;
  async function deriveFromPass(pass, saltB, iter) {
    var base = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: saltB, iterations: iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }
  async function fullSnapshot() {
    await TPImg.drain();
    var snap = FT.snapshot ? FT.snapshot() : { storage: {} };
    var txt = await TPImg.resolve(JSON.stringify(snap));
    return JSON.parse(txt);
  }
  function markExport() {
    var now = new Date().toISOString();
    try { localStorage.setItem('tpfield37_lastFieldExport', now); } catch (e) {}
    try { if (typeof backupMeta !== 'undefined' && backupMeta) { backupMeta.lastBackup = now; persistV37(); } } catch (e) {}
    try { window.renderHome && renderHome(); } catch (e) {}
  }
  function deliver(name, text) {
    // en iPhone abre la hoja "Compartir"; en ordenador, descarga. Nunca vuelve a llamar a la copia.
    if (typeof window.downloadText === 'function') return window.downloadText(name, text, 'application/json');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }
  window.TPBackup = {
    run: function () {
      tp38OpenForm({ title: 'Guardar copia de seguridad', kicker: 'PERFIL · COPIAS', submitLabel: 'CREAR COPIA', fields: [
        { name: 'mode', label: 'Tipo de copia', type: 'select', value: 'Protegida con contraseña (recomendado)', options: ['Protegida con contraseña (recomendado)', 'Sin cifrar (cualquiera podría leerla)'], full: true },
        { name: 'pass', label: 'Contraseña de la copia (mín. 6)', type: 'password', value: '', full: true },
        { name: 'pass2', label: 'Repite la contraseña', type: 'password', value: '', full: true }
      ], onSave: async function (fd) {
        var plain = /^Sin cifrar/.test(String(fd.get('mode') || ''));
        var pass = String(fd.get('pass') || ''), pass2 = String(fd.get('pass2') || '');
        if (!plain) {
          if (pass.length < 6) { toast('La contraseña debe tener al menos 6 caracteres.'); return false; }
          if (pass !== pass2) { toast('Las contraseñas no coinciden.'); return false; }
        } else if (!window.confirm('La copia sin cifrar incluye tu licencia, guías y fotos tal cual. Cualquiera que tenga el archivo podrá leerla. ¿Continuar?')) return false;
        var snap = await fullSnapshot(), day = new Date().toISOString().slice(0, 10), text, name;
        if (plain) { text = JSON.stringify(snap); name = 'Tirador-Pro-Copia-' + day + '-SIN-CIFRAR.json'; }
        else {
          var salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
          var key = await deriveFromPass(pass, salt, ITER);
          var ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, enc.encode(JSON.stringify(snap)));
          text = JSON.stringify({ format: 'TiradorProBackup', version: 2, protected: true, app: 'Tirador Pro', createdAt: new Date().toISOString(), kdf: 'PBKDF2-SHA256', iter: ITER, salt: b64(salt), cipher: 'AES-256-GCM', iv: b64(iv), data: b64(ct) });
          name = 'Tirador-Pro-Copia-' + day + '.json';
        }
        markExport();
        setTimeout(function () { deliver(name, text); }, 50);
        toast(plain ? 'Copia sin cifrar preparada.' : 'Copia protegida preparada. Guarda bien la contraseña.');
      } });
    }
  };
  FT.exportData = function () { return window.TPBackup.run(); };
  if (window.TiradorProCampo) window.TiradorProCampo.backup = function () { return window.TPBackup.run(); };

  /* ---------- 3. importación segura ---------- */
  function askPass() {
    return new Promise(function (res) {
      tp38OpenForm({ title: 'Copia protegida', kicker: 'PERFIL · IMPORTAR', submitLabel: 'ABRIR COPIA', fields: [{ name: 'pass', label: 'Contraseña de la copia', type: 'password', value: '', full: true }],
        onSave: function (fd) { res(String(fd.get('pass') || '')); }, afterClose: function () { res(null); } });
    });
  }
  async function unwrap(obj) {
    if (obj && obj.format === 'TiradorProBackup' && obj.protected) {
      for (var tries = 0; tries < 3; tries++) {
        var pass = await askPass(); if (pass == null) return null;
        try {
          var key = await deriveFromPass(pass, unb64(obj.salt), obj.iter || ITER);
          var pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(obj.iv) }, key, unb64(obj.data));
          return JSON.parse(dec.decode(pt));
        } catch (e) { toast('Contraseña incorrecta.'); }
      }
      return null;
    }
    return obj;
  }
  function validate(d) {
    if (!d || d.format !== 'TiradorProFieldTest' || !d.storage || typeof d.storage !== 'object') throw new Error('Este archivo no es una copia de Tirador Pro.');
    var keys = Object.keys(d.storage).filter(isData);
    if (!keys.length) throw new Error('La copia está vacía.');
    var bad = Object.keys(d.storage).filter(function (k) { return !isData(k); });
    if (bad.length) throw new Error('La copia contiene datos desconocidos.');
    keys.forEach(function (k) { var v = d.storage[k]; if (typeof v === 'string') { try { JSON.parse(v); } catch (e) { /* texto simple permitido */ } } });
    if (d.storage.tpfield37_weaponsV38 && !Array.isArray(typeof d.storage.tpfield37_weaponsV38 === 'string' ? JSON.parse(d.storage.tpfield37_weaponsV38) : d.storage.tpfield37_weaponsV38)) throw new Error('La lista de armas de la copia está dañada.');
    return keys;
  }
  async function writeAll(storage, keys) {
    dataKeys().forEach(function (k) { localStorage.removeItem(k); });
    keys.forEach(function (k) { var v = storage[k]; localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)); });
    await TPImg.drain();
    if (V.enabled && V._flush) await V._flush();
  }
  async function importText(text) {
    var obj; try { obj = JSON.parse(text); } catch (e) { throw new Error('El archivo no se puede leer.'); }
    var d = await unwrap(obj); if (!d) return;
    var keys = validate(d);
    var when = (d.exportedAt || '').slice(0, 10).split('-').reverse().join('/');
    var ok = await tp38Confirm('Se sustituirán los datos actuales de este iPhone por los de la copia' + (when ? ' del ' + when : '') + '. Antes guardaré el estado actual para poder deshacerlo. ¿Continuar?', 'Importar copia');
    if (!ok) return;
    var before = JSON.stringify(FT.snapshot ? FT.snapshot() : {});
    await TPImg.kvSet('preimport', before);
    await writeAll(d.storage, keys);
    toast('Copia importada.');
    location.reload();
  }
  FT.importData = function () {
    var input = document.createElement('input'); input.type = 'file'; input.accept = '.json,application/json'; input.style.display = 'none';
    input.addEventListener('change', async function () {
      var f = input.files && input.files[0]; input.remove(); if (!f) return;
      try { await importText(await f.text()); } catch (e) { console.error(e); toast(e && e.message || 'No se pudo importar la copia.'); }
    });
    document.body.appendChild(input); input.click();
  };
  window.TPUndoImport = async function () {
    var pre = await TPImg.kvGet('preimport'); if (!pre) return toast('No hay ninguna importación que deshacer.');
    var d = JSON.parse(pre); var keys = Object.keys(d.storage || {}).filter(isData);
    var ok = await tp38Confirm('Se volverá a los datos que tenías antes de la última importación. ¿Continuar?', 'Deshacer importación');
    if (!ok) return;
    await writeAll(d.storage, keys);
    await TPImg.kvDel('preimport');
    toast('Importación deshecha.'); location.reload();
  };
  FT.clearData = async function () {
    var ok = await tp38Confirm('Se borrarán TODOS los datos de Tirador Pro en este iPhone: armas, munición, entrenamientos, licencias, documentos y fotos. Haz antes una copia si la necesitas. ¿Borrar?', 'Borrar todos los datos');
    if (!ok) return;
    if (!(await tp38Confirm('Esta acción no se puede deshacer. ¿Seguro que quieres borrarlo todo?', 'Confirmar borrado'))) return;
    dataKeys().forEach(function (k) { localStorage.removeItem(k); });
    await TPImg.wipe();
    if (V.enabled && V._flush) await V._flush();
    toast('Datos borrados.'); location.reload();
  };
  // Botón "Deshacer última importación" en Perfil (solo si hay algo que deshacer)
  async function undoButton() {
    var box = document.getElementById('tpFieldControls'); if (!box || document.getElementById('tpUndoImport')) return;
    var pre = null; try { pre = await TPImg.kvGet('preimport'); } catch (e) {}
    if (!pre || document.getElementById('tpUndoImport')) return;
    var b = document.createElement('button'); b.id = 'tpUndoImport'; b.className = 'btn ghost'; b.type = 'button'; b.textContent = 'DESHACER ÚLTIMA IMPORTACIÓN';
    b.addEventListener('click', window.TPUndoImport); box.appendChild(b);
  }
  var goPrev = window.go;
  window.go = function (id) { var r = goPrev.apply(this, arguments); if (id === 'perfil') setTimeout(undoButton, 50); return r; };

  /* ---------- arranque ---------- */
  migrateAndClean();
})();
