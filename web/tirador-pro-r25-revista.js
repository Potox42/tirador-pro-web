/* Tirador Pro · R25 · próxima revista calculada según la normativa
   Reglamento de Armas (RD 137/1993, art. 90) y Ministerio del Interior: las armas con guía de pertenencia
   pasan revista cada cinco años, en el momento de renovar la licencia (dentro del mes de la renovación).
   Por eso la próxima revista = caducidad de la licencia a la que va asociada el arma (D, E o F).
   El usuario puede desmarcarlo y poner la fecha a mano. */
(function () {
  'use strict';
  if (window.__TP_R25__) return; window.__TP_R25__ = true;
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function W() { try { var w = window.__tpState && window.__tpState.get('weapons'); if (Array.isArray(w)) return w; } catch (e) {} return []; }
  function lic(type) { try { return (licenseDoc.licenses || []).filter(function (l) { return String(l.type).toUpperCase() === String(type).toUpperCase(); })[0] || null; } catch (e) { return null; } }
  var AUTO_TYPES = ['D', 'E', 'F'];
  function autoDate(w) { if (!w || AUTO_TYPES.indexOf(String(w.licenseType || '').toUpperCase()) === -1) return ''; var l = lic(w.licenseType); return l && l.to ? l.to : ''; }
  function isAuto(w) { return w && w.reviewAuto !== false; }
  function nice(d) { return String(d || '').replace(/-/g, '/'); }

  // sincroniza la fecha de revista de las armas en automático
  function sync() {
    var changed = false;
    W().forEach(function (w) {
      if (!isAuto(w)) return;
      var d = autoDate(w);
      if (d && w.review !== d) { w.review = d; changed = true; }
    });
    if (changed) { try { persistV37(); } catch (e) {} }
  }
  window.TPRevista = { sync: sync, auto: autoDate };

  /* formulario del arma: casilla "calcular con la licencia" */
  var fPrev = window.tp38OpenForm;
  window.tp38OpenForm = function (opts) {
    var isW = opts && (opts.title === 'Añadir arma' || opts.title === 'Editar arma');
    var w0 = null;
    if (isW) {
      try {
        var nf = (opts.fields || []).filter(function (f) { return f.name === 'name'; })[0], cf = (opts.fields || []).filter(function (f) { return f.name === 'caliber'; })[0];
        if (opts.title === 'Editar arma' && nf) w0 = W().filter(function (w) { return w.name === nf.value && (!cf || w.caliber === cf.value); })[0] || null;
        opts.fields = (opts.fields || []).concat([{ name: 'tpRevAuto', label: 'Calcular la próxima revista con la licencia', type: 'checkbox', checked: !w0 || isAuto(w0), hint: 'Normativa: la revista se pasa cada 5 años, al renovar la licencia (D, E o F) a la que va asociada el arma.' }]);
        var save = opts.onSave;
        opts.onSave = async function (fd) {
          var before = W().map(function (w) { return w.id; });
          var auto = fd.get('tpRevAuto') != null;
          if (w0) w0.reviewAuto = auto; // antes de guardar, para que nada la recalcule
          var r = await save.apply(this, arguments);
          if (r === false) return r;
          var name = String(fd.get('name') || '').trim();
          var t = w0 && W().indexOf(w0) !== -1 ? w0 : (W().filter(function (w) { return before.indexOf(w.id) === -1; })[0] || W().filter(function (w) { return w.name === name; }).slice(-1)[0]);
          if (t) { t.reviewAuto = auto; if (auto) { var d = autoDate(t); if (d) t.review = d; } else { var m = String(fd.get('review') || '').match(/^(\d{4})-(\d{2})-(\d{2})$/); t.review = m ? m[3] + '-' + m[2] + '-' + m[1] : ''; } try { persistV37(); } catch (e) {} refresh(); }
          return r;
        };
      } catch (e) {}
    }
    var res = fPrev.apply(this, arguments);
    if (isW) {
      try {
        var box = $('tp38Fields'), chk = box.querySelector('[name="tpRevAuto"]'), rev = box.querySelector('[name="review"]');
        var cf2 = chk && chk.closest('.tp38-field'), rf = rev && rev.closest('.tp38-field');
        if (cf2 && rf) rf.parentNode.insertBefore(cf2, rf);
        var upd = function () { if (rev) { rev.readOnly = chk.checked; rf.style.opacity = chk.checked ? '.5' : '1'; } };
        if (chk) { chk.addEventListener('change', upd); upd(); }
      } catch (e) {}
    }
    return res;
  };
  try { tp38OpenForm = window.tp38OpenForm; } catch (e) {}

  /* ficha del arma: explicar de dónde sale la fecha */
  function decorateDetail() {
    var w = null; try { w = activeWeapon; } catch (e) {}
    var body = $('weaponDetailBody'); if (!w || !body || body.querySelector('.r25Note')) return;
    var row = Array.prototype.filter.call(body.querySelectorAll('.dataRow'), function (r) { var b = r.querySelector('b'); return b && /Próxima revista/.test(b.textContent); })[0];
    var txt;
    if (isAuto(w) && autoDate(w)) txt = 'Calculada: con la renovación de la licencia ' + esc(w.licenseType) + ' (caduca el ' + esc(nice(autoDate(w))) + '). La revista se pasa cada 5 años, al renovar la licencia.';
    else if (isAuto(w)) txt = 'Para calcularla, registra en Cartera la licencia ' + esc(w.licenseType || '') + ' con su fecha de caducidad.';
    else txt = 'Fecha puesta a mano.';
    var n = document.createElement('div'); n.className = 'tiny r25Note'; n.style.cssText = 'margin:4px 2px 8px;color:#b5ba9c;line-height:1.4';
    n.innerHTML = txt;
    if (row) row.parentNode.insertBefore(n, row.nextSibling);
    else { var doc = body.querySelector('.alert'); if (doc && /Revista/.test(doc.textContent)) doc.parentNode.insertBefore(n, doc.nextSibling); }
  }
  function refresh() { try { var id = (document.querySelector('.screen.active') || {}).id; if (id === 'weaponDetail') renderWeaponDetail37(); if (id === 'armas') renderWeapons(); if (id === 'inicio') renderHomeV37(); } catch (e) {} }

  var rd = window.renderWeaponDetail37; if (typeof rd === 'function') { window.renderWeaponDetail37 = function () { try { sync(); } catch (e) {} var r = rd.apply(this, arguments); try { decorateDetail(); } catch (e) {} return r; }; try { renderWeaponDetail37 = window.renderWeaponDetail37; } catch (e) {} }
  var rw = window.renderWeapons; if (typeof rw === 'function') { window.renderWeapons = function () { try { sync(); } catch (e) {} return rw.apply(this, arguments); }; try { renderWeapons = window.renderWeapons; } catch (e) {} }
  var rh = window.renderHomeV37; if (typeof rh === 'function') { window.renderHomeV37 = function () { try { sync(); } catch (e) {} return rh.apply(this, arguments); }; try { renderHomeV37 = window.renderHomeV37; } catch (e) {} }
  var rwl = window.renderWallet; if (typeof rwl === 'function') { window.renderWallet = function () { try { sync(); } catch (e) {} return rwl.apply(this, arguments); }; try { renderWallet = window.renderWallet; } catch (e) {} }
  try { sync(); } catch (e) {}
})();
