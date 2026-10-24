/* Tirador Pro · R23 · fotos de documentos con la cámara del escáner (marco + recorte automático)
   DNI, otros documentos, carnet federativo y guías: "Hacer foto con marco" abre el escáner en modo foto:
   encuadras dentro del marco, recorta y centra, y GUARDAR FOTO la deja en su sitio y vuelve atrás. */
(function () {
  'use strict';
  if (window.__TP_R23__) return; window.__TP_R23__ = true;
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function toast(m) { try { showToast(m); } catch (e) {} }

  var css = '#documentScanner.r23 .controlCard:has(#scanDocType),#documentScanner.r23 #ocrFields,#documentScanner.r23 .ocrProgress,#documentScanner.r23 #ocrStatus,' +
    '#documentScanner.r23 #scanResultBlock>button.btn.secondary{display:none!important}' +
    '#r23Banner{margin:0 0 10px;padding:12px 14px;border-radius:14px;background:#2a3018;border:1px solid #83913b;color:#fff;font-weight:850;font-size:15px}' +
    '#r23Banner small{display:block;color:#c9cfa8;font-weight:600;font-size:12.5px;margin-top:3px}' +
    '#r23Save{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}' +
    '#r23Save button{min-height:58px;margin:0}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var job = null;
  function mode(on) {
    var sc = $('documentScanner'); if (!sc) return;
    sc.classList.toggle('r23', !!on);
    var ban = $('r23Banner'), res = $('scanResultBlock');
    if (on) {
      if (!ban) { ban = document.createElement('div'); ban.id = 'r23Banner'; var hero = sc.querySelector('.hero'); sc.insertBefore(ban, hero ? hero.nextSibling : sc.firstChild); }
      ban.innerHTML = '📷 Foto para: ' + esc(job.title) + '<small>Encuadra el documento dentro del marco y pulsa el botón redondo. También puedes usar "Subir foto".</small>';
      if (res && !$('r23Save')) {
        var b = document.createElement('div'); b.id = 'r23Save';
        b.innerHTML = '<button type="button" class="btn secondary" data-a="again">↺ REPETIR</button><button type="button" class="btn primary" data-a="save">✓ GUARDAR FOTO</button>';
        var prev = res.querySelector('.scanPreview'); res.insertBefore(b, prev ? prev.nextSibling : null);
        b.onclick = function (ev) {
          var x = ev.target.closest('[data-a]'); if (!x) return;
          if (x.getAttribute('data-a') === 'again') { res.style.display = 'none'; try { scannedDocData = null; } catch (e) {} window.scrollTo(0, 0); return; }
          save();
        };
      }
    } else {
      if (ban) ban.remove();
      var sv = $('r23Save'); if (sv) sv.remove();
    }
  }
  function save() {
    var img = null; try { img = scannedDocData; } catch (e) {}
    if (!img || !job) return toast('Primero haz la foto.');
    var j = job;
    if (!window.tpDocPhoto || !window.tpDocPhoto.put(j.id, img)) return;
    job = null; mode(false);
    try { if (docStream) { docStream.getTracks().forEach(function (t) { t.stop(); }); docStream = null; docTrack = null; } } catch (e) {}
    back(j);
    toast(j.title + ' guardado.');
  }
  function back(j) {
    try {
      if (j.ret === 'weaponDetail' && j.wid) { openWeapon(j.wid); if (j.wtab) setWeaponDetailTab(j.wtab); return; }
      if (j.ret === 'cartera') { go('cartera'); if (j.wallet) setWalletTab(j.wallet); return; }
      go(j.ret || 'cartera');
    } catch (e) { try { go('cartera'); } catch (x) {} }
  }
  window.tpScanPhoto = function (id, title) {
    var cur = (document.querySelector('.screen.active') || {}).id || 'cartera';
    job = { id: id, title: title, ret: cur };
    try { if (cur === 'weaponDetail' && activeWeapon) { job.wid = activeWeapon.id; job.wtab = weaponDetailTab; } } catch (e) {}
    try { if (cur === 'cartera') job.wallet = walletTab; } catch (e) {}
    var p = openDocumentScanner('other', 'front');
    mode(true);
    try { var r = $('scanResultBlock'); if (r) r.style.display = 'none'; } catch (e) {}
    return p;
  };
  // si sale del escáner sin guardar, se cancela el modo foto; "Cerrar" vuelve a donde estaba
  var goPrev = window.go;
  if (typeof goPrev === 'function') {
    window.go = function (id) {
      if (id !== 'documentScanner' && job) { var j = job; job = null; mode(false); if (id === 'cartera' && j.ret !== 'cartera') { var r0 = goPrev.apply(this, arguments); back(j); return r0; } }
      return goPrev.apply(this, arguments);
    };
    try { go = window.go; } catch (e) {}
  }
  // al hacer o subir la foto, llevar la vista al botón GUARDAR
  try {
    new MutationObserver(function () {
      if (!job) return; var res = $('scanResultBlock'), sv = $('r23Save');
      if (res && sv && res.style.display === 'block' && !sv.dataset.seen) { sv.dataset.seen = '1'; setTimeout(function () { try { sv.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {} }, 150); }
      if (res && sv && res.style.display === 'none') delete sv.dataset.seen;
    }).observe(document.body, { attributes: true, attributeFilter: ['style'], subtree: true });
  } catch (e) {}
})();
