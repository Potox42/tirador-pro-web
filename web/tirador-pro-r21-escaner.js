/* Tirador Pro · R21 · escáner: guardar sin tener que leer datos + fotos de guías recortadas
   - Al hacer o subir la foto ya salen los campos y el botón GUARDAR. Leer datos es opcional.
   - El carnet federativo escaneado se guarda también en Cartera › Federación (anverso/reverso).
   - Fotos de guías y carnet: rellenan el recuadro, recortadas y centradas. */
(function () {
  'use strict';
  if (window.__TP_R21__) return; window.__TP_R21__ = true;
  function $(id) { return document.getElementById(id); }

  var css = '.r19Slot.has:not(.qr){background-size:cover!important;background-position:center!important}' +
    '.r19Guide .r19Slot{aspect-ratio:1!important;width:84px!important}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var syncing = false;
  function openFields() {
    var res = $('scanResultBlock'), f = $('ocrFields');
    if (!res || !f || res.style.display === 'none' || f.style.display !== 'none' || syncing) return;
    syncing = true;
    try {
      f.style.display = 'block';
      try { if (!lastOCRResult || typeof lastOCRResult !== 'object') lastOCRResult = {}; if (!Array.isArray(lastOCRResult.licenses)) lastOCRResult.licenses = []; } catch (e) {}
      var t = $('scanDocType'); if (t) t.dispatchEvent(new Event('change')); // muestra los campos de la guía si toca
      var s = $('ocrStatus'); if (s && !/opcional/i.test(s.textContent)) s.textContent = 'Rellena o revisa los datos y pulsa GUARDAR. Leer datos automáticamente es opcional.';
      var raw = $('ocrRawText'); if (raw && !raw.textContent) raw.textContent = '—';
    } finally { syncing = false; }
  }
  function labels() {
    var sc = $('documentScanner'); if (!sc) return;
    Array.prototype.forEach.call(sc.querySelectorAll('button'), function (b) {
      if (/LEER DATOS AUTOM/.test(b.textContent) && !/opcional/.test(b.textContent)) b.textContent = '⌕ LEER DATOS AUTOMÁTICAMENTE (opcional)';
      if (/GUARDAR DATOS REVISADOS/.test(b.textContent)) b.textContent = 'GUARDAR';
    });
    var h = sc.querySelector('#ocrFields .sectionHead b'); if (h && h.textContent === 'Datos detectados') h.textContent = 'Datos del documento';
  }
  try {
    var queued = false; new MutationObserver(function () { if (queued) return; queued = true; requestAnimationFrame(function () { queued = false; labels(); openFields(); }); })
      .observe(document.body, { attributes: true, attributeFilter: ['style'], subtree: true, childList: true });
  } catch (e) {}

  // carnet federativo escaneado → también en Cartera › Federación
  var aPrev = window.applyOCRData;
  if (typeof aPrev === 'function') window.applyOCRData = async function () {
    var type = $('scanDocType') ? $('scanDocType').value : '', side = $('scanSide') ? $('scanSide').value : 'front';
    var img = null; try { img = scannedDocData; } catch (e) {}
    try { if (!lastOCRResult || typeof lastOCRResult !== 'object') lastOCRResult = {}; if (!Array.isArray(lastOCRResult.licenses)) lastOCRResult.licenses = []; } catch (e) {}
    var r = await aPrev.apply(this, arguments);
    if (type === 'federation' && img) {
      try {
        var k = 'tpfield37_docPhotos', m = JSON.parse(localStorage.getItem(k) || '{}') || {};
        m[side === 'back' ? 'fedBack' : 'fedFront'] = img;
        localStorage.setItem(k, JSON.stringify(m));
      } catch (e) {}
    }
    return r;
  };
})();
