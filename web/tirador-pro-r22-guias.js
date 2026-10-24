/* Tirador Pro · R22 · Cartera › Guías: la foto se ve al tocarla
   La tarjeta ya no lleva al arma al tocar en cualquier sitio: la foto es grande y abre el visor,
   y hay botones claros "Ver foto / Subir foto" y "Ver arma". */
(function () {
  'use strict';
  if (window.__TP_R22__) return; window.__TP_R22__ = true;
  function $(id) { return document.getElementById(id); }
  var css = '.r22Card .r19Guide{display:block!important;margin:10px 0 4px}' +
    '.r22Card .r19Guide .r19Slot{width:100%!important;aspect-ratio:16/10!important;font-size:15px!important}' +
    '.r22Card .r19Guide .muted{display:none}' +
    '.r22Btns{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}' +
    '.r22Btns button{min-height:46px;border-radius:13px;border:1px solid #ffffff2a;background:#262a1d;color:#fff;font-weight:850;font-size:14px}' +
    '.r22Card .docActionRow .settingsTail{display:none}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function hasPhoto(wid) {
    try { if ((JSON.parse(localStorage.getItem('tpfield37_docPhotos') || '{}') || {})['guide_' + wid]) return true; } catch (e) {}
    try { return JSON.parse(localStorage.getItem('tpfield36_scannedDocs') || '[]').some(function (d) { return d.id === 'doc-guide-' + wid && d.image; }); } catch (e) { return false; }
  }
  function decorate() {
    var tab = ''; try { tab = walletTab; } catch (e) {}
    var body = $('walletBody'); if (tab !== 'Guías' || !body) return;
    Array.prototype.forEach.call(body.querySelectorAll('.docMini[onclick*="openWeapon"]'), function (card) {
      var m = (card.getAttribute('onclick') || '').match(/openWeapon\('([^']+)'/); if (!m) return;
      var wid = m[1];
      card.removeAttribute('onclick'); card.classList.add('r22Card'); card.dataset.wid = wid;
      var p = hasPhoto(wid);
      var btns = document.createElement('div'); btns.className = 'r22Btns';
      btns.innerHTML = '<button type="button" data-a="foto">' + (p ? '🖼 Ver foto' : '📷 Subir foto') + '</button><button type="button" data-a="arma">⌖ Ver arma ›</button>';
      card.appendChild(btns);
      btns.onclick = function (ev) {
        var b = ev.target.closest('[data-a]'); if (!b) return; ev.stopPropagation();
        if (b.getAttribute('data-a') === 'arma') return openWeapon(wid, 'Documentación');
        if (!window.tpDocPhoto) return;
        if (hasPhoto(wid)) window.tpDocPhoto.view('guide_' + wid, 'Guía de pertenencia');
        else window.tpDocPhoto.upload('guide_' + wid, 'Foto de la guía');
      };
    });
  }
  /* ---------- Otros documentos (DNI, seguro…): foto de anverso y reverso ---------- */
  function photoKeys() { try { return JSON.parse(localStorage.getItem('tpfield37_docPhotos') || '{}') || {}; } catch (e) { return {}; } }
  function slotHTML(id, label) { return '<div class="r19Slot r22Slot" data-pid="' + id + '" data-t="' + label + '">📷 ' + label + '<small>' + label + '</small></div>'; }
  function decorateOthers() {
    var tab = ''; try { tab = walletTab; } catch (e) {}
    var body = $('walletBody'); if (tab === 'Guías' || tab === 'Federación' || tab === 'Licencia de armas' || !body) return;
    var keys = photoKeys();
    Array.prototype.forEach.call(body.querySelectorAll('.docMini'), function (card) {
      if (card.querySelector('.r22Photos')) return;
      var ed = card.querySelector('[onclick*="tp38OpenAdditionalDoc"]'); if (!ed) return;
      var m = (ed.getAttribute('onclick') || '').match(/tp38OpenAdditionalDoc\('([^']+)'/); if (!m) return;
      var did = m[1];
      var box = document.createElement('div'); box.className = 'r19Slots r22Photos'; box.style.margin = '10px 0 4px';
      box.innerHTML = slotHTML('doc_' + did + '_front', 'Anverso') + slotHTML('doc_' + did + '_back', 'Reverso');
      var row = card.querySelector('.docActionRow'); card.insertBefore(box, row || null);
      Array.prototype.forEach.call(box.querySelectorAll('[data-pid]'), function (el) {
        var pid = el.getAttribute('data-pid'), t = el.getAttribute('data-t');
        if (keys[pid] && window.tpDocPhoto) window.tpDocPhoto.get(pid).then(function (src) { if (src && el.isConnected) { el.classList.add('has'); el.style.backgroundImage = 'url("' + src + '")'; } });
        el.onclick = function (ev) {
          ev.stopPropagation(); if (!window.tpDocPhoto) return;
          var title = (card.querySelector('h3') ? card.querySelector('h3').textContent + ' · ' : '') + t;
          if (photoKeys()[pid]) window.tpDocPhoto.view(pid, title); else window.tpDocPhoto.upload(pid, title);
        };
      });
    });
    var add = Array.prototype.filter.call(body.querySelectorAll('button'), function (b) { return /Añadir documento/i.test(b.textContent); })[0];
    if (add && !body.querySelector('.r22Hint')) { var h = document.createElement('div'); h.className = 'tiny r22Hint'; h.style.cssText = 'margin:8px 2px 0;color:#b5ba9c'; h.textContent = 'Después de añadirlo, toca Anverso o Reverso para subir sus fotos (DNI, seguro, permisos…).'; add.parentNode.insertBefore(h, add.nextSibling); }
  }

  // Tipo de documento: añadir DNI y Pasaporte
  var fPrev = window.tp38OpenForm;
  window.tp38OpenForm = function (opts) {
    try {
      (opts && opts.fields || []).forEach(function (f) {
        if (f.name === 'type' && Array.isArray(f.options) && f.options.indexOf('Certificado médico') !== -1 && f.options.indexOf('DNI') === -1) f.options = ['DNI', 'Pasaporte'].concat(f.options);
      });
    } catch (e) {}
    return fPrev.apply(this, arguments);
  };
  try { tp38OpenForm = window.tp38OpenForm; } catch (e) {}

  var rwPrev = window.renderWallet;
  if (typeof rwPrev === 'function') { window.renderWallet = function () { var r = rwPrev.apply(this, arguments); try { decorate(); } catch (e) { console.warn('[R22]', e); } try { decorateOthers(); } catch (e) { console.warn('[R22 otros]', e); } return r; }; try { renderWallet = window.renderWallet; } catch (e) {} }
  var goPrev = window.go;
  if (typeof goPrev === 'function') { window.go = function (id) { var r = goPrev.apply(this, arguments); if (id === 'cartera') try { decorate(); decorateOthers(); } catch (e) {} return r; }; try { go = window.go; } catch (e) {} }
})();
