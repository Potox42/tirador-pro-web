/* Tirador Pro · R8 · pulido para que parezca la app real
   - Sin "NaN", "undefined" ni separadores colgando cuando falta un dato.
   - Armas: fuera la cabecera fija con cifras de ejemplo (2 activas, 2.760 disparos).
   - Inicio: sin la barra blanca cuando aún no hay sesiones.
   - Perfil: textos de estado legibles y sin "v4".
   - Voy al campo: sin el bloque de documentación (desactivado en esta versión).
   - Avisos: sin el aviso de actividad deportiva (depende de la documentación).
   - Ficha de arma: sin el campo "Guía" (no se guardan números de guía).
   Se carga después de tirador-pro-r7-entreno.js. */
(function () {
  'use strict';
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  var css = document.createElement('style');
  css.id = 'tpR8';
  var OP = window.__TP_OPERATIVA__ === true;
  css.textContent =
    '#armas > .hero{display:none!important}' +
    '.profileStatus .left b{display:block}.profileStatus .left span{display:block;margin-top:2px}' +
    '.tp38-field.tpHidden,label.tpHidden{display:none!important}';
  document.head.appendChild(css);

  /* 1. Limpieza de textos vacíos (NaN, undefined, "·" al final) */
  function cleanText(t) {
    var v = t.nodeValue, o = v;
    if (/undefined\/undefined/.test(v)) v = v.replace(/\/?undefined\/undefined(\s*·\s*NaN\s*d)?/g, 'Sin fecha');
    if (/\bNaN\b/.test(v)) v = v.replace(/\bNaN\b\s*d\b/g, '—').replace(/\bNaN\b/g, '—');
    if (/\bundefined\b/.test(v)) v = v.replace(/\bundefined\b/g, '—');
    if (/\s·\s*$/.test(v)) v = v.replace(/\s·\s*$/, '');
    if (v !== o) t.nodeValue = v;
  }
  function cleanTree(root) {
    if (!root) return;
    if (root.nodeType === 3) return cleanText(root);
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n;
    while ((n = w.nextNode())) cleanText(n);
  }

  /* 2. Inicio sin barra blanca */
  function fixHome() {
    var st = $('.cockpitScore strong');
    var box = st && st.parentNode;
    if (box) box.style.display = st.textContent.trim() === '—' ? 'none' : '';
  }

  /* 3. Perfil */
  function fixProfile() {
    $$('#perfil .kicker').forEach(function (k) { if (/^PERFIL · v4$/.test(k.textContent.trim())) k.textContent = 'PERFIL'; });
    var ps = $('#perfil .profileStatus');
    if (ps && /Modo de desarrollo/.test(ps.textContent)) {
      var b = ps.querySelector('.left b'), s = ps.querySelector('.left span');
      if (b) b.textContent = 'Datos en este iPhone';
      if (s) s.textContent = 'Se guardan solo en este dispositivo. Haz copia al terminar cada jornada.';
      var tag = ps.querySelector(':scope > span'); if (tag) tag.textContent = 'LOCAL';
    }
  }

  /* 4. Voy al campo sin documentación */
  var fpPrev = window.renderFieldPrep;
  if (!OP && typeof fpPrev === 'function') {
    window.renderFieldPrep = function () {
      var r = fpPrev.apply(this, arguments);
      try {
        var body = document.getElementById('fieldPrepBody'); if (!body) return r;
        var heads = $$('.sectionHead', body);
        heads.forEach(function (h) {
          var b = h.querySelector('b'); if (!b) return;
          if (/Documentación/.test(b.textContent)) {
            var next = h.nextElementSibling; if (next && next.classList.contains('dataList')) next.remove();
            h.remove();
          }
        });
        $$('.sectionHead b', body).forEach(function (b) { b.textContent = b.textContent.replace(/^3 · /, '2 · ').replace(/^4 · /, '3 · '); });
        $$('.prepSummary > div', body).forEach(function (d) { if (/DOCUMENTOS/.test(d.textContent)) d.remove(); });
        var meter = $$('.prepMeter span', body); if (meter[1]) meter[1].remove();
        // listo = armas elegidas + munición de todos sus calibres + material marcado (si hay)
        var s = window.v371FieldState ? window.v371FieldState() : null;
        if (s) {
          var blocks = [s.selected.length > 0, s.ammoCals.length > 0 && s.ammoDone === s.ammoCals.length, s.checksTotal === 0 || s.checksDone === s.checksTotal];
          var missing = blocks.filter(function (x) { return !x; }).length;
          var big = $('.bigState', body);
          if (big) { big.classList.toggle('pending', missing > 0); big.textContent = missing ? 'FALTAN ' + missing + ' BLOQUE' + (missing === 1 ? '' : 'S') + ' POR COMPLETAR' : 'LISTO PARA SALIR ✓'; }
          var pill = $('.readiness', body);
          if (pill) { pill.classList.toggle('warn', missing > 0); pill.innerHTML = '<i></i>' + (missing ? 'PREPARANDO' : 'LISTO'); }
          var m = $$('.prepMeter span', body); if (m[2] && s.checksTotal === 0) m[2].className = 'done';
        }
      } catch (e) { console.warn('[R8 fieldPrep]', e); }
      return r;
    };
  }

  /* 5. Avisos sin actividad deportiva F */
  var caPrev = window.computeAlerts;
  if (!OP && typeof caPrev === 'function') {
    window.computeAlerts = function () {
      var a = caPrev.apply(this, arguments);
      return Array.isArray(a) ? a.filter(function (x) { return !(x && /actividad deportiva/i.test((x.title || '') + ' ' + (x.kind || ''))); }) : a;
    };
  }

  /* 6. Formulario de arma sin "Guía" */
  function fixForms(root) {
    if (OP) return;
    $$('#tp38Modal input[name="guide"]', root || document).forEach(function (i) {
      var f = i.closest('.tp38-field') || i.closest('label') || i.parentNode;
      if (f) f.classList.add('tpHidden');
    });
  }

  /* Ejecutar tras cada cambio de pantalla y cuando la app repinta */
  var pending = false;
  function sweep() {
    pending = false;
    try { cleanTree(document.querySelector('main') || document.body); fixHome(); fixProfile(); fixForms(); } catch (e) {}
  }
  function schedule() { if (!pending) { pending = true; requestAnimationFrame(sweep); } }
  new MutationObserver(function (list) {
    for (var i = 0; i < list.length; i++) if (list[i].addedNodes.length || list[i].type === 'characterData') { schedule(); break; }
  }).observe(document.body, { childList: true, subtree: true, characterData: true });
  var goPrev = window.go;
  window.go = function (id) {
    var r = goPrev.apply(this, arguments);
    if (id === 'alertsCenter' && window.renderAlertsCenter) try { window.renderAlertsCenter(); } catch (e) {}
    if (id === 'fieldPrep' && window.renderFieldPrep) try { window.renderFieldPrep(); } catch (e) {}
    schedule(); return r;
  };
  try { window.renderHome && window.renderHome(); } catch (e) {}
  schedule();
})();
