/* Tirador Pro · R11/R12 · licencias, guías y armas por cámara o foto, con lectura automática (OCR)
   - Motor OCR: Tesseract.js (español), el mismo que usa Tirador Deportivo, cargado desde su web.
     Las fotos se leen en el propio iPhone: no se envían a ningún sitio.
   - Licencia: lee NIF/NIE y cada licencia (E, F, D) con sus fechas y la categoría de la F.
   - Guía de pertenencia: lee nº de guía, marca, modelo, calibre y nº de serie, y los asigna a un arma.
   - Botón "Subir foto" en el escáner (galería o cámara del iPhone).
   Se carga después de tirador-pro-r10-operativa.js. */
(function () {
  'use strict';
  var OCR_BASE = 'https://potox42.github.io/app-armas/ocr';
  function $(id) { return document.getElementById(id); }
  function toast(m) { try { window.showToast && window.showToast(m); } catch (e) {} }
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function st(n) { return window.__tpState ? window.__tpState.get(n) : undefined; }

  /* ---------- motor OCR ---------- */
  var workerP = null;
  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = function () { rej(new Error('No se pudo cargar el lector (¿sin conexión?).')); };
      document.head.appendChild(s);
    });
  }
  var progressCb = null;
  function getWorker() {
    if (!workerP) {
      workerP = (async function () {
        if (!window.Tesseract) await loadScript(OCR_BASE + '/tesseract.min.js');
        return window.Tesseract.createWorker('spa', 1, {
          workerPath: OCR_BASE + '/worker.min.js', corePath: OCR_BASE, langPath: OCR_BASE,
          logger: function (m) { try { progressCb && progressCb(m); } catch (e) {} }
        });
      })();
      workerP.catch(function () { workerP = null; });
    }
    return workerP;
  }
  // Mejora de contraste igual que en Tirador Deportivo: divide por el fondo difuminado (quita sombras y brillos)
  function loadImg(src) { return new Promise(function (res, rej) { var i = new Image(); i.onload = function () { res(i); }; i.onerror = rej; i.src = src; }); }
  async function enhance(dataUrl) {
    var img = await loadImg(dataUrl), w = img.naturalWidth, h = img.naturalHeight;
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    var x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0);
    var id = x.getImageData(0, 0, w, h), d = id.data;
    var small = document.createElement('canvas'); small.width = Math.max(1, Math.round(w / 24)); small.height = Math.max(1, Math.round(h / 24));
    small.getContext('2d').drawImage(img, 0, 0, small.width, small.height);
    var bg = document.createElement('canvas'); bg.width = w; bg.height = h;
    var bx = bg.getContext('2d', { willReadFrequently: true }); bx.imageSmoothingQuality = 'high'; bx.drawImage(small, 0, 0, w, h);
    var b = bx.getImageData(0, 0, w, h).data;
    for (var i = 0; i < d.length; i += 4) {
      var l = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      var L = 0.299 * b[i] + 0.587 * b[i + 1] + 0.114 * b[i + 2] + 1;
      var v = Math.max(0, Math.min(255, (l / L) * 255));
      v = v < 150 ? Math.max(0, v - 60) : 255; // texto oscuro, fondo blanco
      d[i] = d[i + 1] = d[i + 2] = v;
    }
    x.putImageData(id, 0, 0);
    return c.toDataURL('image/png');
  }
  var SEP = '\n<<<TP-PASADA-2>>>\n';
  window.TiradorProOfflineOcr = {
    recognize: async function (dataUrl, opts) {
      progressCb = function (m) {
        if (!opts || !opts.onProgress) return;
        if (m.status === 'recognizing text') opts.onProgress(m);
        else if (/load|initializ/.test(m.status || '')) { var s = $('ocrStatus'); if (s) s.textContent = 'Preparando el lector… (la primera vez tarda un poco)'; }
      };
      var w = await getWorker();
      await w.setParameters({ tessedit_pageseg_mode: '6' });
      var a = await w.recognize(await enhance(dataUrl));
      await w.setParameters({ tessedit_pageseg_mode: '3' });
      var b = await w.recognize(dataUrl);
      progressCb = null;
      return { data: { text: (a.data.text || '') + SEP + (b.data.text || ''), confidence: Math.round(((a.data.confidence || 0) + (b.data.confidence || 0)) / 2) } };
    }
  };

  /* ---------- lectura de la licencia (mismo método que Tirador Deportivo) ---------- */
  var MES = { ENE: 1, FEB: 2, MAR: 3, ABR: 4, MAY: 5, JUN: 6, JUL: 7, AGO: 8, SEP: 9, SET: 9, OCT: 10, NOV: 11, DIC: 12 };
  function mk(d, m, y) { if (y < 100) y += 2000; var t = new Date(y, m - 1, d); return (t.getFullYear() !== y || t.getMonth() !== m - 1 || t.getDate() !== d) ? null : y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0'); }
  function norm(t) { return String(t).toUpperCase().replace(/O(?=\d)/g, '0').replace(/(\d)O/g, '$10').replace(/(\d)[LI|](?=[\d\/.\-])/g, '$11').replace(/\b[LI|](?=\d[\/.\-])/g, '1'); }
  function plusYears(iso, n) { return (+iso.slice(0, 4) + n) + iso.slice(4); }
  var RX_DATE = /\b(\d{1,2})\s?[\/.\-]\s?(\d{1,2}|\d{2}(?=\d{4}))\s?[\/.\-]?\s?(\d{4})\b/g;
  function dates(t) {
    var o = norm(t), out = [], m;
    var r1 = /\b(\d{1,2})\s?[\/.\-\s]\s?(\d{1,2}|\d{2}(?=\d{4}))\s?[\/.\-\s]?\s?(\d{4})\b/g;
    while ((m = r1.exec(o))) { var v = mk(+m[1], +m[2], +m[3]); if (v) out.push(v); }
    var r2 = /\b(\d{1,2})[\s.\-\/]*(ENE|FEB|MAR|ABR|MAY|JUN|JUL|AGO|SEP|SET|OCT|NOV|DIC)[A-Z]*[\s.\-\/]*(\d{4})\b/g;
    while ((m = r2.exec(o))) { var v2 = mk(+m[1], MES[m[2]], +m[3]); if (v2) out.push(v2); }
    return Array.from(new Set(out)).sort();
  }
  var LET = 'TRWAGMYFPDXBNJZSQVHLCKE';
  function nifOk(n, l) { var x = n.replace(/^X/, '0').replace(/^Y/, '1').replace(/^Z/, '2'); return /^\d{8}$/.test(x) && LET[+x % 23] === l ? n + '-' + l : null; }
  function rows(t) {
    var out = [], pend;
    norm(t).replace(/[€É]/g, 'E').split('\n').forEach(function (line) {
      var ds = [], m, re = new RegExp(RX_DATE.source, 'g');
      while ((m = re.exec(line))) { var v = mk(+m[1], +m[2], +m[3]); if (v) ds.push(v); }
      var pos = line.search(RX_DATE), head = pos >= 0 ? line.slice(0, pos) : line;
      var tm = head.match(/(?:^|[^A-Z])([FDE])(?:[^A-Z]|$)/), tipo = tm ? tm[1] : undefined;
      if (ds.length < 2) { pend = ds.length === 0 && head.replace(/[^A-Z0-9]/g, '').length <= 2 ? tipo : undefined; return; }
      var from = ds[0], to = ds[1], ty = tipo || pend; pend = undefined;
      if (from >= '1990-01-01' && to > plusYears(from, 1) && to <= plusYears(from, 6) && !out.some(function (r) { return (ty && r.tipo === ty) || r.hasta === to; })) out.push({ tipo: ty, desde: from, hasta: to });
    });
    return out;
  }
  function readLicense(t) {
    var o = norm(t), r = { filas: rows(t) }, today = new Date().toISOString().slice(0, 10);
    var ds = dates(t).filter(function (d) { return d >= '1990-01-01' && d <= plusYears(today, 10); });
    if (ds.length >= 2) { r.expedicion = ds[0]; r.caducidad = ds[ds.length - 1]; } else if (ds.length === 1) { if (ds[0] > today) r.caducidad = ds[0]; else r.expedicion = ds[0]; }
    var m, re = /\b([XYZ]?\d{7,8})\s?-?\s?([A-Z])\b/g;
    while ((m = re.exec(o))) { var n = nifOk(m[1].length !== 7 || /^[XYZ]/.test(m[1]) ? m[1] : '0' + m[1], m[2]); if (n) { r.nif = n; break; } }
    var c = o.match(/LICENCIA\s*[:.]?\s*F\s+CATEGOR[IÍ]A\s*[:.\-]?\s*([123])/) || o.match(/CATEGOR[IÍ]A\s*[:.\-]?\s*([123])/); if (c) r.categoria = c[1];
    return r;
  }
  function combine(list) {
    var s = { filas: [] };
    list.forEach(function (n) { if (n.filas.length > s.filas.length) s.filas = n.filas; ['nif', 'categoria', 'expedicion', 'caducidad'].forEach(function (k) { if (s[k] == null && n[k] != null) s[k] = n[k]; }); });
    return s;
  }
  function isoToD(iso) { if (!iso) return ''; var p = iso.split('-'); return p[2] + '-' + p[1] + '-' + p[0]; }

  /* ---------- lectura de la guía de pertenencia ---------- */
  function readGuide(t) {
    var up = String(t).toUpperCase().replace(/[|]/g, 'I');
    var lines = up.split('\n').map(function (l) { return l.replace(/\s+/g, ' ').trim(); }).filter(Boolean);
    function after(rx) {
      for (var i = 0; i < lines.length; i++) {
        var m = lines[i].match(rx);
        if (m) {
          var rest = lines[i].slice(m.index + m[0].length).replace(/^[\s:\-ºª°]+/, '').replace(/^\.(?=\s)/, '').trim();
          if (rest.length >= 2) return rest;
          if (lines[i + 1]) return lines[i + 1];
        }
      }
      return '';
    }
    function clean(v, max) { return (v || '').replace(/\s{2,}/g, ' ').replace(/[^A-Z0-9ÑÁÉÍÓÚÜ .,&\-\/]/g, '').trim().slice(0, max || 40); }
    var g = {};
    var gm = up.match(/GU[IÍ]A\s*(?:DE\s*PERTENENCIA)?\s*(?:N[ºO°9.]*|NUM(?:ERO)?\.?)\s*[:.\-]?\s*([A-Z]{0,3}[\- ]?\d[\d\- \/]{3,}[A-Z]?)/) ||
             up.match(/(?:N[ºO°9]\.?\s*(?:DE\s*)?GU[IÍ]A)\s*[:.\-]?\s*([A-Z]{0,3}[\- ]?\d[\d\- \/]{3,}[A-Z]?)/);
    if (gm) g.guide = gm[1].replace(/\s+/g, '');
    g.brand = clean(after(/\bMARCA\b/), 30).split(' MODELO')[0];
    g.brand = g.brand.toLowerCase().replace(/(^|[\s\-])([a-zñáéíóú])/g, function (m, a, b) { return a + b.toUpperCase(); });
    g.model = clean(after(/\bMODELO\b/), 30).split(' CALIBRE')[0];
    var cal = up.match(/\b(\.22\s?L\.?R\.?|22\s?L\.?R\.?|\.?\d{1,3}(?:[.,]\d{1,3})?\s?(?:MM|LR|S&W|SW|MAG(?:NUM)?|ACP|AUTO|SPECIAL|SPL|PARABELLUM|LUGER|WIN|REM)\b(?:\s?(?:LUGER|PARABELLUM|MAG(?:NUM)?|SPECIAL))?|\d{1,2}\s?X\s?\d{2}(?:\s?MM)?)/);
    var calLine = clean(after(/\bCALIBRE\b/), 20);
    g.caliber = (calLine || (cal ? cal[1] : '')).replace(/^22\s?L\.?R\.?$/, '.22 LR').replace(/^\.22\s?L\.?R\.?$/, '.22 LR');
    g.serial = clean(after(/\b(?:N[ºO°9.]*\s*(?:DE\s*)?(?:SERIE|FABRICACI[OÓ]N)|NUMERO\s+DE\s+(?:SERIE|FABRICACI[OÓ]N)|SERIE)\b/), 25);
    var catm = up.match(/CATEGOR[IÍ]A\s*[:.\-]?\s*(\d|[1-9]ª)/); if (catm) g.category = catm[1];
    return g;
  }

  /* ---------- parseOCRText: licencia o guía ---------- */
  var parsePrev = window.parseOCRText;
  window.parseOCRText = function (text) {
    var parts = String(text || '').split(SEP), joined = parts.join('\n');
    var type = $('scanDocType') ? $('scanDocType').value : 'license';
    if (type === 'guide') { var g = readGuide(joined); window.__tpLastGuide = g; return { docNumber: g.guide || '', expiry: '', licenses: [], text: parts[parts.length - 1] || joined, guide: g }; }
    var base = {};
    try { base = parsePrev ? parsePrev(parts[0]) : {}; } catch (e) { base = {}; }
    if (type !== 'license') return base;
    var r = combine(parts.map(readLicense));
    var lic = r.filas.map(function (f) { return { type: f.tipo || '', from: isoToD(f.desde), to: isoToD(f.hasta), category: f.tipo === 'F' && r.categoria ? r.categoria : undefined }; });
    // filas sin letra: asignar E, F, D que falten, en orden
    var used = lic.map(function (l) { return l.type; }).filter(Boolean);
    lic.forEach(function (l) { if (!l.type) { var t = ['E', 'F', 'D'].filter(function (x) { return used.indexOf(x) === -1; })[0]; if (t) { l.type = t; used.push(t); } } });
    if (!lic.length && base.licenses && base.licenses.length) lic = base.licenses;
    var expiry = lic.length ? lic.map(function (l) { return l.to; }).sort(function (a, b) { return a.split('-').reverse().join('').localeCompare(b.split('-').reverse().join('')); })[0] : (r.caducidad ? isoToD(r.caducidad) : base.expiry || '');
    return { docNumber: r.nif || base.docNumber || '', expiry: expiry, licenses: lic, text: parts[parts.length - 1] || joined };
  };

  /* ---------- escáner: tipo "Guía", botón "Subir foto", campos de la guía ---------- */
  var preWeapon = null;
  function setupScanner() {
    var sel = $('scanDocType');
    if (sel && !sel.querySelector('option[value="guide"]')) {
      var o = document.createElement('option'); o.value = 'guide'; o.textContent = 'Guía de pertenencia';
      sel.insertBefore(o, sel.options[1] || null);
      sel.addEventListener('change', syncType);
    }
    var ctr = document.querySelector('#documentScanner .scanControls');
    if (ctr && !$('tpUploadBtn')) {
      var b = document.createElement('button'); b.id = 'tpUploadBtn'; b.className = 'miniBtn'; b.type = 'button'; b.textContent = 'Subir foto';
      b.addEventListener('click', pickPhoto);
      var torch = $('torchBtn'); if (torch) ctr.replaceChild(b, torch); else ctr.appendChild(b);
    }
    var hint = document.querySelector('#documentScanner .guideText');
    if (hint && !hint.dataset.tp) { hint.dataset.tp = '1'; }
    var f = $('ocrFields');
    if (f && !$('tpGuideFields')) {
      var box = document.createElement('div'); box.id = 'tpGuideFields'; box.style.display = 'none';
      f.insertBefore(box, f.querySelector('#detectedLicensesBlock'));
    }
    syncType();
  }
  function weaponsList() { var w = st('weapons'); return Array.isArray(w) ? w : []; }
  function renderGuideFields(g) {
    var box = $('tpGuideFields'); if (!box) return;
    g = g || {};
    var ws = weaponsList();
    var pick = preWeapon || (ws.filter(function (w) { return !w.guide; })[0] || ws[0] || {}).id || '';
    box.innerHTML = '<div class="extractGrid" style="margin-top:10px">' +
      '<div class="extractBox" style="grid-column:1/-1"><label>ARMA A LA QUE PERTENECE</label><select id="tpGuideWeapon" style="width:100%;background:transparent;border:0;color:inherit;font-size:16px;padding:5px 0">' +
      ws.map(function (w) { return '<option value="' + esc(w.id) + '"' + (w.id === pick ? ' selected' : '') + '>' + esc(w.name) + (w.guide ? ' · guía ' + esc(w.guide) : '') + '</option>'; }).join('') +
      '<option value="__new"' + (!ws.length || pick === '__new' ? ' selected' : '') + '>+ Arma nueva con estos datos</option></select></div>' +
      '<div class="extractBox"><label>MARCA</label><input id="tpGuideBrand" value="' + esc(g.brand) + '" placeholder="No detectada"></div>' +
      '<div class="extractBox"><label>MODELO</label><input id="tpGuideModel" value="' + esc(g.model) + '" placeholder="No detectado"></div>' +
      '<div class="extractBox"><label>CALIBRE</label><input id="tpGuideCaliber" value="' + esc(g.caliber) + '" placeholder="No detectado"></div>' +
      '<div class="extractBox"><label>Nº DE SERIE</label><input id="tpGuideSerial" value="' + esc(g.serial) + '" placeholder="No detectado"></div>' +
      '</div>';
  }
  function syncType() {
    var t = $('scanDocType') ? $('scanDocType').value : 'license', guide = t === 'guide';
    var boxes = document.querySelectorAll('#ocrFields .extractGrid:not(#tpGuideFields .extractGrid) .extractBox');
    if (boxes[0]) { var l0 = boxes[0].querySelector('label'); if (l0) l0.textContent = guide ? 'Nº DE GUÍA' : 'NIF / Nº DOCUMENTO'; }
    if (boxes[1]) boxes[1].style.display = guide ? 'none' : '';
    var gf = $('tpGuideFields'); if (gf) { gf.style.display = guide ? '' : 'none'; if (guide && !gf.innerHTML) renderGuideFields(window.__tpLastGuide); }
    var dl = $('detectedLicensesBlock'); if (dl) dl.style.display = guide ? 'none' : '';
    var hint = document.querySelector('#documentScanner .guideText'); if (hint) hint.textContent = guide ? 'Coloca la guía dentro del marco' : 'Coloca únicamente el carnet dentro del marco';
    var sideSel = $('scanSide'); if (sideSel && guide) sideSel.value = 'front';
  }
  function pickPhoto() {
    var input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*'; input.style.display = 'none';
    input.addEventListener('change', function () {
      var f = input.files && input.files[0]; input.remove(); if (!f) return;
      var r = new FileReader();
      r.onload = async function () {
        try {
          scannedDocData = await tpV4ProcessNativeDocumentPhoto(String(r.result));
          $('scanPreviewImg').src = scannedDocData; $('scanResultBlock').style.display = 'block';
          $('ocrFields').style.display = 'none'; $('ocrProgressBar').style.width = '0%';
          $('ocrStatus').textContent = 'Foto cargada. Pulsa LEER DATOS AUTOMÁTICAMENTE o rellénalos a mano.';
          setTimeout(function () { $('scanResultBlock').scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
        } catch (e) { console.error(e); toast('No se pudo abrir la foto.'); }
      };
      r.readAsDataURL(f);
    });
    document.body.appendChild(input); input.click();
  }

  // Tras leer: rellenar los campos de la guía
  var runPrev = window.runDocumentOCR;
  window.runDocumentOCR = async function () {
    var r = await runPrev.apply(this, arguments);
    try {
      var t = $('scanDocType').value;
      if (t === 'guide') { renderGuideFields(window.__tpLastGuide); syncType(); }
    } catch (e) {}
    return r;
  };
  // Mostrar los campos a mano aunque no se lea (para la guía)
  var capPrev = window.captureDocument;
  if (typeof capPrev === 'function') window.captureDocument = async function () { var r = await capPrev.apply(this, arguments); var gf = $('tpGuideFields'); if (gf) gf.innerHTML = ''; window.__tpLastGuide = null; syncType(); return r; };

  // Guardar: la guía va a un arma; el resto, como antes
  var applyPrev = window.applyOCRData;
  window.applyOCRData = async function () {
    var t = $('scanDocType') ? $('scanDocType').value : 'license';
    if (t !== 'guide') return applyPrev.apply(this, arguments);
    if (!scannedDocData) return toast('Primero haz o sube la foto.');
    if (!$('tpGuideWeapon')) renderGuideFields(window.__tpLastGuide || {});
    var num = ($('ocrDocNumber') && $('ocrDocNumber').value || '').trim();
    var brand = ($('tpGuideBrand').value || '').trim(), model = ($('tpGuideModel').value || '').trim(), cal = ($('tpGuideCaliber').value || '').trim(), serial = ($('tpGuideSerial').value || '').trim();
    var wid = $('tpGuideWeapon').value, ws = weaponsList(), w = ws.filter(function (x) { return x.id === wid; })[0];
    if (wid === '__new' || !w) {
      var name = [brand, model].filter(Boolean).join(' ') || 'Arma nueva';
      w = { id: 'w' + Date.now(), name: name, caliber: cal || '.22 LR', brand: brand, model: model, licenseType: 'F', guide: num, shots: 0, lastReview: '', review: '', maintenanceInterval: 1000, shotsAtLastMaintenance: 0, maintenance: [] };
      ws.push(w);
    } else {
      if (num) w.guide = num;
      if (brand && !w.brand) w.brand = brand;
      if (model && !w.model) w.model = model;
      if (cal && !w.caliber) w.caliber = cal;
    }
    if (serial) w.serial = serial;
    w.guideImage = 'doc-guide-' + w.id;
    try { if (window.tp38NormalizeWeapon) tp38NormalizeWeapon(w); } catch (e) {}
    try { persistV37(); } catch (e) { console.error(e); }
    try { renderHomeV37(); } catch (e) {}
    // la foto de la guía se guarda junto al resto de documentos, ligada al arma
    try {
      var saved = JSON.parse(localStorage.getItem('tpfield36_scannedDocs') || '[]').filter(function (d) { return d.id !== w.guideImage; });
      saved.push({ id: w.guideImage, type: 'guide', side: 'front', weaponId: w.id, image: scannedDocData, ocr: window.__tpLastGuide || null, createdAt: new Date().toISOString() });
      localStorage.setItem('tpfield36_scannedDocs', JSON.stringify(saved.slice(-24)));
    } catch (e) { console.error(e); }
    try { renderWeapons(); } catch (e) {}
    try { syncTrainingWeaponOptions(); } catch (e) {}
    preWeapon = null;
    toast('Guía guardada en ' + w.name + '.');
    try { closeDocumentScanner(); } catch (e) {}
    var back = window.__tpReturnTo; window.__tpReturnTo = null;
    try { if (back === 'armas') { go('armas'); openWeapon(w.id); } else { go('cartera'); setWalletTab('Guías'); } } catch (e) {}
  };

  // Abrir el escáner ya preparado para una guía
  window.tpOpenGuideScanner = function (weaponId) {
    preWeapon = weaponId || null;
    openDocumentScanner('guide', 'front');
    setTimeout(function () { setupScanner(); $('scanDocType').value = 'guide'; syncType(); }, 50);
  };
  var osPrev = window.openDocumentScanner;
  window.openDocumentScanner = function (type, side) {
    var r = osPrev.apply(this, arguments);
    setupScanner();
    if (type === 'guide') { $('scanDocType').value = 'guide'; }
    syncType();
    return r;
  };

  /* ---------- Cartera › Guías: botones para escanear ---------- */
  var rwPrev = window.renderWallet;
  window.renderWallet = function () {
    var r = rwPrev.apply(this, arguments);
    try {
      if (st('walletTab') === 'Guías' || (document.querySelector('#walletSeg .chip.active') || {}).textContent === 'Guías') {
        var body = $('walletBody');
        if (body && !$('tpGuideScanBtns')) {
          var div = document.createElement('div'); div.id = 'tpGuideScanBtns';
          div.innerHTML = '<button class="btn primary" type="button" onclick="tpOpenGuideScanner()">▣ ESCANEAR O SUBIR FOTO DE UNA GUÍA</button>' +
            '<div class="tiny" style="margin:6px 2px 10px">Lee el nº de guía, marca, modelo, calibre y nº de serie. Si el arma no existe, la crea.</div>';
          var head = body.querySelector('.sectionHead'); if (head && head.nextSibling) body.insertBefore(div, head.nextSibling); else body.prepend(div);
        }
        Array.prototype.forEach.call(body.querySelectorAll('.docMini'), function (card) {
          if (card.querySelector('.tpScanOne')) return;
          var m = (card.getAttribute('onclick') || '').match(/openWeapon\('([^']+)'/); if (!m) return;
          var b = document.createElement('button'); b.type = 'button'; b.className = 'btn secondary tpScanOne'; b.style.marginTop = '10px'; b.textContent = '▣ Escanear guía';
          b.addEventListener('click', function (e) { e.stopPropagation(); window.tpOpenGuideScanner(m[1]); });
          card.appendChild(b);
        });
      }
    } catch (e) { console.warn('[R11 cartera]', e); }
    return r;
  };


  /* ---------- Armas: añadir un arma con la cámara (desde su guía) ---------- */
  window.tpAddWeaponByCamera = function () { try { tp38CloseModal(); } catch (e) {} window.__tpReturnTo = 'armas'; window.tpOpenGuideScanner('__new'); };
  function armasButton() {
    var list = document.getElementById('armas'); if (!list) return;
    var add = null;
    Array.prototype.forEach.call(list.querySelectorAll('button'), function (b) { if (!add && /añadir arma/i.test(b.textContent) && /tp38OpenWeaponForm\(\)/.test(b.getAttribute('onclick') || '')) add = b; });
    if (!add || document.getElementById('tpAddCamBtn')) return;
    var b = document.createElement('button'); b.id = 'tpAddCamBtn'; b.type = 'button'; b.className = 'btn secondary'; b.style.marginTop = '8px';
    b.textContent = '▣ AÑADIR CON LA CÁMARA (GUÍA)';
    b.addEventListener('click', window.tpAddWeaponByCamera);
    add.parentNode.insertBefore(b, add.nextSibling);
  }
  var rwpPrev = window.renderWeapons;
  if (typeof rwpPrev === 'function') window.renderWeapons = function () { var r = rwpPrev.apply(this, arguments); try { armasButton(); } catch (e) {} return r; };
  // En el formulario "Añadir arma": botón para rellenarlo con la cámara
  var wfPrev = window.tp38OpenWeaponForm;
  if (typeof wfPrev === 'function') window.tp38OpenWeaponForm = function (id) {
    var r = wfPrev.apply(this, arguments);
    try {
      if (!id) {
        var fields = document.getElementById('tp38Fields');
        if (fields && !document.getElementById('tpFormCam')) {
          var d = document.createElement('div'); d.id = 'tpFormCam'; d.style.cssText = 'grid-column:1/-1;margin-bottom:6px';
          d.innerHTML = '<button type="button" class="btn secondary" style="width:100%" onclick="tpAddWeaponByCamera()">▣ RELLENAR CON LA CÁMARA (FOTO DE LA GUÍA)</button><div class="tiny" style="margin:6px 2px 0">O rellena los datos a mano:</div>';
          fields.insertBefore(d, fields.firstChild);
        }
      }
    } catch (e) {}
    return r;
  };
  var goPrev2 = window.go;
  window.go = function (id) { var r = goPrev2.apply(this, arguments); if (id === 'armas') setTimeout(armasButton, 0); return r; };
  armasButton();

  setupScanner();
})();
