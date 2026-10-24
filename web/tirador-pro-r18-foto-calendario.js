/* Tirador Pro · R18 · botón Entrenar destacado, foto del arma y calendario que funciona
   - Barra inferior: Entrenar en un círculo verde oliva elevado.
   - Foto del arma: desde la cámara o la galería (en el formulario, en la ficha y en la lista).
     Se guarda en IndexedDB (cifrada si hay PIN) y entra en las copias de seguridad.
   - Calendario: Google Calendar (un botón por fecha) y, para el calendario del iPhone,
     archivo .ics por la hoja Compartir (Mail → "Añadir todo"). */
(function () {
  'use strict';
  if (window.__TP_R18__) return; window.__TP_R18__ = true;
  var PKEY = 'tpfield37_weaponPhotos';
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function toast(m) { try { showToast(m); } catch (e) {} }
  function W() { try { var w = window.__tpState && window.__tpState.get('weapons'); if (Array.isArray(w)) return w; } catch (e) {} return []; }

  /* ---------- 1. Botón Entrenar destacado ---------- */
  var css = '#n-entrenar{color:#dfe7a6!important;overflow:visible}' +
    '#n-entrenar .ico{width:56px;height:56px;margin:-30px auto 3px!important;border-radius:50%;display:grid!important;place-items:center;background:radial-gradient(circle at 35% 30%,#a3b24e,#6f7c2c);color:#fff;border:4px solid #0f100c;box-shadow:0 8px 22px rgba(131,145,59,.6),0 0 0 1px rgba(201,207,168,.35)}' +
    '#n-entrenar .ico svg{width:28px!important;height:28px!important;stroke:#fff;stroke-width:2.1}' +
    '#n-entrenar.active .ico{box-shadow:0 8px 26px rgba(163,178,78,.85),0 0 0 2px #dfe7a6}' +
    '#n-entrenar:active .ico{transform:scale(.94)}' +
    /* fotos */
    '.r18Photo{position:relative;width:100%;aspect-ratio:16/9;border-radius:18px;overflow:hidden;background:#14160f;border:1px dashed rgba(201,207,168,.35);display:grid;place-items:center;color:#c9cfa8;font-weight:850;font-size:15px;margin:12px 0 0}' +
    '.r18Photo img{width:100%;height:100%;object-fit:contain;object-position:center;display:block}' +
    '.r18Photo.has{aspect-ratio:auto;min-height:0;background:#0b0c08}' +
    '.r18Photo.has img{height:auto;max-height:62vh;margin:0 auto}' +
    '.weaponArt.r18Thumb{background:#0b0c08}' +
    '.r18Photo .r18Edit{position:absolute;right:10px;bottom:10px;min-height:40px;padding:0 12px;border-radius:12px;border:0;background:rgba(0,0,0,.6);color:#fff;font-weight:850}' +
    '.weaponArt.r18Thumb{padding:0;overflow:hidden}.weaponArt.r18Thumb img{width:100%;height:100%;object-fit:contain;object-position:center;display:block}' +
    '.r18FormPhoto{grid-column:1/-1;display:flex;align-items:center;gap:12px;margin-bottom:6px}' +
    '.r18FormPhoto .pv{width:72px;height:54px;border-radius:12px;background:#1a1c15;border:1px dashed #ffffff33;overflow:hidden;flex:none;display:grid;place-items:center;color:#9ea486}' +
    '.r18FormPhoto .pv img{width:100%;height:100%;object-fit:contain;object-position:center;background:#0b0c08}' +
    /* calendario */
    '.r18Cal{margin:14px 0;padding:14px;border-radius:16px;border:1px solid #ffffff1c;background:#1a1c15}' +
    '.r18Cal>b{display:block;font-size:15px;margin-bottom:4px}.r18Cal p{margin:0 0 10px;color:#b5ba9c;font-size:13px;line-height:1.45}' +
    '.r18Row{display:flex;align-items:center;gap:10px;min-height:52px;border-top:1px solid #ffffff10}' +
    '.r18Row div{flex:1;font-size:14px}.r18Row small{display:block;color:#aab08f;font-size:12px}' +
    '.r18Row button{min-height:42px;padding:0 12px;border-radius:12px;border:1px solid #ffffff2a;background:#262a1d;color:#fff;font-weight:850;white-space:nowrap}' +
    '.r18Row button.done{background:#3c4a1c;border-color:#83913b}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------- 2. Foto del arma ---------- */
  function photoMap() { try { var m = JSON.parse(localStorage.getItem(PKEY) || '{}'); return m && typeof m === 'object' ? m : {}; } catch (e) { return {}; } }
  function savePhoto(wid, dataUrl) {
    var m = photoMap();
    if (dataUrl) m[wid] = dataUrl; else delete m[wid];
    try { localStorage.setItem(PKEY, JSON.stringify(m)); } catch (e) { toast('No hay espacio para la foto.'); return false; }
    if (dataUrl) memo[wid] = dataUrl; else delete memo[wid];
    return true;
  }
  var memo = {};
  async function getPhoto(wid) {
    if (memo[wid]) return memo[wid];
    var v = photoMap()[wid]; if (!v) return null;
    if (v.indexOf('tpimg:') === 0) { try { v = window.TPImg ? await window.TPImg.get(v.slice(6)) : null; } catch (e) { v = null; } }
    if (v) memo[wid] = v;
    return v;
  }
  function pickImage() {
    return new Promise(function (resolve) {
      var inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
      inp.style.cssText = 'position:fixed;left:-9999px;opacity:0';
      document.body.appendChild(inp);
      inp.onchange = function () {
        var f = inp.files && inp.files[0]; inp.remove();
        if (!f) return resolve(null);
        var url = URL.createObjectURL(f), img = new Image();
        img.onload = function () {
          var max = 1400, s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
          var c = document.createElement('canvas'); c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          URL.revokeObjectURL(url);
          resolve(c.toDataURL('image/jpeg', 0.82));
        };
        img.onerror = function () { URL.revokeObjectURL(url); toast('No se pudo leer la foto.'); resolve(null); };
        img.src = url;
      };
      inp.click();
    });
  }
  async function choose(wid) {
    var d = await pickImage(); if (!d) return;
    if (savePhoto(wid, d)) { refresh(); toast('Foto del arma guardada.'); }
  }
  function changePhoto(wid) {
    if (!photoMap()[wid]) return choose(wid); // abre la cámara/galería en el mismo toque
    var sh = document.createElement('div');
    sh.style.cssText = 'position:fixed;inset:0;z-index:10300;background:rgba(0,0,0,.55);display:flex;align-items:flex-end';
    sh.innerHTML = '<div style="width:100%;background:#1a1c15;border-radius:22px 22px 0 0;padding:16px 16px calc(18px + env(safe-area-inset-bottom));display:grid;gap:10px">' +
      '<b style="font-size:17px;color:#fff">Foto del arma</b>' +
      '<button type="button" class="btn primary" data-a="c" style="margin:0">📷 CAMBIAR FOTO</button>' +
      '<button type="button" class="btn secondary" data-a="d" style="margin:0">QUITAR FOTO</button>' +
      '<button type="button" class="btn secondary" data-a="x" style="margin:0">CANCELAR</button></div>';
    document.body.appendChild(sh);
    sh.onclick = function (ev) {
      var b = ev.target.closest('[data-a]');
      if (!b && ev.target !== sh) return;
      var a = b ? b.getAttribute('data-a') : 'x';
      sh.remove();
      if (a === 'c') choose(wid);
      if (a === 'd') { savePhoto(wid, null); refresh(); toast('Foto quitada.'); }
    };
  }
  window.tpWeaponPhoto = changePhoto;
  function refresh() {
    try { var act = document.querySelector('.screen.active'); var id = act && act.id;
      if (id === 'weaponDetail') renderWeaponDetail37();
      if (id === 'armas') renderWeapons();
    } catch (e) {}
  }
  // ficha del arma
  function decorateDetail() {
    var w = null; try { w = activeWeapon; } catch (e) {}
    var body = $('weaponDetailBody'); if (!w || !body || body.querySelector('.r18Photo')) return;
    var hero = body.querySelector('.cockpitHero') || body.querySelector('.hero'); if (!hero) return;
    var box = document.createElement('div'); box.className = 'r18Photo';
    box.innerHTML = '<span>📷 Añadir foto del arma</span>';
    box.onclick = function () { changePhoto(w.id); };
    var top = hero.querySelector('.cockpitTop');
    if (top && top.nextSibling) hero.insertBefore(box, top.nextSibling); else hero.appendChild(box);
    getPhoto(w.id).then(function (src) {
      if (!src || !box.isConnected) return;
      box.style.borderStyle = 'solid'; box.classList.add('has');
      box.innerHTML = '<img alt="Foto de ' + esc(w.name) + '"><button type="button" class="r18Edit">📷 Cambiar</button>';
      box.querySelector('img').src = src;
    });
  }
  // lista de armas: miniatura
  function decorateList() {
    var list = $('weaponList'); if (!list) return;
    Array.prototype.forEach.call(list.querySelectorAll('.weapon[onclick*="openWeapon"]'), function (card) {
      var m = (card.getAttribute('onclick') || '').match(/openWeapon\('([^']+)'\)/); if (!m) return;
      var art = card.querySelector('.weaponArt'); if (!art || art.dataset.r18) return;
      art.dataset.r18 = '1';
      getPhoto(m[1]).then(function (src) { if (!src) return; art.classList.add('r18Thumb'); art.textContent = ''; art.style.background = '#0b0c08 url("' + src + '") center / contain no-repeat'; });
    });
  }
  var rwdPrev = window.renderWeaponDetail37;
  if (typeof rwdPrev === 'function') { window.renderWeaponDetail37 = function () { var r = rwdPrev.apply(this, arguments); try { decorateDetail(); } catch (e) {} try { decorateGuideDate(); } catch (e) {} return r; }; try { renderWeaponDetail37 = window.renderWeaponDetail37; } catch (e) {} }
  var rwPrev = window.renderWeapons;
  if (typeof rwPrev === 'function') { window.renderWeapons = function () { var r = rwPrev.apply(this, arguments); try { decorateList(); } catch (e) {} return r; }; try { renderWeapons = window.renderWeapons; } catch (e) {} }

  // formulario Añadir / Editar arma: botón de foto
  var formPrev = window.tp38OpenForm;
  window.tp38OpenForm = function (opts) {
    var isW = opts && (opts.title === 'Añadir arma' || opts.title === 'Editar arma');
    var pending = { data: undefined }, w0 = null;
    if (isW) {
      try {
        var gi = (opts.fields || []).findIndex(function (f) { return f.name === 'guide'; });
        var gdField = { name: 'tpGuideDate', label: 'Expedición de la guía', type: 'date', value: '' };
        opts.fields = (opts.fields || []).slice();
        opts.fields.splice(gi === -1 ? opts.fields.length : gi + 1, 0, gdField);
      } catch (e) {}
      try {
        var nf = (opts.fields || []).filter(function (f) { return f.name === 'name'; })[0], cf = (opts.fields || []).filter(function (f) { return f.name === 'caliber'; })[0];
        if (opts.title === 'Editar arma' && nf) w0 = W().filter(function (w) { return w.name === nf.value && (!cf || w.caliber === cf.value); })[0] || null;
      } catch (e) {}
      try { if (w0 && w0.guideDate) gdField.value = toISO(w0.guideDate); } catch (e) {}
      var save = opts.onSave;
      opts.onSave = async function (fd) {
        var before = W().map(function (w) { return w.id; });
        var r = await save.apply(this, arguments);
        if (r === false) return r;
        var name = String(fd.get('name') || '').trim();
        var t = w0 && W().indexOf(w0) !== -1 ? w0 : (W().filter(function (w) { return before.indexOf(w.id) === -1; })[0] || W().filter(function (w) { return w.name === name; }).slice(-1)[0]);
        if (t) {
          var gd = String(fd.get('tpGuideDate') || '');
          t.guideDate = gd ? toDMY(gd) : '';
          try { persistV37(); } catch (e) {}
          if (pending.data !== undefined) savePhoto(t.id, pending.data);
          refresh();
        }
        return r;
      };
    }
    var res = formPrev.apply(this, arguments);
    if (isW) {
      try {
        var fields = $('tp38Fields');
        var row = document.createElement('div'); row.className = 'r18FormPhoto';
        row.innerHTML = '<div class="pv">📷</div><button type="button" class="btn secondary" style="flex:1;margin:0">' + (w0 && photoMap()[w0.id] ? 'CAMBIAR FOTO DEL ARMA' : 'AÑADIR FOTO DEL ARMA') + '</button>';
        var cam = $('tpFormCam');
        if (cam && cam.parentNode === fields) fields.insertBefore(row, cam.nextSibling); else fields.insertBefore(row, fields.firstChild);
        var pv = row.querySelector('.pv');
        if (w0) getPhoto(w0.id).then(function (src) { if (src) { pv.innerHTML = '<img alt="">'; pv.firstChild.src = src; } });
        row.querySelector('button').onclick = async function () {
          var d = await pickImage(); if (!d) return;
          pending.data = d; pv.innerHTML = '<img alt="">'; pv.firstChild.src = d;
        };
      } catch (e) {}
    }
    return res;
  };
  try { tp38OpenForm = window.tp38OpenForm; } catch (e) {}

  /* ---------- 2b. Fecha de expedición de la guía ---------- */
  function toISO(dmy) { var m = String(dmy || '').match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})$/); return m ? m[3] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[1]).slice(-2) : ''; }
  function toDMY(iso) { var m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})$/); return m ? m[3] + '-' + m[2] + '-' + m[1] : ''; }
  function nice(dmy) { return String(dmy || '').replace(/-/g, '/'); }
  function decorateGuideDate() {
    var w = null; try { w = activeWeapon; } catch (e) {}
    var body = $('weaponDetailBody'); if (!w || !body || body.querySelector('.r18GD')) return;
    var txt = w.guideDate ? nice(w.guideDate) : 'Sin fecha';
    var row = Array.prototype.filter.call(body.querySelectorAll('.dataRow'), function (r) { var b = r.querySelector('b'); return b && b.textContent.trim() === 'Guía'; })[0];
    if (row) { var n = document.createElement('div'); n.className = 'dataRow r18GD'; n.innerHTML = '<b>Expedición de la guía</b><span>' + esc(txt) + '</span>'; row.parentNode.insertBefore(n, row.nextSibling); }
    var doc = body.querySelector('.docMini');
    if (doc) { var d = document.createElement('div'); d.className = 'muted r18GD'; d.style.marginTop = '4px'; d.textContent = 'Expedida el ' + txt; var h3 = doc.querySelector('h3'); if (h3) h3.parentNode.insertBefore(d, h3.nextSibling); else doc.appendChild(d); }
  }
  // Escáner de la guía: campo de fecha (se rellena si se lee del documento)
  var lastGuideText = '';
  var pPrev = window.parseOCRText;
  if (typeof pPrev === 'function') window.parseOCRText = function (text) { lastGuideText = String(text || ''); return pPrev.apply(this, arguments); };
  function guessGuideDate(t) {
    var up = String(t || '').replace(/[l|]/g, '1').toUpperCase();
    var rx = /(\d{1,2})\s*[\/\-.]\s*(\d{1,2})\s*[\/\-.]\s*(\d{4})/g, m, all = [];
    while ((m = rx.exec(up))) { var d = +m[1], mo = +m[2], y = +m[3]; if (d >= 1 && d <= 31 && mo >= 1 && mo <= 12 && y >= 1950 && y <= new Date().getFullYear()) all.push({ i: m.index, v: y + '-' + ('0' + mo).slice(-2) + '-' + ('0' + d).slice(-2) }); }
    if (!all.length) return '';
    var k = up.search(/EXPEDI|FECHA/);
    if (k !== -1) { all.sort(function (a, b) { return Math.abs(a.i - k) - Math.abs(b.i - k); }); }
    return all[0].v;
  }
  function addGuideDateBox() {
    var gf = $('tpGuideFields'); if (!gf) return;
    var grid = gf.querySelector('.extractGrid'); if (!grid || $('tpGuideDate')) return;
    var b = document.createElement('div'); b.className = 'extractBox';
    b.innerHTML = '<label>EXPEDICIÓN DE LA GUÍA</label><input id="tpGuideDate" type="date" style="width:100%;background:transparent;border:0;color:inherit;font-size:16px">';
    grid.appendChild(b);
    var v = guessGuideDate(lastGuideText); if (v) $('tpGuideDate').value = v;
  }
  try { new MutationObserver(function () { addGuideDateBox(); }).observe(document.body, { childList: true, subtree: true }); } catch (e) {}
  var aPrev = window.applyOCRData;
  if (typeof aPrev === 'function') window.applyOCRData = async function () {
    var isG = $('scanDocType') && $('scanDocType').value === 'guide';
    var gd = isG && $('tpGuideDate') ? $('tpGuideDate').value : '';
    var sel = isG && $('tpGuideWeapon') ? $('tpGuideWeapon').value : '';
    var before = W().map(function (w) { return w.id; });
    var r = await aPrev.apply(this, arguments);
    if (isG && gd) {
      var t = W().filter(function (w) { return w.id === sel; })[0] || W().filter(function (w) { return before.indexOf(w.id) === -1; })[0];
      if (t) { t.guideDate = toDMY(gd); try { persistV37(); } catch (e) {} }
    }
    lastGuideText = '';
    return r;
  };

  /* ---------- 3. Calendario ---------- */
  var DONE = 'tpfield37_calAdded';
  function doneMap() { try { return JSON.parse(localStorage.getItem(DONE) || '{}') || {}; } catch (e) { return {}; } }
  function ymd(d) { return d.getFullYear() + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2); }
  function dmy(d) { return ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + '/' + d.getFullYear(); }
  function googleUrl(x) {
    var end = new Date(x.date.getFullYear(), x.date.getMonth(), x.date.getDate() + 1);
    var details = x.desc + '\n\nCreado desde Tirador Pro. Consejo: añade un aviso 2 meses y 1 semana antes.';
    return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(x.title) +
      '&dates=' + ymd(x.date) + '/' + ymd(end) + '&details=' + encodeURIComponent(details);
  }
  function calHTML() {
    var list = window.TPCalendar ? window.TPCalendar.collect() : [];
    var dm = doneMap();
    var h = '<b>📅 Caducidades al calendario</b>';
    if (!list.length) return h + '<p style="color:#d8c27a">Todavía no hay fechas de caducidad futuras guardadas (licencias, revista de armas, federación).</p>';
    h += '<p><b style="display:inline;font-size:13px">Google Calendar:</b> pulsa “+ Google” en cada fecha y luego “Guardar”. Si tu iPhone tiene la cuenta de Google, también saldrá en el Calendario del iPhone.</p>';
    h += list.map(function (x, i) {
      var k = x.uid + '|' + ymd(x.date), ok = !!dm[k];
      return '<div class="r18Row"><div>' + esc(x.title) + '<small>' + dmy(x.date) + '</small></div><button type="button" data-g="' + i + '"' + (ok ? ' class="done"' : '') + '>' + (ok ? '✓ Añadido' : '+ Google') + '</button></div>';
    }).join('');
    h += '<p style="margin-top:12px"><b style="display:inline;font-size:13px">Calendario del iPhone:</b> pulsa el botón, elige <b style="display:inline">Mail</b> y envíatelo a ti mismo. Al abrir el adjunto en el iPhone sale “Añadir todo”, con avisos 60, 30 y 7 días antes.</p>';
    h += '<button type="button" class="btn secondary" style="width:100%" data-ics="1">ENVIAR ARCHIVO PARA EL IPHONE</button>';
    return h;
  }
  function decorateCal() {
    ['cartera', 'perfil'].forEach(function (sid) {
      var old = $('tpCalBox_' + sid); if (!old) return;
      var box = $('r18Cal_' + sid);
      if (!box) {
        box = document.createElement('div'); box.className = 'r18Cal'; box.id = 'r18Cal_' + sid;
        old.parentNode.insertBefore(box, old);
        box.addEventListener('click', function (ev) {
          var g = ev.target.closest('[data-g]');
          if (g) {
            var x = window.TPCalendar.collect()[+g.getAttribute('data-g')]; if (!x) return;
            window.open(googleUrl(x), '_blank');
            var dm = doneMap(); dm[x.uid + '|' + ymd(x.date)] = 1; try { localStorage.setItem(DONE, JSON.stringify(dm)); } catch (e) {}
            g.className = 'done'; g.textContent = '✓ Añadido';
            return;
          }
          if (ev.target.closest('[data-ics]')) {
            var list = window.TPCalendar.collect(); if (!list.length) return;
            var ics = window.TPCalendar.build(list);
            if (typeof window.downloadText === 'function') window.downloadText('Tirador-Pro-caducidades.ics', ics, 'text/calendar');
          }
        });
      }
      old.style.display = 'none';
      box.innerHTML = calHTML();
    });
  }

  var goPrev = window.go;
  if (typeof goPrev === 'function') {
    window.go = function (id) {
      var r = goPrev.apply(this, arguments);
      try { if (id === 'cartera' || id === 'perfil') decorateCal(); if (id === 'armas') decorateList(); if (id === 'weaponDetail') decorateDetail(); } catch (e) {}
      return r;
    };
    try { go = window.go; } catch (e) {}
  }
})();
