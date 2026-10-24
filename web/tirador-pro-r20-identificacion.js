/* Tirador Pro · R20 · Nº de identificación del arma (debajo del Nº de guía)
   En el formulario del arma, en la ficha (Resumen y Documentos), en Cartera › Guías
   y al escanear la guía (se intenta leer solo). */
(function () {
  'use strict';
  if (window.__TP_R20__) return; window.__TP_R20__ = true;
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function W() { try { var w = window.__tpState && window.__tpState.get('weapons'); if (Array.isArray(w)) return w; } catch (e) {} return []; }

  /* formulario */
  var formPrev = window.tp38OpenForm;
  window.tp38OpenForm = function (opts) {
    var isW = opts && (opts.title === 'Añadir arma' || opts.title === 'Editar arma');
    var w0 = null;
    if (isW) {
      try {
        var nf = (opts.fields || []).filter(function (f) { return f.name === 'name'; })[0], cf = (opts.fields || []).filter(function (f) { return f.name === 'caliber'; })[0];
        if (opts.title === 'Editar arma' && nf) w0 = W().filter(function (w) { return w.name === nf.value && (!cf || w.caliber === cf.value); })[0] || null;
        opts.fields = (opts.fields || []).concat([{ name: 'tpIdNumber', label: 'Nº de identificación', value: w0 && w0.idNumber || '', placeholder: 'Nº de identificación del arma' }]);
        var save = opts.onSave;
        opts.onSave = async function (fd) {
          var before = W().map(function (w) { return w.id; });
          var r = await save.apply(this, arguments);
          if (r === false) return r;
          var name = String(fd.get('name') || '').trim();
          var t = w0 && W().indexOf(w0) !== -1 ? w0 : (W().filter(function (w) { return before.indexOf(w.id) === -1; })[0] || W().filter(function (w) { return w.name === name; }).slice(-1)[0]);
          if (t) {
            t.idNumber = String(fd.get('tpIdNumber') || '').trim();
            try { persistV37(); } catch (e) {}
            try { var id = (document.querySelector('.screen.active') || {}).id; if (id === 'weaponDetail') renderWeaponDetail37(); if (id === 'cartera') renderWallet(); } catch (e) {}
          }
          return r;
        };
      } catch (e) {}
    }
    var res = formPrev.apply(this, arguments);
    if (isW) {
      // colocarlo justo debajo del Nº de guía
      try {
        var box = $('tp38Fields'), mine = box.querySelector('[name="tpIdNumber"]'), guide = box.querySelector('[name="guide"]');
        var mf = mine && mine.closest('.tp38-field'), gf = guide && guide.closest('.tp38-field');
        if (mf && gf) gf.parentNode.insertBefore(mf, gf.nextSibling);
      } catch (e) {}
    }
    return res;
  };
  try { tp38OpenForm = window.tp38OpenForm; } catch (e) {}

  /* ficha del arma */
  function decorateDetail() {
    var w = null; try { w = activeWeapon; } catch (e) {}
    var body = $('weaponDetailBody'); if (!w || !body || body.querySelector('.r20ID')) return;
    var txt = w.idNumber || 'Sin registrar';
    var row = Array.prototype.filter.call(body.querySelectorAll('.dataRow'), function (r) { var b = r.querySelector('b'); return b && b.textContent.trim() === 'Guía'; })[0];
    if (row) { var n = document.createElement('div'); n.className = 'dataRow r20ID'; n.innerHTML = '<b>Nº de identificación</b><span>' + esc(txt) + '</span>'; row.parentNode.insertBefore(n, row.nextSibling); }
    var doc = body.querySelector('.docMini');
    if (doc) { var d = document.createElement('div'); d.className = 'muted r20ID'; d.style.marginTop = '4px'; d.textContent = 'Nº de identificación: ' + txt; var h3 = doc.querySelector('h3'); if (h3) h3.parentNode.insertBefore(d, h3.nextSibling); else doc.appendChild(d); }
  }
  var rdPrev = window.renderWeaponDetail37;
  if (typeof rdPrev === 'function') { window.renderWeaponDetail37 = function () { var r = rdPrev.apply(this, arguments); try { decorateDetail(); } catch (e) {} return r; }; try { renderWeaponDetail37 = window.renderWeaponDetail37; } catch (e) {} }

  /* Cartera › Guías */
  function decorateWallet() {
    var tab = ''; try { tab = walletTab; } catch (e) {}
    var body = $('walletBody'); if (tab !== 'Guías' || !body) return;
    Array.prototype.forEach.call(body.querySelectorAll('.docMini[onclick*="openWeapon"]'), function (card) {
      if (card.querySelector('.r20ID')) return;
      var m = (card.getAttribute('onclick') || '').match(/openWeapon\('([^']+)'/); if (!m) return;
      var w = W().filter(function (x) { return x.id === m[1]; })[0]; if (!w) return;
      var d = document.createElement('div'); d.className = 'muted r20ID'; d.style.cssText = 'margin-top:3px;font-size:13px';
      d.textContent = 'Nº de identificación: ' + (w.idNumber || 'sin registrar');
      var mu = card.querySelector('.muted'); if (mu) mu.parentNode.insertBefore(d, mu.nextSibling); else card.appendChild(d);
    });
  }
  var rwPrev = window.renderWallet;
  if (typeof rwPrev === 'function') { window.renderWallet = function () { var r = rwPrev.apply(this, arguments); try { decorateWallet(); } catch (e) {} return r; }; try { renderWallet = window.renderWallet; } catch (e) {} }

  /* escáner de la guía: casilla y lectura automática */
  var lastText = '';
  var pPrev = window.parseOCRText;
  if (typeof pPrev === 'function') window.parseOCRText = function (text) { lastText = String(text || ''); return pPrev.apply(this, arguments); };
  function guessId(t) {
    var up = String(t || '').toUpperCase();
    var m = up.match(/N[ºO°9.]*\s*(?:DE\s*)?IDENTIFICACI[OÓ0]N\s*(?:DEL\s*ARMA)?\s*[:.\-]?\s*([A-Z0-9][A-Z0-9\-\/ ]{2,24})/);
    return m ? m[1].trim().split(/\s{2,}/)[0] : '';
  }
  function addBox() {
    var gf = $('tpGuideFields'); if (!gf) return;
    var grid = gf.querySelector('.extractGrid'); if (!grid || $('tpGuideIdNum')) return;
    var b = document.createElement('div'); b.className = 'extractBox';
    b.innerHTML = '<label>Nº DE IDENTIFICACIÓN</label><input id="tpGuideIdNum" placeholder="No detectado">';
    var first = grid.children[1]; grid.insertBefore(b, first || null);
    var v = guessId(lastText); if (v) $('tpGuideIdNum').value = v;
  }
  try { new MutationObserver(function () { addBox(); }).observe(document.body, { childList: true, subtree: true }); } catch (e) {}
  var aPrev = window.applyOCRData;
  if (typeof aPrev === 'function') window.applyOCRData = async function () {
    var isG = $('scanDocType') && $('scanDocType').value === 'guide';
    var idn = isG && $('tpGuideIdNum') ? $('tpGuideIdNum').value.trim() : '';
    var sel = isG && $('tpGuideWeapon') ? $('tpGuideWeapon').value : '';
    var before = W().map(function (w) { return w.id; });
    var r = await aPrev.apply(this, arguments);
    if (isG && idn) {
      var t = W().filter(function (w) { return w.id === sel; })[0] || W().filter(function (w) { return before.indexOf(w.id) === -1; })[0];
      if (t) { t.idNumber = idn; try { persistV37(); } catch (e) {} }
    }
    lastText = '';
    return r;
  };
})();
