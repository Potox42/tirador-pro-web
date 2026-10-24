/* Tirador Pro · R19 · fotos de documentos en Cartera
   - Federación: el QR inventado se sustituye por el QR real, subido desde la galería.
   - Federación: foto del carnet federativo (anverso y reverso).
   - Guías: foto de cada guía de pertenencia (Cartera › Guías y ficha del arma › Documentos).
   Las fotos van a IndexedDB (cifradas si hay PIN) y entran en las copias de seguridad. */
(function () {
  'use strict';
  if (window.__TP_R19__) return; window.__TP_R19__ = true;
  var KEY = 'tpfield37_docPhotos';
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function toast(m) { try { showToast(m); } catch (e) {} }

  var css = '.r19Box{margin-top:14px;padding:14px;border-radius:18px;background:#1a1c15;border:1px solid #ffffff16}' +
    '.r19Box>b{display:block;font-size:15px;margin-bottom:3px}.r19Box>p{margin:0 0 10px;font-size:12.5px;color:#b5ba9c;line-height:1.4}' +
    '.r19Slots{display:grid;grid-template-columns:1fr 1fr;gap:10px}.r19Slots.one{grid-template-columns:1fr}' +
    '.r19Slot{position:relative;aspect-ratio:1.58;border-radius:14px;border:1px dashed rgba(201,207,168,.4);background:#11130d center/contain no-repeat;display:grid;place-items:center;color:#c9cfa8;font-weight:850;font-size:14px;text-align:center;padding:6px}' +
    '.r19Slot.has{border-style:solid;color:transparent}.r19Slot:not(.has) small{display:none}.r19Slot small{position:absolute;left:8px;bottom:6px;font-size:11px;color:#fff;background:rgba(0,0,0,.55);padding:2px 7px;border-radius:8px;font-weight:800}' +
    '.r19Slot.qr{aspect-ratio:1;max-width:240px;margin:0 auto;width:100%;background-color:#fff}' +
    '.r19Guide{display:flex;align-items:center;gap:10px;margin-top:10px}.r19Guide .r19Slot{width:96px;flex:none;aspect-ratio:1.4;font-size:12px}' +
    '#r19Viewer{position:fixed;inset:0;z-index:10400;background:#060605;display:flex;flex-direction:column;padding:calc(12px + env(safe-area-inset-top)) 12px calc(14px + env(safe-area-inset-bottom))}' +
    '#r19Viewer.qr{background:#fff}#r19Viewer .r19img{flex:1 1 auto;min-height:0;background:center/contain no-repeat;margin:10px 0}' +
    '#r19Viewer .r19bar{flex:none;display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;background:none;height:auto}#r19Viewer button{min-height:54px;border-radius:14px;border:1px solid #ffffff30;background:#22251b;color:#fff;font-weight:900;font-size:15px}' +
    '#r19Viewer.qr button{background:#1b1c15}#r19Viewer h3{margin:0;color:#fff;font-size:18px;text-align:center}#r19Viewer.qr h3{color:#111}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------- almacén ---------- */
  var memo = {};
  function map() { try { var m = JSON.parse(localStorage.getItem(KEY) || '{}'); return m && typeof m === 'object' ? m : {}; } catch (e) { return {}; } }
  function has(id) { return !!map()[id]; }
  function put(id, dataUrl) {
    var m = map(); if (dataUrl) m[id] = dataUrl; else delete m[id];
    try { localStorage.setItem(KEY, JSON.stringify(m)); } catch (e) { toast('No hay espacio para la foto.'); return false; }
    if (dataUrl) memo[id] = dataUrl; else delete memo[id];
    return true;
  }
  async function get(id) {
    if (memo[id]) return memo[id];
    var v = map()[id];
    if (!v && id.indexOf('guide_') === 0) v = scannedGuide(id.slice(6));
    if (!v) return null;
    if (v.indexOf('tpimg:') === 0) { try { v = window.TPImg ? await window.TPImg.get(v.slice(6)) : null; } catch (e) { v = null; } }
    if (v) memo[id] = v;
    return v;
  }
  // guía escaneada antes con la cámara (R11)
  function scannedGuide(wid) {
    try { var d = JSON.parse(localStorage.getItem('tpfield36_scannedDocs') || '[]').filter(function (x) { return x.id === 'doc-guide-' + wid; })[0]; return d && d.image || null; } catch (e) { return null; }
  }
  function pickImage(max) {
    return new Promise(function (resolve) {
      var inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
      inp.style.cssText = 'position:fixed;left:-9999px;opacity:0'; document.body.appendChild(inp);
      inp.onchange = function () {
        var f = inp.files && inp.files[0]; inp.remove(); if (!f) return resolve(null);
        var url = URL.createObjectURL(f), img = new Image();
        img.onload = function () {
          var m = max || 1600, s = Math.min(1, m / Math.max(img.naturalWidth, img.naturalHeight));
          var c = document.createElement('canvas'); c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s);
          var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
          URL.revokeObjectURL(url); resolve(c.toDataURL('image/jpeg', 0.88));
        };
        img.onerror = function () { URL.revokeObjectURL(url); toast('No se pudo leer la foto.'); resolve(null); };
        img.src = url;
      };
      inp.click();
    });
  }
  async function fromGallery(id, label) {
    var d = await pickImage(id === 'fedQR' ? 1200 : 1600); if (!d) return;
    // documentos: recorte y centrado automático, igual que el escáner (el QR se deja tal cual)
    if (id !== 'fedQR' && typeof tpV4ProcessNativeDocumentPhoto === 'function') { try { d = await tpV4ProcessNativeDocumentPhoto(d); } catch (e) {} }
    if (put(id, d)) { toast(label + ' guardado.'); rerender(); }
  }
  // elegir: cámara con marco (escáner) o galería
  function upload(id, label) {
    if (id === 'fedQR' || typeof window.tpScanPhoto !== 'function') return fromGallery(id, label);
    var sh = document.createElement('div');
    sh.style.cssText = 'position:fixed;inset:0;z-index:10300;background:rgba(0,0,0,.55);display:flex;align-items:flex-end';
    sh.innerHTML = '<div style="width:100%;background:#1a1c15;border-radius:22px 22px 0 0;padding:16px 16px calc(18px + env(safe-area-inset-bottom));display:grid;gap:10px">' +
      '<b style="font-size:17px;color:#fff">' + esc(label) + '</b>' +
      '<button type="button" class="btn primary" data-a="cam" style="margin:0">📷 HACER FOTO CON MARCO</button>' +
      '<button type="button" class="btn secondary" data-a="gal" style="margin:0">🖼 ELEGIR DE LA GALERÍA</button>' +
      '<button type="button" class="btn secondary" data-a="x" style="margin:0">CANCELAR</button></div>';
    document.body.appendChild(sh);
    sh.onclick = function (ev) {
      var b = ev.target.closest('[data-a]'); if (!b && ev.target !== sh) return;
      var a = b ? b.getAttribute('data-a') : 'x'; sh.remove();
      if (a === 'gal') fromGallery(id, label);
      if (a === 'cam') window.tpScanPhoto(id, label);
    };
  }

  /* ---------- visor a pantalla completa ---------- */
  async function view(id, title) {
    var src = await get(id); if (!src) return upload(id, title);
    var v = document.createElement('div'); v.id = 'r19Viewer'; if (id === 'fedQR') v.className = 'qr';
    v.innerHTML = '<h3>' + esc(title) + '</h3><div class="r19img"></div><div class="r19bar"><button type="button" data-a="c">CAMBIAR</button><button type="button" data-a="d">QUITAR</button><button type="button" data-a="x">CERRAR</button></div>';
    v.querySelector('.r19img').style.backgroundImage = 'url("' + src + '")';
    document.body.appendChild(v);
    v.onclick = async function (ev) {
      var b = ev.target.closest('[data-a]'); if (!b) return;
      var a = b.getAttribute('data-a');
      if (a === 'x') return v.remove();
      if (a === 'c') { v.remove(); return upload(id, title); }
      if (a === 'd') {
        var ok = true; try { ok = await tp38Confirm('¿Quitar esta foto?', 'Quitar foto'); } catch (e) {}
        if (!ok) return;
        if (id.indexOf('guide_') === 0 && !map()[id] && scannedGuide(id.slice(6))) { toast('Esta foto viene del escáner de la guía.'); return; }
        put(id, null); v.remove(); rerender(); toast('Foto quitada.');
      }
    };
  }
  window.tpDocPhoto = { view: view, upload: upload, get: get, put: function (id, d) { var ok = put(id, d); return ok; }, rerender: function () { rerender(); } };

  // tocar el hueco: si hay foto se ve; si no, se abre la galería en el mismo toque
  function slotClick(id, title) { if (has(id) || (id.indexOf('guide_') === 0 && scannedGuide(id.slice(6)))) view(id, title); else upload(id, title); }
  function fillSlot(el, id) { get(id).then(function (src) { if (!src || !el.isConnected) return; el.classList.add('has'); el.style.backgroundImage = 'url("' + src + '")'; }); }
  function slot(id, label, extra) { return '<div class="r19Slot' + (extra || '') + '" data-r19="' + esc(id) + '" data-t="' + esc(label) + '">📷 ' + esc(label) + '<small>' + esc(label) + '</small></div>'; }
  function bindSlots(root) {
    Array.prototype.forEach.call(root.querySelectorAll('[data-r19]'), function (el) {
      fillSlot(el, el.getAttribute('data-r19'));
      el.onclick = function (ev) { ev.stopPropagation(); slotClick(el.getAttribute('data-r19'), el.getAttribute('data-t')); };
    });
  }

  /* ---------- QR de la federación: el real, desde la galería ---------- */
  window.showFederationQR = function () {
    if (has('fedQR')) return view('fedQR', 'QR de la federación');
    upload('fedQR', 'QR de la federación');
  };
  try { showFederationQR = window.showFederationQR; } catch (e) {}

  /* ---------- Cartera ---------- */
  function curTab() { try { return walletTab; } catch (e) { return ''; } }
  function decorateWallet() {
    var body = $('walletBody'); if (!body || body.querySelector('.r19Box')) return;
    var tab = curTab();
    if (tab === 'Federación') {
      // botón "Mostrar QR" → QR real
      Array.prototype.forEach.call(body.querySelectorAll('button'), function (b) { if (/QR/i.test(b.textContent)) b.textContent = has('fedQR') ? '▦ Mostrar QR' : '▦ Subir QR'; });
      if (has('fedFront') || has('fedBack')) Array.prototype.forEach.call(body.querySelectorAll('.infoBox'), function (ib) { var sp = ib.querySelector('span'); if (sp && /COPIA/.test(sp.textContent)) ib.querySelector('b').textContent = 'Sí'; });
      var box = document.createElement('div'); box.className = 'r19Box';
      box.innerHTML = '<b>QR de la federación</b><p>Sube la captura o foto del QR de tu licencia federativa (desde la galería). Se mostrará en grande para que lo escaneen.</p>' +
        '<div class="r19Slots one">' + slot('fedQR', 'QR', ' qr') + '</div>' +
        '<b style="margin-top:14px">Carnet federativo</b><p>Fotos del carnet por las dos caras.</p>' +
        '<div class="r19Slots">' + slot('fedFront', 'Anverso') + slot('fedBack', 'Reverso') + '</div>';
      body.appendChild(box); bindSlots(box);
    }
    if (tab === 'Guías') {
      Array.prototype.forEach.call(body.querySelectorAll('.docMini[onclick*="openWeapon"]'), function (card) {
        var m = (card.getAttribute('onclick') || '').match(/openWeapon\('([^']+)'/); if (!m || card.querySelector('.r19Guide')) return;
        var row = document.createElement('div'); row.className = 'r19Guide';
        row.innerHTML = slot('guide_' + m[1], 'Foto guía') + '<div class="muted" style="font-size:12.5px">Toca para ' + (has('guide_' + m[1]) || scannedGuide(m[1]) ? 'ver la foto de la guía' : 'subir la foto de la guía desde la galería o la cámara') + '.</div>';
        var actions = card.querySelector('.docActionRow');
        card.insertBefore(row, actions || null); bindSlots(row);
      });
      var mark = document.createElement('div'); mark.className = 'r19Box'; mark.style.display = 'none'; body.appendChild(mark);
    }
  }
  // Ficha del arma › Documentos: foto de la guía
  function decorateWeaponDocs() {
    var w = null, tab = ''; try { w = activeWeapon; tab = weaponDetailTab; } catch (e) {}
    var body = $('weaponDetailBody'); if (!w || !body || tab !== 'Documentos' || body.querySelector('.r19Box')) return;
    var box = document.createElement('div'); box.className = 'r19Box';
    box.innerHTML = '<b>Foto de la guía de pertenencia</b><p>Toca para subirla o verla.</p><div class="r19Slots one">' + slot('guide_' + w.id, 'Guía de pertenencia') + '</div>';
    var doc = body.querySelector('.docMini');
    if (doc && doc.parentNode) doc.parentNode.insertBefore(box, doc.nextSibling); else body.appendChild(box);
    bindSlots(box);
  }
  function rerender() {
    try { var id = (document.querySelector('.screen.active') || {}).id;
      if (id === 'cartera') renderWallet();
      if (id === 'weaponDetail') renderWeaponDetail37();
      if (id === 'federacion' && typeof renderFederation === 'function') renderFederation();
    } catch (e) {}
  }
  var rwPrev = window.renderWallet;
  if (typeof rwPrev === 'function') { window.renderWallet = function () { var r = rwPrev.apply(this, arguments); try { decorateWallet(); } catch (e) { console.warn('[R19]', e); } return r; }; try { renderWallet = window.renderWallet; } catch (e) {} }
  var rdPrev = window.renderWeaponDetail37;
  if (typeof rdPrev === 'function') { window.renderWeaponDetail37 = function () { var r = rdPrev.apply(this, arguments); try { decorateWeaponDocs(); } catch (e) {} return r; }; try { renderWeaponDetail37 = window.renderWeaponDetail37; } catch (e) {} }
  var goPrev = window.go;
  if (typeof goPrev === 'function') {
    window.go = function (id) { var r = goPrev.apply(this, arguments); try { if (id === 'cartera') decorateWallet(); if (id === 'federacion') fedScreen(); } catch (e) {} return r; };
    try { go = window.go; } catch (e) {}
  }
  // pantalla Federación: el botón dice lo que hace
  function fedScreen() {
    var p = $('federacion'); if (!p) return;
    Array.prototype.forEach.call(p.querySelectorAll('button'), function (b) { if (/QR/i.test(b.textContent)) b.textContent = has('fedQR') ? 'MOSTRAR QR DE LA FEDERACIÓN' : 'SUBIR QR DE LA FEDERACIÓN'; });
  }
})();
